// Characterization tests for web/src/app/api/query/save/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly since): route handler 27 of the
// enumerated 36, following the same pattern as switch-vault-route.test.mjs
// and article-route.test.mjs (fresh KB_ROOT per file, module-level PIN
// constant captured at import time so the two PRIVATE_PIN postures need
// separate cache-busted imports, GAPs pinned not fixed). This route had
// zero existing coverage -- ingest-route.test.mjs names it in a comment
// ("query/save (self-...") as one of the handlers deliberately left for a
// future drain.
//
// Fetch mocking for the fire-and-forget autoCompile call follows
// repo-sync-route.test.mjs's installFetchMock()/restore() pattern: the
// route never awaits the fetch, but the mock's synchronous body (the part
// before its first await) still runs before the route returns, so
// mock.calls is populated in time to assert on.
//
// GAP pinned, not fixed (previously undocumented): autoCompile's
// fire-and-forget request builds the URL as
// `${origin}/api/compile?mode=incremental` but sends `body:
// JSON.stringify({})` -- no `mode` field. /api/compile's POST handler
// (web/src/app/api/compile/route.ts) reads `mode` exclusively from the
// parsed JSON body (`body.mode === 'full' ? 'full' : 'incremental'`) and
// never inspects the request URL's search params at all. So the
// `?mode=incremental` query string this route appends is dead: it has
// never once been read by the handler it's sent to, and the auto-triggered
// compile is "incremental" only because that's /api/compile's own default
// for a body with no `mode` key. Changing this file's query string to
// `?mode=full` would silently keep compiling incrementally.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, describe, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'query-save-kb-'))
process.env.KB_ROOT = KB_ROOT

after(() => fs.rmSync(KB_ROOT, { recursive: true, force: true }))

function qaDir() {
  return path.join(KB_ROOT, 'raw', 'qa')
}

function clearQa() {
  fs.rmSync(qaDir(), { recursive: true, force: true })
}

function readFrontmatter(absPath) {
  const content = fs.readFileSync(absPath, 'utf8')
  const m = content.match(/^---\n([\s\S]*?)\n---/)
  const fm = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/)
    if (kv) fm[kv[1]] = kv[2]
  }
  return { fm, content }
}

// Minimal but complete fake of the one fetch call autoCompile makes.
// `calls` is populated synchronously even though the route never awaits
// the fetch -- an async function's body runs synchronously up to its first
// `await`, and installFetchMock's mock has none before the push.
function installFetchMock() {
  const calls = []
  const orig = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), headers: { ...(init?.headers || {}) }, body: init?.body })
    return { ok: true, json: async () => ({}) }
  }
  return { calls, restore() { globalThis.fetch = orig } }
}

