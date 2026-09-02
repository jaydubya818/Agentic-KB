import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { readIndex, readIndexInVault, resolveContentRoot, DEFAULT_KB_ROOT } from '@/lib/articles'
import { resolveVaultRoot } from '@/lib/vault'
import { KB_MODEL } from '@/lib/model'
import { appendAuditLog } from '@/lib/audit'
import { safeJoin } from '@/lib/safe-path'
import { pinMatches } from '@/lib/pin'

// ── RLM Stage 7: Contradiction filter ────────────────────────────────────────
// Pages flagged as contradictory in the latest lint report are deprioritised:
// they stay in the pool but are pushed to the end so synthesis leads with
// internally-consistent sources.

function loadContradictedPaths(vaultRoot: string): Set<string> {
  const contradicted = new Set<string>()
  const reportPath = path.join(vaultRoot, 'wiki', 'lint-report.md')
  if (!fs.existsSync(reportPath)) return contradicted
  try {
    const report = fs.readFileSync(reportPath, 'utf8')
    // Extract paths from contradiction sections — lines like: `- wiki/concepts/foo.md`
    const section = report.match(/## Contradictions[\s\S]*?(?=\n## |\n---|\s*$)/)?.[0] || ''
    const matches = section.matchAll(/[-*]\s+`?(wiki\/[^\s`]+\.md)`?/g)
    for (const m of matches) contradicted.add(m[1])
  } catch { /* ignore — lint report may not exist yet */ }
  return contradicted
}

// ── RLM Stage 9: Token-budget packing ────────────────────────────────────────
// Pack articles into the context window budget. When tight, keep frontmatter
// + first meaningful paragraph rather than hard-truncating mid-sentence.

const MAX_CONTEXT_CHARS = 24_000   // ~6K tokens, leaves room for synthesis output

function extractArticleSummary(content: string, maxChars: number): string {
  if (content.length <= maxChars) return content
  // Keep frontmatter + first 3 paragraphs (enough for synthesis context)
  const fmEnd = content.indexOf('\n---', 4)
  const header = fmEnd > 0 ? content.slice(0, fmEnd + 4) : ''
  const body = fmEnd > 0 ? content.slice(fmEnd + 4) : content
  const paragraphs = body.split(/\n\n+/).filter(p => p.trim())
  let packed = header
  for (const para of paragraphs) {
    if ((packed + '\n\n' + para).length > maxChars) break
    packed += '\n\n' + para
  }
  return packed + '\n\n_[truncated for context budget]_'
}

function packArticles(
  articles: Array<{ path: string; content: string }>
): Array<{ path: string; content: string }> {
  let remaining = MAX_CONTEXT_CHARS
  return articles.map(a => {
    if (remaining <= 0) return { path: a.path, content: '_[omitted — context budget exhausted]_' }
    const perArticleBudget = Math.min(remaining, Math.floor(MAX_CONTEXT_CHARS / articles.length) * 2)
    const packed = extractArticleSummary(a.content, perArticleBudget)
    remaining -= packed.length
    return { path: a.path, content: packed }
  })
}

// ── Untrusted-path + visibility guards ───────────────────────────────────────
// Page paths come out of a Claude response whose prompt embeds wiki content,
// so they are prompt-injectable. Only wiki/**.md with no dot-segments may be
// read, and the resolved path must stay inside the given root.
function resolveWikiReadPath(root: string, rel: string): string | null {
  const normalized = String(rel).replace(/\\/g, '/')
  if (!normalized.startsWith('wiki/') || !normalized.endsWith('.md')) return null
  if (normalized.split('/').some(seg => seg === '' || seg === '.' || seg === '..')) return null
  try { return safeJoin(root, normalized) } catch { return null }
}

// Same private rules as /api/search: wiki/personal/** is always private,
// otherwise frontmatter `visibility: private` decides. CRLF-normalized so a
// \r\n-formatted private article does not parse as "no frontmatter" = public.
function isPrivateArticle(relPath: string, content: string): boolean {
  if (relPath.replace(/\\/g, '/').startsWith('wiki/personal/')) return true
  const normalized = content.startsWith('---\r\n') ? content.replace(/\r\n/g, '\n') : content
  const fm = normalized.match(/^---\n([\s\S]*?)\n---/)
  if (!fm) return false
  return /^visibility:\s*["']?private["']?\s*$/m.test(fm[1])
}

export const dynamic = 'force-dynamic'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const PRIVATE_PIN = process.env.PRIVATE_PIN || ''

function encodeSSE(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

/**
 * Ask Claude to identify relevant wiki pages from the index.
 */
async function identifyRelevantPages(question: string, indexContent: string): Promise<string[]> {
  const response = await client.messages.create({
    model: KB_MODEL,
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are navigating a wiki knowledge base about agentic AI engineering.

Given this wiki index:
<index>
${indexContent}
</index>

And this question: "${question}"

Identify the 3-5 most relevant wiki pages to read to answer this question.
Return ONLY a JSON array of file paths relative to the KB root, like:
["wiki/concepts/multi-agent-systems.md", "wiki/patterns/pattern-supervisor-worker.md"]

Focus on pages that would most directly answer the question. Return only paths that appear in the index.`,
      },
    ],
  })

  // Concatenate every text block rather than trusting content[0]. If the model
  // leads with a non-text block (thinking, tool_use), content[0].text is
  // undefined and this function used to silently return [] — no pages picked,
  // no error, and the answer downstream came out blank with a normal-looking
  // Sources footer. See wiki/log.md 2026-08-18.
  const text = (response.content ?? [])
    .filter(b => b.type === 'text')
    .map(b => (b as { text: string }).text)
    .join('')

  // Extract JSON array from response
  const jsonMatch = text.match(/\[[\s\S]*?\]/)
  if (!jsonMatch) return []

  try {
    const paths = JSON.parse(jsonMatch[0]) as string[]
    return paths
      .filter(p => typeof p === 'string' && p.length > 0)
      .map(p => {
        // Normalise: ensure wiki/ prefix and .md extension
        let normalised = p.trim()
        if (!normalised.startsWith('wiki/')) normalised = 'wiki/' + normalised
        if (!normalised.endsWith('.md')) normalised = normalised + '.md'
        return normalised
      })
  } catch {
    return []
  }
}

