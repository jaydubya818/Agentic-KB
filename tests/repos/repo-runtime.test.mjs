// Test suite for repo-runtime module.
// Runs against a throwaway fixture KB in a temp dir.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'node:child_process'

import * as repoRt from '../../lib/repo-runtime/index.mjs'
import * as agentRt from '../../lib/agent-runtime/index.mjs'

// ─── Fixture setup ────────────────────────────────────────────────────────

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-rt-'))
  // Create minimal directory structure
  const dirs = [
    'config/repos',
    'config/agents',
    'wiki/repos/test-repo/canonical',
    'wiki/repos/test-repo/repo-docs',
    'wiki/repos/test-repo/agent-memory/worker/w1',
    'wiki/repos/test-repo/agent-memory/lead/l1',
    'wiki/repos/test-repo/tasks',
    'wiki/repos/test-repo/rewrites/spec',
    'wiki/repos/test-repo/bus/discovery',
    'wiki/repos/test-repo/bus/escalation',
  ]
  for (const d of dirs) fs.mkdirSync(path.join(root, d), { recursive: true })

  fs.writeFileSync(path.join(root, 'config/agents/w1.yaml'), `
agent_id: w1
tier: worker
domain: eng
context_policy:
  budget_bytes: 20480
  include: []
allowed_writes:
  - wiki/repos/test-repo/**
forbidden_paths: []
`.trim())

  return root
}

// ─── 1. Registry tests ────────────────────────────────────────────────────

test('loadRegistry returns empty on missing file', () => {
  const root = makeFixture()
  const records = repoRt.loadRegistry(root)
  assert.equal(Array.isArray(records), true)
  assert.equal(records.length, 0)
})

test('a damaged registry throws instead of reading as empty', () => {
  // Regression: loadRegistry used to `catch { return [] }`, so a truncated
  // registry.json was indistinguishable from "no repos registered yet". The
  // next upsertRepo then wrote a one-record registry over the damage and every
  // other repo was gone — silently, exit status 0.
  const root = makeFixture()
  repoRt.upsertRepo(root, { repo_name: 'alpha', status: 'active' })
  repoRt.upsertRepo(root, { repo_name: 'beta', status: 'active' })
  repoRt.upsertRepo(root, { repo_name: 'gamma', status: 'active' })

  const full = path.join(root, 'config/repos/registry.json')
  const good = fs.readFileSync(full, 'utf8')
  fs.writeFileSync(full, good.slice(0, Math.floor(good.length / 2)))

  assert.throws(() => repoRt.loadRegistry(root), /not valid JSON/)
  assert.throws(() => repoRt.listRepos(root), /not valid JSON/)
  assert.throws(
    () => repoRt.upsertRepo(root, { repo_name: 'delta', status: 'active' }),
    /not valid JSON/,
  )
  // The damaged file must still be on disk, not replaced by a one-repo file.
  assert.equal(fs.readFileSync(full, 'utf8'), good.slice(0, Math.floor(good.length / 2)))

  // An unrecognised shape is damage too.
  fs.writeFileSync(full, JSON.stringify({ version: '1.0', repos: 'nope' }))
  assert.throws(() => repoRt.loadRegistry(root), /unrecognised shape/)

  // A hand-initialised wrapper with no repos key is not damage.
  fs.writeFileSync(full, JSON.stringify({ version: '1.0' }))
  assert.deepEqual(repoRt.loadRegistry(root), [])
})

test('upsertRepo creates new entry', () => {
  const root = makeFixture()
  const repo = repoRt.upsertRepo(root, {
    repo_name: 'test-repo',
    status: 'active',
    owner: 'jay',
    visibility: 'private',
  })
  assert.equal(repo.repo_name, 'test-repo')
  assert.equal(repo.status, 'active')
  const records = repoRt.loadRegistry(root)
  assert.equal(records.length, 1)
})

test('listRepos filters by status', () => {
  const root = makeFixture()
  repoRt.upsertRepo(root, { repo_name: 'active-1', status: 'active', owner: 'jay' })
  repoRt.upsertRepo(root, { repo_name: 'pending-1', status: 'pending', owner: 'jay' })
  repoRt.upsertRepo(root, { repo_name: 'active-2', status: 'active', owner: 'jay' })
  const all = repoRt.listRepos(root)
  assert.equal(all.length, 3)
  const active = all.filter(r => r.status === 'active')
  assert.equal(active.length, 2)
})

test('markSynced updates last_sync_at and sets status', () => {
  const root = makeFixture()
  repoRt.upsertRepo(root, { repo_name: 'test-repo', status: 'pending', owner: 'jay' })
  const updated = repoRt.markSynced(root, 'test-repo', { commit_sha: 'abc123', file_count: 42 })
  assert.equal(updated.status, 'active')
  assert.equal(updated.last_synced_commit, 'abc123')
  assert.equal(updated.markdown_file_count, 42)
  assert.ok(updated.last_sync_at)
})

test('saveRegistry writes atomically and preserves wrapper metadata', () => {
  const root = makeFixture()
  const regPath = path.join(root, 'config/repos/registry.json')
  fs.writeFileSync(regPath, JSON.stringify({ version: '2.3', custom_note: 'keep-me', repos: [] }, null, 2))

  repoRt.upsertRepo(root, { repo_name: 'r1', status: 'active', owner: 'jay' })

  const wrapper = JSON.parse(fs.readFileSync(regPath, 'utf8'))
  assert.equal(wrapper.version, '2.3', 'wrapper version survives saves')
  assert.equal(wrapper.custom_note, 'keep-me', 'unknown wrapper fields survive saves')
  assert.equal(wrapper.repos.length, 1)
  assert.ok(wrapper.updated_at)

  const leftovers = fs.readdirSync(path.dirname(regPath)).filter(f => f.includes('.tmp-'))
  assert.deepEqual(leftovers, [], 'no tmp files left behind by the atomic write')
})

test('upsertRepo serialises against a concurrent holder of the registry lock', () => {
  // upsertRepo is a load -> mutate -> save over one shared file. Uncontended
  // it is fine; with `POST /api/repos` racing syncRepo's markSynced the loser
  // read a pre-update snapshot and wrote its own records array over the
  // winner's, silently dropping a repo.
  const root = makeFixture()
  const regPath = path.join(root, 'config/repos/registry.json')

  const HOLD_MS = 250
  const locksMod = new URL('../../lib/agent-runtime/locks.mjs', import.meta.url).href
  const regModUrl = new URL('../../lib/repo-runtime/registry.mjs', import.meta.url).href
  // Child holds repo-registry, lands 'from-child', then releases.
  const child = spawn(process.execPath, ['-e', `
    Promise.all([
      import(${JSON.stringify(locksMod)}),
      import(${JSON.stringify(regModUrl)}),
    ]).then(([{ acquireLock }, reg]) => {
      const lock = acquireLock(${JSON.stringify(root)}, 'repo-registry')
      reg.saveRegistry(${JSON.stringify(root)}, [{ repo_name: 'from-child', status: 'active' }])
      setTimeout(() => { lock.release(); process.exit(0) }, ${HOLD_MS})
    })
  `], { stdio: ['ignore', 'pipe', 'pipe'] })

  try {
    const lockFile = path.join(root, '.locks', 'repo-registry.lock')
    const deadline = Date.now() + 5000
    while (!fs.existsSync(lockFile) && Date.now() < deadline) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10)
    }
    assert.ok(fs.existsSync(lockFile), 'child never acquired the registry lock')

    const started = Date.now()
    repoRt.upsertRepo(root, { repo_name: 'from-parent', status: 'active' })
    const waited = Date.now() - started

    assert.ok(waited >= HOLD_MS / 2, `upsertRepo did not wait for the lock (${waited}ms)`)
    const names = JSON.parse(fs.readFileSync(regPath, 'utf8')).repos.map(r => r.repo_name)
    assert.deepEqual(names.sort(), ['from-child', 'from-parent'], 'neither write was lost')
  } finally {
    child.kill()
  }
})

