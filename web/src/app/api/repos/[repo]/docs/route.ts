import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { getRepo, repoDocsRoot } from '../../../../../../../../lib/repo-runtime/index.mjs'

export const dynamic = 'force-dynamic'

interface DocFile {
  path: string
  title: string
  size: number
}

function walkDocs(dir: string, section = '', prefix = ''): DocFile[] {
  const docs: DocFile[] = []
  if (!fs.existsSync(dir)) return docs

  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name

      if (entry.isDirectory()) {
        // If section filter is set, only descend if it matches
        if (section && !rel.startsWith(section)) continue
        docs.push(...walkDocs(full, section, rel))
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        // If section filter is set, only include if it matches
        if (section && !rel.startsWith(section)) continue
        const stat = fs.statSync(full)
        const title = entry.name.replace(/\.(md|mdx)$/, '')
        docs.push({
          path: rel,
          title,
          size: stat.size,
        })
      }
    }
  } catch {
    // Ignore read errors
  }

  return docs
}

// GET: List imported docs in repo-docs/
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
): Promise<NextResponse> {
  const { repo } = await params
  const { searchParams } = new URL(request.url)
  const section = searchParams.get('section') || undefined

  const record = getRepo(DEFAULT_KB_ROOT, repo)
  if (!record) {
    return NextResponse.json({ error: 'Repo not found' }, { status: 404 })
  }

  const docsRoot = repoDocsRoot(DEFAULT_KB_ROOT, repo)
  const fullPath = path.join(DEFAULT_KB_ROOT, docsRoot)

  const docs = walkDocs(fullPath, section)

  // Sort by path
  docs.sort((a, b) => a.path.localeCompare(b.path))

  return NextResponse.json({ repo, docs })
}
