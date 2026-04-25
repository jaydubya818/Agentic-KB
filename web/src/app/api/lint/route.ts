/**
 * /api/lint — Wiki Health Check
 *
 * Claude scans the wiki and reports:
 * - Contradictions between pages
 * - Stale pages (not updated in 30+ days, covers fast-changing topics)
 * - Orphaned pages (no inbound links)
 * - Knowledge gaps (topics referenced but no dedicated page)
 *
 * Writes results to wiki/lint-report.md
 */
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { DEFAULT_KB_ROOT, resolveContentRoot } from '@/lib/articles'
import { appendAuditLog } from '@/lib/audit'
import { buildInboundLinkMap, isOrphanCandidate, isStalePage } from '../../../../../lib/wiki-lint.mjs'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const PRIVATE_PIN = process.env.PRIVATE_PIN || ''

interface PageSummary {
  relPath: string
  title: string
  tags: string[]
  updated?: string
  staleAfterDays?: number
  reviewCadenceDays?: number
  links: string[]   // markdown links found in content
  wordCount: number
}

function collectWikiSummaries(wikiRoot: string): PageSummary[] {
  const summaries: PageSummary[] = []

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) { walk(full); continue }
      if (!entry.name.endsWith('.md')) continue
      if (entry.name === 'lint-report.md' || entry.name === 'log.md') continue

      try {
        const raw = fs.readFileSync(full, 'utf8')
        const { data, content } = matter(raw)
        const relPath = path.relative(wikiRoot, full)

        // Extract markdown links [text](./path) and [[WikiLinks]]
        const mdLinks = [...content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)]
          .map(m => m[2]).filter(l => l.endsWith('.md') || l.startsWith('./'))
        const wikiLinks = [...content.matchAll(/\[\[([^\]]+)\]\]/g)]
          .map(m => m[1])

        summaries.push({
          relPath,
          title: (data.title as string) || entry.name.replace('.md', ''),
          tags: Array.isArray(data.tags) ? data.tags as string[] : [],
          updated: data.updated as string | undefined,
          staleAfterDays: typeof data.stale_after_days === 'number' ? data.stale_after_days as number : undefined,
          reviewCadenceDays: typeof data.review_cadence_days === 'number' ? data.review_cadence_days as number : undefined,
          links: [...mdLinks, ...wikiLinks],
          wordCount: content.split(/\s+/).length,
        })
      } catch { /* skip unreadable */ }
    }
  }

  walk(wikiRoot)
  return summaries
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let pin = ''
  try {
    const body = await request.json() as { pin?: string }
    pin = body.pin || request.headers.get('x-private-pin') || ''
  } catch { /* defaults */ }

  if (PRIVATE_PIN && pin !== PRIVATE_PIN) {
    return NextResponse.json({ error: '🔒 Lint requires a valid PIN.' }, { status: 401 })
  }

  const vaultRoot = request.cookies.get('active_vault_path')?.value || DEFAULT_KB_ROOT
  const wikiRoot = resolveContentRoot(vaultRoot)

  // Collect wiki page summaries
  const pages = collectWikiSummaries(wikiRoot)
  if (pages.length === 0) {
    return NextResponse.json({ error: 'No wiki pages found to lint.' }, { status: 404 })
  }

  // Build inbound link map for orphan detection
  const inboundMap = buildInboundLinkMap(pages)

  // Detect orphans (no inbound links, excluding operational/generated pages)
  const orphans = pages.filter(p =>
    isOrphanCandidate(p.relPath) &&
    (inboundMap.get(p.relPath)?.length ?? 0) === 0
  )

  // Detect stale pages using per-page review cadence when present
  const stalePages = pages.filter(p => isStalePage(p))

  // Build a concise wiki overview for Claude to detect contradictions + gaps
  const overview = pages.slice(0, 40).map(p =>
    `- **${p.title}** (${p.relPath}) | tags: ${p.tags.join(', ') || 'none'} | ${p.wordCount} words`
  ).join('\n')

  // Sample content from top 20 pages for contradiction detection
  const sampleContent = pages.slice(0, 20).map(p => {
    try {
      const raw = fs.readFileSync(path.join(wikiRoot, p.relPath), 'utf8')
      return `### ${p.title} (${p.relPath})\n${raw.slice(0, 800)}\n`
    } catch { return '' }
  }).filter(Boolean).join('\n---\n')

  // Ask Claude for contradiction + gap analysis
  const aiResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `You are a wiki health analyst. Review this knowledge base and identify issues.

**Wiki pages overview:**
${overview}

**Sample content from top pages:**
${sampleContent.slice(0, 8000)}

Identify and return a JSON object with:
{
  "contradictions": [
    { "pages": ["path/a.md", "path/b.md"], "description": "Page A says X but page B says Y" }
  ],
  "gaps": [
    { "topic": "topic name", "description": "This topic is referenced but has no dedicated page" }
  ],
  "suggestions": [
    "Actionable improvement suggestion"
  ]
}

Be specific. Return ONLY the JSON object.`,
    }],
  })

  let contradictions: Array<{ pages: string[]; description: string }> = []
  let gaps: Array<{ topic: string; description: string }> = []
  let suggestions: string[] = []

  try {
    const firstBlock = aiResponse.content?.[0]
    const aiText = firstBlock && firstBlock.type === 'text' ? firstBlock.text : '{}'
    const jsonMatch = aiText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        contradictions?: typeof contradictions
        gaps?: typeof gaps
        suggestions?: string[]
      }
      contradictions = parsed.contradictions || []
      gaps = parsed.gaps || []
      suggestions = parsed.suggestions || []
    }
  } catch { /* use empty arrays */ }

  // Build lint report markdown
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const reportLines = [
    `# Wiki Lint Report`,
    ``,
    `> Generated: ${now} | Vault: ${path.basename(vaultRoot)} | Pages scanned: ${pages.length}`,
    ``,
    `## Summary`,
    ``,
    `| Check | Count | Severity |`,
    `|---|---|---|`,
    `| Contradictions | ${contradictions.length} | ${contradictions.length > 0 ? '🔴 High' : '🟢 Clear'} |`,
    `| Orphaned pages | ${orphans.length} | ${orphans.length > 5 ? '🟡 Medium' : '🟢 Clear'} |`,
    `| Stale pages | ${stalePages.length} | ${stalePages.length > 10 ? '🟡 Medium' : '🟢 Clear'} |`,
    `| Knowledge gaps | ${gaps.length} | ${gaps.length > 0 ? '🟡 Medium' : '🟢 Clear'} |`,
    ``,
  ]

  if (contradictions.length > 0) {
    reportLines.push(`## 🔴 Contradictions`, ``)
    for (const c of contradictions) {
      reportLines.push(`### ${c.pages.join(' vs ')}`, ``, c.description, ``, `**Pages:** ${c.pages.map(p => `\`${p}\``).join(', ')}`, ``)
    }
  }

  if (orphans.length > 0) {
    reportLines.push(`## 🟡 Orphaned Pages (no inbound links)`, ``)
    for (const p of orphans) {
      reportLines.push(`- \`${p.relPath}\` — ${p.title}`)
    }
    reportLines.push(``)
  }

  if (stalePages.length > 0) {
    reportLines.push(`## 🟡 Stale Pages (30+ days since update)`, ``)
    for (const p of stalePages) {
      reportLines.push(`- \`${p.relPath}\` — last updated: ${p.updated}`)
    }
    reportLines.push(``)
  }

  if (gaps.length > 0) {
    reportLines.push(`## 💡 Knowledge Gaps`, ``)
    for (const g of gaps) {
      reportLines.push(`### ${g.topic}`, ``, g.description, ``)
    }
  }

  if (suggestions.length > 0) {
    reportLines.push(`## ✨ Suggestions`, ``)
    for (const s of suggestions) {
      reportLines.push(`- ${s}`)
    }
    reportLines.push(``)
  }

  // Write report to wiki
  const reportPath = path.join(wikiRoot, 'lint-report.md')
  fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf8')

  appendAuditLog({
    op: 'lint',
    vault: path.basename(vaultRoot),
    pagesScanned: pages.length,
    contradictions: contradictions.length,
    orphans: orphans.length,
    gaps: gaps.length,
  })

  return NextResponse.json({
    ok: true,
    pagesScanned: pages.length,
    contradictions: contradictions.length,
    orphans: orphans.length,
    stalePages: stalePages.length,
    gaps: gaps.length,
    reportPath: 'wiki/lint-report.md',
    summary: `Lint complete: ${contradictions.length} contradictions, ${orphans.length} orphans, ${gaps.length} gaps found.`,
  })
}
