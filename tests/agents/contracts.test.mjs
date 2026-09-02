// Characterization tests for validateContract / normalizeClosePolicy in
// lib/agent-runtime/contracts.mjs.
//
// validateContract is the only thing standing between config/agents/*.yaml
// and the write guard: allowed_writes, forbidden_paths and vault_writes go
// straight from here into assertWriteAllowed, and close_policy decides what
// closeTask will accept. runtime.test.mjs covers the happy path and one
// close_policy derivation; the rejection branches had no direct test, so a
// regression that let a malformed contract through (or rejected a valid one)
// would only surface at the first closeTask. These pin CURRENT behaviour.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { validateContract, normalizeClosePolicy } from '../../lib/agent-runtime/contracts.mjs'

function base(overrides = {}) {
  return { agent_id: 'w1', tier: 'worker', ...overrides }
}

function errorsFor(contract) {
  try {
    validateContract(contract)
  } catch (e) {
    assert.ok(Array.isArray(e.errors), 'thrown error carries an errors[] array')
    assert.match(e.message, /^Invalid contract /)
    return e.errors
  }
  assert.fail('expected validateContract to throw')
}

test('a minimal contract validates and receives every default', () => {
  const c = validateContract(base())
  assert.deepEqual(c.allowed_writes, [])
  assert.deepEqual(c.forbidden_paths, [])
  assert.deepEqual(c.context_policy, { include: [], subscriptions: {}, budget_bytes: 40960 })
  assert.deepEqual(c.close_policy, { required_fields: [], at_least_one_of: [], require_active_task: false })
})

test('agent_id and tier are required, and tier is a closed enum', () => {
  assert.deepEqual(errorsFor({ tier: 'worker' }), ['missing agent_id'])
  assert.deepEqual(errorsFor({ agent_id: 42, tier: 'worker' }), ['agent_id must be string'])
  assert.deepEqual(errorsFor({ agent_id: 'w1' }), ['missing tier'])
  assert.deepEqual(errorsFor(base({ tier: 'admin' })), ['invalid tier: admin'])
  assert.deepEqual(errorsFor(base({ tier: 'Worker' })), ['invalid tier: Worker'])
  for (const tier of ['orchestrator', 'lead', 'worker']) {
    assert.equal(validateContract(base({ tier })).tier, tier)
  }
  // The message names the agent when it can, and all errors are aggregated.
  assert.throws(() => validateContract({ agent_id: 'w1', tier: 'x', allowed_writes: 'a' }),
    /Invalid contract w1: invalid tier: x; allowed_writes must be array/)
  assert.throws(() => validateContract({}), /Invalid contract \(unknown\): missing agent_id; missing tier/)
})

test('the four path lists must be arrays when present', () => {
  for (const key of ['allowed_writes', 'forbidden_paths', 'read_denylist', 'vault_writes']) {
    assert.deepEqual(errorsFor(base({ [key]: 'wiki/**' })), [`${key} must be array`], key)
    assert.deepEqual(errorsFor(base({ [key]: { a: 1 } })), [`${key} must be array`], key)
    // null and undefined mean "not set", not "wrong type"
    assert.doesNotThrow(() => validateContract(base({ [key]: null })), key)
  }
  assert.deepEqual(errorsFor(base({ permitted_cross_tier_reads: 'wiki/**' })),
    ['permitted_cross_tier_reads must be array of glob patterns'])
  assert.deepEqual(errorsFor(base({ vault_id: 7 })), ['vault_id must be string when set'])
})

test('allowed_writes and vault_writes reject absolute and dot-segment patterns', () => {
  for (const key of ['allowed_writes', 'vault_writes']) {
    assert.deepEqual(errorsFor(base({ [key]: ['/etc/**'] })), [`${key} unsafe pattern: /etc/**`], key)
    assert.deepEqual(errorsFor(base({ [key]: ['wiki/../raw/**'] })), [`${key} unsafe pattern: wiki/../raw/**`], key)
    assert.deepEqual(errorsFor(base({ [key]: [42] })), [`${key} entry not string: 42`], key)
    // a mixed list reports every bad entry, not just the first
    assert.deepEqual(errorsFor(base({ [key]: ['wiki/**', '/x', 'a/../b', null] })), [
      `${key} unsafe pattern: /x`,
      `${key} unsafe pattern: a/../b`,
      `${key} entry not string: null`,
    ], key)
  }
})

test('forbidden_paths entries must be strings but are not checked for traversal', () => {
  // A deny rule that over-matches only denies more, so `..` and `/` are
  // tolerated here; only the type is enforced.
  assert.deepEqual(errorsFor(base({ forbidden_paths: [1] })), ['forbidden_paths entry not string: 1'])
  const c = validateContract(base({ forbidden_paths: ['/abs/**', 'a/../b'] }))
  assert.deepEqual(c.forbidden_paths, ['/abs/**', 'a/../b'])
})

