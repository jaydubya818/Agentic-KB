// Characterization tests for web/src/app/api/process/schedule/install/route.ts.
//
// Route handler 18 of 36 (see docs/NIGHTLY-BACKLOG.md's "web/ has no test
// suite" entry, 2026-08-20, narrowed 2026-09-02), following the same
// cache-busting-import pattern as tests/article-route.test.mjs for a
// module-level `const PRIVATE_PIN = process.env.PRIVATE_PIN || ''` captured
// at import time. This is also the first test coverage of
// src/lib/pin.ts::pinMatches() at either the unit or route layer anywhere
// in the repo (confirmed by grep across tests/ and web/tests/).
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'

describe('PRIVATE_PIN unset', () => {
  let GET, NextRequest

  before(async () => {
    delete process.env.PRIVATE_PIN
    ;({ NextRequest } = await import('next/server'))
    ;({ GET } = await import('../src/app/api/process/schedule/install/route.ts?variant=nopin'))
  })

  function req(qs = '') {
    return new NextRequest(`http://localhost/api/process/schedule/install${qs ? `?${qs}` : ''}`)
  }

  test('no PIN configured: 200, text/plain install script, no -H pin arg embedded', async () => {
    const res = await GET(req())
    assert.equal(res.status, 200)
    assert.equal(res.headers.get('Content-Type'), 'text/plain')
    const body = await res.text()
    assert.match(body, /launchctl load/)
    assert.match(body, /com\.jaywest\.agentic-kb-ingest\.plist/)
    assert.doesNotMatch(body, /x-private-pin/)
  })

  test('a PIN supplied when none is configured is simply ignored: still 200, still no -H arg', async () => {
    const res = await GET(req('pin=whatever'))
    assert.equal(res.status, 200)
    const body = await res.text()
    assert.doesNotMatch(body, /x-private-pin/)
  })
})

describe('PRIVATE_PIN set', () => {
  let GET, NextRequest
  const PIN = 'testpin123'

  before(async () => {
    process.env.PRIVATE_PIN = PIN
    ;({ NextRequest } = await import('next/server'))
    ;({ GET } = await import('../src/app/api/process/schedule/install/route.ts?variant=pinset'))
  })
  after(() => { delete process.env.PRIVATE_PIN })

  function req(qs = '') {
    return new NextRequest(`http://localhost/api/process/schedule/install${qs ? `?${qs}` : ''}`)
  }
  function reqWithHeader(pin) {
    return new NextRequest('http://localhost/api/process/schedule/install', {
      headers: { 'x-private-pin': pin },
    })
  }

  test('no pin supplied: 401 plain-text reminder, actual PIN value never appears in the body', async () => {
    const res = await GET(req())
    assert.equal(res.status, 401)
    assert.equal(res.headers.get('Content-Type'), 'text/plain')
    const body = await res.text()
    assert.match(body, /PIN required/)
    assert.doesNotMatch(body, new RegExp(PIN))
  })

  test('wrong pin in query string: 401', async () => {
    const res = await GET(req('pin=wrong'))
    assert.equal(res.status, 401)
  })

  test('correct pin in query string: 200, generated script embeds the real PIN in the curl -H arg', async () => {
    const res = await GET(req(`pin=${PIN}`))
    assert.equal(res.status, 200)
    const body = await res.text()
    assert.match(body, new RegExp(`x-private-pin: ${PIN}`))
    assert.match(body, /launchctl load/)
  })

  test('correct pin via x-private-pin header: 200, same PIN-embedding behavior as the query-string path', async () => {
    const res = await GET(reqWithHeader(PIN))
    assert.equal(res.status, 200)
    const body = await res.text()
    assert.match(body, new RegExp(`x-private-pin: ${PIN}`))
  })
})
