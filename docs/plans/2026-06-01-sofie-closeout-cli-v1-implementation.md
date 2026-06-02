# Sofie Closeout CLI v1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an Agentic-KB native Sofie closeout CLI that drafts/dry-runs/queues/commits governed business closeout payloads with verification receipts.

**Architecture:** Add a thin CLI surface in `cli/kb.js` that delegates all real work to a new runtime module, `lib/agent-runtime/sofie-closeout.mjs`. Reuse the existing Sofie contract, `dryRunCloseTask`, `closeTask`, `planSofieVaultOps`, and `assertVaultWriteAllowed` paths so personal-vault writes remain governed by Sofie's `vault_writes` contract. Keep v1 deterministic: payload in, plan/risk/queue/commit/receipt out.

**Tech Stack:** Node.js ESM, built-in `node:test`, Agentic-KB runtime modules, filesystem-backed approval queue, existing audit/runtime trace logs.

---

### Task 1: Add failing tests for Sofie closeout planning

**Files:**
- Create: `tests/agents/sofie-closeout.test.mjs`
- Read: `tests/agents/vault-writeback.test.mjs`
- Read: `lib/agent-runtime/writeback.mjs`
- Read: `lib/agent-runtime/vault-writeback.mjs`

**Step 1: Write the failing test file**

Create `tests/agents/sofie-closeout.test.mjs` with fixture helpers modeled after `tests/agents/vault-writeback.test.mjs`.

Include these tests first:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  classifySofieCloseoutRisk,
  planSofieCloseout,
} from '../../lib/agent-runtime/sofie-closeout.mjs'

const sofieContract = {
  agent_id: 'sofie',
  tier: 'lead',
  domain: 'business',
  allowed_writes: [
    'wiki/agents/leads/sofie/**',
    'wiki/system/bus/discovery/**',
    'wiki/system/bus/escalation/**',
    'wiki/decisions/**',
  ],
  vault_writes: [
    '06 - Decisions/**',
    '07 - Tasks/Action Tracker.md',
    '04 - Sessions/**',
    '01 - Clients/**',
    'Memory.md',
  ],
}

function makeKbRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sofie-closeout-kb-'))
  fs.mkdirSync(path.join(root, 'wiki/agents/leads/sofie'), { recursive: true })
  fs.writeFileSync(path.join(root, 'wiki/agents/leads/sofie/task-log.md'), '')
  return root
}

test('sofie closeout: discoveries and escalations plan KB bus writes only', () => {
  const root = makeKbRoot()
  const payload = {
    project: 'Agentic-KB',
    discoveries: [{ body: 'Useful pattern', priority: 'medium' }],
    escalations: [{ body: 'Needs Jay review', priority: 'high' }],
  }

  const plan = planSofieCloseout(root, sofieContract, payload)

  assert.equal(plan.risk, 'safe_to_queue')
  assert.equal(plan.vault_planned.length, 0)
  assert.ok(plan.kb_planned.some(p => p.channel === 'discovery'))
  assert.ok(plan.kb_planned.some(p => p.channel === 'escalation'))
})

test('sofie closeout: decisions plan vault decision and KB ADR', () => {
  const root = makeKbRoot()
  const payload = {
    project: 'SellerFi',
    decisions: [{ title: 'SellerFi MVP wedge', body: 'Prioritize seller financing qualification.' }],
  }

  const plan = planSofieCloseout(root, sofieContract, payload)

  assert.equal(plan.risk, 'ask_first')
  assert.ok(plan.vault_planned.some(p => p.vault_path.startsWith('06 - Decisions/')))
  assert.ok(plan.kb_planned.some(p => p.path.startsWith('wiki/decisions/')))
})

test('sofie closeout: memoryUpdate is ask_first and routes to Memory.md', () => {
  const root = makeKbRoot()
  const payload = {
    project: 'SellerFi',
    memoryUpdate: { heading: 'SellerFi context', body: 'Stable strategic context.' },
  }

  const plan = planSofieCloseout(root, sofieContract, payload)

  assert.equal(plan.risk, 'ask_first')
  assert.ok(plan.vault_planned.some(p => p.vault_path === 'Memory.md'))
})
```

**Step 2: Run tests to verify they fail**

Run:

```bash
node --test tests/agents/sofie-closeout.test.mjs
```

Expected: FAIL with module not found for `lib/agent-runtime/sofie-closeout.mjs`.

**Step 3: Commit**

Do not commit yet. Keep the failing test staged only after Task 2 creates the implementation and the tests pass.

---

### Task 2: Implement Sofie closeout planning and risk classification

**Files:**
- Create: `lib/agent-runtime/sofie-closeout.mjs`
- Modify: `tests/agents/sofie-closeout.test.mjs`

**Step 1: Create the runtime module**

Create `lib/agent-runtime/sofie-closeout.mjs`:

```js
import fs from 'fs'
import path from 'path'
import { dryRunCloseTask, closeTask } from './writeback.mjs'
import { planSofieVaultOps, assertVaultWriteAllowed } from './vault-writeback.mjs'

