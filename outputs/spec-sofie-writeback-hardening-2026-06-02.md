# Sofie Writeback Hardening — Spec + Implementation Plan

Date: 2026-06-02
Owner: Jay West
Scope: Agentic-KB Sofie runtime + sanctioned Obsidian Vault writeback
Status: Draft

## 1. Why this exists

Sofie already has a sanctioned, bounded bridge into the personal Obsidian vault.
That bridge is useful, but still too trusting at the last mile. The next upgrade
should make Sofie writeback safer, more reviewable, more idempotent, and easier
to debug without weakening her speed.

Current sanctioned vault surface:

- `06 - Decisions/**`
- `07 - Tasks/Action Tracker.md`
- `04 - Sessions/**`
- `01 - Clients/**`
- `Memory.md`

Current implementation anchors:

- `config/agents/sofie.yaml`
- `lib/agent-runtime/writeback.mjs`
- `lib/agent-runtime/vault-writeback.mjs`
- `tests/agents/vault-writeback.test.mjs`

## 2. Product goal

Make Sofie's vault writeback path feel like a boring, trustworthy transaction:

- previewable before commit
- validated before planning
- deduped before write
- contradiction-aware before append/create
- auditable after commit

## 3. Non-goals

- Expanding Sofie's allowed vault paths
- Turning Sofie into a freeform vault editor
- Letting non-Sofie agents write directly to the personal vault
- Replacing the current transaction model with async eventual consistency
- Building a full GUI first

## 4. Problems in the current state

### P1. No first-class human-readable plan artifact
Dry-run exists, but there is no rich writeback plan that shows exact proposed
vault writes, rationale, guard result, dedupe result, and contradiction result
in one structured object.

### P2. Duplicate writes are easy
Repeated close-task payloads can create duplicate decisions, duplicate session
summaries, duplicate action lines, and repeated Memory updates.

### P3. Payload validation is too loose
`planSofieVaultOps()` accepts broad shapes and infers behavior, but lacks a
strict schema contract for dates, required fields, max lengths, and enums.

### P4. Contradiction checks are shallow
The runtime guards paths, but not semantic conflicts like:

- a decision title that already exists with different body/rationale
- a client update that materially conflicts with recent client notes
- a memory update that collides with an existing memory statement

### P5. Post-write receipts are too runtime-centric
Audit exists, but operators need a concise receipt that explains what changed in
plain terms and how to roll it back.

## 5. Target capabilities

### C1. Writeback plan preview
New runtime capability returns a structured preview before commit.

Must include for every proposed op:

- `kind`
- `path`
- `source_field`
- `allowed`
- `allow_rule`
- `dedupe_status`
- `contradiction_status`
- `summary`
- `content_preview`
- `requires_review`

### C2. Idempotency / dedupe
The runtime should detect whether a payload would create a materially duplicate:

- decision
- session note
- action tracker line
- client update block
- memory update block

Outcomes:

- `new`
- `duplicate_skip`
- `duplicate_merge`
- `review_required`

### C3. Strict payload schema
Introduce a single validated close-task payload schema for Sofie writeback.

Minimum shape:

```json
{
  "project": "string",
  "taskLogEntry": "string",
  "decisions": [],
  "actions": [],
  "sessionSummary": null,
  "clientUpdates": [],
  "discoveries": [],
  "memoryUpdate": null
}
```

Validation rules:

- unknown top-level fields rejected or warned explicitly
- empty strings normalized or rejected consistently
- `deadline` must be `YYYY-MM-DD`
- title/body max lengths
- required fields per item type enforced
- invalid payloads fail before planning

### C4. Contradiction checks
Before commit, compare proposed writes against current vault state.

Initial checks:

- decision title collision with different normalized content
- session title/date collision with materially different body
- client update with same date and high-overlap content
- memory update overlap with conflicting clause text

Outcomes:

- `clear`
- `possible_duplicate`
- `possible_conflict`
- `blocked`

### C5. Human-readable receipt
Every successful commit should emit a compact receipt object and markdown-style
summary that says:

- who wrote
- when
- what files changed
- which items were skipped as duplicates
- which items required review but were not committed
- rollback guidance

## 6. User stories

### US1. Jay wants confidence before write
As Jay, when Sofie proposes a vault update, I want to see the exact plan before
commit so I can trust what will happen.

