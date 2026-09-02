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
  yamlScalar,
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
  it('is identical for the same source-id regardless of ts or body drift', () => {
    // The 10-duplicate bug: the same Apple Note re-pulled under a different
    // timezone reading AND with re-serialized markup produced a new hash every
    // time. A stable upstream ID collapses all of those back to one identity.
    const a = canonicalHash({
      source: 'apple-notes',
      sourceId: 'x-coredata://ABC/ICNote/p5325',
      ts: '2026-05-16T08:40:32Z',
      text: 'body',
    })
    const b = canonicalHash({
      source: 'apple-notes',
      sourceId: 'x-coredata://ABC/ICNote/p5325',
      ts: '2026-05-16T15:40:32Z',
      text: 'body\n\n  re-serialized   spacing ',
    })
    assert.equal(a, b)
  })
  it('differs for different source-ids even with identical bodies', () => {
    const a = canonicalHash({ source: 'apple-notes', sourceId: 'p1', text: 'same' })
    const b = canonicalHash({ source: 'apple-notes', sourceId: 'p2', text: 'same' })
    assert.notEqual(a, b)
  })
  it('does not collide a source-id hash with a content hash', () => {
    const withId = canonicalHash({ source: 'apple-notes', sourceId: 'p1', text: 'x' })
    const without = canonicalHash({ source: 'apple-notes', text: 'x' })
    assert.notEqual(withId, without)
  })
  it('ignores whitespace and markup drift in the no-source-id fallback', () => {
    // CRLF, non-breaking spaces, zero-width joiners and blank-line runs all
    // come from HTML-to-text conversion, not from the author.
    const a = canonicalHash({ source: 'apple-notes', text: 'one two\n\nthree' })
    const b = canonicalHash({ source: 'apple-notes', text: 'one  two\r\n\r\n\r\nthree​  ' })
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

  // normalizeTs contracts to pass an unparseable --ts through verbatim so the
  // canonical hash stays defined. buildFilename then fed that value to
  // `new Date(x).toISOString()`, which throws RangeError — so the documented
  // pass-through terminated the capture instead of surviving it.
  it('an unparseable ts yields a sentinel instead of throwing RangeError', () => {
    const f = buildFilename({
      ts: normalizeTs('Aug 27, 2026 at 3:40 PM'),
      source: 'apple-notes',
      slug: 'hello',
      hash: 'deadbeefxxxxxxxx',
    })
    assert.match(f, /^undated__apple-notes__hello__deadbeef\.md$/)
  })

  it('an unparseable ts is distinguishable from an absent one', () => {
    const absent = buildFilename({ source: 'slack', slug: 'x', hash: 'aaaaaaaabbbb' })
    const bad = buildFilename({ ts: 'not-a-date', source: 'slack', slug: 'x', hash: 'aaaaaaaabbbb' })
    assert.notEqual(absent, bad)
  })

  // `source` was interpolated raw into a name that is path.join()ed onto
  // raw/clippings/, so `../` in it escaped the directory.
  it('a traversing source cannot introduce a path separator', () => {
    const f = buildFilename({
      ts: '2026-04-25T17:00:00.000Z',
      source: '../../../../../etc/pwned',
      slug: 'hello',
      hash: 'deadbeefxxxxxxxx',
    })
    assert.ok(!f.includes('/'), `filename must be one path segment, got: ${f}`)
    assert.ok(!f.includes('..'), `filename must not contain a traversal, got: ${f}`)
    assert.equal(path.basename(f), f)
  })

  it('leaves the real source names byte-identical', () => {
    for (const source of ['slack', 'apple-notes', 'gmail']) {
      const f = buildFilename({ ts: '2026-04-25T17:00:00.000Z', source, slug: 'x', hash: 'abcd1234eeee' })
      assert.match(f, new RegExp(`__${source}__`))
    }
  })
})

