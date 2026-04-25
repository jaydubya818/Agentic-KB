---
repo_name: Pi
repo_visibility: private
source_type: github
branch: main
commit_sha: 1a669c97bc2760e9298c6ff3d892feea5426fc09
source_path: "Agentic-Pi-Harness-PLAN-v4.1-FINAL.md"
imported_at: "2026-04-25T16:05:44.775Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Pi/main/Agentic-Pi-Harness-PLAN-v4.1-FINAL.md"
---

# Agentic Pi Harness — v4.1 FINAL Project Plan

**Status: final. Stop rewriting. Start building.**

v4.1 accepts v2 + v3 + v4 in full and incorporates the final review. This is the last planning document before code. Further refinement happens in ADRs and code review, not in new plan revisions.

---

## 0. Framing (new, at the top)

**Interactive v0.1 is the product. Worker/autonomous mode is a preview feature-flagged behind Tier B.**

If the calendar slips, v0.1 ships with `executionMode: "worker"` disabled at runtime, with a clear error. This is stated bluntly so no one builds expectations around unattended runs landing in the first tag.

### The golden path — one canonical use case drives delivery order
Every Phase 1–2 task is ordered by its contribution to this single scenario:

> **Investigate a failing test → edit one file in `assist` mode → capture effect log → write replay tape → verify tape → inspect policy decision placeholders → run `pi-harness what-changed` and see the diff.**

By end of Week 2, this path must run end-to-end using mock provider + one real tool (`read_file`) + one real mutating tool (`edit_file`). If that demo does not work by Friday of Week 2, the plan is off track and the team stops adding scope until it does.

### Tier A is split into two buckets
To prevent "Tier A complete on paper, product still invisible":

**Tier A-runtime** — the plumbing
- query loop with phase skeleton
- replay recorder with versioned header + hash chain
- provenance manifest writer
- effect recorder (minimum spec, §4 below)
- Zod schemas for every persisted type
- crash-safe write-rename persistence
- prompt-injection containment wrapping

**Tier A-proof** — the visible demo
- one real golden tape captured from the golden path
- one effect log example with a real diff
- one `pi-harness what-changed` run against that session
- one `pi-harness verify` run that passes
- one baseline scenario eval (the golden path itself)

**v0.1 cannot ship unless both A-runtime and A-proof are green.** Proof prevents abstraction drift.

---

## 1. Golden-tape gate softened

v4 required 5 tapes at Level A + B + C for v0.1. Softened:

**Hard v0.1 gate:**
- [ ] replay-drift CI skeleton green
- [ ] ≥1 golden tape passing at Level A **and** Level B **and** Level C
- [ ] ≥5 total golden tapes passing at Level A (events only)

**Soft gate (target, not blocker):**
- 5 tapes passing at all three levels. If not met, expand B/C tape coverage in v0.1.1.

Rationale: Level B/C determinism can be brittle while core behavior is still settling. One tape at all three levels proves the contract holds; five at Level A proves the event pipeline is stable.

---

## 2. Placeholder policy decisions — explicit shape

v4 said "let the loop write placeholder decisions day one." v4.1 defines what a placeholder looks like:

```ts
type PolicyDecision = {
  schemaVersion: 1
  toolCallId: string
  result: "approve" | "block" | "ask" | "sandbox" | "mutate" | "require_confirmation"
  provenanceMode: "placeholder" | "full"   // NEW in v4.1
  modeInfluence: Mode
  manifestInfluence?: { field: string; value: string }
  ruleEvaluation: Array<RuleEvalEntry>
  evaluationOrder: string[]
  winningRuleId?: string
  hookDecision?: { hookId: string; decision: string; reason?: string }
  mutatedByHook: boolean
  approvalRequiredBy: "mode" | "rule" | "manifest" | "hook" | null
  policyDigest: string
}
```

**Placeholder decisions (Phase 1 loop writes these):**
```ts
{
  schemaVersion: 1,
  toolCallId,
  result: "approve",
  provenanceMode: "placeholder",   // <-- the tell
  modeInfluence: ctx.executionMode,
  ruleEvaluation: [],
  evaluationOrder: [],
  mutatedByHook: false,
  approvalRequiredBy: null,
  policyDigest: ctx.policyDigest
}
```

**Full decisions (Phase 3 policy engine writes these):** `provenanceMode: "full"`, with real rule evaluation populated.

Replay-drift CI at Level C treats any session with mixed modes as a soft warning, not a failure — expected while the engine is being built.

---

## 3. Minimum viable effect runtime

v4.1 defines the floor and the ceiling for v0.1 effect capture. No gold-plating in Week 1.

**Required for v0.1:**
```ts
type EffectRecord = {
  schemaVersion: 1
  toolCallId: string         // linkage to tool dispatch
  sessionId: string
  timestamp: string
  paths: string[]            // touched paths, sorted
  preHashes: Record<string, string>   // path → sha256 (pre-mutation)
  postHashes: Record<string, string>  // path → sha256 (post-mutation)
  unifiedDiff?: string       // for text files only
  binaryChanged: boolean     // true if any touched path is binary
  rollbackRef?: string       // path to snapshot; optional in v0.1
}
```

