// Characterization tests for web/src/app/api/vaults/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed 2026-09-02/2026-09-05): route handler 7 of the
// enumerated 36, following the same pattern as tests/pending-count-route.test.mjs
// and tests/article-route.test.mjs (fresh fixture directory per file, GAPs
// pinned not fixed). This route needs no auth and performs no writes, so
// it is not part of the requireAuth() / atomicWrite chokepoint entries.
//
// The route reads a global Obsidian config via `os.homedir()` rather than
// an env var, so these tests redirect it by setting process.env.HOME to a
// scratch directory before each call -- `os.homedir()` on POSIX falls back
// to the HOME env var, and the route re-reads it fresh on every GET (no
// import-time caching), so no cache-busting import trick is needed.
//
// One previously-undocumented behaviour pinned here, not a bug: `walk()`
// stops recursing at depth > 6, so a vault nested 7+ directories deep from
// its scan root silently loses files from its fileCount with no warning.
import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'vaults-route-test-'))
const CONFIG_PATH = path.join(HOME, 'Library/Application Support/obsidian/obsidian.json')
const REAL_HOME = process.env.HOME

let GET
before(async () => {
  ;({ GET } = await import('../src/app/api/vaults/route.ts'))
})

after(() => {
  process.env.HOME = REAL_HOME
  fs.rmSync(HOME, { recursive: true, force: true })
})

beforeEach(() => {
  process.env.HOME = HOME
  fs.rmSync(path.dirname(CONFIG_PATH), { recursive: true, force: true })
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true })
})

function writeConfig(vaults) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true })
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ vaults }))
}

function makeVaultDir(name) {
  const vaultPath = fs.mkdtempSync(path.join(os.tmpdir(), `vault-${name}-`))
  return vaultPath
}

function writeMd(vaultPath, rel) {
  const full = path.join(vaultPath, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, '# x')
}

async function getVaults() {
  const json = await (await GET()).json()
  return json.vaults
}

test('no obsidian.json at all returns an empty vaults array', async () => {
  assert.deepEqual(await getVaults(), [])
})

test('a present but invalid JSON config returns an empty vaults array', async () => {
  fs.writeFileSync(CONFIG_PATH, '{not valid json')
  assert.deepEqual(await getVaults(), [])
})

test('a single vault with no wiki/ subdir counts .md files from the vault root', async () => {
  const vp = makeVaultDir('a')
  writeMd(vp, 'note1.md')
  writeMd(vp, 'sub/note2.md')
  writeConfig({ v1: { path: vp, ts: 1 } })
  const vaults = await getVaults()
  assert.equal(vaults.length, 1)
  assert.equal(vaults[0].id, 'v1')
  assert.equal(vaults[0].name, path.basename(vp))
  assert.equal(vaults[0].path, vp)
  assert.equal(vaults[0].fileCount, 2)
})

test('when a wiki/ subdir exists, only files under wiki/ are counted -- ' +
     'root-level files outside it are ignored', async () => {
  const vp = makeVaultDir('b')
  writeMd(vp, 'outside.md')
  writeMd(vp, 'wiki/inside.md')
  writeConfig({ v1: { path: vp, ts: 1 } })
  const vaults = await getVaults()
  assert.equal(vaults[0].fileCount, 1)
})

test('SKIP_DIRS (.obsidian, .git, node_modules, .next) are excluded from the count', async () => {
  const vp = makeVaultDir('c')
  writeMd(vp, 'counted.md')
  writeMd(vp, '.obsidian/skip.md')
  writeMd(vp, '.git/skip.md')
  writeMd(vp, 'node_modules/skip.md')
  writeMd(vp, '.next/skip.md')
  writeConfig({ v1: { path: vp, ts: 1 } })
  const vaults = await getVaults()
  assert.equal(vaults[0].fileCount, 1)
})

test('non-.md files are not counted', async () => {
  const vp = makeVaultDir('d')
  writeMd(vp, 'real.md')
  fs.writeFileSync(path.join(vp, 'ignored.txt'), 'x')
  writeConfig({ v1: { path: vp, ts: 1 } })
  const vaults = await getVaults()
  assert.equal(vaults[0].fileCount, 1)
})

test('a vault whose path does not exist on disk contributes fileCount 0, not an error', async () => {
  writeConfig({ v1: { path: path.join(os.tmpdir(), 'does-not-exist-vault'), ts: 1 } })
  const vaults = await getVaults()
  assert.equal(vaults.length, 1)
  assert.equal(vaults[0].fileCount, 0)
})

test('multiple vaults are each mapped independently, keyed by their config id', async () => {
  const vp1 = makeVaultDir('e1')
  const vp2 = makeVaultDir('e2')
  writeMd(vp1, 'one.md')
  writeMd(vp2, 'two.md')
  writeMd(vp2, 'three.md')
  writeConfig({ alpha: { path: vp1, ts: 1 }, beta: { path: vp2, ts: 2 } })
  const vaults = await getVaults()
  assert.equal(vaults.length, 2)
  const byId = Object.fromEntries(vaults.map(v => [v.id, v]))
  assert.equal(byId.alpha.fileCount, 1)
  assert.equal(byId.beta.fileCount, 2)
})

test('GAP: a file nested more than 6 directories below the scan root is silently ' +
     'excluded from fileCount, with no error or indication of truncation', async () => {
  const vp = makeVaultDir('f')
  // depth 0 = vp itself; d1..d6 are walked (depth 1..6), but walk() bails
  // before reading the contents of a depth-7 directory.
  const shallow = path.join('d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'shallow.md')
  const deep = path.join('d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'deep.md')
  writeMd(vp, shallow)
  writeMd(vp, deep)
  writeConfig({ v1: { path: vp, ts: 1 } })
  const vaults = await getVaults()
  // A correct, unbounded walk would find 2; the depth cap silently drops
  // the one nested one level further.
  assert.equal(vaults[0].fileCount, 1)
})
