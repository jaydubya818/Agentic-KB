# notes-to-factory — 2026-10-12

## 1. Ledger

**Merges (2):**

| Repo | SHA | Source note / backlog | Gate reached | Revert |
|---|---|---|---|---|
| Agentic-KB | `7d900de5` | backlog Agentic-KB docs/NIGHTLY-BACKLOG.md 2026-08-20 ("web/ has no test suite", 15th of 36 route handlers) | Full code gate: typecheck clean, lint 0 errors, root 714/714, web 141/141, prod build green, fresh-clone install+test+build green | `git -C /Users/jaywest/Agentic-KB revert -m 1 7d900de5 && git -C /Users/jaywest/Agentic-KB push` |
| Agentic-KB | `407bb628` | same drain item (docs bookkeeping) | Docs-only: parse-checked, referenced paths verified to exist | `git -C /Users/jaywest/Agentic-KB revert -m 1 407bb628 && git -C /Users/jaywest/Agentic-KB push` |

**PRs (0 opened this run; 4 standing, all re-verified via `gh pr view`, none re-gated):**

- Agentic-KB #29 — OPEN, opened 2026-09-02 (**40 days**) — `assertReadAllowed` unsafe-path fix.
- Agentic-KB #30 — OPEN, opened 2026-10-05 (**7 days, critical RCE** GHSA-vcvr-r3jv-pc5j, next 16.3.3 → 16.3.8) — still unmerged.
- hermes-harness-missioncontrol #19 — OPEN, opened 2026-08-26 (**47 days**) — hydration normalization.
- hermes-harness-missioncontrol #20 — OPEN, opened 2026-08-30 (**43 days**) — `VITE_OPERATOR_TOKEN` `.env` guard.

## 2. ACTION REQUIRED

- **Agentic-KB #30 is a critical RCE fix, now 7 days old and unmerged.** Exclusion-listed from auto-merge by design (dependency bump) — needs Jay's direct review/merge.
- Agentic-KB #29 (40 days), hermes-harness-missioncontrol #19 (47 days) and #20 (43 days) remain open and continue aging with no resolution since 2026-10-11.
- **Twinz:** `.mcp.json` re-confirmed still tracked on `origin/master` this run (`git ls-tree`) — leak recurrence path remains open. Not re-investigated in depth this run; carried as-is.
- **SellerFi:** Stripe webhook secret (`whsec_`) history-search returned 44 matching commits via `git log --all -S"whsec_" -- '*.md'` this run — redacted at HEAD only, rotation still open, carried across many consecutive runs without action.
- **SellerFi worktree count: 7** (unchanged from 2026-10-11, still up from the 2 reported before that), including `codex/privacy-emergency-2026-10-10` — not touched or investigated this run, flagged for Jay.
- Kill switch: clear. Disk: 61 GiB free / 926 GiB at start.
- No credential-shaped titles or bodies this run; no workflow patches; no disk pressure.

## 3. Harvest

| Class | Count |
|---|---|
| New notes since last run | 4 (p9097, p9107, p9111, p9113) |
| SKIP_EMPTY (under 120-byte floor) | 0 |
| Credential-shaped, skipped unfetched | 0 |
| Ingested to `raw/clippings/` (KB-only, not actionable in code) | 4 |
| Reached Phase 2b (ImprovementProposal) | 0 |
| Work orders from Apple Notes | 0 |
| KB-sourced work orders (candidates.md / action-tracker.md) | 0 |

Rejected items, one line each:

