import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import {
  listBusItems,
  publishBusItem,
  resolveIdentity,
} from '../../../../../../../lib/agent-runtime/index.mjs'

export const dynamic = 'force-dynamic'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BusListOptions = { status?: string; limit?: number }

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channel: string }> }
): Promise<NextResponse> {
  const { channel } = await params
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || undefined
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
  const opts: BusListOptions = {}
  if (status) opts.status = status
  if (limit) opts.limit = limit
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = listBusItems(DEFAULT_KB_ROOT, channel, opts as any)
  return NextResponse.json({ channel, items })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channel: string }> }
): Promise<NextResponse> {
  const { channel } = await params
  const body = await request.json().catch(() => ({}))

  // Resolve caller identity from request headers; use it as the `from` if not provided.
  const identity = resolveIdentity(request.headers)
  const from = body.from || identity.id
  const from_tier = body.from_tier || (identity.kind === 'agent' ? (body.tier || null) : null)

  try {
    const result = publishBusItem(DEFAULT_KB_ROOT, { ...body, channel, from, from_tier })
    return NextResponse.json({ ...result, caller: { id: identity.id, kind: identity.kind } })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    )
  }
}
