import { NextResponse } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { getRepo } from '../../../../../../../lib/repo-runtime/index.mjs'

export const dynamic = 'force-dynamic'

// GET: Retrieve a single repo by name
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ repo: string }> }
): Promise<NextResponse> {
  const { repo } = await params
  const record = getRepo(DEFAULT_KB_ROOT, repo)

  if (!record) {
    return NextResponse.json({ error: 'Repo not found' }, { status: 404 })
  }

  return NextResponse.json({ repo: record })
}
