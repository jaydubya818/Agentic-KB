# Notes → Factory — 2026-10-02

## 1. Ledger

**Merges (Agentic-KB only):**

| Repo | SHA | What | Source | Revert |
|---|---|---|---|---|
| Agentic-KB | `4e3a030` | test(web): characterize the article route handler (5th of 36) | backlog Agentic-KB docs/NIGHTLY-BACKLOG.md 2026-08-20 ("web/ has no test suite") | `git -C /Users/jaywest/Agentic-KB revert -m 1 4e3a03001d970f932edfee09f5d7727ff94bf039 && git -C /Users/jaywest/Agentic-KB push` |
| Agentic-KB | `b30e3da` | docs(backlog): record article route drain (5th of 36 handlers) | backlog bookkeeping, same item | `git -C /Users/jaywest/Agentic-KB revert -m 1 b30e3da && git -C /Users/jaywest/Agentic-KB push` |

**PRs:** none opened this run. Three carried from prior runs, all re-verified OPEN via `gh pr view`:
- Agentic-KB #29 ("assertReadAllowed rejects unsafe paths like its write twin") — OPEN, 30 days.
- hermes-harness-missioncontrol #19 ("normalize legacy persisted runs once at hydration") — OPEN, 37 days.
- hermes-harness-missioncontrol #20 ("guard VITE_OPERATOR_TOKEN against .env files") — OPEN, 33 days.

## 2. ACTION REQUIRED

- **Three PRs aging without review**: Agentic-KB #29 (30d), hermes-harness-missioncontrol #19 (37d) and #20 (33d). All green, all waiting on a human click.
- **SellerFi**: Stripe webhook secret + Resend API key committed to docs history — redacted at HEAD only, rotation still open (carried many runs).
- **Twinz**: leaked Vercel API token in git history, still unrevoked (carried).
- **Twinz**: `.mcp.json` tracked despite intended `.gitignore` rule — leak recurrence path still open (carried).
- **Twinz**: root `package.json` `overrides` silently ignored by npm workspace install — axios/undici/form-data/vite advisories unfixable by ordinary means; the bumps are parked unmerged on `nightly/2026-09-01-improvements` (carried).
- **SellerFi**: `nightly/2026-08-31-improvements` supersedes 5 stale nightly branches and fixes a Next.js RCE (GHSA-2xp9-vwfh-vxw4) — unmerged, needs a human click (carried, worth flagging directly).
- **MissionControl worktree count dropped from 83 to 60** since 2026-10-01. Not this job's doing — every prior report treated 83 as stable, so flagging the change in case it's unexpected.
- No credential leaks found in this run's harvest; no workflow patches needed; no kill switch triggered; disk at 99 GiB free, no pressure.

## 3. Harvest

| Disposition | Count |
|---|---|
| New notes since last run | 5 |
| Screen 1 (credential-shaped title/body) | 0 skipped |
| Screen 2 (<120 bytes plaintext) | 4 skipped |
| Ingested to raw/clippings/ | 1 |
| Mapped to a repo work order | 0 |

Rejected, one line each:
- **p8971** ("linkedin.com/jobs/view/4465582226") — bare job-listing link, no body. Screen 2.
- **p8967** ("Ben Kimball Ai") — pasted screenshot, object-replacement character only. Screen 2.
- **p8963** ("New Note") — pasted screenshot, same shape. Screen 2.
- **p8959** ("New Note") — pasted screenshot, same shape. Screen 2.
- **p8961** ("Login → Today → chat with Sofie...") — survived both screens; ingested (`419e472`). A target-architecture sketch (Owner → Sofie/MyEve → MyFactory Cloud Control Plane → ... → Publisher) plus an E2E-testing-strategy list spanning Playwright/Vitest/Postgres-integration/harness-CLI/API-contract/accessibility/visual-regression/fault-injection/canary layers. Fails cheap filter 2a ("maps cleanly to one repo?") — it's a cross-cutting vision document for a system (Sofie/MyEve/MyFactory/Relay) that doesn't correspond to one repo in the routing table at Small/Medium grain. Filed as a KB item, not forced into a work order, per the calibration note's explicit guidance against manufacturing work from notes that don't contain it.

No KB candidates graduated via `wiki/candidates.md` / `action-tracker.md` / `recently-added.md` since 2026-08-30 (checked, nothing newer).

## 4. Proposals

| Item | Repo | Decision | Hypothesis / reason |
|---|---|---|---|
| p8961 (MyFactory architecture note) | — | Not applicable (KB item) | No single repo owns this scope; ingesting to the KB preserves it without manufacturing a false work order. |
| Backlog drain: `article` route characterization tests | Agentic-KB | IMPLEMENT | 32 of 36 web/ route handlers have zero tests; adding characterization tests for `article/route.ts` extends known-good coverage with no behavior change, same pattern as the 4 prior drains. Acceptance evidence observed: baseline 54/54 → 69/69, typecheck/lint/build all green, fresh clone verified green. |

Nothing this run needed "docs/config/skill edit instead of code" — the one candidate note was pure architecture content with no actionable, scoped ask.

## 5. Backlog delta

- **Agentic-KB** `docs/NIGHTLY-BACKLOG.md`: added one dated sub-entry under the "web/ has no test suite" Open item (5th handler landed, `article`, 31 of 36 remain). No items moved to Closed or Checked/not-applicable this run.
- No other repo's backlog touched this run (Agentic-Pi-Harness and hermes-harness-missioncontrol not re-surveyed — both confirmed all-Large as of 2026-10-01, and this run's time went to the KB ingestion, the drain, and full fresh-clone verification instead).

## 6. Hygiene

- Worktrees created: 1 (`Agentic-KB-article-route`). Removed via `git worktree remove --force` + branch delete + `git worktree prune`. Count confirmed back to the pre-existing baseline of 2 (`Agentic-KB-sofie-writeback-hardening`, `.claude/worktrees/affectionate-swanson-41d555` — both untouched, pre-existing).
- MissionControl: 60 worktrees (down from 83 as of 2026-10-01) — see ACTION REQUIRED.
- Phase 6 bookkeeping commit made unconditionally (see below), independent of the implementation commits above.
