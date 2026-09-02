// Characterization tests for web/src/lib/rbac.ts.
//
// This module is the namespace gate in front of every web read/write route
// (`resolveIdentity` -> `canRead`/`canWrite`), and until now it had no test:
// the 2026-08-20 X-KB-Namespace bypass was fixed and verified by inspection.
// These tests pin CURRENT behaviour so the next change to the resolution order
// has to state its intent. Where the current behaviour is a known gap it is
// labelled GAP and cross-referenced to docs/NIGHTLY-BACKLOG.md rather than
// silently accepted.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// rbac.ts reads DEFAULT_KB_ROOT (process.env.KB_ROOT) at import time, so the
// env var has to be set before the dynamic import below.
const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'rbac-test-'))
process.env.KB_ROOT = KB_ROOT
const CONFIG = path.join(KB_ROOT, 'namespaces.json')

let rbac
before(async () => { rbac = await import('../src/lib/rbac.ts') })
after(() => fs.rmSync(KB_ROOT, { recursive: true, force: true }))

// loadConfig caches on mtimeMs; two writes inside the same millisecond would
// be served from cache, so bump the mtime explicitly after each write.
let tick = Date.now()
function writeConfig(cfg) {
  fs.writeFileSync(CONFIG, typeof cfg === 'string' ? cfg : JSON.stringify(cfg))
  tick += 1000
  fs.utimesSync(CONFIG, new Date(tick), new Date(tick))
}
function removeConfig() { fs.rmSync(CONFIG, { force: true }) }

// resolveIdentity only touches request.headers.get, so a WHATWG Request
// stands in for NextRequest.
function req(headers = {}) { return new Request('http://localhost/', { headers }) }

const WILDCARD = { read: ['*'], write: ['*'] }
const TWO_NS = {
  tokens: { 'sk-eng': 'engineering', 'sk-orphan': 'nowhere' },
  namespaces: {
    default: { read: ['*'], write: [] },
    engineering: { read: ['engineering', 'shared'], write: ['engineering'] },
    product: { read: ['product'], write: ['product'] },
  },
}

test('no namespaces.json: everyone is default with wildcard read/write', () => {
  removeConfig()
  const id = rbac.resolveIdentity(req({ 'x-kb-namespace': 'engineering' }))
  assert.deepEqual(id, { namespace: 'default', acl: WILDCARD, source: 'default' })
})

test('malformed namespaces.json falls back to the built-in default config', () => {
  writeConfig('{ this is not json')
  const id = rbac.resolveIdentity(req())
  assert.deepEqual(id, { namespace: 'default', acl: WILDCARD, source: 'default' })
})

test('X-KB-Namespace is honoured while no tokens are configured', () => {
  writeConfig({ namespaces: { default: WILDCARD, product: TWO_NS.namespaces.product } })
  const id = rbac.resolveIdentity(req({ 'x-kb-namespace': 'product' }))
  assert.equal(id.source, 'header')
  assert.equal(id.namespace, 'product')
  assert.deepEqual(id.acl, TWO_NS.namespaces.product)
  assert.equal(id.token, undefined)
})

test('X-KB-Namespace naming an unknown namespace falls through to default', () => {
  writeConfig({ namespaces: { default: WILDCARD } })
  const id = rbac.resolveIdentity(req({ 'x-kb-namespace': 'product' }))
  assert.equal(id.source, 'default')
  assert.equal(id.namespace, 'default')
})

test('X-KB-Namespace naming an Object.prototype member is not a namespace', () => {
  // cfg comes from JSON.parse; without Object.hasOwn, "constructor" resolves
  // to a truthy function and canRead later throws on acl.read.
  writeConfig({ namespaces: { default: WILDCARD } })
  for (const key of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
    const id = rbac.resolveIdentity(req({ 'x-kb-namespace': key }))
    assert.equal(id.source, 'default', key)
    assert.equal(rbac.canRead(id.acl, 'anything'), true, key)
  }
})

test('X-KB-Namespace is ignored once any token is configured (bypass regression)', () => {
  writeConfig(TWO_NS)
  const id = rbac.resolveIdentity(req({ 'x-kb-namespace': 'engineering' }))
  assert.equal(id.source, 'default')
  assert.equal(id.namespace, 'default')
  assert.equal(rbac.canWrite(id.acl, 'engineering'), false)
})

test('a configured Bearer token resolves to its namespace and ACL', () => {
  writeConfig(TWO_NS)
  const id = rbac.resolveIdentity(req({ authorization: 'Bearer sk-eng' }))
  assert.deepEqual(id, {
    namespace: 'engineering',
    acl: TWO_NS.namespaces.engineering,
    token: 'sk-eng',
    source: 'token',
  })
})

test('Bearer scheme is case-insensitive and tolerates extra whitespace', () => {
  writeConfig(TWO_NS)
  for (const auth of ['bearer sk-eng', 'BEARER   sk-eng', 'Bearer\tsk-eng']) {
    assert.equal(rbac.resolveIdentity(req({ authorization: auth })).namespace, 'engineering', auth)
  }
})

