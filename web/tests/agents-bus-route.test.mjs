// Characterization tests for web/src/app/api/agents/bus/[channel]/route.ts.
//
// docs/NIGHTLY-BACKLOG.md ("One fail-closed requireAuth() chokepoint for the
// web write routes", 2026-08-20) lists this route among the writes with *no
// auth check at all*. These tests pin CURRENT behaviour, including two gaps
// not previously called out in that entry:
//   - `body.from` overrides the resolved caller identity outright, so any
//     caller can attribute a bus item to any actor id without even needing
//     the X-Agent-Id/X-Identity-* header spoof the backlog already documents.
//   - GET has no try/catch around listBusItems (POST does), so an unknown
//     channel rejects the handler's promise instead of returning a clean
//     JSON error the way POST does for the same input.
// Labelled GAP; not fixed here (auth design is a policy call for Jay, and the
// asymmetry is a smaller, separate judgment call — see escalation rules).
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts/[channel] is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'bus-route-test-'))
process.env.KB_ROOT = KB_ROOT

let POST, GET, NextRequest
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ POST, GET } = await import('../src/app/api/agents/bus/[channel]/route.ts'))
})
after(() => fs.rmSync(KB_ROOT, { recursive: true, force: true }))

function postReq(body, headers = {}) {
  return new NextRequest('http://localhost/api/agents/bus/discovery', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}
function getReq(qs = '') {
  return new NextRequest(`http://localhost/api/agents/bus/discovery${qs}`)
}
function ctx(channel = 'discovery') {
  return { params: Promise.resolve({ channel }) }
}

test('POST publishes a bus item under wiki/system/bus/<channel>/', async () => {
  const res = await POST(postReq({ body: 'hello' }, { 'x-agent-id': 'scout' }), ctx())
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.match(json.id, /^discovery-\d{4}-\d{2}-\d{2}-\d+$/)
  assert.equal(json.path, `wiki/system/bus/discovery/${json.id}.md`)
  assert.equal(fs.existsSync(path.join(KB_ROOT, json.path)), true)
})

test('POST resolves caller identity from X-Agent-Id when body.from is absent', async () => {
  const res = await POST(postReq({ body: 'x' }, { 'x-agent-id': 'scout' }), ctx())
  const json = await res.json()
  assert.equal(json.caller.id, 'scout')
  assert.equal(json.caller.kind, 'agent')
  const written = fs.readFileSync(path.join(KB_ROOT, json.path), 'utf8')
  assert.match(written, /from: "?scout"?\n/)
})

test('POST with no identity headers at all still succeeds, attributed to anonymous', async () => {
  const res = await POST(postReq({ body: 'x' }), ctx())
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.caller.id, 'anonymous')
})

test('GAP: body.from overrides resolved identity, so any caller can attribute to anyone', async () => {
  const res = await POST(postReq({ body: 'x', from: 'trusted-admin' }, { 'x-agent-id': 'scout' }), ctx())
  const json = await res.json()
  // The response still reports the resolved caller...
  assert.equal(json.caller.id, 'scout')
  // ...but the persisted item's `from` (the audited actor) is whatever the
  // request body claimed, unrelated to any header-resolved identity.
  const written = fs.readFileSync(path.join(KB_ROOT, json.path), 'utf8')
  assert.match(written, /from: "?trusted-admin"?\n/)
  assert.doesNotMatch(written, /from: "?scout"?\n/)
})

test('POST to an unknown channel returns a clean 400, not a thrown error', async () => {
  const res = await POST(postReq({ body: 'x' }), ctx('not-a-real-channel'))
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.match(json.error, /Unknown bus channel/)
})

test('GET lists published items for a channel, newest handling per compareBusItemsByCreatedAt', async () => {
  await POST(postReq({ body: 'first' }), ctx())
  await POST(postReq({ body: 'second' }), ctx())
  const res = await GET(getReq(), ctx())
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.channel, 'discovery')
  assert.ok(json.items.length >= 2)
})

test('GET on a channel with no published items returns an empty array, not an error', async () => {
  const res = await GET(getReq(), ctx('review'))
  const json = await res.json()
  assert.deepEqual(json.items, [])
})

test('GET respects the limit query param', async () => {
  for (let i = 0; i < 3; i++) await POST(postReq({ body: `item-${i}` }), ctx('handoffs'))
  const res = await GET(getReq('?limit=2'), ctx('handoffs'))
  const json = await res.json()
  assert.equal(json.items.length, 2)
})

test('GAP: GET on an unknown channel rejects (no try/catch), unlike POST\'s clean 400', async () => {
  await assert.rejects(
    () => GET(getReq(), ctx('not-a-real-channel')),
    /Unknown bus channel/
  )
})
