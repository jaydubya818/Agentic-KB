// Characterization tests for web/src/app/api/articles/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed 2026-09-02/2026-09-05): route handler 3 of the
// enumerated set, following the same pattern as
// tests/agents-bus-route.test.mjs and tests/pending-count-route.test.mjs
// (fresh KB_ROOT per file, GAPs pinned not fixed). This route needs no
// auth and is read-only, so it is not part of the requireAuth() chokepoint
// entry -- its own code comment says as much: "This route has no PIN gate,
// so only public metadata may leave it".
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'articles-route-test-'))
process.env.KB_ROOT = KB_ROOT

let GET
before(async () => {
  ;({ GET } = await import('../src/app/api/articles/route.ts'))
})
after(() => fs.rmSync(KB_ROOT, { recursive: true, force: true }))

beforeEach(() => {
  fs.rmSync(path.join(KB_ROOT, 'wiki'), { recursive: true, force: true })
})

function writeArticle(rel, frontmatter = '', body = '# Title\n') {
  const full = path.join(KB_ROOT, 'wiki', rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  const fm = frontmatter ? `---\n${frontmatter}\n---\n` : ''
  fs.writeFileSync(full, fm + body)
}

async function call() {
  return (await GET()).json()
}

test('no wiki/ directory at all: every known section present with an empty array, empty index', async () => {
  const json = await call()
  assert.equal(json.indexContent, '')
  assert.equal(json.sections.length, 9)
  const names = json.sections.map(s => s.section)
  assert.deepEqual(names, [
    'concepts', 'patterns', 'frameworks', 'entities', 'recipes',
    'evaluations', 'personal', 'summaries', 'syntheses',
  ])
  for (const s of json.sections) assert.deepEqual(s.articles, [])
})

test('an article with no visibility frontmatter defaults to public and is returned', async () => {
  writeArticle('concepts/foo.md', 'title: Foo')
  const json = await call()
  const concepts = json.sections.find(s => s.section === 'concepts')
  assert.equal(concepts.articles.length, 1)
  assert.equal(concepts.articles[0].title, 'Foo')
  assert.equal(concepts.articles[0].visibility, 'public')
})

test('visibility: private in frontmatter is filtered out of the response entirely', async () => {
  writeArticle('concepts/secret.md', 'title: Secret\nvisibility: private')
  writeArticle('concepts/open.md', 'title: Open')
  const json = await call()
  const concepts = json.sections.find(s => s.section === 'concepts')
  assert.equal(concepts.articles.length, 1)
  assert.equal(concepts.articles[0].title, 'Open')
})

test('GAP: every wiki/personal/ article is always private (route.ts comment says so), ' +
     'so the personal section in this response is unreachable and always empty -- ' +
     'even an article with no visibility frontmatter at all', async () => {
  writeArticle('personal/note.md', 'title: Personal Note')
  const json = await call()
  const personal = json.sections.find(s => s.section === 'personal')
  // parseArticle forces visibility: 'private' for anything under wiki/personal/,
  // and this route filters to visibility === 'public' only -- so the
  // "personal" section group is structurally guaranteed to be empty from
  // this endpoint, regardless of what is actually filed there.
  assert.deepEqual(personal.articles, [])
})

test('section label uses the human-readable map, not the raw section key', async () => {
  writeArticle('frameworks/x.md', 'title: X')
  const json = await call()
  const frameworks = json.sections.find(s => s.section === 'frameworks')
  assert.equal(frameworks.label, 'Frameworks')
})

test('a non-.md file in a section directory is ignored', async () => {
  const dir = path.join(KB_ROOT, 'wiki', 'recipes')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'notes.txt'), 'not markdown')
  const json = await call()
  const recipes = json.sections.find(s => s.section === 'recipes')
  assert.deepEqual(recipes.articles, [])
})

test('an unrecognised top-level wiki/ directory is not one of the returned sections', async () => {
  writeArticle('not-a-real-section/x.md', 'title: X')
  const json = await call()
  const names = json.sections.map(s => s.section)
  assert.ok(!names.includes('not-a-real-section'))
})

test('readIndex returns wiki/index.md content verbatim when present', async () => {
  const indexPath = path.join(KB_ROOT, 'wiki', 'index.md')
  fs.mkdirSync(path.dirname(indexPath), { recursive: true })
  fs.writeFileSync(indexPath, '# Welcome\n\nSome index content.\n')
  const json = await call()
  assert.equal(json.indexContent, '# Welcome\n\nSome index content.\n')
})

test('missing wiki/index.md is tolerated: indexContent is the empty string, not an error', async () => {
  const json = await call()
  assert.equal(json.indexContent, '')
})
