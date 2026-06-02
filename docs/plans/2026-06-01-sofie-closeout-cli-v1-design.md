# Sofie Closeout CLI v1 Design

**Goal:** Create a safe, repeatable closeout path that turns Hermes/business session outputs into a Sofie payload, previews every write, asks before committing business/strategy writes, then verifies receipts.

**Status:** Approved by Jay on 2026-06-01.

## Recommendation

Build an Agentic-KB native CLI first:

```bash
node cli/kb.js sofie closeout --payload /path/to/payload.json --dry-run
node cli/kb.js sofie closeout --payload /path/to/payload.json --queue
node cli/kb.js sofie closeout --payload /path/to/payload.json --commit --approved-by Jay
node cli/kb.js sofie approvals list
node cli/kb.js sofie approvals show <id>
node cli/kb.js sofie approvals approve <id> --approved-by Jay
node cli/kb.js sofie approvals reject <id>
```

This keeps all personal-vault writes inside Agentic-KB's existing closeTask and `vault_writes` governance.

## Operating Policy

Default flow:

1. Draft a Sofie payload.
2. Dry-run it.
3. Show planned Agentic-KB writes and personal-vault fanout separately.
4. Ask Jay before committing business/strategy writes.
5. Commit only with explicit approval or future standing permission.
6. Verify committed files/bus items/audit receipts.

No autonomous business/strategy vault commits unless Jay explicitly grants standing permission for that class of write.

## Payload Routing

A Sofie payload may include:

```json
{
  "project": "SellerFi",
  "taskLogEntry": "Summarized strategy session and captured next actions.",
  "decisions": [],
  "actions": [],
  "sessionSummary": {
    "title": "Session Summary",
    "body": "..."
  },
  "clientUpdates": [],
  "memoryUpdate": {
    "heading": "...",
    "body": "..."
  },
  "discoveries": [],
  "escalations": []
}
```

Routing:

| Payload field | Destination |
| --- | --- |
| `taskLogEntry` | `wiki/agents/leads/sofie/task-log.md` |
| `decisions[]` | Personal vault `06 - Decisions/**` and Agentic-KB `wiki/decisions/**` ADRs |
| `actions[]` | Personal vault `07 - Tasks/Action Tracker.md` |
| `sessionSummary` | Personal vault `04 - Sessions/**` |
| `clientUpdates[]` | Personal vault `01 - Clients/**` |
| `memoryUpdate` | Personal vault `Memory.md` |
| `discoveries[]` | Agentic-KB bus `wiki/system/bus/discovery/**` |
| `escalations[]` | Agentic-KB bus `wiki/system/bus/escalation/**` |

## Risk Classes

### `safe_to_queue`

Queue without committing:

- Internal `taskLogEntry` only.
- Routine session summaries that do not create obligations.
- Non-sensitive action suggestions where no external commitment is made.

### `ask_first`

Require explicit approval before commit:

- Business strategy decisions.
- SellerFi product, pricing, marketplace, or deal-structure decisions.
- Client updates.
- `Memory.md` updates.
- Any payload that creates an obligation for Jay.

### `blocked`

Refuse commit:

- External communication.
- Legal/financial commitments.
- Destructive vault edits.
- Paths outside Sofie's `vault_writes` allowlist.
- Malformed or ambiguous payloads.

## CLI Behavior

### Dry-run

`--dry-run` calls existing dry-run support and prints:

- Agentic-KB writes planned.
- Personal-vault writes planned.
- Rejected writes.
- Risk class.
- Whether commit would require approval.

### Queue

`--queue` stores a pending approval record under:

```text
wiki/agents/leads/sofie/pending-approvals/<id>.json
```

Each record stores:

- Original payload.
- Dry-run result.
- Risk class.
- Created timestamp.
- Status: `pending`.

### Commit

`--commit` refuses unless one of these is true:

- `--approved-by Jay` is passed.
- `--from-approval <id>` references an approved queue item.
- A future standing-permission registry explicitly permits that class.

### Verification Receipt

After commit, the CLI verifies:

- `closeTask` returned `ok: true`.
- Expected vault files exist or target append files exist.
- Expected Agentic-KB bus items appear for discoveries/escalations.
- ADR files appear when decisions are present.
- Runtime/audit traces include the close task and vault writes.
- Rejected writes count is zero.

Receipt shape:

```text
Sofie closeout receipt
- status: committed
- project: SellerFi
- approved_by: Jay
- risk: ask_first
- vault_writes:
  - 06 - Decisions/2026-06-01 - sellerfi-mvp-wedge.md
  - 07 - Tasks/Action Tracker.md
- kb_writes:
  - wiki/decisions/ADR-123-sellerfi-mvp-wedge.md
  - wiki/system/bus/discovery/...
- audit:
  - agent-close-task: ok
  - vault-write: 2
- verification: passed
```

## Implementation Target

Primary implementation repo:

```text
/Users/jaywest/Agentic-KB
```

Likely files:

- `cli/kb.js`
- `lib/agent-runtime/sofie-closeout.mjs`
- `lib/agent-runtime/vault-writeback.mjs`
- `lib/agent-runtime/writeback.mjs`
- `tests/agents/sofie-closeout.test.mjs`

Existing runtime support to preserve:

- `config/agents/sofie.yaml` owns Sofie's `vault_writes` allowlist.
- `lib/agent-runtime/writeback.mjs` already supports closeTask dry-runs and vault fanout.
- `lib/agent-runtime/vault-writeback.mjs` already enforces vault path allowlisting, atomic writes, rollback, and audit.

## Acceptance Criteria

- Dry-run shows both KB writes and vault writes separately.
- Discoveries and escalations are shown as Agentic-KB bus writes, not vault writes.
- Business/strategy writes require approval before commit.
- Commit with `--approved-by Jay` writes via Sofie's existing closeTask path.
- Queue records can be listed, shown, approved, and rejected.
- Verification receipt cites written vault paths, KB paths, and audit status.
- Existing vault-writeback tests continue to pass.
