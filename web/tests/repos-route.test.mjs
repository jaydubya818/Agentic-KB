// Characterization tests for web/src/app/api/repos/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed 2026-09-02/2026-09-05/2026-09-11/2026-09-16): route
// handler 4 of the enumerated set, following the same pattern as
// tests/agents-bus-route.test.mjs, tests/pending-count-route.test.mjs and
// tests/articles-route.test.mjs (fresh KB_ROOT per file, GAPs pinned not
// fixed). This route needs no auth and is not part of the requireAuth()
// chokepoint entry's enumeration, so that gap is out of scope here.
//
// Two previously-undocumented gaps pinned, not fixed (both read from
// lib/repo-runtime/registry.mjs): the route always computes
// `status: status || 'new'` and `description: description || undefined` on
// every POST, including an update of an existing repo. upsertRepo() merges
// via `{ ...existing, ...record }`, and a spread overwrites with an explicit
// `undefined` the same as any other value, so a POST that updates one field
// (e.g. description) without repeating `status` silently resets an
// already-`synced` repo back to `status: 'new'`, and a POST that omits
// `description` silently clears a previously-set one.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'repos-route-test-'))
process.env.KB_ROOT = KB_ROOT

let GET, POST, NextRequest
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ GET, POST } = await import('../src/app/api/repos/route.ts'))
})
after(() => fs.rmSync(KB_ROOT, { recursive: true, force: true }))

beforeEach(() => {
  fs.rmSync(path.join(KB_ROOT, 'config', 'repos'), { recursive: true, force: true })
})

function postReq(body) {
  return new NextRequest('http://localhost/api/repos', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

test('GET with no registry.json at all returns an empty list', async () => {
  const json = await (await GET()).json()
  assert.deepEqual(json.repos, [])
})

test('POST with no name and no github_url is rejected 400', async () => {
  const res = await POST(postReq({}))
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.error, 'Missing required fields: name, github_url')
})

test('POST with a name but no github_url is rejected 400', async () => {
  const res = await POST(postReq({ name: 'acme' }))
  assert.equal(res.status, 400)
})

test('POST creates a new repo, defaulting status to "new"', async () => {
  const res = await POST(postReq({ name: 'acme', github_url: 'https://github.com/x/acme' }))
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.repo.repo_name, 'acme')
  assert.equal(json.repo.github_url, 'https://github.com/x/acme')
  assert.equal(json.repo.status, 'new')

  const listed = await (await GET()).json()
  assert.equal(listed.repos.length, 1)
  assert.equal(listed.repos[0].repo_name, 'acme')
})

test('POST with an explicit status honours it on create', async () => {
  const res = await POST(postReq({ name: 'acme', github_url: 'https://github.com/x/acme', status: 'synced' }))
  const json = await res.json()
  assert.equal(json.repo.status, 'synced')
})

test('GAP: updating an existing repo without repeating status resets it to "new"', async () => {
  await POST(postReq({ name: 'acme', github_url: 'https://github.com/x/acme', status: 'synced' }))
  // A caller updating only the description, as the UI's edit form would,
  // does not think of itself as touching status at all.
  const res = await POST(postReq({ name: 'acme', github_url: 'https://github.com/x/acme', description: 'now documented' }))
  const json = await res.json()
  assert.equal(json.repo.description, 'now documented')
  // The already-synced repo is silently demoted back to "new".
  assert.equal(json.repo.status, 'new')
})

test('GAP: updating an existing repo without repeating description clears it', async () => {
  await POST(postReq({ name: 'acme', github_url: 'https://github.com/x/acme', description: 'first description' }))
  const res = await POST(postReq({ name: 'acme', github_url: 'https://github.com/x/acme', status: 'synced' }))
  const json = await res.json()
  assert.equal(json.repo.status, 'synced')
  // The previously-set description is gone, even though this call never
  // mentioned description at all.
  assert.equal(json.repo.description, undefined)
})

test('POST on an existing repo_name updates in place rather than appending', async () => {
  await POST(postReq({ name: 'acme', github_url: 'https://github.com/x/acme' }))
  await POST(postReq({ name: 'acme', github_url: 'https://github.com/x/acme-renamed' }))
  const listed = await (await GET()).json()
  assert.equal(listed.repos.length, 1)
  assert.equal(listed.repos[0].github_url, 'https://github.com/x/acme-renamed')
})

test('a damaged registry.json (not valid JSON) throws rather than being read as empty', async () => {
  const full = path.join(KB_ROOT, 'config', 'repos', 'registry.json')
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, '{not json')
  await assert.rejects(() => GET())
})
