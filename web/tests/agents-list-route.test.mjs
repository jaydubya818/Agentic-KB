// Characterization tests for web/src/app/api/agents/list/route.ts.
//
// Extends docs/NIGHTLY-BACKLOG.md's "web/ has no test suite" entry
// (2026-08-20, narrowed across prior drains): route handler 6 of the
// enumerated set, following the same pattern as tests/repos-route.test.mjs
// (fresh KB_ROOT per file, GAPs pinned not fixed). This route needs no auth
// and is not part of the requireAuth() chokepoint entry's enumeration — it
// is GET-only and read-only.
//
// The route is a 6-line pass-through: GET() calls
// listContracts(DEFAULT_KB_ROOT) from lib/agent-runtime/contracts.mjs and
// returns `{ agents: contracts }`. The behaviour worth pinning therefore
// lives almost entirely in listContracts/loadContract/validateContract, as
// seen through this route's response shape.
//
// One previously-undocumented gap pinned, not fixed: listContracts() wraps
// each loadContract() call in a try/catch and filters out any failure
// (invalid YAML, a missing required field, an unsafe agent_id) via
// `.filter(Boolean)`. A broken or invalid contract file therefore does not
// surface as an error anywhere in this route's response — it just silently
// does not appear in `agents`, indistinguishable from an agent that was
// never configured at all.
//
// Run: `npm test` in web/ (see tests/register.mjs for how .ts is loaded).
import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const KB_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-list-route-test-'))
process.env.KB_ROOT = KB_ROOT

let GET
before(async () => {
  ;({ GET } = await import('../src/app/api/agents/list/route.ts'))
})
after(() => fs.rmSync(KB_ROOT, { recursive: true, force: true }))

const AGENTS_DIR = path.join(KB_ROOT, 'config', 'agents')

beforeEach(() => {
  fs.rmSync(AGENTS_DIR, { recursive: true, force: true })
})

function writeContract(filename, text) {
  fs.mkdirSync(AGENTS_DIR, { recursive: true })
  fs.writeFileSync(path.join(AGENTS_DIR, filename), text)
}

test('GET with no config/agents directory at all returns an empty list', async () => {
  const json = await (await GET()).json()
  assert.deepEqual(json.agents, [])
})

test('GET with an empty config/agents directory returns an empty list', async () => {
  fs.mkdirSync(AGENTS_DIR, { recursive: true })
  const json = await (await GET()).json()
  assert.deepEqual(json.agents, [])
})

test('GET with one valid .yaml contract returns it, hashed and sourced', async () => {
  writeContract('architecture-agent.yaml', 'agent_id: architecture-agent\ntier: orchestrator\n')
  const json = await (await GET()).json()
  assert.equal(json.agents.length, 1)
  const c = json.agents[0]
  assert.equal(c.agent_id, 'architecture-agent')
  assert.equal(c.tier, 'orchestrator')
  assert.equal(c.contract_source_path, path.join('config', 'agents', 'architecture-agent.yaml'))
  assert.match(c.contract_hash, /^[0-9a-f]{16}$/)
})

test('GET picks up a .yml contract the same as .yaml', async () => {
  writeContract('sofie.yml', 'agent_id: sofie\ntier: worker\n')
  const json = await (await GET()).json()
  assert.equal(json.agents.length, 1)
  assert.equal(json.agents[0].agent_id, 'sofie')
})

test('GET returns multiple valid contracts, one per file', async () => {
  writeContract('architecture-agent.yaml', 'agent_id: architecture-agent\ntier: orchestrator\n')
  writeContract('sofie.yaml', 'agent_id: sofie\ntier: worker\n')
  const json = await (await GET()).json()
  const ids = json.agents.map(a => a.agent_id).sort()
  assert.deepEqual(ids, ['architecture-agent', 'sofie'])
})

test('GET ignores non-YAML files in config/agents', async () => {
  writeContract('architecture-agent.yaml', 'agent_id: architecture-agent\ntier: orchestrator\n')
  fs.writeFileSync(path.join(AGENTS_DIR, 'README.md'), '# not a contract\n')
  const json = await (await GET()).json()
  assert.equal(json.agents.length, 1)
})

test('GAP: a contract missing a required field is silently dropped, not reported as an error', async () => {
  writeContract('architecture-agent.yaml', 'agent_id: architecture-agent\ntier: orchestrator\n')
  // broken.yaml has no `tier` at all, which validateContract requires.
  writeContract('broken.yaml', 'agent_id: broken\n')
  const json = await (await GET()).json()
  assert.equal(json.agents.length, 1)
  assert.equal(json.agents[0].agent_id, 'architecture-agent')
})

test('GAP: a contract with syntactically invalid YAML is silently dropped, not reported as an error', async () => {
  writeContract('architecture-agent.yaml', 'agent_id: architecture-agent\ntier: orchestrator\n')
  // Unterminated flow sequence - a real YAML parse error, not just a bad field.
  writeContract('malformed.yaml', 'agent_id: malformed\ntier: [worker\n')
  const json = await (await GET()).json()
  assert.equal(json.agents.length, 1)
  assert.equal(json.agents[0].agent_id, 'architecture-agent')
})

test('GET derives agent_id from the filename when the contract omits it', async () => {
  writeContract('planning-agent.yaml', 'tier: lead\n')
  const json = await (await GET()).json()
  assert.equal(json.agents.length, 1)
  assert.equal(json.agents[0].agent_id, 'planning-agent')
})
