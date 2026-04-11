// Task lifecycle: start, append, get-active, abandon, dry-run.
// Each active task gets its own bounded working-memory file so agents have
// explicit, bounded, resumable state separate from the legacy task-log.
//
// File layout introduced:
//   wiki/agents/{tier}s/{id}/working-memory/{task_id}.md  — task-local state
//   wiki/agents/{tier}s/{id}/active-task.md               — active task pointer
//
// V2: When contract has memory_policy.working_memory_schema: 'structured',
// the working-memory file uses typed sections instead of a raw append log:
//   ## Evidence | ## Decisions | ## Open Questions | ## Candidate Learnings
//   ## Proposed Bus Items | ## State Log | ## Final Outcome | ## Follow-ups

import fs from 'fs'
import path from 'path'
import { assertWriteAllowed } from './paths.mjs'
import { parseFrontmatter, serializeFrontmatter, updateFrontmatter } from './frontmatter.mjs'
import { appendAudit, appendRuntimeTrace, readRuntimeTraces } from './audit.mjs'
import { timestamp } from './ids.mjs'

// ── V2: Structured working-memory template ────────────────────────────────────
function buildStructuredTemplate(taskId, title, goal) {
  return [
    '',
    `# ${title || taskId}`,
    '',
    `**Goal:** ${goal || '_not set_'}`,
    '',
    '---',
    '',
    '## Evidence',
    '<!-- Each entry: - [source] claim | confidence: high/medium/low -->',
    '',
    '## Decisions',
    '<!-- Each entry: - [timestamp] decision | rationale -->',
    '',
    '## Open Questions',
    '<!-- Each entry: - question -->',
    '',
    '## Candidate Learnings',
    '<!-- Each entry: - learning | category: learned/canonical | confidence: high/medium/low | durability: session/learned/canonical -->',
    '',
    '## Proposed Bus Items',
    '<!-- Each entry: - [channel] title | summary -->',
    '',
    '## State Log',
    '<!-- Raw append log — timestamped entries appended here -->',
    '',
    '## Final Outcome',
    '<!-- Set on task close -->',
    '',
    '## Follow-ups',
    '<!-- Set on task close -->',
    '',
  ].join('\n')
}

// ─── Internal path helpers ────────────────────────────────────────────────────

export function agentBase(contract) {
  return `wiki/agents/${contract.tier}s/${contract.agent_id}`
}

export function workingMemoryPath(contract, taskId) {
  return `${agentBase(contract)}/working-memory/${taskId}.md`
}

export function activeTaskPath(contract) {
  return `${agentBase(contract)}/active-task.md`
}

// ─── startTask ────────────────────────────────────────────────────────────────

/**
 * Open a new task-local working-memory file for this agent.
 * Writes:
 *   wiki/agents/{tier}s/{id}/working-memory/{task_id}.md  — bounded scratch
 *   wiki/agents/{tier}s/{id}/active-task.md               — pointer / metadata
 *
 * @param {string} kbRoot
 * @param {object} contract - loaded agent contract
 * @param {object} opts
 *   - taskId?: string        (generated if omitted)
 *   - project?: string
 *   - description?: string
 *   - tags?: string[]
 * @returns {{ taskId, workingMemoryPath, activeTaskPath }}
 */
