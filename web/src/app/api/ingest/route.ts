import { NextRequest, NextResponse } from 'next/server'
import { writeRawMaterial } from '@/lib/articles'
import { appendAuditLog } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const VALID_TYPES = [
  'transcript',
  'article',
  'paper',
  'note',
  'video-notes',
  'framework-doc',
  'conversation',
  'code-example',
]

interface IngestRequest {
  title: string
  type: string
  content: string
  sourceUrl?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: Partial<IngestRequest>
  try {
    body = await request.json() as Partial<IngestRequest>
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'PARSE_ERROR' },
      { status: 400 }
    )
  }

  const { title, type, content, sourceUrl } = body

  // Validation
  if (!title?.trim()) {
    return NextResponse.json(
      { error: 'Title is required', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      {
        error: `Type must be one of: ${VALID_TYPES.join(', ')}`,
        code: 'VALIDATION_ERROR',
        details: { validTypes: VALID_TYPES },
      },
      { status: 400 }
    )
  }

  if (!content?.trim()) {
    return NextResponse.json(
      { error: 'Content is required', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  if (content.length > 500_000) {
    return NextResponse.json(
      { error: 'Content too large (max 500KB)', code: 'CONTENT_TOO_LARGE' },
      { status: 413 }
    )
  }

  try {
    const savedPath = writeRawMaterial({
      title: title.trim(),
      type,
      content: content.trim(),
      sourceUrl: sourceUrl?.trim(),
    })

    appendAuditLog({ op: 'ingest', file: savedPath, title: title.trim(), type })
    return NextResponse.json({
      success: true,
      path: savedPath,
      message: `Saved to ${savedPath}. Run the INGEST workflow to process this into the wiki.`,
      nextSteps: [
        `Open a new Claude Code session in the KB directory`,
        `Run: "Ingest ${savedPath}"`,
        `Claude will create a wiki/summaries/ page and update index.md`,
      ],
    })
  } catch (error) {
    console.error('Ingest error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to save material: ${message}`, code: 'WRITE_ERROR' },
      { status: 500 }
    )
  }
}