describe('buildBody composition', () => {
  // buildFrontmatter is already tested with an unparseable ts and passes, but
  // buildBody crashed before ever reaching it — the pieces were covered, the
  // composition was not.
  it('survives the Apple Notes human-readable timestamp end to end', () => {
    const r = buildBody({
      source: 'apple-notes',
      ts: 'Aug 27, 2026 at 3:40 PM',
      text: 'hello world',
    })
    assert.ok(r.filename.endsWith('.md'))
    assert.match(r.body, /^captured_at: "Aug 27, 2026 at 3:40 PM"$/m)
  })

  it('a traversing source still produces a single-segment filename', () => {
    const r = buildBody({
      source: '../../../../../tmp/pwned',
      ts: '2026-04-25T17:00:00Z',
      text: 'hello world',
    })
    assert.equal(path.basename(r.filename), r.filename)
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
  it('quotes a source carrying YAML syntax instead of breaking the block', () => {
    const fm = buildFrontmatter({
      source: 'slack: #general',
      ts: '2026-04-25T17:00:00Z',
      title: 'hi',
      extraTags: [],
      hash: 'h',
    })
    assert.match(fm, /^source: "slack: #general"$/m)
    assert.match(fm, /^tags: \[quick-capture, "source-slack: #general"\]$/m)
  })
  it('an --extra-tag cannot escape the tags flow sequence', () => {
    const fm = buildFrontmatter({
      source: 'slack',
      ts: '2026-04-25T17:00:00Z',
      title: 'hi',
      extraTags: ['ok], injected: true, x: [y'],
      hash: 'h',
    })
    const tagLine = fm.split('\n').find(l => l.startsWith('tags:'))
    assert.equal(tagLine, 'tags: [quick-capture, source-slack, "ok], injected: true, x: [y"]')
    assert.doesNotMatch(fm, /^injected:/m)
  })
  it('an unparseable --ts cannot inject a sibling key', () => {
    const fm = buildFrontmatter({
      source: 'slack',
      ts: normalizeTs('not-a-date\nverified: true'),
      title: 'hi',
      extraTags: [],
      hash: 'h',
    })
    assert.doesNotMatch(fm, /^verified:/m)
    assert.match(fm, /^captured_at: "not-a-date verified: true"$/m)
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

describe('yamlScalar', () => {
  it('passes plain-safe values through bare', () => {
    for (const v of ['slack', 'apple-notes', 'quick-capture', 'paper', 'deadbeef', '2026-04-25T17:00:00.000Z']) {
      assert.equal(yamlScalar(v), v)
    }
  })
  it('quotes anything with whitespace, quotes, or brackets', () => {
    assert.equal(yamlScalar('a b'), '"a b"')
    assert.equal(yamlScalar('say "hi"'), '"say \\"hi\\""')
    assert.equal(yamlScalar('[list]'), '"[list]"')
  })
  it('collapses newlines so a scalar stays one line', () => {
    assert.equal(yamlScalar('a\nb'), '"a b"')
  })
})

// ─── Module import must not run the CLI ───────────────────────────────────

describe('clipping-write module import', () => {
  it('does not run the CLI or exit the host', () => {
    // isMain used path.basename(process.argv[1] || '') with an endsWith check,
    // and ''.endsWith('') is true — so with no argv[1] (node -e, --eval, REPL,
    // loader/worker contexts) a plain import ran the CLI with empty args and
    // called process.exit(1) on its importer.
    const mod = new URL('../scripts/lib/clipping-write.mjs', import.meta.url).href
    const r = spawnSync(process.execPath, ['-e', `import(${JSON.stringify(mod)}).then(() => console.log('IMPORT_OK'))`], { encoding: 'utf8' })
    assert.equal(r.status, 0, `import exited ${r.status}: ${r.stderr}`)
    assert.match(r.stdout, /IMPORT_OK/)
    assert.doesNotMatch(r.stderr, /--source is required/)
  })
})
