// Characterization tests for web/src/app/api/process/run-all/route.ts.
//
// docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry (2026-08-20,
// narrowed repeatedly): route handler 31 of the enumerated 36. Per the
// 2026-10-30 correction, this was one of two genuinely-unevaluated handlers
// left after the series' 29th landing (`agents/promote`), noted as needing
// "mocking a local HTTP+SSE server rather than a plain request/response"
// since the route calls fetch() against two other routes of this same app
// (http://localhost:3002/api/process/pending and .../api/process) rather
// than touching the filesystem or a lib/ module directly.
//
// This file mocks global.fetch rather than standing up a real server. The
// route's own logic — pending-file filtering, PIN forwarding, SSE "done"/
// "error" marker detection, 401 handling, and per-file error isolation — is
// all exercised through that one seam.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

const originalFetch = global.fetch

let pendingFiles = []
let pendingThrows = false
let processHandlers = {} // path -> { status, sseChunks } | 'throw'
let fetchCalls = []

function sseBody(chunks) {
  let i = 0
  const encoder = new TextEncoder()
  return {
    getReader() {
      return {
        async read() {
          if (i < chunks.length) {
            const value = encoder.encode(chunks[i])
            i++
            return { done: false, value }
          }
          return { done: true, value: undefined }
        },
      }
    },
  }
}

beforeEach(() => {
  pendingFiles = []
  pendingThrows = false
  processHandlers = {}
  fetchCalls = []
  global.fetch = async (url, init) => {
    fetchCalls.push({ url, init })
    if (url === 'http://localhost:3002/api/process/pending') {
      if (pendingThrows) throw new Error('pending fetch failed')
      return { json: async () => ({ files: pendingFiles }) }
    }
    if (url === 'http://localhost:3002/api/process') {
      const body = JSON.parse(init.body)
      const handler = processHandlers[body.filePath]
      if (!handler) throw new Error(`test setup error: no handler for ${body.filePath}`)
      if (handler === 'throw') throw new Error('process fetch failed')
      const { status = 200, sseChunks = [] } = handler
      return { status, body: sseChunks.length ? sseBody(sseChunks) : null }
    }
    throw new Error(`unexpected fetch url: ${url}`)
  }
})

after(() => {
  global.fetch = originalFetch
})

let POST, NextRequest
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ POST } = await import('../src/app/api/process/run-all/route.ts'))
})

function postReq(body, headers) {
  const init = body === undefined
    ? { method: 'POST' }
    : { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) }
  return POST(new NextRequest('http://localhost/api/process/run-all', body === undefined && headers
    ? { method: 'POST', headers }
    : init))
}

test('no pending files short-circuits before ever calling /api/process', async () => {
  pendingFiles = []
  const res = await postReq()
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.deepEqual(json, { message: 'No pending files', processed: 0 })
  assert.equal(fetchCalls.length, 1, 'only the pending-files fetch should have happened')
})

test('filters out files already marked alreadyIngested before processing', async () => {
  pendingFiles = [
    { path: 'raw/a.md', alreadyIngested: true },
    { path: 'raw/b.md', alreadyIngested: false },
  ]
  processHandlers['raw/b.md'] = { sseChunks: ['data: {"type":"done"}\n\n'] }
  const res = await postReq()
  const json = await res.json()
  assert.equal(json.results.length, 1)
  assert.equal(json.results[0].path, 'raw/b.md')
})

test('a "done" marker in the SSE stream marks the file successful', async () => {
  pendingFiles = [{ path: 'raw/a.md', alreadyIngested: false }]
  processHandlers['raw/a.md'] = { sseChunks: ['data: {"type":"progress"}\n\n', 'data: {"type":"done"}\n\n'] }
  const res = await postReq()
  const json = await res.json()
  assert.equal(json.message, 'Processed 1/1 files')
  assert.deepEqual(json.results, [{ path: 'raw/a.md', success: true }])
  assert.ok(typeof json.timestamp === 'string' && !Number.isNaN(Date.parse(json.timestamp)))
})

