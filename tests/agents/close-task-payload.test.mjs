// Characterization tests for the two close-task payload validators:
//   lib/agent-runtime/writeback.mjs  validateCloseTaskPayload(kbRoot, contract, payload)
//   lib/repo-runtime/writeback.mjs   validateRepoCloseTaskPayload(contract, payload)
//
// Both are the first gate closeTask / closeRepoTask run before planning any
// write, and both were untested directly: runtime.test.mjs and
// repo-runtime.test.mjs only see them through a full closeTask. They share
// an identical `hasMeaningfulValue` and identical required_fields /
// at_least_one_of logic, so one matrix is run against both to keep the twins
// from drifting silently. The one deliberate difference — only the
// agent-runtime copy enforces require_active_task — is pinned by name.
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { validateCloseTaskPayload, startTask, activeTaskPath } from '../../lib/agent-runtime/index.mjs'
import { validateRepoCloseTaskPayload } from '../../lib/repo-runtime/index.mjs'

const NO_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'close-payload-'))
after(() => fs.rmSync(NO_ROOT, { recursive: true, force: true }))

function contract(close_policy) {
  return { agent_id: 'w1', tier: 'worker', close_policy }
}

// Both validators, normalised to { ok, errors } so the matrix can compare them.
const VALIDATORS = {
  agent: (c, p) => { const r = validateCloseTaskPayload(NO_ROOT, c, p); return { ok: r.ok, errors: r.errors } },
  repo: (c, p) => { const r = validateRepoCloseTaskPayload(c, p); return { ok: r.ok, errors: r.errors } },
}

const MATRIX = [
  // [name, close_policy, payload, expected errors]
  ['no policy at all accepts anything', undefined, {}, []],
  ['empty policy accepts an empty payload', {}, {}, []],
  ['required field present', { required_fields: ['taskLogEntry'] }, { taskLogEntry: 'did a thing' }, []],
  ['required field missing', { required_fields: ['taskLogEntry'] }, {},
    ['Missing required close-task field: taskLogEntry']],
  ['required field null', { required_fields: ['taskLogEntry'] }, { taskLogEntry: null },
    ['Missing required close-task field: taskLogEntry']],
  ['whitespace-only string is not meaningful', { required_fields: ['taskLogEntry'] }, { taskLogEntry: ' \n\t ' },
    ['Missing required close-task field: taskLogEntry']],
  ['empty array is not meaningful', { required_fields: ['rewrites'] }, { rewrites: [] },
    ['Missing required close-task field: rewrites']],
  ['non-empty array is meaningful', { required_fields: ['rewrites'] }, { rewrites: [{}] }, []],
  // Non-string, non-array values are taken at face value — including ones a
  // caller would probably not mean. Pinned so a tightening is deliberate.
  ['false is meaningful', { required_fields: ['dryRun'] }, { dryRun: false }, []],
  ['zero is meaningful', { required_fields: ['n'] }, { n: 0 }, []],
  ['empty object is meaningful', { required_fields: ['o'] }, { o: {} }, []],
  ['every missing required field is reported, in policy order',
    { required_fields: ['a', 'b', 'c'] }, { b: 'x' },
    ['Missing required close-task field: a', 'Missing required close-task field: c']],
  ['at_least_one_of satisfied by any one', { at_least_one_of: ['hotUpdate', 'gotcha'] }, { gotcha: 'g' }, []],
  ['at_least_one_of with none present', { at_least_one_of: ['hotUpdate', 'gotcha'] }, { hotUpdate: '' },
    ['Close-task requires at least one of: hotUpdate, gotcha']],
  ['an empty at_least_one_of list is no constraint', { at_least_one_of: [] }, {}, []],
  ['required and at_least_one_of failures are both reported',
    { required_fields: ['taskLogEntry'], at_least_one_of: ['hotUpdate', 'gotcha'] }, {},
    ['Missing required close-task field: taskLogEntry', 'Close-task requires at least one of: hotUpdate, gotcha']],
]

for (const [impl, validate] of Object.entries(VALIDATORS)) {
  for (const [name, policy, payload, expected] of MATRIX) {
    test(`${impl}: ${name}`, () => {
      const r = validate(contract(policy), payload)
      assert.deepEqual(r.errors, expected)
      assert.equal(r.ok, expected.length === 0)
    })
  }
}

test('both validators echo the policy they applied', () => {
  const policy = { required_fields: ['taskLogEntry'] }
  assert.equal(validateRepoCloseTaskPayload(contract(policy), {}).policy, policy)
  assert.equal(validateCloseTaskPayload(NO_ROOT, contract(policy), {}).policy, policy)
  // and substitute an empty object when the contract has none
  assert.deepEqual(validateRepoCloseTaskPayload({ agent_id: 'w1' }, {}).policy, {})
})

test('agent-runtime: require_active_task fails when the agent has no active task', () => {
  const r = validateCloseTaskPayload(NO_ROOT, contract({ require_active_task: true }), {})
  assert.equal(r.ok, false)
  assert.deepEqual(r.errors, ['Close-task requires an active task for this agent'])
  assert.equal(r.activeTask, null)
  // only a literal `true` enables the check
  for (const v of ['true', 1, undefined, false]) {
    assert.equal(validateCloseTaskPayload(NO_ROOT, contract({ require_active_task: v }), {}).ok, true, String(v))
  }
})

test('agent-runtime: require_active_task passes and returns the active task once one is started', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'close-payload-active-'))
  const c = { agent_id: 'w1', tier: 'worker', domain: 'eng', allowed_writes: ['wiki/agents/workers/w1/**'] }
  fs.mkdirSync(path.join(root, 'wiki/agents/workers/w1'), { recursive: true })
  const started = startTask(root, c, { project: 'p1', description: 'probe' })
  assert.ok(fs.existsSync(path.join(root, activeTaskPath(c))))

  const r = validateCloseTaskPayload(root, contract({ require_active_task: true }), {})
  assert.equal(r.ok, true)
  assert.equal(r.activeTask.taskId, started.taskId)
  assert.equal(r.activeTask.project, 'p1')
  fs.rmSync(root, { recursive: true, force: true })
})

test('GAP: repo-runtime ignores require_active_task entirely', () => {
  // lib/repo-runtime has no task-lifecycle (no active-task pointer, no
  // working memory), so closeRepoTask has nothing to check against and the
  // flag — which validateContract derives as `true` for any contract with
  // task_end_actions — is silently a no-op on the repo path. Pinned so that
  // a future repo task lifecycle inverts this deliberately.
  const r = validateRepoCloseTaskPayload(contract({ require_active_task: true }), {})
  assert.equal(r.ok, true)
  assert.deepEqual(r.errors, [])
  assert.equal('activeTask' in r, false)
})