export function startTask(kbRoot, contract, opts = {}) {
  const { project = null, description = '', tags = [] } = opts
  const id = opts.taskId || `task-${timestamp()}`
  const wmRel = workingMemoryPath(contract, id)
  const atRel = activeTaskPath(contract)
  const guardVars = { project, domain: contract.domain, agent: contract.agent_id }

  // Guard: both working-memory and active-task must be writable
  const wmGuard = assertWriteAllowed(wmRel, contract, guardVars)
  if (!wmGuard.allowed) throw new Error(`startTask: cannot write working-memory: ${wmGuard.reason}`)
  const atGuard = assertWriteAllowed(atRel, contract, guardVars)
  if (!atGuard.allowed) throw new Error(`startTask: cannot write active-task: ${atGuard.reason}`)

  const now = new Date().toISOString()
  const useStructured = contract.memory_policy?.working_memory_schema === 'structured'

  // Create working-memory file
  const wmFull = path.join(kbRoot, wmRel)
  fs.mkdirSync(path.dirname(wmFull), { recursive: true })

  const wmBody = useStructured
    ? buildStructuredTemplate(id, `Task: ${description || id}`, opts.goal || description)
    : `\n# Task: ${description || id}\n\n`

  fs.writeFileSync(wmFull, serializeFrontmatter({
    memory_class: 'working',
    task_id: id,
    agent_id: contract.agent_id,
    project,
    status: 'active',
    created: now,
    updated: now,
    tags,
    // V2 structured fields
    schema: useStructured ? 'v2-structured' : 'v1-legacy',
    goal: opts.goal || description || null,
    candidate_learnings_count: 0,
    proposed_bus_items_count: 0,
  }, wmBody))

  // Write active-task pointer
  const atFull = path.join(kbRoot, atRel)
  fs.mkdirSync(path.dirname(atFull), { recursive: true })
  fs.writeFileSync(atFull, serializeFrontmatter({
    task_id: id,
    project,
    description,
    status: 'active',
    started: now,
    working_memory: wmRel,
  }, ''))

  appendAudit(kbRoot, { op: 'agent-start-task', agent_id: contract.agent_id, task_id: id, project })
  appendRuntimeTrace(kbRoot, { type: 'start-task', agent_id: contract.agent_id, task_id: id, project })

  return { taskId: id, workingMemoryPath: wmRel, activeTaskPath: atRel }
}

// ─── appendTaskState ──────────────────────────────────────────────────────────

/**
 * Append a timestamped entry to the task-local working-memory file.
 * The task must be in 'active' status.
 *
 * @returns {{ appended: boolean, path: string }}
 */
export function appendTaskState(kbRoot, contract, taskId, entry) {
  const wmRel = workingMemoryPath(contract, taskId)
  const wmFull = path.join(kbRoot, wmRel)

  if (!fs.existsSync(wmFull)) {
    throw new Error(`appendTaskState: working-memory not found for task ${taskId}`)
  }
  const raw = fs.readFileSync(wmFull, 'utf8')
  const { data, content: body } = parseFrontmatter(raw)

  if (data.status !== 'active') {
    throw new Error(`appendTaskState: task ${taskId} is not active (status: ${data.status})`)
  }

  const sep = `\n\n## ${new Date().toISOString()}\n`
  const updated = serializeFrontmatter(
    { ...data, updated: new Date().toISOString() },
    body + sep + entry + '\n',
  )
  fs.writeFileSync(wmFull, updated)

  return { appended: true, path: wmRel }
}

// ─── getActiveTask ────────────────────────────────────────────────────────────

/**
 * Return the active task metadata for this agent, or null if none.
 *
 * @returns {{ taskId, project, description, workingMemoryPath, started } | null}
 */
export function getActiveTask(kbRoot, contract) {
  const atFull = path.join(kbRoot, activeTaskPath(contract))
  if (!fs.existsSync(atFull)) return null

  const { data } = parseFrontmatter(fs.readFileSync(atFull, 'utf8'))
  if (!data.task_id || data.status !== 'active') return null

  return {
    taskId: data.task_id,
    project: data.project || null,
    description: data.description || '',
    workingMemoryPath: data.working_memory || null,
    started: data.started || null,
  }
}

// ─── abandonTask ─────────────────────────────────────────────────────────────

/**
 * Mark a task as abandoned and clear the active-task pointer.
 * The working-memory file is retained for audit purposes.
 *
 * @returns {{ abandoned: boolean, workingMemoryPath: string }}
 */
export function abandonTask(kbRoot, contract, taskId, reason = '') {
  const wmRel = workingMemoryPath(contract, taskId)
  const wmFull = path.join(kbRoot, wmRel)
  const atRel = activeTaskPath(contract)
  const atFull = path.join(kbRoot, atRel)

  if (!fs.existsSync(wmFull)) {
    throw new Error(`abandonTask: working-memory not found for task ${taskId}`)
  }

  const now = new Date().toISOString()

  // Mark working-memory as abandoned
  const wm = fs.readFileSync(wmFull, 'utf8')
  fs.writeFileSync(wmFull, updateFrontmatter(wm, {
    status: 'abandoned',
    abandoned_at: now,
    abandon_reason: reason || null,
    updated: now,
  }))

  // Clear the active-task pointer (keep file, just mark cleared)
  if (fs.existsSync(atFull)) {
    const at = fs.readFileSync(atFull, 'utf8')
    fs.writeFileSync(atFull, updateFrontmatter(at, {
      status: 'cleared',
      cleared_at: now,
      cleared_reason: 'abandoned',
    }))
  }

  appendAudit(kbRoot, { op: 'agent-abandon-task', agent_id: contract.agent_id, task_id: taskId, reason })
  appendRuntimeTrace(kbRoot, { type: 'abandon-task', agent_id: contract.agent_id, task_id: taskId, reason })

  return { abandoned: true, workingMemoryPath: wmRel }
}

