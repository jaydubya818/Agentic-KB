/**
 * Tests for scripts/candidates-ttl.mjs expiry + archive behavior.
 *
 * Run with: node --test tests/candidates-ttl.test.mjs
 *
 * The script is exercised via subprocess with KB_ROOT pointed at a tmp
 * fixture tree, so the real wiki/ is never touched.
 */

import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCRIPT = path.join(REPO, 'scripts', 'candidates-ttl.mjs')

let root

const CANDIDATES = () => path.join(root, 'wiki', 'candidates.md')
const TRACKER = () => path.join(root, 'wiki', '_meta', 'candidates-tracker.json')
const ARCHIVE = (name) => path.join(root, 'wiki', 'archive', 'candidates-expired', name)

function run(extraArgs = []) {
  const r = spawnSync(process.execPath, [SCRIPT, ...extraArgs], {
    encoding: 'utf8',
    env: { ...process.env, KB_ROOT: root },
  })
  assert.equal(r.status, 0, `script failed: ${r.stderr}`)
  return r
}

function writeCandidates(lines) {
  fs.writeFileSync(
    CANDIDATES(),
    `---\ntitle: Compile Candidates\ntype: meta\nupdated: 2026-01-01\n---\n\n${lines.join('\n')}\n`
  )
}

before(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-candidates-ttl-'))
  fs.mkdirSync(path.join(root, 'wiki', '_meta'), { recursive: true })
})

after(() => {
  fs.rmSync(root, { recursive: true, force: true })
})

