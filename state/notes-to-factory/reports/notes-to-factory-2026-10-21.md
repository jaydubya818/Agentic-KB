# Notes → Factory — 2026-10-21

## Ledger

**Merges (Agentic-KB only):**

| Repo | SHA | Title | Revert |
|---|---|---|---|
| Agentic-KB | `82484c96` | chore(clippings): ingest 3 apple-notes (Ridgeline career-prep continuation, 2026-10-20) | `git -C /Users/jaywest/Agentic-KB revert -m 1 82484c96 && git push` |
| Agentic-KB | `453e04f8` | test(web): characterize agents/[id]/diff route handler (23 of 36) | `git -C /Users/jaywest/Agentic-KB revert -m 1 453e04f8 && git push` |
| Agentic-KB | `7dd40572` | docs(backlog): record 23rd route-handler drain | `git -C /Users/jaywest/Agentic-KB revert -m 1 7dd40572 && git push` |

No PRs opened this run (no Tier-B/exclusion-list work was attempted).

## ACTION REQUIRED

- **The 2026-10-20 run never finished.** It committed a 5-note clippings batch (`f1d3c92f`) but left `last-run.json`/`ledger.md`/the daily report unwritten — a Phase 5/6 failure on that date. This run detected the gap via `git log --author=notes-to-factory`, re-derived its candidate window independently, and confirmed via dedup that no notes were lost or double-processed. Worth adding a preflight check that flags a stale `last-run.json` (older than ~20h before a scheduled fire) as a likely prior-run failure, so it surfaces without needing a manual `git log` cross-check.
- **hermes-harness-missioncontrol PR #19** (hydration normalization) remains OPEN, now 56 days, `mergeable` still CONFLICTING (unchanged since 2026-10-19). Needs a manual rebase before it can land — a human call per the branch's own notes.
- **Twinz**: `.mcp.json` still tracked on `origin/master`. Unchanged, not re-verified in depth this run.
- **SellerFi**: Stripe webhook-secret rotation item still open (44 matching commits in history, redacted at HEAD only). Carried across many consecutive runs with no action taken.
- **Worktree counts unchanged**: SellerFi 8, MissionControl 64 — neither touched by this job.
- `agentic_hr`, `AI-FDE-Agent`, `obsidian-vault`, `MissionControl` backlogs still not surveyed for drain candidates (standing gap).

## Harvest

| Disposition | Count |
|---|---|
| Candidates evaluated | 22 |
| Skipped — empty/near-empty body (<120 bytes) | 8 |
| Duplicate-in-clippings (already landed by the incomplete 2026-10-20 run) | 5 |
| Ingested to `raw/clippings/` | 3 |
| Held back to `wiki/_private/` by the pre-commit PII guard | 6 |
| Work orders | 0 |

All 14 non-empty survivors were continued Ridgeline (Senior Manager, AI Leverage Engineering) and Nscale interview-prep/resume material: cheat sheets, STAR-format stories, a resume, and a Workday terminology/BP-and-security reference. None actionable in code — none map to a routed repo or describe a requested change. The one repo-name mention (a note describing the user's own open-source "Mission Control" project as an interview talking point) is a description of past work, not an instruction.

The PII guard flagged 6 of the 9 newly-written files: two on a cheat-sheet-styled phrasing match, two on a named-company-plus-interview-context pattern, two on specific compensation-figure mentions. Moved to `wiki/_private/clippings/` (gitignored) rather than bypassed with `--no-verify`, per the hook's own guidance — titles/content not reproduced here.

KB candidates/action-tracker re-verified unchanged: `wiki/candidates.md` still single-source-only throughout, `wiki/action-tracker.md` Open/Blocked both empty, `wiki/recently-added.md` unchanged in substance since 2026-08-29. 0 KB-sourced work orders.

## Proposals

None reached `IMPLEMENT` from the Apple Notes/KB harvest (0 candidates passed cheap filter #1 — nothing actionable in code).

**Backlog drain (Phase 2e):** harvest produced 0 work orders, so the run drained the backlog instead.

| Item | Repo | Decision | Notes |
|---|---|---|---|
| `agents/[id]/diff` route handler (23rd of 36, 81 lines) | Agentic-KB | **IMPLEMENT** | No tested-lib delegation to lean on — first route in the series tested against a real git-repo fixture rather than a mocked lib call. 7 characterization tests added. Acceptance evidence: web suite 202/202 → 209/209, root 714/714 unaffected, failing-then-passing proof verified (sha256-restored), full gate green, fresh-clone verified. |
| Agentic-Pi-Harness Open section (17 entries) | Agentic-Pi-Harness | re-surveyed, no change | Every entry remains self-described as a design proposal or Tier-B blocker — unchanged from 2026-10-19. |
| hermes-harness-missioncontrol Open section (14 entries) | hermes-harness-missioncontrol | re-surveyed, no change | Same pattern, including the `actor`-filter item, which states its own fix is a decision. |

GAP found and pinned (not fixed): `field_diffs` in the diff route compares `JSON.stringify(before[f])` to `JSON.stringify(after[f])` per field, which is positional on arrays — a same-set reorder of `allowed_writes` reads as changed even though nothing was added or removed. Whether the diff should be order-sensitive is a product decision, not a bug the route introduced.

## Backlog delta

**Agentic-KB** `docs/NIGHTLY-BACKLOG.md`: +1 Closed-series entry (23rd route-handler drain). Still open: 13 of 36 route handlers (`agents/promote`, `compile`, `ingest/webhook`, `lint`, `process`, `process/pending`, `process/run-all`, `query`, `query/save`, `repos/[repo]/search`, `search`, `vault-structure`, `vault-watch`).

No other repo's backlog was touched this run.

## Hygiene

- Worktrees: baseline 4 before, 4 after — confirmed unchanged. Local branch `ntf/2026-10-21-agents-id-diff-route` merged and deleted; never pushed, nothing dangling on the remote.
- Disk: 119 GiB free at start, well above the 30 GiB two-wave threshold — ran everything in one pass.
- Kill switch: clear throughout.
