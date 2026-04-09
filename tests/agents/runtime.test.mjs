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
