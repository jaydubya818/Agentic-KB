// Characterization tests for web/src/app/api/switch-vault/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed 2026-09-02/2026-09-05): route handler 9 of the
// enumerated 36, following the same pattern as tests/vaults-route.test.mjs
// and tests/repos-route.test.mjs (fresh KB_ROOT/HOME per file, GAPs pinned
// not fixed). This route needs no auth and sets only a display-preference
// cookie (the active vault path), not an identity/session cookie, so it is
// not part of the requireAuth() chokepoint entry.
//
// Unlike web/src/app/api/vaults/route.ts (which reads the Obsidian config
// itself), this route delegates to web/src/lib/vault.ts's isAllowedVault()/
// resolveVaultRoot(), which is exercised here for the first time -- no
// existing test imports that module. lib/vault.ts caches the allowlist by
// the Obsidian config's mtime (see allowedVaultPaths()), so tests call the
// exported invalidateVaultAllowlist() in beforeEach to avoid one test's
// HOME/config leaking into the next.
//
// One previously-undocumented gap pinned, not fixed: POST validates the
// vault path with both isAllowedVault() AND fs.existsSync() before
// switching, but GET's resolveVaultRoot() only checks isAllowedVault() --
// it never checks the path still exists on disk. So a vault that is
// removed from disk after being registered (and already selected via the
// cookie) keeps resolving successfully through GET, while the exact same
// path would be rejected by POST as "Vault path not found".
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'switch-vault-kb-'))
process.env.KB_ROOT = KB_ROOT
const HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'switch-vault-home-'))
const CONFIG_PATH = path.join(HOME, 'Library/Application Support/obsidian/obsidian.json')
const REAL_HOME = process.env.HOME

let GET, POST, NextRequest, invalidateVaultAllowlist
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ GET, POST } = await import('../src/app/api/switch-vault/route.ts'))
  ;({ invalidateVaultAllowlist } = await import('../src/lib/vault.ts'))
})

after(() => {
  process.env.HOME = REAL_HOME
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
  fs.rmSync(HOME, { recursive: true, force: true })
})

beforeEach(() => {
  process.env.HOME = HOME
  fs.rmSync(path.dirname(CONFIG_PATH), { recursive: true, force: true })
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true })
  invalidateVaultAllowlist()
})

function writeConfig(vaults) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true })
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ vaults }))
}

function postReq(body) {
  return new NextRequest('http://localhost/api/switch-vault', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function postRawReq(rawBody) {
  return new NextRequest('http://localhost/api/switch-vault', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: rawBody,
  })
}

function getReq(cookieValue) {
  const headers = cookieValue ? { cookie: `active_vault_path=${encodeURIComponent(cookieValue)}` } : {}
  return new NextRequest('http://localhost/api/switch-vault', { headers })
}

test('POST with a malformed JSON body is rejected 400, not an unhandled throw', async () => {
  const res = await POST(postRawReq('not json'))
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.error, 'Expected a JSON body with a vaultPath.')
})

test('POST with no vaultPath field is rejected 400 "Vault path not found"', async () => {
  const res = await POST(postReq({}))
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.error, 'Vault path not found')
})

test('POST with a vaultPath not in the allowlist is rejected even if it exists on disk', async () => {
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'switch-vault-unregistered-'))
  const res = await POST(postReq({ vaultPath: outside }))
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.error, 'Vault path not found')
})

test('POST with the default KB_ROOT switches successfully and sets the cookie', async () => {
  const res = await POST(postReq({ vaultPath: KB_ROOT }))
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.ok, true)
  assert.equal(json.path, KB_ROOT)
  assert.equal(json.name, path.basename(KB_ROOT))
  const setCookie = res.headers.get('set-cookie')
  assert.match(setCookie, /active_vault_path=/)
})

test('POST with a vault registered in the Obsidian config and present on disk succeeds', async () => {
  const vp = fs.mkdtempSync(path.join(os.tmpdir(), 'switch-vault-registered-'))
  writeConfig({ v1: { path: vp, ts: 1 } })
  const res = await POST(postReq({ vaultPath: vp }))
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.path, vp)
  assert.equal(json.name, path.basename(vp))
})

test('POST with a vault registered in the config but missing from disk is rejected', async () => {
  const vp = path.join(os.tmpdir(), 'switch-vault-deleted-does-not-exist')
  writeConfig({ v1: { path: vp, ts: 1 } })
  const res = await POST(postReq({ vaultPath: vp }))
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.error, 'Vault path not found')
})

test('GET with no cookie resolves to the default KB_ROOT', async () => {
  const json = await (await GET(getReq())).json()
  assert.equal(json.path, KB_ROOT)
  assert.equal(json.name, path.basename(KB_ROOT))
})

test('GET with a cookie naming an allowed, registered vault resolves to it', async () => {
  const vp = fs.mkdtempSync(path.join(os.tmpdir(), 'switch-vault-get-ok-'))
  writeConfig({ v1: { path: vp, ts: 1 } })
  const json = await (await GET(getReq(vp))).json()
  assert.equal(json.path, vp)
  assert.equal(json.name, path.basename(vp))
})

test('GET with a cookie naming an unregistered path falls back to the default vault', async () => {
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'switch-vault-get-unregistered-'))
  const json = await (await GET(getReq(outside))).json()
  assert.equal(json.path, KB_ROOT)
})

test('GAP: GET resolves a registered vault cookie to a path that no longer exists on disk, ' +
     'while POST would reject switching to that same path', async () => {
  const vp = path.join(os.tmpdir(), 'switch-vault-gap-deleted-after-registration')
  writeConfig({ v1: { path: vp, ts: 1 } })
  // Not created on disk at all -- stands in for "was created, registered, then removed".
  const getJson = await (await GET(getReq(vp))).json()
  assert.equal(getJson.path, vp)
  const postRes = await POST(postReq({ vaultPath: vp }))
  assert.equal(postRes.status, 400)
})
