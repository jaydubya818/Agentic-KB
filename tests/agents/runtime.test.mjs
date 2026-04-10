// Consolidated test suite for the agent runtime.
// Runs against a throwaway fixture vault in a temp dir.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import os from 'os'

import * as rt from '../../lib/agent-runtime/index.mjs'

// ─── Fixture setup ────────────────────────────────────────────────────────

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-rt-'))
  // Minimal tree
  const dirs = [
    'config/agents',
    'wiki/agents/workers/w1',
    'wiki/agents/workers/w1/rewrites/specs',
    'wiki/agents/leads/l1',
    'wiki/agents/orchestrators/o1',
    'wiki/system/bus/discovery',
    'wiki/system/bus/escalation',
    'wiki/system/bus/standards',
    'wiki/projects/p1',
    'logs',
  ]
  for (const d of dirs) fs.mkdirSync(path.join(root, d), { recursive: true })

  // Worker contract
  fs.writeFileSync(path.join(root, 'config/agents/w1.yaml'), `
agent_id: w1
tier: worker
domain: eng
context_policy:
  budget_bytes: 20480
  include:
    - class: profile
      scope: self
      priority: 10
    - class: hot
      scope: self
      priority: 20
    - path: wiki/projects/{{project}}/specs.md
      priority: 40
allowed_writes:
  - wiki/agents/workers/w1/**
  - wiki/system/bus/discovery/**
forbidden_paths:
  - wiki/agents/orchestrators/**
  - wiki/agents/leads/**
`.trim())

  fs.writeFileSync(path.join(root, 'wiki/agents/workers/w1/profile.md'), '---\nmemory_class: profile\n---\nW1\n')
  fs.writeFileSync(path.join(root, 'wiki/agents/workers/w1/hot.md'), '---\nmemory_class: hot\n---\nhot stuff\n')
  fs.writeFileSync(path.join(root, 'wiki/agents/leads/l1/profile.md'), '---\nmemory_class: profile\n---\nL1\n')
  fs.writeFileSync(path.join(root, 'wiki/agents/orchestrators/o1/profile.md'), '---\nmemory_class: profile\n---\nO1\n')
  fs.writeFileSync(path.join(root, 'wiki/projects/p1/specs.md'), '---\ntitle: P1\n---\nspec\n')

  return root
}

// ─── 1. Contract loading ──────────────────────────────────────────────────

test('loadContract parses yaml and validates', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  assert.equal(c.agent_id, 'w1')
  assert.equal(c.tier, 'worker')
  assert.equal(c.context_policy.budget_bytes, 20480)
  assert.ok(Array.isArray(c.allowed_writes))
  assert.ok(Array.isArray(c.context_policy.include))
})

test('listContracts returns all contracts', () => {
  const root = makeFixture()
  const all = rt.listContracts(root)
  assert.equal(all.length, 1)
})

// ─── 2. Path guards ───────────────────────────────────────────────────────

test('assertWriteAllowed rejects path traversal', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  const r = rt.assertWriteAllowed('wiki/agents/workers/w1/../../orchestrators/o1/profile.md', c, {})
  assert.equal(r.allowed, false)
  assert.match(r.reason, /traversal/)
})

test('assertWriteAllowed rejects paths outside allowed_writes', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  const r = rt.assertWriteAllowed('wiki/agents/leads/l1/profile.md', c, {})
  assert.equal(r.allowed, false)
})

test('assertWriteAllowed allows matching paths', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  const r = rt.assertWriteAllowed('wiki/agents/workers/w1/task-log.md', c, {})
  assert.equal(r.allowed, true)
})

// ─── 3. Context loader ────────────────────────────────────────────────────

test('context loader respects tier scoping and priority', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  const bundle = rt.loadAgentContext(root, c, { project: 'p1' })
  const paths = bundle.files.map(f => f.path)
  assert.ok(paths.includes('wiki/agents/workers/w1/profile.md'))
  assert.ok(paths.includes('wiki/agents/workers/w1/hot.md'))
  assert.ok(paths.includes('wiki/projects/p1/specs.md'))
  // No lead or orchestrator
  assert.ok(!paths.some(p => p.includes('/leads/')))
  assert.ok(!paths.some(p => p.includes('/orchestrators/')))
})

test('context loader trace reports budget usage', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  const bundle = rt.loadAgentContext(root, c, { project: 'p1' })
  assert.ok(bundle.trace.budget_used > 0)
  assert.equal(bundle.trace.budget_bytes, 20480)
  assert.equal(bundle.trace.truncated, false)
})

// ─── 4. Writeback ─────────────────────────────────────────────────────────

test('closeTask commits allowed writes atomically', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  const result = rt.closeTask(root, c, {
    project: 'p1',
    taskLogEntry: 'did the thing',
    hotUpdate: 'new hot',
    gotcha: 'watch out for X',
    discoveries: [{ body: 'interesting fact' }],
  })
  assert.equal(result.ok, true)
  assert.ok(result.trace.writes_committed.length >= 3)
  assert.equal(result.trace.bus_items.length, 1)
  // Verify task-log was appended to
  const log = fs.readFileSync(path.join(root, 'wiki/agents/workers/w1/task-log.md'), 'utf8')
  assert.match(log, /did the thing/)
})

