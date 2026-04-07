import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { readIndex, readIndexInVault, readKBFile, resolveContentRoot, DEFAULT_KB_ROOT } from '@/lib/articles'
import { appendAuditLog } from '@/lib/audit'

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
async function identifyRelevantPages(question: string, indexContent: string, scope = 'public'): Promise<string[]> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
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

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Extract JSON array from response
  const jsonMatch = text.match(/\[[\s\S]*?\]/)
  if (!jsonMatch) return []

  try {
    const paths = JSON.parse(jsonMatch[0]) as string[]
    return paths.filter(p => typeof p === 'string' && p.endsWith('.md'))
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

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are an expert on agentic AI engineering. Answer the following question using the provided wiki articles.

Question: ${question}

Wiki Articles:
${articleTexts}

Provide a comprehensive, well-structured answer. Use markdown formatting. Cite specific articles using their paths when making specific claims. Be precise and practical.`,
      },
    ],
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text
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
  if (queryScope !== 'public' && PRIVATE_PIN && queryPin !== PRIVATE_PIN) {
    return new Response(
      encodeSSE({ type: 'error', content: '🔒 Invalid PIN for private content access.' }),
      { status: 401, headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object): void => {
        controller.enqueue(encoder.encode(encodeSSE(data)))
      }

      try {
        // Resolve active vault from cookie
        const vaultRoot = request.cookies.get('active_vault_path')?.value || DEFAULT_KB_ROOT
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
        const pagePaths = await identifyRelevantPages(question, indexContent)

        if (pagePaths.length === 0) {
          send({ type: 'thinking', content: 'No specific pages identified, using general knowledge...' })
        }

        // Step 3: Read the identified pages
        const articles: Array<{ path: string; content: string }> = []
        for (const pagePath of pagePaths) {
          send({ type: 'reading', path: pagePath })
          let content = ''
          if (isDefault) {
            content = readKBFile(pagePath)
          } else {
            const candidates = [
              path.join(vaultRoot, pagePath),
              path.join(contentRoot, pagePath),
              path.join(contentRoot, pagePath.replace(/^wiki\//, '')),
            ]
            for (const c of candidates) {
              try { content = fs.readFileSync(c, 'utf8'); break } catch { /* try next */ }
            }
          }
          if (content) articles.push({ path: pagePath, content })
        }

        // Step 4: Synthesize answer (streaming)
        send({ type: 'thinking', content: 'Synthesizing answer from ' + articles.length + ' articles...' })

        for await (const chunk of synthesizeAnswer(question, articles)) {
          send({ type: 'answer', content: chunk })
        }

        // Step 5: Send sources
        send({
          type: 'sources',
          paths: articles.map(a => a.path),
        })

        appendAuditLog({ op: 'query', vault: path.basename(vaultRoot), q: question, scope: queryScope, articlesRead: articles.length })
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
