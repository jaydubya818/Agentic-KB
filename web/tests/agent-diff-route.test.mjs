// Characterization tests for web/src/app/api/agents/[id]/diff/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 23 of the enumerated 36.
//
// This route has no tested-lib delegation to lean on for its own logic --
// it reads a committed version of config/agents/<id>.yaml via `git show`
// and the working-tree version via fs.readFileSync, then diffs a fixed set
// of fields. The one helper it does import, isSafeRef (lib/safe-ref.mjs),
// already has its own coverage (tests/agents/safe-ref.test.mjs) and is not
// re-tested here. What this file pins is the route's own HTTP-layer
// behavior: id/ref validation, the two distinct 404s (no committed version
// vs unreadable working tree), the default ref value, and the field-level
// and context_policy diff computation.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-diff-kb-'))
process.env.KB_ROOT = KB_ROOT

const AGENT_FILE = 'config/agents/widget-bot.yaml'
const CONTENT_A = `tier: bronze
domain: kb
team: alpha
allowed_writes:
  - "a"
forbidden_paths:
  - "b"
vault_writes: true
context_policy:
  budget_bytes: 1000
  include:
    - pattern: "*.md"
`
const CONTENT_B = `tier: gold
domain: kb
team: alpha
allowed_writes:
  - "a"
  - "c"
forbidden_paths:
  - "b"
vault_writes: false
context_policy:
  budget_bytes: 2000
  include:
    - pattern: "*.md"
    - pattern: "*.yaml"
`

function git(...args) {
  return execFileSync('git', args, { cwd: KB_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

let GET
before(async () => {
  fs.mkdirSync(path.join(KB_ROOT, 'config/agents'), { recursive: true })
  git('init', '-q')
  git('config', 'user.email', 'test@example.com')
  git('config', 'user.name', 'test')

  // Commit 1: unrelated file only -- leaves HEAD~2 (once a second commit
  // exists) with no version of the agent file at all.
  fs.writeFileSync(path.join(KB_ROOT, 'README.md'), 'placeholder\n')
  git('add', '.')
  git('commit', '-q', '-m', 'c1')

  // Commit 2: adds the agent file with content A. This becomes HEAD~1 once
  // a third, unrelated commit lands -- so HEAD~1 has the file, HEAD~2 does
  // not.
  fs.writeFileSync(path.join(KB_ROOT, AGENT_FILE), CONTENT_A)
  git('add', '.')
  git('commit', '-q', '-m', 'c2 add agent file')

  // Commit 3: unrelated change. HEAD now points here; HEAD~1 is commit 2
  // (content A); HEAD~2 is commit 1 (no agent file yet).
  fs.writeFileSync(path.join(KB_ROOT, 'README.md'), 'placeholder v2\n')
  git('add', '.')
  git('commit', '-q', '-m', 'c3')

  // Uncommitted working-tree edit: content B, never committed.
  fs.writeFileSync(path.join(KB_ROOT, AGENT_FILE), CONTENT_B)

  ;({ GET } = await import('../src/app/api/agents/[id]/diff/route.ts'))
})

after(() => {
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
})

function req(id, query) {
  const url = new URL(`http://localhost/api/agents/${id}/diff${query ? `?${query}` : ''}`)
  return GET(new Request(url), { params: Promise.resolve({ id }) })
}

test('rejects an agent id containing characters outside [a-z0-9-]', async () => {
  const res = await req('widget..bot', '')
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.error, 'invalid agent id')
})

test('rejects a ref containing shell metacharacters', async () => {
  const res = await req('widget-bot', 'ref=' + encodeURIComponent('HEAD; rm -rf /'))
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.error, 'invalid ref')
})

test('404s when the ref has no committed version of the file', async () => {
  const res = await req('widget-bot', 'ref=HEAD~2')
  assert.equal(res.status, 404)
  const json = await res.json()
  assert.match(json.error, /no version of .*widget-bot\.yaml.* at HEAD~2/)
})

test('404s when the working-tree file is unreadable', async () => {
  const full = path.join(KB_ROOT, AGENT_FILE)
  const saved = fs.readFileSync(full)
  fs.rmSync(full)
  try {
    const res = await req('widget-bot', 'ref=HEAD')
    assert.equal(res.status, 404)
    const json = await res.json()
    assert.match(json.error, /working-tree .*widget-bot\.yaml.* not readable/)
  } finally {
    fs.writeFileSync(full, saved)
  }
})

test('defaults ref to HEAD~1 when none is supplied, and diffs committed vs working tree', async () => {
  const res = await req('widget-bot', '')
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.agent_id, 'widget-bot')
  assert.equal(json.ref, 'HEAD~1')
  assert.equal(json.file, AGENT_FILE)
  assert.equal(json.raw_before, CONTENT_A)
  assert.equal(json.raw_after, CONTENT_B)

  // Changed fields only.
  assert.deepEqual(json.field_diffs.tier, { before: 'bronze', after: 'gold' })
  assert.deepEqual(json.field_diffs.allowed_writes, { before: ['a'], after: ['a', 'c'] })
  assert.deepEqual(json.field_diffs.vault_writes, { before: true, after: false })

  // Unchanged fields must not appear at all.
  assert.equal('domain' in json.field_diffs, false)
  assert.equal('team' in json.field_diffs, false)
  assert.equal('forbidden_paths' in json.field_diffs, false)

  // context_policy diff.
  assert.deepEqual(json.policy_diff.budget_bytes, { before: 1000, after: 2000 })
  assert.deepEqual(json.policy_diff.include_rule_count, { before: 1, after: 2 })
})

test('accepts an explicit ref= query param', async () => {
  const res = await req('widget-bot', 'ref=HEAD~1')
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.ref, 'HEAD~1')
  assert.equal(json.raw_before, CONTENT_A)
})

// GAP: field_diffs compares JSON.stringify(before[f]) to JSON.stringify(after[f]),
// so a field whose value is a YAML array in a different but semantically
// equivalent order (e.g. re-ordered allowed_writes) is reported as changed
// even when the *set* of entries is identical, because JSON.stringify is
// order-sensitive on arrays. Pinned, not fixed -- deciding whether the diff
// should be order-sensitive is a product choice about what counts as a
// "changed" policy field, not a bug this route introduced on its own.
test('GAP: field_diffs is order-sensitive on array fields, not set-equality', async () => {
  const full = path.join(KB_ROOT, AGENT_FILE)
  const saved = fs.readFileSync(full, 'utf8')
  // Commit a version with the same two-entry set as a later "after" will
  // have, but in reverse order, to show the comparison is positional.
  fs.writeFileSync(full, 'allowed_writes:\n  - "z"\n  - "a"\n')
  try {
    git('add', '.')
    git('commit', '-q', '-m', 'c4 reorder for GAP test')
    fs.writeFileSync(full, 'allowed_writes:\n  - "a"\n  - "z"\n')
    const res = await req('widget-bot', 'ref=HEAD')
    const json = await res.json()
    assert.ok('allowed_writes' in json.field_diffs, 'same-set-different-order is reported as a diff')
  } finally {
    fs.writeFileSync(full, saved)
  }
})
