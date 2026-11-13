# Notes → Factory — 2026-11-13

## 1. Ledger

- Merges: none.
- PRs opened by this job: none.
- Both empty this run.

## 2. ACTION REQUIRED

- **Apple Notes bridge partially recovered.** `list_notes` answered at `limit=50` for the first time since 2026-11-06 (8-day unreachable streak broken), but `limit=150` and `limit=600` both still timed out at 80s. Fine for today's harvest window; not yet reliable for a full backlog catch-up.
- **~5-day note gap (11-07 to 11-11) still unrecovered.** Today's harvest only reached back to `lastRunAt` (2026-11-12 08:20 Pacific) via the modification-date filter; the week the bridge was down was not swept. If the bridge stays up tomorrow, worth a deliberate paginated sweep by ID rather than one large listing.
- **PII guard caught a real miss in this run's own first attempt.** All 18 non-empty notes harvested today are job-search material related to a hiring conversation this morning — including specific compensation figures and a personal family-relocation reason. The commit to `raw/clippings/` was blocked by Agentic-KB's pre-commit PII guard; files were moved to `wiki/_private/` (gitignored) instead, matching the repo's existing convention for prior job-search clippings. `--no-verify` was not used.
- **Disk swing, unexplained both ways.** `/System/Volumes/Data` is at 137GiB free (85% used), up from 20GiB (98%) on 2026-11-12 — a ~117GiB recovery with no identified cause, mirroring the ~117GiB unexplained *loss* over the two days before that (68→26→20GiB). No longer a constraint, but the volatility itself is worth a look if it recurs.
- SellerFi: Stripe webhook secret / Resend API key rotation still outstanding (first flagged 2026-08-28, 11+ weeks).
- Twinz: `VERCEL_TOKEN` rotation at vercel.com still needed (first flagged 2026-09-01, 10+ weeks).
- obsidian-vault: tracked `.obsidian-api-key` still present and unrotated.
- Open PRs unchanged: MissionControl 5 (#241/242/243/246/248), SellerFi 4 (#221–224), Twinz 4 (#30–33) — none opened by this job.

## 3. Harvest

| Class | Count |
|---|---|
| Notes modified since last run | 21 |
| Skipped — credential pattern in title/body | 0 |
| Skipped — empty/near-empty body (<120 bytes) | 3 |
| Ingested, then PII-screened to `wiki/_private/` | 18 |
| Reached Phase 2 triage | 0 |

Rejected items, one line each:

- "New Recording" ×2 (p10473, p10371) — empty voice-memo placeholder, no transcript text.
- "https://lnkd.in/p/ggrYWvNw" (p10370) — bare link, no body.
- 18 job-search notes (cheat sheets, STAR stories, AI-COE design notes, MCP connector strategy framed as an interview answer, "Start My Day" assistant pitch, a hiring manager's LinkedIn profile copy, question lists) — all die at Phase 2a cheap filter #1 ("actionable in code?" = No); personal/compensation content, routed to `wiki/_private/` rather than the shared KB.

KB candidates / repo backlogs: `wiki/candidates.md`, `wiki/action-tracker.md`, `wiki/recently-added.md` unchanged since last run (no new KB-graduated items). All 8 routing-table repos' `docs/NIGHTLY-BACKLOG.md`, plus the 3 clone-based repos, confirmed byte-unchanged on `origin/<default-branch>` since 2026-11-12 via `git fetch` + `git log --since`.

## 4. Proposals

None reached Phase 2b — the harvest produced zero actionable items (expected; see calibration note in the job's own instructions), and Phase 2e's backlog drain found nothing new to re-screen (files unchanged from the already-exhausted multi-day record).

## 5. Backlog delta

No repo's `docs/NIGHTLY-BACKLOG.md` was touched this run. 0 added, 0 closed, 0 moved to not-applicable.

## 6. Hygiene

- Worktrees created: 0. Removed: 0.
- Counts confirmed unchanged: MissionControl 71, SellerFi 8, Agentic-KB 3, Agentic-Pi-Harness 4, hermes-harness-missioncontrol 1, Twinz 1. No `ntf/*` branches anywhere.
- 9th consecutive zero-drain day (2026-11-05 through 2026-11-13).
