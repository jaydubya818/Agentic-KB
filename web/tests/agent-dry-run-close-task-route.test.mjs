// Characterization tests for web/src/app/api/agents/[id]/dry-run-close-task/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 13 of the enumerated 36,
// following the same pattern as tests/agent-audit-route.test.mjs (fresh
// KB_ROOT per file, GAPs pinned not fixed, route module imported after
// KB_ROOT is set so DEFAULT_KB_ROOT picks it up at module-load time).
//
// This route delegates entirely to lib/agent-runtime/writeback.mjs's
// dryRunCloseTask(), which already has unit-level coverage via
// tests/agents/runtime.test.mjs (policy rejection, forbidden-path
// rejection, and the "nothing is actually written" guarantee). Neither
// that file nor any other imports the route module, so the one thing
// those tests cannot show is this route's own HTTP-layer behavior: the
// 404 on an unknown agent id, the `request.json().catch(() => ({}))`
// fallback on an unparseable body, and -- the gap pinned below -- that
// this route, unlike its close-task/ sibling, always answers HTTP 200
// regardless of `wouldSucceed`.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-dry-run-close-kb-'))
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
  ;({ POST } = await import('../src/app/api/agents/[id]/dry-run-close-task/route.ts'))
  for (const d of ['wiki/agents/workers/w1', 'wiki/projects/p1', 'wiki/system/bus/discovery']) {
    fs.mkdirSync(path.join(KB_ROOT, d), { recursive: true })
  }
  writeContract('w1')
})

after(() => {
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
})

function postReq(id, body) {
  const url = new URL(`http://localhost/api/agents/${id}/dry-run-close-task`)
  const init = body === undefined ? undefined : { method: 'POST', body: JSON.stringify(body) }
  return POST(new NextRequest(url, init), { params: Promise.resolve({ id }) })
}

test('POST for an unknown agent id returns 404, not a thrown error', async () => {
  const res = await postReq('no-such-agent', { project: 'p1' })
  assert.equal(res.status, 404)
  const json = await res.json()
  assert.equal(json.error, 'Agent not found')
})

test('POST with no request body at all still returns 200 (request.json() failure falls back to {})', async () => {
  const res = await postReq('w1', undefined)
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(typeof json.wouldSucceed, 'boolean')
})

test('POST with a valid payload returns the full write plan, nothing written to disk', async () => {
  const res = await postReq('w1', { project: 'p1', taskLogEntry: 'did a thing', discoveries: [{ body: 'found something' }] })
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.wouldSucceed, true)
  assert.ok(json.planned.length >= 1)
  assert.equal(fs.existsSync(path.join(KB_ROOT, 'wiki/agents/workers/w1/task-log.md')), false)
})

test('GAP: a rejected plan (wouldSucceed:false) still answers HTTP 200, unlike the close-task/ sibling which maps ok:false to 422', async () => {
  const res = await postReq('w1', {
    project: 'p1',
    rewrites: [{ type: '../../../leads/l1/evil', project: 'p1', body: 'evil rewrite' }],
  })
  assert.equal(res.status, 200, 'the route returns NextResponse.json(preview) with no status override at all, so a would-be-rejected plan is indistinguishable from a successful one at the HTTP layer')
  const json = await res.json()
  assert.equal(json.wouldSucceed, false)
  assert.ok(json.rejected.length > 0)
})
