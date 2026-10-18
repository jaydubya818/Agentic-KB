// Characterization tests for web/src/app/api/repos/[repo]/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed through 2026-10-04): route handler 8 of the
// enumerated 36, following the same pattern as tests/repos-route.test.mjs
// (fresh KB_ROOT per file, set before the route is imported since
// DEFAULT_KB_ROOT in src/lib/articles.ts reads process.env.KB_ROOT at
// import time, not per-request). This route needs no auth and performs no
// writes, so it is not part of the requireAuth() / atomicWrite chokepoint
// entries.
//
// No previously-undocumented gap found in this route itself: it is a thin
// 20-line wrapper around lib/repo-runtime/registry.mjs's getRepo(), whose
// own behaviour (including the "damaged registry.json throws rather than
// looking empty" stance) is already pinned by tests/repos-route.test.mjs.
// These tests pin the wrapper's own two decisions: the 404 shape for an
// unknown repo name, and that it returns the full stored record verbatim
// (not a projection) for a known one.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts/[repo] is loaded).
import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-byname-route-test-'))
process.env.KB_ROOT = KB_ROOT

let GET
before(async () => {
  ;({ GET } = await import('../src/app/api/repos/[repo]/route.ts'))
})
after(() => fs.rmSync(KB_ROOT, { recursive: true, force: true }))

const REGISTRY_PATH = path.join(KB_ROOT, 'config', 'repos', 'registry.json')

beforeEach(() => {
  fs.rmSync(path.join(KB_ROOT, 'config', 'repos'), { recursive: true, force: true })
})

function writeRegistry(repos) {
  fs.mkdirSync(path.dirname(REGISTRY_PATH), { recursive: true })
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify({ version: '1.0', repos }, null, 2))
}

function ctx(repo) {
  return { params: Promise.resolve({ repo }) }
}

test('GET with no registry.json at all returns 404, not a throw', async () => {
  const res = await GET(new Request('http://localhost/api/repos/acme'), ctx('acme'))
  assert.equal(res.status, 404)
  const json = await res.json()
  assert.deepEqual(json, { error: 'Repo not found' })
})

test('GET for a repo name not present in a non-empty registry returns 404', async () => {
  writeRegistry([{ repo_name: 'acme', github_url: 'https://github.com/x/acme', status: 'new' }])
  const res = await GET(new Request('http://localhost/api/repos/widgets'), ctx('widgets'))
  assert.equal(res.status, 404)
})

test('GET for a known repo returns 200 with the full stored record', async () => {
  writeRegistry([
    { repo_name: 'acme', github_url: 'https://github.com/x/acme', status: 'synced', description: 'the acme repo', last_sync_at: '2026-10-01T00:00:00.000Z' },
  ])
  const res = await GET(new Request('http://localhost/api/repos/acme'), ctx('acme'))
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.deepEqual(json.repo, {
    repo_name: 'acme',
    github_url: 'https://github.com/x/acme',
    status: 'synced',
    description: 'the acme repo',
    last_sync_at: '2026-10-01T00:00:00.000Z',
  })
})

test('GET picks the matching record out of several by exact repo_name', async () => {
  writeRegistry([
    { repo_name: 'acme', github_url: 'https://github.com/x/acme', status: 'new' },
    { repo_name: 'widgets', github_url: 'https://github.com/x/widgets', status: 'synced' },
    { repo_name: 'acme-two', github_url: 'https://github.com/x/acme-two', status: 'new' },
  ])
  const res = await GET(new Request('http://localhost/api/repos/widgets'), ctx('widgets'))
  const json = await res.json()
  assert.equal(json.repo.repo_name, 'widgets')
  assert.equal(json.repo.status, 'synced')
})

test('repo_name matching is exact, not a prefix or substring match', async () => {
  writeRegistry([{ repo_name: 'acme', github_url: 'https://github.com/x/acme', status: 'new' }])
  const res = await GET(new Request('http://localhost/api/repos/acme-two'), ctx('acme-two'))
  assert.equal(res.status, 404)
})

test('repo_name matching is case-sensitive', async () => {
  writeRegistry([{ repo_name: 'Acme', github_url: 'https://github.com/x/acme', status: 'new' }])
  const res = await GET(new Request('http://localhost/api/repos/acme'), ctx('acme'))
  assert.equal(res.status, 404)
})

test('a damaged registry.json (not valid JSON) throws rather than looking empty', async () => {
  fs.mkdirSync(path.dirname(REGISTRY_PATH), { recursive: true })
  fs.writeFileSync(REGISTRY_PATH, '{not json')
  await assert.rejects(() => GET(new Request('http://localhost/api/repos/acme'), ctx('acme')))
})

test('a plain-array registry.json (legacy format, no wrapper) is read the same as the wrapped format', async () => {
  fs.mkdirSync(path.dirname(REGISTRY_PATH), { recursive: true })
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify([{ repo_name: 'acme', github_url: 'https://github.com/x/acme', status: 'new' }]))
  const res = await GET(new Request('http://localhost/api/repos/acme'), ctx('acme'))
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.repo.repo_name, 'acme')
})

test('GET does not require any request headers or body', async () => {
  writeRegistry([{ repo_name: 'acme', github_url: 'https://github.com/x/acme', status: 'new' }])
  const res = await GET(new Request('http://localhost/api/repos/acme', { method: 'GET' }), ctx('acme'))
  assert.equal(res.status, 200)
})
