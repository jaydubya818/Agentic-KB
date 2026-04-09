import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { getRepo, syncRepo, markSynced } from '../../../../../../../../lib/repo-runtime/index.mjs'

export const dynamic = 'force-dynamic'

// GET: Return sync status
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ repo: string }> }
): Promise<NextResponse> {
  const { repo } = await params
  const record = getRepo(DEFAULT_KB_ROOT, repo)

  if (!record) {
    return NextResponse.json({ error: 'Repo not found' }, { status: 404 })
  }

  return NextResponse.json({
    repo,
    status: record.status || 'new',
    last_sync_at: record.last_sync_at || null,
    last_synced_commit: record.last_synced_commit || null,
    markdown_file_count: record.markdown_file_count || 0,
  })
}

// POST: Trigger sync for a repo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
): Promise<NextResponse> {
  const { repo } = await params
  const record = getRepo(DEFAULT_KB_ROOT, repo)

  if (!record) {
    return NextResponse.json({ error: 'Repo not found' }, { status: 404 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { token } = body

    const opts: Record<string, unknown> = {}
    if (token) opts.githubToken = token

    // Trigger sync - syncRepo takes the record object
    const trace = await syncRepo(DEFAULT_KB_ROOT, record, opts)

    // Mark as synced with trace metadata
    markSynced(DEFAULT_KB_ROOT, repo, {
      commit_sha: trace.commit_sha || '',
      file_count: trace.created.length + trace.updated.length,
    })

    return NextResponse.json({
      synced: true,
      repo,
      trace,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    )
  }
}
