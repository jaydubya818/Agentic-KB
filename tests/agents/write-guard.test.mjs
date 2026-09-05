// Characterization tests for lib/agent-runtime/paths.mjs -- the glob matcher
// behind three separate guards:
//   - assertWriteAllowed        (allowed_writes / forbidden_paths)
//   - vault-writeback.mjs:30    (vault_writes)
//   - context-loader.mjs        (context include rules, both runtimes)
//
// The file has zero prior nightly commits and had no dedicated test. "A guard
// exists" is not "the guard covers its input space", so these tests pin the
// whole decision surface INCLUDING the places where it currently fails open.
// Every assertion here records CURRENT behaviour; nothing is patched.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  globToRegex,
  matchAny,
  expandVars,
  assertWriteAllowed,
  assertReadAllowed,
} from '../../lib/agent-runtime/paths.mjs'

// ─── globToRegex: the translation itself ──────────────────────────────────

test('a single * matches within one path segment and does not cross /', () => {
  const re = globToRegex('wiki/*.md')
  assert.equal(re.test('wiki/page.md'), true)
  assert.equal(re.test('wiki/.md'), true)
  assert.equal(re.test('wiki/sub/page.md'), false, '* must not cross a separator')
})

test('? matches exactly one non-separator character', () => {
  const re = globToRegex('a?.md')
  assert.equal(re.test('ab.md'), true)
  assert.equal(re.test('a.md'), false)
  assert.equal(re.test('abc.md'), false)
  assert.equal(re.test('a/.md'), false)
})

test('regex metacharacters in a pattern are matched literally', () => {
  // '.' must not be "any char", or wiki/page.md would match wikiXpageYmd.
  assert.equal(globToRegex('a.md').test('aXmd'), false)
  assert.equal(globToRegex('a.md').test('a.md'), true)
  for (const meta of ['a+b', 'a(b)', 'a|b', 'a^b', 'a$b', 'a[b]', 'a{b}']) {
    assert.equal(globToRegex(meta).test(meta), true, `${meta} must match itself`)
  }
})

test('the pattern is fully anchored at both ends', () => {
  const re = globToRegex('wiki/page.md')
  assert.equal(re.test('wiki/page.md'), true)
  assert.equal(re.test('x/wiki/page.md'), false)
  assert.equal(re.test('wiki/page.md.bak'), false)
})

// ─── GAP 1: ** is not separator-aware ─────────────────────────────────────

test('GAP: ** translates to a bare .* so it matches inside a path segment', () => {
  // `wiki/**/decisions.md` becomes /^wiki\/.*decisions\.md$/ -- the `.*` is not
  // anchored to a separator boundary, so it also matches a FILE whose name
  // merely ends in the pattern's tail. For allowed_writes and vault_writes
  // this widens permission (fails OPEN); for forbidden_paths it over-denies
  // (fails closed, i.e. the safe direction). Distinct from the documented
  // variable-widening gap: this needs no variables at all.
  assert.equal(globToRegex('wiki/**/decisions.md').source, '^wiki\\/.*decisions\\.md$')

  const contract = { allowed_writes: ['wiki/**/decisions.md'] }
  // Intended matches.
  assert.equal(assertWriteAllowed('wiki/proj/decisions.md', contract).allowed, true)
  // Unintended: no separator after `wiki/`, so this is a sibling file, not a
  // file under a project directory.
  assert.equal(assertWriteAllowed('wiki/EVILdecisions.md', contract).allowed, true)
  assert.equal(assertWriteAllowed('wiki/a/b/XXdecisions.md', contract).allowed, true)
  // The prefix before `**` is still honoured.
  assert.equal(assertWriteAllowed('wikiX/decisions.md', contract).allowed, false)
})

test('a trailing ** matches everything below the prefix, including the bare prefix', () => {
  const re = globToRegex('wiki/**')
  assert.equal(re.test('wiki/'), true)
  assert.equal(re.test('wiki/a/b/c.md'), true)
  assert.equal(re.test('wiki'), false)
  assert.equal(re.test('other/a.md'), false)
})

// ─── assertWriteAllowed: precedence and fail-closed defaults ──────────────

test('an unsafe path is rejected before any rule is consulted', () => {
  const permissive = { allowed_writes: ['**'], forbidden_paths: [] }
  const result = assertWriteAllowed('../../etc/passwd', permissive)
  assert.equal(result.allowed, false)
  assert.match(result.reason, /^unsafe path: /)
  assert.equal(result.rule, null)
})

test('forbidden_paths beats allowed_writes', () => {
  const contract = { allowed_writes: ['wiki/**'], forbidden_paths: ['wiki/secret/**'] }
  assert.equal(assertWriteAllowed('wiki/open/a.md', contract).allowed, true)
  const denied = assertWriteAllowed('wiki/secret/a.md', contract)
  assert.equal(denied.allowed, false)
  assert.equal(denied.reason, 'forbidden_paths match')
})

test('a contract with no allowed_writes denies everything', () => {
  for (const contract of [{}, { allowed_writes: [] }, { allowed_writes: null }]) {
    const r = assertWriteAllowed('wiki/a.md', contract)
    assert.equal(r.allowed, false)
    assert.equal(r.reason, 'no allowed_writes configured')
  }
})

