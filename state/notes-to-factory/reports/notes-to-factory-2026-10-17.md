# notes-to-factory — 2026-10-17

## 1. Ledger

**Merges (3):**

| Repo | SHA | Source | Revert |
|---|---|---|---|
| Agentic-KB | `be452d79` | backlog Agentic-KB docs/NIGHTLY-BACKLOG.md (route-handler drain series, 20th of 36) | `git -C /Users/jaywest/Agentic-KB revert -m 1 be452d79 && git push` |
| Agentic-KB | `ad7b9762` | backlog bookkeeping, same drain item | `git -C /Users/jaywest/Agentic-KB revert -m 1 ad7b9762 && git push` |
| Agentic-KB | `e7c79078` | apple-notes harvest 2026-10-17T15:21Z (5 of 16 held back to wiki/_private/) | `git -C /Users/jaywest/Agentic-KB revert -m 1 e7c79078 && git push` |

**PRs (none opened this run; 4 standing, re-verified not re-gated):**

- Agentic-KB #29 — OPEN, 45 days (opened 2026-09-02)
- Agentic-KB #30 — OPEN, 12 days (opened 2026-10-05) — **critical RCE fix, GHSA-vcvr-r3jv-pc5j, next 16.3.3 → 16.3.8**
- hermes-harness-missioncontrol #19 — OPEN, 52 days (opened 2026-08-26)
- hermes-harness-missioncontrol #20 — OPEN, 48 days (opened 2026-08-30)

## 2. ACTION REQUIRED

- **Agentic-KB #30 — critical RCE fix, 12 days unmerged, exclusion-listed from auto-merge (dependency bump).** Flagged daily since 2026-10-06 (12 consecutive days). Needs Jay's direct review/merge.
- Agentic-KB #29 (45 days), hermes-harness-missioncontrol #19 (52 days) and #20 (48 days) all remain open and aging further.
- Twinz: `.mcp.json` re-confirmed still tracked on `origin/master`. Leaked Vercel token / ignored `package.json` overrides item not re-verified in depth this run.
- SellerFi: Stripe webhook secret rotation still open (44 matching commits in history, redacted at HEAD only) — carried across many consecutive runs without action.
- SellerFi worktree count: 8, up from 7 on 2026-10-16.
- MissionControl worktree count: 64, up from 63 on 2026-10-16.
- No workflow patch files pending this run. Kill switch clear. Disk healthy (164 GiB free at start).

## 3. Harvest

| Class | Count |
|---|---|
| New/updated notes seen | 18 |
| Skipped — under 120-byte floor (bare link) | 1 |
| Ingested to raw/clippings/ | 16 attempted, 1 deduped in-script, 11 committed clean |
| Held back by pre-commit PII guard → wiki/_private/ | 5 |
| Credential-shaped (Screen 1) | 0 |
| Mapped to a routed repo / actionable in code | 0 |

Rejected items, with reasons:

- All 17 non-empty notes are continued Nscale (Product Manager, People Systems) interview-prep material — now naming a specific contact at the prospective employer for the first time — plus several generic, non-Jay-specific "how to build an AI agent" LinkedIn-style posts, and a prior-employer interview-prep note resurfaced from an earlier job search. **All fail cheap filter #1 ("actionable in code?")** — none describe a code change or map to a routed repo. This exactly matches the calibration note's expectation for this input stream.
- `p9439` ("https://lnkd.in/p/gC76BuYW") — bare link, under the 120-byte Screen 2 floor, skipped.
- 5 files held to `wiki/_private/` by the repo's own pre-commit PII guard: named-employer interview-cheat-sheet-styled phrasing and pay-related figures, the same hold-back category as the 2026-10-15/2026-10-16 runs.

KB candidates/action-tracker: `wiki/candidates.md` still single-source-only on every entry; `wiki/action-tracker.md` Open and Blocked both empty; `wiki/recently-added.md` unchanged in substance since 2026-08-29. **0 KB-sourced work orders.**

## 4. Proposals

| Item | Repo | Decision | Hypothesis / reason |
|---|---|---|---|
| `repos/[repo]/docs/route.ts` (75 lines, GET) | Agentic-KB | IMPLEMENT (drain) | Thin wrapper over already-unit-tested `getRepo()`/`repoDocsRoot()` (`lib/repo-runtime`); adding characterization coverage closes a gap in the route-handler drain series with no production-code risk. **Acceptance evidence observed:** web suite 169/169 → 176/176, failing-then-passing proof on a deliberately-broken assertion, full gate green, fresh-clone verification green. |
| Everything in Agentic-Pi-Harness `## Open` (17 entries) | Agentic-Pi-Harness | BACKLOG (re-confirmed) | Every entry is self-described as a design proposal, a Tier-B/`workflow`-scope blocker, or an explicit "decision for Jay." Re-surveyed fresh end to end, not assumed. |
| Everything in hermes-harness-missioncontrol `## Open` (12 entries) | hermes-harness-missioncontrol | BACKLOG (re-confirmed) | Same as above. |
| `agents/promote` (44 lines) | Agentic-KB | NOT_APPLICABLE (standing skip, 6th night) | Two real write actions dispatched off one undifferentiated body — not a thin wrapper. Re-read fresh this run. |
| `process/run-all` (67 lines) | Agentic-KB | NOT_APPLICABLE (standing skip) | Makes live `fetch()` calls to its own other routes and actually triggers file processing — not a thin wrapper. Re-read fresh this run. |

No "docs/config/skill edit instead of code" case arose this run — nothing in the harvest reached the improvement gate at all.

## 5. Backlog delta

- **Agentic-KB:** `docs/NIGHTLY-BACKLOG.md` — added one sub-bullet recording the 20th route-handler drain (`repos/[repo]/docs`). No items moved to Closed or Checked-not-applicable this run (the drain item is itself the addition, not a backlog item being closed).
- All other 5 routed repos with local checkouts (Agentic-Pi-Harness, hermes-harness-missioncontrol, Twinz, SellerFi, MissionControl): backlog files re-confirmed present on `origin/<default-branch>`, no changes made.

## 6. Hygiene

- Worktrees: 1 created (`Agentic-KB-repo-docs`), 1 removed. Baseline 3 → 3, confirmed unchanged.
- MissionControl worktree count: 64 (up from 63 on 2026-10-16) — not touched by this job, flagged for Jay.
- SellerFi worktree count: 8 (up from 7 on 2026-10-16) — not touched by this job, flagged for Jay.
- `agentic_hr`, `AI-FDE-Agent`, `obsidian-vault`, `MissionControl` backlogs not surveyed for drain candidates this run (same gap as prior runs).

---
*Saved to the cloud outputs and to `/Users/jaywest/Agentic-KB/state/notes-to-factory/reports/notes-to-factory-2026-10-17.md`.*