test('an "error" marker in the SSE stream marks the file unsuccessful, with no error field', async () => {
  pendingFiles = [{ path: 'raw/a.md', alreadyIngested: false }]
  processHandlers['raw/a.md'] = { sseChunks: ['data: {"type":"error","message":"boom"}\n\n'] }
  const res = await postReq()
  const json = await res.json()
  assert.deepEqual(json.results, [{ path: 'raw/a.md', success: false }])
})

test('a 401 from /api/process is reported as a PIN error and does not block the next file', async () => {
  pendingFiles = [
    { path: 'raw/a.md', alreadyIngested: false },
    { path: 'raw/b.md', alreadyIngested: false },
  ]
  processHandlers['raw/a.md'] = { status: 401 }
  processHandlers['raw/b.md'] = { sseChunks: ['data: {"type":"done"}\n\n'] }
  const res = await postReq()
  const json = await res.json()
  assert.deepEqual(json.results, [
    { path: 'raw/a.md', success: false, error: 'PIN required or invalid (set x-private-pin)' },
    { path: 'raw/b.md', success: true },
  ])
  assert.equal(json.message, 'Processed 1/2 files')
})

test('a thrown fetch error for one file is isolated and does not abort the remaining files', async () => {
  pendingFiles = [
    { path: 'raw/a.md', alreadyIngested: false },
    { path: 'raw/b.md', alreadyIngested: false },
  ]
  processHandlers['raw/a.md'] = 'throw'
  processHandlers['raw/b.md'] = { sseChunks: ['data: {"type":"done"}\n\n'] }
  const res = await postReq()
  const json = await res.json()
  assert.equal(json.results.length, 2)
  assert.equal(json.results[0].path, 'raw/a.md')
  assert.equal(json.results[0].success, false)
  assert.equal(json.results[0].error, 'Error: process fetch failed')
  assert.deepEqual(json.results[1], { path: 'raw/b.md', success: true })
})

test('the incoming x-private-pin header is forwarded to each per-file POST', async () => {
  pendingFiles = [{ path: 'raw/a.md', alreadyIngested: false }]
  processHandlers['raw/a.md'] = { sseChunks: ['data: {"type":"done"}\n\n'] }
  await postReq(undefined, { 'x-private-pin': 'from-header' })
  const processCall = fetchCalls.find((c) => c.url === 'http://localhost:3002/api/process')
  assert.equal(processCall.init.headers['x-private-pin'], 'from-header')
})

test('a JSON body pin overrides a header-derived pin', async () => {
  pendingFiles = [{ path: 'raw/a.md', alreadyIngested: false }]
  processHandlers['raw/a.md'] = { sseChunks: ['data: {"type":"done"}\n\n'] }
  await postReq({ pin: 'from-body' }, { 'x-private-pin': 'from-header' })
  const processCall = fetchCalls.find((c) => c.url === 'http://localhost:3002/api/process')
  assert.equal(processCall.init.headers['x-private-pin'], 'from-body')
})

test('no x-private-pin header is sent at all when neither a header nor a body pin is available', async () => {
  pendingFiles = [{ path: 'raw/a.md', alreadyIngested: false }]
  processHandlers['raw/a.md'] = { sseChunks: ['data: {"type":"done"}\n\n'] }
  await postReq()
  const processCall = fetchCalls.find((c) => c.url === 'http://localhost:3002/api/process')
  assert.ok(!('x-private-pin' in processCall.init.headers))
})

test('a malformed JSON body is tolerated and falls back to the header-derived pin', async () => {
  pendingFiles = [{ path: 'raw/a.md', alreadyIngested: false }]
  processHandlers['raw/a.md'] = { sseChunks: ['data: {"type":"done"}\n\n'] }
  const res = await POST(new NextRequest('http://localhost/api/process/run-all', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-private-pin': 'from-header' },
    body: 'not valid json',
  }))
  assert.equal(res.status, 200)
  const processCall = fetchCalls.find((c) => c.url === 'http://localhost:3002/api/process')
  assert.equal(processCall.init.headers['x-private-pin'], 'from-header')
})

test('the pending-files fetch throwing is caught and returned as a 500', async () => {
  pendingThrows = true
  const res = await postReq()
  assert.equal(res.status, 500)
  const json = await res.json()
  assert.equal(json.error, 'Error: pending fetch failed')
})