### US2. Jay wants no duplicate clutter
As Jay, when Sofie receives repeated payloads, I want duplicates skipped or
merged so the vault stays clean.

### US3. Jay wants conflicts surfaced, not hidden
As Jay, if Sofie is about to write something that conflicts with an existing
decision or memory note, I want it routed to review instead of silently landing.

### US4. Operator wants explainability
As an operator, after a commit I want a receipt showing exactly what happened
and how to unwind it if needed.

## 7. Functional requirements

### FR1. Add plan API at runtime level
Add a new plan function in `lib/agent-runtime/vault-writeback.mjs`:

- `previewSofieVaultFanout(contract, payload, options?)`

Returns:

- validated payload summary
- planned ops
- guard results
- dedupe results
- contradiction results
- commit recommendation

### FR2. Add strict payload validator
Add a validator module, preferably:

- `lib/agent-runtime/sofie-payload-schema.mjs`

Responsibilities:

- parse
- validate
- normalize
- return typed/normalized payload

### FR3. Add dedupe engine
Add a helper module, preferably:

- `lib/agent-runtime/sofie-dedupe.mjs`

Responsibilities:

- inspect target file state
- compute normalized fingerprints
- classify duplicate/merge/new/review

### FR4. Add contradiction engine
Add a helper module, preferably:

- `lib/agent-runtime/sofie-contradictions.mjs`

Responsibilities:

- inspect existing file content
- detect title collisions / semantic mismatches
- return explainable conflict findings

### FR5. Add receipt generation
Add a helper module, preferably:

- `lib/agent-runtime/sofie-receipts.mjs`

Responsibilities:

- produce JSON receipt
- optionally produce markdown/plaintext receipt summary

### FR6. Wire preview into dry-run close-task
`dry-run-close-task` for Sofie should include vault preview fields, not just raw
planned writes.

### FR7. Preserve all-or-nothing commit semantics
If any committed op fails, rollback remains mandatory.

### FR8. Preserve path allowlist enforcement
No dedupe or contradiction logic may bypass `vault_writes` path rules.

## 8. Suggested architecture

### Existing flow

`close-task` → `writeback.mjs` → `runSofieVaultFanout()` → plan ops → guard → commit/rollback

### Proposed flow

`close-task` → validate payload → preview plan → dedupe/contradiction classify →
filter/annotate ops → optional review gate → commit allowed ops transactionally → receipt

### Proposed modules

- `lib/agent-runtime/sofie-payload-schema.mjs`
- `lib/agent-runtime/sofie-dedupe.mjs`
- `lib/agent-runtime/sofie-contradictions.mjs`
- `lib/agent-runtime/sofie-receipts.mjs`

### Minimal integration points

- `lib/agent-runtime/vault-writeback.mjs`
- `lib/agent-runtime/writeback.mjs`
- `tests/agents/vault-writeback.test.mjs`

## 9. Data model sketch

### Preview result

```json
{
  "ok": true,
  "payload_valid": true,
  "requires_review": false,
  "ops": [
    {
      "kind": "create",
      "path": "06 - Decisions/2026-06-02-ship-foo.md",
      "source_field": "decisions[0]",
      "allowed": true,
      "allow_rule": "06 - Decisions/**",
      "dedupe_status": "new",
      "contradiction_status": "clear",
      "summary": "Create decision note for Ship Foo",
      "content_preview": "# Ship Foo ...",
      "requires_review": false
    }
  ],
  "warnings": [],
  "blocked": []
}
```

### Receipt result

```json
{
  "ok": true,
  "agent_id": "sofie",
  "timestamp": "2026-06-02T...Z",
  "committed": ["06 - Decisions/..."],
  "skipped_duplicates": ["07 - Tasks/Action Tracker.md"],
  "review_deferred": [],
  "rollback_hint": "See audit entry + restore previous file content snapshot"
}
```

## 10. Review policy

These cases should be review-gated instead of auto-committed:

- same decision title, materially different body
- same session slug/date, materially different content
- same client/date block with conflicting claims
- memory update that negates an existing memory statement
- payload schema valid but semantically ambiguous

Review gate behavior:

- dry-run returns `requires_review: true`
- real commit either blocks or commits only safe subset depending on mode

