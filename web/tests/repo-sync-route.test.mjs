// Characterization tests for web/src/app/api/repos/[repo]/sync/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 21 of the enumerated 36.
//
// This route delegates to lib/repo-runtime/registry.mjs's getRepo() and
// lib/repo-runtime/sync.mjs's syncRepo(), both of which already have
// extensive unit-level coverage via tests/repos/repo-runtime.test.mjs
// (getRepo at lines ~850/1131/1161; syncRepo's fetch/write/archive/partial
// behavior at lines ~830-1201, including the same globalThis.fetch mocking
// technique used below). What that file does NOT cover, and what this file
// pins: this route's own HTTP-layer behavior -- the 404 on an unknown repo
// (GET and POST), GET's defaults for a repo that has never synced, the
// token-resolution precedence the route adds on top of syncRepo (explicit
// body.token wins, process.env.GITHUB_PAT is the fallback, neither means no
// Authorization header at all), and the route's own 502 mapping of a
// fetch-type sync error -- plus one previously-undocumented GAP: that 502
// mapping only looks at errors whose type is 'fetch' (a failed tree
// listing), not a partial sync where some blobs failed individually: a
// sync that silently drops files still returns 200 synced:true.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-sync-kb-'))
process.env.KB_ROOT = KB_ROOT

function writeRegistry(repos) {
  const dir = path.join(KB_ROOT, 'config/repos')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'registry.json'), JSON.stringify({ version: '1.0', repos }, null, 2))
}

function readRegistry() {
  const full = path.join(KB_ROOT, 'config/repos/registry.json')
  return JSON.parse(fs.readFileSync(full, 'utf8')).repos
}

let GET, POST, NextRequest
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ GET, POST } = await import('../src/app/api/repos/[repo]/sync/route.ts'))
})

after(() => {
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
})

function getReq(repo) {
  const url = new URL(`http://localhost/api/repos/${repo}/sync`)
  return GET(new Request(url), { params: Promise.resolve({ repo }) })
}

function postReq(repo, body) {
  const url = new URL(`http://localhost/api/repos/${repo}/sync`)
  const init = body === undefined ? undefined : { method: 'POST', body: JSON.stringify(body) }
  return POST(new NextRequest(url, init), { params: Promise.resolve({ repo }) })
}

function b64(s) {
  return Buffer.from(s, 'utf8').toString('base64')
}

// A minimal but complete fake of the three GitHub API calls syncRepo makes
// per sync: the recursive tree listing, one blob fetch per included
// markdown file, and the branch's current commit. `files` is
// { path, sha, content, ok? }[] -- ok:false makes that one blob fetch fail
// (the shape a partial sync needs), everything else succeeds.
function installFetchMock({ files, treeOk = true, commitSha = 'deadbeef' }) {
  const calls = []
  const orig = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), headers: { ...(init?.headers || {}) } })
    if (String(url).includes('/git/trees/')) {
      if (!treeOk) return { ok: false, status: 500, statusText: 'Internal Server Error' }
      return {
        ok: true,
        json: async () => ({
          truncated: false,
          tree: files.map(f => ({ type: 'blob', path: f.path, sha: f.sha })),
        }),
      }
    }
    if (String(url).includes('/git/blobs/')) {
      const sha = String(url).split('/').pop()
      const file = files.find(f => f.sha === sha)
      if (!file || file.ok === false) return { ok: false, status: 404, statusText: 'Not Found' }
      return { ok: true, json: async () => ({ content: b64(file.content) }) }
    }
    if (String(url).includes('/commits/')) {
      return { ok: true, json: async () => ({ sha: commitSha }) }
    }
    throw new Error(`unexpected fetch url in test mock: ${url}`)
  }
  return {
    calls,
    restore() { globalThis.fetch = orig },
  }
}

test('GET for an unknown repo returns 404, not a thrown error', async () => {
  writeRegistry([])
  const res = await getReq('no-such-repo')
  assert.equal(res.status, 404)
  const json = await res.json()
  assert.equal(json.error, 'Repo not found')
})

