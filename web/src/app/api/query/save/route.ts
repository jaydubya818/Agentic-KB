import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { appendAuditLog } from '@/lib/audit'
import { ulid, invalidateIdIndex } from '@/lib/ids'

export const dynamic = 'force-dynamic'

interface SaveBody {
  question?: string
  answer?: string
  sources?: string[]
  tags?: string[]
  verified?: boolean
  autoCompile?: boolean
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
    .replace(/-+$/g, '') || 'qa'
}

function yaml(v: unknown): string {
  if (Array.isArray(v)) return '[' + v.map(x => JSON.stringify(String(x))).join(', ') + ']'
  return JSON.stringify(String(v))
}

/**
 * Compounding Loop: save a Q&A pair back into the KB raw/ bucket
 * so the next compile pass folds it into the wiki. Every question
 * makes the next answer better.
 */
export async function POST(request: NextRequest): Promise<Response> {
  let body: SaveBody
  try {
    body = await request.json() as SaveBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const question = (body.question || '').trim()
  const answer = (body.answer || '').trim()
  if (!question || !answer) {
    return NextResponse.json({ error: 'question and answer required' }, { status: 400 })
  }

  const sources = Array.isArray(body.sources) ? body.sources.filter(s => typeof s === 'string') : []
  const tags = Array.isArray(body.tags) && body.tags.length > 0 ? body.tags : ['qa', 'user-question']
  const verified = body.verified === true

  const vaultRoot = request.cookies.get('active_vault_path')?.value || DEFAULT_KB_ROOT
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)
  const slug = slugify(question)
  const qaDir = path.join(vaultRoot, 'raw', 'qa')

  try {
    fs.mkdirSync(qaDir, { recursive: true })
  } catch (err) {
    return NextResponse.json({ error: `mkdir failed: ${(err as Error).message}` }, { status: 500 })
  }

  let target = path.join(qaDir, `${dateStr}-${slug}.md`)
  let i = 2
  while (fs.existsSync(target)) {
    target = path.join(qaDir, `${dateStr}-${slug}-${i}.md`)
    i++
  }

  const fm = [
    '---',
    `id: ${ulid()}`,
    `type: qa`,
    `status: active`,
    `title: ${yaml('Q: ' + question.slice(0, 80))}`,
    `source: qa`,
    `date: ${now.toISOString()}`,
    `created: ${dateStr}`,
    `updated: ${dateStr}`,
    `question: ${yaml(question)}`,
    `sources: ${yaml(sources)}`,
    `related: ${yaml(sources.map(s => '[[' + s.replace(/\.md$/, '').replace(/^wiki\//, '') + ']]'))}`,
    `tags: ${yaml(tags)}`,
    `verified: ${verified}`,
    '---',
    '',
  ].join('\n')

  const sourcesMd = sources.length > 0
    ? '\n\n## Sources Read\n\n' + sources.map(s => `- [[${s.replace(/\.md$/, '')}]]`).join('\n') + '\n'
    : '\n'

  const doc =
    fm +
    `# ${question}\n\n` +
    `## Question\n\n${question}\n\n` +
    `## Answer\n\n${answer}\n` +
    sourcesMd

  try {
    fs.writeFileSync(target, doc, 'utf8')
    invalidateIdIndex()
  } catch (err) {
    return NextResponse.json({ error: `write failed: ${(err as Error).message}` }, { status: 500 })
  }

  const rel = path.relative(vaultRoot, target)
  appendAuditLog({
    op: 'query-save',
    vault: path.basename(vaultRoot),
    file: rel,
    q: question.slice(0, 200),
    sourcesCount: sources.length,
    verified,
  })

  // Auto-compile: fire-and-forget POST to /api/compile?mode=incremental.
  // We don't await — saves should feel instant and compile is streamed.
  let compileTriggered = false
  if (body.autoCompile) {
    try {
      const origin = new URL(request.url).origin
      void fetch(`${origin}/api/compile?mode=incremental`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: request.headers.get('cookie') || '',
        },
        body: JSON.stringify({}),
      }).catch(() => { /* fire and forget */ })
      compileTriggered = true
    } catch { /* ignore */ }
  }

  return NextResponse.json({
    ok: true,
    path: rel,
    compileTriggered,
    message: compileTriggered
      ? 'Saved. Compile triggered in background.'
      : 'Saved. Run Compile to fold this into the wiki.',
  })
}
