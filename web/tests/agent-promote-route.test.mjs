// Characterization tests for web/src/app/api/agents/promote/route.ts.
//
// docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry (2026-08-20,
// narrowed repeatedly) lists this route among the 8 still open as of
// 2026-10-26. This is the 29th of the enumerated 36 to land (not the 30th:
// a 2026-10-27 run mistakenly concluded all 8 remaining handlers were the
// same NOT_APPLICABLE class as compile/lint/process/query — direct Anthropic
// callers — but this route, process/run-all, search and vault-watch make no
// Anthropic call at all; see the backlog correction landed alongside this
// file).
//
// This route is a thin dispatcher over lib/agent-runtime/promotion.mjs's
// promoteDiscovery() (imported here as promoteLearning) and mergeRewrite(),
// both of which already have deep unit coverage in tests/agents/runtime.test.mjs
// and tests/agents/promotion-provenance.test.mjs. What those tests cannot show
// is this route's own HTTP-layer behavior: the action dispatch (default vs
// 'merge'), the 400 on a merge call missing either path, the identity-to-
// approver fallback (`body.approver || identity.id`), and — the one
// previously-undocumented gap this file pins — that the route's single
// catch-all collapses every failure from either underlying function, whatever
// its real nature (not-found, tier-rejection, bad state), into the same
// generic HTTP 400.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-promote-route-'))
process.env.KB_ROOT = KB_ROOT

function writeWorkerContract(id) {
  const dir = path.join(KB_ROOT, 'config/agents')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${id}.yaml`), `
agent_id: ${id}
tier: worker
domain: eng
context_policy:
  budget_bytes: 20480
  include: []
allowed_writes:
  - wiki/agents/workers/${id}/**
forbidden_paths: []
`.trim() + '\n')
}

let POST, NextRequest, publishBusItem
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ POST } = await import('../src/app/api/agents/promote/route.ts'))
  ;({ publishBusItem } = await import('../../lib/agent-runtime/bus.mjs'))
})
after(() => fs.rmSync(KB_ROOT, { recursive: true, force: true }))

function postReq(body, headers = {}) {
  const init = body === undefined
    ? { method: 'POST' }
    : { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) }
  return POST(new NextRequest('http://localhost/api/agents/promote', init))
}

test('default action (no `action` field) promotes an open bus item, with no headers the approver defaults to the anonymous identity', async () => {
  const { id } = publishBusItem(KB_ROOT, { channel: 'discovery', from: 'w1', body: 'worth promoting' })
  const res = await postReq({ channel: 'discovery', id })
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.caller.id, 'anonymous')
  assert.ok(fs.existsSync(path.join(KB_ROOT, json.target)))
  const target = fs.readFileSync(path.join(KB_ROOT, json.target), 'utf8')
  assert.match(target, /promoted_by: anonymous/)
})

test('body.approver overrides the resolved identity for the promotion record, independent of caller', async () => {
  const { id } = publishBusItem(KB_ROOT, { channel: 'discovery', from: 'w1', body: 'approver override' })
  const res = await postReq({ channel: 'discovery', id, approver: 'jay' }, { 'x-agent-id': 'scout' })
  const json = await res.json()
  assert.equal(res.status, 200)
  // caller reflects the resolved request identity...
  assert.equal(json.caller.id, 'scout')
  // ...but the committed provenance uses body.approver, not the caller.
  const target = fs.readFileSync(path.join(KB_ROOT, json.target), 'utf8')
  assert.match(target, /promoted_by: jay/)
})

test("action: 'merge' with neither rewritePath nor canonicalPath returns a clean 400, not a thrown error", async () => {
  const res = await postReq({ action: 'merge' })
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.error, 'merge requires rewritePath and canonicalPath')
})

test("action: 'merge' merges an approved rewrite into its canonical target", async () => {
  const rwRel = 'wiki/agents/workers/w1/rewrites/specs/p1-ts.md'
  fs.mkdirSync(path.dirname(path.join(KB_ROOT, rwRel)), { recursive: true })
  fs.writeFileSync(path.join(KB_ROOT, rwRel), '---\nmemory_class: rewrite\nstatus: approved\nauthor: w1\n---\n\nRoute-merged content\n')
  const canRel = 'wiki/projects/p1/spec-merged.md'

  const res = await postReq({ action: 'merge', rewritePath: rwRel, canonicalPath: canRel })
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.caller.id, 'anonymous')
  const merged = fs.readFileSync(path.join(KB_ROOT, json.canonical), 'utf8')
  assert.match(merged, /merged_from/)
  assert.match(merged, /Route-merged content/)
})

test('GAP: a tier-rejection from promoteDiscovery and a not-found bus item both collapse to the same generic 400 as a malformed request', async () => {
  // Case 1: a real failure deep in promotion governance — a worker-tier
  // approver, which validateApprover() rejects with "does not meet minimum
  // tier". This is a 403-shaped failure (the caller is identified and
  // authenticated, just not authorized) and the route cannot distinguish
  // it from a client mistake.
  writeWorkerContract('w1')
  const { id: openId } = publishBusItem(KB_ROOT, { channel: 'discovery', from: 'w1', body: 'needs a lead approver' })
  const tierRes = await postReq({ channel: 'discovery', id: openId, approver: 'w1' })
  assert.equal(tierRes.status, 400)
  const tierJson = await tierRes.json()
  assert.match(tierJson.error, /does not meet minimum tier/)

  // Case 2: a not-found bus item — arguably a 404 — produces the identical
  // HTTP status and the same response shape as case 1 and as the earlier
  // "missing rewritePath/canonicalPath" 400, even though the three failures
  // are not the same kind of error.
  const notFoundRes = await postReq({ channel: 'discovery', id: 'does-not-exist' })
  assert.equal(notFoundRes.status, 400)
  const notFoundJson = await notFoundRes.json()
  assert.match(notFoundJson.error, /Bus item not found/)
})

test('a request with no body at all falls back to {} (request.json() rejects on an empty body), and still answers 400 rather than throwing', async () => {
  const res = await postReq(undefined)
  assert.equal(res.status, 400)
  const json = await res.json()
  // channel/id are both undefined, so readBusItem's channel-allowlist check
  // fires before the bus item is even looked up.
  assert.match(json.error, /Unknown bus channel/)
})
