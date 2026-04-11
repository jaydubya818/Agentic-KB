// Test suite for repo-runtime module.
// Runs against a throwaway fixture KB in a temp dir.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import os from 'os'

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
