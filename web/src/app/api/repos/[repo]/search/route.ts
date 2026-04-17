import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { getRepo, repoWikiRoot } from '../../../../../../../lib/repo-runtime/index.mjs'
import { parseFrontmatter } from '../../../../../../../lib/agent-runtime/index.mjs'

export const dynamic = 'force-dynamic'

interface SearchResult {
  path: string
  title: string
  snippet: string
  score: number
}

function walkDir(dir: string, prefix = ''): string[] {
  const files: string[] = []
  if (!fs.existsSync(dir)) return files

  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name

      if (entry.isDirectory()) {
        files.push(...walkDir(full, rel))
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        files.push(rel)
      }
    }
  } catch {
    // Ignore read errors
  }

  return files
}

function scoreMatch(content: string, query: string, title: string): number {
  const lowerQuery = query.toLowerCase()
  const lowerContent = content.toLowerCase()
  const lowerTitle = (title || '').toLowerCase()

  let score = 0

  // Title match: highest score
  if (lowerTitle.includes(lowerQuery)) score += 5

  // Multiple word matches
  const matches = (lowerContent.match(new RegExp(lowerQuery, 'g')) || []).length
  score += matches * 0.5

  return score
}

function extractSnippet(content: string, query: string, maxLen = 150): string {
  const lowerQuery = query.toLowerCase()
  const lowerContent = content.toLowerCase()
  const idx = lowerContent.indexOf(lowerQuery)

  if (idx === -1) return content.substring(0, maxLen)

  const start = Math.max(0, idx - 50)
  const end = Math.min(content.length, idx + query.length + 100)
  return `...${content.substring(start, end).trim()}...`
}

// GET: Search within repo wiki namespace
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
): Promise<NextResponse> {
  const { repo } = await params
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const limitStr = searchParams.get('limit') || '20'
  const section = searchParams.get('section') || undefined

  if (!query.trim()) {
    return NextResponse.json({ repo, results: [] })
  }

  const record = getRepo(DEFAULT_KB_ROOT, repo)
  if (!record) {
    return NextResponse.json({ error: 'Repo not found' }, { status: 404 })
  }

  const limit = Math.min(parseInt(limitStr, 10) || 20, 100)
  // repoWikiRoot(repo) returns a path relative to kbRoot.
  const wikiRoot = repoWikiRoot(repo)
  const searchBase = path.join(DEFAULT_KB_ROOT, wikiRoot)

  let scanDirs: string[] = []

  if (!section || section === 'canonical') {
    scanDirs.push(path.join(searchBase, 'canonical'))
  }
  if (!section || section === 'repo-docs') {
    scanDirs.push(path.join(searchBase, 'repo-docs'))
  }
  if (!section || section === 'bus') {
    scanDirs.push(path.join(searchBase, 'bus'))
  }

  const results: SearchResult[] = []
  const processed = new Set<string>()

  for (const scanDir of scanDirs) {
    if (!fs.existsSync(scanDir)) continue

    const files = walkDir(scanDir)

    for (const relFile of files) {
      const fullPath = path.join(scanDir, relFile)
      if (processed.has(fullPath)) continue
      processed.add(fullPath)

      try {
        const content = fs.readFileSync(fullPath, 'utf8')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = parseFrontmatter(content) as any
        const title = (data?.title as string) || path.basename(relFile)

        const score = scoreMatch(content, query, title)
        if (score > 0) {
          const snippet = extractSnippet(content, query)
          results.push({
            path: relFile,
            title,
            snippet,
            score,
          })
        }
      } catch {
        // Skip files that can't be read
      }
    }
  }

  // Sort by score descending, then by path
  results.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))

  return NextResponse.json({
    repo,
    results: results.slice(0, limit),
  })
}
