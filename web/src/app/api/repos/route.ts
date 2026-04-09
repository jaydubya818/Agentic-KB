import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { listRepos, upsertRepo } from '../../../../../lib/repo-runtime/index.mjs'

export const dynamic = 'force-dynamic'

interface RepoRecord {
  repo_name: string
  github_url: string
  description?: string
  status?: string
}

// GET: List all repos
export async function GET(): Promise<NextResponse> {
  const repos = listRepos(DEFAULT_KB_ROOT)
  return NextResponse.json({ repos })
}

// POST: Add or update a repo
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}))
    const { name, github_url, description, status } = body

    if (!name || !github_url) {
      return NextResponse.json(
        { error: 'Missing required fields: name, github_url' },
        { status: 400 }
      )
    }

    const record: RepoRecord = {
      repo_name: name,
      github_url,
      description: description || undefined,
      status: status || 'new',
    }

    const updated = upsertRepo(DEFAULT_KB_ROOT, record)
    return NextResponse.json({ repo: updated })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    )
  }
}
