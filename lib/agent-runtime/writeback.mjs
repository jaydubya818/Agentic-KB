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
import { getActiveTask, activeTaskPath } from './task-lifecycle.mjs'
import { withLock } from './locks.mjs'
import { summarizeHotToLearned } from './hot-learned.mjs'
import { runSofieVaultFanout, planSofieVaultOps, assertVaultWriteAllowed } from './vault-writeback.mjs'

function ensureDir(full) {
  fs.mkdirSync(path.dirname(full), { recursive: true })
}

function readOrInit(full, initFm = {}) {
  if (fs.existsSync(full)) return fs.readFileSync(full, 'utf8')
  return serializeFrontmatter({ ...initFm, created: new Date().toISOString() }, '\n')
}

function hasMeaningfulValue(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export function validateCloseTaskPayload(kbRoot, contract, payload) {
  const policy = contract.close_policy || {}
  const activeTask = getActiveTask(kbRoot, contract)
  const errors = []

  for (const field of policy.required_fields || []) {
    if (!hasMeaningfulValue(payload[field])) {
      errors.push(`Missing required close-task field: ${field}`)
    }
  }

  if ((policy.at_least_one_of || []).length > 0) {
    const hasAny = policy.at_least_one_of.some(field => hasMeaningfulValue(payload[field]))
    if (!hasAny) {
      errors.push(`Close-task requires at least one of: ${(policy.at_least_one_of || []).join(', ')}`)
    }
  }

  if (policy.require_active_task === true && !activeTask) {
    errors.push('Close-task requires an active task for this agent')
  }

  return {
    ok: errors.length === 0,
    errors,
    activeTask,
    policy,
  }
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

  // ── Active task close writes ──────────────────────────────────────────────
  // These are planned as real overwrite operations so they participate in the
  // same rollback path as every other write in closeTask.
  const active = getActiveTask(kbRoot, contract)
  if (active) {
    if (!active.workingMemoryPath) {
      throw new Error(`Active task ${active.taskId} is missing working_memory metadata`)
    }

    const now = new Date().toISOString()
    const wmFull = path.join(kbRoot, active.workingMemoryPath)
    const atRel = activeTaskPath(contract)
    const atFull = path.join(kbRoot, atRel)

    if (!fs.existsSync(wmFull)) {
      throw new Error(`Active task working-memory not found: ${active.workingMemoryPath}`)
    }
    if (!fs.existsSync(atFull)) {
      throw new Error(`Active task pointer not found: ${atRel}`)
    }

    writes.push({
      op: 'overwrite',
      path: active.workingMemoryPath,
      content: updateFrontmatter(fs.readFileSync(wmFull, 'utf8'), {
        status: 'completed',
        completed_at: now,
        updated: now,
      }),
      reason: 'seal active task working-memory',
      taskId: active.taskId,
    })
    writes.push({
      op: 'overwrite',
      path: atRel,
      content: updateFrontmatter(fs.readFileSync(atFull, 'utf8'), {
        status: 'cleared',
        cleared_at: now,
        cleared_reason: 'completed',
      }),
      reason: 'clear active-task pointer',
      taskId: active.taskId,
    })
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
  if (w.op === 'bus-publish') {
    const r = publishBusItem(kbRoot, { ...w.busPayload, skipAudit: true })
    trace.bus_items.push({ channel: w.channel, ...r })
    return { kind: 'delete', path: r.path }
  }

  const full = path.join(kbRoot, w.path)
  ensureDir(full)
  const cls = classFor(w.path)
  const existed = fs.existsSync(full)
  const previousContent = existed ? fs.readFileSync(full, 'utf8') : null

  // Atomic write helper: tmp + rename. Rollback path uses direct write (see rollbackWrites).
  const atomicWrite = (target, data) => {
    const tmp = target + '.tmp-' + process.pid + '-' + Date.now()
    fs.writeFileSync(tmp, data)
    fs.renameSync(tmp, target)
  }

  if (w.op === 'append' || (w.op !== 'overwrite' && isAppendOnly(cls))) {
    const existing = previousContent ?? readOrInit(full, { memory_class: cls, agent: contract.agent_id })
    const sep = `\n\n## ${new Date().toISOString()}\n`
    atomicWrite(full, existing.endsWith('\n')
      ? existing + sep + w.content + '\n'
      : existing + '\n' + sep + w.content + '\n')
  } else if (w.op === 'replace') {
    const existing = fs.existsSync(full)
      ? updateFrontmatter(fs.readFileSync(full, 'utf8'), { updated: new Date().toISOString() })
      : serializeFrontmatter({ memory_class: cls, agent: contract.agent_id, updated: new Date().toISOString() }, '\n')
    const { data } = parseFrontmatter(existing)
    atomicWrite(full, serializeFrontmatter(data, '\n' + w.content + '\n'))
  } else if (w.op === 'create') {
    atomicWrite(full, w.content)
  } else if (w.op === 'overwrite') {
    // Used for sealing working-memory and clearing active-task pointer
    atomicWrite(full, w.content)
  }

  trace.writes_committed.push({ path: w.path, op: w.op })
  return { kind: 'restore', path: w.path, existed, previousContent }
}

function rollbackWrites(kbRoot, rollbacks) {
  const errors = []
  let rolledBack = 0

  for (let i = rollbacks.length - 1; i >= 0; i--) {
    const step = rollbacks[i]
    const full = path.join(kbRoot, step.path)

    try {
      if (step.kind === 'delete') {
        if (fs.existsSync(full)) fs.unlinkSync(full)
      } else if (step.kind === 'restore') {
        if (step.existed) {
          ensureDir(full)
          fs.writeFileSync(full, step.previousContent ?? '')
        } else if (fs.existsSync(full)) {
          fs.unlinkSync(full)
        }
      }
      rolledBack++
    } catch (error) {
      errors.push({ path: step.path, error: error.message })
    }
  }

  return { rolledBack, errors }
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
  // Dry-run short-circuit — compute plan, return it, touch nothing.
  if (payload && payload.dryRun === true) {
    return { ok: true, dryRun: true, ...dryRunCloseTask(kbRoot, contract, payload) }
  }

  const vars = { project: payload.project || null }
  const trace = {
    type: 'close-task',
    agent_id: contract.agent_id,
    contract_hash: contract.contract_hash || null,
    project: payload.project,
    guard_decisions: [],
    writes_committed: [],
    writes_rejected: [],
    bus_items: [],
  }

  const closeValidation = validateCloseTaskPayload(kbRoot, contract, payload)
  if (!closeValidation.ok) {
    trace.writes_rejected = closeValidation.errors.map(message => ({ path: null, reason: message }))
    trace.close_policy_errors = closeValidation.errors
    appendRuntimeTrace(kbRoot, trace)
    appendAudit(kbRoot, {
      op: 'agent-close-task',
      agent_id: contract.agent_id,
      contract_hash: contract.contract_hash || null,
      status: 'rejected',
      reason: 'close-policy',
      errors: closeValidation.errors,
    })
    return { ok: false, error: 'close-policy', rejected: trace.writes_rejected, trace }
  }

  // 1. Plan + guard everything together
  let decisions
  try {
    decisions = _planWrites(kbRoot, contract, vars, payload)
  } catch (error) {
    trace.writes_rejected = [{ path: null, reason: error.message }]
    trace.plan_error = error.message
    appendRuntimeTrace(kbRoot, trace)
    appendAudit(kbRoot, {
      op: 'agent-close-task',
      agent_id: contract.agent_id,
      contract_hash: contract.contract_hash || null,
      status: 'rejected',
      reason: error.message,
    })
    return { ok: false, error: error.message, rejected: trace.writes_rejected, trace }
  }
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
      contract_hash: contract.contract_hash || null,
      status: 'rejected',
      rejected: rejected.length,
    })
    return { ok: false, rejected, trace }
  }

  // 2. Commit under exclusive per-agent lock so concurrent closeTask calls
  // cannot interleave hot-memory or task-log writes.
  const rollbacks = []
  let lockErr = null
  try {
    withLock(kbRoot, `agent:${contract.agent_id}`, () => {
      for (const w of decisions) {
        const rollback = commitWrite(kbRoot, contract, w, trace)
        if (rollback) rollbacks.push(rollback)
      }
    })
  } catch (error) {
    lockErr = error
  }

  if (lockErr) {
    const rollback = rollbackWrites(kbRoot, rollbacks)
    trace.error = lockErr.message
    trace.rollback = rollback
    appendRuntimeTrace(kbRoot, trace)
    appendAudit(kbRoot, {
      op: 'agent-close-task',
      agent_id: contract.agent_id,
      contract_hash: contract.contract_hash || null,
      status: 'rolled_back',
      error: lockErr.message,
      rolled_back: rollback.rolledBack,
      rollback_errors: rollback.errors.length,
    })
    return { ok: false, error: lockErr.message, trace }
  }

  // 3. Audit only after the transaction has fully succeeded.
  for (const write of trace.writes_committed) {
    appendAudit(kbRoot, {
      op: 'agent-write',
      agent_id: contract.agent_id,
      contract_hash: contract.contract_hash || null,
      path: write.path,
      kind: write.op,
    })
  }
  for (const item of trace.bus_items) {
    appendAudit(kbRoot, {
      op: 'bus-publish',
      channel: item.channel,
      id: item.id,
      from: contract.agent_id,
      contract_hash: contract.contract_hash || null,
      project: payload.project || null,
      path: item.path,
    })
  }
  const sealedTask = decisions.find(d => d.reason === 'seal active task working-memory' && d.taskId)
  if (sealedTask) {
    appendAudit(kbRoot, { op: 'agent-seal-task', agent_id: contract.agent_id, contract_hash: contract.contract_hash || null, task_id: sealedTask.taskId })
  }

  // 3.5 Vault fan-out: if contract has vault_writes (Sofie etc.), run her
  // automation rules. Atomic per-vault transaction. Audit each write.
  if (Array.isArray(contract.vault_writes) && contract.vault_writes.length > 0) {
    try {
      const vault = runSofieVaultFanout(kbRoot, contract, payload)
      trace.vault_fanout = vault
      if (!vault.ok) {
        // Vault failure does not undo KB writes (KB is canonical). Logged + audited.
        appendAudit(kbRoot, {
          op: 'vault-fanout-failed',
          agent_id: contract.agent_id,
          error: vault.error,
        })
      }
    } catch (err) {
      trace.vault_fanout = { ok: false, error: err.message }
      appendAudit(kbRoot, { op: 'vault-fanout-error', agent_id: contract.agent_id, error: err.message })
    }
  }

  // 4. Hot→learned: if the close touched hot.md, opportunistically summarize
  // and land a learned snapshot. Never breaks the close.
  const touchedHot = trace.writes_committed.some(w => w.path && w.path.endsWith('/hot.md'))
  if (touchedHot) {
    try {
      const r = summarizeHotToLearned(kbRoot, contract)
      if (r && r.learnedPath) {
        trace.hot_learned = r
        appendAudit(kbRoot, { op: 'hot-learned', agent_id: contract.agent_id, contract_hash: contract.contract_hash || null, path: r.learnedPath })
      }
    } catch (err) {
      trace.hot_learned_error = err && err.message ? err.message : String(err)
    }
  }

  appendRuntimeTrace(kbRoot, trace)
  appendAudit(kbRoot, {
    op: 'agent-close-task',
    agent_id: contract.agent_id,
    contract_hash: contract.contract_hash || null,
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
  const closeValidation = validateCloseTaskPayload(kbRoot, contract, payload)
  if (!closeValidation.ok) {
    return {
      wouldSucceed: false,
      planned: [],
      rejected: closeValidation.errors.map(message => ({ path: null, op: 'policy', allowed: false, reason: message, rule: null })),
      summary: {
        total: 0,
        allowed: 0,
        rejected: closeValidation.errors.length,
        bus_publishes: 0,
        file_writes: 0,
      },
      close_policy_errors: closeValidation.errors,
      error: 'close-policy',
    }
  }
  let decisions
  try {
    decisions = _planWrites(kbRoot, contract, vars, payload)
  } catch (error) {
    return {
      wouldSucceed: false,
      planned: [],
      rejected: [{ path: null, op: 'plan', allowed: false, reason: error.message, rule: null }],
      summary: {
        total: 0,
        allowed: 0,
        rejected: 1,
        bus_publishes: 0,
        file_writes: 0,
      },
      error: error.message,
    }
  }

  const planned = decisions.map(d => ({
    path: d.path,
    op: d.op,
    allowed: d.allowed,
    reason: d.reason,
    rule: d.rule || null,
    ...(d.op === 'bus-publish' ? { channel: d.channel } : {}),
  }))

  // Vault fan-out preview (Sofie et al.)
  let vaultPlanned = []
  if (Array.isArray(contract.vault_writes) && contract.vault_writes.length > 0) {
    const vops = planSofieVaultOps(payload)
    vaultPlanned = vops.map(op => {
      const g = assertVaultWriteAllowed(op.path, contract)
      return { vault_path: op.path, kind: op.kind, allowed: g.allowed, reason: g.reason }
    })
  }

  const rejected = [...planned.filter(d => !d.allowed), ...vaultPlanned.filter(d => !d.allowed)]
  return {
    wouldSucceed: rejected.length === 0,
    planned,
    vault_planned: vaultPlanned,
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
