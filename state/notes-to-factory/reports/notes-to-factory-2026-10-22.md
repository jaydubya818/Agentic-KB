# Notes → Factory — 2026-10-22

## 1. Ledger

**Merges (Agentic-KB only):**

| Repo | SHA | Source | Revert |
|---|---|---|---|
| Agentic-KB | `4492fc73` | apple-notes p9667 ("Pasted Graphic 8.png", personal AI-assistant onboarding profile) | `git -C /Users/jaywest/Agentic-KB revert -m 1 4492fc73 && git push` |
| Agentic-KB | `e0d770ae` | backlog drain series, 24th of 36 (`process/pending` route handler) | `git -C /Users/jaywest/Agentic-KB revert -m 1 e0d770ae && git push` |
| Agentic-KB | `6a824214` | backlog bookkeeping for the same drain | `git -C /Users/jaywest/Agentic-KB revert -m 1 6a824214 && git push` |

**PRs:** none opened this run. hermes-harness-missioncontrol #19 (carried, see ACTION REQUIRED) remains the only open PR this job is tracking.

No other repo received a merge or PR this run.

## 2. ACTION REQUIRED

- **hermes-harness-missioncontrol #19** ("hydration normalization") — still OPEN, now 57 days old, `mergeable: CONFLICTING`, unchanged since 2026-10-21. Needs a manual rebase; this is a human decision per the branch's own notes.
- **Twinz** — `.mcp.json` is still tracked on `origin/master`. Leak-recurrence path remains open; not re-verified in depth this run.
- **SellerFi** — Stripe webhook secret rotation still open (44 matching commits with `whsec_` across history, redacted at HEAD only). Carried across many consecutive runs without action.
- **SellerFi** worktree count: 8 (unchanged). **MissionControl** worktree count: 64 (unchanged) — neither touched by this job; flagged for Jay.
- **Housekeeping finding:** a stale worktree/branch from the 2026-10-20 run's incomplete Phase 5/6 (`ntf/2026-10-20-agent-diff` at `f1d3c92f`) was still sitting in Agentic-KB. Confirmed it was already merged into `main` (safe) and removed it. The 2026-10-21 run had reported worktree hygiene as "unchanged" without noticing it was re-counting this same stale entry — today's real baseline was 3, not 4.
- **Recurring procedural gap:** this is the *second* time (first on 2026-10-13) a fresh `/tmp/ntf` worktree has had no root `node_modules/` installed, breaking the `web/` test run on `Cannot find package 'yaml'`. Recommend adding a root-`node_modules`-population check to preflight, next to the existing disk-space check.
- No credentials found in this run's harvest requiring rotation. No workflow-scope patches needed. Disk was not under pressure (88 GiB free at start).

## 3. Harvest

**Disposition table (Apple Notes, 4 candidates against `notesSeen`):**

| Disposition | Count |
|---|---|
| Skipped — empty/placeholder body (Screen 2, <120 bytes) | 3 |
| Credential match (Screen 1) | 0 |
| Ingested to `raw/clippings/` (KB-only, not actionable in code) | 1 |
| Mapped to a repo → work order | 0 |

**Rejected items, with reasons:**

- p9678 ("Matt Pocock (@mattpocockuk)...") — saved tweet, object-replacement-character-only body. Screen 2.
- p9672 ("New Note") — object-replacement-character-only body. Screen 2.
- p9675 ("Top Speed Golf - Clay Ballard") — 31-byte title-only body, one embedded image, no text. Screen 2.
- p9667 ("Pasted Graphic 8.png") — survived both screens (38,731 bytes, no credential shape), but fails cheap filter #1: a personal AI-assistant identity/onboarding profile is not a code-change request and names no repo in the routing table. Ingested as KB-only material instead.

**KB candidates/action-tracker:** `wiki/candidates.md` still single-source-only on every entry inspected; `wiki/action-tracker.md` Open and Blocked both still empty; `wiki/recently-added.md` unchanged in substance since 2026-08-29. 0 KB-sourced work orders — same pattern as every recent run.

**Backlog coverage:** all 8 repos with local checkouts confirmed to HAVE `docs/NIGHTLY-BACKLOG.md` on `origin/<default-branch>`.

## 4. Proposals

Only one item reached the ImprovementProposal gate this run (the Phase 2e drain pick), since the Apple Notes harvest produced 0 actionable candidates.

| Item | Repo | Decision | Hypothesis / reason | Acceptance evidence observed |
|---|---|---|---|---|
| `web/src/app/api/process/pending/route.ts` test coverage | Agentic-KB | IMPLEMENT (Small) | Route had zero test coverage of its own HTTP-layer logic (file walk, type/title derivation, `alreadyIngested` detection) despite having no tested-lib delegation to lean on. | `npm --prefix web test`: 209/209 → 216/216. Failing-then-passing proof via sha256-verified restore. Typecheck clean, lint 0 err/9 pre-existing warnings, build green, fresh clone from `origin` verified both root (714/714) and web (216/216). |

Two items were explicitly re-checked and passed over as design-decision-not-patch, reconfirmed fresh rather than assumed from memory: `agents/promote` (Agentic-KB, 10th consecutive night) and `process/run-all` (Agentic-KB, 3rd consecutive night). The hermes-harness-missioncontrol "actor filter" item named in this skill's own calibration text as a one-time example of a Small item was specifically re-examined — its current entry explicitly states "the fix is a decision, not a patch," so it stays a documented skip.

No item this run fell into the "docs/config/skill edit, not code" pattern.

## 5. Backlog delta

| Repo | Added | Closed | Moved to not-applicable |
|---|---|---|---|
| Agentic-KB | 0 | 1 (`process/pending` route-handler drain entry, 24th of 36) | 0 |

All other 7 repos: no backlog change this run.

## 6. Hygiene

- Worktrees: true baseline 3 (after removing the stale 2026-10-20 leftover), 3 after this run's own drain worktree was created and removed. Confirmed returned to baseline.
- No remote feature branch left dangling — `ntf/2026-10-22-process-pending-route` was merged and deleted locally; it was never pushed.
- SellerFi worktree count 8 (unchanged, flagged above). MissionControl worktree count 64 (unchanged, flagged above) — both pre-existing conditions this job does not touch.
