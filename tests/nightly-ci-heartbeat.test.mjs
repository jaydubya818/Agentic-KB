import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { evaluateHeartbeat } from '../scripts/check-nightly-ci-heartbeat.mjs'

const NOW = new Date('2026-09-01T12:00:00.000Z')

describe('nightly CI heartbeat watchdog', () => {
  it('accepts a recent successful native run', () => {
    const result = evaluateHeartbeat({
      finished_at: '2026-09-01T06:00:00.000Z',
      status: 'ok',
    }, { now: NOW, maxAgeHours: 36 })

    assert.equal(result.healthy, true)
    assert.equal(result.status, 'ok')
  })

  it('rejects a stale heartbeat even when the recorded run succeeded', () => {
    const result = evaluateHeartbeat({
      finished_at: '2026-08-29T00:00:00.000Z',
      status: 'ok',
    }, { now: NOW, maxAgeHours: 36 })

    assert.equal(result.healthy, false)
    assert.match(result.message, /heartbeat is 84\.0 hours old/)
  })

  it('keeps the incident open for a recent fallback or partial run', () => {
    const result = evaluateHeartbeat({
      finished_at: '2026-09-01T06:00:00.000Z',
      status: 'partial',
    }, { now: NOW, maxAgeHours: 36 })

    assert.equal(result.healthy, false)
    assert.match(result.message, /latest run status is partial/)
  })

  it('rejects missing or invalid timestamps', () => {
    const result = evaluateHeartbeat({ status: 'ok' }, { now: NOW })
    assert.equal(result.healthy, false)
    assert.equal(result.status, 'invalid')
  })

  it('manages a dedicated watchdog issue without owning issue #5', () => {
    const workflow = fs.readFileSync('.github/workflows/nightly-ci-heartbeat.yml', 'utf8')

    assert.match(workflow, /nightly-ci-heartbeat-watchdog/)
    assert.match(workflow, /issues\.create/)
    assert.doesNotMatch(workflow, /issueNumber\s*=\s*5|issue_number:\s*5/)
  })
})
