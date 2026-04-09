import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { promoteLearning } from '../../../../../../lib/agent-runtime/index.mjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => ({}))
  try {
    const result = promoteLearning(DEFAULT_KB_ROOT, body)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    )
  }
}