test('closeTask rejects all writes if any is forbidden', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  const result = rt.closeTask(root, c, {
    project: 'p1',
    taskLogEntry: 'should not land',
    rewrites: [{ type: '../../../leads/l1/rewrites/evil', project: 'p1', body: 'evil' }],
  })
  assert.equal(result.ok, false)
  assert.ok(result.rejected.length > 0)
  // Verify task-log was NOT written (atomic)
  const logPath = path.join(root, 'wiki/agents/workers/w1/task-log.md')
  const log = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : ''
  assert.ok(!log.includes('should not land'))
})

// ─── 5. Bus + promotion ───────────────────────────────────────────────────

test('bus publish + list + read', () => {
  const root = makeFixture()
  const { id } = rt.publishBusItem(root, {
    channel: 'discovery',
    from: 'w1',
    from_tier: 'worker',
    project: 'p1',
    body: 'hello bus',
  })
  const items = rt.listBusItems(root, 'discovery')
  assert.equal(items.length, 1)
  assert.equal(items[0].meta.id, id)
  const read = rt.readBusItem(root, 'discovery', id)
  assert.match(read.body, /hello bus/)
})

test('bus state machine rejects illegal transitions', () => {
  const root = makeFixture()
  const { id } = rt.publishBusItem(root, { channel: 'discovery', from: 'w1', body: 'x' })
  // open -> archived is legal
  rt.transitionBusItem(root, 'discovery', id, 'archived', 'test')
  // archived -> open is not
  assert.throws(() => rt.transitionBusItem(root, 'discovery', id, 'open', 'test'), /Illegal/)
})

test('promoteLearning creates target with provenance and marks source promoted', () => {
  const root = makeFixture()
  const { id } = rt.publishBusItem(root, { channel: 'discovery', from: 'w1', body: 'worth promoting' })
  const r = rt.promoteLearning(root, { channel: 'discovery', id, approver: 'l1' })
  assert.ok(fs.existsSync(path.join(root, r.target)))
  const target = fs.readFileSync(path.join(root, r.target), 'utf8')
  assert.match(target, /promoted_from/)
  const src = fs.readFileSync(path.join(root, r.source), 'utf8')
  assert.match(src, /status: promoted/)
})

// ─── 6. mergeRewrite ─────────────────────────────────────────────────────────

test('mergeRewrite merges approved rewrite into canonical with provenance', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')

  // Create a rewrite artifact in approved state
  const rwRel = 'wiki/agents/workers/w1/rewrites/specs/p1-ts.md'
  const rwFull = path.join(root, rwRel)
  fs.mkdirSync(path.dirname(rwFull), { recursive: true })
  fs.writeFileSync(rwFull, '---\nmemory_class: rewrite\nstatus: approved\nauthor: w1\n---\n\nNew spec content\n')

  const canRel = 'wiki/projects/p1/spec-merged.md'
  const r = rt.mergeRewrite(root, { rewritePath: rwRel, canonicalPath: canRel, approver: 'l1' })

  assert.ok(fs.existsSync(path.join(root, r.canonical)))
  const merged = fs.readFileSync(path.join(root, r.canonical), 'utf8')
  assert.match(merged, /merged_from/)
  assert.match(merged, /New spec content/)

  // Source rewrite should now be in merged state
  const rwContent = fs.readFileSync(rwFull, 'utf8')
  assert.match(rwContent, /status: merged/)

  // Before hash and after hash should differ
  assert.notEqual(r.beforeHash, r.afterHash)
})

test('mergeRewrite rejects rewrite not in approved state', () => {
  const root = makeFixture()
  const rwRel = 'wiki/agents/workers/w1/rewrites/specs/p1-draft.md'
  const rwFull = path.join(root, rwRel)
  fs.mkdirSync(path.dirname(rwFull), { recursive: true })
  fs.writeFileSync(rwFull, '---\nmemory_class: rewrite\nstatus: draft\n---\n\nDraft content\n')

  assert.throws(
    () => rt.mergeRewrite(root, { rewritePath: rwRel, canonicalPath: 'wiki/projects/p1/spec.md', approver: 'l1' }),
    /Cannot merge rewrite in state/
  )
})

// ─── 7. Retention ────────────────────────────────────────────────────────────

test('compactHotMemory snapshots hot file above word threshold', () => {
  const root = makeFixture()
  const agentId = 'w1'
  const hotRel = 'wiki/agents/workers/w1/hot.md'
  const hotFull = path.join(root, hotRel)
  // Write a hot file > 500 words
  const bigContent = '---\nmemory_class: hot\n---\n\n' + 'word '.repeat(600)
  fs.writeFileSync(hotFull, bigContent)

  const result = rt.compactHotMemory(root, agentId, 'worker')
  assert.ok(result.snapshot, 'should have created a snapshot')
  assert.ok(fs.existsSync(path.join(root, result.snapshot)))
  // Original should now have needs_compaction: true
  const updated = fs.readFileSync(hotFull, 'utf8')
  assert.match(updated, /needs_compaction: true/)
})

