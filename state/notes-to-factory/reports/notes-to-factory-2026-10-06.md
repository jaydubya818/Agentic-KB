# notes-to-factory — 2026-10-06

## 1. Ledger

**Merges (Agentic-KB only):**

| Repo | SHA | What | Revert |
|---|---|---|---|
| Agentic-KB | `c50197c` | test(web): characterize the switch-vault route handler (9th of 36) | `git -C /Users/jaywest/Agentic-KB revert -m 1 c50197c && git -C /Users/jaywest/Agentic-KB push` |
| Agentic-KB | `9da5c2a` | docs(backlog): record switch-vault route drain (9th of 36) | docs-only, revert is safe/trivial |

**PRs (no auto-merge):**

| Repo | PR | Branch | Why not auto-merged |
|---|---|---|---|
| Agentic-KB | [#30](https://github.com/jaydubya818/Agentic-KB/pull/30) (carried, 1 day old) | `ntf/2026-10-05-next-og-rce-bump` | Dependency bump — exclusion-listed |
| Agentic-KB | [#29](https://github.com/jaydubya818/Agentic-KB/pull/29) (carried, 34 days old) | `ntf/2026-09-02-read-guard-unsafe-path` | Carried from prior runs — needs Jay's review |
| hermes-harness-missioncontrol | [#19](https://github.com/jaydubya818/hermes-harness-missioncontrol/pull/19) (carried, 41 days) | `ntf/2026-08-26-hydration-normalization` | Carried |
| hermes-harness-missioncontrol | [#20](https://github.com/jaydubya818/hermes-harness-missioncontrol/pull/20) (carried, 37 days) | `nightly/2026-08-30-improvements` | Carried |
| **SellerFi** | **[#217](https://github.com/jaydubya818/SellerFi/pull/217) (NEW)** | `ntf/2026-10-06-next-og-rce-bump` | SellerFi is branch+PR-only always, **and** dependency bump — double exclusion |

## 2. ACTION REQUIRED

1. **NEW, CRITICAL — SellerFi has the same unauthenticated next/og RCE (GHSA-vcvr-r3jv-pc5j) as Agentic-KB's still-unmerged PR #30.** SellerFi's `next` was pinned at 16.3.4 (vulnerable range 16.2.0–16.3.5). Fix prepared and opened as **PR #217** (bump to 16.3.8, `npm audit` critical clears, lockfile diff scoped to next's own entries only). **Could not run a full build/lint/typecheck gate in this sandbox** — prisma's install scripts are blocked here, and SellerFi's `next lint`/`type-check` were already red on `main` before this change (pre-existing, unrelated: a missing `eslint-config-next` devDependency and several missing `@types/*` packages). This is flagged explicitly in the PR so the gap in verification isn't mistaken for a passing gate.
2. **Agentic-KB PR #30** (the equivalent fix there) is still open and unmerged, 1 day old — same vulnerability class, same urgency.
3. A carried claim from prior reports — "SellerFi's `nightly/2026-08-31-improvements` fixes the Next.js 16.1.6 libheif RCE, unmerged" — is now **stale**; that branch no longer exists on origin. Dropped rather than carried forward.
4. SellerFi: Stripe webhook secret / Resend API key in docs history (carried, not re-verified this run). Twinz: leaked Vercel token (carried, not re-verified), `.mcp.json` still tracked (re-confirmed), `overrides` still ignored by npm workspaces with the fix parked on an unmerged branch (re-confirmed the branch exists, content not re-read).
5. Two credential-shaped Apple Notes titles (a literal API-key-as-title, and a note titled "Anthropic - api keys - KEYS") were discovered for the first time this run, screened by title only per policy, never fetched. Grepped the repos this job touches for the key pattern — nothing committed.
6. Agentic-KB's residual `js-yaml` advisory (GHSA-2883-xcg3-v3hh, via `gray-matter`) remains open, untouched this run.
7. MissionControl worktree count: 61, unchanged, not this job's concern but noted per routine.

## 3. Harvest

| Class | Count |
|---|---|
| Total notes in Apple Notes | 250 |
| Candidates (new or modified since last seen) | 127 |
| Credential-shaped titles, screened without fetching | 2 |
| SKIP_EMPTY (<120 bytes plaintext — screenshots, link dumps) | ~70 |
| Substantive but not actionable in code | ~55 |
| Reached ImprovementProposal stage | 0 |
| Ingested to `raw/clippings/` | 0 |
| Work orders from harvest | 0 |

This run's harvest was unusual: `notesSeen` had only ever reached back to roughly 2026-09-07, leaving a **121-note backlog dating to 2026-08-14** that no prior run had evaluated. That gap is now closed — every note back to 2026-08-14 has been screened and is recorded in `notesSeen`.

What the backlog actually contained, by rejection reason:
- **Pasted screenshots / link dumps** (~70 notes) — empty plaintext bodies, Screen 2.
- **Career-search preparation material** (~45 notes, 2026-08-24 to 2026-09-05) — cheat sheets, STAAR-format stories, screening-call scripts, architecture study guides, leadership frameworks, tied to a role Jay was pursuing this summer. Substantive, clearly Jay's, but not actionable in code. The search appears to have concluded by early September.
- **One personal business idea** (p7203, "Tony" / RoofClaim Recovery) — already compiled into the KB on 2026-08-29 (`wiki/personal/roofclaim-recovery-business-plan`), confirming an earlier run or session had already captured it even though it never appeared in this job's `notesSeen`.
- **Large multi-phase Mission Control agent-prompts** (p6971's 5-phase Factory Memory design, p8248's admission authorization, p7018's full-repo-audit prompt, p6972's "implement my software factory" request) — exactly the "agent prompts for multi-phase subsystems" this job's calibration notes describe. Large by any sizing; not work orders for this job.

KB side: `wiki/candidates.md` unchanged since 2026-09-02, every topic still single-source. `wiki/action-tracker.md` Open/Blocked both still empty. `wiki/recently-added.md` last entry still 2026-08-29. 0 KB-sourced work orders.

## 4. Proposals

No item reached Phase 2b's ImprovementProposal stage this run — every harvest candidate was rejected at the cheap-filter stage (not actionable in code, or maps to no repo). Consistent with this job's calibration: a zero-harvest-proposal run is the correct outcome, not a shortfall.

## 5. Backlog delta

**Agentic-KB `docs/NIGHTLY-BACKLOG.md`:**
- Added: 9th-route-handler drain entry (`switch-vault`, with its pinned gap) under the existing "web/ has no test suite" Open item.
- Still open: 27 of 36 route handlers; the `.github/workflows/test.yml` web-test-wiring item (b); the residual `js-yaml` advisory.

No other repo's backlog was touched or surveyed this run (time went to the 121-note harvest clear and the SellerFi RCE finding).

## 6. Hygiene

- Agentic-KB: 1 worktree created (`Agentic-KB-switch-vault`), removed after merge. Count back to baseline of 2 (both pre-existing, untouched).
- SellerFi: 1 worktree created (`SellerFi-next-rce`), removed after pushing its branch/opening its PR. Count back to baseline of 2 (both pre-existing, untouched).
- MissionControl: 61 worktrees (via `git worktree list` minus main), unchanged from 2026-10-04/05 — not this job's concern, noted per routine.
- Disk: 46–48 GiB free throughout, no pressure.
- Kill switch: clear throughout.

All work for this run completed; nothing silently dropped.
