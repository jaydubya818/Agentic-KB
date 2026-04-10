// Transactional writeback: plan ALL writes (files + bus publications) together,
// guard the full set, then commit atomically — or reject everything.
//
// Phase 3 fix: bus publications are now first-class write ops planned and
// guarded upfront alongside file writes, so a failed guard on a bus item
// prevents any file writes from landing (and vice versa).
import fs from 'fs'
import path from 'path'
import { assertWriteAllowed } from './paths.mjs'
import { parseFrontmatter, serializeFrontmatter, updateFrontmatter } from './frontmatter.mjs'
import { classFor, isAppendOnly } from './memory-classes.mjs'
import { appendAudit, appendRuntimeTrace } from './audit.mjs'
import { publishBusItem } from './bus.mjs'
import { timestamp } from './ids.mjs'
import { getActiveTask, activeTaskPath, workingMemoryPath } from './task-lifecycle.mjs'

function ensureDir(full) {
  fs.mkdirSync(path.dirname(full), { recursive: true })
}

function readOrInit(full, initFm = {}) {
  if (fs.existsSync(full)) return fs.readFileSync(full, 'utf8')
  return serializeFrontmatter({ ...initFm, created: new Date().toISOString() }, '\n')
}

// ─── Unified write planner ────────────────────────────────────────────────────
// Returns a flat list of write ops, each with: op, path, content|busPayload, reason.
// Every op is run through assertWriteAllowed before any commit happens.

export function _planWrites(kbRoot, contract, vars, payload) {
  const writes = []
  const agentId = contract.agent_id
  const tier = contract.tier
  const base = `wiki/agents/${tier}s/${agentId}`

  // ── Standard file writes ──────────────────────────────────────────────────
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

  // ── Active task close sentinels ───────────────────────────────────────────
  // If there's an active task, add sentinel guard entries so the overall plan
  // fails fast if the agent can't write to those paths. Actual sealing (reading
  // the file and updating frontmatter) happens post-commit in closeTask to
  // avoid any pre-computation staleness issues.
  const active = getActiveTask(kbRoot, contract)
  if (active) {
    writes.push({ op: 'sentinel', path: active.workingMemoryPath, reason: 'seal active task working-memory (sentinel)' })
    writes.push({ op: 'sentinel', path: activeTaskPath(contract), reason: 'clear active-task pointer (sentinel)' })
  }

  // ── Bus publications — planned as first-class write ops ───────────────────
  // Guard path: we check the channel directory as a sentinel. The actual file
  // path will be determined at commit time by publishBusItem.
  for (const d of payload.discoveries || []) {
    writes.push({
      op: 'bus-publish',
      path: `wiki/system/bus/discovery/placeholder.md`,
      channel: 'discovery',
      busPayload: {
        channel: 'discovery',
        from: agentId,
        from_tier: tier,
        to: d.to || null,
        project: payload.project,
        type: 'discovery',
        priority: d.priority || 'medium',
        body: d.body || d.summary || '',
        promote_candidate: d.promote_candidate === true,
      },
      reason: 'discovery publish',
    })
  }
  for (const e of payload.escalations || []) {
    writes.push({
      op: 'bus-publish',
      path: `wiki/system/bus/escalation/placeholder.md`,
      channel: 'escalation',
      busPayload: {
        channel: 'escalation',
        from: agentId,
        from_tier: tier,
        to: e.to || null,
        project: payload.project,
        type: 'escalation',
        priority: e.priority || 'high',
        body: e.body || e.summary || '',
        sla_deadline: e.sla_deadline || null,
      },
      reason: 'escalation publish',
    })
  }

  // ── Guard all writes ──────────────────────────────────────────────────────
  const guardVars = { project: vars.project, domain: contract.domain, agent: agentId }
  const decisions = []
  for (const w of writes) {
    const d = assertWriteAllowed(w.path, contract, guardVars)
    decisions.push({ ...w, ...d })
  }

  return decisions
}

// ─── Commit a single write op ─────────────────────────────────────────────────

