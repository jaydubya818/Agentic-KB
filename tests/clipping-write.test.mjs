/**
 * Tests for clipping-write helper. Pure helpers tested directly; the
 * filesystem write is tested via subprocess against a tmp REPO_ROOT.
 *
 * Run with: node --test tests/clipping-write.test.mjs
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  slugify,
  deriveTitle,
  canonicalHash,
  buildFilename,
  buildFrontmatter,
  buildBody,
  normalizeTs,
  normalizeTextForHash,
} from '../scripts/lib/clipping-write.mjs'

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    assert.equal(slugify('Hello World!'), 'hello-world')
  })
  it('strips edge hyphens', () => {
    assert.equal(slugify('  ---foo bar---  '), 'foo-bar')
  })
  it('caps length at maxLen', () => {
    const s = slugify('a'.repeat(100), 10)
    assert.equal(s.length, 10)
  })
  it('falls back to "untitled" for empty input', () => {
    assert.equal(slugify(''), 'untitled')
    assert.equal(slugify('!!!'), 'untitled')
  })
})

describe('deriveTitle', () => {
  it('returns the first line trimmed', () => {
    assert.equal(deriveTitle('First line\nsecond line'), 'First line')
  })
  it('truncates over 80 chars with ellipsis', () => {
    const t = deriveTitle('x'.repeat(100))
    assert.ok(t.endsWith('…'))
    assert.equal(t.length, 78)
  })
})

describe('canonicalHash', () => {
  it('is stable across calls with same inputs', () => {
    const a = canonicalHash({ source: 'slack', author: 'jay', ts: '2026-04-25T17:00:00Z', text: 'hi' })
    const b = canonicalHash({ source: 'slack', author: 'jay', ts: '2026-04-25T17:00:00Z', text: 'hi' })
    assert.equal(a, b)
  })
  it('differs when text differs', () => {
    const a = canonicalHash({ source: 'slack', text: 'hi' })
    const b = canonicalHash({ source: 'slack', text: 'bye' })
    assert.notEqual(a, b)
  })
  it('differs when source differs', () => {
    const a = canonicalHash({ source: 'slack', text: 'hi' })
    const b = canonicalHash({ source: 'apple-notes', text: 'hi' })
    assert.notEqual(a, b)
  })
  it('treats trailing whitespace as identical', () => {
    const a = canonicalHash({ source: 'slack', text: 'hi' })
    const b = canonicalHash({ source: 'slack', text: 'hi   \n  ' })
    assert.equal(a, b)
  })
  it('treats Z-suffixed and local-time ISO of the same instant as identical', () => {
    // The dedup drift bug: '2026-05-16T08:40:32Z' and '2026-05-16T08:40:32.000Z'
    // and 'Sat May 16 2026 08:40:32 GMT+0000' all represent the same instant.
    const a = canonicalHash({ source: 'apple-notes', ts: '2026-05-16T08:40:32Z', text: 'body' })
    const b = canonicalHash({ source: 'apple-notes', ts: '2026-05-16T08:40:32.000Z', text: 'body' })
    assert.equal(a, b)
  })
  it('strips a leading <type>: prefix line when --type matches', () => {
    // apple-notes sometimes passes 'paper: foo' as text, sometimes 'foo' with
    // the prefix already stripped by the caller. Hash should be identical
    // when --type=paper is declared in both cases.
    const a = canonicalHash({ source: 'apple-notes', type: 'paper', text: 'paper: Morning-review test' })
    const b = canonicalHash({ source: 'apple-notes', type: 'paper', text: 'Morning-review test' })
    assert.equal(a, b)
  })
  it('does NOT strip a <type>: prefix when --type differs', () => {
    // Safety: only strip when the caller declared the prefix is a type-hint.
    const a = canonicalHash({ source: 'apple-notes', type: 'note', text: 'paper: Morning-review test' })
    const b = canonicalHash({ source: 'apple-notes', type: 'note', text: 'Morning-review test' })
    assert.notEqual(a, b)
  })
  it('is unicode-NFC invariant', () => {
    // 'é' as composed (U+00E9) vs decomposed (U+0065 U+0301) should hash the same.
    const a = canonicalHash({ source: 'slack', text: 'café' })
    const b = canonicalHash({ source: 'slack', text: 'café' })
    assert.equal(a, b)
  })
})

describe('normalizeTs', () => {
  it('collapses Z and ms variants to canonical ISO', () => {
    assert.equal(normalizeTs('2026-05-16T08:40:32Z'), '2026-05-16T08:40:32.000Z')
    assert.equal(normalizeTs('2026-05-16T08:40:32.000Z'), '2026-05-16T08:40:32.000Z')
  })
  it('passes through unparseable input', () => {
    assert.equal(normalizeTs('not-a-date'), 'not-a-date')
  })
  it('returns empty string for empty input', () => {
    assert.equal(normalizeTs(''), '')
    assert.equal(normalizeTs(undefined), '')
  })
})

describe('normalizeTextForHash', () => {
  it('NFC-normalizes', () => {
    assert.equal(normalizeTextForHash('café'), 'café')
  })
  it('strips leading "<type>: " when type matches', () => {
    assert.equal(normalizeTextForHash('paper: foo bar', { type: 'paper' }), 'foo bar')
    assert.equal(normalizeTextForHash('PAPER: foo bar', { type: 'paper' }), 'foo bar')  // case-insensitive
  })
  it('does not strip when type does not match', () => {
    assert.equal(normalizeTextForHash('paper: foo bar', { type: 'note' }), 'paper: foo bar')
  })
  it('strips type-prefix only from the first line, preserving rest', () => {
    assert.equal(
      normalizeTextForHash('paper: first line\nsecond line', { type: 'paper' }),
      'first line\nsecond line'
    )
  })
})

describe('buildFilename', () => {
  it('ts goes first, hash prefix at end', () => {
    const f = buildFilename({ ts: '2026-04-25T17:00:00.000Z', source: 'slack', slug: 'hello', hash: 'abc12345xxxxxxxx' })
    assert.match(f, /^2026-04-25T17-00-00__slack__hello__abc12345\.md$/)
  })
  it('handles missing ts', () => {
    const f = buildFilename({ source: 'slack', slug: 'hello', hash: 'deadbeefxxxxxxxx' })
    assert.match(f, /^now__slack__hello__deadbeef\.md$/)
  })
})

describe('buildFrontmatter', () => {
  it('always includes title, source, captured_at, tags, hash', () => {
    const fm = buildFrontmatter({
      source: 'slack',
      author: 'jay',
      ts: '2026-04-25T17:00:00Z',
      title: 'hello',
      type: 'note',
      extraTags: ['meeting'],
      hash: 'deadbeef',
    })
    assert.match(fm, /^title: "hello"$/m)
    assert.match(fm, /^source: slack$/m)
    assert.match(fm, /^author: "jay"$/m)
    assert.match(fm, /^captured_at: 2026-04-25T17:00:00Z$/m)
    assert.match(fm, /^type_hint: note$/m)
    assert.match(fm, /^tags: \[quick-capture, source-slack, meeting\]$/m)
    assert.match(fm, /^canonical_hash: deadbeef$/m)
  })
  it('omits optional fields cleanly', () => {
    const fm = buildFrontmatter({
      source: 'apple-notes',
      ts: '2026-04-25T17:00:00Z',
      title: 'hi',
      extraTags: [],
      hash: 'h',
    })
    assert.doesNotMatch(fm, /author:/)
    assert.doesNotMatch(fm, /type_hint:/)
  })
})

describe('buildBody', () => {
  it('produces filename + frontmatter + body in one call', () => {
    const out = buildBody({
      source: 'slack',
      author: 'jay',
      ts: '2026-04-25T17:00:00Z',
      text: 'A quick thought\nwith two lines',
    })
    assert.ok(out.filename.startsWith('2026-04-25T17-00-00__slack__a-quick-thought'))
    assert.match(out.body, /^---/)
    assert.match(out.body, /A quick thought\nwith two lines/)
    assert.equal(out.hash.length, 64)
  })
  it('derives title from first line when --title not given', () => {
    const out = buildBody({ source: 'slack', text: 'My thought\nrest' })
    assert.match(out.body, /^title: "My thought"$/m)
  })
  it('respects explicit --title', () => {
    const out = buildBody({ source: 'slack', text: 'body', title: 'Custom' })
    assert.match(out.body, /^title: "Custom"$/m)
  })
})

// ─── Subprocess test of writeClipping (via CLI) ─────────────────────────────
// We can't easily redirect REPO inside the CLI because it's hardcoded
// relative to the script. Instead we exercise it in --dry-run mode which
// doesn't touch the filesystem.

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

describe('clipping-write CLI (dry-run)', () => {
  function run(args) {
    const r = spawnSync('node', ['scripts/lib/clipping-write.mjs', ...args], { cwd: REPO, encoding: 'utf8' })
    return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '' }
  }

  it('errors without --source', () => {
    const r = run(['--text', 'hi', '--dry-run'])
    assert.notEqual(r.code, 0)
    assert.match(r.stderr, /--source is required/)
  })

  it('errors without --text or --text-file', () => {
    const r = run(['--source', 'slack', '--dry-run'])
    assert.notEqual(r.code, 0)
    assert.match(r.stderr, /--text or --text-file required/)
  })

  it('prints would-be path and frontmatter on dry-run', () => {
    const r = run(['--source', 'slack', '--author', 'jay', '--ts', '2026-04-25T17:00:00Z',
                   '--text', 'hello world', '--dry-run'])
    assert.equal(r.code, 0)
    assert.match(r.stdout, /would write: raw\/clippings\/2026-04-25T17-00-00__slack__hello-world__/)
    assert.match(r.stdout, /title: "hello world"/)
    assert.match(r.stdout, /source: slack/)
    assert.match(r.stdout, /tags: \[quick-capture, source-slack\]/)
  })

  it('accepts --type hint', () => {
    const r = run(['--source', 'apple-notes', '--text', 'meeting note',
                   '--type', 'transcript', '--dry-run'])
    assert.equal(r.code, 0)
    assert.match(r.stdout, /type_hint: transcript/)
  })
})
