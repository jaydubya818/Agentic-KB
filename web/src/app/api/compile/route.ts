/**
 * /api/compile — LLM Auto-Compilation (Karpathy's core pattern)
 *
 * Reads raw/ docs → Claude synthesizes/updates wiki pages →
 * cross-references updated → log.md appended → compiled-log updated.
 *
 * Two-step ingest pipeline (RLM stage 3):
 *   Call 1 — Analysis: extract a structured knowledge graph from the raw doc
 *             (entities, relationships, key_claims, candidate_pages, contradictions, tags)
 *   Call 2 — Generation: use the analysis JSON to write exact wiki page ops
 *
 * This separation improves page quality and reduces JSON hallucination by letting
 * the model think structurally before committing to file content.
 *
 * After all docs are compiled, index.md section counts are auto-updated (reindex).
 *
 * mode=incremental  compile only raw docs not yet in .compiled-log.json
 * mode=full         recompile everything
 */
import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { safeJoin } from '@/lib/safe-path'
import { resolveContentRoot } from '@/lib/articles'
import { resolveVaultRoot } from '@/lib/vault'
import { KB_MODEL } from '@/lib/model'
import { appendAuditLog } from '@/lib/audit'
import { ensureId, invalidateIdIndex } from '@/lib/ids'
import { pinMatches } from '@/lib/pin'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/** Concatenate every text block in a response.
 *
 *  Reading `content[0].text` assumes the first block is the text block. That
 *  is not guaranteed: a response may lead with a non-text block (thinking,
 *  tool_use), in which case the old code silently yielded '' — the call had
 *  succeeded, nothing threw, and the caller reported "LLM returned no valid
 *  JSON". That misattributes a response-parsing bug to the model and skips
 *  every document, which is exactly how compile came to skip 13/13 docs on
 *  2026-08-16 while the identical request issued by hand returned valid JSON.
 *  Filtering for text blocks is correct regardless of what precedes them. */
function textOf(res: Anthropic.Message): string {
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
}

const PRIVATE_PIN = process.env.PRIVATE_PIN || ''
const COMPILED_LOG = 'raw/.compiled-log.json'

interface CompiledLog {
  [file: string]: { compiledAt: string; pagesAffected: string[] }
}

function loadLog(root: string): CompiledLog {
  try { return JSON.parse(fs.readFileSync(path.join(/* turbopackIgnore: true */ root, COMPILED_LOG), 'utf8')) as CompiledLog }
  catch { return {} }
}
function saveLog(root: string, log: CompiledLog): void {
  const p = path.join(/* turbopackIgnore: true */ root, COMPILED_LOG)
  fs.mkdirSync(/* turbopackIgnore: true */ path.dirname(p), { recursive: true })
  // tmp + rename: this is the compile ledger. A torn write makes loadLog's
  // catch reset it to {}, and the next run re-compiles the entire raw/ corpus
  // through the Claude API (same ledger class as .ingest-hashes.json).
  const tmp = p + '.tmp-' + process.pid
  fs.writeFileSync(/* turbopackIgnore: true */ tmp, JSON.stringify(log, null, 2))
  fs.renameSync(tmp, p)
}

