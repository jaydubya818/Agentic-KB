// Characterization tests for web/src/app/api/agents/[id]/trace/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 11 of the enumerated 36,
// following the same pattern as tests/agent-audit-route.test.mjs (fresh
// KB_ROOT per file, GAPs pinned not fixed, route module imported after
// KB_ROOT is set so DEFAULT_KB_ROOT picks it up at module-load time).
//
// Unlike the audit route, this route's underlying lib function --
// readRuntimeTraces() in lib/agent-runtime/audit.mjs -- has NO existing
// test coverage anywhere in the repo (confirmed via grep across tests/,
// web/tests/, and lib/): neither at the HTTP layer nor the lib layer. This
// file is the first coverage of either.
//
// One previously-undocumented gap pinned, not fixed, and structurally
// identical to the one already pinned for the audit route: readRuntimeTraces()
// applies the limit via `parsed.slice(-limit)`. The route computes
// `limit = Math.min(Number(searchParams.get('limit') || '50'), 500)`; a
// non-numeric `limit` query param makes `Number(...)` produce NaN, and
// `Math.min(NaN, 500)` is itself NaN, so `Array.prototype.slice(-NaN)`
// coerces to `slice(0)` per the ECMA ToIntegerOrInfinity(NaN) = 0 rule --
// i.e. the *entire* filtered trace history is returned, silently bypassing
// both the requested limit and the documented default of 50.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-trace-kb-'))
process.env.KB_ROOT = KB_ROOT
const LOG_PATH = path.join(KB_ROOT, 'logs', 'agent-runtime.log')

let GET, NextRequest
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ GET } = await import('../src/app/api/agents/[id]/trace/route.ts'))
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
  const url = new URL(`http://localhost/api/agents/${id}/trace`)
  for (const [k, v] of Object.entries(query || {})) url.searchParams.set(k, v)
  return GET(new NextRequest(url), { params: Promise.resolve({ id }) })
}

test('GET with no agent-runtime.log at all returns an empty traces array, not an error', async () => {
  const res = await getReq('agent-1')
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.agent_id, 'agent-1')
  assert.equal(json.count, 0)
  assert.deepEqual(json.traces, [])
})

test('GET filters to only the requested agent_id, most-recent first', async () => {
  writeLog([
    { agent_id: 'agent-1', type: 'context-load', ts: 1 },
    { agent_id: 'agent-2', type: 'context-load', ts: 2 },
    { agent_id: 'agent-1', type: 'close-task', ts: 3 },
  ])
  const json = await (await getReq('agent-1')).json()
  assert.equal(json.count, 2)
  assert.equal(json.traces[0].type, 'close-task')
  assert.equal(json.traces[1].type, 'context-load')
  assert.ok(json.traces.every(t => t.agent_id === 'agent-1'))
})

test('GET with a type query param filters by trace type in addition to agent_id', async () => {
  writeLog([
    { agent_id: 'agent-1', type: 'context-load', ts: 1 },
    { agent_id: 'agent-1', type: 'close-task', ts: 2 },
    { agent_id: 'agent-1', type: 'close-task', ts: 3 },
  ])
  const json = await (await getReq('agent-1', { type: 'close-task' })).json()
  assert.equal(json.count, 2)
  assert.ok(json.traces.every(t => t.type === 'close-task'))
})

test('GET respects an explicit numeric limit smaller than the matching history', async () => {
  writeLog([
    { agent_id: 'agent-1', type: 'a', ts: 1 },
    { agent_id: 'agent-1', type: 'b', ts: 2 },
    { agent_id: 'agent-1', type: 'c', ts: 3 },
  ])
  const json = await (await getReq('agent-1', { limit: '2' })).json()
  assert.equal(json.count, 2)
  assert.equal(json.traces[0].type, 'c')
  assert.equal(json.traces[1].type, 'b')
})

test('GET with no limit param defaults to 50 (fewer than 50 entries all come back)', async () => {
  const entries = Array.from({ length: 5 }, (_, i) => ({ agent_id: 'agent-1', type: `t-${i}`, ts: i }))
  writeLog(entries)
  const json = await (await getReq('agent-1')).json()
  assert.equal(json.count, 5)
})

test('GET caps an explicit limit above 500 down to 500', async () => {
  const entries = Array.from({ length: 10 }, (_, i) => ({ agent_id: 'agent-1', type: `t-${i}`, ts: i }))
  writeLog(entries)
  const json = await (await getReq('agent-1', { limit: '999999' })).json()
  // Only 10 entries exist, so the cap itself isn't directly observable via
  // count here -- this just pins that an oversized limit doesn't error.
  assert.equal(json.count, 10)
})

test('GAP: a non-numeric limit silently returns the entire history instead of the default 50 or an error', async () => {
  const entries = Array.from({ length: 60 }, (_, i) => ({ agent_id: 'agent-1', type: `t-${i}`, ts: i }))
  writeLog(entries)
  const withDefault = await (await getReq('agent-1')).json()
  assert.equal(withDefault.count, 50, 'sanity check: the documented default of 50 applies with no limit param')
  const withBadLimit = await (await getReq('agent-1', { limit: 'not-a-number' })).json()
  assert.equal(withBadLimit.count, 60, 'a non-numeric limit bypasses both the requested cap and the default, returning the full history')
})