**Explicitly NOT required for v0.1:**
- Perfect rollback for every tool (rollback is Tier B)
- Fancy diff rendering (raw unified diff is enough)
- Recursive directory snapshots (only tools with known path lists snapshot)
- External side-effect introspection (network, email, etc.)
- Semantic effect grouping ("this edit was part of refactor X")
- Effect deduplication across tool calls

Any PR that adds features to the effect runtime beyond this list in Phase 1 is rejected with "save it for v0.2."

---

## 4. Terminology cleanup — EffectRecord vs audit records

v4.1 draws a hard line:

- **`EffectRecord`** = *mutation*. One per mutating tool call. Period.
- **`ToolAuditRecord`** = tool execution metadata (start/end time, exit code, stderr tail, size cap hits). Emitted for every tool call, mutating or not.
- **`SanitizationRecord`** = fired when prompt-injection sanitization rewrites tool output. Emitted at the loop level, not the tool level.

All three go to the replay tape as distinct record types. `what-changed` queries only `EffectRecord`. `verify` checks all three. This keeps "effect" semantically clean.

---

## 5. Signed-policy canonicalization — nail it in SCHEMAS.md

v4.1 commits to a specific canonicalization so signatures don't drift:

**Canonical form for signing:**
1. Parse JSON.
2. Recursively sort object keys lexicographically.
3. Emit with no whitespace, UTF-8, `\n` line endings, no trailing newline.
4. Prepend a fixed header: `pi-policy-v1\n`.
5. HMAC-SHA256 with the key at `~/.pi/keys/worker.key`.
6. Store hex-encoded signature at `<policy-file>.sig` alongside a `validFrom` ISO timestamp.

This exact procedure lives in `docs/SCHEMAS.md` as the source of truth. Any deviation = the fix is to match the spec, not update the spec.

---

## 6. Hash-chain overhead — concrete thresholds

v4's mitigation said "chain if overhead exceeds threshold." v4.1 nails the numbers:

- **Benchmark**: measure record-write latency on (a) a 100-turn synthetic session and (b) a 1000-turn synthetic session.
- **Budget**: hash-chain must add ≤2ms p99 per record and ≤2% total session wall-clock overhead.
- **If exceeded**: switch to **chunked chaining** — hash every 16 records into a chain node, chain the nodes. Reduces per-record work 16× at the cost of coarser tamper resolution (detect within a 16-record window instead of exact).
- **Chunk size is tunable**: `PI_HASH_CHUNK_SIZE` env var, defaults to 1.
- Benchmark runs in CI nightly; regression opens an issue.

---

## 7. Delivery risk — added to the risk register

| Risk | Mitigation |
|---|---|
| Tier A foundations delay visible demos; team morale + stakeholder confidence erode | End-of-Week-2 golden-path demo is a **hard gate**. Minimal Tier A slice (replay header + provenance + basic effect + one golden tape + one safe edit) must run end-to-end. Weekly standup agenda item: "can we still run the golden path?" If no, halt new feature work. |

---

## 8. Ship-criteria clarification

v4.1 §14 replacement, unambiguous:

- **Every Tier A box must be checked for v0.1 to tag.** No exceptions.
- **Tier B boxes gate autonomous/worker mode enablement.** v0.1 can tag with Tier B incomplete; in that case the runtime hard-errors on `executionMode: "worker"` with "worker mode not available in this build (Tier B incomplete)."
- **Tier C boxes are tracked in `docs/ROADMAP.md` v0.2 column.** They are not v0.1 concerns.

---

## 9. New enhancements (from me, not in v2/v3/v4)

Keeping scope sane, these are small additions that cost little and pay for themselves fast:

### 9.1 `pi-harness doctor` CLI (Tier A-proof)
One command that checks:
- Node version
- git version (worktree requires ≥2.5)
- write access to `~/.pi/`
- presence of `~/.pi/keys/worker.key` (warn if missing)
- schema version compatibility of any existing tapes
- `pi-upstream` reference repo reachable if configured
- provider API key present

Runs in ≤1 second. First thing a new contributor runs. First thing CI runs in pre-check step.

### 9.2 Structured error types with error codes (Tier A-runtime)
Every error thrown by the harness carries:
```ts
class PiHarnessError extends Error {
  code: string            // "RETRY_EXHAUSTED" | "POLICY_DENIED" | "SCHEMA_MISMATCH" | ...
  severity: "warn" | "error" | "fatal"
  retryable: boolean
  context: Record<string, unknown>
}
```
Error codes are enumerated in `src/errors.ts`. The loop dispatches on `code`, never on `message`. Message strings are logs-only; tests assert on code. This makes every error case both grep-able and localizable.

### 9.3 Snapshot-test the system prompt (Tier A-runtime)
`src/loop/systemPrompt.ts` is a pure function; snapshot its output in tests. Any unintended change to the prompt fails CI. Prevents silent prompt drift — one of the highest-leverage regressions in an agent codebase.

