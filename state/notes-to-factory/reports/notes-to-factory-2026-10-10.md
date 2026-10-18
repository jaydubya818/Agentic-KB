# Notes → Factory — 2026-10-10 run

Kill switch: clear. Disk: ~65 GiB free / 926 GiB. All subagent calls returned (this run executed directly, no sub-dispatch needed). **No failures.**

## 1. Ledger

**Merges (2):**

| Repo | SHA | Source note | Gate reached | Revert |
|---|---|---|---|---|
| Agentic-KB | `3ce59e0` | backlog Agentic-KB docs/NIGHTLY-BACKLOG.md 2026-08-20 (web/ has no test suite) | Full: typecheck, root 694/694, web 128/128, lint (0 errors), build, fresh-clone re-verify | `git -C /Users/jaywest/Agentic-KB revert -m 1 3ce59e0 && git -C /Users/jaywest/Agentic-KB push` |
| Agentic-KB | `234f87e` | backlog bookkeeping, same drain item | Docs-only: parse check + referenced path verified | `git -C /Users/jaywest/Agentic-KB revert -m 1 234f87e && git -C /Users/jaywest/Agentic-KB push` |

**PRs (0 opened this run; 4 carried, all re-verified OPEN via `gh pr view`):**

| Repo | PR | Age | Note |
|---|---|---|---|
| Agentic-KB | #29 | 38 days | `assertReadAllowed` unsafe-path fix |
| Agentic-KB | #30 | **5 days** | **Critical RCE** (GHSA-vcvr-r3jv-pc5j), next 16.3.3→16.3.8 — exclusion-listed, needs Jay's direct merge |
| hermes-harness-missioncontrol | #19 | 45 days | orchestrator-api hydration normalization |
| hermes-harness-missioncontrol | #20 | 41 days | harness-console operator-token env guard |

No new PRs opened this run.

## 2. ACTION REQUIRED

- **Agentic-KB #30 — critical RCE fix, 5 days unmerged.** Exclusion-listed from auto-merge by design (dependency bump); needs Jay's direct review and merge.
- Agentic-KB #29 (38 days), hermes-harness-missioncontrol #19 (45 days) and #20 (41 days) remain open and aging — all now over a month old.
- `source-map-js` (high) and the residual `js-yaml`/`gray-matter` advisory in Agentic-KB `web/` remain open, untouched this run.
- Twinz: `.mcp.json` re-confirmed still tracked on `origin/master`. Leaked Vercel token / ignored `package.json` overrides item **not re-verified in depth this run** — carried as-is.
- SellerFi: Stripe webhook secret / Resend API key in docs history, redacted at HEAD only — rotation still open, not re-verified in depth this run.
- **KB capture gap (observation, not a work order):** note p8961 was edited after its first capture; `clipping-write.mjs`'s `--source-id` identity hash depends only on `(source, sourceId)`, never on content, so the edited text was never re-ingested — it silently skipped as a duplicate. This is the script's documented design tradeoff (it exists specifically to avoid the opposite failure, 10 duplicate copies from timestamp/whitespace drift), so changing it is a judgment call on a shared dedup registry, not a Small fix. Flagging for Jay's awareness rather than implementing a change.
- No kill switch, no disk pressure, no workflow-scope blockers this run.

## 3. Harvest

| Disposition | Count |
|---|---|
| SKIP_EMPTY (screenshot/clipping/under 120 bytes) | 7 |
| Re-checked (modified since last run), skipped as duplicate | 1 |
| Credential-shaped, skipped unread | 0 |
| Reached Phase 2b (ImprovementProposal) | 0 |

Rejected, one line each:
- p9084 "Ivo Review…" — ad/link clipping, empty body.
- p9079 "Elia (@eliakuratli)" — social clipping, empty body.
- p9077 "New Note" — empty.
- p9066 "David Ondrej (@DavidOndrej1)…" — social clipping, empty body.
- p9063 "New Note" — empty.
- p9061 "Infiniti" — a car note + phone number (redacted), 50 bytes, under the 120-byte floor.
- p9058 link-only note, 27 bytes, under the floor.
- p8961 "Login → Today → chat with Sofie…" — substantive architecture vision spanning Sofie/MyFactory/MissionControl, no single-repo mapping (KB item, already captured under this source-id; edit not re-ingested per the gap above).

KB candidates/action-tracker/recently-added: unchanged in substance from prior runs — 0 KB-sourced work orders.

## 4. Proposals

| Item | Repo | Decision | Hypothesis / reason |
|---|---|---|---|
| 13th `web/` route handler drain | Agentic-KB | IMPLEMENT | `agents/[id]/dry-run-close-task` had no HTTP-layer test; its underlying `dryRunCloseTask()` was already unit-tested but the route's own 404/body-fallback/status-mapping behavior was unverified. Acceptance evidence observed: failing-then-passing GAP test (200→422 forced red, reverted to green), 128/128 web suite, fresh-clone re-verify. |

No other items reached Phase 2b this run (harvest was empty; drain is the sole proposal line).

## 5. Backlog delta

- **Agentic-KB** `docs/NIGHTLY-BACKLOG.md`: +1 sub-entry under the existing `web/` test-suite item (13th-of-36 route handler). Still open: 23 of 36.
- No other repo's backlog touched this run.

## 6. Hygiene

- Worktrees created: 1 (`Agentic-KB-dry-run-close-task`). Removed cleanly; count back to baseline of 2 pre-existing (`Agentic-KB-sofie-writeback-hardening`, a detached-HEAD `.claude/worktrees/` entry).
- MissionControl worktree count: 61, unchanged — not touched by this job. Still worth Jay's attention as a standing cleanup item, not acted on.
- SellerFi worktree count: 2, unchanged.
