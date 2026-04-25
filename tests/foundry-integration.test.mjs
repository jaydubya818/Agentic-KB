/**
 * Foundry integration tests.
 *
 * Run with: node --test tests/foundry-integration.test.mjs
 *
 * Covers:
 *   1. compile-gate-core helpers — extractFrontmatter, extractWikilinks,
 *      extractKeyConcepts, classify (PROMOTE/DEFER/GRADUATE/forced)
 *   2. buildIndex against a fixture summaries dir
 *   3. ingest-dedup CLI in --dry-run --no-ingest mode (sha256 dedup +
 *      type-detection routing) — does NOT shell out to `kb ingest-file`
 *
 * No real `kb compile` calls. No writes to the real wiki. Each test
 * builds its own tmp dir under /tmp and tears down on completion.
 */

import { describe, it, before, after, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import {
  extractFrontmatter,
  extractWikilinks,
  extractKeyConcepts,
  buildIndex,
  classify,
  MIN_SOURCES,
} from '../scripts/lib/compile-gate-core.mjs'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function tmpDir(prefix = 'foundry-test-') {
  return await fs.mkdtemp(path.join(os.tmpdir(), prefix))
}

// ─── Pure helpers ───────────────────────────────────────────────────────────

describe('extractFrontmatter', () => {
  it('returns the YAML block between --- fences', () => {
    const text = '---\ntitle: Foo\ntype: summary\n---\n\nbody text'
    assert.equal(extractFrontmatter(text), 'title: Foo\ntype: summary')
  })

  it('returns empty string when no frontmatter present', () => {
    assert.equal(extractFrontmatter('just body, no fences'), '')
  })

  it('handles empty frontmatter', () => {
    assert.equal(extractFrontmatter('---\n\n---\nbody'), '')
  })
})

describe('extractWikilinks', () => {
  it('pulls slug from a basic [[wikilink]]', () => {
    assert.deepEqual(extractWikilinks('related: [[concepts/tool-use]]'), ['concepts/tool-use'])
  })

  it('strips alias from [[slug|Display Name]]', () => {
    assert.deepEqual(extractWikilinks('foo [[concepts/x|Display]]'), ['concepts/x'])
  })

  it('dedupes repeated links', () => {
    const fm = 'related: [[a]] [[a]] [[b]]'
    assert.deepEqual(extractWikilinks(fm).sort(), ['a', 'b'])
  })

  it('returns empty array when no links', () => {
    assert.deepEqual(extractWikilinks('plain: text'), [])
  })
})

describe('extractKeyConcepts', () => {
  it('parses single-line list form', () => {
    assert.deepEqual(extractKeyConcepts('key_concepts: [a, b, c]'), ['a', 'b', 'c'])
  })

  it('strips quotes around items', () => {
    assert.deepEqual(extractKeyConcepts('key_concepts: ["a", \'b\', c]'), ['a', 'b', 'c'])
  })

  it('returns [] when key missing', () => {
    assert.deepEqual(extractKeyConcepts('title: foo'), [])
  })

  it('returns [] for empty list', () => {
    // Parser only matches non-empty lists — empty form is treated as absent.
    assert.deepEqual(extractKeyConcepts('key_concepts: []'), [])
  })
})

// ─── classify() decision matrix ─────────────────────────────────────────────

describe('classify', () => {
  it('PROMOTE: theme with ≥2 sources, not previously a candidate', () => {
    const themes = new Map([['concepts/foo', new Set(['s1', 's2'])]])
    const out = classify(themes, new Set(), new Set())
    assert.equal(out.promote.length, 1)
    assert.equal(out.promote[0].theme, 'concepts/foo')
    assert.equal(out.promote[0].hasPage, false)
    assert.equal(out.defer.length, 0)
    assert.equal(out.graduate.length, 0)
  })

  it('PROMOTE marks hasPage=true when theme already has a wiki page', () => {
    const themes = new Map([['concepts/foo', new Set(['s1', 's2'])]])
    const out = classify(themes, new Set(), new Set(['concepts/foo']))
    assert.equal(out.promote[0].hasPage, true)
  })

  it('DEFER: single-source theme without --force', () => {
    const themes = new Map([['concepts/lonely', new Set(['s1'])]])
    const out = classify(themes, new Set(), new Set())
    assert.equal(out.defer.length, 1)
    assert.equal(out.defer[0].theme, 'concepts/lonely')
    assert.equal(out.promote.length, 0)
  })

  it('GRADUATE: theme that was prior-candidate and now has ≥2 sources', () => {
    const themes = new Map([['concepts/foo', new Set(['s1', 's2'])]])
    const out = classify(themes, new Set(['concepts/foo']), new Set())
    assert.equal(out.graduate.length, 1)
    assert.equal(out.graduate[0].theme, 'concepts/foo')
    assert.equal(out.promote.length, 0, 'graduates must NOT also appear in promote')
  })

  it('--force promotes single-source themes with forced flag', () => {
    const themes = new Map([['concepts/lonely', new Set(['s1'])]])
    const out = classify(themes, new Set(), new Set(), { force: true })
    assert.equal(out.promote.length, 1)
    assert.equal(out.promote[0].forced, true)
    assert.equal(out.defer.length, 0)
  })

  it('classifies a mixed batch correctly', () => {
    const themes = new Map([
      ['concepts/foo', new Set(['s1', 's2'])],       // promote (new)
      ['concepts/bar', new Set(['s1'])],             // defer
      ['concepts/baz', new Set(['s1', 's2', 's3'])], // graduate (was candidate)
      ['patterns/qux', new Set(['s4', 's5'])],       // promote (update — has page)
    ])
    const out = classify(
      themes,
      new Set(['concepts/baz']),
      new Set(['patterns/qux']),
    )
    const promoteThemes = out.promote.map((p) => p.theme).sort()
    assert.deepEqual(promoteThemes, ['concepts/foo', 'patterns/qux'])
    assert.equal(out.defer.length, 1)
    assert.equal(out.defer[0].theme, 'concepts/bar')
    assert.equal(out.graduate.length, 1)
    assert.equal(out.graduate[0].theme, 'concepts/baz')
  })

  it('MIN_SOURCES is 2', () => {
    assert.equal(MIN_SOURCES, 2)
  })
})

// ─── buildIndex against a fixture summaries dir ─────────────────────────────

describe('buildIndex', () => {
  let dir
  before(async () => {
    dir = await tmpDir('foundry-buildindex-')
    await fs.writeFile(path.join(dir, 'src-a.md'), [
      '---',
      'title: Source A',
      'type: summary',
      'related: [[concepts/tool-use]] [[concepts/memory]]',
      'key_concepts: [tool-use, memory]',
      '---',
      '',
      'body',
    ].join('\n'))
    await fs.writeFile(path.join(dir, 'src-b.md'), [
      '---',
      'title: Source B',
      'related: [[concepts/tool-use]]',
      'key_concepts: [tool-use, orchestration]',
      '---',
    ].join('\n'))
    await fs.writeFile(path.join(dir, 'src-c.md'), [
      '---',
      'related: [[concepts/orchestration]]',
      '---',
    ].join('\n'))
    // Non-md file should be ignored
    await fs.writeFile(path.join(dir, 'README.txt'), 'ignore me')
  })
  after(async () => { await fs.rm(dir, { recursive: true, force: true }) })

  it('builds inverted theme→summaries index across all .md files', async () => {
    const themes = await buildIndex(dir)
    // tool-use: in src-a (related + key_concepts) and src-b (related + key_concepts) → 2
    assert.deepEqual([...themes.get('tool-use')].sort(), ['src-a', 'src-b'])
    // concepts/tool-use: linked via wikilink in src-a and src-b → 2
    assert.deepEqual([...themes.get('concepts/tool-use')].sort(), ['src-a', 'src-b'])
    // memory: only src-a → 1
    assert.deepEqual([...themes.get('memory')], ['src-a'])
    // concepts/orchestration: only src-c → 1
    assert.deepEqual([...themes.get('concepts/orchestration')], ['src-c'])
  })

  it('end-to-end: buildIndex + classify produces correct PROMOTE/DEFER split', async () => {
    const themes = await buildIndex(dir)
    const out = classify(themes, new Set(), new Set())
    const promoteSet = new Set(out.promote.map((p) => p.theme))
    const deferSet = new Set(out.defer.map((d) => d.theme))
    // Themes appearing in ≥2 summaries
    assert.ok(promoteSet.has('tool-use'), 'tool-use should promote (2 sources)')
    assert.ok(promoteSet.has('concepts/tool-use'), 'concepts/tool-use should promote (2 sources)')
    // Themes appearing in only 1 summary
    assert.ok(deferSet.has('memory'), 'memory should defer (1 source)')
    assert.ok(deferSet.has('orchestration'), 'orchestration should defer (1 source)')
    assert.ok(deferSet.has('concepts/memory'), 'concepts/memory should defer (1 source)')
  })
})

// ─── ingest-dedup CLI behavior ──────────────────────────────────────────────

describe('ingest-dedup CLI', () => {
  let inbox
  beforeEach(async () => { inbox = await tmpDir('foundry-inbox-') })
  afterEach(async () => { await fs.rm(inbox, { recursive: true, force: true }) })

  function runDedup(extraArgs = []) {
    const r = spawnSync('node', [
      'scripts/ingest-dedup.mjs',
      '--inbox', inbox,
      '--dry-run',  // never moves files, never touches hash file
      '--no-ingest',
      ...extraArgs,
    ], { cwd: REPO, encoding: 'utf8' })
    return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '' }
  }

  it('reports empty inbox cleanly', () => {
    const { code, stdout } = runDedup()
    assert.equal(code, 0)
    assert.match(stdout, /Inbox is empty/)
  })

  it('routes a .pdf to papers/', async () => {
    await fs.writeFile(path.join(inbox, 'attention-is-all-you-need.pdf'), 'fake pdf bytes')
    const { code, stdout } = runDedup()
    assert.equal(code, 0)
    assert.match(stdout, /papers\s+attention-is-all-you-need\.pdf/)
  })

  it('routes a transcript filename to transcripts/', async () => {
    await fs.writeFile(path.join(inbox, 'meeting-granola-2026.md'), 'notes')
    const { code, stdout } = runDedup()
    assert.match(stdout, /transcripts\s+meeting-granola-2026\.md/)
  })

  it('routes a twitter thread to conversations/', async () => {
    await fs.writeFile(path.join(inbox, 'twitter-thread-on-agents.md'), 'tweets')
    const { code, stdout } = runDedup()
    assert.match(stdout, /conversations\s+twitter-thread-on-agents\.md/)
  })

  it('routes generic markdown to articles/ by default', async () => {
    await fs.writeFile(path.join(inbox, 'random-blog-post.md'), '# hello')
    const { code, stdout } = runDedup()
    assert.match(stdout, /articles\s+random-blog-post\.md/)
  })

  it('routes via content sniff: meeting-note frontmatter → transcripts/', async () => {
    await fs.writeFile(path.join(inbox, 'note.md'),
      '---\ntype: meeting-note\nsource: granola\n---\nbody')
    const { code, stdout } = runDedup()
    assert.match(stdout, /transcripts\s+note\.md/)
  })

  it('routes spec/api/docs filenames to framework-docs/', async () => {
    await fs.writeFile(path.join(inbox, 'mcp-spec.md'), 'spec content')
    const { code, stdout } = runDedup()
    assert.match(stdout, /framework-docs\s+mcp-spec\.md/)
  })

  it('handles multiple files in one run', async () => {
    await fs.writeFile(path.join(inbox, 'a.pdf'), 'a')
    await fs.writeFile(path.join(inbox, 'b.md'), 'b')
    const { code, stdout } = runDedup()
    assert.equal(code, 0)
    assert.match(stdout, /Ingested 2:/)
    assert.match(stdout, /papers\s+a\.pdf/)
    assert.match(stdout, /articles\s+b\.md/)
  })
})