test('GET for a known repo that has never synced returns defaults, not undefined/missing fields', async () => {
  writeRegistry([{ repo_name: 'fresh-repo', owner: 'acme', github_url: 'https://github.com/acme/fresh-repo' }])
  const res = await getReq('fresh-repo')
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.deepEqual(json, {
    repo: 'fresh-repo',
    status: 'new',
    last_sync_at: null,
    last_synced_commit: null,
    markdown_file_count: 0,
  })
})

test('GET for a repo with prior sync state returns those fields verbatim, not the defaults', async () => {
  writeRegistry([{
    repo_name: 'synced-repo', owner: 'acme', github_url: 'https://github.com/acme/synced-repo',
    status: 'active', last_sync_at: '2026-01-01T00:00:00.000Z', last_synced_commit: 'abc123', markdown_file_count: 7,
  }])
  const json = await (await getReq('synced-repo')).json()
  assert.equal(json.status, 'active')
  assert.equal(json.last_sync_at, '2026-01-01T00:00:00.000Z')
  assert.equal(json.last_synced_commit, 'abc123')
  assert.equal(json.markdown_file_count, 7)
})

test('POST for an unknown repo returns 404 without ever calling fetch', async () => {
  writeRegistry([])
  const mock = installFetchMock({ files: [] })
  try {
    const res = await postReq('no-such-repo', {})
    assert.equal(res.status, 404)
    const json = await res.json()
    assert.equal(json.error, 'Repo not found')
    assert.deepEqual(mock.calls, [], 'an unknown repo must 404 before any GitHub call is made')
  } finally {
    mock.restore()
  }
})

test('POST with a successful sync writes the doc to disk, returns synced:true with a trace, and advances the registry', async () => {
  writeRegistry([{ repo_name: 'ok-repo', owner: 'acme', github_url: 'https://github.com/acme/ok-repo' }])
  const mock = installFetchMock({
    files: [{ path: 'README.md', sha: 'sha-readme', content: '# Hello\nworld' }],
  })
  try {
    delete process.env.GITHUB_PAT
    const res = await postReq('ok-repo', {})
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.synced, true)
    assert.equal(json.repo, 'ok-repo')
    assert.equal(json.trace.created.length, 1)
    assert.equal(json.trace.commit_sha, 'deadbeef')

    const written = path.join(KB_ROOT, 'wiki/repos/ok-repo/repo-docs/README.md')
    assert.ok(fs.existsSync(written), 'synced doc must actually land on disk')
    assert.match(fs.readFileSync(written, 'utf8'), /Hello\nworld/)

    const record = readRegistry().find(r => r.repo_name === 'ok-repo')
    assert.equal(record.last_synced_commit, 'deadbeef')
    assert.equal(record.markdown_file_count, 1)
    assert.equal(record.status, 'active')
  } finally {
    mock.restore()
  }
})

test('POST omits the Authorization header entirely when no body token is given and GITHUB_PAT is unset', async () => {
  writeRegistry([{ repo_name: 'no-token-repo', owner: 'acme', github_url: 'https://github.com/acme/no-token-repo' }])
  delete process.env.GITHUB_PAT
  const mock = installFetchMock({ files: [{ path: 'README.md', sha: 's1', content: 'x' }] })
  try {
    const res = await postReq('no-token-repo', {})
    assert.equal(res.status, 200)
    const treeCall = mock.calls.find(c => c.url.includes('/git/trees/'))
    assert.ok(treeCall)
    assert.equal(treeCall.headers['Authorization'], undefined)
  } finally {
    mock.restore()
  }
})

test('POST falls back to process.env.GITHUB_PAT when the body supplies no token', async () => {
  writeRegistry([{ repo_name: 'env-token-repo', owner: 'acme', github_url: 'https://github.com/acme/env-token-repo' }])
  process.env.GITHUB_PAT = 'env-pat-value'
  const mock = installFetchMock({ files: [{ path: 'README.md', sha: 's1', content: 'x' }] })
  try {
    const res = await postReq('env-token-repo', {})
    assert.equal(res.status, 200)
    const treeCall = mock.calls.find(c => c.url.includes('/git/trees/'))
    assert.equal(treeCall.headers['Authorization'], 'token env-pat-value')
  } finally {
    mock.restore()
    delete process.env.GITHUB_PAT
  }
})

