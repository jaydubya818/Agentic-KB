import { NextRequest, NextResponse } from 'next/server'
import { findArticleBySlug, getBacklinks, KB_ROOT } from '@/lib/articles'
import { safeJoin } from '@/lib/safe-path'
import { pinMatches } from '@/lib/pin'
import fs from 'fs'

export const dynamic = 'force-dynamic'

const PRIVATE_PIN = process.env.PRIVATE_PIN || ''

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const filePath = searchParams.get('path')
  const slug = searchParams.get('slug')

  try {
    let article = null

    if (filePath) {
      // Direct path access: e.g. "wiki/concepts/foo.md"
      // safeJoin rejects absolute paths, null bytes, and ".." escapes.
      // Only markdown articles may be served — without this check the route
      // was an arbitrary-file reader for anything under KB_ROOT (.env,
      // namespaces.json tokens, logs/).
      if (!/\.(md|mdx)$/.test(filePath)) {
        return NextResponse.json(
          { error: 'Invalid path', code: 'BAD_REQUEST' },
          { status: 400 }
        )
      }
      let fullPath: string
      try {
        fullPath = safeJoin(KB_ROOT, filePath)
      } catch {
        return NextResponse.json(
          { error: 'Invalid path', code: 'BAD_REQUEST' },
          { status: 400 }
        )
      }
      if (!fs.existsSync(fullPath)) {
        return NextResponse.json(
          { error: 'Article not found', code: 'NOT_FOUND' },
          { status: 404 }
        )
      }
      const { parseArticle } = await import('@/lib/articles')
      article = parseArticle(fullPath)
    } else if (slug) {
      article = findArticleBySlug(slug)
    } else {
      return NextResponse.json(
        { error: 'Missing path or slug parameter', code: 'BAD_REQUEST' },
        { status: 400 }
      )
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // PIN gate for private articles — same semantics as /api/search:
    // empty PRIVATE_PIN means private access is disabled, not open.
    if (article.meta.visibility === 'private') {
      if (!PRIVATE_PIN) {
        return NextResponse.json(
          { error: 'Private access disabled (PRIVATE_PIN unset)', code: 'FORBIDDEN' },
          { status: 403 }
        )
      }
      const pin = searchParams.get('pin') || request.headers.get('x-private-pin') || ''
      if (!pinMatches(pin, PRIVATE_PIN)) {
        return NextResponse.json(
          { error: 'Invalid PIN', code: 'FORBIDDEN' },
          { status: 403 }
        )
      }
    }

    const backlinks = getBacklinks(article.meta.slug)

    return NextResponse.json({
      meta: article.meta,
      content: article.content,
      backlinks,
    })
  } catch (error) {
    console.error('Error reading article:', error)
    return NextResponse.json(
      { error: 'Failed to read article', code: 'READ_ERROR' },
      { status: 500 }
    )
  }
}