test('a path matching no rule is denied, and an allowed path reports the rule', () => {
  const contract = { allowed_writes: ['wiki/**', 'notes/*.md'] }
  assert.deepEqual(assertWriteAllowed('notes/a.md', contract), {
    allowed: true, reason: 'matched allowed_writes', rule: 'notes/*.md',
  })
  assert.equal(assertWriteAllowed('elsewhere/a.md', contract).allowed, false)
})

test('a null or undefined contract throws rather than allowing the write', () => {
  // Fails closed by crashing. Pinned so a future "defensive" default that
  // returns `{ allowed: true }` cannot slip in unnoticed.
  assert.throws(() => assertWriteAllowed('wiki/a.md', null), TypeError)
  assert.throws(() => assertWriteAllowed('wiki/a.md', undefined), TypeError)
})

// ─── assertReadAllowed checks path safety like its write twin ─────────────

test('assertReadAllowed rejects unsafe paths before any rule is consulted, like its write twin', () => {
  // Was filed as GAP 2 (backlog 2026-09-01): the read guard skipped
  // checkUnsafePath, so a traversal string the write guard rejected outright
  // was allowed for a read whenever an allowed_reads rule matched it. Both
  // guards now open with the same check. assertReadAllowed still has no
  // in-tree callers (reads are evaluated by context_policy in
  // context-loader.mjs), so this pins the exported contract, not a live path.
  const traversal = '../../etc/passwd'
  assert.equal(assertWriteAllowed(traversal, { allowed_writes: ['**'] }).allowed, false)
  const r = assertReadAllowed(traversal, { allowed_reads: ['**'] })
  assert.equal(r.allowed, false)
  assert.equal(r.reason, 'unsafe path: dot-segment traversal')
  // The safety check runs before forbidden_paths / allowed_reads, and with no
  // read restrictions configured at all -- the branch that otherwise allows.
  assert.equal(assertReadAllowed('/etc/passwd', {}).allowed, false)
  assert.equal(assertReadAllowed('/etc/passwd', {}).reason, 'unsafe path: absolute path (leading slash)')
  assert.equal(assertReadAllowed('wiki/a\0.md', { forbidden_paths: ['wiki/**'] }).reason, 'unsafe path: null byte in path')
  // A clean path is unaffected.
  assert.equal(assertReadAllowed('wiki/a.md', { allowed_reads: ['wiki/**'] }).allowed, true)
})

test('assertReadAllowed defaults to allow when no allowed_reads are configured', () => {
  assert.deepEqual(assertReadAllowed('anything.md', {}), {
    allowed: true, reason: 'no explicit read restrictions',
  })
  // forbidden_paths still applies and is checked first.
  const r = assertReadAllowed('wiki/secret/a.md', { forbidden_paths: ['wiki/secret/**'] })
  assert.equal(r.allowed, false)
  assert.equal(r.reason, 'forbidden_paths match')
})

// ─── expandVars, and the two gaps already filed in the backlog ────────────

test('expandVars substitutes known vars and leaves unknown ones literal', () => {
  assert.equal(expandVars('wiki/{{project}}/a.md', { project: 'p' }), 'wiki/p/a.md')
  assert.equal(expandVars('wiki/{{missing}}/a.md', {}), 'wiki/{{missing}}/a.md')
  // A function replacement is used, so $-sequences in the VALUE are inert --
  // this is not the `$&`-expansion bug that affects the frontmatter codec.
  assert.equal(expandVars('a/{{v}}/b', { v: '$&$`' }), 'a/$&$`/b')
})

test('GAP (backlog 2026-08-26): a variable value is read as glob syntax', () => {
  // expandVars substitutes into the pattern string, then globToRegex parses the
  // result -- so metacharacters inside the VALUE become glob operators and
  // widen the rule. Filed as a design item; pinned here, not patched.
  const contract = { allowed_writes: ['wiki/projects/{{project}}/decisions.md'] }
  const target = 'wiki/projects/SOMEONE-ELSES-PROJECT/decisions.md'
  assert.equal(assertWriteAllowed(target, contract, { project: 'my-project' }).allowed, false)
  assert.equal(assertWriteAllowed(target, contract, { project: '*' }).allowed, true)
})

test('GAP (backlog 2026-08-26): a deny rule with an unresolved variable denies nothing', () => {
  // For allowed_writes an unresolved var is fail-closed and fine; for
  // forbidden_paths it is fail-OPEN. The literal `{{name}}` survives into the
  // regex as escaped braces, which no real path contains.
  const contract = { allowed_writes: ['wiki/**'], forbidden_paths: ['wiki/{{secret}}/**'] }
  assert.equal(assertWriteAllowed('wiki/anything/a.md', contract, { secret: 'anything' }).allowed, false)
  assert.equal(assertWriteAllowed('wiki/anything/a.md', contract, {}).allowed, true)
})

// ─── matchAny ─────────────────────────────────────────────────────────────

test('matchAny returns false for a null or empty pattern list', () => {
  assert.equal(matchAny('a.md', null), false)
  assert.equal(matchAny('a.md', undefined), false)
  assert.equal(matchAny('a.md', []), false)
  assert.equal(matchAny('a.md', ['a.md']), true)
})