export function classifySofieCloseoutRisk(payload = {}) {
  if (!payload || typeof payload !== 'object') return 'blocked'

  const hasBusinessBinding =
    Array.isArray(payload.decisions) && payload.decisions.length > 0 ||
    Array.isArray(payload.clientUpdates) && payload.clientUpdates.length > 0 ||
    Boolean(payload.memoryUpdate)

  if (hasBusinessBinding) return 'ask_first'

  const hasSession = payload.sessionSummary && payload.sessionSummary.body
  const hasActions = Array.isArray(payload.actions) && payload.actions.length > 0
  if (hasSession || hasActions) return 'ask_first'

  return 'safe_to_queue'
}

export function planSofieCloseout(kbRoot, contract, payload = {}) {
  const dry = dryRunCloseTask(kbRoot, contract, { ...payload, dryRun: true })
  const vaultOps = planSofieVaultOps(payload)
  const vaultPlanned = vaultOps.map(op => {
    const guard = assertVaultWriteAllowed(op.path, contract)
    return {
      vault_path: op.path,
      kind: op.kind,
      allowed: guard.allowed,
      reason: guard.reason,
      rule: guard.rule || null,
    }
  })
  const kbPlanned = [
    ...(dry.planned || []),
  ]
  const rejected = [
    ...(dry.rejected || []),
    ...vaultPlanned.filter(op => !op.allowed),
  ]

  const risk = rejected.length > 0 ? 'blocked' : classifySofieCloseoutRisk(payload)
  return {
    would_succeed: rejected.length === 0 && dry.wouldSucceed !== false,
    risk,
    requires_approval: risk === 'ask_first',
    kb_planned: kbPlanned,
    vault_planned: vaultPlanned,
    rejected,
    dry_run: dry,
  }
}

export function commitSofieCloseout(kbRoot, contract, payload = {}, options = {}) {
  const plan = planSofieCloseout(kbRoot, contract, payload)
  if (!plan.would_succeed || plan.risk === 'blocked') {
    return { ok: false, error: 'blocked', plan }
  }
  if (plan.requires_approval && !options.approvedBy) {
    return { ok: false, error: 'approval-required', plan }
  }
  const result = closeTask(kbRoot, contract, payload)
  return {
    ok: Boolean(result.ok),
    approved_by: options.approvedBy || null,
    result,
    plan,
    receipt: buildSofieReceipt(payload, plan, result, options),
  }
}

export function buildSofieReceipt(payload, plan, result, options = {}) {
  return {
    status: result?.ok ? 'committed' : 'failed',
    project: payload.project || null,
    approved_by: options.approvedBy || null,
    risk: plan.risk,
    vault_writes: plan.vault_planned.filter(p => p.allowed).map(p => p.vault_path),
    kb_writes: plan.kb_planned.filter(p => p.allowed !== false).map(p => p.path),
    rejected: plan.rejected,
    verification: result?.ok ? 'pending-runtime-verification' : 'failed',
  }
}
```

**Step 2: Run the new tests**

Run:

```bash
node --test tests/agents/sofie-closeout.test.mjs
```

Expected: PASS for the planning tests.

**Step 3: Commit**

```bash
git add lib/agent-runtime/sofie-closeout.mjs tests/agents/sofie-closeout.test.mjs
git commit -m "feat: add Sofie closeout planning"
```

---

### Task 3: Add queue operations

**Files:**
- Modify: `lib/agent-runtime/sofie-closeout.mjs`
- Modify: `tests/agents/sofie-closeout.test.mjs`

**Step 1: Add failing queue tests**

Add tests for:

- `queueSofieCloseout` creates `wiki/agents/leads/sofie/pending-approvals/<id>.json`.
- `listSofieApprovals` returns queued records.
- `loadSofieApproval` loads the payload and plan.
- `rejectSofieApproval` marks status `rejected`.

Use deterministic IDs by passing `{ id: 'approval_test' }`.

**Step 2: Implement queue helpers**

Add exports:

```js
export function pendingApprovalsDir(kbRoot) {
  return path.join(kbRoot, 'wiki/agents/leads/sofie/pending-approvals')
}

