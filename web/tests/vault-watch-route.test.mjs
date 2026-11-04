// Characterization tests for web/src/app/api/vault-watch/route.ts.
//
// docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry (2026-08-20,
// narrowed repeatedly): route-handler drain series, 36th and final of 36.
// Explicitly skipped every prior night in this series because it does not
// fit the plain NextRequest round-trip shape every other drain has used --
// it is a GET-only Server-Sent-Events endpoint built on ReadableStream +
// fs.watch + a 15s setInterval keep-alive, with no static response body to
// assert on. This file uses a real temp directory (fs.mkdtempSync) as the
// vault root so fs.watch fires for real (macOS FSEvents via the recursive
// option), and decodes the stream's `data: ...\n\n` SSE frames by hand.
//
// Delegates to no shared lib beyond resolveVaultRoot()/DEFAULT_KB_ROOT
// (already exercised by vaults-route.test.mjs, switch-vault-route.test.mjs,
// vault-structure-route.test.mjs); DEFAULT_KB_ROOT is captured once, at
// first import, from process.env.KB_ROOT -- set below before the dynamic
// import, as every sibling in this series does -- so all tests in this
// file share one vaultRoot and isolate themselves with unique filenames
// rather than unique temp dirs.
//
// Note on test ordering: `_seenRawFiles` (route.ts, module scope) is a Set
// that is never reset between requests or tests -- see the GAP pinned at
// the bottom of this file. Every other test below that touches raw/ uses a
// filename unique to that test, so none of them depends on reset semantics
// the route does not have. The GAP test is the one deliberate exception: it
// reuses one path across two connections specifically to demonstrate the
// leak.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'vault-watch-route-'))
process.env.KB_ROOT = KB_ROOT
fs.mkdirSync(path.join(KB_ROOT, 'raw'), { recursive: true })

let NextRequest
let GET

before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ GET } = await import('../src/app/api/vault-watch/route.ts'))
})

after(() => {
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
})

// Decodes `data: <json>\n\n` SSE frames off a ReadableStreamDefaultReader.
// next() long-polls up to timeoutMs and resolves null on a timeout instead
// of hanging -- used both to fetch an expected frame and to assert that
// none arrives.
function sseReader(reader) {
  const decoder = new TextDecoder()
  let buf = ''
  return {
    async next(timeoutMs = 4000) {
      const deadline = Date.now() + timeoutMs
      for (;;) {
        const idx = buf.indexOf('\n\n')
        if (idx !== -1) {
          const frame = buf.slice(0, idx)
          buf = buf.slice(idx + 2)
          const m = frame.match(/^data: (.*)$/m)
          if (m) return JSON.parse(m[1])
          continue
        }
        const remaining = deadline - Date.now()
        if (remaining <= 0) return null
        const result = await Promise.race([
          reader.read(),
          new Promise((resolve) => setTimeout(() => resolve({ timedOut: true }), remaining)),
        ])
        if (result.timedOut || result.done) return null
        buf += decoder.decode(result.value, { stream: true })
      }
    },
  }
}

// Opens a connection to the route and returns its AbortController, reader,
// and frame decoder. Callers must call ac.abort() when done so no real 15s
// ping interval or fs.watch handle outlives the test.
//
// The short delay before each connect is deliberate, not decorative: macOS
// FSEvents (the backend behind recursive fs.watch here) coalesces change
// notifications with its own latency, and a brand-new watcher created
// immediately after a previous one on the same path closes can still
// receive that previous watcher's just-occurred event as if it were new
// (observed directly while writing this suite -- a write made after test
// N's connection aborted showed up as test N+2's first frame with no delay
// here). This is a macOS/FSEvents timing artifact of rapid watcher churn
// in a test suite, not a bug in the route, which is why the fix lives here
// rather than as a GAP pinned against route.ts.
async function connect() {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const ac = new AbortController()
  const req = new NextRequest('http://localhost/api/vault-watch', { signal: ac.signal })
  const res = await GET(req)
  const reader = res.body.getReader()
  return { ac, reader, sse: sseReader(reader) }
}

test('connecting sends {type: connected, vault} as the first frame, vault resolved via resolveVaultRoot', async () => {
  const { ac, sse } = await connect()
  try {
    const frame = await sse.next()
    assert.deepEqual(frame, { type: 'connected', vault: KB_ROOT })
  } finally {
    ac.abort()
  }
})

test('a .md change inside the vault root outside raw/ produces a change frame with the filename', async () => {
  const { ac, sse } = await connect()
  try {
    await sse.next() // connected
    fs.writeFileSync(path.join(KB_ROOT, 'change-test.md'), 'hello')
    const frame = await sse.next()
    assert.equal(frame.type, 'change')
    assert.equal(frame.filename, 'change-test.md')
    assert.ok('event' in frame)
  } finally {
    ac.abort()
  }
})

