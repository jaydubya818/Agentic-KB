// Repo-scoped agent writeback. Transactional close-task for repos.
import fs from 'fs'
import path from 'path'
import { assertWriteAllowed } from '../agent-runtime/paths.mjs'
import { assertNotImportedDoc, repoWikiRoot, repoTasksRoot, repoRewritesRoot } from './paths.mjs'
import { parseFrontmatter, serializeFrontmatter, updateFrontmatter } from '../agent-runtime/frontmatter.mjs'
import { classFor, isAppendOnly } from '../agent-runtime/memory-classes.mjs'
import { appendAudit, appendRuntimeTrace } from '../agent-runtime/audit.mjs'
import { timestamp, todayStamp } from '../agent-runtime/ids.mjs'
import { publishRepoBusItem } from './bus.mjs'

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

function assertRepoScopedWriteAllowed(relPath, contract, repoName) {
  const normalized = relPath.replace(/\\/g, '/')
  const repoRoot = `wiki/repos/${repoName}`
  const agentMemoryRoot = `${repoRoot}/agent-memory/${contract.tier}/${contract.agent_id}/`

  if (normalized === `${repoRoot}/progress.md`) {
    return { allowed: true, reason: 'repo-scoped progress write', rule: `${repoRoot}/progress.md` }
  }
  if (normalized.startsWith(agentMemoryRoot)) {
    return { allowed: true, reason: 'repo-scoped agent memory write', rule: `${agentMemoryRoot}**` }
  }
  if (normalized.startsWith(`${repoRoot}/rewrites/`)) {
    return { allowed: true, reason: 'repo-scoped rewrite write', rule: `${repoRoot}/rewrites/**` }
  }
  if (normalized.startsWith(`${repoRoot}/bus/`)) {
    return { allowed: true, reason: 'repo-scoped bus write', rule: `${repoRoot}/bus/**` }
  }

  return { allowed: false, reason: 'not in repo-scoped allowed writes', rule: null }
}

export function validateRepoCloseTaskPayload(contract, payload) {
  const policy = contract.close_policy || {}
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

  return {
    ok: errors.length === 0,
    errors,
    policy,
  }
}

// Plan writes for repo context
function planRepoWrites(contract, vars, payload, repoName) {
  const writes = []
  const base = repoWikiRoot(repoName)

  if (payload.taskLogEntry) {
    const taskLog = `${base}/progress.md`
    writes.push({ op: 'append', path: taskLog, content: payload.taskLogEntry, reason: 'repo task-log append' })
  }

  if (payload.hotUpdate) {
    const hot = `${base}/agent-memory/{{tier}}/{{agent}}/hot.md`
      .replace('{{tier}}', contract.tier)
      .replace('{{agent}}', contract.agent_id)
    writes.push({ op: 'replace', path: hot, content: payload.hotUpdate, reason: 'repo hot update' })
  }

  if (payload.gotcha) {
    const gotchas = `${base}/agent-memory/{{tier}}/{{agent}}/gotchas.md`
      .replace('{{tier}}', contract.tier)
      .replace('{{agent}}', contract.agent_id)
    writes.push({ op: 'append', path: gotchas, content: payload.gotcha, reason: 'repo gotcha append' })
  }

  if (Array.isArray(payload.rewrites)) {
    for (const rw of payload.rewrites) {
      const ts = timestamp()
      const rel = `${repoRewritesRoot(repoName, rw.type)}/${rw.project}-${ts}.md`
      writes.push({
        op: 'create',
        path: rel,
        content: serializeFrontmatter({
          memory_class: 'rewrite',
          rewrite_type: rw.type,
          project: rw.project,
          author: contract.agent_id,
          status: 'draft',
          created: new Date().toISOString(),
        }, '\n' + rw.body + '\n'),
        reason: 'repo rewrite create',
      })
    }
  }

  for (const d of payload.discoveries || []) {
    writes.push({
      op: 'bus-publish',
      path: `${base}/bus/discovery/placeholder.md`,
      channel: 'discovery',
      busPayload: {
        channel: 'discovery',
        from: contract.agent_id,
        from_tier: contract.tier,
        to: d.to || null,
        project: payload.project,
        type: 'discovery',
        priority: d.priority || 'medium',
        body: d.body || d.summary || '',
        promote_candidate: d.promote_candidate === true,
      },
      reason: 'repo discovery publish',
    })
  }

  for (const e of payload.escalations || []) {
    writes.push({
      op: 'bus-publish',
      path: `${base}/bus/escalation/placeholder.md`,
      channel: 'escalation',
      busPayload: {
        channel: 'escalation',
        from: contract.agent_id,
        from_tier: contract.tier,
        to: e.to || null,
        project: payload.project,
        type: 'escalation',
        priority: e.priority || 'high',
        body: e.body || e.summary || '',
        sla_deadline: e.sla_deadline || null,
      },
      reason: 'repo escalation publish',
    })
  }

  // Validate each write against guard
  const decisions = []
  const guardVars = { project: vars.project, domain: contract.domain, agent: contract.agent_id, repo: repoName }
  for (const w of writes) {
    assertNotImportedDoc(w.path) // Ensure we're not writing to repo-docs
    const globalDecision = assertWriteAllowed(w.path, contract, guardVars)
    const d = globalDecision.allowed || globalDecision.reason !== 'not in allowed_writes'
      ? globalDecision
      : assertRepoScopedWriteAllowed(w.path, contract, repoName)
    decisions.push({ ...w, ...d })
  }
  return decisions
}

