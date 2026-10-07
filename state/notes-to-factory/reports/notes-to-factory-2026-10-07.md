# Notes → Factory — 2026-10-07

## 1. Ledger

**Merges (Agentic-KB only):**

| SHA | Title | Gate reached | Revert |
|---|---|---|---|
| `e985a33` | `test(web): characterize the agent audit route handler (10th of 36)` | Full code gate (typecheck, lint, root 694/694, web 112/112, production build, fresh-clone verify) | `git -C /Users/jaywest/Agentic-KB revert -m 1 e985a33 && git -C /Users/jaywest/Agentic-KB push` |
| `d440585` | `docs(backlog): record agent-audit route drain (10th of 36)` | Docs-only (parse check + path/symbol verification) | `git -C /Users/jaywest/Agentic-KB revert -m 1 d440585 && git -C /Users/jaywest/Agentic-KB push` |
| `fc91e47` | `docs(backlog): record new source-map-js advisory, re-confirm PR #30 open` | Docs-only (parse check) | `git -C /Users/jaywest/Agentic-KB revert -m 1 fc91e47 && git -C /Users/jaywest/Agentic-KB push` |

**PRs (unchanged by this run, re-verified via `gh`):**

| Repo | PR | Opened | Age | Why not auto-merged |
|---|---|---|---|---|
| Agentic-KB | #29 | 2026-09-02 | 35 days | Carried from an earlier run, still awaiting Jay's review |
| Agentic-KB | #30 | 2026-10-05 | 2 days | Dependency bump (`next` 16.3.3→16.3.8, critical RCE fix) — exclusion-listed regardless of gate results |
| hermes-harness-missioncontrol | #19 | 2026-08-26 | 42 days | Carried, awaiting review |
| hermes-harness-missioncontrol | #20 | 2026-08-30 | 38 days | Carried, awaiting review |

**Resolved since last run:** SellerFi PR #217 (the `next` 16.3.4→16.3.8 critical-RCE bump) was **merged** by Jay between the 2026-10-06 and 2026-10-07 runs — confirmed via `gh pr view 217` (`state: MERGED`). No longer carried as open.

No other merges or PRs this run.

## 2. ACTION REQUIRED

