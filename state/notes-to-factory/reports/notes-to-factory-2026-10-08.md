# Notes → Factory — 2026-10-08

## 1. Ledger

**Merges (Agentic-KB only):**

| SHA | Title | Gate reached | Revert |
|---|---|---|---|
| `82931d9` | `chore(clippings): ingest 2 Apple Notes (DMV correspondence, TX adjuster license checklist)` | Pre-commit PII guard (passed after redacting two business phone numbers) | `git -C /Users/jaywest/Agentic-KB revert -m 1 82931d9 && git -C /Users/jaywest/Agentic-KB push` |
| `0789a30` | `test(web): characterize the agent runtime-trace route handler (11th of 36)` (merge commit) | Full code gate (typecheck, lint, root 694/694, web 119/119, production build, fresh-clone verify) | `git -C /Users/jaywest/Agentic-KB revert -m 1 0789a30 && git -C /Users/jaywest/Agentic-KB push` |
| `e23f675` | `docs(backlog): record agent-trace route drain (11th of 36), re-confirm PR #30 open` | Docs-only (parse check + path/symbol verification) | `git -C /Users/jaywest/Agentic-KB revert -m 1 e23f675 && git -C /Users/jaywest/Agentic-KB push` |

**PRs (unchanged by this run, re-verified via `gh`):**

| Repo | PR | Opened | Age | Why not auto-merged |
|---|---|---|---|---|
| Agentic-KB | #29 | 2026-09-02 | 36 days | Carried from an earlier run, still awaiting Jay's review |
| Agentic-KB | #30 | 2026-10-05 | 3 days | Dependency bump (`next` 16.3.3→16.3.8, critical RCE fix) — exclusion-listed regardless of gate results |
| hermes-harness-missioncontrol | #19 | 2026-08-26 | 43 days | Carried, awaiting review |
| hermes-harness-missioncontrol | #20 | 2026-08-30 | 39 days | Carried, awaiting review |

No resolutions since 2026-10-07. No other merges or PRs this run.

## 2. ACTION REQUIRED