export function queueSofieCloseout(kbRoot, contract, payload, options = {}) {
  const id = options.id || `sofie-${new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)}`
  const plan = planSofieCloseout(kbRoot, contract, payload)
  const dir = pendingApprovalsDir(kbRoot)
  fs.mkdirSync(dir, { recursive: true })
  const record = {
    id,
    status: 'pending',
    created_at: new Date().toISOString(),
    risk: plan.risk,
    requires_approval: plan.requires_approval,
    payload,
    plan,
  }
  fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(record, null, 2) + '\n')
  return record
}

export function listSofieApprovals(kbRoot) {
  const dir = pendingApprovalsDir(kbRoot)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
}

export function loadSofieApproval(kbRoot, id) {
  const full = path.join(pendingApprovalsDir(kbRoot), `${id}.json`)
  if (!fs.existsSync(full)) throw new Error(`approval not found: ${id}`)
  return JSON.parse(fs.readFileSync(full, 'utf8'))
}

export function updateSofieApprovalStatus(kbRoot, id, status, extra = {}) {
  const record = loadSofieApproval(kbRoot, id)
  const next = { ...record, ...extra, status, updated_at: new Date().toISOString() }
  fs.writeFileSync(path.join(pendingApprovalsDir(kbRoot), `${id}.json`), JSON.stringify(next, null, 2) + '\n')
  return next
}
```

**Step 3: Run tests**

Run:

```bash
node --test tests/agents/sofie-closeout.test.mjs
```

Expected: PASS.

**Step 4: Commit**

```bash
git add lib/agent-runtime/sofie-closeout.mjs tests/agents/sofie-closeout.test.mjs
git commit -m "feat: queue Sofie closeout approvals"
```

---

### Task 4: Add CLI commands

**Files:**
- Modify: `cli/kb.js`
- Modify: `tests/agents/sofie-closeout.test.mjs`

**Step 1: Inspect existing agent CLI patterns**

Read these sections in `cli/kb.js`:

- Usage text around lines 90-110.
- Agent context handling around line 902.
- Agent close-task handling around line 1032.
- Agent dry-run-close-task handling around line 1090.

**Step 2: Add CLI usage lines**

Add usage text:

```text
kb sofie closeout --payload <file.json> [--dry-run|--queue|--commit] [--approved-by <name>] [--from-approval <id>]
kb sofie approvals list|show|approve|reject <id> [--approved-by <name>]
```

**Step 3: Add a `sofie` top-level branch**

In `cli/kb.js`, add a branch before the final unknown-command handler:

```js
if (cmd === 'sofie') {
  const sub = args[1]
  // parse closeout and approvals commands here
}
```

Use existing helpers for argument parsing if present. If no helper exists, keep a tiny local parser matching the existing style.

**Step 4: Wire closeout command**

Behavior:

- Load Sofie's contract from `config/agents/sofie.yaml` using existing contract loader if exported; otherwise mirror existing agent CLI lookup.
- Read `--payload` JSON.
- `--dry-run`: print plan and exit 0 if `would_succeed`.
- `--queue`: call `queueSofieCloseout`, print ID and risk.
- `--commit`: call `commitSofieCloseout`; require `--approved-by` for `ask_first` risk.
- `--from-approval`: load queued payload and commit with approval.

**Step 5: Wire approvals command**

Behavior:

- `list`: print ID, status, risk, created_at.
- `show <id>`: print JSON record.
- `approve <id> --approved-by Jay`: commit payload, mark approval record `committed` with receipt.
- `reject <id>`: mark approval record `rejected`.

**Step 6: Run CLI smoke tests manually**

Create a temp payload:

```bash
cat >/tmp/sofie-closeout-smoke.json <<'JSON'
{
  "project": "Agentic-KB",
  "taskLogEntry": "Smoke-tested Sofie closeout planning.",
  "discoveries": [{ "body": "Sofie closeout CLI routes discoveries to the KB bus." }]
}
JSON
```

Run:

```bash
node cli/kb.js sofie closeout --payload /tmp/sofie-closeout-smoke.json --dry-run
node cli/kb.js sofie closeout --payload /tmp/sofie-closeout-smoke.json --queue
node cli/kb.js sofie approvals list
```

Expected: dry-run prints KB bus plan, queue prints pending ID, list shows pending record.

**Step 7: Run tests**

Run:

```bash
node --test tests/agents/sofie-closeout.test.mjs tests/agents/vault-writeback.test.mjs
```

Expected: PASS.

**Step 8: Commit**

```bash
git add cli/kb.js lib/agent-runtime/sofie-closeout.mjs tests/agents/sofie-closeout.test.mjs
git commit -m "feat: add Sofie closeout CLI"
```

---

### Task 5: Add commit verification receipts

**Files:**
- Modify: `lib/agent-runtime/sofie-closeout.mjs`
- Modify: `tests/agents/sofie-closeout.test.mjs`

**Step 1: Add failing receipt tests**

Add tests that assert `buildSofieReceipt` includes:

- `status`
- `project`
- `approved_by`
- `risk`
- `vault_writes`
- `kb_writes`
- `rejected`
- `verification`

Add one test where a decision payload includes both a `06 - Decisions/**` vault path and a `wiki/decisions/**` KB path.

**Step 2: Improve receipt generation**

Enhance `buildSofieReceipt` so `verification` becomes an object:

```js
verification: {
  close_task_ok: Boolean(result?.ok),
  rejected_count: plan.rejected.length,
  vault_write_count: plan.vault_planned.filter(p => p.allowed).length,
  kb_write_count: plan.kb_planned.filter(p => p.allowed !== false).length,
}
```

**Step 3: Add receipt printer**

Add:

```js
export function formatSofieReceipt(receipt) {
  const lines = [
    'Sofie closeout receipt',
    `- status: ${receipt.status}`,
    `- project: ${receipt.project || ''}`,
    `- approved_by: ${receipt.approved_by || ''}`,
    `- risk: ${receipt.risk}`,
    '- vault_writes:',
    ...receipt.vault_writes.map(p => `  - ${p}`),
    '- kb_writes:',
    ...receipt.kb_writes.map(p => `  - ${p}`),
    `- verification: ${receipt.verification.close_task_ok && receipt.verification.rejected_count === 0 ? 'passed' : 'failed'}`,
  ]
  return lines.join('\n')
}
```

Use `formatSofieReceipt` in the CLI commit/approve paths.

**Step 4: Run tests**

Run:

```bash
node --test tests/agents/sofie-closeout.test.mjs tests/agents/vault-writeback.test.mjs
```

Expected: PASS.

**Step 5: Commit**

```bash
git add lib/agent-runtime/sofie-closeout.mjs tests/agents/sofie-closeout.test.mjs cli/kb.js
git commit -m "feat: add Sofie closeout receipts"
```

---

### Task 6: Final verification and docs

**Files:**
- Modify: `README.md` or `CONTRIBUTING.md`
- Modify: `docs/plans/2026-06-01-sofie-closeout-cli-v1-design.md` only if the implementation changes the approved design.

**Step 1: Add docs snippet**

Add a concise section to `README.md` under Sofie Integration:

```markdown
#### Sofie closeout CLI

Use this for governed business/session closeout. Default flow is draft → dry-run → approval → commit → receipt.

```bash
node cli/kb.js sofie closeout --payload payload.json --dry-run
node cli/kb.js sofie closeout --payload payload.json --queue
node cli/kb.js sofie approvals list
node cli/kb.js sofie approvals approve <id> --approved-by Jay
```

Discoveries/escalations route to Agentic-KB bus paths. Decisions/actions/session summaries/client updates/memory updates route through Sofie's personal-vault `vault_writes` allowlist.
```

**Step 2: Run focused tests**

Run:

```bash
node --test tests/agents/sofie-closeout.test.mjs tests/agents/vault-writeback.test.mjs
```

Expected: PASS.

**Step 3: Run broader agent tests**

Run:

```bash
node --test tests/agents/*.test.mjs
```

Expected: PASS. If unrelated existing tests fail, capture the exact failing tests and do not claim full suite pass.

**Step 4: Run git diff check**

Run:

```bash
git diff --check
```

Expected: no output, exit 0.

**Step 5: Commit docs/final polish**

```bash
git add README.md docs/plans/2026-06-01-sofie-closeout-cli-v1-design.md
git commit -m "docs: document Sofie closeout CLI"
```

---

## Implementation Notes

- Do not write directly to `/Users/jaywest/Documents/Obsidian Vault`. All writes must go through Sofie's existing `closeTask` path.
- Do not treat `discoveries[]` or `escalations[]` as vault writes. They are Agentic-KB bus writes.
- Preserve existing `vault-writeback` behavior and tests.
- Keep v1 simple: no Hermes wrapper, no dashboard, no standing-permission registry yet.
- Commit after each passing slice.

## Execution Options

Plan complete and saved to `docs/plans/2026-06-01-sofie-closeout-cli-v1-implementation.md`. Two execution options:

1. Subagent-Driven in this session — dispatch focused implementation workers task-by-task, review between tasks, fastest iteration.
2. Parallel Session — open a separate session in Agentic-KB using executing-plans, with checkpoints and less current-chat coupling.
