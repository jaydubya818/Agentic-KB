import { NextRequest, NextResponse } from 'next/server'
import { searchArticles } from '@/lib/articles'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? parseInt(limitParam, 10) : 20

  if (!query.trim()) {
    return NextResponse.json({ results: [], query: '' })
  }

  try {
    const results = searchArticles(query, limit)
    return NextResponse.json({ results, query })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', code: 'SEARCH_ERROR' },
      { status: 500 }
    )
  }
}