test('compactHotMemory skips hot file below threshold', () => {
  const root = makeFixture()
  const result = rt.compactHotMemory(root, 'w1', 'worker')
  // fixture hot.md is tiny
  assert.equal(result.skipped, true)
})

test('runBusTTL archives items older than ttlDays', () => {
  const root = makeFixture()
  // Publish an old item
  const { id } = rt.publishBusItem(root, { channel: 'discovery', from: 'w1', body: 'old discovery' })
  // Backdate it by writing created_at 31 days ago
  const itemPath = path.join(root, `wiki/system/bus/discovery/${id}.md`)
  const content = fs.readFileSync(itemPath, 'utf8')
  const old = new Date(Date.now() - 31 * 86400000).toISOString()
  fs.writeFileSync(itemPath, content.replace(/created_at:.*/, `created_at: ${old}`))

  const result = rt.runBusTTL(root, { ttlDays: 30, channels: ['discovery'] })
  assert.equal(result.archived.length, 1)
})

test('rotateTaskLog rotates log above line threshold', () => {
  const root = makeFixture()
  const logRel = 'wiki/agents/workers/w1/task-log.md'
  const logFull = path.join(root, logRel)
  // Write a log with > threshold lines
  fs.writeFileSync(logFull, '---\nmemory_class: working\n---\n\n' + 'line\n'.repeat(200))

  const result = rt.rotateTaskLog(root, 'w1', 'worker', 100)
  assert.ok(result.snapshot)
  assert.ok(fs.existsSync(path.join(root, result.snapshot)))
  // Fresh log should be nearly empty
  const fresh = fs.readFileSync(logFull, 'utf8')
  assert.ok(fresh.split('\n').length < 20)
})

// ─── 8. Identity model ────────────────────────────────────────────────────────

test('identity factories produce correct shapes', () => {
  const agent = rt.agentIdentity({ agent_id: 'w1', tier: 'worker', domain: 'eng', team: 'platform', namespace: 'eng' })
  assert.equal(agent.kind, 'agent')
  assert.equal(agent.tier, 'worker')

  const human = rt.humanIdentity('jay', 'platform')
  assert.equal(human.kind, 'human')
  assert.equal(human.namespace, 'platform')

  const svc = rt.serviceIdentity('ingest-bot', 'ops')
  assert.equal(svc.kind, 'service')

  const team = rt.teamIdentity('frontend')
  assert.equal(team.kind, 'team')
  assert.equal(team.namespace, 'frontend')
})

test('resolveIdentity parses explicit kind+id headers', () => {
  const headers = { 'x-identity-kind': 'human', 'x-identity-id': 'jay', 'x-identity-team': 'platform' }
  const identity = rt.resolveIdentity(headers)
  assert.equal(identity.kind, 'human')
  assert.equal(identity.id, 'jay')
  assert.equal(identity.namespace, 'platform')
})

test('resolveIdentity falls back to anonymous when no headers', () => {
  const identity = rt.resolveIdentity({})
  assert.equal(identity.id, 'anonymous')
  assert.equal(identity.kind, 'human')
})

// ─── 9. State machines ────────────────────────────────────────────────────────

test('standards state machine: draft → proposed → approved → active', () => {
  const r1 = rt.transition('standards', 'draft', 'proposed', 'l1')
  assert.equal(r1.status, 'proposed')
  const r2 = rt.transition('standards', 'proposed', 'approved', 'o1')
  assert.equal(r2.status, 'approved')
  const r3 = rt.transition('standards', 'approved', 'active', 'o1')
  assert.equal(r3.status, 'active')
})

test('standards state machine rejects illegal transition', () => {
  assert.throws(() => rt.transition('standards', 'draft', 'active', 'l1'), /Illegal/)
})

test('rewrite state machine: draft → submitted → approved → merged', () => {
  const r1 = rt.transition('rewrite', 'draft', 'submitted', 'w1')
  assert.equal(r1.status, 'submitted')
  const r2 = rt.transition('rewrite', 'submitted', 'under_review', 'l1')
  assert.equal(r2.status, 'under_review')
  const r3 = rt.transition('rewrite', 'under_review', 'approved', 'o1')
  assert.equal(r3.status, 'approved')
  const r4 = rt.transition('rewrite', 'approved', 'merged', 'o1')
  assert.equal(r4.status, 'merged')
})

// ─── 10. priority_order in context loader ─────────────────────────────────────

