// Characterization tests for web/src/app/api/vault-structure/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 25 of the enumerated 36.
// Unlike most siblings in this series, this route delegates to no shared
// lib beyond resolveVaultRoot()/DEFAULT_KB_ROOT (already exercised by
// vaults-route.test.mjs and switch-vault-route.test.mjs) -- buildSections(),
// titleFromFile(), and countFiles() are all private to this route file and
// get their first test coverage here.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'vault-structure-kb-'))
process.env.KB_ROOT = KB_ROOT

function write(relPath, content = 'body\n') {
  const full = path.join(KB_ROOT, relPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
}

let NextRequest
function req() {
  return new NextRequest('http://localhost/api/vault-structure')
}

let GET
before(async () => {
  ;({ NextRequest } = await import('next/server'))

  write('wiki/top-page.md', 'no frontmatter, no heading\n')
  write(
    'wiki/notes/with-frontmatter.md',
    ['---', 'title: "Frontmatter Title"', '---', '# Ignored H1', ''].join('\n')
  )
  write('wiki/notes/with-heading.md', ['# Heading Title', '', 'body', ''].join('\n'))
  write('wiki/notes/plain-file.md', 'no frontmatter, no heading\n')
  write('wiki/.obsidian/workspace.json', '{}')
  write('wiki/node_modules/pkg/index.md', 'should never be scanned\n')

  ;({ GET } = await import('../src/app/api/vault-structure/route.ts'))
})

after(() => {
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
})

test('top-level .md files under the content root form a "Pages" section', async () => {
  const json = await (await GET(req())).json()
  const pages = json.sections.find((s) => s.title === 'Pages')
  assert.ok(pages, 'expected a Pages section for top-level files')
  assert.deepEqual(pages.links.map((l) => l.href), ['/wiki/top-page'])
})

test('titleFromFile prefers frontmatter title over an H1 in the same file', async () => {
  const json = await (await GET(req())).json()
  const notes = json.sections.find((s) => s.title === 'Notes')
  const link = notes.links.find((l) => l.href === '/wiki/notes/with-frontmatter')
  assert.equal(link.label, 'Frontmatter Title')
})

test('titleFromFile falls back to the first H1 when there is no frontmatter title', async () => {
  const json = await (await GET(req())).json()
  const notes = json.sections.find((s) => s.title === 'Notes')
  const link = notes.links.find((l) => l.href === '/wiki/notes/with-heading')
  assert.equal(link.label, 'Heading Title')
})

test('titleFromFile falls back to a title-cased filename when neither frontmatter nor H1 is present', async () => {
  const json = await (await GET(req())).json()
  const notes = json.sections.find((s) => s.title === 'Notes')
  const link = notes.links.find((l) => l.href === '/wiki/notes/plain-file')
  assert.equal(link.label, 'Plain File')
})

test('SKIP_DIRS (.obsidian, node_modules) never become sections and their files are never counted', async () => {
  const json = await (await GET(req())).json()
  const titles = json.sections.map((s) => s.title)
  assert.ok(!titles.includes('.obsidian') && !titles.includes('Obsidian'))
  assert.ok(!titles.includes('node_modules') && !titles.includes('Node_modules'))
  // 4 real files seeded in `before`; the node_modules/pkg/index.md decoy must not be counted.
  assert.equal(json.totalFiles, 4)
})

test('a subdirectory becomes a section titled by its capitalized name', async () => {
  const json = await (await GET(req())).json()
  const notes = json.sections.find((s) => s.title === 'Notes')
  assert.ok(notes, 'expected a Notes section for wiki/notes/')
  assert.equal(notes.links.length, 3)
})

test('wiki/ is preferred as the content root when it exists; the bare vault root is used when it does not', async () => {
  const wikiDir = path.join(KB_ROOT, 'wiki')
  const backupDir = path.join(KB_ROOT, 'wiki-backup-for-test')
  fs.renameSync(wikiDir, backupDir)
  try {
    const json = await (await GET(req())).json()
    assert.equal(json.contentRoot, KB_ROOT)
  } finally {
    fs.renameSync(backupDir, wikiDir)
  }
})

test('isAgenticKB is true for the default KB_ROOT vault', async () => {
  const json = await (await GET(req())).json()
  assert.equal(json.isAgenticKB, true)
  assert.equal(json.vaultName, path.basename(KB_ROOT))
})

// GAP: MAX_LINKS_PER_SECTION (40) caps the links shown per section, but
// countFiles() -- used for the top-level totalFiles count -- has no such
// cap. A section with more than 40 files under it reports a truncated
// links[] alongside a totalFiles figure that still counts every one of
// them, so the sidebar's own numbers disagree with what it renders: the
// displayed links undercount totalFiles with no indication a cap was hit.
// Pinned, not fixed -- whether to surface the truncation (e.g. a "N more"
// affordance) is a product decision, not a bug this route introduced.
test('GAP: a section truncated at 40 links still has every file counted in totalFiles', async () => {
  for (let i = 0; i < 45; i++) {
    write(`wiki/overflow/file-${String(i).padStart(2, '0')}.md`)
  }
  const json = await (await GET(req())).json()
  const overflow = json.sections.find((s) => s.title === 'Overflow')
  assert.equal(overflow.links.length, 40, 'section links are capped at MAX_LINKS_PER_SECTION')
  assert.equal(
    json.totalFiles,
    4 + 45,
    'totalFiles counts all 45 overflow files plus the 4 original fixture files, uncapped'
  )
})