// ─── 2. Paths tests ──────────────────────────────────────────────────────

test('repoWikiRoot returns correct path', () => {
  const result = repoRt.repoWikiRoot('test-repo')
  assert.equal(result, 'wiki/repos/test-repo')
})

test('repoDocsRoot returns correct path', () => {
  const result = repoRt.repoDocsRoot('test-repo')
  assert.equal(result, 'wiki/repos/test-repo/repo-docs')
})

test('importedDocPath maps source to repo-docs', () => {
  const result = repoRt.importedDocPath('test-repo', 'src/index.ts')
  assert.match(result, /wiki\/repos\/test-repo\/repo-docs\/src/)
})

test('importedDocPath rejects traversal and absolute source paths', () => {
  const bad = [
    'docs/../../evil.md',
    '../outside.md',
    '/etc/passwd.md',
    'docs//double.md',
    'docs/./dot.md',
    'docs/nul\0l.md',
    '..\\win\\style.md',
    '',
  ]
  for (const p of bad) {
    assert.throws(() => repoRt.importedDocPath('test-repo', p), /invalid source path/, `should reject: ${JSON.stringify(p)}`)
  }
  // Legitimate nested paths still map through
  assert.equal(
    repoRt.importedDocPath('test-repo', 'docs/guide/setup.md'),
    'wiki/repos/test-repo/repo-docs/docs/guide/setup.md',
  )
})

test('isImportedDoc detects imported paths correctly', () => {
  assert.equal(repoRt.isImportedDoc('wiki/repos/test-repo/repo-docs/src/index.md'), true)
  assert.equal(repoRt.isImportedDoc('wiki/repos/test-repo/canonical/PRD.md'), false)
  assert.equal(repoRt.isImportedDoc('wiki/other/index.md'), false)
})

// ─── 3. Metadata tests ────────────────────────────────────────────────────

test('makeImportedFrontmatter generates valid YAML', () => {
  const fm = repoRt.makeImportedFrontmatter({
    repo_name: 'test-repo',
    repo_visibility: 'private',
    branch: 'main',
    commit_sha: 'abc123',
    source_path: 'src/index.ts',
    source_url: 'https://github.com/test/repo/blob/main/src/index.ts',
  })
  assert.equal(fm.repo_name, 'test-repo')
  assert.equal(fm.branch, 'main')
  assert.equal(fm.commit_sha, 'abc123')
})

test('parseImportedMeta round-trips frontmatter', () => {
  const fm = repoRt.makeImportedFrontmatter({
    repo_name: 'test-repo',
    branch: 'main',
    commit_sha: 'abc123',
    source_path: 'src/index.ts',
  })
  const ser = `---\n${Object.entries(fm).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n\nContent here`
  const parsed = repoRt.parseImportedMeta(ser)
  assert.equal(parsed.meta.repo_name, 'test-repo')
  assert.equal(parsed.body.trim(), 'Content here')
})

test('isImportedContent detects frontmatter marker', () => {
  const withMarker = `---\nsource_type: github\nrepo_name: test\n---\nBody`
  const withoutMarker = `---\ntitle: Test\n---\nBody`
  assert.equal(repoRt.isImportedContent(withMarker), true)
  assert.equal(repoRt.isImportedContent(withoutMarker), false)
})

// ─── 4. Writeback tests ──────────────────────────────────────────────────

test('appendRepoProgress creates file and appends entries', () => {
  const root = makeFixture()
  repoRt.appendRepoProgress(root, 'test-repo', 'First entry', 'w1')
  // repoWikiRoot(agentId, repoName) returns wiki/repos/{repoName}
  const progressPath = path.join(root, 'wiki/repos/test-repo/progress.md')
  assert.ok(fs.existsSync(progressPath), `Path should exist: ${progressPath}`)
  const content = fs.readFileSync(progressPath, 'utf8')
  assert.match(content, /First entry/)
})

test('writeRepoTaskLog appends with agent header', () => {
  const root = makeFixture()
  const taskId = 'task-001'
  repoRt.writeRepoTaskLog(root, 'test-repo', taskId, 'w1', 'Completed task')
  // repoTasksRoot(agentId, repoName) returns wiki/repos/{repoName}/tasks
  const tasksDir = path.join(root, 'wiki/repos/test-repo/tasks')
  assert.ok(fs.existsSync(tasksDir))
  const files = fs.readdirSync(tasksDir, { recursive: true })
  assert.ok(files.length > 0)
})

test('second appendRepoProgress does not overwrite', () => {
  const root = makeFixture()
  const agentId = 'w1'
  repoRt.appendRepoProgress(root, 'test-repo', 'First entry', agentId)
  repoRt.appendRepoProgress(root, 'test-repo', 'Second entry', agentId)
  const progressPath = path.join(root, 'wiki/repos/test-repo/progress.md')
  const content = fs.readFileSync(progressPath, 'utf8')
  assert.match(content, /First entry/)
  assert.match(content, /Second entry/)
})

test('closeRepoTask enforces required close-task fields', () => {
  const root = makeFixture()
  const contract = agentRt.validateContract({
    agent_id: 'w1',
    tier: 'worker',
    domain: 'eng',
    allowed_writes: ['wiki/repos/test-repo/**'],
    forbidden_paths: [],
    close_policy: {
      required_fields: ['taskLogEntry'],
      at_least_one_of: [],
      require_active_task: true,
    },
  })

  const result = repoRt.closeRepoTask(root, 'test-repo', contract, {
    discoveries: [{ body: 'missing task log' }],
  })

  assert.equal(result.ok, false)
  assert.equal(result.error, 'close-policy')
  assert.match(result.trace.close_policy_errors[0], /taskLogEntry/)
})

