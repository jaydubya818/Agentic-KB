// Characterization tests for web/src/app/api/process/pending/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 24 of the enumerated 36.
//
// This route walks KB_ROOT/raw recursively, skips the my-agents/my-skills/
// my-hooks system dirs and any file literally named Untitled.md, and marks
// each surviving file alreadyIngested by checking wiki/log.md for either an
// exact raw/ path match or a looser two-way substring match against an
// "INGEST | <slug> |" reference. That looser match is the route's only
// non-trivial logic and is where this file's GAP test lives.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'process-pending-kb-'))
process.env.KB_ROOT = KB_ROOT

function write(relPath, content = 'body\n') {
  const full = path.join(KB_ROOT, relPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
}

let GET
before(async () => {
  write('raw/notes/alpha.md')
  write('raw/transcripts/beta.md')
  write('raw/notes/Untitled.md')
  write('raw/my-agents/should-be-skipped.md')
  write('raw/my-skills/also-skipped.md')
  write('raw/my-hooks/also-skipped-too.md')

  write(
    'wiki/log.md',
    [
      '| 2026-10-22 | INGEST | raw/notes/alpha.md | promoted |',
      '',
    ].join('\n')
  )

  ;({ GET } = await import('../src/app/api/process/pending/route.ts'))
})

after(() => {
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
})

test('lists .md files under raw/, skipping system dirs and Untitled.md', async () => {
  const res = await GET()
  assert.equal(res.status, 200)
  const json = await res.json()
  const paths = json.files.map((f) => f.path).sort()
  assert.deepEqual(paths, ['raw/notes/alpha.md', 'raw/transcripts/beta.md'])
  assert.equal(json.total, 2)
})

test('derives type from the path segment after raw/', async () => {
  const res = await GET()
  const json = await res.json()
  const byPath = Object.fromEntries(json.files.map((f) => [f.path, f]))
  assert.equal(byPath['raw/notes/alpha.md'].type, 'notes')
  assert.equal(byPath['raw/transcripts/beta.md'].type, 'transcripts')
})

test('title-cases the filename stem', async () => {
  const res = await GET()
  const json = await res.json()
  const alpha = json.files.find((f) => f.path === 'raw/notes/alpha.md')
  assert.equal(alpha.title, 'Alpha')
})

test('marks a file alreadyIngested when wiki/log.md names its exact raw/ path', async () => {
  const res = await GET()
  const json = await res.json()
  const alpha = json.files.find((f) => f.path === 'raw/notes/alpha.md')
  const beta = json.files.find((f) => f.path === 'raw/transcripts/beta.md')
  assert.equal(alpha.alreadyIngested, true)
  assert.equal(beta.alreadyIngested, false)
})

test('sorts already-ingested files after the rest', async () => {
  const res = await GET()
  const json = await res.json()
  const flags = json.files.map((f) => f.alreadyIngested)
  const firstIngestedIndex = flags.indexOf(true)
  const lastPendingIndex = flags.lastIndexOf(false)
  assert.ok(
    firstIngestedIndex === -1 || lastPendingIndex === -1 || lastPendingIndex < firstIngestedIndex,
    `expected every alreadyIngested:false entry before every alreadyIngested:true entry, got ${JSON.stringify(flags)}`
  )
})

test('returns an empty list when raw/ does not exist, instead of throwing', async () => {
  // walk() is called fresh on every GET() -- no re-import needed, just
  // remove and restore raw/ within the same KB_ROOT the module already
  // captured.
  const rawDir = path.join(KB_ROOT, 'raw')
  const backupDir = path.join(KB_ROOT, 'raw-backup-for-test')
  fs.renameSync(rawDir, backupDir)
  try {
    const res = await GET()
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.deepEqual(json.files, [])
    assert.equal(json.total, 0)
  } finally {
    fs.renameSync(backupDir, rawDir)
  }
})

// GAP: the "already ingested" fallback check is a two-way substring match
// between the raw/ path and every log reference, not an exact or path-aware
// match. A short, unrelated slug extracted from an "INGEST | <slug> |" line
// elsewhere in wiki/log.md can be a substring of an unrelated file's
// basename, marking that unrelated file alreadyIngested even though it was
// never mentioned. Pinned, not fixed -- tightening the match (e.g. requiring
// a full relPath or a path-boundary-aware basename comparison) is a decision
// about what "referenced in the log" should mean, not a bug this route
// introduced on its own; the ingest views already tolerate occasional
// false-positive "already ingested" labels as informational, not gating.
test('GAP: an unrelated short slug can substring-match an unrelated filename', async () => {
  write('raw/notes/notes-on-things.md')
  write(
    'wiki/log.md',
    [
      '| 2026-10-22 | INGEST | raw/notes/alpha.md | promoted |',
      '| 2026-10-22 | INGEST | notes | unrelated short slug |',
      '',
    ].join('\n')
  )
  const res = await GET()
  const json = await res.json()
  const falsePositive = json.files.find((f) => f.path === 'raw/notes/notes-on-things.md')
  assert.ok(falsePositive, 'fixture file should be present')
  assert.equal(
    falsePositive.alreadyIngested,
    true,
    'an 8-character unrelated slug ("notes") is a substring of this file\'s own basename, so it is reported as already ingested with no real reference to it in the log'
  )
})
