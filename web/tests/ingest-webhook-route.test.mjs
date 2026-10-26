// Characterization tests for web/src/app/api/ingest/webhook/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly since): route handler 28 of the
// enumerated 36.
//
// This route's two shared effects -- RBAC resolution (resolveIdentity/
// canWrite, web/src/lib/rbac.ts) and constant-time comparison (pinMatches,
// web/src/lib/pin.ts) -- already have coverage elsewhere (tests/
// rbac.test.mjs; pinMatches via process-schedule-install-route.test.mjs).
// What neither covers, and what this file pins, is everything specific to
// this route itself: its own WEBHOOK_SECRET/HMAC auth fallback
// (legacySecretOk), its four source adapters (generic/GitHub-issue/
// GitHub-PR/Slack), its frontmatter-writing/EEXIST-retry logic
// (writeRawDoc), and its request-size guards. None of it had any test
// coverage anywhere in the repo before this file (confirmed by grep across
// tests/ and web/tests/ for every function name above).
//
// Standing skips re-checked fresh before picking this route: agents/promote
// (two write actions behind one undifferentiated action field), process/
// run-all (live fetch()-driven file processing), search (PIN-gated
// private/all scope plus graph-search merge complexity), vault-watch (SSE/
// ReadableStream/fs.watch/setInterval, no simple request/response seam) --
// all four still stand, unchanged. compile/lint/process/query were also
// re-checked and passed over again: each calls the Anthropic API directly
// and does substantial in-route pipeline work, the same reason
// ingest-route.test.mjs (22nd of this series) gave for skipping them.
// ingest/webhook itself was passed over by that same run on SIZE grounds
// alone ("its size (291 lines) comes from several self-contained source
// adapters, not delegation" -- true, but not disqualifying). With no
// smaller thin-wrapper candidate left among the remaining 9, it is the
// obvious next pick: a pure, synchronous request/response handler with no
// streaming, no LLM calls, and no fetch() of its own.
//
// Module-level WEBHOOK_SECRET constant is captured at import time (same
// shape as PRIVATE_PIN in article-route.test.mjs/switch-vault-route...),
// so the two auth postures need separate cache-busted dynamic imports.
//
// GAP pinned, not fixed (previously undocumented): the route's own doc
// comment at the top of route.ts advertises "Automatically ingests: issues
// (closed), PRs (merged), push commits to docs/" for its GitHub adapter,
// but detectAndAdapt() only ever branches on `x-github-event: issues` and
// `x-github-event: pull_request` -- there is no adaptGitHubPush function
// and no branch for githubEvent === 'push' anywhere in the file. A real
// GitHub push delivery (x-github-event: push, a payload shaped like
// {ref, commits, repository, pusher}, with no title/content/token/
// channel_id fields) falls through every adapter and always comes back
// `{ok:true, skipped:true, reason:'unsupported event type'}` -- silently
// dropping exactly the event type the module's own usage comment claims is
// supported. Whether to build the missing adapter is a product decision
// (one doc per commit? per push? filtered by changed path under docs/?),
// not a bug this route introduced on its own, so it is pinned rather than
// fixed.
//
// Second, smaller GAP, same bug class as the already-closed 2026-08-31
// "`resolveIdentity` rejected a conformant lowercase `bearer` auth-scheme"
// entry elsewhere in this file -- regressed here in a sibling check, not
// the one that was fixed: `legacySecretOk`'s own Authorization-header
// check is `auth.startsWith('Bearer ')`, case-sensitive, while
// `resolveIdentity`'s Bearer-token lookup (rbac.ts) matches via
// `/^Bearer\s+(.+)$/i`, case-insensitively, per RFC 7235 (auth-scheme names
// are case-insensitive). A caller presenting the exact correct
// WEBHOOK_SECRET value under a conformant lowercase `bearer <secret>`
// scheme is rejected 401 by this route whenever no namespace token is
// configured to fall back on.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, describe, before, beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'ingest-webhook-kb-'))
process.env.KB_ROOT = KB_ROOT

after(() => fs.rmSync(KB_ROOT, { recursive: true, force: true }))

function webhooksDir(ns = '') {
  return path.join(KB_ROOT, 'raw', 'webhooks', ns)
}

function listWebhookFiles(ns = '') {
  const dir = webhooksDir(ns)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort()
}

function clearWebhooks() {
  fs.rmSync(path.join(KB_ROOT, 'raw', 'webhooks'), { recursive: true, force: true })
}

function clearAudit() {
  fs.rmSync(path.join(KB_ROOT, 'logs'), { recursive: true, force: true })
}

