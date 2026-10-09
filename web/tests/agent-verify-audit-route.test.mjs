// Characterization tests for web/src/app/api/agents/verify-audit/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 12 of the enumerated 36,
// following the same pattern as tests/agent-audit-route.test.mjs (fresh
// KB_ROOT per file, GAPs pinned not fixed, route module imported after
// KB_ROOT is set so DEFAULT_KB_ROOT picks it up at module-load time).
//
// This route delegates entirely to lib/agent-runtime/audit.mjs's
// verifyAuditChain(), which already has unit-level coverage via
// tests/agents/audit-chain.test.mjs (the hash-chain logic itself: tamper
// detection, deleted entries, legacy unsigned entries, concurrent writers).
// Neither that file nor any other imports the route module, so the one
// thing those tests cannot show is this route's own HTTP-layer behavior:
// that it has no query params or body at all (unlike the sibling audit/
// and trace/ routes), and that it maps verifyAuditChain()'s `ok` field onto
// an HTTP status -- 200 when true, 422 when false -- while still returning
// the full result object as the JSON body either way, break reason included.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-verify-audit-kb-'))
process.env.KB_ROOT = KB_ROOT
const LOG_PATH = path.join(KB_ROOT, 'logs', 'audit.log')

let GET, appendAudit
before(async () => {
  ;({ GET } = await import('../src/app/api/agents/verify-audit/route.ts'))
  ;({ appendAudit } = await import('../../lib/agent-runtime/audit.mjs'))
})

after(() => {
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
})

function writeLog(entries) {
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true })
  fs.writeFileSync(LOG_PATH, entries.map(e => JSON.stringify(e)).join('\n') + '\n')
}

test('GET with no audit.log at all returns ok:true, scanned:0, and HTTP 200', async () => {
  fs.rmSync(LOG_PATH, { force: true })
  const res = await GET()
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.deepEqual(json, { ok: true, scanned: 0, signed: 0, legacy: 0 })
})

test('GET with an intact signed chain returns ok:true with the right counts, HTTP 200', async () => {
  fs.rmSync(LOG_PATH, { force: true })
  appendAudit(KB_ROOT, { op: 'a', agent_id: 'w1' })
  appendAudit(KB_ROOT, { op: 'b', agent_id: 'w1' })
  appendAudit(KB_ROOT, { op: 'c', agent_id: 'w2' })

  const res = await GET()
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.ok, true)
  assert.equal(json.scanned, 3)
  assert.equal(json.signed, 3)
  assert.equal(json.legacy, 0)
})

test('GET with only legacy unsigned entries (no break) still returns ok:true, HTTP 200', async () => {
  fs.rmSync(LOG_PATH, { force: true })
  writeLog([
    { ts: 't0', op: 'legacy-1' },
    { ts: 't1', op: 'legacy-2' },
  ])

  const res = await GET()
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.ok, true)
  assert.equal(json.legacy, 2)
  assert.equal(json.signed, 0)
})

test('GET with a tampered entry returns ok:false, the break reason, and HTTP 422', async () => {
  fs.rmSync(LOG_PATH, { force: true })
  appendAudit(KB_ROOT, { op: 'a' })
  appendAudit(KB_ROOT, { op: 'b' })

  const lines = fs.readFileSync(LOG_PATH, 'utf8').trim().split('\n')
  const tampered = JSON.parse(lines[0])
  tampered.op = 'evil'
  lines[0] = JSON.stringify(tampered)
  fs.writeFileSync(LOG_PATH, lines.join('\n') + '\n')

  const res = await GET()
  assert.equal(res.status, 422, 'a broken chain must surface as a non-2xx status, not a silently-ok 200')
  const json = await res.json()
  assert.equal(json.ok, false)
  assert.equal(json.reason, 'entry_hash mismatch')
  assert.equal(json.firstBreakAt, 0)
})

test('GET with an unsigned entry appended after the chain started returns ok:false and HTTP 422', async () => {
  fs.rmSync(LOG_PATH, { force: true })
  appendAudit(KB_ROOT, { op: 'signed-1' })
  fs.appendFileSync(LOG_PATH, JSON.stringify({ ts: 't9', op: 'unsigned-late' }) + '\n')

  const res = await GET()
  assert.equal(res.status, 422)
  const json = await res.json()
  assert.equal(json.ok, false)
  assert.equal(json.reason, 'unsigned entry after chain start')
})
