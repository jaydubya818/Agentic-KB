// Characterization tests for web/src/app/api/repos/[repo]/search/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 26 of the enumerated 36.
//
// This route delegates to lib/repo-runtime/registry.mjs's getRepo() and
// lib/repo-runtime/paths.mjs's repoWikiRoot(), both already covered
// elsewhere (tests/repos/repo-runtime.test.mjs, getRepo at line ~74,
// repoWikiRoot at line 185), and to lib/agent-runtime/frontmatter.mjs's
// parseFrontmatter(), covered by tests/agents/frontmatter.test.mjs. What
// those files do NOT cover, and what this file pins: this route's own
// walkDir()/scoreMatch()/countOccurrences()/extractSnippet() helpers --
// all four are private to this route and get their first test coverage
// here -- plus the route's own HTTP-layer behavior: the query short-circuit
// before any getRepo()/fs call, the 404 on an unknown repo (only once a
// real query is supplied), the `section` filter across canonical/repo-docs/
// bus, the limit default/cap/non-numeric fallback, and the score-desc/
// path-asc sort.
//
// Three findings worth flagging, all pinned as observed behavior rather
// than bugs this route introduced:
//   1. An empty/whitespace `q` returns 200 `{ repo, results: [] }` *before*
//      getRepo() is ever called -- even for a repo name that does not
//      exist in the registry, the short-circuit never 404s it.
//   2. Malformed (unterminated) frontmatter never throws -- parseFrontmatter
//      itself is defensive and just returns `{ data: {} }` for it -- so the
//      file is still fully searched and simply falls back to a basename
//      title. The route's own try/catch around the per-file read only ever
//      fires for an actual fs-read failure (e.g. a dangling symlink), which
//      is the only way a file is truly skipped from the results.
//   3. scoreMatch()/extractSnippet() are called with the file's *raw* text,
//      not the body parseFrontmatter() returns: `const { data } =
//      parseFrontmatter(content)` only keeps `data`, and the original raw
//      `content` (frontmatter block included) is what actually gets
//      scored/snippeted. Concretely, a title match is never a clean +5:
//      the same word also appears verbatim in the raw `title: "..."` line,
//      so it is also counted as one content occurrence (+0.5), making
//      every title hit score 5.5, not 5. A query that happened to match
//      some other frontmatter field's raw text (not just title) would
//      likewise count toward the content score, and the snippet could in
//      principle be sliced out of the frontmatter block itself.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-search-kb-'))
process.env.KB_ROOT = KB_ROOT

function writeRegistry(repos) {
  const dir = path.join(KB_ROOT, 'config/repos')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'registry.json'), JSON.stringify({ version: '1.0', repos }, null, 2))
}

// relPath is relative to wiki/repos/<repo>/, e.g. 'canonical/foo.md'.
function writeDoc(repo, relPath, content) {
  const full = path.join(KB_ROOT, 'wiki/repos', repo, relPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
}

function frontmatterDoc(title, body) {
  return `---\ntitle: "${title}"\n---\n${body}\n`
}

let GET, NextRequest
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ GET } = await import('../src/app/api/repos/[repo]/search/route.ts'))

  writeRegistry([
    { repo_name: 'test-repo', github_url: 'https://github.com/x/test-repo', status: 'synced' },
    { repo_name: 'sparse-repo', github_url: 'https://github.com/x/sparse-repo', status: 'synced' },
  ])

  // --- section-filter fixture: the same query term in all three sections ---
  writeDoc('test-repo', 'canonical/crosscut-canon.md', frontmatterDoc('Crosscut Term', 'body text'))
  writeDoc('test-repo', 'repo-docs/crosscut-docs.md', frontmatterDoc('Crosscut Term', 'body text'))
  writeDoc('test-repo', 'bus/crosscut-bus.md', frontmatterDoc('Crosscut Term', 'body text'))

  // --- scoring fixture: title-only match vs. content-only match ---
  writeDoc('test-repo', 'canonical/title-match.md', frontmatterDoc('Widget Overview', 'nothing relevant here'))
  writeDoc('test-repo', 'canonical/content-match.md', frontmatterDoc('Other Page', 'widget widget widget'))

  // --- malformed frontmatter fixture: unterminated '---' block ---
  writeDoc('test-repo', 'canonical/malformed-fm.md', '---\ntitle: Broken\nthis body contains malformedfm and never closes the fence\n')

  // --- unreadable file fixture: a dangling symlink alongside a good file ---
  writeDoc('test-repo', 'canonical/good-despite-broken.md', frontmatterDoc('Brokenlinktest Survivor', 'ok'))
  fs.symlinkSync('/nonexistent-target-xyz-for-test', path.join(KB_ROOT, 'wiki/repos/test-repo/canonical/broken-link.md'))
  writeDoc('test-repo', 'canonical/decoy.txt', 'brokenlinktest should never be scanned, wrong extension')

  // --- sort tiebreak fixture: two files with the identical score ---
  writeDoc('test-repo', 'canonical/ztie.md', frontmatterDoc('Tiematch', 'x'))
  writeDoc('test-repo', 'canonical/atie.md', frontmatterDoc('Tiematch', 'x'))

  // --- regex-metacharacter fixture: literal substring matching ---
  writeDoc('test-repo', 'canonical/regexchars.md', frontmatterDoc('Regex Chars', 'uses c++ and c++ again, plus foo[bar] syntax'))

  // --- pagination fixtures ---
  for (let i = 0; i < 25; i++) {
    writeDoc('test-repo', `repo-docs/pagination/file-${String(i).padStart(2, '0')}.md`, frontmatterDoc('Pagequery25 Item', 'x'))
  }
  for (let i = 0; i < 110; i++) {
    writeDoc('test-repo', `repo-docs/paginationbig/file-${String(i).padStart(3, '0')}.md`, frontmatterDoc('Pagequerybig Item', 'x'))
  }

  // --- sparse-repo fixture: only canonical/ exists, no repo-docs/ or bus/ ---
  writeDoc('sparse-repo', 'canonical/only-file.md', frontmatterDoc('Sparse Match', 'contains sparsematch'))
})