test('context loader respects priority_order when present', () => {
  const root = makeFixture()
  // Add a contract with priority_order that puts hot before profile
  fs.writeFileSync(path.join(root, 'config/agents/w1.yaml'), `
agent_id: w1
tier: worker
domain: eng
context_policy:
  budget_bytes: 20480
  priority_order: [hot, profile, project, learned]
  include:
    - class: profile
      scope: self
      priority: 10
    - class: hot
      scope: self
      priority: 20
    - path: wiki/projects/{{project}}/specs.md
      priority: 40
allowed_writes:
  - wiki/agents/workers/w1/**
  - wiki/system/bus/discovery/**
forbidden_paths:
  - wiki/agents/orchestrators/**
  - wiki/agents/leads/**
`.trim())
  const c = rt.loadContract(root, 'w1')
  const bundle = rt.loadAgentContext(root, c, { project: 'p1' })
  const paths = bundle.files.map(f => f.path)
  // hot should come before profile when priority_order says so
  const hotIdx = paths.indexOf('wiki/agents/workers/w1/hot.md')
  const profileIdx = paths.indexOf('wiki/agents/workers/w1/profile.md')
  assert.ok(hotIdx < profileIdx, `hot (${hotIdx}) should precede profile (${profileIdx}) per priority_order`)
})

// ─── 11. generateTemplate ────────────────────────────────────────────────────

test('generateTemplate produces valid frontmatter for all memory classes', () => {
  const classes = ['profile', 'hot', 'working', 'learned', 'rewrite', 'bus']
  for (const cls of classes) {
    const tmpl = rt.generateTemplate(cls, { agentId: 'test-agent', tier: 'worker', domain: 'eng' })
    assert.ok(tmpl.startsWith('---\n'), `${cls} template should start with frontmatter`)
    assert.match(tmpl, /memory_class:/, `${cls} template should include memory_class`)
  }
})

// ─── 12. Task lifecycle ────────────────────────────────────────────────────────

test('startTask creates working-memory file and active-task pointer', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  // Extend allowed_writes to include working-memory and active-task paths
  c.allowed_writes = [...c.allowed_writes, 'wiki/agents/workers/w1/working-memory/**', 'wiki/agents/workers/w1/active-task.md']

  const { taskId, workingMemoryPath, activeTaskPath } = rt.startTask(root, c, {
    project: 'p1',
    description: 'Implement feature X',
  })

  assert.ok(taskId.startsWith('task-'), `taskId should start with 'task-'`)
  assert.ok(fs.existsSync(path.join(root, workingMemoryPath)), 'working-memory file should exist')
  assert.ok(fs.existsSync(path.join(root, activeTaskPath)), 'active-task.md should exist')

  const wmContent = fs.readFileSync(path.join(root, workingMemoryPath), 'utf8')
  assert.match(wmContent, /memory_class: working/)
  assert.match(wmContent, /status: active/)
  assert.match(wmContent, /task_id:/)

  const atContent = fs.readFileSync(path.join(root, activeTaskPath), 'utf8')
  assert.match(atContent, /status: active/)
  // task_id value may be quoted by the serializer (hyphens trigger quoting)
  assert.match(atContent, /task_id:/)
})

test('getActiveTask returns null when no active task exists', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  const active = rt.getActiveTask(root, c)
  assert.equal(active, null)
})

test('getActiveTask returns task metadata after startTask', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  c.allowed_writes = [...c.allowed_writes, 'wiki/agents/workers/w1/working-memory/**', 'wiki/agents/workers/w1/active-task.md']

  const { taskId } = rt.startTask(root, c, { project: 'p1', description: 'My task' })
  const active = rt.getActiveTask(root, c)

  assert.ok(active !== null)
  assert.equal(active.taskId, taskId)
  assert.equal(active.project, 'p1')
  assert.equal(active.description, 'My task')
  assert.ok(active.workingMemoryPath)
})

test('appendTaskState appends timestamped entry to working-memory file', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  c.allowed_writes = [...c.allowed_writes, 'wiki/agents/workers/w1/working-memory/**', 'wiki/agents/workers/w1/active-task.md']

  const { taskId, workingMemoryPath } = rt.startTask(root, c, { project: 'p1', description: 'Test task' })
  rt.appendTaskState(root, c, taskId, 'Step 1 complete: scaffold done')
  rt.appendTaskState(root, c, taskId, 'Step 2 complete: tests written')

  const content = fs.readFileSync(path.join(root, workingMemoryPath), 'utf8')
  assert.match(content, /Step 1 complete/)
  assert.match(content, /Step 2 complete/)
  // Both entries should be separated by timestamped headers
  assert.ok((content.match(/## \d{4}/g) || []).length >= 2)
})

test('appendTaskState throws when task is not active', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  c.allowed_writes = [...c.allowed_writes, 'wiki/agents/workers/w1/working-memory/**', 'wiki/agents/workers/w1/active-task.md']

  const { taskId } = rt.startTask(root, c, { project: 'p1' })
  rt.abandonTask(root, c, taskId, 'test abandonment')

  assert.throws(
    () => rt.appendTaskState(root, c, taskId, 'should not land'),
    /not active/,
  )
})

test('abandonTask marks working-memory as abandoned and clears active-task pointer', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  c.allowed_writes = [...c.allowed_writes, 'wiki/agents/workers/w1/working-memory/**', 'wiki/agents/workers/w1/active-task.md']

  const { taskId, workingMemoryPath, activeTaskPath } = rt.startTask(root, c, { project: 'p1' })
  const result = rt.abandonTask(root, c, taskId, 'scope changed')

  assert.equal(result.abandoned, true)

  const wm = fs.readFileSync(path.join(root, workingMemoryPath), 'utf8')
  assert.match(wm, /status: abandoned/)
  assert.match(wm, /abandon_reason: scope changed/)

  const at = fs.readFileSync(path.join(root, activeTaskPath), 'utf8')
  assert.match(at, /status: cleared/)

  // getActiveTask should return null after abandonment
  assert.equal(rt.getActiveTask(root, c), null)
})