- **Aging, unreviewed PRs**, confirmed OPEN via `gh` this run: Agentic-KB #29 (36 days), Agentic-KB #30 (3 days, critical RCE fix), hermes-harness-missioncontrol #19 (43 days), hermes-harness-missioncontrol #20 (39 days). #29 and both hermes PRs are now well over a month old — worth Jay's direct review.
- **`source-map-js` high-severity advisory** (Agentic-KB `web/`) still open and untouched, alongside the already-tracked critical `next`/`sharp` exposure PR #30 fixes but which remains unmerged.
- **Residual `js-yaml` advisory** (GHSA-2883-xcg3-v3hh, via `gray-matter`'s bundled `js-yaml`), still open and untouched by this run.
- **Twinz**: `.mcp.json` re-confirmed still tracked on `origin/master` via `git ls-tree` this run (leak-recurrence path open). Leaked Vercel API token and the ignored `package.json` `overrides` item were **not** re-verified in depth this run (carried as-is).
- **SellerFi**: Stripe webhook secret / Resend API key committed to docs history — redacted at HEAD only, rotation still open (carried, not re-verified in depth this run).
- `agentic_hr`, `AI-FDE-Agent`, `obsidian-vault`, `MissionControl` backlogs not surveyed for drain candidates this run (same gap as prior runs).
- Worktree hygiene is clean: MissionControl 61 (unchanged, not touched by this job), SellerFi 2 pre-existing (unchanged, not touched), Agentic-KB back to its pre-existing baseline of 2 after this run's worktree was removed.
- Kill switch: clear throughout. Disk: ~24 GiB free of 926 GiB at the start of the run (below the 30 GiB two-wave threshold, but only one repo needed a worktree so it didn't matter).
- `list_notes` with `limit: 250` timed out twice against the device (60s each); dropping to `limit: 30` resolved it and still covered the full gap back past `lastRunAt` with margin. Worth carrying forward: prefer a smaller `limit` by default rather than retrying 250 first.

## 3. Harvest

**Disposition table (Apple Notes, 5 candidates — all new since `lastRunAt`):**

| Disposition | Count |
|---|---|
| SKIP_EMPTY (plaintext body under the 120-byte Screen 2 floor) | 3 |
| Credential-shaped title, skipped without fetching | 0 |
| Ingested to `raw/clippings/` (KB-only, not actionable in code) | 2 |
| Reached Phase 2b (ImprovementProposal) | 0 |

- `p9038`, `p9031`: object-replacement-character-only bodies (a social-media screenshot, an empty "New Note") — SKIP_EMPTY.
- `p9034`: body is just a bare link (27 bytes) — SKIP_EMPTY under the 120-byte floor.
- `p9030` ("Texas Public Adjuster License Checklist"): substantive personal licensing checklist with no code-repo mapping — fails Cheap Filter 1 (not actionable in code). Ingested as KB-only material; the repo's own pre-commit PII guard flagged two business support-line phone numbers on first commit attempt (correctly — it's doing its job), so they were reworded out rather than bypassed with `--no-verify`.
- `p9029` (DMV vehicle-registration follow-up draft): personal correspondence, fails Cheap Filter 1. Ingested with the VIN, PIN, plate, and phone number redacted before commit — a DMV PIN functions as a self-service-portal credential, so it was treated with the same caution as this job's credential screen even though it doesn't match the screen's literal regex patterns.
- 0 ingested items reached Phase 2b. 0 work orders from Apple Notes — correct outcome, not a shortfall, per this job's own calibration note.

**KB candidates/action-tracker** (Agentic-KB): `wiki/candidates.md` unchanged since 2026-09-02 (`git log -1`), 0 topics with 2+ sources. `wiki/action-tracker.md` Open and Blocked sections both still empty. `wiki/recently-added.md` tail still ends 2026-08-29. 0 KB-sourced work orders — unchanged pattern, re-verified this run.

**Backlog coverage** (re-derived from `origin/<default-branch>`, not trusted from memory): all 8 routed repos with local checkouts (Agentic-KB, Agentic-Pi-Harness, hermes-harness-missioncontrol, Twinz, morning-review, ai-software-factory-mastery, MissionControl, SellerFi) confirmed to **HAVE** `docs/NIGHTLY-BACKLOG.md` on their remote default branch.

## 4. Proposals

Harvest produced 0 work orders (0 Apple-Notes-sourced, 0 KB-sourced), so per Phase 2e the run drained the existing backlog instead.

| Item | Repo | Decision | Hypothesis / evidence |
|---|---|---|---|
| `web/` route-handler test gap: `agents/[id]/trace` (11th of 36) | Agentic-KB | **IMPLEMENT** | Hypothesis: HTTP-layer characterization tests for the route's query-parsing/response-shaping lock in current behavior and surface latent gaps before any future change — and unlike every prior pick in this series, the underlying lib function (`readRuntimeTraces`) had zero existing test coverage anywhere in the repo, at any layer. Acceptance evidence observed: `npm --prefix web test` went from 112/112 to 119/119 (7 new tests, all passing); the GAP test was verified failing-then-passing by temporarily asserting the non-gap value (50) and confirming red (`60 !== 50`) before reverting to the pinned value; full gate (typecheck, lint, root 694/694, web 119/119, production build, fresh `git clone` install+test+build) all green on the merged tree. |

One previously-undocumented gap pinned, not fixed, structurally identical to the one already pinned on the sibling audit route: `limit = Math.min(Number(searchParams.get('limit') || '50'), 500)` produces `NaN` on a non-numeric `?limit` query param, and `Array.prototype.slice(-NaN)` coerces to `slice(0)` per ECMA's `ToIntegerOrInfinity(NaN)=0` rule — so an invalid limit silently returns the *entire* trace history instead of the documented default of 50 or an error.

Two Apple-Notes items this run were "docs/config, not code" in a different sense — not a missed skill-edit opportunity, but personal, non-repo content that was correctly routed to the KB rather than treated as a code work order (see Harvest above).

## 5. Backlog delta

**Agentic-KB** `docs/NIGHTLY-BACKLOG.md`:
- Appended the 11th-handler drain summary to the existing "`web/` has no test suite" entry (25 of 36 route handlers now remain uncovered, down from 26).
- Appended a re-confirmation note to the existing `next`/RCE dependency-audit entry: PR #30 still unmerged, now 3 days old.

No other repo's backlog was touched this run.

## 6. Hygiene

- Worktrees created: 1 (`Agentic-KB-trace-route`). Removed with `git worktree remove --force` + branch delete (merged, not a PR) + `git worktree prune`. Confirmed back to the pre-existing baseline of 2 (`Agentic-KB-sofie-writeback-hardening`, `.claude/worktrees/affectionate-swanson-41d555` — both pre-existing, untouched).
- A fresh `git clone` into `/tmp/ntf/akb-fresh-clone` verified root (694/694) and web (119/119) install+test+build all green, then removed.
- MissionControl worktree count: 61 (via `git worktree list` minus the main entry), unchanged — not touched by this job.
- SellerFi worktree count: 2 pre-existing, unchanged.