test('closeRepoTask commits repo writes and bus publications atomically', () => {
  const root = makeFixture()
  const contract = agentRt.validateContract({
    agent_id: 'w1',
    tier: 'worker',
    domain: 'eng',
    allowed_writes: ['wiki/repos/test-repo/**'],
    forbidden_paths: [],
    close_policy: {
      required_fields: ['taskLogEntry'],
      at_least_one_of: [],
      require_active_task: true,
    },
  })

  const result = repoRt.closeRepoTask(root, 'test-repo', contract, {
    project: 'test-repo',
    taskLogEntry: 'Closed repo task',
    hotUpdate: 'Repo hot memory',
    discoveries: [{ body: 'Repo discovery' }],
    escalations: [{ to: 'l1', body: 'Repo escalation' }],
  })

  assert.equal(result.ok, true)
  assert.equal(result.trace.bus_items.length, 2)
  assert.match(fs.readFileSync(path.join(root, 'wiki/repos/test-repo/progress.md'), 'utf8'), /Closed repo task/)
  assert.match(fs.readFileSync(path.join(root, 'wiki/repos/test-repo/agent-memory/worker/w1/hot.md'), 'utf8'), /Repo hot memory/)
  assert.equal(repoRt.listRepoBusItems(root, 'test-repo', 'discovery').length, 1)
  assert.equal(repoRt.listRepoBusItems(root, 'test-repo', 'escalation').length, 1)
})

test('closeRepoTask honours payload.dryRun and commits nothing', () => {
  // Regression: the agent-runtime twin closeTask short-circuits on
  // `payload.dryRun === true`, but closeRepoTask had no such branch, so
  // `dryRun` was just an unrecognised key and the call took the repo lock and
  // committed for real. Nothing in the return value revealed it either --
  // `dryRun` was absent and `committed` was true. Pre-fix this test fails on
  // the very first assertion with `committed: true`.
  const root = makeFixture()
  const contract = agentRt.validateContract({
    agent_id: 'w1',
    tier: 'worker',
    domain: 'eng',
    allowed_writes: ['wiki/repos/test-repo/**'],
    forbidden_paths: [],
    close_policy: {
      required_fields: ['taskLogEntry'],
      at_least_one_of: [],
      require_active_task: true,
    },
  })

  const result = repoRt.closeRepoTask(root, 'test-repo', contract, {
    dryRun: true,
    project: 'test-repo',
    taskLogEntry: 'DRY RUN ONLY',
    hotUpdate: 'DRY RUN hot memory',
    discoveries: [{ body: 'DRY RUN discovery' }],
    escalations: [{ to: 'l1', body: 'DRY RUN escalation' }],
  })

  // The call reports itself as a dry run and returns a plan, not a commit.
  assert.equal(result.dryRun, true)
  assert.equal(result.committed, undefined)
  assert.equal(result.ok, true)
  assert.equal(result.wouldSucceed, true)
  assert.ok(Array.isArray(result.planned) && result.planned.length > 0)
  assert.deepEqual(result.rejected, [])
  assert.equal(result.summary.bus_publishes, 2)

  // Nothing landed on disk, and no bus item was published.
  assert.equal(fs.existsSync(path.join(root, 'wiki/repos/test-repo/progress.md')), false)
  assert.equal(
    fs.existsSync(path.join(root, 'wiki/repos/test-repo/agent-memory/worker/w1/hot.md')),
    false,
  )
  assert.equal(repoRt.listRepoBusItems(root, 'test-repo', 'discovery').length, 0)
  assert.equal(repoRt.listRepoBusItems(root, 'test-repo', 'escalation').length, 0)

  // A dry run must not consume the ability to do the real close afterwards.
  const real = repoRt.closeRepoTask(root, 'test-repo', contract, {
    project: 'test-repo',
    taskLogEntry: 'The real close',
  })
  assert.equal(real.ok, true)
  assert.equal(real.committed, true)
  assert.match(
    fs.readFileSync(path.join(root, 'wiki/repos/test-repo/progress.md'), 'utf8'),
    /The real close/,
  )
})

test('a dry run that violates close policy reports ok:false without writing', () => {
  // `ok` tracks the plan: a plan that would be rejected is not a successful
  // call, matching closeTask's `ok: plan.wouldSucceed !== false`. Uses a
  // close-policy violation (a missing required field) rather than a path
  // rejection, because repo-scoped writes fall back to an implicit
  // wiki/repos/<repo>/** allowance -- see the repo-scoped fallback tests below.
  const root = makeFixture()
  const contract = agentRt.validateContract({
    agent_id: 'w1',
    tier: 'worker',
    domain: 'eng',
    allowed_writes: ['wiki/repos/test-repo/**'],
    forbidden_paths: [],
    close_policy: {
      required_fields: ['taskLogEntry'],
      at_least_one_of: [],
      require_active_task: true,
    },
  })

  const result = repoRt.closeRepoTask(root, 'test-repo', contract, {
    dryRun: true,
    project: 'test-repo',
    // taskLogEntry deliberately omitted -- required_fields violation.
  })

  assert.equal(result.dryRun, true)
  assert.equal(result.ok, false)
  assert.equal(result.wouldSucceed, false)
  assert.equal(result.error, 'close-policy')
  assert.ok(result.rejected.length > 0)
  assert.equal(fs.existsSync(path.join(root, 'wiki/repos/test-repo/progress.md')), false)
})

test('closeRepoTask fails closed and rolls back when the repo lock is held', () => {
  const root = makeFixture()
  const contract = agentRt.validateContract({
    agent_id: 'w1',
    tier: 'worker',
    domain: 'eng',
    allowed_writes: ['wiki/repos/test-repo/**'],
    forbidden_paths: [],
    close_policy: { required_fields: ['taskLogEntry'], at_least_one_of: [], require_active_task: true },
  })
  const payload = { project: 'test-repo', taskLogEntry: 'Entry under contention', discoveries: [{ body: 'd' }] }

  // Another process holds the per-repo lock for the whole attempt.
  const lock = agentRt.acquireLock(root, 'repo:test-repo')
  try {
    const blocked = repoRt.closeRepoTask(root, 'test-repo', contract, payload)
    assert.equal(blocked.ok, false)
    assert.match(blocked.error, /lock busy/)
    // Nothing landed: no progress entry, no bus item.
    assert.equal(fs.existsSync(path.join(root, 'wiki/repos/test-repo/progress.md')), false)
    assert.equal(repoRt.listRepoBusItems(root, 'test-repo', 'discovery').length, 0)
  } finally {
    lock.release()
  }

  // Lock released — the same close now succeeds.
  const result = repoRt.closeRepoTask(root, 'test-repo', contract, payload)
  assert.equal(result.ok, true)
  assert.match(fs.readFileSync(path.join(root, 'wiki/repos/test-repo/progress.md'), 'utf8'), /Entry under contention/)
  assert.equal(repoRt.listRepoBusItems(root, 'test-repo', 'discovery').length, 1)
})

test('dryRunCloseRepoTask reports rejected writes without committing', () => {
  const root = makeFixture()
  const contract = agentRt.validateContract({
    agent_id: 'w1',
    tier: 'worker',
    domain: 'eng',
    allowed_writes: ['wiki/repos/test-repo/**'],
    forbidden_paths: ['wiki/repos/test-repo/bus/**'],
    close_policy: {
      required_fields: ['taskLogEntry'],
      at_least_one_of: [],
      require_active_task: false,
    },
  })

  const result = repoRt.dryRunCloseRepoTask(root, 'test-repo', contract, {
    taskLogEntry: 'Preview only',
    discoveries: [{ body: 'Should be rejected by guard' }],
  })

  assert.equal(result.wouldSucceed, false)
  assert.ok(result.rejected.some(item => item.path?.includes('/bus/discovery/')))
  assert.equal(repoRt.listRepoBusItems(root, 'test-repo', 'discovery').length, 0)
})