test('dryRunCloseTask returns write plan without executing anything', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')

  const dry = rt.dryRunCloseTask(root, c, {
    project: 'p1',
    taskLogEntry: 'completed feature',
    discoveries: [{ body: 'found a bug' }],
  })

  assert.equal(dry.wouldSucceed, true)
  assert.ok(dry.planned.length >= 2)
  assert.ok(dry.summary.bus_publishes >= 1)
  assert.ok(dry.summary.file_writes >= 1)

  // Nothing should actually be written
  const logPath = path.join(root, 'wiki/agents/workers/w1/task-log.md')
  const logExists = fs.existsSync(logPath)
  if (logExists) {
    const content = fs.readFileSync(logPath, 'utf8')
    assert.ok(!content.includes('completed feature'), 'dry run must not write to disk')
  }
})

test('dryRunCloseTask reports rejected ops when write would be forbidden', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')

  const dry = rt.dryRunCloseTask(root, c, {
    project: 'p1',
    rewrites: [{ type: '../../../leads/l1/evil', project: 'p1', body: 'evil rewrite' }],
  })

  assert.equal(dry.wouldSucceed, false)
  assert.ok(dry.rejected.length > 0)
})

test('closeTask atomically seals active task working-memory on success', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  c.allowed_writes = [...c.allowed_writes, 'wiki/agents/workers/w1/working-memory/**', 'wiki/agents/workers/w1/active-task.md']

  const { taskId, workingMemoryPath, activeTaskPath } = rt.startTask(root, c, { project: 'p1', description: 'Feature work' })

  const result = rt.closeTask(root, c, {
    project: 'p1',
    taskLogEntry: 'all done',
  })

  assert.equal(result.ok, true)

  // Working-memory should be sealed as completed
  const wm = fs.readFileSync(path.join(root, workingMemoryPath), 'utf8')
  assert.match(wm, /status: completed/)

  // active-task.md pointer should be cleared
  const at = fs.readFileSync(path.join(root, activeTaskPath), 'utf8')
  assert.match(at, /status: cleared/)

  // getActiveTask should return null
  assert.equal(rt.getActiveTask(root, c), null)
})

test('closeTask rejects all writes including bus items when any op is forbidden', () => {
  const root = makeFixture()
  const c = rt.loadContract(root, 'w1')
  // w1 is NOT allowed to write to escalation (only discovery)
  c.allowed_writes = ['wiki/agents/workers/w1/**', 'wiki/system/bus/discovery/**']
  c.forbidden_paths = ['wiki/agents/orchestrators/**', 'wiki/agents/leads/**', 'wiki/system/bus/escalation/**']

  const result = rt.closeTask(root, c, {
    project: 'p1',
    taskLogEntry: 'should not land',
    escalations: [{ body: 'this escalation is forbidden' }],
  })

  assert.equal(result.ok, false)
  assert.ok(result.rejected.length > 0)

  // task-log must NOT be written (full atomic rollback)
  const logPath = path.join(root, 'wiki/agents/workers/w1/task-log.md')
  const log = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : ''
  assert.ok(!log.includes('should not land'), 'task-log must not be written when close is rejected')
})

// ─── 13. Context loader — Phase 2 upgrades ────────────────────────────────────

test('context loader with include_task_local loads active working-memory first', () => {
  const root = makeFixture()
  // Write a contract with include_task_local: true
  fs.writeFileSync(path.join(root, 'config/agents/w1.yaml'), `
agent_id: w1
tier: worker
domain: eng
context_policy:
  budget_bytes: 20480
  include_task_local: true
  include:
    - class: profile
      scope: self
      priority: 10
    - class: hot
      scope: self
      priority: 20
allowed_writes:
  - wiki/agents/workers/w1/**
  - wiki/system/bus/discovery/**
forbidden_paths:
  - wiki/agents/orchestrators/**
  - wiki/agents/leads/**
`.trim())
  const c = rt.loadContract(root, 'w1')
  c.allowed_writes = [...c.allowed_writes, 'wiki/agents/workers/w1/working-memory/**', 'wiki/agents/workers/w1/active-task.md']

  const { workingMemoryPath } = rt.startTask(root, c, { project: 'p1', description: 'active task' })

  const bundle = rt.loadAgentContext(root, c, { project: 'p1' })
  const paths = bundle.files.map(f => f.path)

  assert.ok(paths.includes(workingMemoryPath), 'working-memory should be included')
  // working-memory should be first
  assert.equal(paths[0], workingMemoryPath, 'working-memory should be the first file loaded')
  assert.ok(bundle.trace.include_task_local === true)
})