test('a token that maps to a namespace absent from `namespaces` is treated as unknown', () => {
  writeConfig(TWO_NS)
  const id = rbac.resolveIdentity(req({ authorization: 'Bearer sk-orphan' }))
  assert.equal(id.source, 'default')
  assert.equal(id.token, undefined)
})

test('a token equal to an Object.prototype key is not a credential', () => {
  writeConfig(TWO_NS)
  for (const tok of ['constructor', '__proto__', 'toString']) {
    assert.equal(rbac.resolveIdentity(req({ authorization: `Bearer ${tok}` })).source, 'default', tok)
  }
})

test('GAP: an unknown or missing token still receives the `default` ACL, not a denial', () => {
  // Pins the fail-open shape recorded under "One fail-closed requireAuth()
  // chokepoint" in docs/NIGHTLY-BACKLOG.md: with tokens configured, a bad
  // token is indistinguishable from an anonymous caller, and both get
  // whatever `namespaces.default` grants. Operators must therefore restrict
  // the default namespace themselves; the module does not do it for them.
  writeConfig(TWO_NS)
  const bad = rbac.resolveIdentity(req({ authorization: 'Bearer sk-not-real' }))
  const none = rbac.resolveIdentity(req())
  assert.deepEqual(bad, none)
  assert.equal(bad.namespace, 'default')
  assert.equal(rbac.canRead(bad.acl, 'engineering'), true)
})

test('a config with no `tokens`/`namespaces` keys is tolerated', () => {
  writeConfig({})
  const id = rbac.resolveIdentity(req({ authorization: 'Bearer anything' }))
  assert.deepEqual(id, { namespace: 'default', acl: WILDCARD, source: 'default' })
})

test('a config that omits `default` gets the wildcard default injected', () => {
  writeConfig({ tokens: {}, namespaces: { product: TWO_NS.namespaces.product } })
  const id = rbac.resolveIdentity(req())
  assert.equal(id.namespace, 'default')
  assert.deepEqual(id.acl, WILDCARD)
})

test('config is re-read when namespaces.json changes on disk', () => {
  writeConfig({ namespaces: { default: WILDCARD } })
  assert.equal(rbac.resolveIdentity(req({ 'x-kb-namespace': 'product' })).source, 'default')
  writeConfig({ namespaces: { default: WILDCARD, product: TWO_NS.namespaces.product } })
  assert.equal(rbac.resolveIdentity(req({ 'x-kb-namespace': 'product' })).source, 'header')
})

test('canRead/canWrite match exactly or via "*"; there is no glob syntax', () => {
  const acl = { read: ['engineering', 'shared'], write: ['eng*'] }
  assert.equal(rbac.canRead(acl, 'engineering'), true)
  assert.equal(rbac.canRead(acl, 'shared'), true)
  assert.equal(rbac.canRead(acl, 'product'), false)
  assert.equal(rbac.canRead(acl, 'Engineering'), false)
  assert.equal(rbac.canWrite(acl, 'engineering'), false)
  assert.equal(rbac.canWrite(acl, 'eng*'), true)
  assert.equal(rbac.canWrite({ read: [], write: ['*'] }, 'anything'), true)
  assert.equal(rbac.canWrite({ read: [], write: [] }, 'anything'), false)
})

test('namespaceForFile takes the first segment under raw/ or wiki/', () => {
  const s = path.sep
  assert.equal(rbac.namespaceForFile(['raw', 'engineering', 'notes.md'].join(s)), 'engineering')
  assert.equal(rbac.namespaceForFile(['wiki', 'product', 'launch.md'].join(s)), 'product')
  assert.equal(rbac.namespaceForFile(['wiki', 'product', 'deep', 'page.md'].join(s)), 'product')
  // fewer than three segments: the file sits directly under raw/ or wiki/
  assert.equal(rbac.namespaceForFile(['raw', 'notes.md'].join(s)), 'default')
  assert.equal(rbac.namespaceForFile('notes.md'), 'default')
  // only raw/ and wiki/ are namespaced roots
  assert.equal(rbac.namespaceForFile(['config', 'agents', 'x.yaml'].join(s)), 'default')
  // leading separator is tolerated
  assert.equal(rbac.namespaceForFile([`${s}wiki`, 'product', 'launch.md'].join(s)), 'product')
})

test('namespaceForFile treats the reserved subdirectories as default', () => {
  const s = path.sep
  for (const dir of ['webhooks', 'transcripts', 'twitter', 'architecture', 'syntheses']) {
    assert.equal(rbac.namespaceForFile(['raw', dir, 'x.md'].join(s)), 'default', dir)
    assert.equal(rbac.namespaceForFile(['wiki', dir, 'x.md'].join(s)), 'default', dir)
  }
})

test('filterReadable keeps only paths whose namespace the ACL can read', () => {
  const s = path.sep
  const acl = { read: ['engineering'], write: [] }
  const paths = [
    ['wiki', 'engineering', 'a.md'].join(s),
    ['wiki', 'product', 'b.md'].join(s),
    ['raw', 'c.md'].join(s), // default namespace, not readable here
  ]
  assert.deepEqual(rbac.filterReadable(paths, acl), [paths[0]])
  assert.deepEqual(rbac.filterReadable(paths, WILDCARD), paths)
})
