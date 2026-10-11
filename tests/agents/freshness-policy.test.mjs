import test from 'node:test'
import assert from 'node:assert/strict'
import {
  classifyFreshness,
  evaluateFreshness,
  freshnessBreakdown,
} from '../../lib/freshness-policy.mjs'
import { isStalePage } from '../../lib/wiki-lint.mjs'

const NOW = new Date('2026-10-11T00:00:00Z').getTime()
const daysAgo = n => new Date(NOW - n * 86400000).toISOString()

test('categories map to the documented cadences', () => {
  assert.equal(classifyFreshness('agents/workers/x/hot.md').days, 30)
  assert.equal(classifyFreshness('repos/pi/progress.md').days, 30)
  assert.equal(classifyFreshness('system/policies/freshness-policy.md').days, 90)
  assert.equal(classifyFreshness('patterns/pattern-a.md').days, 120)
  assert.equal(classifyFreshness('concepts/c.md').days, 180)
  assert.equal(classifyFreshness('decisions/d.md').days, null)
  assert.equal(classifyFreshness('summaries/s.md').days, null)
  assert.equal(classifyFreshness('action-tracker.md').days, 30)
})

test('same age, different verdict by category', () => {
  const age = daysAgo(100)
  assert.equal(evaluateFreshness({ relPath: 'agents/a/b/hot.md', updated: age }, NOW).state, 'stale')
  assert.equal(evaluateFreshness({ relPath: 'concepts/c.md', updated: age }, NOW).state, 'fresh')
})

test('event-driven pages never go stale on a calendar', () => {
  const v = evaluateFreshness({ relPath: 'decisions/d.md', updated: daysAgo(900) }, NOW)
  assert.equal(v.state, 'event-driven')
  assert.equal(isStalePage({ relPath: 'decisions/d.md', updated: daysAgo(900) }, NOW), false)
})

test('last_verified makes a page current without touching updated', () => {
  const page = { relPath: 'concepts/c.md', updated: daysAgo(400), lastVerified: daysAgo(10) }
  assert.equal(isStalePage({ relPath: 'concepts/c.md', updated: daysAgo(400) }, NOW), true)
  assert.equal(isStalePage(page, NOW), false)
  assert.equal(evaluateFreshness(page, NOW).basis, 'verified')
  assert.equal(page.updated, daysAgo(400)) // never rewritten
})

test('explicit front matter cadence beats the category default', () => {
  const page = { relPath: 'concepts/c.md', updated: daysAgo(100), staleAfterDays: 30 }
  assert.equal(isStalePage(page, NOW), true)
})

test('breakdown reports verified separately from fresh', () => {
  const rows = freshnessBreakdown([
    { relPath: 'concepts/a.md', updated: daysAgo(5), lastVerified: daysAgo(1) },
    { relPath: 'concepts/b.md', updated: daysAgo(500) },
    { relPath: 'decisions/d.md', updated: daysAgo(500) },
  ], NOW)
  assert.deepEqual(rows.reference, { total: 2, stale: 1, fresh: 1, eventDriven: 0, undated: 0, verified: 1 })
  assert.equal(rows.historical.eventDriven, 1)
})
