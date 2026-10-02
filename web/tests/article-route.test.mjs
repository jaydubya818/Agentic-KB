// Characterization tests for web/src/app/api/article/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed 2026-09-02 through 2026-10-01): route handler 5 of
// the enumerated set, following the same pattern as
// tests/agents-bus-route.test.mjs, tests/pending-count-route.test.mjs,
// tests/articles-route.test.mjs and tests/repos-route.test.mjs (fresh
// KB_ROOT per file, GAPs pinned not fixed).
//
// This route's PIN gate reads a module-level `const PRIVATE_PIN =
// process.env.PRIVATE_PIN || ''` captured at import time, so the two PIN
// postures (unset vs. set) need two separate module instances -- each
// describe block below imports the route fresh with a cache-busting query
// string after setting PRIVATE_PIN for that block.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, describe, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'article-route-test-'))
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
    ;({ GET } = await import('../src/app/api/article/route.ts?variant=nopin'))
  })
  beforeEach(clearWiki)

  function req(qs) {
    return new NextRequest(`http://localhost/api/article?${qs}`)
  }

  test('no path and no slug: 400 Missing path or slug parameter', async () => {
    const res = await GET(req(''))
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.equal(json.error, 'Missing path or slug parameter')
    assert.equal(json.code, 'BAD_REQUEST')
  })

  test('path without a .md/.mdx extension: 400 Invalid path, before any file access', async () => {
    const res = await GET(req('path=wiki/concepts/foo.txt'))
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.equal(json.error, 'Invalid path')
  })

  test('path that escapes KB_ROOT: 400 Invalid path (safeJoin throws, caught)', async () => {
    const res = await GET(req(`path=${encodeURIComponent('../../../etc/wiki.md')}`))
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.equal(json.error, 'Invalid path')
  })

  test('path to a file that does not exist on disk: 404 Article not found', async () => {
    const res = await GET(req('path=wiki/concepts/missing.md'))
    assert.equal(res.status, 404)
    const json = await res.json()
    assert.equal(json.error, 'Article not found')
  })

  test('path to a real public article: 200 with meta, content and backlinks', async () => {
    writeArticle('concepts/foo.md', 'title: Foo', '# Foo\n\nBody text.\n')
    const res = await GET(req('path=wiki/concepts/foo.md'))
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.meta.title, 'Foo')
    assert.equal(json.meta.visibility, 'public')
    assert.match(json.content, /Body text\./)
    assert.deepEqual(json.backlinks, [])
  })

  test('slug for a file that does not exist: 404 Article not found', async () => {
    const res = await GET(req('slug=concepts/nope'))
    assert.equal(res.status, 404)
  })

  test('slug for an existing article resolves the same as path', async () => {
    writeArticle('concepts/bar.md', 'title: Bar')
    const res = await GET(req('slug=concepts/bar'))
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.meta.title, 'Bar')
    assert.equal(json.meta.slug, 'concepts/bar')
  })

  test('backlinks: a [[wiki-link]] from another article is reported', async () => {
    writeArticle('concepts/target.md', 'title: Target')
    writeArticle('concepts/linker.md', 'title: Linker', '# Linker\n\nSee [[concepts/target]].\n')
    const res = await GET(req('slug=concepts/target'))
    const json = await res.json()
    assert.equal(json.backlinks.length, 1)
    assert.equal(json.backlinks[0].title, 'Linker')
  })

  test('private article with PRIVATE_PIN unset: 403 Private access disabled, not a PIN prompt', async () => {
    writeArticle('concepts/secret.md', 'title: Secret\nvisibility: private')
    const res = await GET(req('slug=concepts/secret'))
    assert.equal(res.status, 403)
    const json = await res.json()
    assert.equal(json.error, 'Private access disabled (PRIVATE_PIN unset)')
  })

  test('GAP: a wiki/personal/ article is always private regardless of frontmatter, ' +
       'so it 403s here even with no visibility field at all and PRIVATE_PIN unset', async () => {
    writeArticle('personal/note.md', 'title: Personal Note')
    const res = await GET(req('slug=personal/note'))
    assert.equal(res.status, 403)
  })
})

describe('PRIVATE_PIN set', () => {
  let GET, NextRequest
  const PIN = 'testpin123'

  before(async () => {
    process.env.PRIVATE_PIN = PIN
    ;({ NextRequest } = await import('next/server'))
    ;({ GET } = await import('../src/app/api/article/route.ts?variant=pinset'))
  })
  after(() => { delete process.env.PRIVATE_PIN })
  beforeEach(clearWiki)

  function req(qs) {
    return new NextRequest(`http://localhost/api/article?${qs}`)
  }
  function reqWithHeader(qs, pin) {
    return new NextRequest(`http://localhost/api/article?${qs}`, {
      headers: { 'x-private-pin': pin },
    })
  }

  test('private article, no pin supplied: 403 Invalid PIN', async () => {
    writeArticle('concepts/secret.md', 'title: Secret\nvisibility: private')
    const res = await GET(req('slug=concepts/secret'))
    assert.equal(res.status, 403)
    const json = await res.json()
    assert.equal(json.error, 'Invalid PIN')
  })

  test('private article, wrong pin in query string: 403 Invalid PIN', async () => {
    writeArticle('concepts/secret.md', 'title: Secret\nvisibility: private')
    const res = await GET(req('slug=concepts/secret&pin=wrong'))
    assert.equal(res.status, 403)
  })

  test('private article, correct pin in query string: 200', async () => {
    writeArticle('concepts/secret.md', 'title: Secret\nvisibility: private')
    const res = await GET(req(`slug=concepts/secret&pin=${PIN}`))
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.meta.title, 'Secret')
  })

  test('private article, correct pin via x-private-pin header: 200', async () => {
    writeArticle('concepts/secret.md', 'title: Secret\nvisibility: private')
    const res = await GET(reqWithHeader('slug=concepts/secret', PIN))
    assert.equal(res.status, 200)
  })

  test('public article still requires no pin at all once PRIVATE_PIN is configured', async () => {
    writeArticle('concepts/open.md', 'title: Open')
    const res = await GET(req('slug=concepts/open'))
    assert.equal(res.status, 200)
  })
})
