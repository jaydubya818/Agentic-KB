/**
 * /api/ingest/webhook — External doc ingestion endpoint
 *
 * Allows external systems to push documents into raw/ without the UI.
 * Supports GitHub, Slack, Notion, Jira, and generic JSON payloads.
 *
 * Auth: Bearer token in Authorization header (WEBHOOK_SECRET env var)
 *
 * Generic usage:
 *   POST /api/ingest/webhook
 *   Authorization: Bearer <WEBHOOK_SECRET>
 *   { "title": "...", "content": "...", "source": "notion", "tags": ["retro"] }
 *
 * GitHub usage (set as webhook URL in repo settings):
 *   Automatically ingests: issues (closed), PRs (merged), push commits to docs/
 */
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { appendAuditLog } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ''

// ── Auth ──────────────────────────────────────────────────────────────────────

function isAuthorized(request: NextRequest): boolean {
  if (!WEBHOOK_SECRET) return true  // no secret = open (dev only)
  const auth = request.headers.get('authorization') || ''
  return auth === `Bearer ${WEBHOOK_SECRET}`
}

// ── Adapters ─────────────────────────────────────────────────────────────────

interface NormalizedDoc {
  title: string
  content: string
  source: string
  tags: string[]
  url?: string
}

function adaptGeneric(body: Record<string, unknown>): NormalizedDoc | null {
  const title = String(body.title || '').trim()
  const content = String(body.content || '').trim()
  if (!title || !content) return null
  return {
    title,
    content,
    source: String(body.source || 'webhook'),
    tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    url: body.url ? String(body.url) : undefined,
  }
}

function adaptGitHubIssue(body: Record<string, unknown>): NormalizedDoc | null {
  const action = body.action as string
  const issue = body.issue as Record<string, unknown> | undefined
  if (!issue || action !== 'closed') return null

  const title = String(issue.title || '')
  const bodyText = String(issue.body || '(no description)')
  const labels = Array.isArray(issue.labels)
    ? (issue.labels as Array<{ name: string }>).map(l => l.name)
    : []
  const url = String(issue.html_url || '')
  const user = (issue.user as { login?: string })?.login || 'unknown'

  return {
    title: `Issue: ${title}`,
    content: `# ${title}\n\n**Closed by:** ${user}  \n**URL:** ${url}\n\n${bodyText}`,
    source: 'github-issue',
    tags: ['github', 'issue', ...labels],
    url,
  }
}

function adaptGitHubPR(body: Record<string, unknown>): NormalizedDoc | null {
  const action = body.action as string
  const pr = body.pull_request as Record<string, unknown> | undefined
  if (!pr) return null
  const merged = pr.merged as boolean | undefined
  if (action !== 'closed' || !merged) return null

  const title = String(pr.title || '')
  const bodyText = String(pr.body || '(no description)')
  const url = String(pr.html_url || '')
  const user = (pr.user as { login?: string })?.login || 'unknown'
  const base = (pr.base as { ref?: string })?.ref || 'main'

  return {
    title: `PR: ${title}`,
    content: `# ${title}\n\n**Merged by:** ${user}  \n**Base:** ${base}  \n**URL:** ${url}\n\n${bodyText}`,
    source: 'github-pr',
    tags: ['github', 'pr', 'merged'],
    url,
  }
}

function adaptSlack(body: Record<string, unknown>): NormalizedDoc | null {
  // Supports Slack slash command payload or Events API
  const text = String(body.text || body.message || '').trim()
  if (!text) return null

  const user = String(body.user_name || body.user_id || 'slack-user')
  const channel = String(body.channel_name || body.channel || 'general')

  return {
    title: `Slack: #${channel} — ${new Date().toISOString().slice(0, 10)}`,
    content: `# Slack Thread from #${channel}\n\n**User:** ${user}  \n**Date:** ${new Date().toISOString().slice(0, 10)}\n\n${text}`,
    source: 'slack',
    tags: ['slack', channel],
  }
}

function detectAndAdapt(
  body: Record<string, unknown>,
  githubEvent: string | null
): NormalizedDoc | null {
  if (githubEvent === 'issues') return adaptGitHubIssue(body)
  if (githubEvent === 'pull_request') return adaptGitHubPR(body)
  if (body.token || body.channel_id) return adaptSlack(body)  // Slack slash command
  return adaptGeneric(body)
}

// ── File writing ──────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function writeRawDoc(vaultRoot: string, doc: NormalizedDoc): string {
  const rawDir = path.join(vaultRoot, 'raw', 'webhooks')
  fs.mkdirSync(rawDir, { recursive: true })

  const date = new Date().toISOString().slice(0, 10)
  const slug = slugify(doc.title)
  const filename = `${date}-${slug}.md`
  const filePath = path.join(rawDir, filename)

  const frontmatter = [
    '---',
    `title: "${doc.title.replace(/"/g, "'")}"`,
    `source: ${doc.source}`,
    `ingested: ${new Date().toISOString()}`,
    doc.url ? `url: ${doc.url}` : null,
    doc.tags.length ? `tags: [${doc.tags.join(', ')}]` : null,
    '---',
    '',
  ].filter(l => l !== null).join('\n')

  fs.writeFileSync(filePath, frontmatter + doc.content, 'utf8')
  return path.relative(vaultRoot, filePath)
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const githubEvent = request.headers.get('x-github-event')
  let body: Record<string, unknown>

  try {
    body = await request.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const doc = detectAndAdapt(body, githubEvent)
  if (!doc) {
    // Not a supported event type — acknowledge without error (GitHub sends many event types)
    return NextResponse.json({ ok: true, skipped: true, reason: 'unsupported event type' })
  }

  const vaultRoot = DEFAULT_KB_ROOT
  const relPath = writeRawDoc(vaultRoot, doc)

  appendAuditLog({
    op: 'webhook',
    source: doc.source,
    title: doc.title,
    file: relPath,
    githubEvent: githubEvent || undefined,
  })

  return NextResponse.json({
    ok: true,
    file: relPath,
    title: doc.title,
    source: doc.source,
    message: `Ingested into ${relPath}. Run /api/compile to compile into wiki.`,
  })
}
