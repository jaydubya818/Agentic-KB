# notes-to-factory — 2026-10-27

Run fired 15:22:52 UTC (scheduled for 15:20:00 UTC). Kill switch: clear. Disk: 58 GiB free, unchanged. The `mcp__remote-devices__*` bridge dropped and reconnected once mid-run (during the Agentic-KB backlog read); no work was lost, the next tool call after reconnect picked up cleanly.

## 1. Ledger

**Merges (direct to `main`):**

| Repo | SHA | Source | What |
|---|---|---|---|
| Agentic-KB | `b631442d` (merge of `30995fc3`) | this run's own dependency audit | Docs-only: corrected the stale 2026-10-05 Open entry (said PR #30 was still unmerged; it merged 2026-10-18 as `e07ff3d0`), moved it to Closed, and filed a new Open entry for the fresh advisories below. Revert: `git -C /Users/jaywest/Agentic-KB revert -m 1 b631442d && git -C /Users/jaywest/Agentic-KB push` |

**PRs opened (not auto-merged):**

| Repo | Branch | PR | Why not auto-merged |
|---|---|---|---|
| Agentic-KB | `ntf/2026-10-27-next-audit-fix` | [#31](https://github.com/jaydubya818/Agentic-KB/pull/31) | Dependency version bump — on the exclusion list regardless of gate results |

No other merges, no other PRs opened this run.

## 2. ACTION REQUIRED

1. **New critical findings, already fixed and waiting on a human merge: Agentic-KB PR #31.** This run's routine dependency audit (not sourced from Jay's notes or the KB) found that `next` 16.3.8 — the version PR #30 landed nine days ago — is itself inside the vulnerable range (`>=16.0.0 <=16.4.0`) for two **new** critical advisories: GHSA-2464-fhr4-w9xw (unauthenticated RCE via the Image Optimization API with SVG files) and GHSA-673q-mjm6-r5xr (RCE in `use cache` functions returning typed arrays), plus GHSA-p3m5-59mp-jv5r (high, DoS via Server Actions). Same unconditional-exposure shape as the two prior Next.js entries in this backlog: the vulnerable route is mounted by the framework whether or not the app calls it. Fix (bump to 16.4.3, latest stable, plus `zod`/`postcss-selector-parser` cleared as a side effect of `npm audit fix`) is prepared, gated, and green — see Proposals below — and open as PR #31. `npm audit` now reports 0 vulnerabilities.
2. **The Agentic-KB backlog had gone stale on a security item for 9 days without anyone noticing.** PR #30 (the prior critical `next`/`sharp` fix) merged 2026-10-18; the 2026-10-07 and 2026-10-08 ledger notes above it still said "still OPEN." Corrected this run (see Ledger). Worth a process note: this job re-verifies PR status via `gh pr view` on *some* runs but not every run, and the gap between "merged" and "the backlog says so" was nine days this time. Consider re-verifying every open PR's status every run rather than sampling — it is a cheap `gh pr list --json` call per repo.
3. **hermes-harness-missioncontrol PR #19** remains OPEN, now **62 days** (opened 2026-08-26), `mergeable` still CONFLICTING, unchanged from 2026-10-26. Still a human decision — needs a manual rebase before it can land.
4. **SellerFi PR #218** ("Emergency: close marketplace identity and document disclosure paths") is still a **draft**, opened 2026-10-10, now 17 days old. Not flagging this as abandoned — it's marked draft, i.e. still being worked — but a security-titled "Emergency" PR sitting in draft for over two weeks seemed worth surfacing rather than silently skipping.
5. Twinz `.mcp.json`/`.mcp.json.example` leak-recurrence path and SellerFi's Stripe webhook secret rotation: **not re-verified in depth this run**, carried forward unchanged from 2026-10-26.
6. Worktree counts: MissionControl 66 (unchanged from 2026-10-26), SellerFi 8 (unchanged). Neither over the 40-stale threshold that would warrant a cleanup recommendation.
7. `agentic_hr`, `AI-FDE-Agent`, `obsidian-vault` backlogs: not surveyed for drain candidates this run (same gap as prior runs — these three have no local checkout in the routing table and would need a fresh clone).
8. A genuine shell-discipline gotcha hit during this run, logged here in case it recurs: a Phase-2e helper script assigned a shell variable named `path` inside a function (`path="$2"`). In zsh, the **lowercase `path`** is a special array tied to `$PATH` — assigning to it silently replaces `$PATH` with the assigned value, so every subsequent command in that function (`git`, in this case) came back "command not found" even though `PATH` had been exported correctly one line earlier. Renamed the variable (`rpath`) and the script worked. Worth adding to this skill's shell-discipline notes alongside the existing `PATH`-export and quoted-glob gotchas, since it is exactly the kind of failure that looks like a broken environment and is not.

## 3. Harvest

**Disposition table (Apple Notes, modified since last run's `lastRunAt` of 2026-10-26T15:25:25Z, plus a 2-day lookback margin):**

| Disposition | Count |
|---|---|
| Credentials held back (Screen 1: title or body) | 0 |
| Empty/screenshot body, under 120 bytes (Screen 2) | 2 |
| Ingested, then rejected at cheap-filter triage | 5 |
| Work orders produced | 0 |

**The 5 rejected, with one-line reasons** (none mapped to a repo; none are KB material — all personal):

- `p9775` "Doctor" — personal health notes (question list for an upcoming appointment). Not actionable in code. Contents deliberately not reproduced in this report beyond the title.
- `p9773` "To do" — personal task list (EDD filing, job search, a laptop return) plus two non-code business notes (FlatRatePA licensing status, a Claimsite.com RAG-retrieval complaint with no code pointer). Does not map to any repo in the routing table.
- `p9772` "Launch Checklist for Danielle" — a business/operations checklist for a public-adjusting venture launch (licensing, contracts, marketing accounts). Not actionable in code.
- `p6865` "Jarrett West's Vision" — a personal career-vision document. Not actionable in code, not KB material.
- `p9770` "Daily Ritual Challenge" — a personal habit-tracking note (morning/evening checklist, 90-day challenge). Not actionable in code.

**KB candidates / repo backlogs:** `wiki/candidates.md` remains single-source-only on every entry sampled (no 2+-source convergence). `wiki/action-tracker.md`'s Open and Blocked sections are both still empty. `wiki/recently-added.md` is stale since 2026-08-29 — unchanged pattern, 0 KB-sourced work orders. Backlog coverage re-derived from `origin/<default-branch>` for all 8 repos this run (not trusted from the carried claim): all 8 confirmed **HAS** `docs/NIGHTLY-BACKLOG.md`.

## 4. Proposals

| Item | Repo | Decision | Hypothesis / evidence |
|---|---|---|---|
| Bump `next` 16.3.8 → 16.4.3 (+ `zod`, `postcss-selector-parser` via `npm audit fix`) | Agentic-KB | `IMPLEMENT` | Hypothesis: the pinned version sits inside two new critical-RCE advisory ranges; bumping past the ceiling removes the exposure without touching application code (no `next/og`/`use cache` usage exists in `src/`). Acceptance evidence observed: `npm audit` went from 3 vulnerabilities (1 critical-group, 1 high, 1 moderate) to 0; full gate green (`tsc --noEmit` clean; `eslint .` 0 errors, 9 pre-existing warnings; web 285/285 and root 714/714, both unchanged from the pre-change baseline; production build green, all 36 route handlers present in the manifest). Not auto-merged — dependency bump, exclusion list — opened as PR #31. |
| Correct the stale PR #30 ledger entry | Agentic-KB | `IMPLEMENT` (docs-only) | Hypothesis: a backlog entry that misstates a merged PR's status wastes every future run's re-verification effort on a question that's already settled. Evidence: both cited commits (`e07ff3d0`, `5159d3f8`) confirmed present on `main` via `git cat-file -e`; section headers and markdown structure intact after the edit. Merged directly to `main`. |
| 29th route-handler drain candidate (`web/src/app/api/query/route.ts`) | Agentic-KB | `NOT_APPLICABLE` | Source intent: continue the route-handler characterization series (28/36 landed as of 2026-10-26). Current state: inspected the file directly — 431 lines, imports `Anthropic` from `@anthropic-ai/sdk` and constructs a client at module scope for an SSE-streamed completion. Same class as the already-skipped `compile`/`lint`/`process`/`process/run-all` handlers: no simple request/response seam to characterize without either mocking the Anthropic client (a nontrivial test-infrastructure decision, not a nightly patch) or making real paid API calls from a test. Decision: `NOT_APPLICABLE` for this series. **This closes out the series' remaining pool**: all 8 of the 36 handlers still uncovered (`agents/promote`, `compile`, `lint`, `process`, `process/run-all`, `query`, `search`, `vault-watch`) are now confirmed same-class. The route-handler drain series has no further Small/Medium candidates without a design decision on testing LLM-calling routes — flagging this for Jay rather than letting future runs keep re-discovering it one handler at a time. |
| Other Agentic-KB Open backlog items (re-surveyed, not re-litigated) | Agentic-KB | `BACKLOG` (unchanged) | All remaining top-level Open items re-read this run are Large/design-proposal class (the `requireAuth()` chokepoint, 9-site `atomicWrite` dedup, `classFor`/`globToRegex` design questions, the frontmatter-codec replacement, etc.) — consistent with every run since 2026-08-25. Not re-filed; no new reasoning to add. |
| Agentic-Pi-Harness Open backlog (re-surveyed) | Agentic-Pi-Harness | `BACKLOG` (unchanged) | Read the full Open section directly from `origin/main`. All entries are Large/design-proposal class (contract decisions about `ConcurrencyClassifier`, `PiHarnessError.retryable`, the `KnowledgePathClass` authority table, etc.) or workflow-scope-blocked. No Small candidate found. |
| hermes-harness-missioncontrol Open backlog (re-surveyed) | hermes-harness-missioncontrol | `BACKLOG` (unchanged) | Read the full Open section directly from `origin/main`. All entries are Large/design-proposal class (auth redesign, retention policy, read-model contract changes) or CI/workflow-scope-blocked. No Small candidate found. |

No "docs/config/skill edit instead of code" pattern surfaced this run — both IMPLEMENT items above were genuinely code/dependency-level.

## 5. Backlog delta

- **Agentic-KB**: 1 entry closed (PR #30 / next 16.3.3→16.3.8 + sharp + js-yaml + source-map-js, all confirmed merged), 1 entry added (PR #31 / next 16.3.8→16.4.3 + zod + postcss-selector-parser). Net Open count unchanged (one closed, one opened). No "Checked, not applicable" entries added this run — the `query` route decision (NOT_APPLICABLE) was recorded in this report rather than in the backlog file itself, since it closes out the *series* rather than filing a new standalone item; worth adding to the backlog explicitly next run if no one picks up the LLM-route-testing design decision.
- Agentic-Pi-Harness, hermes-harness-missioncontrol: no changes (surveyed, nothing qualified).
- Other repos: not surveyed this run.

## 6. Hygiene

- Worktrees created this run: 2 (`Agentic-KB-next-audit-fix`, `Agentic-KB-backlog-docs`), both in `/tmp/ntf/`, both removed (`git worktree remove --force`) and pruned. Agentic-KB worktree count: 2 pre-existing (unrelated: `Agentic-KB-sofie-writeback-hardening`, a detached-HEAD `.claude/worktrees` entry) before and after — confirmed via `git worktree list`, neither touched.
- Local branch `ntf/2026-10-27-backlog-docs` was merged and deleted (never pushed — merge was local-only before push to `main`). Local branch `ntf/2026-10-27-next-audit-fix` kept (it's PR #31, open).
- MissionControl worktrees: 66 (unchanged from 2026-10-26). SellerFi worktrees: 8 (unchanged).