Recommended default:

- block on conflict
- skip harmless duplicates
- commit only clear ops

## 11. Testing plan

### Unit tests
Extend `tests/agents/vault-writeback.test.mjs` with cases for:

1. payload schema rejects malformed decisions
2. payload schema rejects bad deadlines
3. duplicate decision is skipped
4. duplicate action line is skipped
5. conflicting decision is review-gated
6. conflicting session summary is review-gated
7. receipt is produced on success
8. preview includes allowlist + dedupe + contradiction fields

### Integration tests

9. dry-run close-task for Sofie returns enhanced preview
10. real close-task with mixed ops commits clear items and skips duplicates (or blocks, depending on chosen policy)
11. rollback still succeeds if one vault write fails mid-transaction

### Manual proving commands

```bash
node --test tests/agents/vault-writeback.test.mjs
node cli/kb.js agent dry-run-close-task sofie --payload /tmp/sofie-payload.json
node cli/kb.js agent close-task sofie --payload /tmp/sofie-payload.json
```

## 12. Implementation plan

### Phase 1 — Schema + preview spine
Goal: make dry-run trustworthy.

Tasks:

1. add `sofie-payload-schema.mjs`
2. normalize payloads before `planSofieVaultOps()`
3. add `previewSofieVaultFanout()`
4. return enhanced preview from dry-run path
5. add schema/preview tests

Exit criteria:

- malformed payloads fail early
- dry-run returns rich plan output
- existing commit behavior still works

### Phase 2 — Dedupe
Goal: keep vault clean.

Tasks:

1. add fingerprinting helpers per artifact type
2. classify `new` vs `duplicate_skip` vs `duplicate_merge`
3. skip harmless duplicates in preview + commit path
4. add tests for repeated close-task payloads

Exit criteria:

- repeated payload does not create duplicate decision/session/action noise

### Phase 3 — Contradiction checks
Goal: catch semantic conflicts before write.

Tasks:

1. add contradiction helpers
2. compare against existing target files before commit
3. mark review-required ops
4. choose final policy: block-all-on-conflict vs commit-safe-subset
5. add tests for conflicting decision/session/memory cases

Exit criteria:

- obviously conflicting writes do not silently land

### Phase 4 — Receipts + operator ergonomics
Goal: make outcomes inspectable.

Tasks:

1. generate structured receipt after commit
2. append receipt metadata to audit trace
3. optionally emit markdown/plaintext receipt in dry-run and commit responses
4. document rollback guidance

Exit criteria:

- operators can explain exactly what Sofie changed without reading raw audit internals

### Phase 5 — Optional approval UX
Goal: make review human-friendly.

Tasks:

1. expose preview cleanly in CLI / web / MCP surfaces
2. add explicit “approve this exact plan” flow if desired
3. persist plan hash to ensure commit matches previewed plan

Exit criteria:

- Jay can preview then approve exact write set with high trust

## 13. Recommended build order

Build in this order:

1. schema validation
2. preview result shape
3. dedupe
4. contradiction detection
5. receipts
6. approval UX

Reason: this gets trust gains early without forcing a heavy UI dependency.

## 14. Risks

### R1. Overfitting dedupe logic
If duplicate detection is too aggressive, legitimate repeated updates may vanish.

Mitigation:
- prefer `review_required` over silent merge when uncertain

### R2. False contradiction flags
Naive text overlap can block good writes.

Mitigation:
- start with simple deterministic heuristics
- only escalate obvious collisions first

### R3. Preview/commit drift
If preview and commit do not share the same plan logic, trust breaks.

Mitigation:
- preview should call the exact same planning pipeline used by commit

### R4. Scope creep into general vault editing
This should remain a bounded writeback system.

Mitigation:
- keep writeback payload-driven and path-allowlisted

## 15. Success metrics

- zero out-of-scope vault writes
- materially fewer duplicate Sofie artifacts
- dry-run outputs are understandable without code inspection
- conflict cases route to review, not silent append
- successful writes always produce concise receipts

## 16. Immediate recommendation

Start with Phase 1 + Phase 2 only.

That yields the fastest trust improvement:

- strict schema
- rich preview
- duplicate suppression

Then add contradiction checks once the preview surface is stable.
