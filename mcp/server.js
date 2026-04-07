#!/usr/bin/env node
/**
 * Agentic KB MCP Server
 * Exposes the knowledge base as MCP tools for agent access.
 *
 * Usage: node mcp/server.js
 * Or configure in Claude Desktop claude_desktop_config.json
 *
 * Environment variables:
 *   KB_API_URL   - Base URL of the web server (default: http://localhost:3002)
 *   PRIVATE_PIN  - PIN for accessing private content (optional)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import fs from 'fs'
import path from 'path'

const KB_ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..')
const WIKI_ROOT = path.join(KB_ROOT, 'wiki')
const API_URL = process.env.KB_API_URL || 'http://localhost:3002'
const PRIVATE_PIN = process.env.PRIVATE_PIN || ''

// ─── Helpers ────────────────────────────────────────────────────────────────

function readFile(relPath) {
  try {
    return fs.readFileSync(path.join(KB_ROOT, relPath), 'utf8')
  } catch {
    return null
  }
}

function listWikiFiles(section) {
  const dir = section ? path.join(WIKI_ROOT, section) : WIKI_ROOT
  const results = []
  function walk(d) {
    if (!fs.existsSync(d)) return
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.md')) results.push(full)
    }
  }
  walk(dir)
  return results
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const meta = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    meta[key] = val
  }
  return meta
}

function simpleSearch(query, limit = 20, scope = 'public') {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const results = []

  for (const filePath of listWikiFiles()) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const meta = parseFrontmatter(content)
      const relPath = path.relative(KB_ROOT, filePath)
      const isPersonal = relPath.includes('wiki/personal/')
      const visibility = isPersonal ? 'private' : (meta.visibility || 'public')

      if (scope === 'public' && visibility !== 'public') continue
      if (scope === 'private' && visibility !== 'private') continue

      const slug = path.relative(WIKI_ROOT, filePath).replace(/\\/g, '/').replace(/\.md$/, '')
      const fullText = (content).toLowerCase()
      let score = 0
      for (const term of terms) {
        if (fullText.includes(term)) {
          score++
          const title = (meta.title || slug).toLowerCase()
          if (title.includes(term)) score += 2
        }
      }

      if (score > 0) {
        const bodyStart = content.indexOf('---', 3)
        const body = bodyStart > 0 ? content.slice(bodyStart + 3).trim() : content
        const snippetIdx = Math.max(0, body.toLowerCase().indexOf(terms[0]) - 60)
        const snippet = body.slice(snippetIdx, snippetIdx + 200)

        results.push({
          slug,
          title: meta.title || slug,
          type: meta.type || 'article',
          visibility,
          vault: meta.vault === 'true',
          snippet,
          score,
        })
      }
    } catch { /* skip */ }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}

// ─── MCP Server ─────────────────────────────────────────────────────────────

