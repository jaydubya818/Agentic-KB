// Characterization tests for web/src/app/api/ingest/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 22 of the enumerated 36.
//
// This route delegates its two real effects to lib functions: file creation
// to web/src/lib/articles.ts's writeRawMaterial(), and logging to
// web/src/lib/audit.ts's appendAuditLog() (itself a try/catch wrapper around
// lib/agent-runtime/audit.mjs's appendAudit(), which already has direct unit
// coverage via tests/agents/audit-chain.test.mjs). writeRawMaterial() itself
// has zero existing test coverage anywhere in the repo (confirmed by grep
// across tests/ and web/tests/ before writing this file) -- same situation
// as agents/[id]/trace (11th of this series): this file is the first
// coverage of that lib function, reached only through the route.
//
// Candidates skipped this run (re-checked fresh, not assumed): agents/promote
// (two write actions behind one undifferentiated action field, skipped for
// the eighth night running), process/run-all (live fetch()-driven file
// processing), agents/[id]/diff (self-contained git-show/yaml-diff, no
// tested-lib delegation), process/pending (self-contained log-parsing walk).
// Also newly checked and passed over as NOT thin wrappers: search/route.ts
// (keyword+graph merge logic in-route), vault-watch and vault-structure
// (self-contained fs.watch / sidebar-building logic), query/save (self-
// contained slug/frontmatter/retry-write logic), repos/[repo]/search
// (self-contained scoring/snippet logic), and compile/lint/process/query
// (each calls the Anthropic API directly and does substantial in-route
// pipeline work). ingest/webhook was also passed over: its size (291 lines)
// comes from several self-contained source adapters (GitHub/Slack/Notion/
// Jira), not delegation. ingest/route.ts, at 98 lines, is the smallest
// remaining genuine thin-wrapper candidate.
//
// GAP pinned, not fixed (in writeRawMaterial(), web/src/lib/articles.ts):
// its frontmatter-builder array ends in `'---', ''` -- the trailing '' is
// meant to leave a blank line between the closing fence and the body -- but
// the whole array is piped through `.filter(Boolean)` before being joined,
// which drops that '' as falsy right along with the real `null` entries.
// The result: every file this route writes has its closing `---` glued
// directly onto the first line of the body with no newline at all (e.g.
// `---Some content here.`, not `---\n\nSome content here.`), which likely
// breaks a later gray-matter-based re-parse of that exact file, since the
// closing delimiter is not alone on its own line.
//
// Also worth flagging, in the route itself (not a bug, just non-obvious):
// the 500KB size cap checks the RAW body.content.length, not the trimmed
// length that actually gets written to disk -- a content value that is
// almost entirely whitespace padding around a tiny payload is rejected as
// "too large" even though the stored file would be nowhere near the cap.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'ingest-route-test-'))
process.env.KB_ROOT = KB_ROOT

let POST, NextRequest
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ POST } = await import('../src/app/api/ingest/route.ts'))
})
after(() => fs.rmSync(KB_ROOT, { recursive: true, force: true }))

function postReq(body) {
  const init = { method: 'POST' }
  if (typeof body === 'string') {
    init.body = body
  } else if (body !== undefined) {
    init.headers = { 'content-type': 'application/json' }
    init.body = JSON.stringify(body)
  }
  return new NextRequest('http://localhost/api/ingest', init)
}

function auditLines() {
  const logPath = path.join(KB_ROOT, 'logs', 'audit.log')
  if (!fs.existsSync(logPath)) return []
  return fs.readFileSync(logPath, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
}

test('malformed JSON body is rejected 400 PARSE_ERROR', async () => {
  const res = await POST(postReq('{not valid json'))
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.code, 'PARSE_ERROR')
})

test('missing title is rejected 400 VALIDATION_ERROR', async () => {
  const res = await POST(postReq({ type: 'note', content: 'hello' }))
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.code, 'VALIDATION_ERROR')
  assert.equal(json.error, 'Title is required')
})

test('a whitespace-only title is treated the same as a missing one', async () => {
  const res = await POST(postReq({ title: '   ', type: 'note', content: 'hello' }))
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.error, 'Title is required')
})

test('missing type is rejected 400 VALIDATION_ERROR, listing every valid type', async () => {
  const res = await POST(postReq({ title: 'Hello', content: 'hello' }))
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.code, 'VALIDATION_ERROR')
  assert.deepEqual(json.details.validTypes, [
    'transcript', 'article', 'paper', 'note', 'video-notes',
    'framework-doc', 'conversation', 'code-example',
  ])
  assert.ok(json.error.includes('transcript'))
})

test('an unrecognized type string is rejected the same as a missing one', async () => {
  const res = await POST(postReq({ title: 'Hello', type: 'blog-post', content: 'hello' }))
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.code, 'VALIDATION_ERROR')
})

test('missing content is rejected 400 VALIDATION_ERROR', async () => {
  const res = await POST(postReq({ title: 'Hello', type: 'note' }))
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.error, 'Content is required')
})

test('whitespace-only content is rejected the same as missing content', async () => {
  const res = await POST(postReq({ title: 'Hello', type: 'note', content: '   \n  ' }))
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.error, 'Content is required')
})

