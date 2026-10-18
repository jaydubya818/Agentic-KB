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
import { resolveContentRoot } from '@/lib/articles'
import { resolveVaultRoot } from '@/lib/vault'
import { KB_MODEL } from '@/lib/model'
import { appendAuditLog } from '@/lib/audit'
import {
  buildInboundLinkMap,
  isOrphanCandidate,
  isStalePage,
  evaluateFreshness,
  freshnessBreakdown,
  selectAnalysisPages,
  reconcileFindings,
  rankOrphans,
  rankStalePages,
  DEFAULT_ANALYSIS_BUDGET,
  DEFAULT_STALE_AFTER_DAYS,
} from '../../../../../lib/wiki-lint.mjs'
import { pinMatches } from '@/lib/pin'

/** Cursor + prior counts + open findings, persisted between runs. */
interface LintState {
  cursor: number
  lastRunAt: string | null
  counts: { pages: number; contradictions: number; orphans: number; stale: number; gaps: number } | null
  openFindings: Array<Record<string, unknown>>
}

const EMPTY_STATE: LintState = { cursor: 0, lastRunAt: null, counts: null, openFindings: [] }

// Machine-local: logs/ is the established home for per-machine generated state
// (see .gitignore). Keeping the cursor out of the tree means the daily commit
// stages only lint-report.md and git status stays clean between runs. Losing
// this file costs one run of deltas and resets the cursor — nothing worse.
function lintStatePath(vaultRoot: string): string {
  return path.join(vaultRoot, 'logs', 'lint-state.json')
}

function readLintState(vaultRoot: string): LintState {
  try {
    const raw = fs.readFileSync(lintStatePath(vaultRoot), 'utf8')
    return { ...EMPTY_STATE, ...JSON.parse(raw) as Partial<LintState> }
  } catch { return { ...EMPTY_STATE } }
}

function writeLintState(vaultRoot: string, state: LintState): void {
  try {
    const target = lintStatePath(vaultRoot)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    const tmp = target + '.tmp-' + process.pid
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8')
    fs.renameSync(tmp, target)
  } catch { /* state is an optimisation, never fail the run over it */ }
}

/** "+12" / "-3" / "±0" against the previous run, or '' when there is no prior. */
function delta(current: number, prior: number | undefined): string {
  if (typeof prior !== 'number') return '—'
  const diff = current - prior
  if (diff === 0) return '±0'
  return diff > 0 ? `+${diff}` : `${diff}`
}

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const PRIVATE_PIN = process.env.PRIVATE_PIN || ''

interface PageSummary {
  relPath: string
  title: string
  tags: string[]
  updated?: string
  /** Separate from `updated`: when the content was last checked, not edited. */
  lastVerified?: string
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
          // gray-matter parses bare YAML dates into Date objects; keep them as ISO strings.
          updated: data.updated instanceof Date ? data.updated.toISOString() : (data.updated as string | undefined),
          lastVerified: data.last_verified instanceof Date ? data.last_verified.toISOString() : (data.last_verified as string | undefined),
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
  // Header first so a header-only PIN survives a body-less POST (request.json
  // throws with no body, which would otherwise drop the header read).
  let pin = request.headers.get('x-private-pin') || ''
  try {
    const body = await request.json() as { pin?: string }
    pin = body.pin || pin
  } catch { /* defaults */ }

  if (PRIVATE_PIN && !pinMatches(pin, PRIVATE_PIN)) {
    return NextResponse.json({ error: '🔒 Lint requires a valid PIN.' }, { status: 401 })
  }

  const vaultRoot = resolveVaultRoot(request.cookies.get('active_vault_path')?.value)
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

