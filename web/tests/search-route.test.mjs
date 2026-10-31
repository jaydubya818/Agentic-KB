// Characterization tests for web/src/app/api/search/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route-handler drain series, 30 of 36.
// This route delegates to lib/articles.ts's searchArticles() (first
// coverage anywhere in the repo -- confirmed by grep before writing this
// file) and to lib/graph-search.ts's graphAvailable()/searchGraph() and
// lib/pin.ts's pinMatches(), both also previously uncovered. searchInVault()
// (the non-default-vault branch) is NOT exercised here: reaching it needs a
// vault registered in the local Obsidian config via lib/vault.ts's
// allowedVaultPaths(), which no NextRequest cookie fixture in this file
// attempts to fake -- same scope limit the 2026-10-23 drain flagged for this
// exact route ("needs more fixture setup than an 'obvious test' bar should
// require for one drain cycle"). The graph-search merge path is similarly
// left unexercised: graphAvailable() just checks for
// <KB_ROOT>/graphify-out/graph.json, which this file's KB_ROOT fixture never
// creates, so every test here runs with graphUsed: false -- confirmed
// explicitly below rather than left implicit.
//
// PRIVATE_PIN is read into a module-level const at import time (same as
// article/route.ts), so the two PIN postures need two separate module
// instances via a cache-busting query string, following
// tests/article-route.test.mjs's pattern.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, describe, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'search-route-test-'))
process.env.KB_ROOT = KB_ROOT

after(() => fs.rmSync(KB_ROOT, { recursive: true, force: true }))

function clearWiki() {
  fs.rmSync(path.join(KB_ROOT, 'wiki'), { recursive: true, force: true })
}

function writeArticle(rel, frontmatter = '', body = '# Title\n') {
  const full = path.join(KB_ROOT, 'wiki', rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  const fm = frontmatter ? `---\n${frontmatter}\n---\n` : ''
  fs.writeFileSync(full, fm + body)
}

describe('PRIVATE_PIN unset', () => {
  let GET, NextRequest

  before(async () => {
    delete process.env.PRIVATE_PIN
    ;({ NextRequest } = await import('next/server'))
    ;({ GET } = await import('../src/app/api/search/route.ts?variant=nopin'))
  })
  beforeEach(clearWiki)

  function req(qs) {
    return new NextRequest(`http://localhost/api/search?${qs}`)
  }

  test('no confirmed graph.json fixture exists under KB_ROOT -- sanity check for every test below', () => {
    assert.equal(fs.existsSync(path.join(KB_ROOT, 'graphify-out', 'graph.json')), false)
  })

  test('empty query short-circuits before any PIN check or fs access: 200 with empty results', async () => {
    const res = await GET(req(''))
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.deepEqual(json, { results: [], query: '', graphUsed: false })
  })

  test('whitespace-only query is treated the same as empty', async () => {
    const res = await GET(req('q=%20%20'))
    const json = await res.json()
    assert.deepEqual(json.results, [])
  })

  test('scope=private with PRIVATE_PIN unset: 403, feature disabled (not silently downgraded to public)', async () => {
    const res = await GET(req('q=foo&scope=private'))
    assert.equal(res.status, 403)
    const json = await res.json()
    assert.equal(json.error, 'Private scope disabled (PRIVATE_PIN unset)')
    assert.equal(json.code, 'FORBIDDEN')
  })

  test('scope=all with PRIVATE_PIN unset: 403, same as scope=private', async () => {
    const res = await GET(req('q=foo&scope=all'))
    assert.equal(res.status, 403)
  })

  test('an unrecognised scope value is normalised to public and never hits the PIN gate', async () => {
    writeArticle('concepts/a.md', 'title: A', 'widget\n')
    const res = await GET(req('q=widget&scope=bogus'))
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.scope, 'public')
  })

  test('default scope (public) keyword match: graphUsed is false with no graph.json present', async () => {
    writeArticle('concepts/a.md', 'title: Widget Page', 'a widget lives here\n')
    const res = await GET(req('q=widget'))
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.graphUsed, false)
    assert.equal(json.graphHits, 0)
    assert.equal(json.results.length, 1)
    assert.equal(json.results[0].meta.title, 'Widget Page')
    assert.equal(typeof json.results[0].snippet, 'string')
  })

  test('a private article is excluded under the default public scope', async () => {
    writeArticle('concepts/secret.md', 'title: Secret Widget\nvisibility: private', 'widget\n')
    writeArticle('concepts/open.md', 'title: Open Widget', 'widget\n')
    const res = await GET(req('q=widget'))
    const json = await res.json()
    assert.equal(json.results.length, 1)
    assert.equal(json.results[0].meta.title, 'Open Widget')
  })

  test('a title match outranks a body-only match and sorts first', async () => {
    writeArticle('concepts/body-only.md', 'title: Other Page', 'mentions zephyr once\n')
    writeArticle('concepts/title-match.md', 'title: Zephyr Thing', 'no repeat here\n')
    const res = await GET(req('q=zephyr'))
    const json = await res.json()
    assert.equal(json.results.length, 2)
    assert.equal(json.results[0].meta.title, 'Zephyr Thing')
    assert.ok(json.results[0].score > json.results[1].score)
  })

  test('limit: no param defaults to 20', async () => {
    for (let i = 0; i < 25; i++) {
      writeArticle(`concepts/w${i}.md`, `title: Widget ${i}`, 'widget\n')
    }
    const res = await GET(req('q=widget'))
    const json = await res.json()
    assert.equal(json.results.length, 20)
  })

  test('limit: non-numeric value falls back to 20, not an empty slice(0, NaN)', async () => {
    for (let i = 0; i < 25; i++) {
      writeArticle(`concepts/w${i}.md`, `title: Widget ${i}`, 'widget\n')
    }
    const res = await GET(req('q=widget&limit=notanumber'))
    const json = await res.json()
    assert.equal(json.results.length, 20)
  })

  test('limit: zero and negative values both fall back to 20', async () => {
    for (let i = 0; i < 25; i++) {
      writeArticle(`concepts/w${i}.md`, `title: Widget ${i}`, 'widget\n')
    }
    const zero = await (await GET(req('q=widget&limit=0'))).json()
    const neg = await (await GET(req('q=widget&limit=-5'))).json()
    assert.equal(zero.results.length, 20)
    assert.equal(neg.results.length, 20)
  })

  test('limit: an explicit small value is honored', async () => {
    for (let i = 0; i < 25; i++) {
      writeArticle(`concepts/w${i}.md`, `title: Widget ${i}`, 'widget\n')
    }
    const res = await GET(req('q=widget&limit=3'))
    const json = await res.json()
    assert.equal(json.results.length, 3)
  })

  test('limit: values above 100 are capped at 100', async () => {
    for (let i = 0; i < 25; i++) {
      writeArticle(`concepts/w${i}.md`, `title: Widget ${i}`, 'widget\n')
    }
    const res = await GET(req('q=widget&limit=500'))
    const json = await res.json()
    // Only 25 matching articles exist, so this also confirms the cap did not
    // truncate below what's actually available.
    assert.equal(json.results.length, 25)
  })

  test('no match at all: 200 with an empty results array, not an error', async () => {
    writeArticle('concepts/a.md', 'title: Unrelated', 'nothing matches\n')
    const res = await GET(req('q=zzzznomatch'))
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.deepEqual(json.results, [])
  })
})