### 9.4 `--trace` mode (Tier A-proof)
`pi-harness run --trace <prompt>` dumps every StreamEvent to stderr as it happens, with phase labels. For the first weeks this is the primary debug aid. Free once the event pipeline exists.

### 9.5 Pre-commit hook for schema drift (Tier A-runtime)
`.husky/pre-commit` runs `tsc --noEmit` + `vitest run schemas/` + a small script that verifies every Zod schema exports `schemaVersion`. Impossible to land a schema without a version number.

### 9.6 Observability-lite in v0.1 (compromise between "nothing" and "OTel")
Not full OpenTelemetry yet — too much setup for v0.1. Instead:
- `src/metrics/counter.ts` with a plain in-memory counter API
- Counters: `turns_total`, `retries_total{class}`, `compactions_total{strategy}`, `policy_decisions_total{result}`, `tool_calls_total{name,outcome}`, `effects_total`
- Dumped to `~/.pi/metrics/<sessionId>.json` on session end
- OTel wiring lives behind a `PI_OTEL=1` env flag, ships empty in v0.1
- Upgrade to full OTel exporters is a v0.2 Tier C item

Gives us real numbers on day one without the deployment tail.

### 9.7 Session labels + tags (Tier A-runtime, free)
`SessionContext.labels?: Record<string,string>`. Any caller can attach arbitrary key/value metadata at session start (`role:refactor`, `ticket:PI-123`, `env:dev`). Carried into provenance manifest, metrics, replay tape header. Makes later analytics trivial ("show me all sessions tagged `ticket:PI-123` that exceeded budget").

### 9.8 Deterministic child session IDs (Tier A-runtime)
Child sessionIds are derived, not random: `sha256(parentSessionId + childSlug + parentTurnIndex)`. Replay becomes trivially reproducible across parent/child boundaries without carrying a seed table.

### 9.9 Pin Node + pnpm versions via `.tool-versions` (Tier A-runtime, 30 seconds of work)
Rules out "works on my machine" for the entire runtime layer.

### 9.10 ADR-driven decision history (Tier A-runtime, cultural)
Every non-trivial architectural choice post-v4.1 must have an ADR in `docs/ADRs/NNNN-title.md`. Template: Context / Decision / Consequences / Alternatives / Revisit-If. Prevents the plan document from becoming the only source of truth.

---

## 10. Final immediate next actions

Supersedes v3 §Q and v4 §16. Executing now:

1. **Scaffold** `Agentic-Pi-Harness/` sibling project with package.json, tsconfig, directory tree.
2. **Write docs first**:
   - `docs/THREAT-MODEL.md`
   - `docs/REPLAY-MODEL.md` (A/B/C layers + tolerated fields)
   - `docs/PROMPT-ASSEMBLY.md` (untrusted-data principle)
   - `docs/HOOK-SECURITY.md`
   - `docs/SCHEMAS.md` (versioning + canonicalization)
   - `docs/GOLDEN-PATH.md` (the canonical scenario)
   - `docs/ADRs/0001-scope-tiering.md`
3. **Write Zod schemas** for every persisted type with `schemaVersion` fields.
4. **Implement types.ts** from the schemas.
5. **Stub `pi-adapter.ts`** seam (Pi integration isolated here).
6. **Implement `effect/recorder.ts`** at the minimum spec.
7. **Implement `replay/recorder.ts`** with versioned header + hash chain.
8. **Implement `policy/decision.ts`** with the placeholder shape.
9. **Implement `loop/query.ts`** wiring the above with crash-safe checkpoint writes and `<tool_output trusted="false">` wrapping from commit #1.
10. **Land one golden tape** and the replay-drift CI workflow.
11. **Write README.md** with quickstart + golden-path walkthrough.
12. **Tag first commit**: `chore: scaffold agentic pi harness v0.0.1 (tier a foundation)`.

This is the build-order Phase 0 → Phase 1 starts at step 6.

---

## Final summary

v4.1 changes over v4 are tactical, not architectural:

1. **Golden-path-first delivery** — one canonical scenario drives Phase 1–2 order.
2. **Tier A split** into runtime + proof so "complete on paper" ≠ "product invisible."
3. **Interactive v0.1 is the product; worker mode is preview** — stated bluntly up front.
4. **Golden-tape gate softened** — 1 tape at A/B/C + 5 tapes at A (was 5 at all three).
5. **Placeholder PolicyDecision shape defined** with `provenanceMode: "placeholder"|"full"`.
6. **Minimum effect runtime specified** with an explicit NOT list.
7. **Terminology cleanup**: `EffectRecord` (mutation) vs `ToolAuditRecord` (execution) vs `SanitizationRecord` (security).
8. **Canonicalization for signed policy** pinned in SCHEMAS.md.
9. **Hash-chain overhead budget** nailed to 2ms p99 / 2% session cost with chunked fallback.
10. **Delivery risk** added to the register with a weekly demo-check gate.
11. **Ten small enhancements** (9.1–9.10) — doctor CLI, structured errors, system-prompt snapshot tests, `--trace`, pre-commit hook, observability-lite, session labels, deterministic child IDs, pinned toolchain, ADR culture.

**This is the final plan. The next file created in this project is code, not a plan revision.**
