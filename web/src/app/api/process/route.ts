import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { KB_MODEL } from '@/lib/model'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { safeJoin } from '@/lib/safe-path'
import { pinMatches } from '@/lib/pin'

const KB_ROOT = DEFAULT_KB_ROOT
const PRIVATE_PIN = process.env.PRIVATE_PIN || ''
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function send(controller: ReadableStreamDefaultController, data: object): void {
  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`))
}

function readSchema(): string {
  try {
    return fs.readFileSync(path.join(KB_ROOT, 'CLAUDE.md'), 'utf8').slice(0, 3000)
  } catch { return '' }
}

function readIndex(): string {
  try {
    return fs.readFileSync(path.join(KB_ROOT, 'wiki', 'index.md'), 'utf8')
  } catch { return '' }
}

function appendToLog(entry: string): void {
  // appendFileSync, not read-modify-write: two concurrent process runs were
  // interleaving full-file rewrites and silently dropping one side's entry,
  // and a crash mid-write truncated the whole log.
  const logPath = path.join(KB_ROOT, 'wiki', 'log.md')
  fs.appendFileSync(logPath, '\n' + entry)
}

function appendToIndex(entry: string, section: string): void {
  const indexPath = path.join(KB_ROOT, 'wiki', 'index.md')
  if (!fs.existsSync(indexPath)) return
  let content = fs.readFileSync(indexPath, 'utf8')

  // Find the Summaries section and append there
  const sectionPattern = new RegExp(`(## ${section}[\\s\\S]*?)(\\n## |$)`)
  const match = content.match(sectionPattern)
  if (match) {
    const insertAt = content.indexOf(match[0]) + match[0].lastIndexOf('\n')
    content = content.slice(0, insertAt) + '\n' + entry + content.slice(insertAt)
    // tmp+rename: wiki/index.md is the master index; torn write truncated it.
    const tmp = indexPath + '.tmp-' + process.pid
    fs.writeFileSync(tmp, content)
    fs.renameSync(tmp, indexPath)
  } else {
    // Append to end
    fs.appendFileSync(indexPath, '\n' + entry + '\n')
  }
}

// Claude's response includes the wiki paths to write. The raw file being
// processed is untrusted content, so a prompt-injected source could steer the
// model into emitting paths like ../../.ssh/... — only wiki/*.md is writable.
function resolveWikiPagePath(rel: string, requiredPrefix = 'wiki/'): string {
  const normalized = String(rel).replace(/\\/g, '/')
  if (!normalized.startsWith(requiredPrefix) || !/\.(md|mdx)$/.test(normalized)) {
    throw new Error(`Refusing to write outside ${requiredPrefix}: ${normalized}`)
  }
  return safeJoin(KB_ROOT, normalized)
}

export async function POST(req: NextRequest): Promise<Response> {
  // PIN gate — /api/process drives the same Claude API spend and wiki writes
  // as /api/compile and /api/lint, both of which already require the PIN when
  // one is configured; this route was the unauthenticated gap. Header first:
  // a body-less POST throws in req.json() and must not drop the header read.
  let pin = req.headers.get('x-private-pin') || ''
  let filePath = ''
  try {
    const body = await req.json() as { filePath?: string; pin?: string }
    pin = body.pin || pin
    filePath = body.filePath || ''
  } catch { /* defaults */ }

  if (PRIVATE_PIN && !pinMatches(pin, PRIVATE_PIN)) {
    return new Response(JSON.stringify({ error: '🔒 Process requires a valid PIN.', code: 'UNAUTHORIZED' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Only raw/**/*.md may be processed — filePath previously went straight
  // into path.join(KB_ROOT, ...), so ../../ read (and then summarized back
  // out) any file on disk.
  let fullPath: string
  try {
    if (typeof filePath !== 'string' || !/^raw\/.+\.md$/.test(filePath.replace(/\\/g, '/'))) {
      throw new Error('filePath must be a raw/**/*.md path')
    }
    fullPath = safeJoin(KB_ROOT, filePath)
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message, code: 'BAD_REQUEST' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Read the raw file
        if (!fs.existsSync(fullPath)) {
          send(controller, { type: 'error', message: `File not found: ${filePath}` })
          controller.close()
          return
        }

        const rawContent = fs.readFileSync(fullPath, 'utf8')
        const schema = readSchema()
        const index = readIndex()
        const fileType = filePath.split('/')[1]
        const fileName = path.basename(filePath, '.md')

        send(controller, { type: 'status', message: `Reading ${filePath}...` })

        // Build the INGEST prompt
        const prompt = `You are a wiki engineer performing the INGEST workflow on a raw source file.

## KB Schema (excerpt)
${schema}

## Current wiki/index.md (first 2000 chars)
${index.slice(0, 2000)}

## Raw Source File
Path: ${filePath}
Type: ${fileType}

Content:
${rawContent.slice(0, 8000)}

## Your Task
Perform the INGEST workflow. Return ONLY valid JSON (no markdown fences, no explanation) with this exact structure:

{
  "summaryPage": {
    "path": "wiki/summaries/${fileName}.md",
    "content": "--- (full frontmatter + markdown content for the summary page, following the Summary Page schema) ---"
  },
  "newPages": [
    {
      "path": "wiki/concepts/example.md",
      "content": "--- full page content ---"
    }
  ],
  "indexEntry": "- [[summaries/${fileName}|Title]] — one-line description",
  "logEntry": "[${new Date().toISOString().slice(0, 16).replace('T', ' ')}] INGEST | ${filePath} | Brief description of what was created/updated",
  "summary": "2-3 sentence human-readable summary of what you found and created"
}

Rules:
- summaryPage is REQUIRED
- newPages only if genuinely new concepts not already covered by index
- Keep newPages to 0-2 max — don't create duplicates of existing pages
- All content must follow the frontmatter schemas from CLAUDE.md
- indexEntry goes in the Summaries section
- Be concise but complete`

        send(controller, { type: 'status', message: 'Calling Claude to analyze and generate wiki pages...' })

        // Call Claude
        let jsonResponse = ''
        const stream = await client.messages.stream({
          model: KB_MODEL,
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        })

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            jsonResponse += chunk.delta.text
          }
        }

        send(controller, { type: 'status', message: 'Parsing Claude\'s response...' })

        // Parse JSON
        let result: {
          summaryPage: { path: string; content: string }
          newPages?: Array<{ path: string; content: string }>
          indexEntry?: string
          logEntry?: string
          summary?: string
        }

        try {
          // Strip any accidental markdown fences
          const cleaned = jsonResponse.trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '')
          result = JSON.parse(cleaned)
        } catch {
          send(controller, { type: 'error', message: 'Failed to parse Claude response as JSON', raw: jsonResponse.slice(0, 500) })
          controller.close()
          return
        }

        // Write summary page. The summary is the one page this workflow may
        // overwrite (re-ingest refreshes it) — so it must stay confined to
        // wiki/summaries/, or a prompt-injected source could replace any
        // existing wiki page (index.md, home.md, a concept) with its own
        // content by picking that path for "summaryPage".
        const summaryPath = resolveWikiPagePath(result.summaryPage.path, 'wiki/summaries/')
        fs.mkdirSync(path.dirname(summaryPath), { recursive: true })
        // tmp+rename: re-ingest overwrites this page in place, and a torn
        // write left a truncated summary as the only copy.
        const summaryTmp = summaryPath + '.tmp-' + process.pid
        fs.writeFileSync(summaryTmp, result.summaryPage.content)
        fs.renameSync(summaryTmp, summaryPath)
        send(controller, { type: 'wrote', path: result.summaryPage.path })

        // Write new pages
        const newPagePaths: string[] = []
        for (const page of (result.newPages || [])) {
          const pagePath = resolveWikiPagePath(page.path)
          fs.mkdirSync(path.dirname(pagePath), { recursive: true })
          // Exclusive create ('wx') instead of existsSync-then-write: two
          // concurrent process runs could both pass the existence probe and
          // the loser's page silently replaced the winner's (same TOCTOU
          // class as the webhook/Sofie ingest fixes).
          try {
            fs.writeFileSync(pagePath, page.content, { flag: 'wx' })
            send(controller, { type: 'wrote', path: page.path })
            newPagePaths.push(page.path)
          } catch (err) {
            if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err
            send(controller, { type: 'skipped', path: page.path, reason: 'already exists' })
          }
        }

        // Update index.md
        if (result.indexEntry) {
          appendToIndex(result.indexEntry, 'Summaries')
          send(controller, { type: 'status', message: 'Updated wiki/index.md' })
        }

        // Append to log
        const logEntry = result.logEntry ||
          `[${new Date().toISOString().slice(0, 16).replace('T', ' ')}] INGEST | ${filePath} | Summary created: ${result.summaryPage.path}`
        appendToLog(logEntry)
        send(controller, { type: 'status', message: 'Appended to wiki/log.md' })

        // Done
        send(controller, {
          type: 'done',
          summary: result.summary || 'Ingestion complete',
          filesCreated: [result.summaryPage.path, ...newPagePaths],
          logEntry,
        })

      } catch (err) {
        send(controller, { type: 'error', message: String(err) })
      }
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
