// Sofie vault-writeback transactional tests.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  assertVaultWriteAllowed,
  planSofieVaultOps,
  runSofieVaultFanout,
  vaultRoot,
} from '../../lib/agent-runtime/vault-writeback.mjs'

function makeFakeVault() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sofie-vault-'))
  process.env.OBSIDIAN_VAULT_ROOT = dir
  return dir
}

function makeFakeKb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sofie-kb-'))
  fs.mkdirSync(path.join(dir, 'logs'), { recursive: true })
  return dir
}

const sofieContract = {
  agent_id: 'sofie',
  tier: 'lead',
  contract_hash: 'abcd1234',
  vault_writes: [
    '06 - Decisions/**',
    '07 - Tasks/Action Tracker.md',
    '04 - Sessions/**',
    '01 - Clients/**',
    'Memory.md',
  ],
}

const noVaultContract = { agent_id: 'gsd-executor', tier: 'worker' }

test('vault: assertVaultWriteAllowed allows matching paths', () => {
  const r = assertVaultWriteAllowed('06 - Decisions/2026-04-24-x.md', sofieContract)
  assert.equal(r.allowed, true)
})

test('vault: assertVaultWriteAllowed blocks non-matching paths', () => {
  const r = assertVaultWriteAllowed('Other/foo.md', sofieContract)
  assert.equal(r.allowed, false)
})

test('vault: agent without vault_writes blocked entirely', () => {
  const r = assertVaultWriteAllowed('06 - Decisions/x.md', noVaultContract)
  assert.equal(r.allowed, false)
  assert.match(r.reason, /no vault_writes/)
})

test('vault: traversal exploits rejected', () => {
  const seeds = [
    '../etc/passwd',
    '06 - Decisions/../../etc/passwd',
    '/etc/passwd',
    '06 - Decisions/%2e%2e/pwn.md',
    '06 - Decisions/\\..\\pwn.md',
    '06 - Decisions/\0pwn.md',
  ]
  for (const s of seeds) {
    const r = assertVaultWriteAllowed(s, sofieContract)
    assert.equal(r.allowed, false, `LEAK: ${JSON.stringify(s)}`)
  }
})

test('vault: planSofieVaultOps maps payload extras to ops', () => {
  const ops = planSofieVaultOps({
    decisions: [{ title: 'Adopt agent runtime', body: 'Adopted.', rationale: 'Tests green' }],
    actions: [{ task: 'Ship runtime', owner: 'jay', deadline: '2026-04-30' }],
    sessionSummary: { title: 'Q3 planning', body: 'Decided X.' },
    clientUpdates: [{ client: 'Acme', body: 'Closed deal.' }],
  })
  const kinds = ops.map(o => `${o.kind}:${o.path.split('/')[0]}`)
  assert.ok(kinds.some(k => k.startsWith('create:06 - Decisions')))
  assert.ok(kinds.some(k => k.startsWith('append:07 - Tasks')))
  assert.ok(kinds.some(k => k.startsWith('create:04 - Sessions')))
  assert.ok(kinds.some(k => k.startsWith('append:01 - Clients')))
})

test('vault: empty payload produces no ops', () => {
  assert.deepEqual(planSofieVaultOps({}), [])
  assert.deepEqual(planSofieVaultOps({ decisions: [], actions: [] }), [])
})

test('vault: runSofieVaultFanout commits decisions/actions atomically', () => {
  const vault = makeFakeVault()
  const kb = makeFakeKb()
  const r = runSofieVaultFanout(kb, sofieContract, {
    decisions: [{ title: 'Ship Sofie vault writeback', body: 'Approved.' }],
    actions: [{ task: 'Run sofie-kb-digest', owner: 'sofie' }],
  })
  assert.equal(r.ok, true, JSON.stringify(r))
  assert.equal(r.committed, 2)

  const decisionFiles = fs.readdirSync(path.join(vault, '06 - Decisions'))
  assert.equal(decisionFiles.length, 1)
  const decisionContent = fs.readFileSync(path.join(vault, '06 - Decisions', decisionFiles[0]), 'utf8')
  assert.match(decisionContent, /Ship Sofie vault writeback/)

  const actions = fs.readFileSync(path.join(vault, '07 - Tasks/Action Tracker.md'), 'utf8')
  assert.match(actions, /Run sofie-kb-digest/)
})

test('vault: fanout vault_path matches contract vault_writes only', () => {
  const vault = makeFakeVault()
  const kb = makeFakeKb()
  // Contract that does NOT allow 04 - Sessions
  const restricted = { ...sofieContract, vault_writes: ['06 - Decisions/**'] }
  const r = runSofieVaultFanout(kb, restricted, {
    decisions: [{ title: 'D' }],
    sessionSummary: { title: 'should-fail', body: 'x' },
  })
  assert.equal(r.ok, false)
  // Decision should not have committed even though guard passed for it (atomic)
  assert.ok(!fs.existsSync(path.join(vault, '06 - Decisions')) || fs.readdirSync(path.join(vault, '06 - Decisions')).length === 0)
})

test('vault: memoryUpdate routes to Memory.md when contract allows', () => {
  const vault = makeFakeVault()
  const kb = makeFakeKb()
  const r = runSofieVaultFanout(kb, sofieContract, {
    memoryUpdate: { heading: 'Goal shift', body: 'Q3 priority pivot to onboarding.' },
  })
  assert.equal(r.ok, true, JSON.stringify(r))
  const memContent = fs.readFileSync(path.join(vault, 'Memory.md'), 'utf8')
  assert.match(memContent, /Goal shift/)
  assert.match(memContent, /Q3 priority pivot/)
})

test('vault: memoryUpdate accepts plain string', () => {
  const vault = makeFakeVault()
  const kb = makeFakeKb()
  const r = runSofieVaultFanout(kb, sofieContract, {
    memoryUpdate: 'Quick note: switched to vault-canonical Memory.md.',
  })
  assert.equal(r.ok, true)
  const memContent = fs.readFileSync(path.join(vault, 'Memory.md'), 'utf8')
  assert.match(memContent, /Quick note/)
})

test('vault: empty memoryUpdate produces no op', () => {
  const ops = planSofieVaultOps({ memoryUpdate: '   ' })
  assert.equal(ops.length, 0)
  const ops2 = planSofieVaultOps({ memoryUpdate: { body: '' } })
  assert.equal(ops2.length, 0)
})

test('vault: vaultRoot env override works', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vault-root-'))
  const prev = process.env.OBSIDIAN_VAULT_ROOT
  process.env.OBSIDIAN_VAULT_ROOT = tmp
  assert.equal(vaultRoot(), tmp)
  process.env.OBSIDIAN_VAULT_ROOT = prev
})
