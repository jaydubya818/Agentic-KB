import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { loadContract, closeTask } from '../../../../../../../lib/agent-runtime/index.mjs'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const contract = loadContract(DEFAULT_KB_ROOT, id)
  if (!contract) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }
  const payload = await request.json().catch(() => ({}))
  const result = closeTask(DEFAULT_KB_ROOT, contract, payload)
  return NextResponse.json(result, { status: result.ok ? 200 : 422 })
}
