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
import * as agentRuntime from '../lib/agent-runtime/index.mjs'
import * as repoRuntime from '../lib/repo-runtime/index.mjs'

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
    {
      name: 'compile_wiki',
      description: 'Process uncompiled raw documents and compile them into structured wiki pages using Claude. Use mode="incremental" for new docs only (default) or mode="full" to recompile everything.',
      inputSchema: {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: ['incremental', 'full'], description: 'incremental=new docs only, full=recompile all', default: 'incremental' },
          pin: { type: 'string', description: 'PIN required if PRIVATE_PIN is set.' },
        },
      },
    },
    {
      name: 'load_agent_context',
      description: 'Load a scoped context bundle for an agent, respecting its contract (tier, budget, allowed reads).',
      inputSchema: {
        type: 'object',
        properties: {
          agent_id: { type: 'string' },
          project: { type: 'string' },
        },
        required: ['agent_id'],
      },
    },
    {
      name: 'close_agent_task',
      description: 'Transactional end-of-task writeback for an agent: appends task log, updates hot, writes gotchas, publishes discoveries/escalations, creates rewrites. Atomic — any forbidden write aborts the whole commit.',
      inputSchema: {
        type: 'object',
        properties: {
          agent_id: { type: 'string' },
          project: { type: 'string' },
          taskLogEntry: { type: 'string' },
          hotUpdate: { type: 'string' },
          gotcha: { type: 'string' },
          discoveries: { type: 'array' },
          escalations: { type: 'array' },
          rewrites: { type: 'array' },
        },
        required: ['agent_id'],
      },
    },
    {
      name: 'publish_bus_item',
      description: 'Publish an item to a bus channel (discovery, escalation, standards, handoffs).',
      inputSchema: {
        type: 'object',
        properties: {
          channel: { type: 'string' },
          from: { type: 'string' },
          from_tier: { type: 'string' },
          project: { type: 'string' },
          body: { type: 'string' },
          to: { type: 'string' },
        },
        required: ['channel', 'from', 'body'],
      },
    },
    {
      name: 'list_agent_bus_items',
      description: 'List items in a bus channel, optionally filtered by status.',
      inputSchema: {
        type: 'object',
        properties: {
          channel: { type: 'string' },
          status: { type: 'string' },
        },
        required: ['channel'],
      },
    },
    {
      name: 'promote_learning',
      description: 'Promote a bus item to a target knowledge location with provenance; marks source as promoted.',
      inputSchema: {
        type: 'object',
        properties: {
          channel: { type: 'string' },
          id: { type: 'string' },
          approver: { type: 'string' },
          target: { type: 'string' },
        },
        required: ['channel', 'id', 'approver'],
      },
    },
    {
      name: 'merge_rewrite',
      description: 'Merge an approved rewrite artifact into the canonical project document. Snapshots previous canonical, writes new with provenance, transitions rewrite to merged. Requires rewrite to be in approved state and approver to meet minimum tier.',
      inputSchema: {
        type: 'object',
        properties: {
          rewrite_path: { type: 'string', description: 'Relative path to the rewrite artifact (must have status: approved)' },
          canonical_path: { type: 'string', description: 'Relative path to the target canonical document' },
          approver: { type: 'string', description: 'Identity of the approver (agent_id or human name); must meet min tier' },
          promotion_reason: { type: 'string', description: 'Why this rewrite is being merged (optional)' },
          source_task_id: { type: 'string', description: 'Task that produced this rewrite (optional)' },
          supersedes: { type: 'string', description: 'Path being superseded — required if canonical already exists' },
          force: { type: 'boolean', description: 'Skip supersedes check when overwriting an existing canonical (default false)' },
        },
        required: ['rewrite_path', 'canonical_path', 'approver'],
      },
    },
    {
      name: 'agent_trace',
      description: 'Return recent runtime traces (context loads and close-task writes) for an agent from logs/agent-runtime.log. Useful for debugging context budget issues and rejected writes.',
      inputSchema: {
        type: 'object',
        properties: {
          agent_id: { type: 'string' },
          limit: { type: 'number', description: 'Max traces to return (default 20)' },
          type: { type: 'string', enum: ['context-load', 'close-task'], description: 'Filter by trace type' },
        },
        required: ['agent_id'],
      },
    },
    {
      name: 'list_agents',
      description: 'List all agent contracts in the vault.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'lint_wiki',
      description: 'Run a health check on the wiki: detects contradictions between pages, orphaned pages with no links, stale content, and knowledge gaps. Writes a lint-report.md to the wiki.',
      inputSchema: {
        type: 'object',
        properties: {
          pin: { type: 'string', description: 'PIN required if PRIVATE_PIN is set.' },
        },
      },
    },
    {
      name: 'list_repos',
      description: 'List all tracked repos with their sync status and doc counts.',
      inputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'pending', 'archived'], description: 'Filter by status' },
        },
      },
    },
    {
      name: 'get_repo_home',
      description: 'Get the home page and overview for a tracked repo.',
      inputSchema: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
        },
        required: ['repo'],
      },
    },
    {
      name: 'sync_repo_markdown',
      description: 'Sync a repository from GitHub — fetches .md/.mjs/.ts/.json files and writes them to wiki/repos/<repo>/repo-docs/.',
      inputSchema: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
          token: { type: 'string', description: 'GitHub PAT (optional, uses env GITHUB_PAT if absent)' },
        },
        required: ['repo'],
      },
    },
    {
      name: 'search_repo_docs',
      description: 'Full-text search within a specific repo namespace (canonical docs, imported docs, bus).',
      inputSchema: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
          query: { type: 'string' },
          limit: { type: 'number', default: 20 },
        },
        required: ['repo', 'query'],
      },
    },
    {
      name: 'load_repo_context',
      description: 'Load prioritized context bundle for an agent working on a specific repo.',
      inputSchema: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
          agent_id: { type: 'string' },
          budget_bytes: { type: 'number', default: 50000 },
        },
        required: ['repo'],
      },
    },
    {
      name: 'append_repo_progress',
      description: 'Append a progress entry to wiki/repos/<repo>/progress.md.',
      inputSchema: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
          entry: { type: 'string' },
        },
        required: ['repo', 'entry'],
      },
    },
    {
      name: 'write_repo_task_log',
      description: 'Append a task log entry for an agent working on a repo.',
      inputSchema: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
          agent_id: { type: 'string' },
          entry: { type: 'string' },
        },
        required: ['repo', 'agent_id', 'entry'],
      },
    },
    {
      name: 'write_rewrite_artifact',
      description: 'Create a rewrite artifact in wiki/repos/<repo>/rewrites/<type>/.',
      inputSchema: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
          type: { type: 'string', enum: ['prds', 'specs', 'plans', 'test-plans'] },
          project: { type: 'string' },
          content: { type: 'string' },
          author: { type: 'string' },
        },
        required: ['repo', 'type', 'project', 'content', 'author'],
      },
    },
    {
      name: 'publish_repo_discovery',
      description: 'Publish a discovery bus item to wiki/repos/<repo>/bus/discovery/.',
      inputSchema: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
          from: { type: 'string' },
          body: { type: 'string' },
          project: { type: 'string' },
        },
        required: ['repo', 'from', 'body'],
      },
    },
    {
      name: 'publish_repo_escalation',
      description: 'Publish an escalation bus item to wiki/repos/<repo>/bus/escalation/.',
      inputSchema: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
          from: { type: 'string' },
          body: { type: 'string' },
          to: { type: 'string' },
        },
        required: ['repo', 'from', 'body'],
      },
    },
    {
      name: 'list_repo_bus_items',
      description: 'List bus items for a repo channel (discovery, escalation, standards, handoffs).',
      inputSchema: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
          channel: { type: 'string', enum: ['discovery', 'escalation', 'standards', 'handoffs'] },
          status: { type: 'string' },
          limit: { type: 'number' },
        },
        required: ['repo', 'channel'],
      },
    },
    {
      name: 'promote_repo_learning',
      description: 'Promote a repo bus item to a canonical or learned location with provenance.',
      inputSchema: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
          channel: { type: 'string' },
          id: { type: 'string' },
          target_path: { type: 'string' },
          approver: { type: 'string' },
        },
        required: ['repo', 'channel', 'id', 'approver'],
      },
    },
    // ─── Task Lifecycle Tools ───────────────────────────────────────────────────
    {
      name: 'agent_start_task',
      description: 'Start a new task for an agent. Creates a working-memory file and sets active-task.md pointer. Returns taskId and paths.',
      inputSchema: {
        type: 'object',
        properties: {
          agent_id: { type: 'string', description: 'Agent contract ID' },
          project: { type: 'string', description: 'Project namespace (optional)' },
          description: { type: 'string', description: 'Human-readable task description (optional)' },
          task_id: { type: 'string', description: 'Override task ID (auto-generated if omitted)' },
        },
        required: ['agent_id'],
      },
    },
    {
      name: 'agent_active_task',
      description: 'Return the current active task metadata for an agent, or null if no task is active.',
      inputSchema: {
        type: 'object',
        properties: {
          agent_id: { type: 'string' },
        },
        required: ['agent_id'],
      },
    },
    {
      name: 'agent_append_task_state',
      description: 'Append a timestamped state entry to the active working-memory file. Requires an active task.',
      inputSchema: {
        type: 'object',
        properties: {
          agent_id: { type: 'string' },
          task_id: { type: 'string', description: 'Task ID to append to' },
          entry: { type: 'string', description: 'State entry text to append' },
        },
        required: ['agent_id', 'task_id', 'entry'],
      },
    },
    {
      name: 'agent_abandon_task',
      description: 'Mark an active task as abandoned. Sets status in working-memory and clears the active-task pointer.',
      inputSchema: {
        type: 'object',
        properties: {
          agent_id: { type: 'string' },
          task_id: { type: 'string' },
          reason: { type: 'string', description: 'Reason for abandonment (optional)' },
        },
        required: ['agent_id', 'task_id'],
      },
    },
    {
      name: 'agent_dry_run_close_task',
      description: 'Dry-run a close-task operation — returns the full write plan (allowed/rejected ops, bus publications, file writes) without executing anything. Useful for validating a payload before committing.',
      inputSchema: {
        type: 'object',
        properties: {
          agent_id: { type: 'string' },
          project: { type: 'string' },
          taskLogEntry: { type: 'string' },
          hotUpdate: { type: 'string' },
          gotcha: { type: 'string' },
          discoveries: { type: 'array' },
          escalations: { type: 'array' },
          rewrites: { type: 'array' },
        },
        required: ['agent_id'],
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

    if (name === 'compile_wiki') {
      const mode = String(args.mode || 'incremental')
      if (PRIVATE_PIN) {
        const providedPin = String(args.pin || '')
        if (providedPin !== PRIVATE_PIN) {
          return { content: [{ type: 'text', text: 'Compile requires a valid PIN.' }], isError: true }
        }
      }
      const res = await fetch(`${API_URL}/api/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(PRIVATE_PIN ? { 'x-private-pin': PRIVATE_PIN } : {}) },
        body: JSON.stringify({ mode, pin: String(args.pin || '') }),
      })
      if (!res.body) return { content: [{ type: 'text', text: 'Compile API unavailable' }] }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      const lines = []
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const parts = buf.split('\n\n')
        buf = parts.pop() || ''
        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          try {
            const data = JSON.parse(part.slice(6))
            if (data.type === 'progress' || data.type === 'done') lines.push(data.message || '')
            if (data.type === 'page') lines.push((data.op === 'create' ? '[new] ' : '[upd] ') + data.path)
            if (data.type === 'error') return { content: [{ type: 'text', text: 'Error: ' + data.message }], isError: true }
          } catch(e) { }
        }
      }
      return { content: [{ type: 'text', text: lines.join('\n') }] }
    }
    if (name === 'lint_wiki') {
      if (PRIVATE_PIN) {
        const providedPin = String(args.pin || '')
        if (providedPin !== PRIVATE_PIN) {
          return { content: [{ type: 'text', text: 'Lint requires a valid PIN.' }], isError: true }
        }
      }
      const res = await fetch(`${API_URL}/api/lint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(PRIVATE_PIN ? { 'x-private-pin': PRIVATE_PIN } : {}) },
        body: JSON.stringify({ pin: String(args.pin || '') }),
      })
      const data = await res.json()
      if (data.ok) {
        return { content: [{ type: 'text', text: [
          'Wiki Lint Report',
          'Pages scanned:  ' + data.pagesScanned,
          'Contradictions: ' + data.contradictions,
          'Orphaned pages: ' + data.orphans,
          'Stale pages:    ' + data.stalePages,
          'Knowledge gaps: ' + data.gaps,
          '',
          data.summary,
          'Full report written to wiki/lint-report.md',
        ].join('\n') }] }
      }
      return { content: [{ type: 'text', text: 'Lint error: ' + (data.error || 'unknown') }], isError: true }
    }
    if (name === 'load_agent_context') {
      const contract = agentRuntime.loadContract(KB_ROOT, String(args.agent_id))
      if (!contract) return { content: [{ type: 'text', text: `Agent not found: ${args.agent_id}` }], isError: true }
      const bundle = agentRuntime.loadAgentContext(KB_ROOT, contract, {
        project: args.project || null,
        domain: contract.domain,
        agent: args.agent_id,
      })
      return { content: [{ type: 'text', text: JSON.stringify({ trace: bundle.trace, files: bundle.files.map(f => ({ path: f.path, class: f.class, bytes: f.bytes })) }, null, 2) }] }
    }

    if (name === 'close_agent_task') {
      const contract = agentRuntime.loadContract(KB_ROOT, String(args.agent_id))
      if (!contract) return { content: [{ type: 'text', text: `Agent not found: ${args.agent_id}` }], isError: true }
      const result = agentRuntime.closeTask(KB_ROOT, contract, args)
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }], isError: !result.ok }
    }

    if (name === 'publish_bus_item') {
      const result = agentRuntime.publishBusItem(KB_ROOT, args)
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    }

    if (name === 'list_agent_bus_items') {
      const items = agentRuntime.listBusItems(KB_ROOT, String(args.channel), args.status ? { status: String(args.status) } : {})
      return { content: [{ type: 'text', text: JSON.stringify(items, null, 2) }] }
    }

    if (name === 'promote_learning') {
      const result = agentRuntime.promoteLearning(KB_ROOT, args)
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }

    if (name === 'merge_rewrite') {
      const result = agentRuntime.mergeRewrite(KB_ROOT, {
        rewritePath: String(args.rewrite_path),
        canonicalPath: String(args.canonical_path),
        approver: String(args.approver),
        promotionReason: args.promotion_reason ? String(args.promotion_reason) : '',
        sourceTaskId: args.source_task_id ? String(args.source_task_id) : null,
        supersedes: args.supersedes ? String(args.supersedes) : null,
        force: Boolean(args.force),
      })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }

    if (name === 'agent_trace') {
      const limit = Math.min(Number(args.limit || 20), 200)
      const filter = { agent_id: String(args.agent_id) }
      if (args.type) filter.type = String(args.type)
      const traces = agentRuntime.readRuntimeTraces(KB_ROOT, limit, filter)
      return { content: [{ type: 'text', text: JSON.stringify({ agent_id: args.agent_id, count: traces.length, traces }, null, 2) }] }
    }

    if (name === 'list_agents') {
      const contracts = agentRuntime.listContracts(KB_ROOT)
      return { content: [{ type: 'text', text: JSON.stringify(contracts.map(c => ({ agent_id: c.agent_id, tier: c.tier, domain: c.domain })), null, 2) }] }
    }

    // ─── Repo Runtime Tools ─────────────────────────────────────────────────────

    if (name === 'list_repos') {
      const repos = repoRuntime.listRepos(KB_ROOT)
      const filtered = args.status ? repos.filter(r => r.status === String(args.status)) : repos
      const lines = filtered.map(r => `${r.name} [${r.status || 'unknown'}] - ${r.docCount || 0} docs, last-sync: ${r.lastSync || 'never'}`)
      return { content: [{ type: 'text', text: lines.length > 0 ? lines.join('\n') : 'No repos tracked.' }] }
    }

    if (name === 'get_repo_home') {
      const repo = String(args.repo)
      const homePath = path.join(KB_ROOT, 'wiki', 'repos', repo, 'home.md')
      const content = readFile(path.relative(KB_ROOT, homePath))
      if (!content) return { content: [{ type: 'text', text: `Repo not found: ${repo}` }], isError: true }
      return { content: [{ type: 'text', text: content }] }
    }

    if (name === 'sync_repo_markdown') {
      const repo = String(args.repo)
      const token = args.token || process.env.GITHUB_PAT
      const result = await repoRuntime.syncRepo(KB_ROOT, repo, { token })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }

    if (name === 'search_repo_docs') {
      const repo = String(args.repo)
      const query = String(args.query || '')
      const limit = Math.min(Number(args.limit || 20), 100)
      const repoDocsDir = path.join(KB_ROOT, 'wiki', 'repos', repo)
      if (!fs.existsSync(repoDocsDir)) return { content: [{ type: 'text', text: `Repo not found: ${repo}` }], isError: true }

      const results = []
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
      function walkDir(d) {
        if (!fs.existsSync(d)) return
        for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
          const full = path.join(d, entry.name)
          if (entry.isDirectory()) walkDir(full)
          else if (entry.name.endsWith('.md')) {
            const content = fs.readFileSync(full, 'utf8')
            let score = 0
            for (const term of terms) if (content.toLowerCase().includes(term)) score++
            if (score > 0) {
              const snippet = content.slice(0, 200)
              results.push({ path: path.relative(repoDocsDir, full), snippet, score })
            }
          }
        }
      }
      walkDir(repoDocsDir)
      results.sort((a, b) => b.score - a.score)
      const text = results.slice(0, limit).map(r => `${r.path}\n  ${r.snippet.slice(0, 150)}...`).join('\n\n')
      return { content: [{ type: 'text', text: text || 'No results found.' }] }
    }

    if (name === 'load_repo_context') {
      const repo = String(args.repo)
      const agentId = args.agent_id ? String(args.agent_id) : null
      const budget = Number(args.budget_bytes || 50000)
      const result = repoRuntime.loadRepoContext(KB_ROOT, repo, { agentId, budgetBytes: budget })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }

    if (name === 'append_repo_progress') {
      const repo = String(args.repo)
      const entry = String(args.entry)
      const result = repoRuntime.appendRepoProgress(KB_ROOT, repo, entry)
      return { content: [{ type: 'text', text: JSON.stringify({ written: result }, null, 2) }] }
    }

    if (name === 'write_repo_task_log') {
      const repo = String(args.repo)
      const agentId = String(args.agent_id)
      const entry = String(args.entry)
      const result = repoRuntime.writeRepoTaskLog(KB_ROOT, repo, agentId, entry)
      return { content: [{ type: 'text', text: JSON.stringify({ written: result }, null, 2) }] }
    }

    if (name === 'write_rewrite_artifact') {
      const repo = String(args.repo)
      const type = String(args.type)
      const project = String(args.project)
      const content = String(args.content)
      const author = String(args.author)
      const now = new Date().toISOString().slice(0, 10)
      const dir = path.join(KB_ROOT, 'wiki', 'repos', repo, 'rewrites', type)
      fs.mkdirSync(dir, { recursive: true })
      const filePath = path.join(dir, `${project}-${now}.md`)
      const frontmatter = `---\ntitle: "${project} ${type} rewrite"\ntype: rewrite\nrepo: ${repo}\nproject: ${project}\nauthor: ${author}\ndate: ${now}\nstatus: draft\n---\n\n`
      fs.writeFileSync(filePath, frontmatter + content, 'utf8')
      return { content: [{ type: 'text', text: JSON.stringify({ path: path.relative(KB_ROOT, filePath) }, null, 2) }] }
    }

    if (name === 'publish_repo_discovery') {
      const repo = String(args.repo)
      const from = String(args.from)
      const body = String(args.body)
      const project = args.project ? String(args.project) : null
      const result = repoRuntime.publishRepoBusItem(KB_ROOT, repo, { channel: 'discovery', from, body, project })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }

    if (name === 'publish_repo_escalation') {
      const repo = String(args.repo)
      const from = String(args.from)
      const body = String(args.body)
      const to = args.to ? String(args.to) : null
      const result = repoRuntime.publishRepoBusItem(KB_ROOT, repo, { channel: 'escalation', from, body, to })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }

    if (name === 'list_repo_bus_items') {
      const repo = String(args.repo)
      const channel = String(args.channel)
      const limit = Number(args.limit || 50)
      const items = repoRuntime.listRepoBusItems(KB_ROOT, repo, channel, { status: args.status ? String(args.status) : null, limit })
      return { content: [{ type: 'text', text: JSON.stringify(items, null, 2) }] }
    }

    if (name === 'promote_repo_learning') {
      const repo = String(args.repo)
      const channel = String(args.channel)
      const id = String(args.id)
      const targetPath = args.target_path ? String(args.target_path) : null
      const approver = String(args.approver)
      const result = repoRuntime.transitionRepoBusItem(KB_ROOT, repo, channel, id, 'promoted', { targetPath, approver })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }

    // ─── Task Lifecycle Handlers ────────────────────────────────────────────────

    if (name === 'agent_start_task') {
      const contract = agentRuntime.loadContract(KB_ROOT, String(args.agent_id))
      if (!contract) return { content: [{ type: 'text', text: `Agent not found: ${args.agent_id}` }], isError: true }
      const result = agentRuntime.startTask(KB_ROOT, contract, {
        project: args.project ? String(args.project) : null,
        description: args.description ? String(args.description) : null,
        taskId: args.task_id ? String(args.task_id) : undefined,
      })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }

    if (name === 'agent_active_task') {
      const contract = agentRuntime.loadContract(KB_ROOT, String(args.agent_id))
      if (!contract) return { content: [{ type: 'text', text: `Agent not found: ${args.agent_id}` }], isError: true }
      const active = agentRuntime.getActiveTask(KB_ROOT, contract)
      if (!active) return { content: [{ type: 'text', text: 'No active task.' }] }
      return { content: [{ type: 'text', text: JSON.stringify(active, null, 2) }] }
    }

    if (name === 'agent_append_task_state') {
      const contract = agentRuntime.loadContract(KB_ROOT, String(args.agent_id))
      if (!contract) return { content: [{ type: 'text', text: `Agent not found: ${args.agent_id}` }], isError: true }
      const result = agentRuntime.appendTaskState(KB_ROOT, contract, String(args.task_id), String(args.entry))
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }

    if (name === 'agent_abandon_task') {
      const contract = agentRuntime.loadContract(KB_ROOT, String(args.agent_id))
      if (!contract) return { content: [{ type: 'text', text: `Agent not found: ${args.agent_id}` }], isError: true }
      const result = agentRuntime.abandonTask(KB_ROOT, contract, String(args.task_id), args.reason ? String(args.reason) : '')
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }

    if (name === 'agent_dry_run_close_task') {
      const contract = agentRuntime.loadContract(KB_ROOT, String(args.agent_id))
      if (!contract) return { content: [{ type: 'text', text: `Agent not found: ${args.agent_id}` }], isError: true }
      const plan = agentRuntime.dryRunCloseTask(KB_ROOT, contract, args)
      return { content: [{ type: 'text', text: JSON.stringify(plan, null, 2) }] }
    }

        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true }
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
