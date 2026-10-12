// Characterization tests for web/src/app/api/repos/[repo]/close-task/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed repeatedly): route handler 15 of the enumerated 36,
// the repo-scoped sibling of the already-covered
// web/src/app/api/agents/[id]/close-task/route.ts (agent-close-task-route.test.mjs).
//
// This route delegates to lib/repo-runtime/writeback.mjs's
// writeRepoTaskLog() and appendRepoProgress(), whose happy-path and
// concurrency behavior already have unit-level coverage via
// tests/repos/repo-runtime.test.mjs. What that file does NOT cover, and
// what this file pins: this route's own HTTP-layer behavior -- the 404 on
// an unknown repo, the 400 on missing required fields, that a valid
// payload actually lands task-log content on disk, that progressEntry is
// genuinely optional (progress.md is never created when it is omitted),
// and one previously-undocumented GAP -- writeRepoTaskLog()'s path-traversal
// guard on taskId (rejecting '/', '\\', '..' segments) throws a plain
// Error, and this route's catch-all `catch (err)` maps that throw to a
// generic 400 with the raw `Invalid task id: ...` message leaking the
// rejected value back to the caller verbatim, the same shape as any other
// validation failure -- there is no dedicated 4xx class for "the task id
// itself was malicious" versus "a required field was missing".
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-close-task-kb-'))
process.env.KB_ROOT = KB_ROOT

function writeRegistry(repos) {
  const dir = path.join(KB_ROOT, 'config/repos')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'registry.json'), JSON.stringify({ version: '1.0', repos }, null, 2))
}

let POST, NextRequest
before(async () => {
  ;({ NextRequest } = await import('next/server'))
  ;({ POST } = await import('../src/app/api/repos/[repo]/close-task/route.ts'))
  writeRegistry([{ repo_name: 'test-repo', github_url: 'https://github.com/x/test-repo', status: 'synced' }])
})

after(() => {
  fs.rmSync(KB_ROOT, { recursive: true, force: true })
})

function postReq(repo, body) {
  const url = new URL(`http://localhost/api/repos/${repo}/close-task`)
  const init = body === undefined ? undefined : { method: 'POST', body: JSON.stringify(body) }
  return POST(new NextRequest(url, init), { params: Promise.resolve({ repo }) })
}

function taskLogGlob() {
  const tasksRoot = path.join(KB_ROOT, 'wiki/repos/test-repo/tasks')
  if (!fs.existsSync(tasksRoot)) return []
  const found = []
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else found.push(full)
    }
  }
  walk(tasksRoot)
  return found
}

test('POST for an unknown repo returns 404, not a thrown error', async () => {
  const res = await postReq('no-such-repo', { agent_id: 'w1', task_id: 't1', entry: 'did a thing' })
  assert.equal(res.status, 404)
  const json = await res.json()
  assert.equal(json.error, 'Repo not found')
})

test('POST missing a required field returns 400 naming all three required fields', async () => {
  const res = await postReq('test-repo', { agent_id: 'w1', task_id: 't1' /* no entry */ })
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.error, 'Missing required fields: agent_id, task_id, entry')
})

test('POST with no request body at all returns 400 (request.json() failure falls back to {}, which is missing everything)', async () => {
  const res = await postReq('test-repo', undefined)
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.error, 'Missing required fields: agent_id, task_id, entry')
})

test('POST with a valid payload returns { written: true } and the entry actually lands on disk', async () => {
  const res = await postReq('test-repo', { agent_id: 'w1', task_id: 'close-task-happy', entry: 'did a thing worth logging' })
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.deepEqual(json, { written: true })

  const files = taskLogGlob().filter(f => f.endsWith('close-task-happy.md'))
  assert.equal(files.length, 1)
  const content = fs.readFileSync(files[0], 'utf8')
  assert.match(content, /did a thing worth logging/)
  assert.match(content, /task_id: "close-task-happy"/)
  assert.match(content, /agent: w1/)
})

test('progressEntry is genuinely optional: omitting it never creates progress.md', async () => {
  const progressPath = path.join(KB_ROOT, 'wiki/repos/test-repo/progress.md')
  assert.ok(!fs.existsSync(progressPath), 'progress.md must not exist before this test')
  const res = await postReq('test-repo', { agent_id: 'w1', task_id: 'no-progress-entry', entry: 'logged, no progress note' })
  assert.equal(res.status, 200)
  assert.ok(!fs.existsSync(progressPath), 'progress.md must still not exist -- progressEntry was not supplied')
})

test('supplying progressEntry appends it to progress.md, in addition to the task log', async () => {
  const progressPath = path.join(KB_ROOT, 'wiki/repos/test-repo/progress.md')
  const res = await postReq('test-repo', {
    agent_id: 'w1',
    task_id: 'with-progress-entry',
    entry: 'task log body',
    progressEntry: 'progress note body',
  })
  assert.equal(res.status, 200)
  assert.ok(fs.existsSync(progressPath))
  const content = fs.readFileSync(progressPath, 'utf8')
  assert.match(content, /progress note body/)
})

test('GAP: a path-traversal task_id is rejected, but only as a generic 400 that echoes the raw rejected value back to the caller', async () => {
  const res = await postReq('test-repo', { agent_id: 'w1', task_id: '../escape', entry: 'should not land anywhere' })
  assert.equal(res.status, 400)
  const json = await res.json()
  // writeRepoTaskLog() throws `Invalid task id: ${taskId}` -- the route's
  // catch-all forwards that message verbatim, indistinguishable from the
  // plain "missing required fields" 400 above by status code alone.
  assert.match(json.error, /Invalid task id/)
  assert.match(json.error, /\.\.\/escape/)

  // Confirm nothing was written anywhere under the repo's task tree.
  assert.deepEqual(taskLogGlob().filter(f => f.includes('escape')), [])
})

test('a task_id containing a path separator is rejected the same way', async () => {
  const res = await postReq('test-repo', { agent_id: 'w1', task_id: 'a/b', entry: 'should not land' })
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.match(json.error, /Invalid task id/)
})
