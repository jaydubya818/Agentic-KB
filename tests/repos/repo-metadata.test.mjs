// Characterization tests for lib/repo-runtime/metadata.mjs.
//
// This module had zero direct coverage: it is the only writer of the
// provenance frontmatter that marks a wiki page as a mirrored copy of a file
// in someone else's GitHub repo, and `isImportedContent` is the predicate the
// sync path uses to decide whether a page is safe to overwrite. These tests
// pin CURRENT behaviour so a future change to the field set or to the
// null-stripping rule has to be deliberate.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  IMPORTED_DOC_FIELDS,
  makeImportedFrontmatter,
  parseImportedMeta,
  isImportedContent,
} from '../../lib/repo-runtime/metadata.mjs'
import { serializeFrontmatter } from '../../lib/agent-runtime/frontmatter.mjs'

// ─── IMPORTED_DOC_FIELDS ──────────────────────────────────────────────────

test('IMPORTED_DOC_FIELDS lists exactly the keys makeImportedFrontmatter can emit', () => {
  const fm = makeImportedFrontmatter({
    repo_name: 'r',
    repo_visibility: 'public',
    source_type: 'github',
    branch: 'main',
    commit_sha: 'abc',
    source_path: 'README.md',
    imported_at: '2026-09-01T00:00:00.000Z',
    source_url: 'https://example.invalid/r',
  })
  // The declared field list is what callers strip/compare against; if the
  // builder grows a key that is not declared, provenance-aware callers miss it.
  assert.deepEqual(Object.keys(fm).sort(), [...IMPORTED_DOC_FIELDS].sort())
})

// ─── makeImportedFrontmatter ──────────────────────────────────────────────

test('makeImportedFrontmatter defaults source_type to github and stamps imported_at', () => {
  const before = Date.now()
  const fm = makeImportedFrontmatter({ repo_name: 'r' })
  const after = Date.now()

  assert.equal(fm.source_type, 'github')
  assert.equal(fm.repo_name, 'r')
  const stamped = Date.parse(fm.imported_at)
  assert.equal(Number.isNaN(stamped), false, 'imported_at must be a parseable ISO timestamp')
  assert.ok(stamped >= before - 1000 && stamped <= after + 1000)
})

test('makeImportedFrontmatter drops undefined and null but keeps empty strings', () => {
  const fm = makeImportedFrontmatter({
    repo_name: 'r',
    repo_visibility: '',
    branch: null,
    commit_sha: undefined,
    source_path: '',
    imported_at: '2026-09-01T00:00:00.000Z',
  })

  // Only undefined/null are stripped — '' is a real value and survives.
  assert.equal('repo_visibility' in fm, true)
  assert.equal(fm.repo_visibility, '')
  assert.equal('source_path' in fm, true)
  assert.equal('branch' in fm, false)
  assert.equal('commit_sha' in fm, false)
  assert.equal('source_url' in fm, false)
})

test('an explicit null source_type strips the marker field entirely', () => {
  // Documented gap, pinned deliberately: the default only applies to
  // `undefined`. Passing an explicit null defeats the destructuring default,
  // and the null-stripping loop then removes the key, so the resulting page
  // does NOT read back as imported content.
  const fm = makeImportedFrontmatter({ repo_name: 'r', source_type: null })
  assert.equal('source_type' in fm, false)
  assert.equal(isImportedContent(serializeFrontmatter(fm, 'body')), false)
})

// ─── isImportedContent ────────────────────────────────────────────────────

test('isImportedContent keys off source_type and never throws on non-strings', () => {
  const imported = serializeFrontmatter(makeImportedFrontmatter({ repo_name: 'r' }), '# Doc')
  assert.equal(isImportedContent(imported), true)

  assert.equal(isImportedContent('# Just a heading, no frontmatter'), false)
  assert.equal(isImportedContent(''), false)
  for (const notAString of [null, undefined, 0, 42, true, {}, [], Symbol('x')]) {
    assert.equal(isImportedContent(notAString), false)
  }
})

test('isImportedContent is true for any truthy source_type, not just github', () => {
  const local = serializeFrontmatter({ source_type: 'local-fs' }, 'body')
  assert.equal(isImportedContent(local), true)
})

// ─── parseImportedMeta ────────────────────────────────────────────────────

test('parseImportedMeta round-trips the provenance fields and returns the body', () => {
  const meta = makeImportedFrontmatter({
    repo_name: 'agentic-kb',
    repo_visibility: 'public',
    branch: 'main',
    commit_sha: 'deadbeef',
    source_path: 'docs/README.md',
    imported_at: '2026-09-01T00:00:00.000Z',
    source_url: 'https://example.invalid/agentic-kb/blob/main/docs/README.md',
  })
  const body = '# Title\n\nSome body text.\n'

  const parsed = parseImportedMeta(serializeFrontmatter(meta, body))

  for (const key of Object.keys(meta)) {
    assert.equal(parsed.meta[key], meta[key], `field ${key} must survive the round trip`)
  }
  assert.match(parsed.body, /Some body text\./)
})

test('parseImportedMeta on content with no frontmatter yields empty meta and the whole body', () => {
  const raw = '# No frontmatter here\n'
  const parsed = parseImportedMeta(raw)
  assert.deepEqual(parsed.meta, {})
  assert.match(parsed.body, /No frontmatter here/)
})
