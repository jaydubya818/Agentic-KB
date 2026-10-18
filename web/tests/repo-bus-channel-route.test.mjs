// Characterization tests for web/src/app/api/repos/[repo]/bus/[channel]/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 19 of the enumerated 36,
// the repo-scoped sibling of the already-covered
// web/src/app/api/agents/bus/[channel]/route.ts (agents-bus-route.test.mjs).
//
// This route delegates to lib/repo-runtime/index.mjs's getRepo(),
// listRepoBusItems() and publishRepoBusItem() (lib/repo-runtime/bus.mjs),
// whose happy-path behavior already has unit-level coverage via
// tests/repos/repo-runtime.test.mjs. What that file does NOT cover, and
// what this file pins: this route's own HTTP-layer behavior -- the 404 on
// an unknown repo (checked before either list or publish runs), the
// status/limit query-param passthrough on GET, identity resolution via
// resolveIdentity() on POST, and the 400 on an unknown channel.
//
// Both gaps already pinned on the agent-scoped sibling
// (agents-bus-route.test.mjs) are present here too, confirmed rather than
// newly discovered -- this route is a near-verbatim copy of that one with
// repoName threaded through:
//   - body.from overrides the resolved caller identity outright, so any
//     caller can attribute a repo bus item to any actor id without needing
//     a header spoof.
//   - GET has no try/catch around listRepoBusItems (POST does), so an
//     unknown channel rejects the handler's promise instead of returning
//     the clean 400 POST returns for the same input.
// Labelled GAP; not fixed here (same reasoning as the sibling: auth design
// is a policy call for Jay, and the asymmetry is a smaller, separate
// judgment call -- see escalation rules).
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts/[repo]/[channel] is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-bus-route-test-'))
process.env.KB_ROOT = KB_ROOT

function writeRegistry(repos) {
  const dir = path.join(KB_ROOT, 'config/repos')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'registry.json'), JSON.stringify({ version: '1.0', repos }, null, 2))
}

let POST, GET, NextRequest
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ POST, GET } = await import('../src/app/api/repos/[repo]/bus/[channel]/route.ts'))
  writeRegistry([{ repo_name: 'test-repo', github_url: 'https://github.com/x/test-repo', status: 'synced' }])
})
after(() => fs.rmSync(KB_ROOT, { recursive: true, force: true }))

function postReq(repo, channel, body, headers = {}) {
  return POST(
    new NextRequest(`http://localhost/api/repos/${repo}/bus/${channel}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ repo, channel }) }
  )
}
function getReq(repo, channel, qs = '') {
  return GET(
    new NextRequest(`http://localhost/api/repos/${repo}/bus/${channel}${qs}`),
    { params: Promise.resolve({ repo, channel }) }
  )
}

test('GET for an unknown repo returns 404, not a thrown error', async () => {
  const res = await getReq('no-such-repo', 'discovery')
  assert.equal(res.status, 404)
  const json = await res.json()
  assert.equal(json.error, 'Repo not found')
})

test('POST for an unknown repo returns 404, checked before the channel is even validated', async () => {
  const res = await postReq('no-such-repo', 'not-a-real-channel', { body: 'x' })
  assert.equal(res.status, 404)
  const json = await res.json()
  assert.equal(json.error, 'Repo not found')
})

test('POST publishes a repo bus item under wiki/repos/<repo>/bus/<channel>/', async () => {
  const res = await postReq('test-repo', 'discovery', { body: 'hello' }, { 'x-agent-id': 'scout' })
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.match(json.id, /^discovery-\d{4}-\d{2}-\d{2}-\d+$/)
  assert.equal(json.path, `wiki/repos/test-repo/bus/discovery/${json.id}.md`)
  assert.equal(fs.existsSync(path.join(KB_ROOT, json.path)), true)
  const written = fs.readFileSync(path.join(KB_ROOT, json.path), 'utf8')
  assert.match(written, /repo_name: "?test-repo"?\n/)
})

test('POST resolves caller identity from X-Agent-Id when body.from is absent', async () => {
  const res = await postReq('test-repo', 'discovery', { body: 'x' }, { 'x-agent-id': 'scout' })
  const json = await res.json()
  assert.equal(json.caller.id, 'scout')
  assert.equal(json.caller.kind, 'agent')
  const written = fs.readFileSync(path.join(KB_ROOT, json.path), 'utf8')
  assert.match(written, /from: "?scout"?\n/)
})

test('POST with no identity headers at all still succeeds, attributed to anonymous', async () => {
  const res = await postReq('test-repo', 'discovery', { body: 'x' })
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.caller.id, 'anonymous')
})

test('GAP (confirmed, already pinned on the agent-scoped sibling): body.from overrides resolved identity', async () => {
  const res = await postReq('test-repo', 'discovery', { body: 'x', from: 'trusted-admin' }, { 'x-agent-id': 'scout' })
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
  const res = await postReq('test-repo', 'not-a-real-channel', { body: 'x' })
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.match(json.error, /Unknown repo bus channel/)
})

test('GET lists published items for a repo channel', async () => {
  await postReq('test-repo', 'handoffs', { body: 'first' })
  await postReq('test-repo', 'handoffs', { body: 'second' })
  const res = await getReq('test-repo', 'handoffs')
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.repo, 'test-repo')
  assert.equal(json.channel, 'handoffs')
  assert.ok(json.items.length >= 2)
})

test('GET on a channel with no published items returns an empty array, not an error', async () => {
  const res = await getReq('test-repo', 'standards')
  const json = await res.json()
  assert.deepEqual(json.items, [])
})

test('GET respects the limit query param', async () => {
  for (let i = 0; i < 3; i++) await postReq('test-repo', 'escalation', { body: `item-${i}` })
  const res = await getReq('test-repo', 'escalation', '?limit=2')
  const json = await res.json()
  assert.equal(json.items.length, 2)
})

test('GET respects the status query param', async () => {
  await postReq('test-repo', 'discovery', { body: 'status-filter-probe' })
  const resAll = await getReq('test-repo', 'discovery')
  const allJson = await resAll.json()
  const resOpen = await getReq('test-repo', 'discovery', '?status=open')
  const openJson = await resOpen.json()
  assert.equal(openJson.items.length, allJson.items.length)
  const resClosed = await getReq('test-repo', 'discovery', '?status=closed')
  const closedJson = await resClosed.json()
  assert.deepEqual(closedJson.items, [])
})

test('GAP (confirmed, already pinned on the agent-scoped sibling): GET on an unknown channel rejects (no try/catch), unlike POST\'s clean 400', async () => {
  await assert.rejects(
    () => getReq('test-repo', 'not-a-real-channel'),
    /Unknown repo bus channel/
  )
})
