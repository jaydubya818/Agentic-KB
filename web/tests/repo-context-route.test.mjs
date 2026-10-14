// Characterization tests for web/src/app/api/repos/[repo]/context/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 17 of the enumerated 36,
// the repo-scoped sibling of the already-covered
// web/src/app/api/agents/[id]/context/route.ts (agent-context-route.test.mjs).
//
// This route delegates to lib/repo-runtime/index.mjs's getRepo() and
// loadRepoContext(), both of which already have extensive unit-level
// coverage via tests/repos/repo-runtime.test.mjs. What that file does NOT
// cover, and what this file pins: this route's own HTTP-layer behavior --
// the 404 on an unknown or unsafe repo name, the agent_id/tier query-string
// defaults and passthrough, and that the response shape narrows each
// context file down to path/reason/bytes/priority only.
//
// No GAP found: getRepo() looks a repo name up against the registry by
// exact string match (lib/repo-runtime/registry.mjs), so a path-traversal-
// shaped repo param such as '../escape' simply fails to match any record
// and 404s exactly like a merely-unknown repo name -- the raw string is
// never used to build a filesystem path before that check runs, unlike the
// taskId GAP documented in repo-close-task-route.test.mjs.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-context-kb-'))
process.env.KB_ROOT = KB_ROOT

function writeRegistry(repos) {
  const dir = path.join(KB_ROOT, 'config/repos')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'registry.json'), JSON.stringify({ version: '1.0', repos }, null, 2))
}

let GET, NextRequest
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ GET } = await import('../src/app/api/repos/[repo]/context/route.ts'))
  writeRegistry([{ repo_name: 'test-repo', github_url: 'https://github.com/x/test-repo', status: 'synced' }])
  const docsDir = path.join(KB_ROOT, 'wiki/repos/test-repo/canonical')
  fs.mkdirSync(docsDir, { recursive: true })
  fs.writeFileSync(path.join(docsDir, 'PRD.md'), '---\ntitle: PRD\n---\nCanonical content only the server should see in full.\n')
})

after(() => {
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
})

function getReq(repo, query) {
  const url = new URL(`http://localhost/api/repos/${repo}/context`)
  for (const [k, v] of Object.entries(query || {})) url.searchParams.set(k, v)
  return GET(new NextRequest(url), { params: Promise.resolve({ repo }) })
}

test('GET for an unknown repo returns 404, not a thrown error', async () => {
  const res = await getReq('no-such-repo')
  assert.equal(res.status, 404)
  const json = await res.json()
  assert.equal(json.error, 'Repo not found')
})

test('GET for an unsafe (path-traversal-shaped) repo name 404s the same way as a missing one', async () => {
  // getRepo() matches the repo param against registry entries by exact
  // repo_name equality, so '../escape' simply finds no record -- the raw
  // string never reaches a filesystem path before this check runs.
  const res = await getReq('..%2Fescape')
  assert.equal(res.status, 404)
  const json = await res.json()
  assert.equal(json.error, 'Repo not found')
})

test('GET with a valid repo defaults agent_id to "system" and tier to "worker"', async () => {
  const res = await getReq('test-repo')
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.repo, 'test-repo')
  assert.equal(json.agent_id, 'system')
  assert.equal(json.tier, 'worker')
  assert.ok(Array.isArray(json.files))
  assert.ok(json.files.some(f => f.path === 'wiki/repos/test-repo/canonical/PRD.md'))
})

test('GET passes agent_id and tier query params through to the response', async () => {
  const res = await getReq('test-repo', { agent_id: 'w1', tier: 'lead' })
  const json = await res.json()
  assert.equal(json.agent_id, 'w1')
  assert.equal(json.tier, 'lead')
})

test('each returned file is narrowed to path/reason/bytes/priority only, with no raw content field', async () => {
  const json = await (await getReq('test-repo')).json()
  const file = json.files.find(f => f.path === 'wiki/repos/test-repo/canonical/PRD.md')
  assert.ok(file)
  assert.deepEqual(Object.keys(file).sort(), ['bytes', 'path', 'priority', 'reason'])
  assert.ok(file.bytes > 0)
})
