import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

const KB_ROOT = '/Users/jaywest/Agentic-KB'
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function send(controller: ReadableStreamDefaultController, data: object): void {
  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`))
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
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
  const logPath = path.join(KB_ROOT, 'wiki', 'log.md')
  const existing = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : ''
  fs.writeFileSync(logPath, existing + '\n' + entry)
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
    fs.writeFileSync(indexPath, content)
  } else {
    // Append to end
    fs.appendFileSync(indexPath, '\n' + entry + '\n')
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  const { filePath } = await req.json() as { filePath: string }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Read the raw file
        const fullPath = path.join(KB_ROOT, filePath)
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
          model: 'claude-sonnet-4-6',
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

        // Write summary page
        const summaryPath = path.join(KB_ROOT, result.summaryPage.path)
        fs.mkdirSync(path.dirname(summaryPath), { recursive: true })
        fs.writeFileSync(summaryPath, result.summaryPage.content)
        send(controller, { type: 'wrote', path: result.summaryPage.path })

        // Write new pages
        const newPagePaths: string[] = []
        for (const page of (result.newPages || [])) {
          const pagePath = path.join(KB_ROOT, page.path)
          fs.mkdirSync(path.dirname(pagePath), { recursive: true })
          if (!fs.existsSync(pagePath)) {
            fs.writeFileSync(pagePath, page.content)
            send(controller, { type: 'wrote', path: page.path })
            newPagePaths.push(page.path)
          } else {
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
