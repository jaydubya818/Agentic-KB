import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { listBusItems, publishBusItem } from '../../../../../../../lib/agent-runtime/index.mjs'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channel: string }> }
): Promise<NextResponse> {
  const { channel } = await params
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || undefined
  const items = listBusItems(DEFAULT_KB_ROOT, channel, (status ? { status } : {}) as any)
  return NextResponse.json({ channel, items })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channel: string }> }
): Promise<NextResponse> {
  const { channel } = await params
  const body = await request.json().catch(() => ({}))
  const result = publishBusItem(DEFAULT_KB_ROOT, { ...body, channel })
  return NextResponse.json(result)
}
