// Characterization tests for web/src/app/api/repos/[repo]/docs/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 20 of the enumerated 36.
//
// This route delegates to lib/repo-runtime/index.mjs's getRepo() and
// repoDocsRoot(), both of which already have unit-level coverage via
// tests/repos/repo-runtime.test.mjs (getRepo at lines ~850/1131/1161,
// repoDocsRoot at line 190). What that file does NOT cover, and what this
// file pins: this route's own HTTP-layer behavior and its in-route
// walkDocs() helper -- the 400 on an invalid repo slug, the 404 on an
// unknown repo, a recursive .md/.mdx walk of repo-docs/ with path/title/size
// narrowing, the `section` query-param filter (on both directories and
// files), the empty-array result when repo-docs/ does not exist yet, and
// alphabetical sort-by-path of the result.
//
// No GAP found: validateSlug() runs before getRepo() and rejects any slug
// containing '..' outright (400), and a slug that passes validateSlug but
// does not match any registry record 404s the same way an already-known-
// bad name would -- the raw string is never used to build a filesystem
// path before the registry lookup, same shape as the no-GAP finding in
// repo-context-route.test.mjs. walkDocs() itself only reads (readdirSync /
// statSync) under a path built from the validated repo + the fixed
// repoDocsRoot() suffix, so there is no live write side effect for this
// route to characterize beyond what's already covered.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-docs-kb-'))
process.env.KB_ROOT = KB_ROOT

function writeRegistry(repos) {
  const dir = path.join(KB_ROOT, 'config/repos')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'registry.json'), JSON.stringify({ version: '1.0', repos }, null, 2))
}

function writeDoc(relPath, content) {
  const full = path.join(KB_ROOT, 'wiki/repos/test-repo/repo-docs', relPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
}

let GET, NextRequest
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ GET } = await import('../src/app/api/repos/[repo]/docs/route.ts'))
  writeRegistry([{ repo_name: 'test-repo', github_url: 'https://github.com/x/test-repo', status: 'synced' }])
  writeDoc('README.md', '# readme\ncontent')
  writeDoc('guides/setup.mdx', '# setup\nlonger content than the readme')
  writeDoc('guides/deploy.md', '# deploy')
  writeDoc('notes.txt', 'not a doc, should never be listed')
})

after(() => {
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
})

function getReq(repo, query) {
  const url = new URL(`http://localhost/api/repos/${repo}/docs`)
  for (const [k, v] of Object.entries(query || {})) url.searchParams.set(k, v)
  return GET(new NextRequest(url), { params: Promise.resolve({ repo }) })
}

test('GET with an invalid (path-traversal-shaped) repo slug returns 400, not a thrown error', async () => {
  const res = await getReq('..%2Fescape')
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.error, 'Invalid repo')
  assert.equal(json.code, 'BAD_REQUEST')
})

test('GET for an unknown (but validly-shaped) repo returns 404', async () => {
  const res = await getReq('no-such-repo')
  assert.equal(res.status, 404)
  const json = await res.json()
  assert.equal(json.error, 'Repo not found')
})

test('GET for a valid repo lists .md and .mdx files recursively, sorted by path, excluding other extensions', async () => {
  const res = await getReq('test-repo')
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.repo, 'test-repo')
  const paths = json.docs.map((d) => d.path)
  // Sorted with String#localeCompare, which is locale-aware and orders
  // case-insensitively -- lowercase 'guides/...' sorts before 'README.md'
  // rather than after it, as a plain ASCII/byte sort would.
  assert.deepEqual(paths, ['guides/deploy.md', 'guides/setup.mdx', 'README.md'])
  assert.ok(!paths.includes('notes.txt'))
})

test('each returned doc is narrowed to path/title/size only, with title derived from the filename', async () => {
  const json = await (await getReq('test-repo')).json()
  const readme = json.docs.find((d) => d.path === 'README.md')
  assert.ok(readme)
  assert.deepEqual(Object.keys(readme).sort(), ['path', 'size', 'title'])
  assert.equal(readme.title, 'README')
  assert.ok(readme.size > 0)
  const setup = json.docs.find((d) => d.path === 'guides/setup.mdx')
  assert.equal(setup.title, 'setup')
})

test('GET with a section query param filters to that subtree only', async () => {
  const json = await (await getReq('test-repo', { section: 'guides' })).json()
  const paths = json.docs.map((d) => d.path).sort()
  assert.deepEqual(paths, ['guides/deploy.md', 'guides/setup.mdx'])
})

test('GET with a section that matches nothing returns an empty array, not an error', async () => {
  const json = await (await getReq('test-repo', { section: 'no-such-section' })).json()
  assert.deepEqual(json.docs, [])
})

test('GET for a repo whose repo-docs/ directory does not exist yet returns an empty array', async () => {
  writeRegistry([
    { repo_name: 'test-repo', github_url: 'https://github.com/x/test-repo', status: 'synced' },
    { repo_name: 'no-docs-yet', github_url: 'https://github.com/x/no-docs-yet', status: 'synced' },
  ])
  const json = await (await getReq('no-docs-yet')).json()
  assert.equal(json.repo, 'no-docs-yet')
  assert.deepEqual(json.docs, [])
})
