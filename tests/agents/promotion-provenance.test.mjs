// Regression: promoteDiscovery read `confidence`, `related_sources` and
// `evidence_count` off the bus item to score it, then dropped all three when
// writing the promoted page. Two candidates at opposite ends of the evidence
// scale — one `confidence: high` with nine evidence points and three cited
// sources, one `confidence: low` with none — produced promoted frontmatter
// that was identical on every qualifier. An uncertain claim therefore read as
// unqualified fact to anyone loading the page, and the citations behind it
// were reachable only by following `source_path` back to the bus item.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import os from 'os'

import { promoteDiscovery } from '../../lib/agent-runtime/promotion.mjs'
import { parseFrontmatter } from '../../lib/agent-runtime/frontmatter.mjs'

const CONTRACT = { agent_id: 'lead-1', tier: 'lead', domain: 'platform' }

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'promo-prov-'))
  for (const d of ['wiki/system/bus/discovery', 'wiki/system/bus/standards', 'wiki/system/bus/review', 'logs']) {
    fs.mkdirSync(path.join(root, d), { recursive: true })
  }
  return root
}

function writeItem(root, id, fields) {
  const lines = Object.entries(fields).map(([k, v]) =>
    `${k}: ${Array.isArray(v) ? JSON.stringify(v) : v}`)
  fs.writeFileSync(
    path.join(root, `wiki/system/bus/discovery/${id}.md`),
    `---\nid: ${id}\nchannel: discovery\nstatus: open\ntitle: Finding ${id}\n` +
    `from: w1\ncreated_at: ${new Date().toISOString()}\n${lines.join('\n')}\n---\n\nbody of ${id}\n`,
  )
}

function promoteAndRead(root, id) {
  const result = promoteDiscovery(root, {
    channel: 'discovery', id, approver: 'jay', contract: CONTRACT, explicitApproval: true,
  })
  assert.notEqual(result.blocked, true, `${id} should clear the gate for this test`)
  const raw = fs.readFileSync(path.join(root, result.target), 'utf8')
  return parseFrontmatter(raw).data
}

test('a promoted page carries the confidence, sources and evidence count it was scored on', () => {
  const root = makeFixture()
  writeItem(root, 'disc-strong', {
    confidence: 'high',
    evidence_count: 9,
    related_sources: ['wiki/a.md', 'wiki/b.md', 'wiki/c.md'],
  })

  const fm = promoteAndRead(root, 'disc-strong')

  assert.equal(fm.confidence, 'high')
  assert.equal(fm.evidence_count, 9)
  assert.deepEqual(fm.related_sources, ['wiki/a.md', 'wiki/b.md', 'wiki/c.md'])
})

test('a low-confidence promotion is distinguishable from a high-confidence one', () => {
  const root = makeFixture()
  writeItem(root, 'disc-strong', {
    confidence: 'high', evidence_count: 9, related_sources: ['wiki/a.md', 'wiki/b.md'],
  })
  writeItem(root, 'disc-weak', {
    confidence: 'low', evidence_count: 1, related_sources: [],
  })

  const strong = promoteAndRead(root, 'disc-strong')
  const weak = promoteAndRead(root, 'disc-weak')

  // The whole point: these must not read alike.
  assert.notEqual(strong.confidence, weak.confidence)
  assert.equal(weak.confidence, 'low')
  assert.equal(weak.evidence_count, 1)
  assert.deepEqual(weak.related_sources, [])
  assert.deepEqual(strong.related_sources, ['wiki/a.md', 'wiki/b.md'])
})

test('the unscored path records the same defaults rather than omitting them', () => {
  const root = makeFixture()
  // No confidence/evidence_count/related_sources at all, promoted with the
  // scorer skipped — the path where nothing else would state a qualifier. The
  // page must carry the same medium/0/[] defaults scorePromotion applies, so
  // that "unstated" and "explicitly medium" are not indistinguishable and a
  // scored page and an unscored one can be compared on the same fields.
  writeItem(root, 'disc-bare', { note: 'none' })

  const result = promoteDiscovery(root, {
    channel: 'discovery', id: 'disc-bare', approver: 'jay', skipScorer: true,
  })
  assert.notEqual(result.blocked, true)
  const fm = parseFrontmatter(fs.readFileSync(path.join(root, result.target), 'utf8')).data

  assert.equal(fm.confidence, 'medium')
  assert.equal(fm.evidence_count, 0)
  assert.deepEqual(fm.related_sources, [])
})
