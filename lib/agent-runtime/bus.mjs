// Bus channels: publish, list, read, transition.
import fs from 'fs'
import path from 'path'
import { parseFrontmatter, serializeFrontmatter, updateFrontmatter } from './frontmatter.mjs'
import { nextBusId } from './ids.mjs'
import { transition } from './state-machines.mjs'
import { appendAudit } from './audit.mjs'

// V1 channels + V2 governance channels
export const CHANNELS = ['discovery', 'escalation', 'standards', 'handoffs', 'review', 'corrections']

// V2: publish a review item for contradiction resolution or human sign-off
export function publishReviewItem(kbRoot, {
  from,
  candidatePath,
  conflictingPages = [],
  contradictionStatus = 'suspected',
  title,
  body,
  confidence,
  proposedTargetPath = null,
  scoreResult = null,
}) {
  const id = nextBusId(kbRoot, 'review')
  const now = new Date().toISOString()
  const fm = {
    id,
    channel: 'review',
    from,
    candidate_path: candidatePath,
    conflicting_pages: conflictingPages,
    contradiction_status: contradictionStatus,
    proposed_target_path: proposedTargetPath,
    confidence: confidence || 'medium',
    promotion_score: scoreResult?.score ?? null,
    promotion_decision_pre_review: scoreResult?.decision ?? null,
    status: 'open',
    created_at: now,
    resolved_at: null,
    resolved_by: null,
    resolution: null,
    memory_class: 'bus',
    title: title || `[review] ${(body || '').split('\n')[0].slice(0, 80)}`,
  }
  const content = serializeFrontmatter(fm, '\n' + (body || '') + '\n')
  const relPath = `wiki/system/bus/review/${id}.md`
  const full = path.join(kbRoot, relPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
  appendAudit(kbRoot, { op: 'bus-publish', channel: 'review', id, from, path: relPath })
  return { id, path: relPath }
}

export function publishBusItem(kbRoot, { channel, from, to, project, type, priority, body, promote_candidate, sla_deadline, from_tier, title, confidence, related_sources, proposed_target_path, contradiction_status, evidence_count }) {
  if (!CHANNELS.includes(channel)) throw new Error(`Unknown bus channel: ${channel}`)
  const id = nextBusId(kbRoot, channel)
  const now = new Date().toISOString()
  const fm = {
    id,
    channel,
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
    // V2 fields
    title: title || `[${channel}] ${(body || '').split('\n')[0].slice(0, 80)}`,
    confidence: confidence || null,
    related_sources: related_sources || [],
    proposed_target_path: proposed_target_path || null,
    contradiction_status: contradiction_status || 'none',
    evidence_count: evidence_count || 0,
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