after(() => {
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
})

function getReq(repo, query) {
  const url = new URL(`http://localhost/api/repos/${repo}/search`)
  for (const [k, v] of Object.entries(query || {})) url.searchParams.set(k, v)
  return GET(new NextRequest(url), { params: Promise.resolve({ repo }) })
}

test('missing q param short-circuits to {repo, results: []} without touching the filesystem, even for an unknown repo', async () => {
  const orig = { existsSync: fs.existsSync, readFileSync: fs.readFileSync, readdirSync: fs.readdirSync }
  fs.existsSync = () => { throw new Error('fs.existsSync should not be called') }
  fs.readFileSync = () => { throw new Error('fs.readFileSync should not be called') }
  fs.readdirSync = () => { throw new Error('fs.readdirSync should not be called') }
  try {
    const res = await getReq('no-such-repo-at-all', {})
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.deepEqual(json, { repo: 'no-such-repo-at-all', results: [] })
  } finally {
    Object.assign(fs, orig)
  }
})

test('whitespace-only q param also short-circuits without filesystem access', async () => {
  const orig = { existsSync: fs.existsSync, readFileSync: fs.readFileSync, readdirSync: fs.readdirSync }
  fs.existsSync = () => { throw new Error('fs.existsSync should not be called') }
  fs.readFileSync = () => { throw new Error('fs.readFileSync should not be called') }
  fs.readdirSync = () => { throw new Error('fs.readdirSync should not be called') }
  try {
    const res = await getReq('test-repo', { q: '   ' })
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.deepEqual(json, { repo: 'test-repo', results: [] })
  } finally {
    Object.assign(fs, orig)
  }
})

test('GET for an unknown repo with a real query returns 404', async () => {
  const res = await getReq('no-such-repo-at-all', { q: 'anything' })
  assert.equal(res.status, 404)
  const json = await res.json()
  assert.equal(json.error, 'Repo not found')
})

test('no section param scans canonical + repo-docs + bus and returns a match from each (path is relative to its own section dir, not prefixed with the section name)', async () => {
  const json = await (await getReq('test-repo', { q: 'crosscut' })).json()
  const paths = json.results.map((r) => r.path).sort()
  assert.deepEqual(paths, ['crosscut-bus.md', 'crosscut-canon.md', 'crosscut-docs.md'])
})

test('section=canonical filters to only the canonical match', async () => {
  const json = await (await getReq('test-repo', { q: 'crosscut', section: 'canonical' })).json()
  assert.deepEqual(json.results.map((r) => r.path), ['crosscut-canon.md'])
})

test('section=repo-docs filters to only the repo-docs match', async () => {
  const json = await (await getReq('test-repo', { q: 'crosscut', section: 'repo-docs' })).json()
  assert.deepEqual(json.results.map((r) => r.path), ['crosscut-docs.md'])
})

test('section=bus filters to only the bus match', async () => {
  const json = await (await getReq('test-repo', { q: 'crosscut', section: 'bus' })).json()
  assert.deepEqual(json.results.map((r) => r.path), ['crosscut-bus.md'])
})

test('an unrecognized section value yields an empty result set, not an error', async () => {
  const res = await getReq('test-repo', { q: 'crosscut', section: 'nonsense' })
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.deepEqual(json.results, [])
})

test('a title match scores 5.5, not a clean 5: the +5 title bonus plus +0.5 because the same word is also counted as one content occurrence in the raw frontmatter line', async () => {
  const json = await (await getReq('test-repo', { q: 'widget', section: 'canonical' })).json()
  const titleHit = json.results.find((r) => r.path === 'title-match.md')
  assert.ok(titleHit)
  assert.equal(titleHit.score, 5.5, 'scoreMatch runs over the raw file text, not the parsed body, so title: "Widget Overview" itself contributes one content occurrence on top of the title bonus')
})

