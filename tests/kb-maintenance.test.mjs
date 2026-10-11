import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { normalizeLinkTarget, isOrphanCandidate } from '../lib/wiki-lint.mjs'

const script = path.resolve('scripts/rebuild-orphan-hubs.mjs')

function tmpKb() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-'))
  fs.mkdirSync(path.join(root, 'wiki/reports'), { recursive: true })
  fs.mkdirSync(path.join(root, 'wiki/repos/agentic-kb/bus/escalation'), { recursive: true })
  fs.writeFileSync(path.join(root, 'wiki/reports/2026-10-01-nightly-ci-analysis.md'), '# a\n')
  fs.writeFileSync(path.join(root, 'wiki/reports/2026-10-02-nightly-ci-analysis.md'), '# b\n')
  fs.writeFileSync(path.join(root, 'wiki/reports/unrelated-note.md'), '# c\n')
  fs.writeFileSync(path.join(root, 'wiki/repos/agentic-kb/bus/escalation/escalation-2026-10-01-001.md'), '# e\n')
  return root
}
const run = (root, ...a) => execFileSync('node', [script, ...a], { env: { ...process.env, KB_REPO: root }, encoding: 'utf8' })

test('hub generator writes newest-first indexes of real files only', () => {
  const root = tmpKb()
  run(root)
  const hub = fs.readFileSync(path.join(root, 'wiki/mocs/nightly-ci-reports.md'), 'utf8')
  const links = [...hub.matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1])
  assert.deepEqual(links, ['reports/2026-10-02-nightly-ci-analysis', 'reports/2026-10-01-nightly-ci-analysis'])
  for (const l of links) assert.ok(fs.existsSync(path.join(root, 'wiki', `${l}.md`)), `${l} resolves`)
  assert.ok(!hub.includes('unrelated-note'), 'non-CI report is not swept in')
})

test('hub generator is idempotent and --check agrees', () => {
  const root = tmpKb()
  run(root)
  const before = fs.readFileSync(path.join(root, 'wiki/mocs/bus-escalations.md'), 'utf8')
  assert.match(run(root), /current: mocs\/bus-escalations\.md/)
  run(root, '--check') // exits 0 when up to date
  assert.equal(fs.readFileSync(path.join(root, 'wiki/mocs/bus-escalations.md'), 'utf8'), before)
})

test('--check exits non-zero when a new report arrives, and a rerun fixes it', () => {
  const root = tmpKb()
  run(root)
  fs.writeFileSync(path.join(root, 'wiki/reports/2026-10-03-nightly-ci-analysis.md'), '# new\n')
  assert.throws(() => run(root, '--check'))
  run(root)
  run(root, '--check')
})

test('escaped table pipes in wikilinks resolve', () => {
  assert.equal(normalizeLinkTarget('frameworks/framework-gsd\\|GSD'), 'frameworks/framework-gsd')
  assert.equal(normalizeLinkTarget('frameworks/framework-gsd|GSD'), 'frameworks/framework-gsd')
})

test('quarantined pages are not actionable orphans', () => {
  assert.equal(isOrphanCandidate('_quarantine/stray.md'), false)
  assert.equal(isOrphanCandidate('concepts/real-page.md'), true)
})
