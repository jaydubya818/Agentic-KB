/**
 * Tests for /foundry-propose pure helpers + dedup behavior.
 *
 * Run with: node --test tests/foundry-propose.test.mjs
 *
 * No filesystem writes to wiki/. CLI is exercised via subprocess against
 * a tmp dir wired to look like a mini Agentic-KB.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  parseCompileLog,
  parseCandidates,
  parseExistingProposals,
  detectStuckCandidates,
  detectRepeatGraduates,
  detectHeavyBacklog,
  runDetectors,
  dedupeProposals,
  formatProposal,
  proposalKey,
  DEFAULTS,
} from '../scripts/lib/foundry-propose-core.mjs'

// ─── parseCompileLog ────────────────────────────────────────────────────────

describe('parseCompileLog', () => {
  it('returns [] for empty input', () => {
    assert.deepEqual(parseCompileLog(''), [])
  })

  it('parses a single run with no graduates', () => {
    const text = '## 2026-04-21T10:30:00.000Z\n- promote: 5\n- defer:    20\n- graduate: 0\n'
    const runs = parseCompileLog(text)
    assert.equal(runs.length, 1)
    assert.equal(runs[0].promote, 5)
    assert.equal(runs[0].defer, 20)
    assert.equal(runs[0].graduate, 0)
    assert.deepEqual(runs[0].graduated, [])
    assert.equal(runs[0].ts.toISOString(), '2026-04-21T10:30:00.000Z')
  })

  it('parses graduated themes from a run', () => {
    const text = '## 2026-04-22T10:00:00.000Z\n- promote: 1\n- defer: 5\n- graduate: 2\n- graduated: foo, bar\n'
    const runs = parseCompileLog(text)
    assert.deepEqual(runs[0].graduated, ['foo', 'bar'])
  })

  it('sorts multiple runs oldest → newest', () => {
    const text = [
      '## 2026-04-22T10:00:00.000Z\n- promote: 1\n- defer: 1\n- graduate: 0\n',
      '## 2026-04-21T10:00:00.000Z\n- promote: 1\n- defer: 1\n- graduate: 0\n',
    ].join('')
    const runs = parseCompileLog(text)
    assert.equal(runs.length, 2)
    assert.equal(runs[0].ts.toISOString(), '2026-04-21T10:00:00.000Z')
    assert.equal(runs[1].ts.toISOString(), '2026-04-22T10:00:00.000Z')
  })

  it('ignores blocks with non-ISO header', () => {
    const text = '## not-a-date\n- promote: 99\n## 2026-04-21T10:00:00.000Z\n- promote: 1\n- defer: 1\n- graduate: 0\n'
    const runs = parseCompileLog(text)
    assert.equal(runs.length, 1)
    assert.equal(runs[0].promote, 1)
  })
})

// ─── parseCandidates ────────────────────────────────────────────────────────

describe('parseCandidates', () => {
  it('returns [] for empty input', () => {
    assert.deepEqual(parseCandidates(''), [])
  })

  it('parses standard candidates.md lines', () => {
    const text = '- foo  (1 source: src-a)\n- bar/baz  (1 source: src-b)\n'
    const out = parseCandidates(text)
    assert.deepEqual(out, [
      { theme: 'foo', source: 'src-a' },
      { theme: 'bar/baz', source: 'src-b' },
    ])
  })

  it('ignores lines that do not match the format', () => {
    const text = '# Compile Candidates\n\n- foo  (1 source: src-a)\nrandom text here\n'
    assert.equal(parseCandidates(text).length, 1)
  })
})

// ─── parseExistingProposals ─────────────────────────────────────────────────

describe('parseExistingProposals', () => {
  it('returns empty Set for empty input', () => {
    assert.equal(parseExistingProposals('').size, 0)
  })

  it('builds keys in TYPE:subject form', () => {
    const text = [
      '### PROP-001 [STUCK_CANDIDATE] foo',
      '',
      '- theme: foo',
      '',
      '### PROP-002 [REPEAT_GRADUATE] bar',
      '',
      '- theme: bar',
    ].join('\n')
    const set = parseExistingProposals(text)
    assert.equal(set.size, 2)
    assert.ok(set.has('STUCK_CANDIDATE:foo'))
    assert.ok(set.has('REPEAT_GRADUATE:bar'))
  })
})

// ─── detectStuckCandidates ──────────────────────────────────────────────────

describe('detectStuckCandidates', () => {
  it('returns [] when no candidates present', () => {
    const now = new Date('2026-04-25T00:00:00Z')
    assert.deepEqual(detectStuckCandidates([], [], now), [])
  })

  it('flags candidates when oldest run is older than threshold', () => {
    const now = new Date('2026-04-25T00:00:00Z')
    const runs = [{ ts: new Date('2026-03-01T00:00:00Z'), promote: 0, defer: 1, graduate: 0, graduated: [] }]
    const candidates = [{ theme: 'foo', source: 'src-a' }]
    const out = detectStuckCandidates(candidates, runs, now)
    assert.equal(out.length, 1)
    assert.equal(out[0].type, 'STUCK_CANDIDATE')
    assert.equal(out[0].theme, 'foo')
    assert.ok(out[0].ageDays > 30)
  })

  it('does NOT flag when oldest run is recent', () => {
    const now = new Date('2026-04-25T00:00:00Z')
    const runs = [{ ts: new Date('2026-04-20T00:00:00Z'), promote: 0, defer: 1, graduate: 0, graduated: [] }]
    const candidates = [{ theme: 'foo', source: 'src-a' }]
    assert.equal(detectStuckCandidates(candidates, runs, now).length, 0)
  })

  it('respects custom stuckDays threshold', () => {
    const now = new Date('2026-04-25T00:00:00Z')
    const runs = [{ ts: new Date('2026-04-20T00:00:00Z'), promote: 0, defer: 1, graduate: 0, graduated: [] }]
    const candidates = [{ theme: 'foo', source: 'src-a' }]
    // 5 days old, threshold 3 → flag
    assert.equal(detectStuckCandidates(candidates, runs, now, { stuckDays: 3 }).length, 1)
    // 5 days old, threshold 30 → no flag
    assert.equal(detectStuckCandidates(candidates, runs, now, { stuckDays: 30 }).length, 0)
  })
})

// ─── detectRepeatGraduates ──────────────────────────────────────────────────

describe('detectRepeatGraduates', () => {
  it('returns [] when no graduates', () => {
    assert.deepEqual(detectRepeatGraduates([]), [])
  })

  it('does NOT flag a one-time graduate', () => {
    const runs = [{ ts: new Date('2026-04-20T00:00:00Z'), promote: 0, defer: 0, graduate: 1, graduated: ['foo'] }]
    assert.equal(detectRepeatGraduates(runs).length, 0)
  })

  it('flags a theme that graduated twice', () => {
    const runs = [
      { ts: new Date('2026-04-10T00:00:00Z'), promote: 0, defer: 0, graduate: 1, graduated: ['foo'] },
      { ts: new Date('2026-04-15T00:00:00Z'), promote: 0, defer: 0, graduate: 0, graduated: [] },
      { ts: new Date('2026-04-20T00:00:00Z'), promote: 0, defer: 0, graduate: 1, graduated: ['foo'] },
    ]
    const out = detectRepeatGraduates(runs)
    assert.equal(out.length, 1)
    assert.equal(out[0].type, 'REPEAT_GRADUATE')
    assert.equal(out[0].theme, 'foo')
    assert.equal(out[0].graduateCount, 2)
    assert.equal(out[0].firstGraduated.toISOString(), '2026-04-10T00:00:00.000Z')
  })

  it('handles multiple flapping themes independently', () => {
    const runs = [
      { ts: new Date('2026-04-10T00:00:00Z'), promote: 0, defer: 0, graduate: 1, graduated: ['foo', 'bar'] },
      { ts: new Date('2026-04-20T00:00:00Z'), promote: 0, defer: 0, graduate: 1, graduated: ['foo'] },
    ]
    const out = detectRepeatGraduates(runs)
    assert.equal(out.length, 1)  // only foo flapped; bar graduated once
    assert.equal(out[0].theme, 'foo')
  })
})

// ─── detectHeavyBacklog ─────────────────────────────────────────────────────

describe('detectHeavyBacklog', () => {
  it('returns [] when no runs', () => {
    assert.deepEqual(detectHeavyBacklog([]), [])
  })

  it('does NOT flag when latest defer ≤ threshold', () => {
    const runs = [{ ts: new Date(), promote: 0, defer: 50, graduate: 0, graduated: [] }]
    assert.equal(detectHeavyBacklog(runs).length, 0)
  })

  it('flags when latest defer > threshold', () => {
    const runs = [{ ts: new Date('2026-04-25T00:00:00Z'), promote: 0, defer: 108, graduate: 0, graduated: [] }]
    const out = detectHeavyBacklog(runs)
    assert.equal(out.length, 1)
    assert.equal(out[0].type, 'HEAVY_BACKLOG')
    assert.equal(out[0].deferCount, 108)
    assert.equal(out[0].threshold, DEFAULTS.HEAVY_BACKLOG_DEFAULT)
  })

  it('respects custom threshold', () => {
    const runs = [{ ts: new Date(), promote: 0, defer: 25, graduate: 0, graduated: [] }]
    assert.equal(detectHeavyBacklog(runs, { threshold: 20 }).length, 1)
    assert.equal(detectHeavyBacklog(runs, { threshold: 100 }).length, 0)
  })

  it('only checks the latest run', () => {
    const runs = [
      { ts: new Date('2026-04-10T00:00:00Z'), promote: 0, defer: 999, graduate: 0, graduated: [] },
      { ts: new Date('2026-04-20T00:00:00Z'), promote: 0, defer: 5,   graduate: 0, graduated: [] },
    ]
    assert.equal(detectHeavyBacklog(runs).length, 0)
  })
})

// ─── runDetectors + dedupe + format ─────────────────────────────────────────

describe('runDetectors + dedupe', () => {
  it('runs all 3 detectors and orders STUCK → REPEAT → HEAVY', () => {
    const now = new Date('2026-04-25T00:00:00Z')
    const runs = [
      { ts: new Date('2026-03-01T00:00:00Z'), promote: 0, defer: 0,  graduate: 1, graduated: ['flapper'] },
      { ts: new Date('2026-04-15T00:00:00Z'), promote: 0, defer: 0,  graduate: 1, graduated: ['flapper'] },
      { ts: new Date('2026-04-25T00:00:00Z'), promote: 0, defer: 60, graduate: 0, graduated: [] },
    ]
    const candidates = [{ theme: 'stuck-one', source: 'src-a' }]
    const out = runDetectors({ candidates, runs, now })
    assert.equal(out.length, 3)
    assert.equal(out[0].type, 'STUCK_CANDIDATE')
    assert.equal(out[1].type, 'REPEAT_GRADUATE')
    assert.equal(out[2].type, 'HEAVY_BACKLOG')
  })

  it('dedupes against existing proposals', () => {
    const proposals = [
      { type: 'STUCK_CANDIDATE', theme: 'foo', source: 'src-a', firstSeen: new Date(), ageDays: 40, recommendation: 'x' },
      { type: 'STUCK_CANDIDATE', theme: 'bar', source: 'src-b', firstSeen: new Date(), ageDays: 40, recommendation: 'x' },
    ]
    const existing = new Set(['STUCK_CANDIDATE:foo'])
    const fresh = dedupeProposals(proposals, existing)
    assert.equal(fresh.length, 1)
    assert.equal(fresh[0].theme, 'bar')
  })
})

describe('formatProposal', () => {
  it('formats STUCK_CANDIDATE with PROP-### header', () => {
    const p = {
      type: 'STUCK_CANDIDATE',
      theme: 'foo',
      source: 'src-a',
      firstSeen: new Date('2026-03-01T00:00:00Z'),
      ageDays: 55,
      recommendation: 'find a 2nd source.',
    }
    const block = formatProposal(p, 7)
    assert.match(block, /^### PROP-007 \[STUCK_CANDIDATE\] foo$/m)
    assert.match(block, /age: 55 days/)
    assert.match(block, /find a 2nd source/)
  })

  it('format output round-trips through parseExistingProposals', () => {
    const p = { type: 'REPEAT_GRADUATE', theme: 'baz', graduateCount: 3, firstGraduated: new Date('2026-04-01T00:00:00Z'), recommendation: 'r' }
    const block = formatProposal(p, 12)
    const parsed = parseExistingProposals(block)
    assert.ok(parsed.has(proposalKey(p)), `key ${proposalKey(p)} should round-trip; parsed=${[...parsed]}`)
  })

  it('HEAVY_BACKLOG format includes the run timestamp in subject', () => {
    const p = {
      type: 'HEAVY_BACKLOG',
      deferCount: 108,
      threshold: 50,
      runTs: new Date('2026-04-25T16:00:00.000Z'),
      recommendation: 'r',
    }
    const block = formatProposal(p, 1)
    assert.match(block, /\[HEAVY_BACKLOG\] backlog:2026-04-25T16:00:00\.000Z/)
  })
})