test('dryRunCloseRepoTask allows repo-scoped writes for live-style contracts without repo allowlists', () => {
  const root = makeFixture()
  const contract = agentRt.validateContract({
    agent_id: 'w1',
    tier: 'worker',
    domain: 'eng',
    task_end_actions: ['append_task_log'],
    allowed_writes: ['wiki/agents/workers/w1/**'],
    forbidden_paths: [],
  })

  const result = repoRt.dryRunCloseRepoTask(root, 'test-repo', contract, {
    taskLogEntry: 'Repo close payload',
    discoveries: [{ body: 'Repo bus item' }],
  })

  assert.equal(result.wouldSucceed, true)
  assert.equal(result.rejected.length, 0)
  assert.ok(result.planned.some(item => item.path === 'wiki/repos/test-repo/progress.md'))
  assert.ok(result.planned.some(item => item.path?.includes('/bus/discovery/')))
})

test('repo-scoped writes work for contracts with no global allowed_writes at all', () => {
  const root = makeFixture()
  // Repo-only agent: contract carries an empty allowlist. The global guard
  // answers 'no allowed_writes configured', which used to bypass the
  // repo-scoped fallback and reject every write outright.
  const contract = agentRt.validateContract({
    agent_id: 'w1',
    tier: 'worker',
    domain: 'eng',
    task_end_actions: ['append_task_log'],
    forbidden_paths: [],
  })

  const result = repoRt.closeRepoTask(root, 'test-repo', contract, {
    taskLogEntry: 'Repo-only agent close',
    discoveries: [{ body: 'Repo bus item' }],
  })

  assert.equal(result.ok, true)
  assert.ok(fs.readFileSync(path.join(root, 'wiki/repos/test-repo/progress.md'), 'utf8').includes('Repo-only agent close'))
  assert.equal(repoRt.listRepoBusItems(root, 'test-repo', 'discovery').length, 1)
})

test('repo-scoped fallback still rejects unsafe and forbidden paths', () => {
  const root = makeFixture()
  const contract = agentRt.validateContract({
    agent_id: 'w1',
    tier: 'worker',
    domain: 'eng',
    task_end_actions: [],
    forbidden_paths: ['wiki/repos/test-repo/progress.md'],
  })
  const result = repoRt.closeRepoTask(root, 'test-repo', contract, {
    taskLogEntry: 'should be forbidden',
  })
  assert.equal(result.ok, false)
  assert.ok(result.rejected.some(r => r.path === 'wiki/repos/test-repo/progress.md'))
})

// ─── 5. Bus tests ────────────────────────────────────────────────────────

test('publishRepoBusItem creates file with correct frontmatter', () => {
  const root = makeFixture()
  const result = repoRt.publishRepoBusItem(root, 'test-repo', {
    channel: 'discovery',
    from: 'w1',
    body: 'Discovered pattern X',
  })
  assert.ok(result.id)
  const itemPath = path.join(root, result.path)
  assert.ok(fs.existsSync(itemPath))
  const content = fs.readFileSync(itemPath, 'utf8')
  assert.match(content, /discovered pattern x/i)
})

test('listRepoBusItems returns items', () => {
  const root = makeFixture()
  repoRt.publishRepoBusItem(root, 'test-repo', { channel: 'discovery', from: 'w1', body: 'Item 1' })
  repoRt.publishRepoBusItem(root, 'test-repo', { channel: 'discovery', from: 'w1', body: 'Item 2' })
  const items = repoRt.listRepoBusItems(root, 'test-repo', 'discovery')
  assert.equal(items.length, 2)
})

test('listRepoBusItems filters by status', () => {
  const root = makeFixture()
  const { id: id1 } = repoRt.publishRepoBusItem(root, 'test-repo', { channel: 'discovery', from: 'w1', body: 'Item 1' })
  const { id: id2 } = repoRt.publishRepoBusItem(root, 'test-repo', { channel: 'discovery', from: 'w1', body: 'Item 2' })
  repoRt.transitionRepoBusItem(root, 'test-repo', 'discovery', id1, 'archived', 'w1')
  const openItems = repoRt.listRepoBusItems(root, 'test-repo', 'discovery', { status: 'open' })
  assert.equal(openItems.length, 1)
  assert.equal(openItems[0].meta.id, id2)
})

test('transitionRepoBusItem updates status', () => {
  const root = makeFixture()
  const { id } = repoRt.publishRepoBusItem(root, 'test-repo', { channel: 'discovery', from: 'w1', body: 'Test' })
  repoRt.transitionRepoBusItem(root, 'test-repo', 'discovery', id, 'archived', 'w1')
  const item = repoRt.readRepoBusItem(root, 'test-repo', 'discovery', id)
  assert.equal(item.meta.status, 'archived')
})

// ─── 6. Path guards tests ─────────────────────────────────────────────────

test('assertNotImportedDoc throws for imported paths', () => {
  const importedPath = 'wiki/repos/test-repo/repo-docs/src/index.md'
  assert.throws(
    () => repoRt.assertNotImportedDoc(importedPath),
    /Cannot write directly to imported doc/
  )
})

test('assertNotImportedDoc passes for operational paths', () => {
  const opPath = 'wiki/repos/test-repo/canonical/PRD.md'
  assert.doesNotThrow(() => repoRt.assertNotImportedDoc(opPath))
})

test('isImportedDoc returns false for non-imported', () => {
  assert.equal(repoRt.isImportedDoc('wiki/repos/test-repo/progress.md'), false)
  assert.equal(repoRt.isImportedDoc('wiki/other/index.md'), false)
})

// ─── 7. Templates tests ──────────────────────────────────────────────────

test('generateCanonicalTemplate returns non-empty for PRD', () => {
  const tmpl = repoRt.generateCanonicalTemplate('prd', 'test-repo')
  assert.ok(tmpl.length > 0)
  assert.match(tmpl, /---/)
  assert.match(tmpl, /test-repo/)
})

test('generateCanonicalTemplate returns non-empty for app_flow', () => {
  const tmpl = repoRt.generateCanonicalTemplate('app_flow', 'test-repo')
  assert.ok(tmpl.length > 0)
  assert.match(tmpl, /Application Flow/)
})

test('generateCanonicalTemplate returns non-empty for tech_stack', () => {
  const tmpl = repoRt.generateCanonicalTemplate('tech_stack', 'test-repo')
  assert.ok(tmpl.length > 0)
  assert.match(tmpl, /Technology Stack/)
})

test('generateProgressPage has correct frontmatter', () => {
  const page = repoRt.generateProgressPage('test-repo')
  assert.match(page, /---/)
  assert.match(page, /test-repo/)
  assert.match(page, /Progress/)
})

