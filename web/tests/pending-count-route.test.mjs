// Characterization tests for web/src/app/api/pending-count/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed 2026-09-02/2026-09-05): route handler 2 of the
// enumerated set, following the same pattern as
// tests/agents-bus-route.test.mjs (fresh KB_ROOT per file, GAPs pinned not
// fixed — this route needs no auth, it is read-only, so it is not part of
// the requireAuth() chokepoint entry).
//
// One gap found and pinned here, not previously documented: the "already
// ingested" check has a substring fallback (route.ts's comment already
// flags it as an O(n) perf concern, but not as a correctness one) that can
// silently swallow an unrelated, never-ingested file out of the pending
// count whenever its path happens to contain an ingested *slug* as a
// substring. See "GAP" tests below.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'pending-count-route-test-'))
process.env.KB_ROOT = KB_ROOT

let GET
before(async () => {
  ;({ GET } = await import('../src/app/api/pending-count/route.ts'))
})
after(() => fs.rmSync(KB_ROOT, { recursive: true, force: true }))

beforeEach(() => {
  fs.rmSync(path.join(KB_ROOT, 'raw'), { recursive: true, force: true })
  fs.rmSync(path.join(KB_ROOT, 'wiki'), { recursive: true, force: true })
})

function writeFile(rel, content = '# x') {
  const full = path.join(KB_ROOT, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
}

async function count() {
  const json = await (await GET()).json()
  return json.count
}

test('no raw/ directory at all returns count 0', async () => {
  assert.equal(await count(), 0)
})

test('counts .md files under raw/ that are not in the ingested log', async () => {
  writeFile('raw/a.md')
  writeFile('raw/b.md')
  assert.equal(await count(), 2)
})

test('a file whose path exactly matches an INGEST log path is excluded', async () => {
  writeFile('raw/a.md')
  writeFile('raw/b.md')
  writeFile('wiki/log.md', '2026-08-01T00:00:00Z | INGEST | raw/a.md | ok\n')
  assert.equal(await count(), 1)
})

test('Untitled.md is always excluded, ingested or not', async () => {
  writeFile('raw/Untitled.md')
  writeFile('raw/real.md')
  assert.equal(await count(), 1)
})

test('recurses into ordinary subdirectories', async () => {
  writeFile('raw/nested/dir/file.md')
  assert.equal(await count(), 1)
})

test('my-agents, my-skills and my-hooks directories are skipped entirely', async () => {
  writeFile('raw/my-agents/skip-me.md')
  writeFile('raw/my-skills/skip-me.md')
  writeFile('raw/my-hooks/skip-me.md')
  writeFile('raw/counted.md')
  assert.equal(await count(), 1)
})

test('missing wiki/log.md is tolerated as "nothing ingested"', async () => {
  writeFile('raw/a.md')
  assert.equal(await count(), 1)
})

test('GAP: an INGEST slug (not a path) makes any unrelated file containing that ' +
     'substring silently uncounted, even though it was never ingested', async () => {
  // "notes" here is a *slug* from the log, not a raw/ path -- but the
  // substring fallback (`relPath.includes(p)`) matches it against any file
  // whose relative path happens to contain the string "notes" anywhere,
  // regardless of directory or relation to the real ingested item.
  writeFile('raw/archive/notes-backup.md')
  writeFile('wiki/log.md', '2026-08-02T00:00:00Z | INGEST | notes | ok\n')
  // A correct implementation would count this file as pending (it was
  // never ingested); the current one silently drops it to 0.
  assert.equal(await count(), 0)
})

test('GAP: the same substring collision does not require the collision to ' +
     'be in a subdirectory -- a same-named top-level file collides too', async () => {
  writeFile('raw/notes.md')
  writeFile('wiki/log.md', '2026-08-02T00:00:00Z | INGEST | notes | ok\n')
  // Correct behaviour for an *exact* slug match is arguably to exclude
  // this one -- it is the one the log entry actually names. The prior test
  // is the one that shows the fallback over-reaching past exact matches.
  assert.equal(await count(), 0)
})