function commitRepoWrite(kbRoot, repoName, contract, write, trace) {
  if (write.op === 'bus-publish') {
    const result = publishRepoBusItem(kbRoot, repoName, { ...write.busPayload, skipAudit: true })
    trace.bus_items.push({ repo: repoName, channel: write.channel, ...result })
    return { kind: 'delete', path: result.path }
  }

  const full = path.join(kbRoot, write.path)
  ensureDir(full)
  const cls = classFor(write.path)
  const existed = fs.existsSync(full)
  const previousContent = existed ? fs.readFileSync(full, 'utf8') : null

  if (write.op === 'append' || (write.op !== 'replace' && isAppendOnly(cls))) {
    const existing = previousContent ?? readOrInit(full, { memory_class: cls, agent: contract.agent_id })
    const sep = `\n\n## ${new Date().toISOString()}\n`
    fs.writeFileSync(full, existing.endsWith('\n') ? existing + sep + write.content + '\n' : existing + '\n' + sep + write.content + '\n')
  } else if (write.op === 'replace') {
    const existing = existed
      ? updateFrontmatter(previousContent, { updated: new Date().toISOString() })
      : serializeFrontmatter({ memory_class: cls, agent: contract.agent_id, updated: new Date().toISOString() }, '\n')
    const { data } = parseFrontmatter(existing)
    fs.writeFileSync(full, serializeFrontmatter(data, '\n' + write.content + '\n'))
  } else if (write.op === 'create') {
    fs.writeFileSync(full, write.content)
  }

  trace.writes_committed.push({ path: write.path, op: write.op })
  return { kind: 'restore', path: write.path, existed, previousContent }
}

