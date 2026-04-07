import { NextRequest, NextResponse } from 'next/server'
import {
  searchArticles,
  searchInVault,
  parseArticle,
  DEFAULT_KB_ROOT,
  type SearchResult,
} from '@/lib/articles'
import { searchGraph, graphAvailable } from '@/lib/graph-search'

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
    return NextResponse.json({ results: [], query: '', graphUsed: false })
  }

  // PIN check for private/all scopes
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

    // ── Step 1: Keyword search (existing behaviour, unchanged) ───────────────
    const keywordResults: SearchResult[] = isDefault
      ? searchArticles(query, limit, scope as 'public' | 'private' | 'all')
      : searchInVault(query, vaultRoot, limit, scope as 'public' | 'private' | 'all')

    // Track slugs already found by keyword search
    const keywordSlugs = new Set(keywordResults.map(r => r.meta.slug))

    // ── Step 2: Graph search (only on default vault where graph.json lives) ──
    const useGraph = isDefault && graphAvailable()
    const graphOnlyResults: SearchResult[] = []

    if (useGraph) {
      const graphHits = searchGraph(query, vaultRoot, limit)

      for (const hit of graphHits) {
        // Parse the article to get proper meta + content
        const article = parseArticle(hit.filePath)
        if (!article) continue

        // Skip private content if scope is public
        if (scope === 'public' && article.meta.visibility !== 'public') continue
        if (scope === 'private' && article.meta.visibility !== 'private') continue

        // Skip if already surfaced by keyword search
        if (keywordSlugs.has(article.meta.slug)) continue

        // Use matchReason as the snippet so users see WHY this was found
        const snippet = `[graph] ${hit.matchReason}${hit.relation ? ` — ${hit.relation}` : ''}`

        graphOnlyResults.push({
          meta: article.meta,
          snippet,
          score: hit.score * 3, // normalise to keyword score range (keyword scores ~1-5)
        })
      }
    }

    // ── Step 3: Merge — keyword results first, graph fills in the gaps ───────
    const merged = [
      ...keywordResults,
      ...graphOnlyResults,
    ].slice(0, limit)

    return NextResponse.json({
      results: merged,
      query,
      scope,
      graphUsed: useGraph,
      graphHits: graphOnlyResults.length,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', code: 'SEARCH_ERROR' },
      { status: 500 }
    )
  }
}
