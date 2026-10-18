# notes-to-factory — 2026-10-09

Run window: lastRunAt 2026-10-08T15:30:00Z → this run 2026-10-09T15:21:00Z.
Kill switch: clear (checked at start and again after all merges). Disk: ~94 GiB free / 926 GiB — well above the two-wave threshold.

## 1. Ledger

**Merges (2):**

| Repo | SHA | Source | Gate reached |
|---|---|---|---|
| Agentic-KB | `ff236be` | backlog drain — `docs/NIGHTLY-BACKLOG.md` 2026-08-20 "web/ has no test suite" | Full code gate: typecheck, lint, root suite 694/694, web suite 119→124, production build, isolated-worktree run, fresh-clone install+test+build. Revert: `git -C /Users/jaywest/Agentic-KB revert -m 1 ff236be && git -C /Users/jaywest/Agentic-KB push` |
| Agentic-KB | `ae55832` | same drain, bookkeeping | Docs-only: parse-checked, every referenced path verified to exist. Revert: `git -C /Users/jaywest/Agentic-KB revert -m 1 ae55832 && git -C /Users/jaywest/Agentic-KB push` |

**PRs opened this run:** none.

**PRs re-verified via `gh pr view` (not re-gated):**
- Agentic-KB #29 OPEN (opened 2026-09-02, 37 days) — `assertReadAllowed` unsafe-path fix
- Agentic-KB #30 OPEN (opened 2026-10-05, 4 days, **critical RCE** GHSA-vcvr-r3jv-pc5j, `next` 16.3.3→16.3.8)
- hermes-harness-missioncontrol #19 OPEN (opened 2026-08-26, 44 days) — legacy-run hydration normalization
- hermes-harness-missioncontrol #20 OPEN (opened 2026-08-30, 40 days) — `VITE_OPERATOR_TOKEN` `.env` guard

All four aging further, no resolutions since 2026-10-08.

## 2. ACTION REQUIRED

- **Agentic-KB #30 is a critical RCE fix, now 4 days old and unmerged.** Exclusion-listed from auto-merge (dependency bump) and needs Jay's direct review/merge.
- **Agentic-KB #29 (37 days) and hermes-harness-missioncontrol #19 (44 days) / #20 (40 days)** remain open and are now well over a month old (two of them) — worth a direct look.
- source-map-js and js-yaml (via gray-matter) advisories in Agentic-KB `web/` remain open and untouched this run (carried, not re-verified in depth).
- Twinz: `.mcp.json` re-confirmed still tracked on `origin/master` this run (leak-recurrence path still open). Leaked Vercel token / ignored package.json overrides item not re-verified in depth this run — carried as-is.
- SellerFi: Stripe webhook secret / Resend API key rotation item not re-verified in depth this run — carried as-is.
- No new credential-shaped Apple Notes titles or bodies this run.

## 3. Harvest

