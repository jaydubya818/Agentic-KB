---
repo_name: Pi
repo_visibility: private
source_type: github
branch: main
commit_sha: 1a669c97bc2760e9298c6ff3d892feea5426fc09
source_path: "docs/sofie-contract.md"
imported_at: "2026-04-25T16:01:56.260Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Pi/main/docs/sofie-contract.md"
archived_at: "2026-04-25T16:05:44.796Z"
---

# Sofie Runtime Contract

Sofie is a bounded, **deterministic**, **read-only** reviewer that fires at the end of every user message turn when enabled. She reads existing session artifacts, classifies run health, and emits a structured verdict — she does not write files, route work, or start new loops.

---

## Role
- Deterministic internal reviewer over existing session artifacts/state
- May answer routine closure/scope/review questions
- May recommend `continue` vs `escalate`
- May **not** route work, spawn a second control loop, or call an LLM
- May **not** override policy decisions, approval outcomes, or validation results
- May **not** mutate proof-path CLI semantics or persisted artifact contracts

---

## When Sofie Fires

`maybeRunSofie()` is called from `src/control-plane/pipeline.ts` **after** `writeSessionArtifacts()` completes — at the very end of every `runUserMessage()` invocation.

```
runUserMessage()
  └─ ... (policy gate, agent turns, approval gates, writeback)
  └─ writeSessionArtifacts()   ← artifacts written first
  └─ maybeRunSofie()           ← Sofie reads those artifacts, emits verdict
```

The turn does not complete until Sofie emits. Her output is part of the session record, not a background side-effect.

---

## How to Enable / Disable

In `config/multi-team.yaml` (or `multi-team.external-target.yaml`):

```yaml
features:
  enable_sofie: true   # omit or set false to disable (default: off)
```

The guard is strict equality — `enable_sofie !== true` means Sofie does not run. No per-session runtime override exists; enabling/disabling is a config-file concern.

---

## Inputs Sofie Reads

Sofie reads four session artifact files (all written by `writeSessionArtifacts()`):

| File | What Sofie reads |
|------|-----------------|
| `changed-files.json` | `files[]` — paths touched this turn; `repoRoot` — external target root |
| `policy-violations.json` | `violations[]` — policy violations recorded during the turn |
| `artifacts.json` | `missing_required_by_agent[]`, `validation_outcomes[{ validation_status }]` |
| `events.jsonl` | Lines with `event_type:"approval_resolved"` and `outcome:"denied"` or `"cancel_turn"` |

She also receives the raw `userMessage` string (for routine Q&A detection).

---

## What Sofie Produces

Sofie emits via `onChat("sofie", ...)` — the same callback used by agents — producing 1–2 lines:

1. **Summary**: `"<VERDICT>: <closureRecommendation>"` — always emitted
2. **Routine answer**: emitted only when the user message matches a known closure/scope question

### Verdict values
| Verdict | Meaning |
|---------|---------|
| `continue` | No blockers — run appears clean |
| `escalate` | ≥1 `blocker`-severity finding — use existing escalation path |

`escalate` is **informational only**. It does not stop execution or throw. The orchestrator remains the sole routing owner.

### Finding codes
| Code | Severity | Trigger |
|------|----------|---------|
| `validation_failure` | blocker | Any `validation_status === "fail"` in artifacts |
| `missing_required_artifacts` | blocker | Any entries in `missing_required_by_agent` |
| `approval_denied` | blocker | Any approval resolved as `denied` or `cancel_turn` |
| `policy_violation` | blocker | Any entries in `violations[]` |
| `scope_drift` | warn | Changed files include `src/`, `config/`, `extensions/`, or non-`web/` paths in AI_CEO target |
| `routine_guidance` | info | User message matches a closure/scope/continuation question |
| `clean_run` | info | No other findings detected |

### Routine Q&A patterns
| User says (case-insensitive) | Sofie responds |
|------------------------------|---------------|
| "safe to continue" / "should we continue" | Continue if no validation failures, all required artifacts present, no policy/approval blockers |
| "close this" / "ready to close" | Closure appropriate when run stayed in scope, produced expected artifacts, no blockers |
| "scope" / "in scope" | Workflow scoped to bounded review/operator/advisor guidance and configured external target |

---

## Performance Characteristics

- **No LLM calls** — fully deterministic, purely file-read logic
- **~4 local file reads** per turn — typical overhead < 10 ms
- **Failure mode**: if any artifact file is missing, `fs.readJson` throws and the turn errors. `writeSessionArtifacts()` must always run before `maybeRunSofie()`.

---

## Example Output

**Clean run:**
```
sofie: CONTINUE: Proceed without human escalation; keep existing flow and artifacts unchanged.
```

**Validation failure:**
```
sofie: ESCALATE: Escalate through existing blocker/reporting flow.
```

**Routine question, no blockers:**
```
sofie: CONTINUE: Proceed without human escalation; keep existing flow and artifacts unchanged.
sofie: Sofie: continue if validation has no failures, required artifacts are present, and no policy or approval blockers were recorded.
```

---

## Authority Boundary (Frozen Guarantees)

- Existing CLI proof paths remain unchanged
- Existing session artifact filenames and top-level shapes remain unchanged
- Orchestrator remains the only routing owner
- External-target flow remains `PI_MULTI_CONFIG` + `../AI_CEO` with target scope `../AI_CEO/web`

---

## Extending Sofie

To add a new finding type:
1. Add the `code` to the `SofieFinding.code` union in `src/sofie/review.ts`
2. Add detection logic in `reviewSessionWithSofie()` — push a finding with the appropriate severity
3. `blocker` findings automatically flip verdict to `escalate`; `warn`/`info` do not
4. Update this doc

Do not add LLM calls, file writes, or external HTTP calls to Sofie. Her value is speed, determinism, and audit safety.
