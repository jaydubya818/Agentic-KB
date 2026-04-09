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
  const indexPath = path.join(wikiRoot, 'index.md')
  if (!fs.existsSync(indexPath)) return

  let indexContent = fs.readFileSync(indexPath, 'utf8')

  for (const section of WIKI_SECTIONS) {
    const sectionDir = path.join(wikiRoot, section)
    const count = fs.existsSync(sectionDir)
      ? fs.readdirSync(sectionDir).filter(f => f.endsWith('.md') && !f.startsWith('.')).length
      : 0

    // Match headers like "## Concepts (12)" or "## Concepts" and update/add count
    const capSection = section.charAt(0).toUpperCase() + section.slice(1)
    indexContent = indexContent.replace(
      new RegExp(`(##\\s+${capSection})(?:\\s*\\(\\d+\\))?`, 'i'),
      `$1 (${count})`
    )
  }

  fs.writeFileSync(indexPath, indexContent, 'utf8')
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
              model: 'claude-sonnet-4-6',
              max_tokens: 2048,
              messages: [{ role: 'user', content: analysisPrompt }],
            })
            const analysisText = analysisResponse.content[0].type === 'text'
              ? analysisResponse.content[0].text : ''
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
          try {
            const genResponse = await client.messages.create({
              model: 'claude-sonnet-4-6',
              max_tokens: 4096,
              system: systemPrompt,
              messages: [{ role: 'user', content: genPrompt }],
            })
            responseText = genResponse.content[0].type === 'text' ? genResponse.content[0].text : ''
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