test('context loader required rule adds warning when file is missing', () => {
  const root = makeFixture()
  fs.writeFileSync(path.join(root, 'config/agents/w1.yaml'), `
agent_id: w1
tier: worker
domain: eng
context_policy:
  budget_bytes: 20480
  include:
    - class: profile
      scope: self
      priority: 10
      required: true
    - path: wiki/projects/p1/does-not-exist.md
      priority: 30
      required: true
allowed_writes:
  - wiki/agents/workers/w1/**
  - wiki/system/bus/discovery/**
forbidden_paths:
  - wiki/agents/orchestrators/**
  - wiki/agents/leads/**
`.trim())
  const c = rt.loadContract(root, 'w1')
  const bundle = rt.loadAgentContext(root, c, { project: 'p1' })

  // Should still succeed (required is a warning, not a crash)
  assert.ok(Array.isArray(bundle.files))
  // Warning should appear in trace
  assert.ok(bundle.trace.warnings && bundle.trace.warnings.length >= 1, 'should have at least one warning for missing required file')
})

test('context loader freshness_days excludes stale files', () => {
  const root = makeFixture()
  // Make hot.md stale by backdating its frontmatter
  const hotPath = path.join(root, 'wiki/agents/workers/w1/hot.md')
  const oldDate = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10) // 10 days ago
  fs.writeFileSync(hotPath, `---\nmemory_class: hot\nupdated: ${oldDate}\n---\nhot stuff\n`)

  fs.writeFileSync(path.join(root, 'config/agents/w1.yaml'), `
agent_id: w1
tier: worker
domain: eng
context_policy:
  budget_bytes: 20480
  include:
    - class: profile
      scope: self
      priority: 10
    - class: hot
      scope: self
      priority: 20
      freshness_days: 7
allowed_writes:
  - wiki/agents/workers/w1/**
  - wiki/system/bus/discovery/**
forbidden_paths:
  - wiki/agents/orchestrators/**
  - wiki/agents/leads/**
`.trim())
  const c = rt.loadContract(root, 'w1')
  const bundle = rt.loadAgentContext(root, c, { project: 'p1' })
  const paths = bundle.files.map(f => f.path)

  assert.ok(!paths.includes('wiki/agents/workers/w1/hot.md'), 'stale hot.md should be excluded')
  const excluded = bundle.trace.excluded.find(e => e.path === 'wiki/agents/workers/w1/hot.md')
  assert.ok(excluded, 'stale file should appear in excluded list')
  assert.match(excluded.reason, /stale/)
})

test('context loader max_items caps files resolved from a single rule', () => {
  const root = makeFixture()
  // Add a few discovery bus items
  for (let i = 0; i < 5; i++) {
    rt.publishBusItem(root, { channel: 'discovery', from: 'w1', body: `item ${i}` })
  }
  fs.writeFileSync(path.join(root, 'config/agents/w1.yaml'), `
agent_id: w1
tier: worker
domain: eng
context_policy:
  budget_bytes: 200000
  include:
    - class: bus
      scope: self
      priority: 10
      max_items: 2
allowed_writes:
  - wiki/agents/workers/w1/**
  - wiki/system/bus/discovery/**
forbidden_paths:
  - wiki/agents/orchestrators/**
  - wiki/agents/leads/**
`.trim())
  const c = rt.loadContract(root, 'w1')
  // Give the agent a bus class path match (bus items are in wiki/system/bus/discovery)
  // max_items: 2 should cap the class=bus rule to 2 items
  // Note: classFor returns 'bus' for wiki/system/bus/** paths
  // but the include rule here resolves files under the agent's own scope
  // Let's test via a glob path rule with max_items instead
  fs.writeFileSync(path.join(root, 'config/agents/w1.yaml'), `
agent_id: w1
tier: worker
domain: eng
context_policy:
  budget_bytes: 200000
  include:
    - path: wiki/system/bus/discovery/**
      priority: 10
      max_items: 2
allowed_writes:
  - wiki/agents/workers/w1/**
  - wiki/system/bus/discovery/**
forbidden_paths:
  - wiki/agents/orchestrators/**
  - wiki/agents/leads/**
`.trim())
  const c2 = rt.loadContract(root, 'w1')
  const bundle = rt.loadAgentContext(root, c2, {})
  assert.ok(bundle.files.length <= 2, `max_items: 2 should cap bus files, got ${bundle.files.length}`)
})

// ─── 14. Phase 4 — Promotion governance ──────────────────────────────────────

// Helper: create lead contract yaml in the fixture
function addLeadContract(root, agentId = 'l1') {
  fs.writeFileSync(path.join(root, `config/agents/${agentId}.yaml`), `
agent_id: ${agentId}
tier: lead
domain: eng
context_policy:
  budget_bytes: 40960
  include: []
allowed_writes:
  - wiki/agents/leads/${agentId}/**
  - wiki/system/bus/**
  - wiki/system/bus/standards/**
forbidden_paths: []
`.trim())
}