  // Pick this run's analysis window: pages changed since the last run, plus a
  // rotating slice of the rest. See selectAnalysisPages in lib/wiki-lint.mjs
  // for why the previous fixed slice(0, 40) made the AI checks a no-op.
  const state = readLintState(vaultRoot)
  const analysisBudget = Number(process.env.LINT_ANALYSIS_BUDGET) || DEFAULT_ANALYSIS_BUDGET
  const window = selectAnalysisPages(pages, {
    budget: analysisBudget,
    cursor: state.cursor,
    lastRunAt: state.lastRunAt,
  })
  const windowPages: PageSummary[] = window.selected
  const examinedPaths = new Set(windowPages.map(p => p.relPath))
  // Runs it takes the rotating window to cover the whole vault once. Reported
  // below, and used as the age-out threshold for page-less findings.
  const rotationRuns = window.total > 0
    ? Math.ceil(window.total / Math.max(1, windowPages.length))
    : 0

  // Build a concise wiki overview for Claude to detect contradictions + gaps
  const overview = windowPages.map(p =>
    `- **${p.title}** (${p.relPath}) | tags: ${p.tags.join(', ') || 'none'} | ${p.wordCount} words`
  ).join('\n')

  // Sample content from the window for contradiction detection
  const sampleContent = windowPages.slice(0, 24).map(p => {
    try {
      const raw = fs.readFileSync(path.join(wikiRoot, p.relPath), 'utf8')
      return `### ${p.title} (${p.relPath})\n${raw.slice(0, 800)}\n`
    } catch { return '' }
  }).filter(Boolean).join('\n---\n')