test('a content-only match scores 0.5 per occurrence and the snippet wraps the match in "..." on both sides', async () => {
  const json = await (await getReq('test-repo', { q: 'widget', section: 'canonical' })).json()
  const contentHit = json.results.find((r) => r.path === 'content-match.md')
  assert.ok(contentHit)
  assert.equal(contentHit.score, 1.5, '3 occurrences * 0.5 each, no title match')
  assert.ok(contentHit.snippet.startsWith('...') && contentHit.snippet.endsWith('...'))
})

test('a title match (score 5) outranks a content-only match (score 1.5) in the same result set', async () => {
  const json = await (await getReq('test-repo', { q: 'widget', section: 'canonical' })).json()
  const paths = json.results.filter((r) => r.path === 'title-match.md' || r.path === 'content-match.md').map((r) => r.path)
  assert.deepEqual(paths, ['title-match.md', 'content-match.md'])
})

test('matching is case-insensitive for both title and content', async () => {
  const json = await (await getReq('test-repo', { q: 'WIDGET', section: 'canonical' })).json()
  const titleHit = json.results.find((r) => r.path === 'title-match.md')
  const contentHit = json.results.find((r) => r.path === 'content-match.md')
  assert.equal(titleHit.score, 5.5)
  assert.equal(contentHit.score, 1.5)
})

test('malformed (unterminated) frontmatter never throws; the file is still searched and falls back to a basename title', async () => {
  const json = await (await getReq('test-repo', { q: 'malformedfm', section: 'canonical' })).json()
  assert.equal(json.results.length, 1)
  assert.equal(json.results[0].path, 'malformed-fm.md')
  assert.equal(json.results[0].title, 'malformed-fm.md', 'title falls back to path.basename(relFile), extension included')
})

test('an unreadable file (a dangling symlink) is skipped without failing the rest of the request, and a non-.md decoy is never scanned', async () => {
  const res = await getReq('test-repo', { q: 'brokenlinktest', section: 'canonical' })
  assert.equal(res.status, 200)
  const json = await res.json()
  const paths = json.results.map((r) => r.path)
  assert.deepEqual(paths, ['good-despite-broken.md'])
  assert.ok(!paths.includes('broken-link.md'))
  assert.ok(!paths.includes('decoy.txt'))
})

test('results are sorted by score descending, then by path ascending as a tiebreak', async () => {
  const json = await (await getReq('test-repo', { q: 'tiematch', section: 'canonical' })).json()
  assert.deepEqual(json.results.map((r) => r.path), ['atie.md', 'ztie.md'])
  assert.equal(json.results[0].score, json.results[1].score)
})

test('regex-metacharacter queries ("c++", "foo[") are matched as literal substrings, not compiled as regular expressions', async () => {
  const resPlus = await getReq('test-repo', { q: 'c++', section: 'canonical' })
  assert.equal(resPlus.status, 200)
  const jsonPlus = await resPlus.json()
  const plusHit = jsonPlus.results.find((r) => r.path === 'regexchars.md')
  assert.ok(plusHit, 'a regex-unsafe query must not throw and must still find a literal match')
  assert.equal(plusHit.score, 1, '2 literal occurrences of "c++" * 0.5 each')

  const resBracket = await getReq('test-repo', { q: 'foo[', section: 'canonical' })
  assert.equal(resBracket.status, 200)
  const jsonBracket = await resBracket.json()
  const bracketHit = jsonBracket.results.find((r) => r.path === 'regexchars.md')
  assert.ok(bracketHit, 'an unterminated-class-shaped query like "foo[" must not throw either')
  assert.equal(bracketHit.score, 0.5)
})

test('default limit is 20 when no limit param is given', async () => {
  const json = await (await getReq('test-repo', { q: 'pagequery25', section: 'repo-docs' })).json()
  assert.equal(json.results.length, 20)
})

test('a non-numeric limit falls back to the default of 20', async () => {
  const json = await (await getReq('test-repo', { q: 'pagequery25', section: 'repo-docs', limit: 'abc' })).json()
  assert.equal(json.results.length, 20)
})

test('an explicit limit under the cap is honored', async () => {
  const json = await (await getReq('test-repo', { q: 'pagequery25', section: 'repo-docs', limit: '5' })).json()
  assert.equal(json.results.length, 5)
  assert.deepEqual(json.results.map((r) => r.path), [
    'pagination/file-00.md', 'pagination/file-01.md', 'pagination/file-02.md', 'pagination/file-03.md', 'pagination/file-04.md',
  ])
})

test('limit is capped at 100 even when a much larger value is requested against 110 matching files', async () => {
  const json = await (await getReq('test-repo', { q: 'pagequerybig', section: 'repo-docs', limit: '500' })).json()
  assert.equal(json.results.length, 100)
})

test('a section that does not exist on disk for this repo (bus/ absent) does not error; matches from existing sections still come back', async () => {
  const res = await getReq('sparse-repo', { q: 'sparsematch' })
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.deepEqual(json.results.map((r) => r.path), ['only-file.md'])
})

test('requesting a specific section that is absent on disk (sparse-repo has no bus/) returns an empty array, not an error', async () => {
  const res = await getReq('sparse-repo', { q: 'sparsematch', section: 'bus' })
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.deepEqual(json.results, [])
})