// ─── completeActiveTask (internal, called by closeTask) ───────────────────────

/**
 * Seal the active task's working-memory file as 'completed' and clear the
 * active-task pointer. Called atomically from within closeTask.
 *
 * Returns file-write ops to include in the closeTask write plan so that
 * they participate in the same guard + commit cycle.
 *
 * @returns {Array<{op, path, content}>} write ops to stage
 */
export function planActiveTaskClose(kbRoot, contract, payload) {
  const active = getActiveTask(kbRoot, contract)
  if (!active) return []

  const wmFull = path.join(kbRoot, active.workingMemoryPath)
  const atFull = path.join(kbRoot, activeTaskPath(contract))
  const now = new Date().toISOString()

  const writes = []

  if (fs.existsSync(wmFull)) {
    const wm = fs.readFileSync(wmFull, 'utf8')
    const sealed = updateFrontmatter(wm, {
      status: 'completed',
      completed_at: now,
      updated: now,
    })
    writes.push({ op: 'overwrite', path: active.workingMemoryPath, content: sealed, reason: 'seal active task working-memory' })
  }

  if (fs.existsSync(atFull)) {
    const at = fs.readFileSync(atFull, 'utf8')
    const cleared = updateFrontmatter(at, {
      status: 'cleared',
      cleared_at: now,
      cleared_reason: 'completed',
    })
    writes.push({ op: 'overwrite', path: activeTaskPath(contract), content: cleared, reason: 'clear active-task pointer' })
  }

  return writes
}

function readFrontmatterIfExists(fullPath) {
  if (!fs.existsSync(fullPath)) return null
  return parseFrontmatter(fs.readFileSync(fullPath, 'utf8')).data
}

function listWorkingMemoryFiles(kbRoot, contract) {
  const dir = path.join(kbRoot, agentBase(contract), 'working-memory')
  if (!fs.existsSync(dir)) return []

  const files = []
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.md')) continue
    const relPath = `${agentBase(contract)}/working-memory/${name}`
    files.push({
      path: relPath,
      meta: readFrontmatterIfExists(path.join(kbRoot, relPath)) || {},
    })
  }
  return files
}

export function verifyTaskState(kbRoot, contract) {
  const pointerPath = activeTaskPath(contract)
  const pointerFull = path.join(kbRoot, pointerPath)
  const pointerMeta = readFrontmatterIfExists(pointerFull)
  const activeTask = getActiveTask(kbRoot, contract)
  const workingFiles = listWorkingMemoryFiles(kbRoot, contract)
  const activeWorkingFiles = workingFiles.filter(file => file.meta.status === 'active')
  const issues = []

  if (pointerMeta?.status === 'active') {
    if (!pointerMeta.task_id) {
      issues.push({ code: 'active-pointer-missing-task-id', severity: 'error', repairable: activeWorkingFiles.length === 1 })
    }
    if (!pointerMeta.working_memory) {
      issues.push({ code: 'active-pointer-missing-working-memory', severity: 'error', repairable: activeWorkingFiles.length === 1 })
    } else {
      const wmFull = path.join(kbRoot, pointerMeta.working_memory)
      if (!fs.existsSync(wmFull)) {
        issues.push({ code: 'active-pointer-target-missing', severity: 'error', repairable: true, path: pointerMeta.working_memory })
      } else {
        const wmMeta = readFrontmatterIfExists(wmFull) || {}
        if (wmMeta.status !== 'active') {
          issues.push({
            code: 'active-pointer-target-not-active',
            severity: 'error',
            repairable: true,
            path: pointerMeta.working_memory,
            status: wmMeta.status || null,
          })
        }
        if (wmMeta.task_id && pointerMeta.task_id && wmMeta.task_id !== pointerMeta.task_id) {
          issues.push({
            code: 'active-pointer-task-mismatch',
            severity: 'error',
            repairable: true,
            pointer_task_id: pointerMeta.task_id,
            working_task_id: wmMeta.task_id,
          })
        }
      }
    }
  }

  if (!activeTask && activeWorkingFiles.length === 1) {
    issues.push({
      code: 'orphan-active-working-memory',
      severity: 'warn',
      repairable: true,
      path: activeWorkingFiles[0].path,
    })
  }

  if (activeWorkingFiles.length > 1) {
    issues.push({
      code: 'multiple-active-working-files',
      severity: 'error',
      repairable: false,
      paths: activeWorkingFiles.map(file => file.path),
    })
  }

  return {
    ok: issues.length === 0,
    agent_id: contract.agent_id,
    active_task: activeTask,
    pointer_path: pointerPath,
    pointer_status: pointerMeta?.status || null,
    working_memory_files: workingFiles.map(file => ({
      path: file.path,
      task_id: file.meta.task_id || null,
      status: file.meta.status || null,
      project: file.meta.project || null,
    })),
    issues,
    repairable: issues.some(issue => issue.repairable),
  }
}

