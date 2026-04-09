import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import {
  getRepo,
  listRepoBusItems,
  publishRepoBusItem,
} from '../../../../../../../../lib/repo-runtime/index.mjs'
import { resolveIdentity } from '../../../../../../../../lib/agent-runtime/index.mjs'

export const dynamic = 'force-dynamic'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BusListOptions = { status?: string; limit?: number }

// GET: List bus items for a repo channel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repo: string; channel: string }> }
): Promise<NextResponse> {
  const { repo, channel } = await params
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || undefined
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined

  const record = getRepo(DEFAULT_KB_ROOT, repo)
  if (!record) {
    return NextResponse.json({ error: 'Repo not found' }, { status: 404 })
  }

  const opts: BusListOptions = {}
  if (status) opts.status = status
  if (limit) opts.limit = limit

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = listRepoBusItems(DEFAULT_KB_ROOT, repo, channel, opts as any)
  return NextResponse.json({ repo, channel, items })
}

// POST: Publish a bus item to a repo channel
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ repo: string; channel: string }> }
): Promise<NextResponse> {
  const { repo, channel } = await params
  const body = await request.json().catch(() => ({}))

  const record = getRepo(DEFAULT_KB_ROOT, repo)
  if (!record) {
    return NextResponse.json({ error: 'Repo not found' }, { status: 404 })
  }

  try {
    // Resolve caller identity from request headers; use it as the `from` if not provided.
    const identity = resolveIdentity(request.headers)
    const from = body.from || identity.id
    const from_tier = body.from_tier || (identity.kind === 'agent' ? (body.tier || null) : null)

    const result = publishRepoBusItem(DEFAULT_KB_ROOT, repo, {
      ...body,
      channel,
      from,
      from_tier,
    })
    return NextResponse.json({ ...result, caller: { id: identity.id, kind: identity.kind } })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    )
  }
}