const server = new Server(
  { name: 'agentic-kb', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_wiki',
      description: 'Search the Agentic Engineering Knowledge Base for articles matching a query.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          scope: {
            type: 'string',
            enum: ['public', 'private', 'all'],
            description: 'public = employee-visible only (default); private = Jay\'s private only; all = everything',
            default: 'public',
          },
          limit: { type: 'number', description: 'Max results (default 10)', default: 10 },
          pin: { type: 'string', description: 'PIN required when scope is "private" or "all". Must match PRIVATE_PIN env var.' },
        },
        required: ['query'],
      },
    },
    {
      name: 'read_article',
      description: 'Read the full content of a wiki article by its slug (e.g. "concepts/tool-use"). Private articles require a pin.',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Article slug relative to wiki/ (e.g. "concepts/tool-use")' },
          pin: { type: 'string', description: 'PIN required for private articles. Must match PRIVATE_PIN env var.' },
        },
        required: ['slug'],
      },
    },
    {
      name: 'read_index',
      description: 'Read the wiki master index (index.md) — lists all articles by section.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'list_articles',
      description: 'List articles in a specific wiki section.',
      inputSchema: {
        type: 'object',
        properties: {
          section: {
            type: 'string',
            enum: ['concepts', 'patterns', 'frameworks', 'entities', 'recipes', 'evaluations', 'personal', 'summaries', 'syntheses'],
            description: 'Wiki section to list',
          },
        },
        required: ['section'],
      },
    },
    {
      name: 'query_wiki',
      description: 'Ask a natural language question against the KB using the AI WikiQuery engine. Returns a synthesized answer with citations.',
      inputSchema: {
        type: 'object',
        properties: {
          question: { type: 'string', description: 'The question to answer using the KB' },
          scope: {
            type: 'string',
            enum: ['public', 'private', 'all'],
            description: 'Content scope: public (default), private, or all',
            default: 'public',
          },
          pin: { type: 'string', description: 'PIN required when scope is "private" or "all".' },
        },
        required: ['question'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    if (name === 'search_wiki') {
      const query = String(args.query || '')
      const scope = (args.scope === 'private' || args.scope === 'all') ? args.scope : 'public'
      const limit = Number(args.limit || 10)

      // Validate PIN for private scopes
      if (scope !== 'public' && PRIVATE_PIN) {
        const providedPin = String(args.pin || '')
        if (providedPin !== PRIVATE_PIN) {
          return { content: [{ type: 'text', text: '🔒 Private content requires a valid PIN. Pass pin: your-pin with scope: ' + scope + '.' }], isError: true }
        }
      }

      const results = simpleSearch(query, limit, scope)
      if (results.length === 0) {
        return { content: [{ type: 'text', text: `No results found for "${query}" (scope: ${scope})` }] }
      }

      const text = results.map((r, i) =>
        `${i + 1}. **${r.title}** [${r.type}]${r.vault ? ' ✦VAULT' : ''}${r.visibility === 'private' ? ' 🔒' : ''}\n   slug: ${r.slug}\n   ${r.snippet.slice(0, 150)}...`
      ).join('\n\n')

      return { content: [{ type: 'text', text: `Search results for "${query}" (${results.length} found):\n\n${text}` }] }
    }

    if (name === 'read_article') {
      const slug = String(args.slug || '').replace(/\.md$/, '')
      const filePath = path.join(WIKI_ROOT, slug + '.md')
      const articleContent = readFile(path.relative(KB_ROOT, filePath))
      if (!articleContent) {
        return { content: [{ type: 'text', text: `Article not found: ${slug}` }] }
      }
      // Check visibility — private articles require PIN
      const meta = parseFrontmatter(articleContent)
      const isPersonalPath = slug.startsWith('personal/')
      const visibility = isPersonalPath ? 'private' : (meta.visibility || 'public')
      if (visibility === 'private' && PRIVATE_PIN) {
        const providedPin = String(args.pin || '')
        if (providedPin !== PRIVATE_PIN) {
          return { content: [{ type: 'text', text: '🔒 This article is private. Pass pin: "<your-pin>" to access it.' }], isError: true }
        }
      }
      return { content: [{ type: 'text', text: articleContent }] }
    }

    if (name === 'read_index') {
      const content = readFile('wiki/index.md')
      if (!content) {
        return { content: [{ type: 'text', text: 'Index not found' }] }
      }
      return { content: [{ type: 'text', text: content }] }
    }

    if (name === 'list_articles') {
      const section = String(args.section || '')
      const sectionDir = path.join(WIKI_ROOT, section)
      if (!fs.existsSync(sectionDir)) {
        return { content: [{ type: 'text', text: `Section not found: ${section}` }] }
      }

      const files = fs.readdirSync(sectionDir).filter(f => f.endsWith('.md'))
      const articles = files.map(f => {
        const content = readFile(path.join('wiki', section, f))
        const meta = content ? parseFrontmatter(content) : {}
        const slug = `${section}/${f.replace(/\.md$/, '')}`
        return `- **${meta.title || slug}** (${slug}) [${meta.type || 'article'}]${meta.vault === 'true' ? ' ✦' : ''}`
      })

      return { content: [{ type: 'text', text: `## ${section} (${files.length} articles)\n\n${articles.join('\n')}` }] }
    }

    if (name === 'query_wiki') {
      const question = String(args.question || '')
      const qscope = (args.scope === 'private' || args.scope === 'all') ? args.scope : 'public'
      if (qscope !== 'public' && PRIVATE_PIN) {
        const providedPin = String(args.pin || '')
        if (providedPin !== PRIVATE_PIN) {
          return { content: [{ type: 'text', text: '🔒 Private content requires a valid PIN. Pass pin: "<your-pin>" with scope.' }], isError: true }
        }
      }
      const res = await fetch(`${API_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(PRIVATE_PIN && qscope !== 'public' ? { 'x-private-pin': PRIVATE_PIN } : {}) },
        body: JSON.stringify({ question, scope: qscope, pin: String(args.pin || '') }),
      })

      if (!res.body) {
        return { content: [{ type: 'text', text: 'Query API unavailable' }] }
      }

      // Collect SSE stream
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullAnswer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        for (const line of text.split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if ((data.type === 'token' || data.type === 'answer') && data.content) fullAnswer += data.content
            if (data.type === 'done') break
          } catch { /* skip */ }
        }
      }

      return { content: [{ type: 'text', text: fullAnswer || 'No answer returned' }] }
    }

    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true }
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
