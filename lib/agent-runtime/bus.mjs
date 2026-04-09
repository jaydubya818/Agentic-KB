// Bus channels: publish, list, read, transition.
import fs from 'fs'
import path from 'path'
import { parseFrontmatter, serializeFrontmatter, updateFrontmatter } from './frontmatter.mjs'
import { nextBusId } from './ids.mjs'
import { transition } from './state-machines.mjs'
import { appendAudit } from './audit.mjs'

export const CHANNELS = ['discovery', 'escalation', 'standards', 'handoffs']

export function publishBusItem(kbRoot, { channel, from, to, project, type, priority, body, promote_candidate, sla_deadline, from_tier }) {
  if (!CHANNELS.includes(channel)) throw new Error(`Unknown bus channel: ${channel}`)
  const id = nextBusId(kbRoot, channel)
  const now = new Date().toISOString()
  const fm = {
    id,
    from,
    from_tier: from_tier || null,
    to: to || null,
    project: project || null,
    type: type || channel,
    priority: priority || 'medium',
    status: 'open',
    promote_candidate: promote_candidate === true,
    sla_deadline: sla_deadline || null,
    created_at: now,
    status_history: [{ from: 'draft', to: 'open', actor: from, at: now }],
    memory_class: 'bus',
    title: `[${channel}] ${(body || '').split('\n')[0].slice(0, 80)}`,
  }
  const content = serializeFrontmatter(fm, '\n' + (body || '') + '\n')
  const relPath = `wiki/system/bus/${channel}/${id}.md`
  const full = path.join(kbRoot, relPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
  appendAudit(kbRoot, { op: 'bus-publish', channel, id, from, to, project, path: relPath })
  return { id, path: relPath }
}

export function readBusItem(kbRoot, channel, id) {
  const relPath = `wiki/system/bus/${channel}/${id}.md`
  const full = path.join(kbRoot, relPath)
  if (!fs.existsSync(full)) return null
  const content = fs.readFileSync(full, 'utf8')
  const { data, content: body } = parseFrontmatter(content)
  return { path: relPath, meta: data, body }
}

export function listBusItems(kbRoot, channel, { status, limit = 100 } = {}) {
  const dir = path.join(kbRoot, 'wiki', 'system', 'bus', channel)
  if (!fs.existsSync(dir)) return []
  const items = []
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md')) continue
    const id = f.replace(/\.md$/, '')
    const item = readBusItem(kbRoot, channel, id)
    if (!item) continue
    if (status && item.meta.status !== status) continue
    items.push(item)
  }
  items.sort((a, b) => String(b.meta.created_at).localeCompare(String(a.meta.created_at)))
  return items.slice(0, limit)
}

export function transitionBusItem(kbRoot, channel, id, toState, actor) {
  const item = readBusItem(kbRoot, channel, id)
  if (!item) throw new Error(`Bus item not found: ${channel}/${id}`)
  const result = transition('bus', item.meta.status, toState, actor)
  const history = Array.isArray(item.meta.status_history) ? item.meta.status_history : []
  history.push(result.status_history_entry)
  const updated = updateFrontmatter(
    fs.readFileSync(path.join(kbRoot, item.path), 'utf8'),
    { status: result.status, status_history: history }
  )
  fs.writeFileSync(path.join(kbRoot, item.path), updated)
  appendAudit(kbRoot, { op: 'bus-transition', channel, id, from: item.meta.status, to: toState, actor })
  return { path: item.path, status: result.status }
}
