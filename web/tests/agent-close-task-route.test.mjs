// Characterization tests for web/src/app/api/agents/[id]/close-task/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 14 of the enumerated 36,
// following the same pattern as agent-dry-run-close-task-route.test.mjs
// (fresh KB_ROOT per file, route module imported after KB_ROOT is set so
// DEFAULT_KB_ROOT picks it up at module-load time).
//
// This route delegates entirely to lib/agent-runtime/writeback.mjs's
// closeTask(), which already has unit-level coverage via
// tests/agents/runtime.test.mjs (atomic commit, all-or-nothing rejection,
// rollback-on-partial-failure) and tests/agents/close-task-payload.test.mjs
// (payload validation). Neither file imports the route module, so the one
// thing those tests cannot show is this route's own HTTP-layer behavior:
// the 404 on an unknown agent id, the `request.json().catch(() => ({}))`
// fallback on an unparseable body, and that -- unlike its dry-run-close-task/
// sibling, which always answers HTTP 200 regardless of outcome -- this route
// maps `result.ok` to 200/422.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-close-task-kb-'))
process.env.KB_ROOT = KB_ROOT

function writeContract(id, extra = '') {
  const dir = path.join(KB_ROOT, 'config/agents')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${id}.yaml`), `
agent_id: ${id}
tier: worker
domain: eng
context_policy:
  budget_bytes: 20480
  include:
    - class: profile
      scope: self
      priority: 10
allowed_writes:
  - wiki/agents/workers/${id}/**
  - wiki/system/bus/discovery/**
forbidden_paths:
  - wiki/agents/orchestrators/**
${extra}
`.trim() + '\n')
}

let POST, NextRequest
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ POST } = await import('../src/app/api/agents/[id]/close-task/route.ts'))
  for (const d of ['wiki/agents/workers/w1', 'wiki/projects/p1', 'wiki/system/bus/discovery']) {
    fs.mkdirSync(path.join(KB_ROOT, d), { recursive: true })
  }
  writeContract('w1')
})

after(() => {
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
})

function postReq(id, body) {
  const url = new URL(`http://localhost/api/agents/${id}/close-task`)
  const init = body === undefined ? undefined : { method: 'POST', body: JSON.stringify(body) }
  return POST(new NextRequest(url, init), { params: Promise.resolve({ id }) })
}

test('POST for an unknown agent id returns 404, not a thrown error', async () => {
  const res = await postReq('no-such-agent', { project: 'p1' })
  assert.equal(res.status, 404)
  const json = await res.json()
  assert.equal(json.error, 'Agent not found')
})

test('POST with no request body at all still returns 200 (request.json() failure falls back to {}, empty plan commits as a no-op)', async () => {
  const res = await postReq('w1', undefined)
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.ok, true)
})

test('POST with a valid payload returns 200 and actually commits the writes to disk', async () => {
  const res = await postReq('w1', { project: 'p1', taskLogEntry: 'did a thing', discoveries: [{ body: 'found something' }] })
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.ok, true)
  assert.ok(json.trace.writes_committed.length >= 1)
  const log = fs.readFileSync(path.join(KB_ROOT, 'wiki/agents/workers/w1/task-log.md'), 'utf8')
  assert.match(log, /did a thing/)
})

test('POST with a forbidden rewrite returns 422 and commits nothing (all-or-nothing)', async () => {
  const res = await postReq('w1', {
    project: 'p1',
    taskLogEntry: 'should not land',
    rewrites: [{ type: '../../../leads/l1/evil', project: 'p1', body: 'evil rewrite' }],
  })
  assert.equal(res.status, 422)
  const json = await res.json()
  assert.equal(json.ok, false)
  assert.ok(json.rejected.length > 0)
  const logPath = path.join(KB_ROOT, 'wiki/agents/workers/w1/task-log.md')
  const log = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : ''
  assert.ok(!log.includes('should not land'))
})

test('unlike dry-run-close-task/, this route maps a dryRun:true payload\'s outcome to a real HTTP status', async () => {
  // closeTask() short-circuits on payload.dryRun === true the same way
  // dryRunCloseTask() does (nothing written either way), but this route's
  // `result.ok ? 200 : 422` means the *status itself* reflects wouldSucceed,
  // which is exactly the behavior the dry-run-close-task/ sibling's pinned
  // GAP says that route lacks.
  const logPath = path.join(KB_ROOT, 'wiki/agents/workers/w1/task-log.md')
  const before = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : null

  const ok = await postReq('w1', { project: 'p1', dryRun: true, taskLogEntry: 'would work' })
  assert.equal(ok.status, 200)
  assert.equal((await ok.json()).ok, true)

  const rejected = await postReq('w1', {
    project: 'p1',
    dryRun: true,
    rewrites: [{ type: '../../../leads/l1/evil', project: 'p1', body: 'evil rewrite' }],
  })
  assert.equal(rejected.status, 422)
  const json = await rejected.json()
  assert.equal(json.ok, false)
  assert.equal(json.dryRun, true)

  const after = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : null
  assert.equal(after, before, 'dryRun:true must not write anything, matching its sibling')
  assert.ok(!(after || '').includes('would work'), 'the dry-run taskLogEntry must never actually land')
})
