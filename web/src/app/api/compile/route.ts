/**
 * /api/compile — LLM Auto-Compilation (Karpathy's core pattern)
 *
 * Reads raw/ docs → Claude synthesizes/updates wiki pages →
 * cross-references updated → log.md appended → compiled-log updated.
 *
 * mode=incremental  compile only raw docs not yet in .compiled-log.json
 * mode=full         recompile everything
 */
import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { DEFAULT_KB_ROOT, resolveContentRoot } from '@/lib/articles'
import { appendAuditLog } from '@/lib/audit'
import { ensureId, invalidateIdIndex } from '@/lib/ids'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const PRIVATE_PIN = process.env.PRIVATE_PIN || ''
const COMPILED_LOG = 'raw/.compiled-log.json'

interface CompiledLog {
  [file: string]: { compiledAt: string; pagesAffected: string[] }
}

function loadLog(root: string): CompiledLog {
  try { return JSON.parse(fs.readFileSync(path.join(root, COMPILED_LOG), 'utf8')) as CompiledLog }
  catch { return {} }
}
function saveLog(root: string, log: CompiledLog): void {
  const p = path.join(root, COMPILED_LOG)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(log, null, 2))
}

/** Recursively collect all .md files under a directory */
function collectMd(dir: string, base = dir): string[] {
  if (!fs.existsSync(dir)) return []
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) results.push(...collectMd(full, base))
    else if (entry.name.endsWith('.md')) results.push(path.relative(base, full))
  }
  return results
}

/** Read the schema.md if it exists (guides LLM compilation style) */
function readSchema(wikiRoot: string): string {
  const schemaPath = path.join(wikiRoot, 'schema.md')
  try { return fs.readFileSync(schemaPath, 'utf8') }
  catch { return '' }
}

/** Read existing wiki page list for cross-reference context */
function listWikiPages(wikiRoot: string): string[] {
  return collectMd(wikiRoot)
}

