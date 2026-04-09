// Repo-scoped agent writeback. Transactional close-task for repos.
import fs from 'fs'
import path from 'path'
import { assertWriteAllowed } from '../agent-runtime/paths.mjs'
import { assertNotImportedDoc, repoWikiRoot, repoTasksRoot, repoRewritesRoot } from './paths.mjs'
import { parseFrontmatter, serializeFrontmatter, updateFrontmatter } from '../agent-runtime/frontmatter.mjs'
import { classFor, isAppendOnly } from '../agent-runtime/memory-classes.mjs'
import { appendAudit, appendRuntimeTrace } from '../agent-runtime/audit.mjs'
import { timestamp, todayStamp } from '../agent-runtime/ids.mjs'

function ensureDir(full) {
  fs.mkdirSync(path.dirname(full), { recursive: true })
}

function readOrInit(full, initFm = {}) {
  if (fs.existsSync(full)) return fs.readFileSync(full, 'utf8')
  return serializeFrontmatter({ ...initFm, created: new Date().toISOString() }, '\n')
}

// Plan writes for repo context
function planRepoWrites(contract, vars, payload, repoName) {
  const writes = []
  const base = repoWikiRoot(contract.agent_id, repoName)

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
      const rel = `${repoRewritesRoot(contract.agent_id, repoName, rw.type)}/${rw.project}-${ts}.md`
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

  // Validate each write against guard
  const decisions = []
  const guardVars = { project: vars.project, domain: contract.domain, agent: contract.agent_id, repo: repoName }
  for (const w of writes) {
    assertNotImportedDoc(w.path) // Ensure we're not writing to repo-docs
    const d = assertWriteAllowed(w.path, contract, guardVars)
    decisions.push({ ...w, ...d })
  }
  return decisions
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
  }

  // 1. Plan writes + guard
  const decisions = planRepoWrites(contract, vars, payload, repoName)
  trace.guard_decisions = decisions.map(d => ({ path: d.path, op: d.op, allowed: d.allowed, reason: d.reason, rule: d.rule }))

  const rejected = decisions.filter(d => !d.allowed)
  if (rejected.length > 0) {
    trace.writes_rejected = rejected.map(r => ({ path: r.path, reason: r.reason }))
    appendRuntimeTrace(kbRoot, trace)
    appendAudit(kbRoot, { op: 'repo-close-task', agent_id: contract.agent_id, repo: repoName, status: 'rejected', rejected: rejected.length })
    return { ok: false, rejected, trace, committed: false }
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
    appendAudit(kbRoot, { op: 'repo-write', agent_id: contract.agent_id, repo: repoName, path: w.path, kind: w.op })
  }

  appendRuntimeTrace(kbRoot, trace)
  appendAudit(kbRoot, { op: 'repo-close-task', agent_id: contract.agent_id, repo: repoName, status: 'ok', committed: trace.writes_committed.length })
  return { ok: true, trace, committed: true }
}

export function appendRepoProgress(kbRoot, repoName, entry, agentId) {
  const base = repoWikiRoot(agentId, repoName)
  const progressPath = path.join(kbRoot, base, 'progress.md')
  ensureDir(progressPath)

  const existing = readOrInit(progressPath, { memory_class: 'learned', repo: repoName })
  const sep = `\n\n## ${new Date().toISOString()}\n`
  fs.writeFileSync(progressPath, existing.endsWith('\n') ? existing + sep + entry + '\n' : existing + '\n' + sep + entry + '\n')
}

export function writeRepoTaskLog(kbRoot, repoName, taskId, agentId, content) {
  const base = repoWikiRoot(agentId, repoName)
  const day = todayStamp()
  const taskPath = path.join(kbRoot, `${repoTasksRoot(agentId, repoName)}/${day.slice(0, 4)}/${day.slice(5, 7)}/${day.slice(8, 10)}/${taskId}.md`)
  ensureDir(taskPath)

  const fm = {
    task_id: taskId,
    agent: agentId,
    repo: repoName,
    created: new Date().toISOString(),
  }

  fs.writeFileSync(taskPath, serializeFrontmatter(fm, '\n' + content + '\n'))
}
