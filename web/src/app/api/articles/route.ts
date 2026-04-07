import { NextResponse } from 'next/server'
import { getArticlesBySection, readIndex } from '@/lib/articles'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  try {
    const sections = getArticlesBySection()
    const index = readIndex()

    return NextResponse.json({
      sections,
      indexContent: index,
    })
  } catch (error) {
    console.error('Error listing articles:', error)
    return NextResponse.json(
      { error: 'Failed to list articles', code: 'LIST_ERROR' },
      { status: 500 }
    )
  }
}