test('POST prefers an explicit body token over GITHUB_PAT when both are present', async () => {
  writeRegistry([{ repo_name: 'both-token-repo', owner: 'acme', github_url: 'https://github.com/acme/both-token-repo' }])
  process.env.GITHUB_PAT = 'env-pat-value'
  const mock = installFetchMock({ files: [{ path: 'README.md', sha: 's1', content: 'x' }] })
  try {
    const res = await postReq('both-token-repo', { token: 'body-token-value' })
    assert.equal(res.status, 200)
    const treeCall = mock.calls.find(c => c.url.includes('/git/trees/'))
    assert.equal(treeCall.headers['Authorization'], 'token body-token-value')
  } finally {
    mock.restore()
    delete process.env.GITHUB_PAT
  }
})

test('POST maps a failed tree fetch to 502 synced:false, and does not mark the repo synced', async () => {
  writeRegistry([{ repo_name: 'bad-fetch-repo', owner: 'acme', github_url: 'https://github.com/acme/bad-fetch-repo' }])
  const mock = installFetchMock({ files: [], treeOk: false })
  try {
    const res = await postReq('bad-fetch-repo', {})
    assert.equal(res.status, 502)
    const json = await res.json()
    assert.equal(json.synced, false)
    assert.equal(json.repo, 'bad-fetch-repo')
    assert.equal(json.trace.errors[0].type, 'fetch')

    const record = readRegistry().find(r => r.repo_name === 'bad-fetch-repo')
    assert.equal(record.last_sync_at, undefined, 'a failed fetch must not stamp last_sync_at')
    assert.equal(record.markdown_file_count, undefined)
  } finally {
    mock.restore()
  }
})

test('GAP (pinned, not fixed): a partial sync -- tree listing fine, one blob fetch individually failed -- still returns 200 synced:true', async () => {
  // This is distinct from the previous test: there the *tree* fetch itself
  // failed and syncRepo never got a file list at all, which the route maps
  // to 502. Here the tree fetch succeeds and one of its two blob fetches
  // fails; syncRepo records that under trace.partial / trace.source, not
  // trace.errors (whose only producer is the tree-level failure above), so
  // this route's `fetchFailed` check -- which only inspects
  // trace.errors.some(e => e.type === 'fetch') -- never sees it. The result
  // is a 200 that looks identical in shape to a complete success; only a
  // caller that also reads trace.partial can tell a file silently went
  // missing from this sync.
  writeRegistry([{ repo_name: 'partial-repo', owner: 'acme', github_url: 'https://github.com/acme/partial-repo' }])
  const mock = installFetchMock({
    files: [
      { path: 'README.md', sha: 'good-sha', content: 'kept' },
      { path: 'docs/guide.md', sha: 'bad-sha', content: 'dropped', ok: false },
    ],
  })
  try {
    const res = await postReq('partial-repo', {})
    assert.equal(res.status, 200, 'GAP: a partial sync is not distinguishable from a full one by status code')
    const json = await res.json()
    assert.equal(json.synced, true)
    assert.equal(json.trace.partial, true)
    assert.equal(json.trace.created.length, 1, 'only the one blob that fetched successfully was written')
    assert.deepEqual(json.trace.errors, [], 'the dropped blob is not recorded in trace.errors at all')

    assert.ok(fs.existsSync(path.join(KB_ROOT, 'wiki/repos/partial-repo/repo-docs/README.md')))
    assert.ok(!fs.existsSync(path.join(KB_ROOT, 'wiki/repos/partial-repo/repo-docs/docs/guide.md')))
  } finally {
    mock.restore()
  }
})

test('POST with no request body at all falls back to {} (no token, same as an explicit empty body)', async () => {
  writeRegistry([{ repo_name: 'no-body-repo', owner: 'acme', github_url: 'https://github.com/acme/no-body-repo' }])
  delete process.env.GITHUB_PAT
  const mock = installFetchMock({ files: [{ path: 'README.md', sha: 's1', content: 'x' }] })
  try {
    const res = await postReq('no-body-repo', undefined)
    assert.equal(res.status, 200)
    const treeCall = mock.calls.find(c => c.url.includes('/git/trees/'))
    assert.equal(treeCall.headers['Authorization'], undefined)
  } finally {
    mock.restore()
  }
})