function auditLines() {
  const logPath = path.join(KB_ROOT, 'logs', 'audit.log')
  if (!fs.existsSync(logPath)) return []
  return fs.readFileSync(logPath, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
}

function writeNamespaces(cfg) {
  fs.writeFileSync(path.join(KB_ROOT, 'namespaces.json'), JSON.stringify(cfg))
}

function clearNamespaces() {
  fs.rmSync(path.join(KB_ROOT, 'namespaces.json'), { force: true })
}

function sign(secret, rawBody) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
}

const TODAY = new Date().toISOString().slice(0, 10)

describe('WEBHOOK_SECRET unset (back-compat default)', () => {
  let POST, NextRequest

  before(async () => {
    delete process.env.WEBHOOK_SECRET
    ;({ NextRequest } = await import('next/server'))
    ;({ POST } = await import('../src/app/api/ingest/webhook/route.ts?variant=nosecret'))
  })
  beforeEach(() => { clearWebhooks(); clearAudit(); clearNamespaces() })

  function postReq({ body, raw, headers = {} } = {}) {
    const init = { method: 'POST', headers: { 'content-type': 'application/json', ...headers } }
    init.body = raw !== undefined ? raw : JSON.stringify(body)
    return POST(new NextRequest('http://localhost/api/ingest/webhook', init))
  }

  test('a minimal generic payload is ingested with default frontmatter and audit-logged', async () => {
    const res = await postReq({ body: { title: 'My Title', content: 'Body text.' } })
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.ok, true)
    assert.match(json.file, new RegExp(`^raw/webhooks/${TODAY}-my-title\\.md$`))
    assert.equal(json.title, 'My Title')
    assert.equal(json.source, 'webhook')
    assert.equal(json.message, `Ingested into ${json.file}. Run /api/compile to compile into wiki.`)

    const files = listWebhookFiles()
    assert.deepEqual(files, [`${TODAY}-my-title.md`])
    const content = fs.readFileSync(path.join(webhooksDir(), files[0]), 'utf8')
    assert.match(content, /^---\ntitle: "My Title"\nsource: webhook\ningested: /)
    assert.doesNotMatch(content, /\nurl: /)
    assert.doesNotMatch(content, /\ntags: /)
    assert.match(content, /---\nBody text\.$/)

    const logged = auditLines()
    assert.equal(logged.length, 1)
    assert.equal(logged[0].op, 'webhook')
    assert.equal(logged[0].file, json.file)
    assert.equal(logged[0].namespace, 'default')
  })

  test('a payload none of the adapters can parse is a 200 unsupported-event-type no-op, not a 400', async () => {
    const res = await postReq({ body: { foo: 'bar' } })
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.deepEqual(json, { ok: true, skipped: true, reason: 'unsupported event type' })
    assert.deepEqual(listWebhookFiles(), [])
    assert.deepEqual(auditLines(), [])
  })

  test('malformed JSON body is rejected 400 Invalid JSON body', async () => {
    const res = await postReq({ raw: '{not valid json' })
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.equal(json.error, 'Invalid JSON body')
    assert.deepEqual(listWebhookFiles(), [])
  })

  test('a Content-Length header over the 5MB cap is rejected 413 before the body is ever read', async () => {
    const res = await postReq({
      body: { title: 'Small', content: 'tiny' },
      headers: { 'content-length': String(6 * 1024 * 1024) },
    })
    assert.equal(res.status, 413)
    const json = await res.json()
    assert.equal(json.error, 'Payload too large')
    assert.deepEqual(listWebhookFiles(), [])
  })

  test('an actual body over the 5MB cap is rejected 413 even when Content-Length understates it', async () => {
    const big = 'x'.repeat(6 * 1024 * 1024)
    const res = await postReq({
      body: { title: 'Big', content: big },
      headers: { 'content-length': '10' },
    })
    assert.equal(res.status, 413)
    const json = await res.json()
    assert.equal(json.error, 'Payload too large')
    assert.deepEqual(listWebhookFiles(), [])
  })

  test('two payloads that slugify identically on the same day do not collide', async () => {
    const res1 = await postReq({ body: { title: 'Same Title', content: 'A' } })
    const res2 = await postReq({ body: { title: 'Same Title', content: 'B' } })
    const json1 = await res1.json()
    const json2 = await res2.json()
    assert.equal(json1.file, `raw/webhooks/${TODAY}-same-title.md`)
    assert.equal(json2.file, `raw/webhooks/${TODAY}-same-title-2.md`)
    assert.deepEqual(listWebhookFiles(), [`${TODAY}-same-title-2.md`, `${TODAY}-same-title.md`].sort())
  })

  test('a closed GitHub issue is ingested with an "Issue: " title prefix and labels folded into tags', async () => {
    const res = await postReq({
      headers: { 'x-github-event': 'issues' },
      body: {
        action: 'closed',
        issue: {
          title: 'Bug in parser',
          body: 'Steps to reproduce...',
          html_url: 'https://github.com/jay/repo/issues/9',
          labels: [{ name: 'bug' }, { name: 'p1' }],
          user: { login: 'jaywest' },
        },
      },
    })
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.title, 'Issue: Bug in parser')
    assert.equal(json.source, 'github-issue')
    const content = fs.readFileSync(path.join(KB_ROOT, json.file), 'utf8')
    assert.match(content, /tags: \["github", "issue", "bug", "p1"\]/)
    assert.match(content, /\*\*Closed by:\*\* jaywest {2}\n\*\*URL:\*\* https:\/\/github\.com\/jay\/repo\/issues\/9/)
  })

  test('a GitHub issue that is not closed is a 200 unsupported-event-type no-op', async () => {
    const res = await postReq({
      headers: { 'x-github-event': 'issues' },
      body: { action: 'opened', issue: { title: 'New issue', body: 'x', user: { login: 'a' } } },
    })
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.skipped, true)
    assert.deepEqual(listWebhookFiles(), [])
  })

  test('a merged GitHub pull request is ingested with a "PR: " title prefix', async () => {
    const res = await postReq({
      headers: { 'x-github-event': 'pull_request' },
      body: {
        action: 'closed',
        pull_request: {
          title: 'Fix the bug', body: 'Closes #9', merged: true,
          html_url: 'https://github.com/jay/repo/pull/10',
          user: { login: 'jaywest' }, base: { ref: 'main' },
        },
      },
    })
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.title, 'PR: Fix the bug')
    assert.equal(json.source, 'github-pr')
  })

  test('a GitHub pull request that is closed but not merged is a 200 unsupported-event-type no-op', async () => {
    const res = await postReq({
      headers: { 'x-github-event': 'pull_request' },
      body: { action: 'closed', pull_request: { title: 'Abandoned', merged: false } },
    })
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.skipped, true)
    assert.deepEqual(listWebhookFiles(), [])
  })

  test('GAP: a GitHub push event is always a 200 unsupported-event-type no-op, despite the route\'s own doc comment promising "push commits to docs/" support', async () => {
    const res = await postReq({
      headers: { 'x-github-event': 'push' },
      body: {
        ref: 'refs/heads/main',
        commits: [{ message: 'docs: update readme', added: ['docs/foo.md'] }],
        repository: { full_name: 'jay/repo' },
        pusher: { name: 'jaywest' },
      },
    })
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.deepEqual(json, { ok: true, skipped: true, reason: 'unsupported event type' })
    assert.deepEqual(listWebhookFiles(), [])
  })

  test('a Slack slash-command payload is ingested with a "Slack: #channel" title', async () => {
    const res = await postReq({
      body: { token: 'xoxb-fake', text: 'Deploy went out', user_name: 'jay', channel_name: 'eng' },
    })
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.match(json.title, new RegExp(`^Slack: #eng — ${TODAY}$`))
    assert.equal(json.source, 'slack')
  })

  test('an embedded newline in title/url/tags cannot inject extra frontmatter lines or keys', async () => {
    const res = await postReq({
      body: {
        title: 'Evil\ninjected_key: pwned',
        content: 'Body.',
        url: 'https://example.com\nx: y',
        tags: ['ok-tag\nmore: evil'],
      },
    })
    assert.equal(res.status, 200)
    const json = await res.json()
    const content = fs.readFileSync(path.join(KB_ROOT, json.file), 'utf8')
    const fmBlock = content.match(/^---\n([\s\S]*?)\n---\n/)[1]
    const fmLines = fmBlock.split('\n')
    // The injected text survives (harmlessly) inside the sanitized, quoted
    // title value on a single line -- what matters is that it never starts
    // a frontmatter line of its own, i.e. it was never parsed as a key.
    assert.ok(!fmLines.some(l => l.startsWith('injected_key:')))
    assert.ok(!fmLines.some(l => l.startsWith('x:')))
    assert.ok(!fmLines.some(l => l.startsWith('more:')))
  })

  test('url and tags lines are present only when non-empty, tags render as a JSON-escaped flow sequence', async () => {
    const withBoth = await (await postReq({
      body: { title: 'Has Both', content: 'x', url: 'https://x.test', tags: ['a', 'b'] },
    })).json()
    const content = fs.readFileSync(path.join(KB_ROOT, withBoth.file), 'utf8')
    assert.match(content, /\nurl: https:\/\/x\.test\n/)
    assert.match(content, /\ntags: \["a", "b"\]\n/)
  })
})