/**
 * Synthesize an answer from the read articles.
 */
async function* synthesizeAnswer(
  question: string,
  articles: Array<{ path: string; content: string }>
): AsyncGenerator<string> {
  const articleTexts = articles
    .map(a => `<article path="${a.path}">\n${a.content}\n</article>`)
    .join('\n\n')

  const prompt = `You are an expert on agentic AI engineering. Answer the following question using the provided wiki articles.

Question: ${question}

Wiki Articles:
${articleTexts}

Provide a comprehensive, well-structured answer. Use markdown formatting. Cite specific articles using their paths when making specific claims. Be precise and practical.`

  // A mid-stream socket stall used to surface as `read ETIMEDOUT` and kill the
  // whole query, and a stream that died partway was indistinguishable from one
  // that finished — the route walked on to send sources + done, so a truncated
  // answer looked complete. Retry when nothing has reached the client yet;
  // once bytes are out, fail loudly instead of silently truncating.
  const MAX_ATTEMPTS = 3

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let emitted = 0
    try {
      const stream = await client.messages.stream({
        model: KB_MODEL,
        // Models with extended thinking spend budget on reasoning before any text —
        // 2048 produced empty/mid-sentence answers. 8192 leaves room for both.
        max_tokens: 8192,
        messages: [{ role: 'user', content: prompt }],
      })

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          emitted += chunk.delta.text.length
          yield chunk.delta.text
        }
      }

      const final = await stream.finalMessage()

      // The loop above only understands text_delta. If the model returned text
      // in a block shape this SDK version does not surface as a text_delta, we
      // would yield nothing and report success. Recover it from the final
      // message rather than returning a blank answer.
      if (emitted === 0) {
        const recovered = (final.content ?? [])
          .filter(b => b.type === 'text')
          .map(b => (b as { text: string }).text)
          .join('')
        if (recovered) {
          emitted = recovered.length
          yield recovered
        }
      }

      if (emitted === 0) {
        throw new Error(
          `model returned no text (stop_reason: ${final.stop_reason ?? 'unknown'})`
        )
      }

      // Never let a max_tokens cut-off masquerade as a finished answer.
      if (final.stop_reason === 'max_tokens') {
        yield '\n\n> ⚠️ **Answer truncated** — hit the 8192 max_tokens cap. Narrow the question or raise the cap.\n'
      }

      return
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)

      // Retrying after partial output would duplicate the text already sent.
      if (emitted > 0) {
        throw new Error(
          `stream failed after ${emitted} chars — the answer above is incomplete: ${msg}`
        )
      }
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(`stream failed after ${MAX_ATTEMPTS} attempts: ${msg}`)
      }
      console.warn(`[query] synthesis attempt ${attempt} failed, retrying: ${msg}`)
      await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** (attempt - 1)))
    }
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      encodeSSE({ type: 'error', content: 'ANTHROPIC_API_KEY not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'text/event-stream' },
      }
    )
  }

  let question: string
  try {
    const body = await request.json() as { question?: string }
    question = body.question?.trim() || ''
  } catch {
    return new Response(
      encodeSSE({ type: 'error', content: 'Invalid request body' }),
      {
        status: 400,
        headers: { 'Content-Type': 'text/event-stream' },
      }
    )
  }

  if (!question) {
    return new Response(
      encodeSSE({ type: 'error', content: 'Question is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'text/event-stream' },
      }
    )
  }

  // Extract scope/pin for private content access
  let queryScope = 'public'
  let queryPin = ''
  try {
    const scopeData = await request.clone().json() as { scope?: string; pin?: string }
    queryScope = (scopeData.scope === 'private' || scopeData.scope === 'all') ? scopeData.scope : 'public'
    queryPin = scopeData.pin || request.headers.get('x-private-pin') || ''
  } catch { /* ignore */ }
  if (queryScope !== 'public') {
    if (!PRIVATE_PIN) {
      return new Response(
        encodeSSE({ type: 'error', content: '🔒 Private scope disabled (PRIVATE_PIN unset).' }),
        { status: 403, headers: { 'Content-Type': 'text/event-stream' } }
      )
    }
    if (!pinMatches(queryPin, PRIVATE_PIN)) {
      return new Response(
        encodeSSE({ type: 'error', content: '🔒 Invalid PIN for private content access.' }),
        { status: 403, headers: { 'Content-Type': 'text/event-stream' } }
      )
    }
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object): void => {
        // Guard against enqueue-after-close (client disconnects mid-stream) —
        // otherwise we crash with ERR_INVALID_STATE and the CLI sees nothing.
        try { controller.enqueue(encoder.encode(encodeSSE(data))) } catch { /* stream closed */ }
      }

      try {
        // Resolve active vault from cookie
        const vaultRoot = resolveVaultRoot(request.cookies.get('active_vault_path')?.value)
        const isDefault = vaultRoot === DEFAULT_KB_ROOT
        const contentRoot = resolveContentRoot(vaultRoot)

        // Step 1: Read the index
        send({ type: 'thinking', content: 'Reading wiki index...' })
        const indexContent = isDefault ? readIndex() : readIndexInVault(vaultRoot)

        if (!indexContent) {
          send({ type: 'error', content: 'Could not read wiki index for this vault. Make sure an index.md exists.' })
          controller.close()
          return
        }

        // Step 2: Identify relevant pages
        send({ type: 'thinking', content: 'Identifying relevant articles...' })
        // Paths the question names explicitly (e.g. "see wiki/candidates.md") are
        // read directly — meta files like candidates.md / log.md / recently-added.md
        // are not in index.md, so the index-scoped picker can never select them.
        const explicitPaths = [...question.matchAll(/wiki\/[\w./-]+\.md/g)]
          .map(m => m[0])
          .filter(p => !p.includes('..'))
        const pickedPaths = await identifyRelevantPages(question, indexContent)
        const pagePaths = [...new Set([...explicitPaths, ...pickedPaths])]

        if (pagePaths.length === 0) {
          send({ type: 'thinking', content: 'No specific pages identified, using general knowledge...' })
        }

        // Step 3: Read the identified pages — apply contradiction filter (RLM stage 7)
        const contradicted = loadContradictedPaths(vaultRoot)
        const articles: Array<{ path: string; content: string }> = []
        const contradictedArticles: Array<{ path: string; content: string }> = []

        for (const pagePath of pagePaths) {
          send({ type: 'reading', path: pagePath })
          let content = ''
          if (isDefault) {
            const full = resolveWikiReadPath(DEFAULT_KB_ROOT, pagePath)
            if (!full) continue
            try { content = fs.readFileSync(full, 'utf8') } catch { continue }
          } else {
            const stripped = pagePath.replace(/^wiki\//, '')
            const candidates = [
              resolveWikiReadPath(vaultRoot, pagePath),
              resolveWikiReadPath(contentRoot, pagePath),
              stripped.split('/').some(seg => seg === '' || seg === '.' || seg === '..')
                ? null
                : (() => { try { return safeJoin(contentRoot, stripped) } catch { return null } })(),
            ]
            for (const c of candidates) {
              if (!c) continue
              try { content = fs.readFileSync(c, 'utf8'); break } catch { /* try next */ }
            }
          }
          if (!content) continue
          // Public-scope queries must not synthesize from private articles —
          // the PIN gate above only covers the *requested* scope, not what the
          // model chose to read. Same rule as /api/search and /api/article.
          if (queryScope === 'public' && isPrivateArticle(pagePath, content)) continue
          // Contradicted pages go last so synthesis leads with consistent sources
          if (contradicted.has(pagePath)) {
            contradictedArticles.push({ path: pagePath, content })
          } else {
            articles.push({ path: pagePath, content })
          }
        }

        // Append contradicted pages at the end (still included, but deprioritised)
        const allArticles = [...articles, ...contradictedArticles]

        // Step 3b: Token-budget packing (RLM stage 9)
        const packedArticles = packArticles(allArticles)

        // Step 4: Synthesize answer (streaming)
        send({ type: 'thinking', content: 'Synthesizing answer from ' + allArticles.length + ' articles...' })

        for await (const chunk of synthesizeAnswer(question, packedArticles)) {
          send({ type: 'answer', content: chunk })
        }

        // Step 5: Send sources
        send({
          type: 'sources',
          paths: allArticles.map(a => a.path),
          contradicted: contradictedArticles.map(a => a.path),
        })

        appendAuditLog({ op: 'query', vault: path.basename(vaultRoot), q: question, scope: queryScope, articlesRead: allArticles.length })
        send({ type: 'done' })
      } catch (error) {
        console.error('WikiQuery error:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        send({ type: 'error', content: `Query failed: ${message}` })
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