test('promoteDiscovery promotes open bus item to standards with provenance', () => {
  const root = makeFixture()
  addLeadContract(root)
  const { id } = rt.publishBusItem(root, { channel: 'discovery', from: 'w1', body: 'a useful finding' })
  // Human approver (not in contracts dir) — bypasses tier check
  const r = rt.promoteDiscovery(root, { channel: 'discovery', id, approver: 'jay' })
  assert.ok(fs.existsSync(path.join(root, r.target)), 'promoted artifact should exist')
  const content = fs.readFileSync(path.join(root, r.target), 'utf8')
  assert.match(content, /promoted_from/)
  assert.match(content, /promoted_by: jay/)
  const src = fs.readFileSync(path.join(root, r.source), 'utf8')
  assert.match(src, /status: promoted/)
})

test('promoteDiscovery passes when approver is a lead agent', () => {
  const root = makeFixture()
  addLeadContract(root)
  const { id } = rt.publishBusItem(root, { channel: 'discovery', from: 'w1', body: 'lead-approved finding' })
  // l1 is a lead — meets min tier requirement
  const r = rt.promoteDiscovery(root, { channel: 'discovery', id, approver: 'l1' })
  assert.ok(fs.existsSync(path.join(root, r.target)))
})

test('promoteDiscovery throws when worker agent tries to approve', () => {
  const root = makeFixture()
  // w1 is a worker — below the required lead tier
  const { id } = rt.publishBusItem(root, { channel: 'discovery', from: 'w1', body: 'worker cannot promote' })
  assert.throws(
    () => rt.promoteDiscovery(root, { channel: 'discovery', id, approver: 'w1' }),
    /does not meet minimum tier/
  )
})

test('promoteDiscovery throws on duplicate title and resolves when duplicateOf is supplied', () => {
  const root = makeFixture()
  // Seed a standards item with a specific title
  fs.mkdirSync(path.join(root, 'wiki/system/bus/standards'), { recursive: true })
  fs.writeFileSync(path.join(root, 'wiki/system/bus/standards/existing.md'),
    '---\ntitle: Hot Pattern\nstatus: active\nmemory_class: learned\n---\nExisting\n')

  const { id } = rt.publishBusItem(root, { channel: 'discovery', from: 'w1', body: 'same title', title: 'Hot Pattern' })
  // Update the bus item's title in the file
  const itemPath = path.join(root, `wiki/system/bus/discovery/${id}.md`)
  const content = fs.readFileSync(itemPath, 'utf8')
  fs.writeFileSync(itemPath, content.replace(/^---/, '---').replace(/title:.*\n/, '') .replace('---\n', '---\ntitle: Hot Pattern\n'))

  // Without duplicateOf → should throw
  assert.throws(
    () => rt.promoteDiscovery(root, { channel: 'discovery', id, approver: 'jay' }),
    /Duplicate title/
  )

  // With duplicateOf acknowledged → should succeed
  const r = rt.promoteDiscovery(root, { channel: 'discovery', id, approver: 'jay', duplicateOf: 'wiki/system/bus/standards/existing.md' })
  assert.ok(fs.existsSync(path.join(root, r.target)))
})

test('promoteDiscovery throws on target collision without supersedes', () => {
  const root = makeFixture()
  const target = 'wiki/system/bus/standards/already-there.md'
  fs.mkdirSync(path.join(root, path.dirname(target)), { recursive: true })
  fs.writeFileSync(path.join(root, target), '---\ntitle: Existing\n---\nOld content\n')

  const { id } = rt.publishBusItem(root, { channel: 'discovery', from: 'w1', body: 'collision test' })
  assert.throws(
    () => rt.promoteDiscovery(root, { channel: 'discovery', id, approver: 'jay', targetPath: target }),
    /already exists/
  )
})

test('promoteDiscovery archives existing when supersedes is set', () => {
  const root = makeFixture()
  const target = 'wiki/system/bus/standards/will-be-superseded.md'
  fs.mkdirSync(path.join(root, path.dirname(target)), { recursive: true })
  fs.writeFileSync(path.join(root, target), '---\ntitle: Old Version\n---\nOld\n')

  const { id } = rt.publishBusItem(root, { channel: 'discovery', from: 'w1', body: 'new version' })
  const r = rt.promoteDiscovery(root, {
    channel: 'discovery', id, approver: 'jay',
    targetPath: target,
    supersedes: target,
  })
  assert.ok(fs.existsSync(path.join(root, r.target)), 'new target should exist')
  // Archive of the old version should exist
  const archiveDir = path.join(root, 'wiki/archive/superseded')
  const archives = fs.existsSync(archiveDir) ? fs.readdirSync(archiveDir) : []
  assert.ok(archives.length > 0, 'archive should contain the superseded file')
})

test('promoteDiscovery throws when item is in non-promotable state', () => {
  const root = makeFixture()
  const { id } = rt.publishBusItem(root, { channel: 'discovery', from: 'w1', body: 'test' })
  // Transition to archived (non-promotable)
  rt.transitionBusItem(root, 'discovery', id, 'archived', 'test')
  assert.throws(
    () => rt.promoteDiscovery(root, { channel: 'discovery', id, approver: 'jay' }),
    /Cannot promote item.*archived/
  )
})

