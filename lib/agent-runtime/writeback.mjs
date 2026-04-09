// Transactional writeback: close-task validates all writes, then commits, or rejects all.
import fs from 'fs'
import path from 'path'
import { assertWriteAllowed } from './paths.mjs'
import { parseFrontmatter, serializeFrontmatter, updateFrontmatter } from './frontmatter.mjs'
import { classFor, isAppendOnly } from './memory-classes.mjs'
import { appendAudit, appendRuntimeTrace } from './audit.mjs'
import { publishBusItem } from './bus.mjs'
import { timestamp } from './ids.mjs'

function ensureDir(full) {
  fs.mkdirSync(path.dirname(full), { recursive: true })
}

function readOrInit(full, initFm = {}) {
  if (fs.existsSync(full)) return fs.readFileSync(full, 'utf8')
  return serializeFrontmatter({ ...initFm, created: new Date().toISOString() }, '\n')
}

// Plan every intended write first; if any fails the guard, reject the whole close.
function planWrites(contract, vars, payload) {
  const writes = []
  const agentId = contract.agent_id
  const tier = contract.tier
  const base = `wiki/agents/${tier}s/${agentId}`

  if (payload.taskLogEntry) {
    writes.push({ op: 'append', path: `${base}/task-log.md`, content: payload.taskLogEntry, reason: 'task-log append' })
  }
  if (payload.hotUpdate) {
    writes.push({ op: 'replace', path: `${base}/hot.md`, content: payload.hotUpdate, reason: 'hot update' })
  }
  if (payload.gotcha) {
    writes.push({ op: 'append', path: `${base}/gotchas.md`, content: payload.gotcha, reason: 'gotcha append' })
  }
  if (Array.isArray(payload.rewrites)) {
    for (const rw of payload.rewrites) {
      const ts = timestamp()
      const rel = `${base}/rewrites/${rw.type}/${rw.project}-${ts}.md`
      writes.push({
        op: 'create',
        path: rel,
        content: serializeFrontmatter({
          memory_class: 'rewrite',
          rewrite_type: rw.type,
          project: rw.project,
          author: agentId,
          status: 'draft',
          created: new Date().toISOString(),
        }, '\n' + rw.body + '\n'),
        reason: 'rewrite create',
      })
    }
  }

  // Validate each write against guard
  const decisions = []
  const guardVars = { project: vars.project, domain: contract.domain, agent: agentId }
  for (const w of writes) {
    const d = assertWriteAllowed(w.path, contract, guardVars)
    decisions.push({ ...w, ...d })
  }
  return decisions
}

export function closeTask(kbRoot, contract, payload) {
  const vars = { project: payload.project || null }
  const trace = {
    type: 'close-task',
    agent_id: contract.agent_id,
    project: payload.project,
    guard_decisions: [],
    writes_committed: [],
    writes_rejected: [],
    bus_items: [],
  }

  // 1. Plan writes + guard
  const decisions = planWrites(contract, vars, payload)
  trace.guard_decisions = decisions.map(d => ({ path: d.path, op: d.op, allowed: d.allowed, reason: d.reason, rule: d.rule }))

  const rejected = decisions.filter(d => !d.allowed)
  if (rejected.length > 0) {
    trace.writes_rejected = rejected.map(r => ({ path: r.path, reason: r.reason }))
    appendRuntimeTrace(kbRoot, trace)
    appendAudit(kbRoot, { op: 'agent-close-task', agent_id: contract.agent_id, status: 'rejected', rejected: rejected.length })
    return { ok: false, rejected, trace }
  }

  // 2. Commit writes
  for (const w of decisions) {
    const full = path.join(kbRoot, w.path)
    ensureDir(full)
    const cls = classFor(w.path)
    if (w.op === 'append' || isAppendOnly(cls)) {
      const existing = readOrInit(full, { memory_class: cls, agent: contract.agent_id })
      const sep = `\n\n## ${new Date().toISOString()}\n`
      fs.writeFileSync(full, existing.endsWith('\n') ? existing + sep + w.content + '\n' : existing + '\n' + sep + w.content + '\n')
    } else if (w.op === 'replace') {
      const existing = fs.existsSync(full)
        ? updateFrontmatter(fs.readFileSync(full, 'utf8'), { updated: new Date().toISOString() })
        : serializeFrontmatter({ memory_class: cls, agent: contract.agent_id, updated: new Date().toISOString() }, '\n')
      const { data } = parseFrontmatter(existing)
      fs.writeFileSync(full, serializeFrontmatter(data, '\n' + w.content + '\n'))
    } else if (w.op === 'create') {
      fs.writeFileSync(full, w.content)
    }
    trace.writes_committed.push({ path: w.path, op: w.op })
    appendAudit(kbRoot, { op: 'agent-write', agent_id: contract.agent_id, path: w.path, kind: w.op })
  }

  // 3. Publish bus items (these have their own guard via allowed_writes on wiki/system/bus/**)
  for (const d of payload.discoveries || []) {
    // Guard: worker must be allowed to write to bus/discovery
    const busPath = `wiki/system/bus/discovery/placeholder.md`
    const chk = assertWriteAllowed(busPath, contract, vars)
    if (!chk.allowed) {
      trace.writes_rejected.push({ path: busPath, reason: `discovery publish blocked: ${chk.reason}` })
      continue
    }
    const r = publishBusItem(kbRoot, {
      channel: 'discovery',
      from: contract.agent_id,
      from_tier: contract.tier,
      to: d.to || null,
      project: payload.project,
      type: 'discovery',
      priority: d.priority || 'medium',
      body: d.body || d.summary || '',
      promote_candidate: d.promote_candidate === true,
    })
    trace.bus_items.push({ channel: 'discovery', ...r })
  }
  for (const e of payload.escalations || []) {
    const busPath = `wiki/system/bus/escalation/placeholder.md`
    const chk = assertWriteAllowed(busPath, contract, vars)
    if (!chk.allowed) {
      trace.writes_rejected.push({ path: busPath, reason: `escalation publish blocked: ${chk.reason}` })
      continue
    }
    const r = publishBusItem(kbRoot, {
      channel: 'escalation',
      from: contract.agent_id,
      from_tier: contract.tier,
      to: e.to || null,
      project: payload.project,
      type: 'escalation',
      priority: e.priority || 'high',
      body: e.body || e.summary || '',
      sla_deadline: e.sla_deadline || null,
    })
    trace.bus_items.push({ channel: 'escalation', ...r })
  }

  appendRuntimeTrace(kbRoot, trace)
  appendAudit(kbRoot, { op: 'agent-close-task', agent_id: contract.agent_id, status: 'ok', committed: trace.writes_committed.length, bus: trace.bus_items.length })
  return { ok: true, trace }
}
