import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { getRepo, writeRepoTaskLog, appendRepoProgress } from '../../../../../../../../lib/repo-runtime/index.mjs'

export const dynamic = 'force-dynamic'

// POST: Writeback for a repo task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
): Promise<NextResponse> {
  const { repo } = await params
  const body = await request.json().catch(() => ({}))

  const record = getRepo(DEFAULT_KB_ROOT, repo)
  if (!record) {
    return NextResponse.json({ error: 'Repo not found' }, { status: 404 })
  }

  try {
    const { agent_id, task_id, entry, progressEntry } = body

    if (!agent_id || !task_id || !entry) {
      return NextResponse.json(
        { error: 'Missing required fields: agent_id, task_id, entry' },
        { status: 400 }
      )
    }

    // Write task log entry: writeRepoTaskLog(kbRoot, repoName, taskId, agentId, content)
    writeRepoTaskLog(DEFAULT_KB_ROOT, repo, task_id, agent_id, entry)

    // Optionally append progress entry: appendRepoProgress(kbRoot, repoName, entry, agentId)
    if (progressEntry) {
      appendRepoProgress(DEFAULT_KB_ROOT, repo, progressEntry, agent_id)
    }

    return NextResponse.json({ written: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    )
  }
}