function commitWrite(kbRoot, contract, w, trace) {
  // Sentinels are guard-only; actual write happens in post-commit seal
  if (w.op === 'sentinel') return

  if (w.op === 'bus-publish') {
    const r = publishBusItem(kbRoot, w.busPayload)
    trace.bus_items.push({ channel: w.channel, ...r })
    return
  }

  const full = path.join(kbRoot, w.path)
  ensureDir(full)
  const cls = classFor(w.path)

  if (w.op === 'append' || isAppendOnly(cls)) {
    const existing = readOrInit(full, { memory_class: cls, agent: contract.agent_id })
    const sep = `\n\n## ${new Date().toISOString()}\n`
    fs.writeFileSync(full, existing.endsWith('\n')
      ? existing + sep + w.content + '\n'
      : existing + '\n' + sep + w.content + '\n')
  } else if (w.op === 'replace') {
    const existing = fs.existsSync(full)
      ? updateFrontmatter(fs.readFileSync(full, 'utf8'), { updated: new Date().toISOString() })
      : serializeFrontmatter({ memory_class: cls, agent: contract.agent_id, updated: new Date().toISOString() }, '\n')
    const { data } = parseFrontmatter(existing)
    fs.writeFileSync(full, serializeFrontmatter(data, '\n' + w.content + '\n'))
  } else if (w.op === 'create') {
    fs.writeFileSync(full, w.content)
  } else if (w.op === 'overwrite') {
    // Used for sealing working-memory and clearing active-task pointer
    fs.writeFileSync(full, w.content)
  }

  trace.writes_committed.push({ path: w.path, op: w.op })
  appendAudit(kbRoot, { op: 'agent-write', agent_id: contract.agent_id, path: w.path, kind: w.op })
}

// ─── closeTask ────────────────────────────────────────────────────────────────

/**
 * Commit a task's outputs atomically.
 *
 * The full write plan — file writes, active-task close, and bus publications —
 * is guarded first. Any rejected item aborts the entire close; nothing lands.
 *
 * @returns {{ ok: boolean, trace: object, rejected?: object[] }}
 */
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

  // 1. Plan + guard everything together
  const decisions = _planWrites(kbRoot, contract, vars, payload)
  trace.guard_decisions = decisions.map(d => ({
    path: d.path,
    op: d.op,
    allowed: d.allowed,
    reason: d.reason,
    rule: d.rule || null,
  }))

  const rejected = decisions.filter(d => !d.allowed)
  if (rejected.length > 0) {
    trace.writes_rejected = rejected.map(r => ({ path: r.path, reason: r.reason }))
    appendRuntimeTrace(kbRoot, trace)
    appendAudit(kbRoot, {
      op: 'agent-close-task',
      agent_id: contract.agent_id,
      status: 'rejected',
      rejected: rejected.length,
    })
    return { ok: false, rejected, trace }
  }

  // 2. Commit all (files + bus) in one pass — either all land or the process dies
  for (const w of decisions) {
    commitWrite(kbRoot, contract, w, trace)
  }

  // 3. Post-commit: seal active task lifecycle.
  // Done after the main commit so we read the file fresh at seal time.
  const activeForSeal = getActiveTask(kbRoot, contract)
  if (activeForSeal) {
    const now = new Date().toISOString()
    const wmFull = path.join(kbRoot, activeForSeal.workingMemoryPath)
    const atFull = path.join(kbRoot, activeTaskPath(contract))
    if (fs.existsSync(wmFull)) {
      const wm = fs.readFileSync(wmFull, 'utf8')
      fs.writeFileSync(wmFull, updateFrontmatter(wm, { status: 'completed', completed_at: now, updated: now }))
      trace.writes_committed.push({ path: activeForSeal.workingMemoryPath, op: 'seal-working-memory' })
    }
    if (fs.existsSync(atFull)) {
      const at = fs.readFileSync(atFull, 'utf8')
      fs.writeFileSync(atFull, updateFrontmatter(at, { status: 'cleared', cleared_at: now, cleared_reason: 'completed' }))
      trace.writes_committed.push({ path: activeTaskPath(contract), op: 'clear-active-task' })
    }
    appendAudit(kbRoot, { op: 'agent-seal-task', agent_id: contract.agent_id, task_id: activeForSeal.taskId })
  }

  appendRuntimeTrace(kbRoot, trace)
  appendAudit(kbRoot, {
    op: 'agent-close-task',
    agent_id: contract.agent_id,
    status: 'ok',
    committed: trace.writes_committed.length,
    bus: trace.bus_items.length,
  })
  return { ok: true, trace }
}

// ─── dryRunCloseTask ──────────────────────────────────────────────────────────

/**
 * Return the full write plan for a closeTask call without executing anything.
 * Useful for previewing what a close will do before committing.
 *
 * @returns {{ planned: object[], rejected: object[], wouldSucceed: boolean }}
 */
export function dryRunCloseTask(kbRoot, contract, payload) {
  const vars = { project: payload.project || null }
  const decisions = _planWrites(kbRoot, contract, vars, payload)

  const planned = decisions.map(d => ({
    path: d.path,
    op: d.op,
    allowed: d.allowed,
    reason: d.reason,
    rule: d.rule || null,
    ...(d.op === 'bus-publish' ? { channel: d.channel } : {}),
  }))

  const rejected = planned.filter(d => !d.allowed)
  return {
    wouldSucceed: rejected.length === 0,
    planned,
    rejected,
    summary: {
      total: planned.length,
      allowed: planned.length - rejected.length,
      rejected: rejected.length,
      bus_publishes: planned.filter(p => p.op === 'bus-publish').length,
      file_writes: planned.filter(p => p.op !== 'bus-publish').length,
    },
  }
}
