import { NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { listContracts } from '../../../../../../lib/agent-runtime/contracts.mjs'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  const contracts = listContracts(DEFAULT_KB_ROOT)
  return NextResponse.json({ agents: contracts })
}
