import test from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeLinkTarget,
  buildInboundLinkMap,
  isOrphanCandidate,
  isStalePage,
} from '../../lib/wiki-lint.mjs'

test('normalizeLinkTarget strips wiki prefix, alias, anchors, and extension', () => {
  assert.equal(normalizeLinkTarget('[[wiki/action-tracker|Action Tracker]]'), 'action-tracker')
  assert.equal(normalizeLinkTarget('./concepts/agent-failure-modes.md#taxonomy'), 'concepts/agent-failure-modes')
})

test('buildInboundLinkMap counts wiki-prefixed links as inbound links', () => {
  const pages = [
    { relPath: 'index.md', links: ['[[wiki/action-tracker|Action Tracker]]'] },
    { relPath: 'action-tracker.md', links: [] },
  ]

  const inbound = buildInboundLinkMap(pages)
  assert.deepEqual(inbound.get('action-tracker.md'), ['index.md'])
})

test('isOrphanCandidate ignores operational and generated pages', () => {
  assert.equal(isOrphanCandidate('system/bus/discovery/discovery-2026-04-25-001.md'), false)
  assert.equal(isOrphanCandidate('agents/workers/w1/working-memory/task-1.md'), false)
  assert.equal(isOrphanCandidate('agents/workers/w1/profile.md'), false)
  assert.equal(isOrphanCandidate('concepts/agent-failure-modes.md'), true)
})

test('isStalePage respects stale_after_days override', () => {
  const fourHundredDaysAgo = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  assert.equal(isStalePage({ relPath: 'patterns/pattern-a.md', updated: fourHundredDaysAgo }), true)
  assert.equal(
    isStalePage({ relPath: 'patterns/pattern-a.md', updated: fourHundredDaysAgo, staleAfterDays: 730 }),
    false,
  )
})