test('generateRepoCLAUDE has repo name in content', () => {
  const claude = repoRt.generateRepoCLAUDE('test-repo')
  assert.match(claude, /test-repo/)
  assert.match(claude, /Agent Instructions/)
})

test('generateHomePage has correct structure', () => {
  const home = repoRt.generateHomePage({
    repo_name: 'test-repo',
    owner: 'jay',
    visibility: 'private',
    status: 'active',
  })
  assert.match(home, /---/)
  assert.match(home, /test-repo/)
  assert.match(home, /Quick Links/)
})

// ─── 8. Context loader tests ─────────────────────────────────────────────

test('loadRepoContext returns { files: [], totalBytes: 0 } on empty repo', () => {
  const root = makeFixture()
  const mockContract = {
    agent_id: 'w1',
    tier: 'worker',
    domain: 'eng',
    context_policy: { include: [] },
  }
  const result = repoRt.loadRepoContext(root, 'test-repo', mockContract)
  assert.ok(Array.isArray(result.files))
  assert.ok(result.trace)
})

test('loadRepoContext does not throw on missing directories', () => {
  const root = makeFixture()
  const mockContract = {
    agent_id: 'w1',
    tier: 'worker',
    domain: 'eng',
    context_policy: { include: [] },
  }
  assert.doesNotThrow(() => {
    repoRt.loadRepoContext(root, 'nonexistent-repo', mockContract)
  })
})

test('loadRepoContext accepts MCP-style opts and includes targeted repo bus items', () => {
  const root = makeFixture()
  fs.writeFileSync(path.join(root, 'wiki/repos/test-repo/canonical/PRD.md'), '---\ntitle: PRD\n---\nCanonical\n')
  fs.writeFileSync(path.join(root, 'wiki/repos/test-repo/progress.md'), '---\nmemory_class: working\n---\nProgress\n')
  repoRt.publishRepoBusItem(root, 'test-repo', {
    channel: 'escalation',
    from: 'l1',
    to: 'w1',
    body: 'Handle this issue',
  })

  const result = repoRt.loadRepoContext(root, 'test-repo', { agent_id: 'w1', budget_bytes: 50000 })
  const paths = result.files.map(file => file.path)

  assert.ok(paths.includes('wiki/repos/test-repo/canonical/PRD.md'))
  assert.ok(paths.includes('wiki/repos/test-repo/progress.md'))
  assert.ok(paths.some(p => p.includes('/bus/escalation/') && p.endsWith('.md')))
  assert.equal(result.trace.budget_bytes, 50000)
})

test('loadRepoContext path-glob include rules match .mdx docs, not just .md', () => {
  // syncRepo imports *.mdx and importedDocPath keeps the extension, so a repo
  // whose docs are .mdx got an empty bundle from a path-glob include rule
  // while the identical .md doc was picked up.
  const root = makeFixture()
  const docs = path.join(root, 'wiki/repos/test-repo/repo-docs')
  fs.mkdirSync(docs, { recursive: true })
  fs.writeFileSync(path.join(docs, 'guide.md'), '---\ntitle: G\n---\nmd doc\n')
  fs.writeFileSync(path.join(docs, 'api.mdx'), '---\ntitle: A\n---\nmdx doc\n')

  const contract = {
    agent_id: 'w1',
    tier: 'worker',
    domain: 'eng',
    context_policy: {
      budget_bytes: 50000,
      include: [{ path: 'wiki/repos/{{repo}}/repo-docs/**', priority: 50 }],
    },
  }
  const paths = repoRt.loadRepoContext(root, 'test-repo', contract).files.map(f => f.path)
  assert.ok(paths.includes('wiki/repos/test-repo/repo-docs/guide.md'))
  assert.ok(paths.includes('wiki/repos/test-repo/repo-docs/api.mdx'), '.mdx doc must be included')
})

test('loadRepoContext source_files rejects traversal segments but keeps clean paths', () => {
  const root = makeFixture()
  fs.mkdirSync(path.join(root, 'wiki/repos/test-repo/repo-docs'), { recursive: true })
  fs.writeFileSync(path.join(root, 'wiki/repos/test-repo/repo-docs/README.md'), '---\ntitle: R\n---\nDoc\n')
  fs.mkdirSync(path.join(root, 'wiki/personal'), { recursive: true })
  fs.writeFileSync(path.join(root, 'wiki/personal/secret.md'), '---\nvisibility: private\n---\nSecret\n')

  const result = repoRt.loadRepoContext(root, 'test-repo', {
    agent_id: 'w1',
    budget_bytes: 50000,
    source_files: ['README.md', '../../../personal/secret.md', '/etc/passwd', ''],
  })
  const paths = result.files.map(file => file.path)

  assert.ok(paths.includes('wiki/repos/test-repo/repo-docs/README.md'))
  assert.ok(!paths.some(p => p.includes('secret') || p.includes('passwd')))
})

test('loadRepoContext admits a file once even when two sources resolve it', () => {
  // The bus sweep and an include rule can both resolve the same path. Before
  // the dedup the file was pushed twice AND charged against budget_bytes
  // twice, so a repo with N doubly-matched files silently lost budget for
  // other docs. loadAgentContext has always guarded this with a `seen` set.
  const root = makeFixture()
  const busItem = path.join(root, 'wiki/repos/test-repo/bus/discovery/item-1.md')
  fs.writeFileSync(busItem, '---\nmemory_class: bus\nfrom: someone\nstatus: open\n---\n\nbody\n')
  const bytes = fs.statSync(busItem).size

  const contract = {
    agent_id: 'w1',
    tier: 'worker',
    domain: 'eng',
    context_policy: {
      budget_bytes: 50000,
      // A path glob that covers the whole repo tree, so it also matches the
      // bus item the step-5 sweep delivers.
      include: [{ path: 'wiki/repos/{{repo}}/**', priority: 70 }],
    },
  }
  const result = repoRt.loadRepoContext(root, 'test-repo', contract)
  const hits = result.files.filter(f => f.path.endsWith('bus/discovery/item-1.md'))

  assert.equal(hits.length, 1, 'a doubly-matched file must appear once')
  assert.equal(result.trace.bytes_used, bytes, 'its bytes must be charged once')
  // A duplicate is not a loss, so it must not be reported as a dropped file.
  assert.deepEqual(result.trace.excluded, [])
  assert.equal(result.trace.truncated, false)
})

// ─── Sync: archive + commit sha provenance ────────────────────────────────

test('archiveRemovedDoc moves the doc out of repo-docs (no live copy left behind)', () => {
  const root = makeFixture()
  const relPath = 'wiki/repos/test-repo/repo-docs/removed-upstream.md'
  fs.writeFileSync(path.join(root, relPath), '---\nrepo_name: test-repo\n---\n\nGone upstream\n')

  const archivePath = repoRt.archiveRemovedDoc(root, 'test-repo', relPath)
  assert.ok(archivePath, 'should return the archive path')
  assert.ok(fs.existsSync(path.join(root, archivePath)), 'archive copy should exist')
  assert.ok(!fs.existsSync(path.join(root, relPath)), 'original must be removed from repo-docs')
  const archived = fs.readFileSync(path.join(root, archivePath), 'utf8')
  assert.match(archived, /archived_at/)
})