- **New finding, not fixed this run:** a fresh `npm audit` on `web/` (Agentic-KB) surfaced a new high-severity advisory, `source-map-js` (event-loop denial-of-service via indexed source-map section offsets), alongside the already-tracked critical `next`/`sharp` exposure that PR #30 fixes but is still unmerged. Recorded in `docs/NIGHTLY-BACKLOG.md`'s existing dependency-audit entry (`fc91e47`). Not investigated for reachability or fixed — a `source-map-js` bump would need its own PR under the same dependency-bump exclusion rule PR #30 is already under.
- **Aging, unreviewed PRs**, confirmed OPEN via `gh` this run: Agentic-KB #29 (35 days), Agentic-KB #30 (2 days, critical RCE fix), hermes-harness-missioncontrol #19 (42 days), hermes-harness-missioncontrol #20 (38 days). Worth Jay's direct review — #29 and the two hermes PRs in particular are now over a month old.
- **Residual `js-yaml` advisory** (GHSA-2883-xcg3-v3hh, via `gray-matter`'s bundled `js-yaml`), recorded 2026-10-05, still open and untouched by this run.
- **Twinz**: `.mcp.json` re-confirmed still tracked on `origin/master` via `git ls-tree` this run (leak-recurrence path open). Leaked Vercel API token and the ignored `package.json` `overrides` item were **not** re-verified in depth this run (carried as-is from 2026-10-06).
- **SellerFi**: Stripe webhook secret / Resend API key committed to docs history — redacted at HEAD only, rotation still open (carried, not re-verified in depth this run).
- `agentic_hr`, `AI-FDE-Agent`, `obsidian-vault`, `MissionControl` backlogs not surveyed for drain candidates this run (same gap as prior runs).
- Worktree hygiene is clean: MissionControl 61 (unchanged, not touched by this job), SellerFi 2 pre-existing (unchanged, not touched), Agentic-KB back to its pre-existing baseline of 2 after this run's worktree was removed.
- Kill switch: clear throughout. Disk: ~32 GiB free of 926 GiB at the start of the run.

## 3. Harvest

**Disposition table (Apple Notes, 6 candidates — all new since `lastRunAt`):**

| Disposition | Count |
|---|---|
| SKIP_EMPTY (plaintext body under the 120-byte Screen 2 floor) | 6 |
| Credential-shaped title, skipped without fetching | 0 |
| Ingested to `raw/clippings/` | 0 |
| Reached Phase 2b (ImprovementProposal) | 0 |

All 6 candidate notes (`p9025`, `p9021`, `p9018`, `p9016`, `p9012`, `p9007`) were new since 2026-10-06's `notesSeen`. Each fetched body was either the Unicode object-replacement character alone (a voice memo, a photo, or an empty "New Note") or, for `p9007` ("Pasted Graphic.png"), the same empty-body shape. None cleared the 120-byte Screen 2 floor. 0 ingested, 0 work orders — this is the expected, correct outcome per this job's own calibration note, not a shortfall.

**KB candidates/action-tracker** (Agentic-KB): `wiki/candidates.md` unchanged since 2026-09-02 (`git log -1`), 0 topics with 2+ sources. `wiki/action-tracker.md` Open and Blocked sections both still empty. `wiki/recently-added.md` tail still ends 2026-08-29. 0 KB-sourced work orders — unchanged pattern, re-verified this run.

**Backlog coverage** (re-derived from `origin/<default-branch>`, not trusted from memory): all 8 routed repos with local checkouts (Agentic-KB, Agentic-Pi-Harness, hermes-harness-missioncontrol, Twinz, morning-review, ai-software-factory-mastery, MissionControl, SellerFi) confirmed to **HAVE** `docs/NIGHTLY-BACKLOG.md` on their remote default branch.

## 4. Proposals

Harvest produced 0 work orders (0 Apple-Notes-sourced, 0 KB-sourced), so per Phase 2e the run drained the existing backlog instead.

| Item | Repo | Decision | Hypothesis / evidence |
|---|---|---|---|
| `web/` route-handler test gap: `agents/[id]/audit` (10th of 36) | Agentic-KB | **IMPLEMENT** | Hypothesis: adding HTTP-layer characterization tests for the route's query-parsing and response-shaping (not already covered by the existing lib-level `audit.mjs` unit tests) locks in current behavior and surfaces latent gaps before any future change to the route. Acceptance evidence observed: `npm --prefix web test` went from 106/106 to 112/112 (6 new tests, all passing); the GAP test was verified failing-then-passing by temporarily asserting the non-gap value (50) and confirming red (`60 !== 50`) before reverting to the pinned value; full gate (typecheck, lint, root 694/694, web 112/112, production build, fresh `git clone` install+test+build) all green on the merged tree. |

One previously-undocumented gap pinned, not fixed: a non-numeric `?limit` query param on `GET /api/agents/[id]/audit` produces `NaN` from `parseInt()`, and `Array.prototype.slice(-NaN)` coerces to `slice(0)` per ECMA's `ToIntegerOrInfinity(NaN)=0` rule — so an invalid limit silently returns the *entire* matching audit history instead of the documented default of 50 or an error. Filed as test coverage, not fixed, consistent with this job's "surgical only" implementation rule.

## 5. Backlog delta

**Agentic-KB** `docs/NIGHTLY-BACKLOG.md`:
- Appended the 10th-handler drain summary to the existing "`web/` has no test suite" entry (26 of 36 route handlers now remain uncovered, down from 27).
- Appended a re-audit note to the existing `next`/RCE dependency-audit entry: PR #30 still unmerged, plus the newly-surfaced `source-map-js` high-severity advisory.

No other repo's backlog was touched this run.

## 6. Hygiene

- Worktrees created: 1 (`Agentic-KB-audit-route`). Removed with `git worktree remove --force` + branch delete (merged, not a PR) + `git worktree prune`. Confirmed back to the pre-existing baseline of 2 (`Agentic-KB-sofie-writeback-hardening`, `.claude/worktrees/affectionate-swanson-41d555` — both pre-existing, untouched).
- A fresh `git clone` into `/tmp/ntf/akb-fresh-clone` verified root (694/694) and web (112/112) install+test+build all green, then removed.
- MissionControl worktree count: 61 (via `git worktree list` minus the main entry), unchanged — not touched by this job.
- SellerFi worktree count: 2 pre-existing, unchanged.