describe('WEBHOOK_SECRET set', () => {
  const SECRET = 'wh-secret-value'
  let POST, NextRequest

  before(async () => {
    process.env.WEBHOOK_SECRET = SECRET
    ;({ NextRequest } = await import('next/server'))
    ;({ POST } = await import('../src/app/api/ingest/webhook/route.ts?variant=secretset'))
  })
  after(() => { delete process.env.WEBHOOK_SECRET })
  beforeEach(() => { clearWebhooks(); clearAudit(); clearNamespaces() })

  function postReq({ body, raw, headers = {} } = {}) {
    const payload = raw !== undefined ? raw : JSON.stringify(body)
    const init = { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: payload }
    return POST(new NextRequest('http://localhost/api/ingest/webhook', init))
  }

  test('no Authorization header and no GitHub signature header: 401 Unauthorized', async () => {
    const res = await postReq({ body: { title: 'T', content: 'c' } })
    assert.equal(res.status, 401)
    const json = await res.json()
    assert.equal(json.error, 'Unauthorized')
    assert.deepEqual(listWebhookFiles(), [])
  })

  test('a wrong Bearer token: 401 Unauthorized', async () => {
    const res = await postReq({
      body: { title: 'T', content: 'c' },
      headers: { authorization: 'Bearer not-the-secret' },
    })
    assert.equal(res.status, 401)
  })

  test('the correct Bearer token is accepted and written to disk', async () => {
    const res = await postReq({
      body: { title: 'T', content: 'c' },
      headers: { authorization: `Bearer ${SECRET}` },
    })
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.ok, true)
    assert.deepEqual(listWebhookFiles(), [`${TODAY}-t.md`])
  })

  test('GAP: a conformant lowercase "bearer" scheme is rejected 401 even with the exact correct secret', async () => {
    const res = await postReq({
      body: { title: 'T', content: 'c' },
      headers: { authorization: `bearer ${SECRET}` },
    })
    assert.equal(res.status, 401)
    const json = await res.json()
    assert.equal(json.error, 'Unauthorized')
    assert.deepEqual(listWebhookFiles(), [])
  })

  test('a correctly HMAC-signed x-hub-signature-256 payload is accepted with no Authorization header', async () => {
    const raw = JSON.stringify({
      action: 'closed',
      issue: { title: 'Signed issue', body: 'x', user: { login: 'a' } },
    })
    const res = await postReq({
      raw,
      headers: { 'x-github-event': 'issues', 'x-hub-signature-256': sign(SECRET, raw) },
    })
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.title, 'Issue: Signed issue')
  })

  test('an incorrectly signed x-hub-signature-256 is rejected 401', async () => {
    const raw = JSON.stringify({ action: 'closed', issue: { title: 'X', user: {} } })
    const res = await postReq({
      raw,
      headers: { 'x-github-event': 'issues', 'x-hub-signature-256': sign('wrong-secret', raw) },
    })
    assert.equal(res.status, 401)
    assert.deepEqual(listWebhookFiles(), [])
  })

  test('a valid namespace Bearer token bypasses WEBHOOK_SECRET entirely and writes into its own namespace dir', async () => {
    writeNamespaces({
      tokens: { 'tok-eng': 'eng' },
      namespaces: {
        default: { read: ['*'], write: ['*'] },
        eng: { read: ['*'], write: ['eng'] },
      },
    })
    const res = await postReq({
      body: { title: 'Eng Doc', content: 'c' },
      headers: { authorization: 'Bearer tok-eng' },
    })
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.file, `raw/webhooks/eng/${TODAY}-eng-doc.md`)
    assert.deepEqual(listWebhookFiles('eng'), [`${TODAY}-eng-doc.md`])
    assert.equal(auditLines()[0].namespace, 'eng')
    assert.equal(auditLines()[0].identitySource, 'token')
  })

  test('a namespace token that authenticates but whose ACL lacks write permission to its own namespace is rejected 403', async () => {
    writeNamespaces({
      tokens: { 'tok-ro': 'readonly' },
      namespaces: {
        default: { read: ['*'], write: ['*'] },
        readonly: { read: ['*'], write: [] },
      },
    })
    const res = await postReq({
      body: { title: 'Nope', content: 'c' },
      headers: { authorization: 'Bearer tok-ro' },
    })
    assert.equal(res.status, 403)
    const json = await res.json()
    assert.equal(json.error, 'Namespace "readonly" has no write permission')
    assert.deepEqual(listWebhookFiles('readonly'), [])
    assert.deepEqual(auditLines(), [])
  })
})