describe('PRIVATE_PIN set', () => {
  let GET, NextRequest
  const PIN = 'testpin123'

  before(async () => {
    process.env.PRIVATE_PIN = PIN
    ;({ NextRequest } = await import('next/server'))
    ;({ GET } = await import('../src/app/api/search/route.ts?variant=pinset'))
  })
  after(() => { delete process.env.PRIVATE_PIN })
  beforeEach(clearWiki)

  function req(qs) {
    return new NextRequest(`http://localhost/api/search?${qs}`)
  }
  function reqWithHeader(qs, pin) {
    return new NextRequest(`http://localhost/api/search?${qs}`, {
      headers: { 'x-private-pin': pin },
    })
  }

  test('scope=private, no pin supplied: 403 Invalid PIN', async () => {
    writeArticle('concepts/secret.md', 'title: Secret Widget\nvisibility: private', 'widget\n')
    const res = await GET(req('q=widget&scope=private'))
    assert.equal(res.status, 403)
    const json = await res.json()
    assert.equal(json.error, 'Invalid PIN')
  })

  test('scope=private, wrong pin in query string: 403 Invalid PIN', async () => {
    const res = await GET(req('q=widget&scope=private&pin=wrong'))
    assert.equal(res.status, 403)
  })

  test('scope=private, correct pin in query string: 200, only private articles returned', async () => {
    writeArticle('concepts/secret.md', 'title: Secret Widget\nvisibility: private', 'widget\n')
    writeArticle('concepts/open.md', 'title: Open Widget', 'widget\n')
    const res = await GET(req(`q=widget&scope=private&pin=${PIN}`))
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.scope, 'private')
    assert.equal(json.results.length, 1)
    assert.equal(json.results[0].meta.title, 'Secret Widget')
  })

  test('scope=private, correct pin via x-private-pin header: 200', async () => {
    writeArticle('concepts/secret.md', 'title: Secret Widget\nvisibility: private', 'widget\n')
    const res = await GET(reqWithHeader('q=widget&scope=private', PIN))
    assert.equal(res.status, 200)
  })

  test('scope=all, correct pin: both public and private articles are returned', async () => {
    writeArticle('concepts/secret.md', 'title: Secret Widget\nvisibility: private', 'widget\n')
    writeArticle('concepts/open.md', 'title: Open Widget', 'widget\n')
    const res = await GET(req(`q=widget&scope=all&pin=${PIN}`))
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.results.length, 2)
  })

  test('scope=public still requires no pin at all once PRIVATE_PIN is configured', async () => {
    writeArticle('concepts/open.md', 'title: Open Widget', 'widget\n')
    const res = await GET(req('q=widget'))
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.results.length, 1)
  })
})
