import { NextRequest, NextResponse } from 'next/server'
import { findArticleBySlug, getBacklinks, KB_ROOT } from '@/lib/articles'
import { safeJoin } from '@/lib/safe-path'
import fs from 'fs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const filePath = searchParams.get('path')
  const slug = searchParams.get('slug')

  try {
    let article = null

    if (filePath) {
      // Direct path access: e.g. "wiki/concepts/foo.md"
      // safeJoin rejects absolute paths, null bytes, and ".." escapes.
      let fullPath: string
      try {
        fullPath = safeJoin(KB_ROOT, filePath)
      } catch (e) {
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