test('archiveRemovedDoc keeps subpaths so same-named docs do not clobber each other', () => {
  const root = makeFixture()
  const relA = 'wiki/repos/test-repo/repo-docs/docs/a/README.md'
  const relB = 'wiki/repos/test-repo/repo-docs/docs/b/README.md'
  fs.mkdirSync(path.join(root, 'wiki/repos/test-repo/repo-docs/docs/a'), { recursive: true })
  fs.mkdirSync(path.join(root, 'wiki/repos/test-repo/repo-docs/docs/b'), { recursive: true })
  fs.writeFileSync(path.join(root, relA), '---\nrepo_name: test-repo\n---\n\nDoc A\n')
  fs.writeFileSync(path.join(root, relB), '---\nrepo_name: test-repo\n---\n\nDoc B\n')

  const archiveA = repoRt.archiveRemovedDoc(root, 'test-repo', relA)
  const archiveB = repoRt.archiveRemovedDoc(root, 'test-repo', relB)

  assert.notEqual(archiveA, archiveB, 'archive paths must not collide')
  assert.match(fs.readFileSync(path.join(root, archiveA), 'utf8'), /Doc A/)
  assert.match(fs.readFileSync(path.join(root, archiveB), 'utf8'), /Doc B/)
})

test('syncRepo records sync state in the registry (CLI/MCP parity with web)', async () => {
  const root = makeFixture()
  repoRt.upsertRepo(root, { repo_name: 'test-repo', owner: 'owner1', status: 'active', visibility: 'private' })

  const origFetch = globalThis.fetch
  try {
    globalThis.fetch = async (url) => {
      const u = String(url)
      if (u.includes('/git/trees/')) {
        return { ok: true, json: async () => ({ tree: [{ type: 'blob', path: 'README.md', sha: 'blob1' }] }) }
      }
      if (u.includes('/git/blobs/')) {
        return { ok: true, json: async () => ({ content: Buffer.from('# Hello\n').toString('base64') }) }
      }
      if (u.includes('/commits/')) {
        return { ok: true, json: async () => ({ sha: 'commit-sha-1' }) }
      }
      throw new Error('unexpected fetch: ' + u)
    }

    const trace = await repoRt.syncRepo(root, 'test-repo', {})
    assert.equal(trace.errors.length, 0)
    assert.equal(trace.commit_sha, 'commit-sha-1')

    const record = repoRt.getRepo(root, 'test-repo')
    assert.ok(record.last_sync_at, 'last_sync_at must be stamped')
    assert.equal(record.last_synced_commit, 'commit-sha-1')
    assert.equal(record.markdown_file_count, 1)
  } finally {
    globalThis.fetch = origFetch
  }
})

test('fetchRepoMarkdown fetches blobs concurrently, preserves tree order, skips failures', async () => {
  const N = 20
  const tree = Array.from({ length: N }, (_, i) => ({ type: 'blob', path: `docs/f${i}.md`, sha: `sha${i}` }))
  let inflight = 0
  let maxInflight = 0

  const origFetch = globalThis.fetch
  try {
    globalThis.fetch = async (url) => {
      const u = String(url)
      if (u.includes('/git/trees/')) {
        return { ok: true, json: async () => ({ tree }) }
      }
      const m = u.match(/git\/blobs\/sha(\d+)$/)
      if (m) {
        inflight++
        maxInflight = Math.max(maxInflight, inflight)
        await new Promise(r => setTimeout(r, 2))
        inflight--
        const i = Number(m[1])
        if (i === 7) return { ok: false, status: 500 } // one failed blob must not abort the rest
        return { ok: true, json: async () => ({ content: Buffer.from(`doc ${i}`).toString('base64') }) }
      }
      throw new Error('unexpected fetch: ' + u)
    }

    const results = await repoRt.fetchRepoMarkdown('repo1', 'owner1', {})
    assert.equal(results.length, N - 1)
    assert.ok(maxInflight > 1, 'blob fetches should overlap')
    assert.ok(maxInflight <= 8, 'concurrency must stay bounded')
    // Order follows the tree listing even though fetches complete out of order
    const paths = results.map(r => r.path)
    const sorted = tree.map(t => t.path).filter(p2 => p2 !== 'docs/f7.md')
    assert.deepEqual(paths, sorted)
    assert.equal(results[0].content, 'doc 0')
  } finally {
    globalThis.fetch = origFetch
  }
})

test('fetchCommitSha resolves the branch commit sha and tolerates failures', async () => {
  const origFetch = globalThis.fetch
  try {
    globalThis.fetch = async (url) => {
      assert.match(String(url), /\/repos\/owner1\/repo1\/commits\/dev$/)
      return { ok: true, json: async () => ({ sha: 'deadbeefcafe' }) }
    }
    assert.equal(await repoRt.fetchCommitSha('repo1', 'owner1', { branch: 'dev' }), 'deadbeefcafe')

    globalThis.fetch = async () => ({ ok: false, status: 404 })
    assert.equal(await repoRt.fetchCommitSha('repo1', 'owner1', {}), null)

    globalThis.fetch = async () => { throw new Error('network down') }
    assert.equal(await repoRt.fetchCommitSha('repo1', 'owner1', {}), null)
  } finally {
    globalThis.fetch = origFetch
  }
})

test('transitionRepoBusItem records string actor and optional promotion provenance', () => {
  const root = makeFixture()
  const { id } = repoRt.publishRepoBusItem(root, 'test-repo', {
    channel: 'discovery',
    from: 'w1',
    body: 'promote me',
  })
  const result = repoRt.transitionRepoBusItem(root, 'test-repo', 'discovery', id, 'promoted', 'l1', {
    reviewed_by: 'l1',
    promoted_to: 'wiki/repos/test-repo/canonical/learning.md',
  })
  assert.equal(result.status, 'promoted')
  const item = repoRt.readRepoBusItem(root, 'test-repo', 'discovery', id)
  assert.equal(item.meta.status, 'promoted')
  assert.equal(item.meta.reviewed_by, 'l1')
  assert.equal(item.meta.promoted_to, 'wiki/repos/test-repo/canonical/learning.md')
  const last = item.meta.status_history[item.meta.status_history.length - 1]
  assert.equal(last.actor, 'l1', 'actor must be the approver string, not an object')
  assert.equal(last.to, 'promoted')
})

