// Repo-scoped bus channels. Mirrors agent-runtime/bus.mjs.
import fs from 'fs'
import path from 'path'
import { parseFrontmatter, serializeFrontmatter, updateFrontmatter } from '../agent-runtime/frontmatter.mjs'
import { timestamp, todayStamp } from '../agent-runtime/ids.mjs'
import { transition } from '../agent-runtime/state-machines.mjs'
import { appendAudit } from '../agent-runtime/audit.mjs'
import { repoBusRoot } from './paths.mjs'

export const REPO_CHANNELS = ['discovery', 'escalation', 'standards', 'handoffs']

function ensureDir(full) {
  fs.mkdirSync(path.dirname(full), { recursive: true })
}

function nextRepoId(kbRoot, repoName, channel) {
  const day = todayStamp()
  const dir = path.join(kbRoot, repoBusRoot(kbRoot, repoName, channel))
  let max = 0
  try {
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir)) {
        const m = f.match(new RegExp(`^${channel}-${day}-(\\d{3})\\.md$`))
        if (m) max = Math.max(max, parseInt(m[1], 10))
      }
    }
  } catch {}
  const n = String(max + 1).padStart(3, '0')
  return `${channel}-${day}-${n}`
}

export function publishRepoBusItem(kbRoot, repoName, { channel, from, from_tier, to, project, type, priority, body, promote_candidate, sla_deadline, source_task, source_rewrite, tags }) {
  if (!REPO_CHANNELS.includes(channel)) throw new Error(`Unknown repo bus channel: ${channel}`)

  const id = nextRepoId(kbRoot, repoName, channel)
  const now = new Date().toISOString()
  const fm = {
    id,
    repo_name: repoName,
    from,
    from_tier: from_tier || null,
    to: to || null,
    project: project || null,
    type: type || channel,
    priority: priority || 'medium',
    status: 'open',
    promote_candidate: promote_candidate === true,
    sla_deadline: sla_deadline || null,
    source_task: source_task || null,
    source_rewrite: source_rewrite || null,
    tags: tags || [],
    created_at: now,
    status_history: [{ from: 'draft', to: 'open', actor: from, at: now }],
    memory_class: 'bus',
    title: `[${channel}] ${(body || '').split('\n')[0].slice(0, 80)}`,
  }

  const content = serializeFrontmatter(fm, '\n' + (body || '') + '\n')
  const relPath = `${repoBusRoot(kbRoot, repoName, channel)}/${id}.md`
  const full = path.join(kbRoot, relPath)
  ensureDir(full)
  fs.writeFileSync(full, content)
  appendAudit(kbRoot, { op: 'repo-bus-publish', repo: repoName, channel, id, from, to, project, path: relPath })
  return { id, path: relPath }
}

export function readRepoBusItem(kbRoot, repoName, channel, id) {
  const relPath = `${repoBusRoot(kbRoot, repoName, channel)}/${id}.md`
  const full = path.join(kbRoot, relPath)
  if (!fs.existsSync(full)) return null
  const content = fs.readFileSync(full, 'utf8')
  const { data, content: body } = parseFrontmatter(content)
  return { path: relPath, meta: data, body }
}

export function listRepoBusItems(kbRoot, repoName, channel, { status, limit = 100 } = {}) {
  const dir = path.join(kbRoot, repoBusRoot(kbRoot, repoName, channel))
  if (!fs.existsSync(dir)) return []
  const items = []
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md')) continue
    const id = f.replace(/\.md$/, '')
    const item = readRepoBusItem(kbRoot, repoName, channel, id)
    if (!item) continue
    if (status && item.meta.status !== status) continue
    items.push(item)
  }
  items.sort((a, b) => String(b.meta.created_at).localeCompare(String(a.meta.created_at)))
  return items.slice(0, limit)
}

export function transitionRepoBusItem(kbRoot, repoName, channel, id, toState, actor) {
  const item = readRepoBusItem(kbRoot, repoName, channel, id)
  if (!item) throw new Error(`Repo bus item not found: ${repoName}/${channel}/${id}`)
  const result = transition('bus', item.meta.status, toState, actor)
  const history = Array.isArray(item.meta.status_history) ? item.meta.status_history : []
  history.push(result.status_history_entry)
  const updated = updateFrontmatter(
    fs.readFileSync(path.join(kbRoot, item.path), 'utf8'),
    { status: result.status, status_history: history }
  )
  fs.writeFileSync(path.join(kbRoot, item.path), updated)
  appendAudit(kbRoot, { op: 'repo-bus-transition', repo: repoName, channel, id, from: item.meta.status, to: toState, actor })
  return { path: item.path, status: result.status }
}
