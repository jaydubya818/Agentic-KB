// Characterization tests for web/src/app/api/agents/[id]/audit/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 10 of the enumerated 36,
// following the same pattern as tests/switch-vault-route.test.mjs (fresh
// KB_ROOT per file, GAPs pinned not fixed, route module imported after
// KB_ROOT is set so DEFAULT_KB_ROOT picks it up at module-load time).
//
// This route delegates to lib/agent-runtime/audit.mjs's readRecentAudit(),
// which already has unit-level coverage via tests/agents/audit-chain.test.mjs
// and tests/agents/runtime.test.mjs -- but neither exercises the route's own
// HTTP-layer behavior: query-string parsing of `limit`/`op`, the `agent_id`
// passthrough, or the no-log-file case. That seam is what this file covers.
//
// One previously-undocumented gap pinned, not fixed: readRecentAudit()
// applies the limit via `parsed.slice(-limit)`. When the `limit` query
// param is non-numeric, `parseInt(..., 10)` produces NaN, and
// `Array.prototype.slice(-NaN)` coerces to `slice(0)` per the ECMA
// ToIntegerOrInfinity(NaN) = 0 rule -- i.e. the *entire* filtered history is
// returned, silently bypassing both the requested limit and the documented
// default of 50. A caller that passes a bad limit gets unbounded output
// instead of an error or the default.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-audit-kb-'))
process.env.KB_ROOT = KB_ROOT
const LOG_PATH = path.join(KB_ROOT, 'logs', 'audit.log')

let GET, NextRequest
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ GET } = await import('../src/app/api/agents/[id]/audit/route.ts'))
})

after(() => {
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
})

beforeEach(() => {
  fs.rmSync(LOG_PATH, { force: true })
})

function writeLog(entries) {
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true })
  fs.writeFileSync(LOG_PATH, entries.map(e => JSON.stringify(e)).join('\n') + '\n')
}

function getReq(id, query) {
  const url = new URL(`http://localhost/api/agents/${id}/audit`)
  for (const [k, v] of Object.entries(query || {})) url.searchParams.set(k, v)
  return GET(new NextRequest(url), { params: Promise.resolve({ id }) })
}

test('GET with no audit.log at all returns an empty entries array, not an error', async () => {
  const res = await getReq('agent-1')
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.agent_id, 'agent-1')
  assert.deepEqual(json.entries, [])
})

test('GET filters to only the requested agent_id, most-recent first', async () => {
  writeLog([
    { agent_id: 'agent-1', op: 'start_task', ts: 1 },
    { agent_id: 'agent-2', op: 'start_task', ts: 2 },
    { agent_id: 'agent-1', op: 'close_task', ts: 3 },
  ])
  const json = await (await getReq('agent-1')).json()
  assert.equal(json.entries.length, 2)
  assert.equal(json.entries[0].op, 'close_task')
  assert.equal(json.entries[1].op, 'start_task')
  assert.ok(json.entries.every(e => e.agent_id === 'agent-1'))
})

test('GET with an op query param filters by op in addition to agent_id', async () => {
  writeLog([
    { agent_id: 'agent-1', op: 'start_task', ts: 1 },
    { agent_id: 'agent-1', op: 'close_task', ts: 2 },
    { agent_id: 'agent-1', op: 'close_task', ts: 3 },
  ])
  const json = await (await getReq('agent-1', { op: 'close_task' })).json()
  assert.equal(json.entries.length, 2)
  assert.ok(json.entries.every(e => e.op === 'close_task'))
})

test('GET respects an explicit numeric limit smaller than the matching history', async () => {
  writeLog([
    { agent_id: 'agent-1', op: 'a', ts: 1 },
    { agent_id: 'agent-1', op: 'b', ts: 2 },
    { agent_id: 'agent-1', op: 'c', ts: 3 },
  ])
  const json = await (await getReq('agent-1', { limit: '2' })).json()
  assert.equal(json.entries.length, 2)
  assert.equal(json.entries[0].op, 'c')
  assert.equal(json.entries[1].op, 'b')
})

test('GET with no limit param defaults to 50 (fewer than 50 entries all come back)', async () => {
  const entries = Array.from({ length: 5 }, (_, i) => ({ agent_id: 'agent-1', op: `op-${i}`, ts: i }))
  writeLog(entries)
  const json = await (await getReq('agent-1')).json()
  assert.equal(json.entries.length, 5)
})

test('GAP: a non-numeric limit silently returns the entire history instead of the default 50 or an error', async () => {
  const entries = Array.from({ length: 60 }, (_, i) => ({ agent_id: 'agent-1', op: `op-${i}`, ts: i }))
  writeLog(entries)
  const withDefault = await (await getReq('agent-1')).json()
  assert.equal(withDefault.entries.length, 50, 'sanity check: the documented default of 50 applies with no limit param')
  const withBadLimit = await (await getReq('agent-1', { limit: 'not-a-number' })).json()
  assert.equal(withBadLimit.entries.length, 60, 'a non-numeric limit bypasses the cap entirely rather than falling back to 50')
})