**Apple Notes** — `list_notes` limit 30 (per 2026-10-08's finding that limit 250 times out). 4 candidates not in `notesSeen`: p9056, p9052, p9050, p9047.

| Disposition | Count |
|---|---|
| SKIP_EMPTY (object-replacement-character-only or bare-link bodies, under the 120-byte floor) | 4 |
| Credential-shaped (title or body) | 0 |
| Ingested to `raw/clippings/` | 0 |
| Reached Phase 2b (ImprovementProposal) | 0 |

Rejected items, one line each:
- p9056, p9052, p9050 — object-replacement-character-only bodies (screenshot/voice-memo/empty "New Note"), SKIP_EMPTY.
- p9047 ("google-research/rrsi") — body is just the repo name plus the same placeholder character, ~22 bytes, SKIP_EMPTY.

**KB candidates/action-tracker** — re-verified unchanged: `wiki/candidates.md` last touched 2026-09-02 (`git log -1`), 0 topics with 2+ sources; `wiki/action-tracker.md` Open and Blocked both still empty; `wiki/recently-added.md` tail still ends 2026-08-29. 0 KB-sourced work orders.

**Backlog coverage** — re-derived from `origin/<default-branch>` for all 8 routed repos with local checkouts (Agentic-KB, Agentic-Pi-Harness, hermes-harness-missioncontrol, Twinz, morning-review, ai-software-factory-mastery, MissionControl, SellerFi): all HAVE `docs/NIGHTLY-BACKLOG.md`.

**0 work orders from the harvest** → proceeded to Phase 2e drain.

## 4. Proposals / drain

Harvest produced 0 work orders, so this run surveyed three repos for a drain candidate rather than just defaulting to the Agentic-KB series:

- **Agentic-Pi-Harness** — read the full `## Open` section of `docs/NIGHTLY-BACKLOG.md` (fetched fresh from `origin/main`). Every open item is explicitly a "design proposal" or is "Sizeable... wants a decision" — the metrics.json-key-order item the skill's calibration note names was already Closed (landed 2026-08-25); the live Open items are things like the five-list `KnowledgePathClass` authority table, the inert `path_denylist`/`network_access` bridge constraints, and three items blocked on one shared "which sidecars are Tier A contract surface?" question. **Decision: no Small item available — all Open items are Large or blocked on a decision for Jay.**
- **hermes-harness-missioncontrol** — same read. Every Open item (the worker `success` gate, the execute-step reply narrowing, `loadContextBundle`'s absolute paths, the `actor` filter on `/api/read-models/approvals`, `HARNESS_OPERATOR_TOKEN`) changes a response shape the console reads or is an auth redesign — all explicitly rejected from nightly sizing in this file's own 2026-08-29 triage sweep. The two items the skill's calibration note cites (`safeRelativePath`, artifact dedupe matching on `undefined`) are both already Closed (landed 2026-08-28/2026-09-02). **Decision: no Small item available.**
- **Agentic-KB** — continued the established `web/` route-handler test-coverage series (12 of 36 now covered; see table below).

| Item | Repo | Decision | Hypothesis / reason |
|---|---|---|---|
| `agents/verify-audit` route handler has no test coverage | Agentic-KB | **IMPLEMENT** | If characterization tests are added for the route's `ok`→HTTP-status mapping, a future change to `verifyAuditChain()`'s return shape or the route's status-code logic will be caught instead of silently drifting; acceptance evidence: `npm --prefix web test` passing with the new file's 5 cases, confirmed failing-then-passing against the real route. |
| `Agentic-Pi-Harness` Open backlog survey | Agentic-Pi-Harness | **NOT_APPLICABLE** | Every Open item is a named design proposal or explicitly blocked on a decision only Jay can make. No unambiguously-Small item exists. |
| `hermes-harness-missioncontrol` Open backlog survey | hermes-harness-missioncontrol | **NOT_APPLICABLE** | Every Open item changes a response shape the console reads, or is an auth-model redesign; the file's own 2026-08-29 sweep already rejected these by name. No unambiguously-Small item exists. |

Acceptance evidence actually observed for the one IMPLEMENT: `npm --prefix web test` went 119/119 → 124/124 in the isolated worktree, confirmed again in the main checkout after merge, and a third time in a genuine fresh `git clone`. Typecheck clean. Lint 0 errors (same 5 pre-existing warnings as every prior drain in this series, unrelated files). Production build green in all three places. Failing-then-passing check performed on the tampered-entry test (temporarily asserted HTTP 200 instead of 422; confirmed red with `422 !== 200` against the real route; reverted; reconfirmed 124/124 green).

No "docs/config/skill edit instead of code" findings this run — the one implemented item was already the minimal-surface option (a test-only addition, no production code touched).

## 5. Backlog delta

| Repo | Added | Closed | Moved to not-applicable |
|---|---|---|---|
| Agentic-KB | 1 drain-series entry (12th route handler) | 0 | 0 |

Agentic-Pi-Harness and hermes-harness-missioncontrol backlogs were read in full but not modified — both already correctly record their Open items as blocked/Large, with no new finding to add.

## 6. Hygiene

- Worktrees created: 1 (`Agentic-KB-verify-audit-route`). Removed via `git worktree remove --force` + branch delete (merged directly to `main`, not a PR) + `git worktree prune`. Count back to the pre-existing baseline of 2 (`Agentic-KB-sofie-writeback-hardening`, `.claude/worktrees/affectionate-swanson-41d555` — both pre-existing, untouched).
- Fresh clone (`/tmp/ntf/akb-fresh-clone`) created for verification, removed after.
- MissionControl worktree count: 61 (via `git worktree list` minus main entry) — unchanged, not touched by this job.
- SellerFi worktree count: 2 pre-existing, unchanged.