describe('PRIVATE_PIN unset', () => {
  let POST, NextRequest

  before(async () => {
    delete process.env.PRIVATE_PIN
    ;({ NextRequest } = await import('next/server'))
    ;({ POST } = await import('../src/app/api/query/save/route.ts?variant=nopin'))
  })
  beforeEach(clearQa)

  function req(body, extraHeaders = {}) {
    return new NextRequest('http://localhost/api/query/save', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...extraHeaders },
      body: JSON.stringify(body),
    })
  }

  function rawReq(rawBody) {
    return new NextRequest('http://localhost/api/query/save', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: rawBody,
    })
  }

  test('malformed JSON body: 400 Invalid JSON, not an unhandled throw', async () => {
    const res = await POST(rawReq('not json'))
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.equal(json.error, 'Invalid JSON')
  })

  test('missing question: 400 question and answer required', async () => {
    const res = await POST(req({ answer: 'an answer' }))
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.equal(json.error, 'question and answer required')
  })

  test('missing answer: 400 question and answer required', async () => {
    const res = await POST(req({ question: 'a question' }))
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.equal(json.error, 'question and answer required')
  })

  test('whitespace-only question and answer are trimmed to empty and rejected the same as missing', async () => {
    const res = await POST(req({ question: '   ', answer: '\t\n' }))
    assert.equal(res.status, 400)
  })

  test('a minimal valid save writes raw/qa/<date>-<slug>.md with default tags, no sources, verified:false', async () => {
    const res = await POST(req({ question: 'What is the KB?', answer: 'A wiki.' }))
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.ok, true)
    assert.equal(json.compileTriggered, false)

    const abs = path.join(KB_ROOT, json.path)
    assert.ok(fs.existsSync(abs))
    const { fm, content } = readFrontmatter(abs)
    assert.equal(fm.type, 'qa')
    assert.equal(fm.status, 'active')
    assert.match(fm.id, /^[0-9A-Z]{26}$/)
    assert.equal(fm.tags, '["qa", "user-question"]')
    assert.equal(fm.verified, 'false')
    assert.equal(fm.sources, '[]')
    assert.match(content, /## Question\n\nWhat is the KB\?/)
    assert.match(content, /## Answer\n\nA wiki\./)
    assert.doesNotMatch(content, /## Sources Read/)
  })

  test('non-string entries in sources are filtered out before being written', async () => {
    const res = await POST(req({
      question: 'Sources filter test',
      answer: 'ok',
      sources: ['wiki/concepts/foo.md', 42, null, 'wiki/concepts/bar.md'],
    }))
    const json = await res.json()
    const { fm, content } = readFrontmatter(path.join(KB_ROOT, json.path))
    assert.equal(fm.sources, '["wiki/concepts/foo.md", "wiki/concepts/bar.md"]')
    assert.match(content, /## Sources Read/)
    assert.match(content, /\[\[wiki\/concepts\/foo\]\]/)
  })

  test('explicit tags override the ["qa","user-question"] default', async () => {
    const res = await POST(req({ question: 'Tag override', answer: 'ok', tags: ['custom'] }))
    const json = await res.json()
    const { fm } = readFrontmatter(path.join(KB_ROOT, json.path))
    assert.equal(fm.tags, '["custom"]')
  })

  test('verified:true is reflected verbatim in frontmatter', async () => {
    const res = await POST(req({ question: 'Verified test', answer: 'ok', verified: true }))
    const json = await res.json()
    const { fm } = readFrontmatter(path.join(KB_ROOT, json.path))
    assert.equal(fm.verified, 'true')
  })

  test('slugify: a question with no alphanumeric characters falls back to the literal "qa" slug', async () => {
    const res = await POST(req({ question: '??? !!!', answer: 'ok' }))
    const json = await res.json()
    assert.match(json.path, /-qa\.md$/)
  })

  test('EEXIST retry: a second save on the same day with the same slugified question gets a -2 suffix', async () => {
    const r1 = await POST(req({ question: 'Collision test', answer: 'first' }))
    const j1 = await r1.json()
    const r2 = await POST(req({ question: 'Collision test', answer: 'second' }))
    const j2 = await r2.json()
    assert.notEqual(j1.path, j2.path)
    assert.match(j2.path, /-collision-test-2\.md$/)
    assert.match(fs.readFileSync(path.join(KB_ROOT, j1.path), 'utf8'), /first/)
    assert.match(fs.readFileSync(path.join(KB_ROOT, j2.path), 'utf8'), /second/)
  })

  test('autoCompile with PRIVATE_PIN unset: triggers the fire-and-forget compile with no x-private-pin header', async () => {
    const mock = installFetchMock()
    try {
      const res = await POST(req({ question: 'Autocompile open', answer: 'ok', autoCompile: true }))
      const json = await res.json()
      assert.equal(json.compileTriggered, true)
      assert.equal(json.message, 'Saved. Compile triggered in background.')
      assert.equal(mock.calls.length, 1)
      assert.equal(mock.calls[0].headers['x-private-pin'], undefined)
    } finally {
      mock.restore()
    }
  })

  test('without autoCompile, no fetch is made and the response says to run Compile manually', async () => {
    const mock = installFetchMock()
    try {
      const res = await POST(req({ question: 'No autocompile', answer: 'ok' }))
      const json = await res.json()
      assert.equal(json.compileTriggered, false)
      assert.equal(json.message, 'Saved. Run Compile to fold this into the wiki.')
      assert.equal(mock.calls.length, 0)
    } finally {
      mock.restore()
    }
  })

  test('GAP: the ?mode=incremental query string sent to /api/compile is never read by that handler ' +
       '-- it parses mode only from the JSON body, which this route sends as {}', async () => {
    const mock = installFetchMock()
    try {
      await POST(req({ question: 'Mode gap', answer: 'ok', autoCompile: true }))
      assert.equal(mock.calls.length, 1)
      assert.match(mock.calls[0].url, /\?mode=incremental$/)
      assert.equal(mock.calls[0].body, '{}', 'no mode field is actually sent in the body /api/compile reads')
    } finally {
      mock.restore()
    }
  })
})

describe('PRIVATE_PIN set', () => {
  let POST, NextRequest
  const PIN = 'savepin456'

  before(async () => {
    process.env.PRIVATE_PIN = PIN
    ;({ NextRequest } = await import('next/server'))
    ;({ POST } = await import('../src/app/api/query/save/route.ts?variant=pinset'))
  })
  after(() => { delete process.env.PRIVATE_PIN })
  beforeEach(clearQa)

  function req(body, extraHeaders = {}) {
    return new NextRequest('http://localhost/api/query/save', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...extraHeaders },
      body: JSON.stringify(body),
    })
  }

  test('autoCompile with PRIVATE_PIN set and no pin supplied: saved, but compile is blocked, not silently dropped', async () => {
    const mock = installFetchMock()
    try {
      const res = await POST(req({ question: 'Blocked compile', answer: 'ok', autoCompile: true }))
      assert.equal(res.status, 200)
      const json = await res.json()
      assert.equal(json.ok, true, 'the save itself must still succeed even when auto-compile is blocked')
      assert.equal(json.compileTriggered, false)
      assert.equal(json.message, 'Saved. Auto-compile skipped: compile requires the private PIN.')
      assert.equal(mock.calls.length, 0, 'a blocked compile must not call fetch at all')
    } finally {
      mock.restore()
    }
  })

  test('autoCompile with the correct pin in body.pin: triggers compile, forwarding the pin header and request cookie', async () => {
    const mock = installFetchMock()
    try {
      const res = await POST(
        req({ question: 'Pin forwarded', answer: 'ok', autoCompile: true, pin: PIN }, { cookie: 'active_vault_path=foo' })
      )
      const json = await res.json()
      assert.equal(json.compileTriggered, true)
      assert.equal(mock.calls.length, 1)
      assert.equal(mock.calls[0].headers['x-private-pin'], PIN)
      assert.equal(mock.calls[0].headers['cookie'], 'active_vault_path=foo')
    } finally {
      mock.restore()
    }
  })

  test('autoCompile with the correct pin but a vault cookie unrelated to PIN gating: the save still succeeds', async () => {
    const res = await POST(req({ question: 'Pin and save both', answer: 'ok', pin: PIN }))
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.ok, true)
  })
})
