import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { readRuntimeTraces } from '../../../../../../../lib/agent-runtime/audit.mjs'

export const dynamic = 'force-dynamic'

/**
 * GET /api/agents/[id]/trace?limit=50&type=context-load
 *
 * Returns recent runtime traces for an agent from logs/agent-runtime.log.
 * Supports filtering by trace type (context-load, close-task).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit') || '50'), 500)
  const type = searchParams.get('type') || undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { agent_id: id }
  if (type) filter.type = type

  const traces = readRuntimeTraces(DEFAULT_KB_ROOT, limit, filter)
  return NextResponse.json({ agent_id: id, count: traces.length, traces })
}
