import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { getRepo, loadRepoContext } from '../../../../../../../lib/repo-runtime/index.mjs'

export const dynamic = 'force-dynamic'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ContextFile extends Record<string, any> {
  path: string
  reason: string
  bytes: number
  priority: number
}

// GET: Load repo context
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
): Promise<NextResponse> {
  const { repo } = await params
  const { searchParams } = new URL(request.url)
  const agent_id = searchParams.get('agent_id') || 'system'
  const tierParam = searchParams.get('tier') || 'worker'

  const record = getRepo(DEFAULT_KB_ROOT, repo)
  if (!record) {
    return NextResponse.json({ error: 'Repo not found' }, { status: 404 })
  }

  try {
    // Construct a contract-like object for loadRepoContext
    // loadRepoContext(kbRoot, repoName, contract, vars = {})
    const contract = {
      agent_id,
      tier: tierParam,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bundle = loadRepoContext(DEFAULT_KB_ROOT, repo, contract as any)

    return NextResponse.json({
      repo,
      agent_id,
      tier: tierParam,
      trace: bundle.trace || [],
      files: (bundle.files as ContextFile[]).map((f) => ({
        path: f.path,
        reason: f.reason,
        bytes: f.bytes,
        priority: f.priority,
      })),
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    )
  }
}