/** Recursively collect all .md files under a directory */
function collectMd(dir: string, base = dir): string[] {
  if (!fs.existsSync(/* turbopackIgnore: true */ dir)) return []
  const results: string[] = []
  for (const entry of fs.readdirSync(/* turbopackIgnore: true */ dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(/* turbopackIgnore: true */ dir, entry.name)
    if (entry.isDirectory()) results.push(...collectMd(full, base))
    else if (entry.name.endsWith('.md')) results.push(path.relative(base, full))
  }
  return results
}

/** Read the schema.md if it exists (guides LLM compilation style) */
function readSchema(wikiRoot: string): string {
  const schemaPath = path.join(/* turbopackIgnore: true */ wikiRoot, 'schema.md')
  try { return fs.readFileSync(/* turbopackIgnore: true */ schemaPath, 'utf8') }
  catch { return '' }
}

/** Read existing wiki page list for cross-reference context */
function listWikiPages(wikiRoot: string): string[] {
  return collectMd(wikiRoot)
}

function encodeSSE(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

// ── Analysis types (Call 1 output) ────────────────────────────────────────────

interface AnalysisEntity {
  name: string
  type: string       // concept | pattern | framework | person | company | tool | other
  salience: number   // 0–1, how central to the doc
  description: string
}

interface AnalysisRelationship {
  from: string       // entity name
  to: string         // entity name
  label: string      // e.g. "extends", "replaces", "uses", "contradicts"
  strength: number   // 0–1
  evidence: string   // short quote or paraphrase from source
}

interface AnalysisCandidatePage {
  path: string       // suggested wiki path, e.g. concepts/tool-use.md
  type: string       // concept | pattern | framework | recipe | summary | synthesis | entity
  primary_entities: string[]
}

interface KnowledgeAnalysis {
  entities: AnalysisEntity[]
  relationships: AnalysisRelationship[]
  key_claims: string[]
  candidate_pages: AnalysisCandidatePage[]
  contradictions: string[]
  tags: string[]
}

// ── Auto-reindex: update section counts in index.md ──────────────────────────

const WIKI_SECTIONS = [
  'concepts', 'patterns', 'frameworks', 'entities',
  'recipes', 'evaluations', 'summaries', 'syntheses', 'personal',
] as const

function reindexWiki(wikiRoot: string): void {
  const indexPath = path.join(/* turbopackIgnore: true */ wikiRoot, 'index.md')
  if (!fs.existsSync(/* turbopackIgnore: true */ indexPath)) return

  let indexContent = fs.readFileSync(/* turbopackIgnore: true */ indexPath, 'utf8')

  for (const section of WIKI_SECTIONS) {
    const sectionDir = path.join(/* turbopackIgnore: true */ wikiRoot, section)
    const count = fs.existsSync(/* turbopackIgnore: true */ sectionDir)
      ? fs.readdirSync(/* turbopackIgnore: true */ sectionDir).filter(f => f.endsWith('.md') && !f.startsWith('.')).length
      : 0

    // Match headers like "## Concepts (12)" or "## Concepts" and update/add count
    const capSection = section.charAt(0).toUpperCase() + section.slice(1)
    indexContent = indexContent.replace(
      new RegExp(`(##\\s+${capSection})(?:\\s*\\(\\d+\\))?`, 'i'),
      `$1 (${count})`
    )
  }

  // tmp + rename: wiki/index.md is the master index; torn write truncated it.
  const idxTmp = indexPath + '.tmp-' + process.pid
  fs.writeFileSync(/* turbopackIgnore: true */ idxTmp, indexContent, 'utf8')
  fs.renameSync(idxTmp, indexPath)
}

export async function POST(request: NextRequest): Promise<Response> {
  // PIN check for private vaults
  // Read the header first: a POST with no JSON body throws at request.json(),
  // and the header read must not be lost inside that catch (a valid
  // x-private-pin would otherwise be rejected as missing).
  let pin = request.headers.get('x-private-pin') || ''
  let mode: 'incremental' | 'full' = 'incremental'
  try {
    const body = await request.json() as { pin?: string; mode?: string }
    pin = body.pin || pin
    mode = body.mode === 'full' ? 'full' : 'incremental'
  } catch { /* defaults */ }

  if (PRIVATE_PIN && !pinMatches(pin, PRIVATE_PIN)) {
    return new Response(
      encodeSSE({ type: 'error', message: '🔒 Compile requires a valid PIN.' }),
      { status: 401, headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  const vaultRoot = resolveVaultRoot(request.cookies.get('active_vault_path')?.value)
  const wikiRoot = resolveContentRoot(vaultRoot)
  const rawRoot = path.join(/* turbopackIgnore: true */ vaultRoot, 'raw')
  const encoder = new TextEncoder()

  // Zero-work paths answer with a static SSE body instead of a stream.
  //
  // A ReadableStream that enqueues one event and closes synchronously inside
  // start() is torn down before its headers flush: the client sees a reset
  // connection with no status line (undici reports UND_ERR_SOCKET) rather than
  // a 200 carrying a `done` event. That turned "everything is already
  // compiled" — the normal steady state for mode=incremental, and true here
  // with 183 of 183 raw docs in the ledger — into something indistinguishable
  // from a dead web server. It sent three separate investigations (2026-05-23,
  // 2026-05-27, 2026-08-30) after a phantom outage, and left the 2-source gate
  // reporting a hard failure on every run since May.
  //
  // The 401 branch above returns a static body and has always worked. These
  // two follow it. mode=full is unaffected: it has work to do, enqueues from
  // an async context, and its headers flush normally.
  const allRaw = collectMd(rawRoot)
  const sseDone = (message: string) =>
    new Response(encodeSSE({ type: 'done', message }), {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    })

  if (allRaw.length === 0) {
    return sseDone('No raw documents found. Add docs to raw/ first.')
  }

  const compiledLog = loadLog(vaultRoot)
  const toCompile = mode === 'full'
    ? allRaw
    : allRaw.filter(f => !compiledLog[f])

  if (toCompile.length === 0) {
    return sseDone('✅ All raw docs are already compiled. Use mode=full to recompile.')
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(encoder.encode(encodeSSE(data)))

      try {
        send({ type: 'start', mode, vault: path.basename(vaultRoot) })
        send({ type: 'progress', message: `Found ${allRaw.length} raw docs. Compiling ${toCompile.length} ${mode === 'incremental' ? '(new/uncompiled)' : '(all)'}.` })

        // Read wiki context
        const schema = readSchema(wikiRoot)
        const existingPages = listWikiPages(wikiRoot)
        const existingPagesList = existingPages.slice(0, 60).join('\n')

        let totalPagesCreated = 0
        let totalPagesUpdated = 0

        for (const relFile of toCompile) {
          const rawPath = path.join(/* turbopackIgnore: true */ rawRoot, relFile)
          let rawContent = ''
          try { rawContent = fs.readFileSync(/* turbopackIgnore: true */ rawPath, 'utf8') }
          catch { send({ type: 'skip', file: relFile, reason: 'unreadable' }); continue }

          if (rawContent.length < 50) {
            send({ type: 'skip', file: relFile, reason: 'too short' }); continue
          }

          send({ type: 'compiling', file: relFile })

          // ── Call 1: Analysis ────────────────────────────────────────────────
          // Structural extraction — model thinks as analyst, not writer.
          // No wiki formatting pressure here; just extract what's in the doc.

          const today = new Date().toISOString().slice(0, 10)

          const analysisPrompt = `You are a knowledge analyst. Extract a structured knowledge graph from the raw document below.

**Raw document** (${relFile}):
\`\`\`
${rawContent.slice(0, 6000)}
\`\`\`

Return ONLY valid JSON matching this exact schema — no prose, no code fences:
{
  "entities": [
    { "name": string, "type": "concept|pattern|framework|person|company|tool|other", "salience": 0.0–1.0, "description": string }
  ],
  "relationships": [
    { "from": string, "to": string, "label": string, "strength": 0.0–1.0, "evidence": string }
  ],
  "key_claims": [string],
  "candidate_pages": [
    { "path": "concepts/topic.md", "type": "concept|pattern|framework|recipe|summary|synthesis|entity", "primary_entities": [string] }
  ],
  "contradictions": [string],
  "tags": [string]
}

Rules:
- salience 0.8+ = central topic; 0.4–0.8 = supporting concept; below 0.4 = mention only
- candidate_pages: 1–3 paths maximum; use kebab-case under the right subdirectory
- contradictions: note any claims that conflict with common knowledge or each other
- tags: use lowercase, hyphenated; domain tags only (no dates, no source names)`

          let analysis: KnowledgeAnalysis = {
            entities: [], relationships: [], key_claims: [],
            candidate_pages: [], contradictions: [], tags: [],
          }

          try {
            const analysisResponse = await client.messages.create({
              model: KB_MODEL,
              max_tokens: 2048,
              messages: [{ role: 'user', content: analysisPrompt }],
            })
            const analysisText = textOf(analysisResponse)
            const analysisJson = analysisText.match(/\{[\s\S]*\}/)
            if (analysisJson) {
              analysis = JSON.parse(analysisJson[0]) as KnowledgeAnalysis
            }
          } catch (err) {
            // Analysis failure is non-fatal — fall through with empty analysis
            send({ type: 'warn', file: relFile, message: `Analysis step failed: ${String(err)}. Proceeding with generation only.` })
          }

          send({
            type: 'analysis',
            file: relFile,
            entities: analysis.entities?.length ?? 0,
            candidates: analysis.candidate_pages?.length ?? 0,
            contradictions: analysis.contradictions?.length ?? 0,
            tags: analysis.tags ?? [],
          })

          // ── Call 2: Generation ──────────────────────────────────────────────
          // Wiki curator role: takes the analysis JSON + existing page list
          // and writes complete, formatted page content.

          const systemPrompt = schema
            ? `You are a wiki curator. Follow this schema when creating/updating pages:\n\n${schema}`
            : `You are a wiki curator. You maintain a structured markdown wiki. Create clean, well-organized pages with frontmatter.`

          const genPrompt = `You are compiling a raw document into a structured wiki knowledge base.

**Knowledge graph analysis of the source doc**:
${JSON.stringify(analysis, null, 2)}

**Raw document excerpt** (${relFile}) for additional context:
\`\`\`
${rawContent.slice(0, 4000)}
\`\`\`

**Existing wiki pages** (for cross-referencing):
${existingPagesList || '(none yet)'}

Using the analysis above, write the wiki pages identified in candidate_pages.
For each page, produce COMPLETE markdown content with full frontmatter.

Respond with a JSON array of page operations — ONLY the JSON array, no other text:
[
  {
    "op": "create" | "update",
    "path": "concepts/my-topic.md",
    "content": "---\\ntitle: My Topic\\ntags: [tag1]\\nupdated: ${today}\\n---\\n\\n# My Topic\\n..."
  }
]

Rules:
- Use kebab-case filenames
- Include YAML frontmatter with title, tags, updated fields
- Incorporate the key_claims and relationships from the analysis
- Cross-reference related existing pages with markdown links
- If contradictions were found, add a ## ⚠️ Contradictions section noting them
- Be concise but complete; create 1–3 pages (don't over-split)
- Return ONLY the JSON array`

          let responseText = ''
          let genStopReason: string | null = null
          try {
            const genResponse = await client.messages.create({
              model: KB_MODEL,
              // Each op crams an entire markdown page into a single JSON string
              // value, so a 3-page response already runs ~2000 tokens. 4096 left
              // too little headroom, and overflow was invisible: a truncated
              // array still satisfies the greedy regex below, because frontmatter
              // (`tags: [a, b]`) reliably supplies a closing bracket. Truncation
              // therefore surfaced as an unexplained "JSON parse failed".
              max_tokens: 8192,
              system: systemPrompt,
              messages: [{ role: 'user', content: genPrompt }],
            })
            responseText = textOf(genResponse)
            genStopReason = genResponse.stop_reason ?? null
          } catch (err) {
            send({ type: 'error', file: relFile, message: String(err) }); continue
          }

          // Check this before parsing: a truncated response can still parse-fail
          // in a way that looks like malformed escaping, sending you after the
          // wrong bug.
          if (genStopReason === 'max_tokens') {
            send({
              type: 'skip',
              file: relFile,
              reason: `generation hit max_tokens — response truncated at ${responseText.length} chars`,
            })
            continue
          }

          // Parse the JSON response
          const jsonMatch = responseText.match(/\[[\s\S]*\]/)
          if (!jsonMatch) {
            send({ type: 'skip', file: relFile, reason: 'LLM returned no valid JSON' }); continue
          }

          let ops: Array<{ op: string; path: string; content: string }> = []
          try { ops = JSON.parse(jsonMatch[0]) as typeof ops }
          catch (err) {
            // A bare `catch {}` here threw away the SyntaxError, which is the
            // only thing that distinguishes truncation ("Unexpected end of JSON
            // input") from bad escaping ("Bad control character in string
            // literal at position N"). Keep the message, and dump the raw
            // response so the failure is reproducible offline.
            const detail = err instanceof Error ? err.message : String(err)
            let dumpNote = ''
            try {
              const dumpDir = path.join(process.cwd(), 'logs', 'compile-failures')
              fs.mkdirSync(dumpDir, { recursive: true })
              const dumpFile = path.join(
                dumpDir,
                `${relFile.replace(/[/\\]/g, '__')}.${Date.now()}.txt`
              )
              fs.writeFileSync(dumpFile, responseText, 'utf-8')
              dumpNote = ` (raw response: ${path.relative(process.cwd(), dumpFile)})`
            } catch { /* diagnostics must never break the compile */ }
            send({
              type: 'skip',
              file: relFile,
              reason: `JSON parse failed — ${detail}${dumpNote}`,
            })
            continue
          }

          const affectedPages: string[] = []

          for (const op of ops) {
            if (!op.path || !op.content) continue
            // op.path comes from the model, whose input is untrusted raw/ content
            // — a prompt-injected source could nominate ../../.ssh/authorized_keys.
            // safeJoin rejects traversal/absolute/NUL; restrict to markdown pages.
            if (!/\.(md|mdx)$/.test(op.path)) { send({ type: 'skip', file: relFile, reason: `refused non-markdown op path: ${op.path}` }); continue }
            let pagePath: string
            try { pagePath = safeJoin(wikiRoot, op.path) }
            catch { send({ type: 'skip', file: relFile, reason: `refused unsafe op path: ${op.path}` }); continue }
            fs.mkdirSync(/* turbopackIgnore: true */ path.dirname(pagePath), { recursive: true })
            const existed = fs.existsSync(/* turbopackIgnore: true */ pagePath)
            // tmp+rename: the compiled ledger below marks this source done, so
            // a torn in-place page write would leave a permanently corrupted
            // article that no future incremental compile regenerates.
            const pageTmp = pagePath + '.tmp-' + process.pid
            fs.writeFileSync(/* turbopackIgnore: true */ pageTmp, op.content, 'utf8')
            fs.renameSync(pageTmp, pagePath)
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
          const wikiLogPath = path.join(/* turbopackIgnore: true */ wikiRoot, 'log.md')
          if (!fs.existsSync(/* turbopackIgnore: true */ wikiLogPath)) {
            fs.writeFileSync(/* turbopackIgnore: true */ wikiLogPath, '# Wiki Compilation Log\n\nChronological record of all compile operations.\n')
          }
          fs.appendFileSync(wikiLogPath, logEntry)
        }

        // Auto-reindex: update section counts in index.md after all docs compiled
        try {
          reindexWiki(wikiRoot)
          send({ type: 'reindex', message: 'index.md section counts updated' })
        } catch (err) {
          send({ type: 'warn', message: `Reindex failed (non-fatal): ${String(err)}` })
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
