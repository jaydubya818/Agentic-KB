import { NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { verifyAuditChain } from '../../../../../../lib/agent-runtime/audit.mjs'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  const result = verifyAuditChain(DEFAULT_KB_ROOT)
  return NextResponse.json(result, { status: result.ok ? 200 : 422 })
}