function rollbackRepoWrites(kbRoot, rollbacks) {
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

export function closeRepoTask(kbRoot, repoName, contract, payload) {
  const vars = { project: payload.project || null }
  const trace = {
    type: 'close-task-repo',
    agent_id: contract.agent_id,
    repo_name: repoName,
    project: payload.project,
    guard_decisions: [],
    writes_committed: [],
    writes_rejected: [],
    bus_items: [],
  }

  const closeValidation = validateRepoCloseTaskPayload(contract, payload)
  if (!closeValidation.ok) {
    trace.writes_rejected = closeValidation.errors.map(message => ({ path: null, reason: message }))
    trace.close_policy_errors = closeValidation.errors
    appendRuntimeTrace(kbRoot, trace)
    appendAudit(kbRoot, {
      op: 'repo-close-task',
      agent_id: contract.agent_id,
      repo: repoName,
      status: 'rejected',
      reason: 'close-policy',
      errors: closeValidation.errors,
    })
    return { ok: false, error: 'close-policy', rejected: trace.writes_rejected, trace, committed: false }
  }

  let decisions
  try {
    decisions = planRepoWrites(contract, vars, payload, repoName)
  } catch (error) {
    trace.writes_rejected = [{ path: null, reason: error.message }]
    trace.plan_error = error.message
    appendRuntimeTrace(kbRoot, trace)
    appendAudit(kbRoot, { op: 'repo-close-task', agent_id: contract.agent_id, repo: repoName, status: 'rejected', reason: error.message })
    return { ok: false, error: error.message, rejected: trace.writes_rejected, trace, committed: false }
  }
  trace.guard_decisions = decisions.map(d => ({ path: d.path, op: d.op, allowed: d.allowed, reason: d.reason, rule: d.rule }))

  const rejected = decisions.filter(d => !d.allowed)
  if (rejected.length > 0) {
    trace.writes_rejected = rejected.map(r => ({ path: r.path, reason: r.reason }))
    appendRuntimeTrace(kbRoot, trace)
    appendAudit(kbRoot, { op: 'repo-close-task', agent_id: contract.agent_id, repo: repoName, status: 'rejected', rejected: rejected.length })
    return { ok: false, rejected, trace, committed: false }
  }

  const rollbacks = []
  try {
    for (const w of decisions) {
      const rollback = commitRepoWrite(kbRoot, repoName, contract, w, trace)
      if (rollback) rollbacks.push(rollback)
    }
  } catch (error) {
    const rollback = rollbackRepoWrites(kbRoot, rollbacks)
    trace.error = error.message
    trace.rollback = rollback
    appendRuntimeTrace(kbRoot, trace)
    appendAudit(kbRoot, {
      op: 'repo-close-task',
      agent_id: contract.agent_id,
      repo: repoName,
      status: 'rolled_back',
      error: error.message,
      rolled_back: rollback.rolledBack,
      rollback_errors: rollback.errors.length,
    })
    return { ok: false, error: error.message, trace, committed: false }
  }

  for (const write of trace.writes_committed) {
    appendAudit(kbRoot, { op: 'repo-write', agent_id: contract.agent_id, repo: repoName, path: write.path, kind: write.op })
  }
  for (const item of trace.bus_items) {
    appendAudit(kbRoot, {
      op: 'repo-bus-publish',
      repo: repoName,
      channel: item.channel,
      id: item.id,
      from: contract.agent_id,
      project: payload.project || null,
      path: item.path,
    })
  }

  appendRuntimeTrace(kbRoot, trace)
  appendAudit(kbRoot, {
    op: 'repo-close-task',
    agent_id: contract.agent_id,
    repo: repoName,
    status: 'ok',
    committed: trace.writes_committed.length,
    bus: trace.bus_items.length,
  })
  return { ok: true, trace, committed: true }
}

export function dryRunCloseRepoTask(kbRoot, repoName, contract, payload) {
  const vars = { project: payload.project || null }
  const closeValidation = validateRepoCloseTaskPayload(contract, payload)
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
    decisions = planRepoWrites(contract, vars, payload, repoName)
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

export function appendRepoProgress(kbRoot, repoName, entry, agentId) {
  const base = repoWikiRoot(repoName)
  const progressPath = path.join(kbRoot, base, 'progress.md')
  ensureDir(progressPath)

  const existing = readOrInit(progressPath, { memory_class: 'learned', repo: repoName })
  const sep = `\n\n## ${new Date().toISOString()}\n`
  fs.writeFileSync(progressPath, existing.endsWith('\n') ? existing + sep + entry + '\n' : existing + '\n' + sep + entry + '\n')
  return path.relative(kbRoot, progressPath)
}

export function writeRepoTaskLog(kbRoot, repoName, taskId, agentId, content) {
  const base = repoWikiRoot(repoName)
  const day = todayStamp()
  const taskPath = path.join(kbRoot, `${repoTasksRoot(repoName)}/${day.slice(0, 4)}/${day.slice(5, 7)}/${day.slice(8, 10)}/${taskId}.md`)
  ensureDir(taskPath)

  const fm = {
    task_id: taskId,
    agent: agentId,
    repo: repoName,
    created: new Date().toISOString(),
  }

  fs.writeFileSync(taskPath, serializeFrontmatter(fm, '\n' + content + '\n'))
  return path.relative(kbRoot, taskPath)
}