test('mergeRewrite requires supersedes when canonical already exists', () => {
  const root = makeFixture()
  const rwRel = 'wiki/agents/workers/w1/rewrites/specs/p1-dup.md'
  fs.mkdirSync(path.join(root, path.dirname(rwRel)), { recursive: true })
  fs.writeFileSync(path.join(root, rwRel), '---\nmemory_class: rewrite\nstatus: approved\nauthor: w1\n---\nNew content\n')

  const canRel = 'wiki/projects/p1/existing-canonical.md'
  fs.mkdirSync(path.join(root, path.dirname(canRel)), { recursive: true })
  fs.writeFileSync(path.join(root, canRel), '---\ntitle: Existing\n---\nOld content\n')

  // Without supersedes → should throw
  assert.throws(
    () => rt.mergeRewrite(root, { rewritePath: rwRel, canonicalPath: canRel, approver: 'jay' }),
    /supersedes/
  )

  // With supersedes → should succeed
  const r = rt.mergeRewrite(root, { rewritePath: rwRel, canonicalPath: canRel, approver: 'jay', supersedes: canRel })
  assert.ok(fs.existsSync(path.join(root, r.canonical)))
  const merged = fs.readFileSync(path.join(root, r.canonical), 'utf8')
  assert.match(merged, /New content/)
})

// ─── 15. Phase 5 — Task-local retention ──────────────────────────────────────

test('archiveCompletedTaskMemory archives completed files older than olderThanDays', () => {
  const root = makeFixture()
  const wmDir = path.join(root, 'wiki/agents/workers/w1/working-memory')
  fs.mkdirSync(wmDir, { recursive: true })

  const oldDate = new Date(Date.now() - 10 * 86400000).toISOString() // 10 days ago
  // Write a completed working-memory file with old completed_at
  fs.writeFileSync(path.join(wmDir, 'old-task.md'),
    `---\nmemory_class: working\nstatus: completed\ncompleted_at: ${oldDate}\n---\nDone.\n`)
  // Write an active file — should not be archived
  fs.writeFileSync(path.join(wmDir, 'active-task.md'),
    '---\nmemory_class: working\nstatus: active\n---\nIn progress.\n')

  const result = rt.archiveCompletedTaskMemory(root, 'w1', 'worker', { olderThanDays: 7 })
  assert.ok(result.archived.length >= 1, 'should have archived the completed file')
  assert.ok(!fs.existsSync(path.join(wmDir, 'old-task.md')), 'completed file should be moved')
  assert.ok(fs.existsSync(path.join(wmDir, 'active-task.md')), 'active file must NOT be archived')
})

test('archiveCompletedTaskMemory skips files completed within olderThanDays window', () => {
  const root = makeFixture()
  const wmDir = path.join(root, 'wiki/agents/workers/w1/working-memory')
  fs.mkdirSync(wmDir, { recursive: true })

  const recent = new Date(Date.now() - 2 * 86400000).toISOString() // 2 days ago (within 7-day window)
  fs.writeFileSync(path.join(wmDir, 'recent-task.md'),
    `---\nmemory_class: working\nstatus: completed\ncompleted_at: ${recent}\n---\nRecently done.\n`)

  const result = rt.archiveCompletedTaskMemory(root, 'w1', 'worker', { olderThanDays: 7 })
  assert.equal(result.archived.length, 0, 'recently completed file should not be archived')
  assert.ok(fs.existsSync(path.join(wmDir, 'recent-task.md')), 'file should still be present')
})

test('archiveAbandonedTaskMemory archives abandoned files older than olderThanDays', () => {
  const root = makeFixture()
  const wmDir = path.join(root, 'wiki/agents/workers/w1/working-memory')
  fs.mkdirSync(wmDir, { recursive: true })

  const oldDate = new Date(Date.now() - 5 * 86400000).toISOString() // 5 days ago (> 3-day default)
  fs.writeFileSync(path.join(wmDir, 'old-abandoned.md'),
    `---\nmemory_class: working\nstatus: abandoned\nabandoned_at: ${oldDate}\n---\nAbandoned.\n`)
  // Write a recently abandoned file — should stay
  const recent = new Date(Date.now() - 1 * 86400000).toISOString()
  fs.writeFileSync(path.join(wmDir, 'recent-abandoned.md'),
    `---\nmemory_class: working\nstatus: abandoned\nabandoned_at: ${recent}\n---\nJust abandoned.\n`)

  const result = rt.archiveAbandonedTaskMemory(root, 'w1', 'worker', { olderThanDays: 3 })
  assert.ok(result.archived.length >= 1, 'old abandoned file should be archived')
  assert.ok(!fs.existsSync(path.join(wmDir, 'old-abandoned.md')), 'old abandoned file should be moved')
  assert.ok(fs.existsSync(path.join(wmDir, 'recent-abandoned.md')), 'recently abandoned file should stay')
})

test('archiveCompletedTaskMemory returns empty when working-memory dir does not exist', () => {
  const root = makeFixture()
  // No working-memory dir created
  const result = rt.archiveCompletedTaskMemory(root, 'w1', 'worker', { olderThanDays: 7 })
  assert.deepEqual(result.archived, [])
  assert.equal(result.skipped, 0)
})
