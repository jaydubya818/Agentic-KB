// Characterization tests for web/src/app/api/agents/[id]/context/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 16 of the enumerated 36,
// following the same pattern as tests/agent-audit-route.test.mjs (fresh
// KB_ROOT per file, GAPs pinned not fixed, route module imported after
// KB_ROOT is set so DEFAULT_KB_ROOT picks it up at module-load time).
//
// This route delegates to lib/agent-runtime/contracts.mjs's loadContract()
// and lib/agent-runtime/context-loader.mjs's loadAgentContext(), both of
// which already have extensive unit-level coverage via
// tests/agents/context-snapshots.test.mjs and tests/agents/context-order.test.mjs.
// Neither of those imports the route module, so what this file covers is
// the route's own HTTP-layer behavior: the 404 on an unknown or unsafe
// agent id, the `project` query-string passthrough, and -- the one
// behavior worth pinning explicitly, since it is not obvious from the
// route file alone -- that the route strips each included file's `content`
// before it reaches the response, even though loadAgentContext() loads
// full file bytes server-side to compute the budget. No GAP found: unlike
// several siblings in this series, a rejected/unsafe case here does not
// leak distinguishing information -- it 404s the same way a merely-missing
// agent id does.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-context-kb-'))
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
    - path: wiki/agents/workers/${id}/profile.md
      priority: 10
${extra}
`.trim() + '\n')
}

let GET, NextRequest
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ GET } = await import('../src/app/api/agents/[id]/context/route.ts'))
  const profileDir = path.join(KB_ROOT, 'wiki/agents/workers/w1')
  fs.mkdirSync(profileDir, { recursive: true })
  fs.writeFileSync(path.join(profileDir, 'profile.md'), '# w1 profile\n\nSome profile content only the server should see.\n')
  writeContract('w1')
})

after(() => {
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
})

function getReq(id, query) {
  const url = new URL(`http://localhost/api/agents/${id}/context`)
  for (const [k, v] of Object.entries(query || {})) url.searchParams.set(k, v)
  return GET(new NextRequest(url), { params: Promise.resolve({ id }) })
}

test('GET for an unknown agent id returns 404, not a thrown error', async () => {
  const res = await getReq('no-such-agent')
  assert.equal(res.status, 404)
  const json = await res.json()
  assert.equal(json.error, 'Agent not found')
})

test('GET for an unsafe (path-traversal-shaped) agent id 404s the same way as a missing one', async () => {
  // SAFE_AGENT_ID (lib/agent-runtime/contracts.mjs) requires the first
  // character to be alphanumeric, so a leading '.' or '/' fails isSafeAgentId
  // and loadContract() returns null before ever touching the filesystem with
  // the raw id -- same code path as a genuinely-missing agent, so there is
  // no 500 and no distinguishing response shape a caller could use to probe
  // for which ids are "unsafe" vs merely "not yet created".
  const res = await getReq('..escape')
  assert.equal(res.status, 404)
  const json = await res.json()
  assert.equal(json.error, 'Agent not found')
})

test('GET with a valid agent id returns tier, trace, and the included file list', async () => {
  const res = await getReq('w1')
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.agent_id, 'w1')
  assert.equal(json.tier, 'worker')
  assert.equal(json.trace.agent_id, 'w1')
  assert.equal(json.trace.project, null)
  assert.equal(json.files.length, 1)
  assert.equal(json.files[0].path, 'wiki/agents/workers/w1/profile.md')
  assert.equal(json.files[0].priority, 10)
  assert.ok(json.files[0].bytes > 0)
})

test('GET passes the project query param through to trace.project', async () => {
  const res = await getReq('w1', { project: 'p1' })
  const json = await res.json()
  assert.equal(json.trace.project, 'p1')
})

test('the file list never includes raw file content, even though loadAgentContext() reads it server-side to enforce the byte budget', async () => {
  const json = await (await getReq('w1')).json()
  assert.equal(json.files.length, 1)
  assert.equal('content' in json.files[0], false)
  assert.deepEqual(Object.keys(json.files[0]).sort(), ['bytes', 'class', 'path', 'priority', 'reason'])
})