export function repairTaskState(kbRoot, contract) {
  const verification = verifyTaskState(kbRoot, contract)
  const actions = []
  const vars = { project: verification.active_task?.project || null, domain: contract.domain, agent: contract.agent_id }
  const pointerPath = activeTaskPath(contract)
  const pointerFull = path.join(kbRoot, pointerPath)
  const pointerMeta = readFrontmatterIfExists(pointerFull)
  const activeWorkingFiles = verification.working_memory_files.filter(file => file.status === 'active')

  function assertWritable(relPath) {
    const guard = assertWriteAllowed(relPath, contract, vars)
    if (!guard.allowed) throw new Error(`repairTaskState: cannot write ${relPath}: ${guard.reason}`)
  }

  if (verification.ok) {
    return { ok: true, repaired: false, actions, verification }
  }

  if (activeWorkingFiles.length === 1) {
    const activeFile = activeWorkingFiles[0]
    const activeFull = path.join(kbRoot, activeFile.path)
    const wmMeta = readFrontmatterIfExists(activeFull) || {}
    if (!pointerMeta || pointerMeta.status !== 'active' || pointerMeta.working_memory !== activeFile.path) {
      assertWritable(pointerPath)
      fs.mkdirSync(path.dirname(pointerFull), { recursive: true })
      fs.writeFileSync(pointerFull, serializeFrontmatter({
        task_id: wmMeta.task_id || activeFile.path.split('/').pop()?.replace(/\.md$/, '') || null,
        project: wmMeta.project || null,
        description: wmMeta.goal || '',
        status: 'active',
        started: wmMeta.created || new Date().toISOString(),
        working_memory: activeFile.path,
      }, ''))
      actions.push({ op: 'rebuild-active-task-pointer', path: pointerPath, working_memory: activeFile.path })
    }
  }

  if (pointerMeta?.status === 'active' && pointerMeta.working_memory) {
    const wmFull = path.join(kbRoot, pointerMeta.working_memory)
    const wmMeta = readFrontmatterIfExists(wmFull)
    if (!wmMeta || wmMeta.status !== 'active') {
      assertWritable(pointerPath)
      const current = fs.existsSync(pointerFull) ? fs.readFileSync(pointerFull, 'utf8') : serializeFrontmatter({}, '')
      fs.writeFileSync(pointerFull, updateFrontmatter(current, {
        status: 'cleared',
        cleared_at: new Date().toISOString(),
        cleared_reason: 'repair-invalid-pointer',
      }))
      actions.push({ op: 'clear-invalid-active-task-pointer', path: pointerPath })
    }
  }

  const after = verifyTaskState(kbRoot, contract)
  return {
    ok: after.ok,
    repaired: actions.length > 0,
    actions,
    verification: after,
  }
}

export function getAgentStatus(kbRoot, contract, { traceLimit = 5 } = {}) {
  return {
    agent_id: contract.agent_id,
    tier: contract.tier,
    domain: contract.domain || null,
    active_task: getActiveTask(kbRoot, contract),
    verification: verifyTaskState(kbRoot, contract),
    recent_traces: readRuntimeTraces(kbRoot, traceLimit, { agent_id: contract.agent_id }),
    close_policy: contract.close_policy || { required_fields: [], at_least_one_of: [], require_active_task: false },
  }
}