test('an oversized canonical doc is skipped, not treated as end-of-list', () => {
  // The canonical loop used `break` where every other budget check in
  // loadRepoContext skips and continues, so one file larger than the
  // remaining budget dropped every alphabetically later canonical doc.
  const root = makeFixture()
  const canon = path.join(root, 'wiki/repos/test-repo/canonical')
  fs.writeFileSync(path.join(canon, 'a-small.md'), '---\ntitle: A\n---\nsmall\n')
  fs.writeFileSync(path.join(canon, 'b-huge.md'), '---\ntitle: B\n---\n' + 'x'.repeat(20000) + '\n')
  fs.writeFileSync(path.join(canon, 'c-small.md'), '---\ntitle: C\n---\nsmall\n')

  const result = repoRt.loadRepoContext(root, 'test-repo', { agent_id: 'w1', budget_bytes: 4096 })
  const paths = result.files.map(f => f.path)

  assert.ok(paths.includes('wiki/repos/test-repo/canonical/a-small.md'))
  assert.ok(
    paths.includes('wiki/repos/test-repo/canonical/c-small.md'),
    `c-small.md dropped behind the oversized doc: ${JSON.stringify(paths)}`,
  )
  assert.ok(!paths.includes('wiki/repos/test-repo/canonical/b-huge.md'))
})

test('broadcast repo bus items are delivered; terminal ones are not', () => {
  // publishRepoBusItem stores `to: to || null`, so broadcast is the default.
  // An unconditional `meta.to === agent_id` filter meant the repo discovery
  // channel delivered nothing unless a recipient was named.
  const root = makeFixture()
  const broadcast = repoRt.publishRepoBusItem(root, 'test-repo', {
    channel: 'discovery', from: 'l1', body: 'Everyone should know this',
  })
  const addressed = repoRt.publishRepoBusItem(root, 'test-repo', {
    channel: 'escalation', from: 'l1', to: 'w1', body: 'For w1 only',
  })
  const forSomeoneElse = repoRt.publishRepoBusItem(root, 'test-repo', {
    channel: 'escalation', from: 'l1', to: 'w2', body: 'Not for w1',
  })
  const done = repoRt.publishRepoBusItem(root, 'test-repo', {
    channel: 'discovery', from: 'l1', body: 'Already handled',
  })
  repoRt.transitionRepoBusItem(root, 'test-repo', 'discovery', done.id, 'resolved', 'l1')

  const result = repoRt.loadRepoContext(root, 'test-repo', { agent_id: 'w1', budget_bytes: 50000 })
  const paths = result.files.map(f => f.path)

  assert.ok(paths.includes(broadcast.path), `broadcast not delivered: ${JSON.stringify(paths)}`)
  assert.ok(paths.includes(addressed.path))
  assert.ok(!paths.includes(forSomeoneElse.path), 'another agent\'s item must not be delivered')
  assert.ok(!paths.includes(done.path), 'resolved items must not stay in the bundle forever')
})

test('appendRepoProgress serialises against a concurrent holder of the repo lock', () => {
  // closeRepoTask wraps its identical read-modify-write of progress.md in
  // withLock(kbRoot, `repo:<name>`); this exported twin committed bare, so a
  // racing writer's entry was replaced wholesale by the atomic rename.
  const root = makeFixture()
  const progressFull = path.join(root, 'wiki/repos/test-repo/progress.md')
  fs.mkdirSync(path.dirname(progressFull), { recursive: true })

  // Must stay well under acquireLock's default give-up budget
  // (retries * retryDelayMs = 10 * 50 = 500ms). Holding for exactly 500ms put
  // the waiter's deadline and the holder's release at the same instant, so on
  // a loaded machine appendRepoProgress lost the race and threw
  // "lock busy: repo:test-repo" — a flaky failure of a test that is only
  // meant to prove the call serialises at all.
  const HOLD_MS = 200
  const locksMod = new URL('../../lib/agent-runtime/locks.mjs', import.meta.url).href
  // Child process holds repo:test-repo, writes the first entry, then releases.
  const child = spawn(process.execPath, ['-e', `
    import(${JSON.stringify(locksMod)}).then(async ({ acquireLock }) => {
      const lock = acquireLock(${JSON.stringify(root)}, 'repo:test-repo')
      require('fs').writeFileSync(${JSON.stringify(progressFull)}, '---\\nrepo: test-repo\\n---\\n\\n## first entry\\n')
      console.log('HELD')
      setTimeout(() => { lock.release(); process.exit(0) }, ${HOLD_MS})
    })
  `], { stdio: ['ignore', 'pipe', 'pipe'] })

  try {
    // Wait (busy, on purpose — withLock below blocks the loop anyway) until
    // the child reports it holds the lock.
    const lockFile = path.join(root, '.locks', 'repo_test-repo.lock')
    const deadline = Date.now() + 5000
    while (!fs.existsSync(lockFile) && Date.now() < deadline) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10)
    }
    assert.ok(fs.existsSync(lockFile), 'child never acquired the lock')

    const started = Date.now()
    repoRt.appendRepoProgress(root, 'test-repo', 'second entry', 'w1')
    const waited = Date.now() - started

    assert.ok(waited >= HOLD_MS / 2, `appendRepoProgress did not wait for the lock (${waited}ms)`)
    const content = fs.readFileSync(progressFull, 'utf8')
    assert.match(content, /first entry/, "the lock holder's content survived")
    assert.match(content, /second entry/)
  } finally {
    child.kill()
  }
})

test('loadRepoContext reports what the budget dropped instead of truncating silently', () => {
  // loadRepoContext is a lossy channel: it takes the repo's docs, bus items
  // and canonical pages and emits a byte-capped bundle a downstream agent
  // reasons over. Before this, a truncated bundle and a complete one had the
  // same trace shape, so the consumer could not tell them apart --- and
  // `budget_remaining` is not a proxy, because a non-zero remainder is the
  // normal result of dropping a file bigger than what was left.
  const root = makeFixture()
  const canon = path.join(root, 'wiki/repos/test-repo/canonical')
  for (const n of ['a', 'b', 'c', 'd', 'e']) {
    fs.writeFileSync(path.join(canon, `${n}.md`), `---\ntitle: ${n}\n---\n` + 'x'.repeat(2000) + '\n')
  }

  const full = repoRt.loadRepoContext(root, 'test-repo', { agent_id: 'w1', budget_bytes: 200000 })
  assert.equal(full.files.length, 5)
  assert.equal(full.trace.truncated, false, 'a complete bundle must say so explicitly')
  assert.equal(full.trace.dropped_count, 0)
  assert.deepEqual(full.trace.excluded, [], 'excluded is always present, never undefined')

  const cut = repoRt.loadRepoContext(root, 'test-repo', { agent_id: 'w1', budget_bytes: 5000 })
  assert.ok(cut.files.length < 5, 'fixture must actually exceed the budget')
  assert.equal(cut.trace.truncated, true, 'a truncated bundle must be flagged')
  assert.equal(cut.trace.dropped_count, 5 - cut.files.length)
  // Not just a count: the consumer can name the pages it did not receive.
  const droppedPaths = cut.trace.excluded.map(e => e.path)
  const keptPaths = cut.files.map(f => f.path)
  for (const p of droppedPaths) assert.ok(!keptPaths.includes(p), 'a file cannot be both kept and dropped')
  assert.deepEqual(
    [...droppedPaths, ...keptPaths].sort(),
    ['a', 'b', 'c', 'd', 'e'].map(n => `wiki/repos/test-repo/canonical/${n}.md`),
    'kept + dropped must account for every candidate',
  )
  for (const e of cut.trace.excluded) {
    assert.equal(e.reason, 'budget')
    assert.ok(Number.isFinite(e.bytes), 'each drop records the size that did not fit')
  }
})