test('a new .md file under raw/ produces exactly a raw_pending frame (no change frame leaks through for raw/)', async () => {
  const { ac, sse } = await connect()
  try {
    await sse.next() // connected
    fs.writeFileSync(path.join(KB_ROOT, 'raw', 'pending-test.md'), 'new raw content')
    const frame = await sse.next()
    assert.equal(frame.type, 'raw_pending')
    assert.equal(frame.filename, 'pending-test.md')
    assert.match(frame.message, /pending-test\.md/)
    // and nothing else follows -- specifically no 'change' frame for the same write
    assert.equal(await sse.next(500), null)
  } finally {
    ac.abort()
  }
})

test('modifying that same raw/ file again within the same connection does not re-fire raw_pending', async () => {
  const { ac, sse } = await connect()
  try {
    await sse.next() // connected
    const file = path.join(KB_ROOT, 'raw', 'seen-once-test.md')
    fs.writeFileSync(file, 'v1')
    const first = await sse.next()
    assert.equal(first.type, 'raw_pending')
    fs.writeFileSync(file, 'v2 - modified')
    assert.equal(await sse.next(1000), null, 'no second raw_pending for a file already in _seenRawFiles')
  } finally {
    ac.abort()
  }
})

test('a non-.md file under raw/ never produces raw_pending', async () => {
  const { ac, sse } = await connect()
  try {
    await sse.next() // connected
    fs.writeFileSync(path.join(KB_ROOT, 'raw', 'notes-test.txt'), 'not markdown')
    assert.equal(await sse.next(1000), null)
  } finally {
    ac.abort()
  }
})

test('a dotfile under raw/ never produces raw_pending', async () => {
  const { ac, sse } = await connect()
  try {
    await sse.next() // connected
    fs.writeFileSync(path.join(KB_ROOT, 'raw', '.hidden-test.md'), 'dotfile')
    assert.equal(await sse.next(1000), null)
  } finally {
    ac.abort()
  }
})

test('aborting the request signal runs cleanup: the stream ends and no further events are delivered', async () => {
  const { ac, reader, sse } = await connect()
  await sse.next() // connected
  ac.abort()
  const afterAbort = await reader.read()
  assert.equal(afterAbort.done, true, 'controller.close() ran as part of cleanup()')
  // a change made after cleanup must produce nothing -- the watchers were closed
  fs.writeFileSync(path.join(KB_ROOT, 'post-abort-test.md'), 'after cleanup')
  assert.equal(await sse.next(500), null)
})

test('registers exactly one 15s keep-alive ping interval per connection', async () => {
  const originalSetInterval = global.setInterval
  const registrations = []
  global.setInterval = (fn, delay, ...rest) => {
    registrations.push(delay)
    return originalSetInterval(fn, delay, ...rest)
  }
  let ac
  try {
    ;({ ac } = await connect())
    assert.deepEqual(registrations, [15000])
  } finally {
    global.setInterval = originalSetInterval
    ac?.abort()
  }
})

// GAP: `_seenRawFiles` (route.ts, module scope) is a Set seeded by walking
// raw/ on every connect, but it is never cleared -- not between requests,
// and not when a previously-seen file is deleted. A raw/ file that is
// deleted (e.g. compiled and removed) and later recreated under the exact
// same path is therefore never reported as "new" again: the watcher still
// fires, but `_seenRawFiles.has(absPath)` is already true from the first
// time around, so `raw_pending` never re-sends for it. This is both a
// long-process memory leak (the Set only grows for the life of the Node
// process -- every raw file ever seen, forever) and a functional gap (a
// legitimately new file can silently never notify, if a file of the same
// name existed under raw/ at any earlier point in this process's life).
// Pinned, not fixed: whether recreation should re-arm notification, and
// whether/how to bound or evict the Set, are product decisions, not bugs
// this characterization suite should patch.
test('GAP: a raw/ file deleted and recreated under the same path never re-fires raw_pending', async () => {
  const file = path.join(KB_ROOT, 'raw', 'leaky-test.md')

  const c1 = await connect()
  try {
    await c1.sse.next() // connected
    fs.writeFileSync(file, 'v1')
    const firstPending = await c1.sse.next()
    assert.equal(firstPending.type, 'raw_pending', 'sanity check: the file is seen once, as expected')
  } finally {
    c1.ac.abort()
  }

  fs.rmSync(file)

  const c2 = await connect()
  try {
    await c2.sse.next() // connected
    fs.writeFileSync(file, 'v2 - recreated, genuinely new from the operator perspective')
    assert.equal(
      await c2.sse.next(1500),
      null,
      'GAP: the recreated file is suppressed by the never-cleared _seenRawFiles Set'
    )
  } finally {
    c2.ac.abort()
  }
})