test('context_policy shape is validated and partially defaulted', () => {
  assert.deepEqual(errorsFor(base({ context_policy: 'all' })), ['context_policy must be object'])
  assert.deepEqual(errorsFor(base({ context_policy: { include: 'wiki/**' } })), ['context_policy.include must be array'])
  assert.deepEqual(errorsFor(base({ context_policy: { subscriptions: 'bus' } })), ['context_policy.subscriptions must be object'])
  for (const bad of [0, -1, '1000']) {
    assert.deepEqual(errorsFor(base({ context_policy: { budget_bytes: bad } })),
      ['context_policy.budget_bytes must be positive number'], String(bad))
  }
  // null means "unset" and is accepted
  assert.doesNotThrow(() => validateContract(base({ context_policy: { budget_bytes: null } })))
})

test('context_policy.budget_bytes accepts NaN (current behaviour, not a contract)', () => {
  // `typeof NaN === 'number'` and `NaN <= 0` is false, so the guard passes.
  // Recorded so a fix here is deliberate; YAML cannot express NaN without
  // `.nan`, so no shipped contract reaches this.
  const c = validateContract(base({ context_policy: { budget_bytes: NaN } }))
  assert.ok(Number.isNaN(c.context_policy.budget_bytes))
})

test('a context_policy without include/budget keeps the caller values and only fills include', () => {
  const c = validateContract(base({ context_policy: { budget_bytes: 1024 } }))
  assert.deepEqual(c.context_policy, { budget_bytes: 1024, include: [] })
})

test('every include rule needs an object with a path or a class, and a numeric priority', () => {
  assert.deepEqual(errorsFor(base({ context_policy: { include: ['wiki/**'] } })), ['include[0] must be object'])
  assert.deepEqual(errorsFor(base({ context_policy: { include: [null] } })), ['include[0] must be object'])
  assert.deepEqual(errorsFor(base({ context_policy: { include: [{ priority: 1 }] } })), ['include[0] needs path or class'])
  assert.deepEqual(errorsFor(base({ context_policy: { include: [{ path: 'a', priority: 'high' }] } })),
    ['include[0].priority must be number'])
  // index is reported per rule
  assert.deepEqual(errorsFor(base({ context_policy: { include: [{ path: 'a' }, {}, 'x'] } })),
    ['include[1] needs path or class', 'include[2] must be object'])
  assert.doesNotThrow(() => validateContract(base({ context_policy: { include: [{ class: 'hot' }, { path: 'a', priority: 2 }] } })))
})

test('validateContract returns the same (mutated) object it was given', () => {
  const input = base()
  const out = validateContract(input)
  assert.equal(out, input)
  assert.ok('close_policy' in input)
})

test('normalizeClosePolicy: explicit fields win field-by-field over derivation', () => {
  const derivedOnly = normalizeClosePolicy({ task_end_actions: ['append_sprint_state'] })
  assert.deepEqual(derivedOnly, { required_fields: ['taskLogEntry'], at_least_one_of: [], require_active_task: true })

  // Only the keys that are the right type override; the rest stay derived.
  const mixed = normalizeClosePolicy({
    task_end_actions: ['append_decisions'],
    close_policy: { required_fields: 'taskLogEntry', require_active_task: false, at_least_one_of: ['a', 'b'] },
  })
  assert.deepEqual(mixed, { required_fields: ['taskLogEntry'], at_least_one_of: ['a', 'b'], require_active_task: false })

  // An explicit empty required_fields is honoured (it is an array), so a
  // contract can opt out of the derived taskLogEntry requirement.
  const optOut = normalizeClosePolicy({ task_end_actions: ['append_task_log'], close_policy: { required_fields: [] } })
  assert.deepEqual(optOut.required_fields, [])
  assert.equal(optOut.require_active_task, true)

  // A non-object close_policy is ignored rather than rejected.
  assert.deepEqual(normalizeClosePolicy({ close_policy: 'strict' }),
    { required_fields: [], at_least_one_of: [], require_active_task: false })
})

test('close_policy derivation: only the three append_* actions require a taskLogEntry', () => {
  const none = normalizeClosePolicy({ task_end_actions: ['update_hot_memory', 'publish_discoveries'] })
  assert.deepEqual(none.required_fields, [])
  assert.equal(none.require_active_task, true, 'any task_end_action requires an active task')
  for (const action of ['append_task_log', 'append_sprint_state', 'append_decisions']) {
    assert.deepEqual(normalizeClosePolicy({ task_end_actions: [action] }).required_fields, ['taskLogEntry'], action)
  }
  // duplicates collapse
  assert.deepEqual(normalizeClosePolicy({ task_end_actions: ['append_task_log', 'append_decisions'] }).required_fields, ['taskLogEntry'])
  // a non-array task_end_actions is treated as none
  assert.equal(normalizeClosePolicy({ task_end_actions: 'append_task_log' }).require_active_task, false)
})
