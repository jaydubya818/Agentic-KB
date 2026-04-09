import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { loadContract, loadAgentContext } from '../../../../../../../lib/agent-runtime/index.mjs'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const project = searchParams.get('project') || null

  const contract = loadContract(DEFAULT_KB_ROOT, id)
  if (!contract) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }
  const bundle = loadAgentContext(DEFAULT_KB_ROOT, contract, {
    project,
    domain: contract.domain,
    agent: id,
  })
  return NextResponse.json({
    agent_id: id,
    tier: contract.tier,
    trace: bundle.trace,
    files: bundle.files.map((f: { path: string; class: string; reason: string; bytes: number; priority: number }) => ({
      path: f.path,
      class: f.class,
      reason: f.reason,
      bytes: f.bytes,
      priority: f.priority,
    })),
  })
}
