# Notes → Factory — 2026-10-13

## 1. Ledger

**Merges (2):**

| Repo | SHA | What | Gate reached | Revert |
|---|---|---|---|---|
| Agentic-KB | `a1870f27` | test(web): characterize `agents/[id]/context` route (16th of 36) | Full code gate (typecheck, lint, root 714/714, web 146/146, production build, fresh-clone verification) | `git -C /Users/jaywest/Agentic-KB revert -m 1 a1870f27 && git -C /Users/jaywest/Agentic-KB push` |
| Agentic-KB | `6c9bbd86` | docs(backlog): record the drain entry | Docs-only (parse check) | `git -C /Users/jaywest/Agentic-KB revert -m 1 6c9bbd86 && git -C /Users/jaywest/Agentic-KB push` |

**PRs still open (none opened or closed by this run — re-verified only):**

| Repo | PR | Age | Note |
|---|---|---|---|
| Agentic-KB | #29 | 41 days | `assertReadAllowed` unsafe-path fix |
| Agentic-KB | #30 | 8 days | **Critical RCE** (GHSA-vcvr-r3jv-pc5j), next 16.3.3→16.3.8 — exclusion-listed from auto-merge |
| hermes-harness-missioncontrol | #19 | 48 days | orchestrator-api hydration normalization |
| hermes-harness-missioncontrol | #20 | 44 days | VITE_OPERATOR_TOKEN `.env` guard |

## 2. ACTION REQUIRED

- **Agentic-KB #30 — critical RCE fix, 8 days unmerged.** Exclusion-listed from auto-merge by policy; needs Jay's direct review/merge.
- Agentic-KB #29 (41d), hermes-harness-missioncontrol #19 (48d) and #20 (44d) all continue aging with no resolution.
- **Main checkout's root `node_modules/` was found empty** at the start of this run (just a stray `.DS_Store`), which failed the production-build gate (`Module not found: 'yaml'`). Not a code defect — fixed in-run with `npm ci`. Worth a preflight check in a future run so this doesn't silently block every drain's build gate.
- Twinz: `.mcp.json` still tracked on `origin/master` (leak recurrence path open); the leaked Vercel token and ignored-overrides items were not re-verified in depth this run.
- SellerFi: Stripe webhook secret — 44 matching commits in history, redacted at HEAD only. Rotation still open, carried across many consecutive runs without action.
- SellerFi worktree count: 8 (up from 7). MissionControl worktree count: 63 (up from 59). Neither touched by this job; flagged for Jay's attention.
- Kill switch: clear. Disk: 173 GiB free — no pressure.

## 3. Harvest

| Class | Count |
|---|---|
| New Apple Notes since last run | 0 |
| Ingested to KB | 0 |
| Credential-shaped (skipped) | 0 |
| KB-sourced work orders | 0 |

The last-30 `list_notes` listing returned nothing newer than `lastRunAt` — every note was already in `notesSeen` from the 2026-10-12 run. `wiki/candidates.md` remains 0-for-0 on topics at 2+ sources; `wiki/action-tracker.md` Open/Blocked both empty; `wiki/recently-added.md` unchanged in substance since 2026-08-29. This is the expected pattern per this job's own calibration note — a zero-harvest day, not a failure.

## 4. Proposals

| Item | Repo | Decision | Hypothesis / reason |
|---|---|---|---|
| `agents/[id]/context` route | Agentic-KB | IMPLEMENT | Thin GET wrapper over already-unit-tested `loadContract()`/`loadAgentContext()`; adding HTTP-layer characterization tests closes one more of the 36-handler coverage gap with no production code touched. Acceptance evidence observed: 146/146 web tests green (was 141), failing-then-passing check confirmed the new assertions are real, full gate + fresh clone both green. |
| Agentic-Pi-Harness Open items (17) | Agentic-Pi-Harness | BACKLOG (re-confirmed) | Every item remains a named design proposal or "wants a decision" per its own text — re-surveyed, nothing newly Small. |
| hermes-harness-missioncontrol `actor` filter | hermes-harness-missioncontrol | BACKLOG (re-confirmed) | Explicitly self-described as "the fix is a decision, not a patch" — still true this run. |

## 5. Backlog delta

- Agentic-KB `docs/NIGHTLY-BACKLOG.md`: added the 16th-handler drain summary under the route-handler series entry (`6c9bbd86`). No items moved to Closed/Checked, not applicable this run (no Apple-Notes or KB-candidate items reached Phase 2b).
- All other 5 repos with local checkouts: no changes.

## 6. Hygiene

- Worktrees: created 1 (`Agentic-KB-agent-context`), removed + pruned. Count back to baseline of 2 pre-existing worktrees in Agentic-KB.
- MissionControl: 63 worktrees (up from 59) — not touched, flagged.
- SellerFi: 8 worktrees (up from 7) — not touched, flagged.
