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
