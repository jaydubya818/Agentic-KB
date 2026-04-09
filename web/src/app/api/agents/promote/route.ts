import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import {
  promoteLearning,
  mergeRewrite,
  resolveIdentity,
} from '../../../../../../lib/agent-runtime/index.mjs'

export const dynamic = 'force-dynamic'

/**
 * POST /api/agents/promote
 *
 * Two actions depending on `action` field:
 *   { action: 'promote', channel, id, targetPath? }         → promoteLearning
 *   { action: 'merge',   rewritePath, canonicalPath }       → mergeRewrite
 *
 * Caller identity resolved from request headers (X-Identity-Kind + X-Identity-Id).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => ({}))
  const identity = resolveIdentity(request.headers)
  const approver = body.approver || identity.id

  try {
    if (body.action === 'merge') {
      const { rewritePath, canonicalPath } = body
      if (!rewritePath || !canonicalPath) {
        return NextResponse.json({ error: 'merge requires rewritePath and canonicalPath' }, { status: 400 })
      }
      const result = mergeRewrite(DEFAULT_KB_ROOT, { rewritePath, canonicalPath, approver })
      return NextResponse.json({ ...result, caller: { id: identity.id, kind: identity.kind } })
    }

    // Default: promote (bus item → learned page)
    const result = promoteLearning(DEFAULT_KB_ROOT, { ...body, approver })
    return NextResponse.json({ ...result, caller: { id: identity.id, kind: identity.kind } })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    )
  }
}
