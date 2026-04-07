import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const KB_ROOT = '/Users/jaywest/Agentic-KB'

interface PendingFile {
  path: string        // relative to KB_ROOT e.g. "raw/transcript/foo.md"
  type: string        // transcript, note, paper, etc.
  title: string
  size: number
  addedAt: string
  alreadyIngested: boolean
}

function getIngestedPaths(): Set<string> {
  const logPath = path.join(KB_ROOT, 'wiki', 'log.md')
  const ingested = new Set<string>()
  try {
    const log = fs.readFileSync(logPath, 'utf8')
    // Look for INGEST entries that mention raw/ paths
    const lines = log.split('\n')
    for (const line of lines) {
      if (!line.includes('INGEST')) continue
      // Match "raw/type/slug.md" patterns in log
      const matches = line.match(/raw\/[^\s|,]+\.md/g)
      if (matches) matches.forEach(m => ingested.add(m))
      // Also check for slug-only references
      const slugMatch = line.match(/INGEST \| ([^|]+) \|/)
      if (slugMatch) ingested.add(slugMatch[1].trim())
    }
  } catch { /* no log yet */ }
  return ingested
}

function titleFromPath(filePath: string): string {
  const base = path.basename(filePath, '.md')
  return base
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export async function GET(): Promise<NextResponse> {
  const rawRoot = path.join(KB_ROOT, 'raw')
  const ingestedPaths = getIngestedPaths()
  const pending: PendingFile[] = []

  // Walk raw/ directory recursively
  function walk(dir: string): void {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        // Skip system dirs
        if (['my-agents', 'my-skills', 'my-hooks'].includes(entry.name)) continue
        walk(fullPath)
      } else if (entry.name.endsWith('.md') && entry.name !== 'Untitled.md') {
        const relPath = path.relative(KB_ROOT, fullPath).replace(/\\/g, '/')
        const type = relPath.split('/')[1] || 'unknown'
        const stat = fs.statSync(fullPath)
        const alreadyIngested = ingestedPaths.has(relPath) ||
          Array.from(ingestedPaths).some(p => relPath.includes(p) || p.includes(path.basename(relPath, '.md')))

        pending.push({
          path: relPath,
          type,
          title: titleFromPath(entry.name),
          size: stat.size,
          addedAt: stat.birthtime.toISOString().slice(0, 10),
          alreadyIngested,
        })
      }
    }
  }

  walk(rawRoot)
  pending.sort((a, b) => (a.alreadyIngested ? 1 : 0) - (b.alreadyIngested ? 1 : 0))

  return NextResponse.json({ files: pending, total: pending.length })
}
