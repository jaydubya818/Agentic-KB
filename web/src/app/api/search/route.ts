import { NextRequest, NextResponse } from 'next/server'
import { searchArticles, searchInVault, DEFAULT_KB_ROOT } from '@/lib/articles'

export const dynamic = 'force-dynamic'

const PRIVATE_PIN = process.env.PRIVATE_PIN || ''

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? parseInt(limitParam, 10) : 20
  const scopeParam = searchParams.get('scope') || 'public'
  const scope = (scopeParam === 'private' || scopeParam === 'all') ? scopeParam : 'public'

  if (!query.trim()) {
    return NextResponse.json({ results: [], query: '' })
  }

  // Validate PIN for private/all scopes
  if (scope !== 'public' && PRIVATE_PIN) {
    const pin = searchParams.get('pin') || request.headers.get('x-private-pin') || ''
    if (pin !== PRIVATE_PIN) {
      return NextResponse.json(
        { error: 'Invalid PIN', code: 'AUTH_ERROR' },
        { status: 401 }
      )
    }
  }

  try {
    const vaultRoot = request.cookies.get('active_vault_path')?.value || DEFAULT_KB_ROOT
    const isDefault = vaultRoot === DEFAULT_KB_ROOT
    const results = isDefault
      ? searchArticles(query, limit, scope as 'public' | 'private' | 'all')
      : searchInVault(query, vaultRoot, limit, scope as 'public' | 'private' | 'all')
    return NextResponse.json({ results, query, scope })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', code: 'SEARCH_ERROR' },
      { status: 500 }
    )
  }
}
