// Context-bundle snapshot tests.
// Loads each real contract, computes the scoped context bundle against the live
// wiki tree, and compares the included file list to a committed snapshot.
// Any contract or context_policy edit that changes scope becomes visible in diff.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { listContracts, loadAgentContext } from '../../lib/agent-runtime/index.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const KB_ROOT = path.resolve(__dirname, '..', '..')
const SNAPSHOT_DIR = path.join(__dirname, 'fixtures', 'context-snapshots')
const UPDATE = process.env.UPDATE_SNAPSHOTS === '1'

fs.mkdirSync(SNAPSHOT_DIR, { recursive: true })

function bundleShape(bundle) {
  return {
    agent_id: bundle.agent_id,
    tier: bundle.tier,
    files: (bundle.files || [])
      .map(f => ({ path: f.path, class: f.class }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    trace_summary: {
      included: (bundle.trace?.included || []).length,
      excluded: (bundle.trace?.excluded || []).length,
      truncated: bundle.trace?.truncated || false,
    },
  }
}

for (const contract of listContracts(KB_ROOT)) {
  test(`context snapshot: ${contract.agent_id}`, () => {
    const bundle = loadAgentContext(KB_ROOT, contract, {
      project: 'example-project',
      domain: contract.domain || 'platform',
      agent: contract.agent_id,
    })
    const actual = bundleShape(bundle)
    const fixturePath = path.join(SNAPSHOT_DIR, `${contract.agent_id}.json`)
    const serialized = JSON.stringify(actual, null, 2) + '\n'

    if (UPDATE || !fs.existsSync(fixturePath)) {
      fs.writeFileSync(fixturePath, serialized)
      // First run or explicit update — self-pass but flag.
      console.error(`[snapshot ${UPDATE ? 'updated' : 'created'}] ${contract.agent_id}`)
      return
    }

    const expected = fs.readFileSync(fixturePath, 'utf8')
    if (serialized !== expected) {
      const diff = `Snapshot drift for ${contract.agent_id}.\n` +
        `  Run UPDATE_SNAPSHOTS=1 node --test tests/agents/context-snapshots.test.mjs to accept.\n` +
        `  Expected:\n${expected}\n  Actual:\n${serialized}`
      assert.fail(diff)
    }
  })
}