function encodeSSE(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

export async function POST(request: NextRequest): Promise<Response> {
  // PIN check for private vaults
  let pin = ''
  let mode: 'incremental' | 'full' = 'incremental'
  let vault: string | undefined
  try {
    const body = await request.json() as { pin?: string; mode?: string; vault?: string }
    pin = body.pin || request.headers.get('x-private-pin') || ''
    mode = body.mode === 'full' ? 'full' : 'incremental'
    vault = body.vault
  } catch { /* defaults */ }

  if (PRIVATE_PIN && pin !== PRIVATE_PIN) {
    return new Response(
      encodeSSE({ type: 'error', content: '🔒 Compile requires a valid PIN.' }),
      { status: 401, headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  const vaultRoot = request.cookies.get('active_vault_path')?.value || DEFAULT_KB_ROOT
  const wikiRoot = resolveContentRoot(vaultRoot)
  const rawRoot = path.join(vaultRoot, 'raw')
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(encoder.encode(encodeSSE(data)))

      try {
        send({ type: 'start', mode, vault: path.basename(vaultRoot) })

        // Collect raw docs
        const allRaw = collectMd(rawRoot)
        if (allRaw.length === 0) {
          send({ type: 'done', message: 'No raw documents found. Add docs to raw/ first.' })
          controller.close(); return
        }

        // Filter to uncompiled docs for incremental mode
        const compiledLog = loadLog(vaultRoot)
        const toCompile = mode === 'full'
          ? allRaw
          : allRaw.filter(f => !compiledLog[f])

        send({ type: 'progress', message: `Found ${allRaw.length} raw docs. Compiling ${toCompile.length} ${mode === 'incremental' ? '(new/uncompiled)' : '(all)'}.` })

        if (toCompile.length === 0) {
          send({ type: 'done', message: '✅ All raw docs are already compiled. Use mode=full to recompile.' })
          controller.close(); return
        }

        // Read wiki context
        const schema = readSchema(wikiRoot)
        const existingPages = listWikiPages(wikiRoot)
        const existingPagesList = existingPages.slice(0, 60).join('\n')

        let totalPagesCreated = 0
        let totalPagesUpdated = 0

        for (const relFile of toCompile) {
          const rawPath = path.join(rawRoot, relFile)
          let rawContent = ''
          try { rawContent = fs.readFileSync(rawPath, 'utf8') }
          catch { send({ type: 'skip', file: relFile, reason: 'unreadable' }); continue }

          if (rawContent.length < 50) {
            send({ type: 'skip', file: relFile, reason: 'too short' }); continue
          }

          send({ type: 'compiling', file: relFile })

          // Ask Claude to compile this doc into wiki updates
          const systemPrompt = schema
            ? `You are a wiki curator. Follow this schema when creating/updating pages:\n\n${schema}`
            : `You are a wiki curator. You maintain a structured markdown wiki. Create clean, well-organized pages with frontmatter.`

          const userPrompt = `You are compiling a raw document into a structured wiki knowledge base.

**Existing wiki pages** (for cross-referencing):
${existingPagesList || '(none yet)'}

**Raw document to compile** (${relFile}):
\`\`\`
${rawContent.slice(0, 6000)}
\`\`\`

Your task:
1. Extract the key knowledge from this document
2. Decide which wiki page(s) should be created or updated (use paths like concepts/topic-name.md, patterns/pattern-name.md, entities/person-name.md, etc.)
3. For each page, write the COMPLETE markdown content with frontmatter

Respond with a JSON array of page operations:
[
  {
    "op": "create" | "update",
    "path": "concepts/my-topic.md",
    "content": "---\\ntitle: My Topic\\ntags: [tag1]\\nupdated: ${new Date().toISOString().slice(0, 10)}\\n---\\n\\n# My Topic\\n..."
  }
]

Rules:
- Use kebab-case filenames
- Include YAML frontmatter with title, tags, updated fields
- Cross-reference related pages with markdown links
- Be concise but complete
- Create 1-3 pages per raw doc (don't over-split)
- Return ONLY the JSON array, no other text`

          let responseText = ''
          try {
            const response = await client.messages.create({
              model: 'claude-sonnet-4-6',
              max_tokens: 4096,
              system: systemPrompt,
              messages: [{ role: 'user', content: userPrompt }],
            })
            responseText = response.content[0].type === 'text' ? response.content[0].text : ''
          } catch (err) {
            send({ type: 'error', file: relFile, message: String(err) }); continue
          }

          // Parse the JSON response
          const jsonMatch = responseText.match(/\[[\s\S]*\]/)
          if (!jsonMatch) {
            send({ type: 'skip', file: relFile, reason: 'LLM returned no valid JSON' }); continue
          }

          let ops: Array<{ op: string; path: string; content: string }> = []
          try { ops = JSON.parse(jsonMatch[0]) as typeof ops }
          catch { send({ type: 'skip', file: relFile, reason: 'JSON parse failed' }); continue }

          const affectedPages: string[] = []

          for (const op of ops) {
            if (!op.path || !op.content) continue
            const pagePath = path.join(wikiRoot, op.path)
            fs.mkdirSync(path.dirname(pagePath), { recursive: true })
            const existed = fs.existsSync(pagePath)
            fs.writeFileSync(pagePath, op.content, 'utf8')
            ensureId(pagePath)
            affectedPages.push(op.path)
            if (existed) totalPagesUpdated++; else totalPagesCreated++
            send({ type: 'page', op: op.op, path: op.path })
          }

          // Update compiled log
          compiledLog[relFile] = {
            compiledAt: new Date().toISOString(),
            pagesAffected: affectedPages,
          }
          saveLog(vaultRoot, compiledLog)
          invalidateIdIndex()

          // Append to wiki/log.md
          const logEntry = `\n## ${new Date().toISOString().slice(0, 10)} — Compiled \`${relFile}\`\n\nPages affected: ${affectedPages.map(p => `\`${p}\``).join(', ')}\n`
          const wikiLogPath = path.join(wikiRoot, 'log.md')
          if (!fs.existsSync(wikiLogPath)) {
            fs.writeFileSync(wikiLogPath, '# Wiki Compilation Log\n\nChronological record of all compile operations.\n')
          }
          fs.appendFileSync(wikiLogPath, logEntry)
        }

        appendAuditLog({
          op: 'compile',
          vault: path.basename(vaultRoot),
          mode,
          docsCompiled: toCompile.length,
          pagesCreated: totalPagesCreated,
          pagesUpdated: totalPagesUpdated,
        })

        send({
          type: 'done',
          docsCompiled: toCompile.length,
          pagesCreated: totalPagesCreated,
          pagesUpdated: totalPagesUpdated,
          message: `✅ Compiled ${toCompile.length} docs → ${totalPagesCreated} pages created, ${totalPagesUpdated} updated`,
        })
      } catch (err) {
        send({ type: 'error', message: String(err) })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
