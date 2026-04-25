import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { readRecentAudit } from '../../../../../../../lib/agent-runtime/audit.mjs'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const op = searchParams.get('op') || undefined
  const entries = readRecentAudit(DEFAULT_KB_ROOT, limit, op ? { agent_id: id, op } : { agent_id: id })
  return NextResponse.json({ agent_id: id, entries })
}
