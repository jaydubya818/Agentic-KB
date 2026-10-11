import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateAlerts } from '../scripts/lib/alert-lifecycle.mjs'

const f = (value, threshold = 80) => [{ key: 'orphans', label: 'Orphans', value, threshold }]
const step = (state, value, day, threshold) => evaluateAlerts(state, f(value, threshold), day)

test('first breach is NEW and notifies', () => {
  const r = step({}, 96, '2026-10-11')
  assert.equal(r.results[0].status, 'NEW')
  assert.equal(r.actionable.length, 1)
})

test('unchanged breach is STANDING and does not notify', () => {
  let r = step({}, 96, '2026-10-11')
  r = step(r.state, 96, '2026-10-12')
  assert.equal(r.results[0].status, 'STANDING')
  assert.equal(r.actionable.length, 0)
  assert.equal(r.results[0].standingDays, 1)
  assert.equal(r.state.findings.orphans.firstSeen, '2026-10-11')
})

test('an improving but still-breached value stays STANDING', () => {
  let r = step({}, 96, '2026-10-11')
  r = step(r.state, 90, '2026-10-12')
  assert.equal(r.results[0].status, 'STANDING')
  assert.equal(r.actionable.length, 0)
})

test('an increase is WORSENING and notifies', () => {
  let r = step({}, 96, '2026-10-11')
  r = step(r.state, 99, '2026-10-12')
  assert.equal(r.results[0].status, 'WORSENING')
  assert.equal(r.actionable.length, 1)
})

test('dropping under the threshold is REMEDIATED once, then OK', () => {
  let r = step({}, 96, '2026-10-11')
  r = step(r.state, 10, '2026-10-12')
  assert.equal(r.results[0].status, 'REMEDIATED')
  assert.equal(r.actionable.length, 0)
  r = step(r.state, 10, '2026-10-13')
  assert.equal(r.results[0].status, 'OK')
})

test('returning after remediation is a REGRESSION', () => {
  let r = step({}, 96, '2026-10-11')
  r = step(r.state, 10, '2026-10-12')
  r = step(r.state, 10, '2026-10-13')
  r = step(r.state, 85, '2026-10-14')
  assert.equal(r.results[0].status, 'REGRESSION')
  assert.equal(r.actionable.length, 1)
})

test('a blocked finding stays quiet unless it worsens', () => {
  let r = step({}, 96, '2026-10-11')
  const state = { ...r.state, blocked: { orphans: 'needs owner decision' } }
  r = step(state, 96, '2026-10-12')
  assert.equal(r.results[0].status, 'BLOCKED')
  assert.equal(r.actionable.length, 0)
  r = step(r.state, 100, '2026-10-13')
  assert.equal(r.results[0].status, 'WORSENING')
})

test('thresholds are respected and never mutated by the lifecycle', () => {
  const r = step({}, 80, '2026-10-11')
  assert.equal(r.results[0].status, 'OK')
  assert.equal(r.results[0].threshold, 80)
})

test('state is byte-stable across unchanged days (no churn commits)', () => {
  let r = step({}, 96, '2026-10-11')
  const a = JSON.stringify(step(r.state, 96, '2026-10-12').state)
  const b = JSON.stringify(step(JSON.parse(a), 96, '2026-10-13').state)
  assert.equal(a, b)
})