- **p9097 "Flatrate"** — a new-business idea (LinkedIn launch, an autonomous "Milo" bot running PRs/SEO/newsletter) with no existing repo. Fails Cheap Filter 2 (no clean repo mapping). KB item only.
- **p9107 "Yes. I genuinely like what you're building..."** — an external critique/review of Jay's overall architecture (Sofie/MissionControl/MyFactory), not an instruction and not actionable against one repo. KB item only.
- **p9111 "AVF"** — Autonomous Venture Factory architecture diagram, a cross-system business-creation platform concept. Large by nature, maps to no single routed repo. KB item / future design-proposal material.
- **p9113 "IMPLEMENTATION PLAN"** — explicitly written to be "copied directly into a new Codex or Claude Code thread"; a multi-phase subsystem directive for turning AVF into a full autonomous company-operating platform. Large, multi-repo, no single mapping — exactly the calibration note's "agent prompts for multi-phase subsystems" pattern. KB item only.

All 4 ingested to `raw/clippings/` (none credential-shaped, none under the 120-byte floor), committed as `1997cbe9` and pushed before any triage, per the ingest-then-triage ordering.

KB candidates/action-tracker re-verified unchanged: `wiki/candidates.md` last touched 2026-09-02 (still every topic at exactly 1 source, 0 at 2+); `wiki/action-tracker.md` Open and Blocked both still empty; `wiki/recently-added.md` unchanged in substance. 0 KB-sourced work orders.

Backlog coverage re-derived from `origin/<default-branch>` for all 8 routed repos with local checkouts (note: a compound shell loop checking all 8 at once produced a false "MISSING" for every repo — the same failure-open symptom the skill's calibration note warns about from 2026-08-22. Re-checked each repo individually with a short, single-purpose command; all 8 confirmed **HAVE** `docs/NIGHTLY-BACKLOG.md` on `origin`.)

## 4. Proposals

| Item | Repo | Decision | Hypothesis / reason |
|---|---|---|---|
| p9097 Flatrate | — | NOT_APPLICABLE | No repo mapping; cheap-filter rejection, never reached a full ImprovementProposal. |
| p9107 critique note | — | NOT_APPLICABLE | External commentary, not an instruction; no repo mapping. |
| p9111 AVF | — | NOT_APPLICABLE | Large, cross-system, no repo mapping. |
| p9113 Implementation Plan | — | NOT_APPLICABLE | Large, cross-system, explicitly a design/build directive for a new platform, no repo mapping. |
| Drain: `repos/[repo]/close-task` route characterization | Agentic-KB | **IMPLEMENT** | If we add route-level characterization tests, the 15th of 36 `web/` route handlers gets HTTP-layer coverage its underlying lib function's unit tests cannot provide. Acceptance evidence observed: `npm --prefix web test` went from 133/133 to 141/141 (8 new tests, all passing); the GAP test was verified to go red (400→200 flip, actual 400 vs expected 200) against the real route before being reverted; typecheck/lint/build/fresh-clone all green. |

Agentic-Pi-Harness (18 Open items) and hermes-harness-missioncontrol (14 Open items) were both re-surveyed fresh from `origin/main` before falling back to the Agentic-KB route-handler series — identical counts to 2026-10-11, and every item remains a named design proposal, a "wants a decision" item, or a response-shape/auth-model change already rejected from nightly sizing by this file's own prior triage. No new Small item in either repo this run. No pattern of "a docs/config/skill edit would have been the right call instead of code" showed up this run — the one IMPLEMENT decision was genuinely a test-only addition.

## 5. Backlog delta

| Repo | Added | Closed | Moved to not-applicable |
|---|---|---|---|
| Agentic-KB | 1 (15th-handler drain entry) | 0 | 0 |

No other repo's backlog was touched this run.

## 6. Hygiene

- Worktrees created: 1 (`Agentic-KB-repo-close-task`). Removed via `git worktree remove --force` + branch delete + `git worktree prune`. Count back to the pre-existing baseline of 2 (`Agentic-KB-sofie-writeback-hardening`, `.claude/worktrees/affectionate-swanson-41d555` — both pre-existing, untouched).
- MissionControl worktree count: 59 (via `git worktree list` minus the main entry) — roughly unchanged, not touched by this job.
- SellerFi worktree count: 7 — unchanged from 2026-10-11, not touched by this job, flagged above.