describe('candidates-ttl', () => {
  it('dry run reports expiry without touching files', () => {
    writeCandidates(['- old-theme  (1 source: some "quoted" summary)', '- new-theme  (1 source: fresh-note)'])
    fs.writeFileSync(
      TRACKER(),
      JSON.stringify({ 'old-theme': { first_seen: '2020-01-01' } }, null, 2)
    )
    const r = run()
    assert.match(r.stdout, /Expired .*: 1/)
    assert.match(r.stdout, /old-theme/)
    assert.ok(!fs.existsSync(ARCHIVE('old-theme.md')))
  })

  it('--apply archives expired themes with valid quoted sources', () => {
    run(['--apply'])
    const archived = fs.readFileSync(ARCHIVE('old-theme.md'), 'utf8')
    // the embedded quote must be escaped, not break the frontmatter value
    assert.match(archived, /final_sources: "some \\"quoted\\" summary"/)
    assert.match(archived, /first_seen: 2020-01-01/)
    // candidates.md keeps only the fresh theme
    const remaining = fs.readFileSync(CANDIDATES(), 'utf8')
    assert.ok(!remaining.includes('old-theme'))
    assert.ok(remaining.includes('new-theme'))
    assert.match(remaining, /updated: \d{4}-\d{2}-\d{2}/)
    // tracker drops the archived theme, keeps the live one
    const tracker = JSON.parse(fs.readFileSync(TRACKER(), 'utf8'))
    assert.ok(!tracker['old-theme'])
    assert.ok(tracker['new-theme'])
  })

  it('re-expiry of a returning theme does not clobber the old archive', () => {
    writeCandidates(['- old-theme  (1 source: second-life)', '- new-theme  (1 source: fresh-note)'])
    const tracker = JSON.parse(fs.readFileSync(TRACKER(), 'utf8'))
    tracker['old-theme'] = { first_seen: '2021-01-01' }
    fs.writeFileSync(TRACKER(), JSON.stringify(tracker, null, 2))
    run(['--apply'])
    // first archive intact, second lands with a suffix
    assert.match(fs.readFileSync(ARCHIVE('old-theme.md'), 'utf8'), /first_seen: 2020-01-01/)
    assert.match(fs.readFileSync(ARCHIVE('old-theme-2.md'), 'utf8'), /first_seen: 2021-01-01/)
  })

  it('tracks and expires namespaced themes, not just flat slugs', () => {
    // compile-2source-gate writes each theme straight from a wikilink target, so
    // `concepts/llm-wiki` is the ordinary shape, not an edge case. The slug class
    // used to stop at the slash, so every namespaced candidate was skipped: not
    // counted, not tracked, and permanently exempt from the TTL.
    writeCandidates([
      '- concepts/llm-wiki  (1 source: karpathy-llm-wiki-video)',
      '- flat-theme  (1 source: fresh-note)',
    ])
    fs.writeFileSync(
      TRACKER(),
      JSON.stringify({ 'concepts/llm-wiki': { first_seen: '2020-01-01' } }, null, 2)
    )

    const dry = run()
    assert.match(dry.stdout, /Candidates: 2 total/)
    assert.match(dry.stdout, /Expired .*: 1/)
    assert.match(dry.stdout, /concepts\/llm-wiki/)

    run(['--apply'])
    // Archived under a matching subdirectory rather than crashing on ENOENT.
    const archived = fs.readFileSync(ARCHIVE(path.join('concepts', 'llm-wiki.md')), 'utf8')
    assert.match(archived, /first_seen: 2020-01-01/)
    // The rewrite filter has to recognise the same slug class the parser does,
    // or the expired line survives and the theme is resurrected next run.
    const remaining = fs.readFileSync(CANDIDATES(), 'utf8')
    assert.ok(!remaining.includes('concepts/llm-wiki'))
    assert.ok(remaining.includes('flat-theme'))
    const tracker = JSON.parse(fs.readFileSync(TRACKER(), 'utf8'))
    assert.ok(!tracker['concepts/llm-wiki'])
    assert.ok(tracker['flat-theme'])
  })

  it('tracks and expires a theme whose name is an Object.prototype key', () => {
    // THEME_SLUG admits `constructor`, and theme names come straight from
    // wikilink / key_concepts targets — an entirely ordinary concept name in a
    // KB about engineering. With a plain `{}` tracker the guard
    // `!tracker['constructor']` resolved to the inherited Object constructor
    // (truthy), so the init branch never ran: `first_seen` was never recorded,
    // the `last_seen`/`count` writes landed on the global Object instead of the
    // tracker, and `undefined < cutoff` was false on every subsequent run. The
    // candidate was parsed and counted but never tracked, never aged and never
    // expired — permanently exempt from the TTL this script exists to apply.
    writeCandidates([
      '- constructor  (1 source: notes-on-js)',
      '- plain-theme  (1 source: fresh-note)',
    ])
    fs.writeFileSync(TRACKER(), JSON.stringify({}, null, 2))

    run(['--apply'])
    const t1 = JSON.parse(fs.readFileSync(TRACKER(), 'utf8'))
    assert.ok(
      Object.hasOwn(t1, 'constructor'),
      'constructor must land as an own tracker key, or the theme can never age'
    )
    assert.match(t1['constructor'].first_seen, /^\d{4}-\d{2}-\d{2}$/)

    // Age it and confirm it can actually reach expiry and archive.
    t1['constructor'].first_seen = '2020-01-01'
    fs.writeFileSync(TRACKER(), JSON.stringify(t1, null, 2))
    const r = run(['--apply'])
    assert.match(r.stdout, /Expired .*: 1/)
    assert.match(fs.readFileSync(ARCHIVE('constructor.md'), 'utf8'), /first_seen: 2020-01-01/)

    const remaining = fs.readFileSync(CANDIDATES(), 'utf8')
    assert.ok(!remaining.includes('- constructor'))
    assert.ok(remaining.includes('plain-theme'))
    const t2 = JSON.parse(fs.readFileSync(TRACKER(), 'utf8'))
    assert.ok(!Object.hasOwn(t2, 'constructor'))
    assert.ok(Object.hasOwn(t2, 'plain-theme'))
  })

  it('is a no-op without a candidates file', () => {
    fs.rmSync(CANDIDATES())
    const r = run()
    assert.match(r.stdout, /nothing to do/)
  })
})