test('content over the 500KB cap is rejected 413 CONTENT_TOO_LARGE', async () => {
  const res = await POST(postReq({ title: 'Big', type: 'note', content: 'x'.repeat(500_001) }))
  assert.equal(res.status, 413)
  const json = await res.json()
  assert.equal(json.code, 'CONTENT_TOO_LARGE')
})

test('characterization: the 500KB cap checks raw length, not the trimmed length that gets stored', async () => {
  // Trimmed down to 2 bytes, but the raw body is well over the cap.
  const content = ' '.repeat(500_001) + 'hi'
  const res = await POST(postReq({ title: 'Padded', type: 'note', content }))
  assert.equal(res.status, 413)
})

test('a valid POST writes a raw material file and returns its relative path', async () => {
  const res = await POST(postReq({ title: 'Hello World', type: 'note', content: 'Some content here.' }))
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.success, true)
  assert.match(json.path, /^raw\/note\/hello-world\.md$/)
  assert.ok(json.message.includes(json.path))
  assert.deepEqual(json.nextSteps, [
    'Open a new Claude Code session in the KB directory',
    `Run: "Ingest ${json.path}"`,
    'Claude will create a wiki/summaries/ page and update index.md',
  ])

  const onDisk = fs.readFileSync(path.join(KB_ROOT, json.path), 'utf8')
  assert.match(onDisk, /^---\ntitle: "Hello World"\ntype: note\ndate_ingested: \d{4}-\d{2}-\d{2}\n/)
  assert.ok(!onDisk.includes('source_url:'))
  // GAP, not fixed: the frontmatter array's trailing '' (meant to leave a
  // blank line after the closing `---` before the body) is itself falsy, so
  // `.filter(Boolean)` strips it along with the real nulls -- the closing
  // fence ends up glued directly to the content with no newline at all
  // ("---Some content here.", not "---\n\nSome content here."). This likely
  // breaks any later gray-matter-based re-parse of this exact raw file,
  // since its closing delimiter is not on a line by itself.
  assert.match(onDisk, /status: raw\n---Some content here\.$/)
})

test('a supplied sourceUrl is written into frontmatter as source_url', async () => {
  const res = await POST(postReq({
    title: 'With Source', type: 'article', content: 'Body text.',
    sourceUrl: 'https://example.com/post',
  }))
  assert.equal(res.status, 200)
  const json = await res.json()
  const onDisk = fs.readFileSync(path.join(KB_ROOT, json.path), 'utf8')
  assert.ok(onDisk.includes('source_url: "https://example.com/post"\n'))
})

test('quotes and embedded newlines in the title are sanitized before being written as a frontmatter scalar', async () => {
  const res = await POST(postReq({
    title: 'My "Title"\nwith   a line break',
    type: 'note',
    content: 'Body.',
  }))
  assert.equal(res.status, 200)
  const json = await res.json()
  const onDisk = fs.readFileSync(path.join(KB_ROOT, json.path), 'utf8')
  // Embedded quote becomes a single quote; runs of whitespace collapse to one space.
  assert.ok(onDisk.includes("title: \"My 'Title' with a line break\"\n"))
})

test('two ingests whose titles slugify identically get distinct files via a numeric suffix', async () => {
  const first = await (await POST(postReq({ title: 'Dup Title', type: 'note', content: 'one' }))).json()
  const second = await (await POST(postReq({ title: 'Dup Title', type: 'note', content: 'two' }))).json()
  assert.notEqual(first.path, second.path)
  assert.equal(first.path, 'raw/note/dup-title.md')
  assert.equal(second.path, 'raw/note/dup-title-2.md')
  assert.ok(fs.existsSync(path.join(KB_ROOT, first.path)))
  assert.ok(fs.existsSync(path.join(KB_ROOT, second.path)))
})

test('a successful ingest appends an audit log entry recording the op, file, title and type', async () => {
  const before_ = auditLines().length
  const res = await POST(postReq({ title: 'Audited Item', type: 'paper', content: 'Body.' }))
  const json = await res.json()
  const lines = auditLines()
  assert.equal(lines.length, before_ + 1)
  const entry = lines[lines.length - 1]
  assert.equal(entry.op, 'ingest')
  assert.equal(entry.file, json.path)
  assert.equal(entry.title, 'Audited Item')
  assert.equal(entry.type, 'paper')
})

test('a write failure (the type directory itself is a plain file, not a directory) maps to 500 WRITE_ERROR', async () => {
  // writeRawMaterial's collision loop only retries fs.writeFileSync errors
  // coded EEXIST. Pre-creating the *type directory* itself as a plain file
  // (type 'code-example', unused by any earlier test in this file) makes
  // fs.existsSync(typeDir) true -- skipping mkdirSync -- but the nested
  // writeFileSync into it then throws ENOTDIR, which is not retried and
  // propagates straight to the route's catch-all.
  fs.writeFileSync(path.join(KB_ROOT, 'raw', 'code-example'), 'not a directory')
  const res = await POST(postReq({ title: 'Blocked', type: 'code-example', content: 'Body.' }))
  assert.equal(res.status, 500)
  const json = await res.json()
  assert.equal(json.code, 'WRITE_ERROR')
  assert.ok(json.error.startsWith('Failed to save material:'))
})