test('loadRepoContext records a rejected source_files path as a drop, not as silence', () => {
  // The caller named these files explicitly. Dropping them without a word
  // left "rejected as unsafe" indistinguishable from "does not exist".
  const root = makeFixture()
  fs.writeFileSync(path.join(root, 'wiki/repos/test-repo/repo-docs/README.md'), '---\ntitle: R\n---\nDoc\n')

  const result = repoRt.loadRepoContext(root, 'test-repo', {
    agent_id: 'w1',
    budget_bytes: 50000,
    source_files: ['README.md', '../../../etc/passwd', '/etc/shadow'],
  })

  assert.ok(result.files.map(f => f.path).includes('wiki/repos/test-repo/repo-docs/README.md'))
  const unsafe = result.trace.excluded.filter(e => e.reason === 'unsafe source path')
  assert.equal(unsafe.length, 2, `both traversal attempts must be reported: ${JSON.stringify(result.trace.excluded)}`)
  // Rejected-as-unsafe is not budget pressure, so the bundle is not truncated.
  assert.equal(result.trace.truncated, false)
  assert.equal(result.trace.dropped_count, 2)
})

test('syncRepo reports a partial fetch instead of returning a clean-looking trace', async () => {
  // fetchRepoMarkdown drops docs two ways: GitHub caps large tree listings,
  // and any blob can fail on its own. Both were reported only via
  // console.warn — stderr on a stdio MCP server — so a sync that lost a third
  // of the repo returned errors: [] and stamped the short count into the
  // registry, indistinguishable from a clean full sync.
  const root = makeFixture()
  repoRt.upsertRepo(root, { repo_name: 'test-repo', owner: 'o1', status: 'active', visibility: 'private' })

  const tree = Array.from({ length: 10 }, (_, i) => ({ type: 'blob', path: `docs/f${i}.md`, sha: `sha${i}` }))
  const origFetch = globalThis.fetch
  try {
    globalThis.fetch = async (url) => {
      const u = String(url)
      if (u.includes('/git/trees/')) return { ok: true, json: async () => ({ tree, truncated: true }) }
      const m = u.match(/git\/blobs\/sha(\d+)$/)
      if (m) {
        if (Number(m[1]) < 3) return { ok: false, status: 502 }
        return { ok: true, json: async () => ({ content: Buffer.from(`doc ${m[1]}`).toString('base64') }) }
      }
      if (u.includes('/commits/')) return { ok: true, json: async () => ({ sha: 'c1' }) }
      throw new Error('unexpected fetch: ' + u)
    }

    const trace = await repoRt.syncRepo(root, 'test-repo', {})

    assert.equal(trace.partial, true, 'an incomplete fetch must be flagged on the trace')
    assert.equal(trace.source.listing_truncated, true, 'the capped tree listing is recorded')
    assert.equal(trace.source.candidates, 10)
    assert.equal(trace.source.fetched, 7)
    assert.equal(trace.source.fetch_failures.length, 3, 'each dropped blob is named')
    assert.deepEqual(
      trace.source.fetch_failures.map(f => f.path).sort(),
      ['docs/f0.md', 'docs/f1.md', 'docs/f2.md'],
    )
    // The registry count is a floor, and the record says so.
    assert.equal(repoRt.getRepo(root, 'test-repo').partial_sync, true)
  } finally {
    globalThis.fetch = origFetch
  }
})

test('a complete sync reports partial: false and no dropped blobs', async () => {
  // The flag only helps if it distinguishes; a clean sync must say so
  // explicitly rather than leave the field absent.
  const root = makeFixture()
  repoRt.upsertRepo(root, { repo_name: 'test-repo', owner: 'o1', status: 'active', visibility: 'private' })

  const origFetch = globalThis.fetch
  try {
    globalThis.fetch = async (url) => {
      const u = String(url)
      if (u.includes('/git/trees/')) {
        return { ok: true, json: async () => ({ tree: [{ type: 'blob', path: 'README.md', sha: 's1' }] }) }
      }
      if (u.includes('/git/blobs/')) return { ok: true, json: async () => ({ content: Buffer.from('# Hi\n').toString('base64') }) }
      if (u.includes('/commits/')) return { ok: true, json: async () => ({ sha: 'c1' }) }
      throw new Error('unexpected fetch: ' + u)
    }

    const trace = await repoRt.syncRepo(root, 'test-repo', {})
    assert.equal(trace.partial, false)
    assert.equal(trace.source.listing_truncated, false)
    assert.equal(trace.source.candidates, 1)
    assert.equal(trace.source.fetched, 1)
    assert.deepEqual(trace.source.fetch_failures, [])
    assert.equal(repoRt.getRepo(root, 'test-repo').partial_sync, false)
  } finally {
    globalThis.fetch = origFetch
  }
})

test('a transient blob failure does not archive a doc that still exists upstream', async () => {
  // "Removed upstream" was computed as "absent from the fetch result", and
  // the fetch result is lossy. A 502 on one blob therefore made syncRepo
  // unlink the local copy of a doc that was never deleted — the silent loss
  // turning into real data loss one step downstream.
  const root = makeFixture()
  repoRt.upsertRepo(root, { repo_name: 'test-repo', owner: 'o1', status: 'active', visibility: 'private' })
  const docsDir = path.join(root, 'wiki/repos/test-repo/repo-docs/docs')
  fs.mkdirSync(docsDir, { recursive: true })
  const keepMe = path.join(docsDir, 'keep.md')
  fs.writeFileSync(keepMe, '---\nrepo_name: test-repo\n---\n\nStill upstream\n')

  const origFetch = globalThis.fetch
  try {
    globalThis.fetch = async (url) => {
      const u = String(url)
      if (u.includes('/git/trees/')) {
        return { ok: true, json: async () => ({ tree: [
          { type: 'blob', path: 'docs/keep.md', sha: 'boom' },
          { type: 'blob', path: 'docs/other.md', sha: 'ok' },
        ] }) }
      }
      if (u.includes('/git/blobs/boom')) return { ok: false, status: 502 }
      if (u.includes('/git/blobs/ok')) return { ok: true, json: async () => ({ content: Buffer.from('ok\n').toString('base64') }) }
      if (u.includes('/commits/')) return { ok: true, json: async () => ({ sha: 'c1' }) }
      throw new Error('unexpected fetch: ' + u)
    }

    const trace = await repoRt.syncRepo(root, 'test-repo', {})
    assert.equal(trace.partial, true)
    assert.match(trace.archive_skipped_reason, /blob fetch failure/)
    assert.deepEqual(trace.archived, [], 'nothing may be archived off an incomplete listing')
    assert.ok(fs.existsSync(keepMe), 'a doc that still exists upstream must survive a transient 502')
  } finally {
    globalThis.fetch = origFetch
  }
})