  // Ask Claude for contradiction + gap analysis. Streamed: a non-streaming
  // create() sits silent while the whole answer generates, and long
  // generations trip the HTTP socket timeout (the 2026-08-01 nightly lint
  // failed with ERR_SOCKET_TIMEOUT). Same pattern as /api/process and
  // /api/query.
  const aiStream = client.messages.stream({
    model: KB_MODEL,
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

  let aiText = ''
  let degradedReason: string | null = null
  try {
    for await (const chunk of aiStream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        aiText += chunk.delta.text
      }
    }
  } catch (err) {
    // Degrade, don't 502. Orphan and stale detection are pure local
    // computation with no API cost, and they had already succeeded by this
    // point — returning an error here threw away two of the four checks
    // because of a failure in the other two. (2026-08-20: the whole nightly
    // run was lost to an Anthropic credit-balance error this way.)
    degradedReason = (err as Error).message
  }

  let contradictions: Array<{ pages: string[]; description: string }> = []
  let gaps: Array<{ topic: string; description: string }> = []
  let suggestions: string[] = []

  try {
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

  // Carry unresolved findings across window rotations. A contradiction found
  // on day 3 must not vanish on day 4 just because the cursor moved past it —
  // only a run that re-examined every page it references may clear it.
  let openContradictions = contradictions
  let openGaps = gaps
  if (!degradedReason) {
    const reconciledContradictions = reconcileFindings(
      (state.openFindings || []).filter(f => Array.isArray((f as { pages?: unknown }).pages)),
      contradictions,
      examinedPaths,
    )
    // A gap references no page, so no run can ever "re-examine" it. Age it out
    // over one full rotation of the analysis window instead: if the whole vault
    // has been walked once since it was raised and nobody re-reported it, it is
    // closed. Without this the ledger only ever grew.
    const reconciledGaps = reconcileFindings(
      (state.openFindings || []).filter(f => !Array.isArray((f as { pages?: unknown }).pages)),
      gaps,
      examinedPaths,
      new Date(),
      { gapTtlRuns: rotationRuns },
    )
    openContradictions = reconciledContradictions.open as typeof contradictions
    openGaps = reconciledGaps.open as typeof gaps
  } else {
    // Nothing was analysed this run — preserve the ledger verbatim.
    openContradictions = (state.openFindings || [])
      .filter(f => Array.isArray((f as { pages?: unknown }).pages)) as typeof contradictions
    openGaps = (state.openFindings || [])
      .filter(f => !Array.isArray((f as { pages?: unknown }).pages)) as typeof gaps
  }

  // Build lint report markdown
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const prior = state.counts
  const coverage = window.total > 0 ? Math.round((windowPages.length / window.total) * 100) : 0
  const cycleRuns = rotationRuns

  const reportLines = [
    `# Wiki Lint Report`,
    ``,
    `> Generated: ${now} | Vault: ${path.basename(vaultRoot)} | Pages scanned: ${pages.length}`,
    ``,
  ]

  if (degradedReason) {
    reportLines.push(
      `> ⚠️ **DEGRADED RUN** — contradiction and knowledge-gap analysis did not run.`,
      `> Orphan and stale counts below are current and complete; contradiction and`,
      `> gap sections are carried over from the last successful run.`,
      `>`,
      `> Reason: \`${degradedReason.slice(0, 300)}\``,
      ``,
    )
  }

  reportLines.push(
    `## Summary`,
    ``,
    `| Check | Count | Δ vs last run | Severity |`,
    `|---|---|---|---|`,
    `| Contradictions | ${openContradictions.length} | ${delta(openContradictions.length, prior?.contradictions)} | ${openContradictions.length > 0 ? '🔴 High' : '🟢 Clear'} |`,
    `| Orphaned pages | ${orphans.length} | ${delta(orphans.length, prior?.orphans)} | ${orphans.length > 5 ? '🟡 Medium' : '🟢 Clear'} |`,
    `| Stale pages | ${stalePages.length} | ${delta(stalePages.length, prior?.stale)} | ${stalePages.length > 10 ? '🟡 Medium' : '🟢 Clear'} |`,
    `| Knowledge gaps | ${openGaps.length} | ${delta(openGaps.length, prior?.gaps)} | ${openGaps.length > 0 ? '🟡 Medium' : '🟢 Clear'} |`,
    ``,
    degradedReason
      ? `**Analysis window:** none (degraded run).`
      : `**Analysis window:** ${windowPages.length} of ${window.total} pages (${coverage}%) — ` +
        `${window.hotCount} changed since last run, ${window.coldCount} from the rotating cursor. ` +
        `Full-vault coverage every ~${cycleRuns} runs.`,
    ``,
  )

  // Freshness is judged per category (lib/freshness-policy.mjs). "Verified" is
  // counted separately from "updated": a page is current because its content
  // was checked, never because a timestamp was bumped.
  const freshness = freshnessBreakdown(pages)
  reportLines.push(
    `## Freshness by category`,
    ``,
    `| Category | Pages | Fresh | Stale | Event-driven | Verified (last_verified) |`,
    `|---|---|---|---|---|---|`,
    ...Object.entries(freshness).sort().map(([cat, r]) =>
      `| ${cat} | ${r.total} | ${r.fresh} | ${r.stale} | ${r.eventDriven} | ${r.verified} |`),
    ``,
  )

  // Lead with the short actionable list. The exhaustive sections below are
  // reference material; this is the part meant to be read and acted on.
  const topOrphans = rankOrphans(orphans, 10)
  const topStale = rankStalePages(stalePages, inboundMap, 10)

  if (topOrphans.length > 0 || topStale.length > 0) {
    reportLines.push(`## 🎯 Triage — start here`, ``)

    if (topOrphans.length > 0) {
      reportLines.push(
        `**Substantial pages nothing links to** (≥100 words, largest first) — link these from a hub page or archive them:`,
        ``,
      )
      for (const p of topOrphans) {
        reportLines.push(`1. \`${p.relPath}\` — ${p.title} (${p.wordCount} words)`)
      }
      reportLines.push(``)
    }

    if (topStale.length > 0) {
      reportLines.push(
        `**Stale pages others depend on** (most inbound links first) — these propagate outdated information:`,
        ``,
      )
      for (const s of topStale) {
        reportLines.push(
          `1. \`${s.page.relPath}\` — ${s.inbound} inbound link${s.inbound === 1 ? '' : 's'}, ${s.age} days old`,
        )
      }
      reportLines.push(``)
    }
  }

  if (openContradictions.length > 0) {
    reportLines.push(`## 🔴 Contradictions`, ``)
    for (const c of openContradictions) {
      const seen = (c as { firstSeen?: string }).firstSeen
      reportLines.push(
        `### ${c.pages.join(' vs ')}`,
        ``,
        c.description,
        ``,
        `**Pages:** ${c.pages.map(p => `\`${p}\``).join(', ')}${seen ? ` | **Open since:** ${seen}` : ''}`,
        ``,
      )
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
    // Header states the real rule: per-page review_cadence_days /
    // stale_after_days front matter, falling back to the default. It used to
    // hard-code "30+ days" regardless of what the logic actually applied.
    reportLines.push(
      `## 🟡 Stale Pages (past their category review cadence; see Freshness by category)`,
      ``,
    )
    for (const p of stalePages) {
      const f = evaluateFreshness(p)
      reportLines.push(
        `- \`${p.relPath}\` — ${f.basis === 'verified' ? 'last verified' : 'last updated'}: ${p.lastVerified && f.basis === 'verified' ? p.lastVerified : p.updated} ` +
        `(${f.category}, cadence: ${f.days}d, ${f.ageDays}d old)`,
      )
    }
    reportLines.push(``)
  }

  if (openGaps.length > 0) {
    reportLines.push(`## 💡 Knowledge Gaps`, ``)
    for (const g of openGaps) {
      const seen = (g as { firstSeen?: string }).firstSeen
      reportLines.push(`### ${g.topic}`, ``, g.description, seen ? `\n_Open since ${seen}._` : ``, ``)
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
  const reportTmp = reportPath + '.tmp-' + process.pid
  fs.writeFileSync(reportTmp, reportLines.join('\n'), 'utf8')
  fs.renameSync(reportTmp, reportPath)

  // Persist cursor + counts + ledger for the next run. On a degraded run the
  // cursor does NOT advance — the window was never analysed, so moving past it
  // would punch a permanent hole in coverage.
  writeLintState(vaultRoot, {
    cursor: degradedReason ? state.cursor : window.nextCursor,
    lastRunAt: new Date().toISOString(),
    counts: {
      pages: pages.length,
      contradictions: openContradictions.length,
      orphans: orphans.length,
      stale: stalePages.length,
      gaps: openGaps.length,
    },
    openFindings: [...openContradictions, ...openGaps] as Array<Record<string, unknown>>,
  })

  appendAuditLog({
    op: 'lint',
    vault: path.basename(vaultRoot),
    pagesScanned: pages.length,
    contradictions: openContradictions.length,
    orphans: orphans.length,
    gaps: openGaps.length,
    degraded: Boolean(degradedReason),
  })

  const orphanDelta = typeof prior?.orphans === 'number' ? orphans.length - prior.orphans : 0

  return NextResponse.json({
    ok: true,
    degraded: Boolean(degradedReason),
    degradedReason,
    pagesScanned: pages.length,
    contradictions: openContradictions.length,
    orphans: orphans.length,
    stalePages: stalePages.length,
    freshness,
    verifiedPages: pages.filter(p => p.lastVerified).length,
    gaps: openGaps.length,
    orphanDelta,
    analysisWindow: {
      examined: windowPages.length,
      total: window.total,
      hot: window.hotCount,
      cold: window.coldCount,
      cursor: degradedReason ? state.cursor : window.nextCursor,
    },
    reportPath: 'wiki/lint-report.md',
    summary: degradedReason
      ? `Lint DEGRADED (${degradedReason.slice(0, 120)}): ${orphans.length} orphans, ${stalePages.length} stale; contradiction/gap analysis skipped.`
      : `Lint complete: ${openContradictions.length} contradictions, ${orphans.length} orphans, ${openGaps.length} gaps found.`,
  })
}
