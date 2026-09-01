// Characterization tests for lib/repo-runtime/templates.mjs.
//
// 712 lines of scaffolding that produce every canonical page a newly
// registered repo gets, and it had zero direct coverage. These tests pin
// CURRENT behaviour: the doc-type tables, that every declared type yields
// parseable frontmatter, and the unknown-type fallback. No behaviour change.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  CANONICAL_DOCS,
  PLATFORM_CANONICAL_DOCS,
  generateCanonicalTemplate,
  generateHomePage,
  generateProgressPage,
  generateRepoCLAUDE,
} from '../../lib/repo-runtime/templates.mjs'
import { parseFrontmatter } from '../../lib/agent-runtime/frontmatter.mjs'

const ALL_DOC_TYPES = [...Object.keys(CANONICAL_DOCS), ...Object.keys(PLATFORM_CANONICAL_DOCS)]

// ─── Doc-type tables ──────────────────────────────────────────────────────

test('the two doc-type tables map to distinct .md filenames', () => {
  const all = { ...CANONICAL_DOCS, ...PLATFORM_CANONICAL_DOCS }
  // A collision would make two doc types scaffold over each other.
  assert.equal(
    Object.keys(all).length,
    Object.keys(CANONICAL_DOCS).length + Object.keys(PLATFORM_CANONICAL_DOCS).length,
    'a key appears in both tables',
  )
  const files = Object.values(all)
  assert.equal(new Set(files).size, files.length, 'two doc types share a filename')
  for (const f of files) assert.match(f, /\.md$/)
})

// ─── generateCanonicalTemplate ────────────────────────────────────────────

test('every declared doc type renders frontmatter that parses and names the repo', () => {
  for (const docType of ALL_DOC_TYPES) {
    const out = generateCanonicalTemplate(docType, 'my-repo')
    assert.equal(typeof out, 'string', `${docType} must render a string`)
    assert.ok(out.startsWith('---\n'), `${docType} must open with frontmatter`)

    const { data } = parseFrontmatter(out)
    assert.equal(data.repo, 'my-repo', `${docType} must stamp repo`)
    assert.equal(typeof data.title, 'string', `${docType} must stamp a title`)
    assert.ok(data.title.includes('my-repo'), `${docType} title must name the repo`)
    assert.match(String(data.created), /^\d{4}-\d{2}-\d{2}$/, `${docType} created must be a date`)
    assert.match(String(data.updated), /^\d{4}-\d{2}-\d{2}$/, `${docType} updated must be a date`)
  }
})

test('an unrecognised doc type falls through to a generic placeholder rather than throwing', () => {
  // Pinned because it is silent: a typo'd docType does not raise, it scaffolds
  // a real page whose only body is "(Content placeholder)". Callers that trust
  // the return value get a plausible-looking but empty canonical doc.
  const out = generateCanonicalTemplate('not-a-real-doc-type', 'my-repo')
  assert.equal(typeof out, 'string')
  const { data } = parseFrontmatter(out)
  assert.equal(data.doc_type, 'not-a-real-doc-type')
  assert.equal(data.repo, 'my-repo')
  assert.match(out, /Content placeholder/)
})

// ─── Page generators ──────────────────────────────────────────────────────

test('generateHomePage tolerates a record with no description', () => {
  const page = generateHomePage({
    repo_name: 'my-repo', owner: 'someone', visibility: 'public', status: 'active',
  })
  const { data } = parseFrontmatter(page)
  assert.equal(data.repo, 'my-repo')
  assert.equal(data.type, 'page')
  assert.match(page, /\*\*Owner\*\*: someone/)
  assert.match(page, /\*\*Visibility\*\*: public/)
  // Missing description degrades to an empty link target and a '#' anchor
  // rather than rendering the string "undefined".
  assert.equal(/undefined/.test(page), false)
})

test('generateProgressPage and generateRepoCLAUDE stamp the repo and parse', () => {
  const progress = generateProgressPage('my-repo')
  const progressMeta = parseFrontmatter(progress).data
  assert.equal(progressMeta.repo, 'my-repo')
  assert.equal(progressMeta.type, 'progress')
  assert.match(progress, /Progress Log/)

  const claude = generateRepoCLAUDE('my-repo')
  const claudeMeta = parseFrontmatter(claude).data
  assert.equal(claudeMeta.repo, 'my-repo')
  assert.equal(claudeMeta.doc_type, 'claude')
})

// ─── Known gap, pinned rather than fixed ──────────────────────────────────

test('a repo name containing a quote and a newline injects frontmatter keys', () => {
  // KNOWN GAP, pinned so a future change is deliberate. Every generator here
  // builds YAML by string interpolation (`title: "${repoName} — Home"`) instead
  // of going through serializeFrontmatter, so a repo name that closes the
  // scalar can add arbitrary top-level keys to the emitted page.
  //
  // NOT currently reachable, which is why this is a pin and not a fix:
  //   - these four generators have no callers in the repo today (only
  //     declarations in lib/repo-runtime/index.d.ts), and
  //   - the live MCP and CLI entry points run `repo` through validateSlug
  //     (mcp/server.js:1040,1059,1165; cli/kb.js:1451), which rejects both
  //     characters.
  // The gap is that upsertRepo itself does not validate repo_name, so the
  // guard is at the callers rather than at the data. See docs/NIGHTLY-BACKLOG.md.
  const hostile = 'repo" \ninjected_key: pwned\nx: "'
  const { data } = parseFrontmatter(generateHomePage({
    repo_name: hostile, owner: 'o', visibility: 'public', status: 'active',
  }))

  assert.equal(data.injected_key, 'pwned', 'current behaviour: the key is injected')

  // The same interpolation is used by all four generators.
  for (const render of [
    () => generateProgressPage(hostile),
    () => generateRepoCLAUDE(hostile),
    () => generateCanonicalTemplate('prd', hostile),
  ]) {
    assert.equal(parseFrontmatter(render()).data.injected_key, 'pwned')
  }
})
