# Notes → Factory — 2026-10-01

Kill switch: clear. All subagent-free run (single session, no Phase 3 fan-out
needed — only one repo had a drain candidate).

## 1. Ledger

**Merges (2, both Agentic-KB, both reachable from `origin/main`):**

| Repo | SHA | What | Revert |
|---|---|---|---|
| Agentic-KB | `4267c84` | `test(web): characterize the repos route handler (4th of 36)` | `git -C /Users/jaywest/Agentic-KB revert -m 1 4267c84b7641551f0e728d42036cb16eb4defeaf && git -C /Users/jaywest/Agentic-KB push` |
| Agentic-KB | `56272e3` | `docs(backlog): record repos route drain (4th of 36 handlers)` | `git -C /Users/jaywest/Agentic-KB revert -m 1 56272e3 && git -C /Users/jaywest/Agentic-KB push` |

Source for both: `backlog Agentic-KB docs/NIGHTLY-BACKLOG.md 2026-08-20 ("web/ has no test suite")`.

**PRs opened this run:** none.

**PRs carried, re-verified still OPEN via `gh pr view` (not re-gated):**

- Agentic-KB #29 — `fix(agent-runtime): assertReadAllowed rejects unsafe paths like its write twin` — 29 days open.
- hermes-harness-missioncontrol #19 — `fix(orchestrator-api): normalize legacy persisted runs once at hydration` — 36 days open.
- hermes-harness-missioncontrol #20 — `fix(harness-console): guard VITE_OPERATOR_TOKEN against .env files, not just process.env` — 32 days open.

## 2. ACTION REQUIRED

- **Three PRs are aging without review**: Agentic-KB #29 (29d), hermes-harness-missioncontrol #19 (36d) and #20 (32d). All were confirmed still open and unmerged this run. Worth a direct look from Jay — #19 in particular retires an assertion on a closed finding, which this job has correctly declined to decide on its own for five straight runs.
- **Twinz**: leaked Vercel API token in git history, unrevoked (carried, unchanged). Rotate at https://vercel.com/account/tokens.
- **Twinz**: `.mcp.json` tracked despite an intended `.gitignore` rule — leak recurrence path stays open (carried, unchanged).
- **Twinz**: root `package.json` `overrides` is silently ignored by the npm workspace install, so axios/undici/form-data/vite advisories (including a full-MITM axios CVE on the production `meeting-assistant` path) are unfixable by ordinary means until that's resolved. `nightly/2026-09-01-improvements` has the bumps parked, unmerged (carried, unchanged).
- **SellerFi**: `nightly/2026-08-31-improvements` fixes the Next.js 16.1.6 libheif RCE (GHSA-2xp9-vwfh-vxw4) and supersedes 5 other stale nightly branches — unmerged, needs a human click (carried, unchanged).
- **SellerFi**: Stripe webhook secret and Resend API key committed to docs history, redacted at HEAD only — rotation still open (carried, unchanged).
- No disk pressure (112 GB free), no workflow-patch files produced this run.

## 3. Harvest

| Class | Count |
|---|---|
| Notes modified/created since last run | 1 |
| Credential-shaped, skipped (Screen 1) | 0 |
| Empty body, skipped (Screen 2) | 1 |
| Ingested to `raw/clippings/` | 0 |

The one candidate, **p8954 "Celastrina Calea"** (created and modified 2026-09-30, ~11pm local), is a photo note — its `plaintext` body is two object-replacement characters, under the 120-byte floor. Almost certainly a plant photo (the title is a plant species name); nothing to ingest. This continues the pattern the calibration note describes: the input stream is structurally not producing Small/Medium code items, and that is the correct read of the evidence, not a triage failure.

## 4. Proposals

None reached the ImprovementProposal gate this run — the harvest produced no candidates past the cheap filters, so Phase 2b never ran.

**Phase 2e drain evaluation (both repos read in full, not sampled):**

| Repo | Open items read | Verdict |
|---|---|---|
| Agentic-Pi-Harness | 14 | Every entry is explicitly a design proposal, a blocked-on-decision item, or scoped Large by its own text. No drain candidate. |
| hermes-harness-missioncontrol | 9 (several with multi-day addenda) | Same shape — auth redesign, read-model response-shape changes, retention policy, or items already carried as open PRs. No drain candidate. |
| Agentic-KB | 1 relevant entry ("web/ has no test suite") | **Drained.** This entry has produced a one-handler-per-run pattern since 2026-09-02 and had its 4th installment this run. |

This is worth stating plainly: the two repos the skill's calibration note names as having held "genuinely Small items" on 2026-08-25 (`metrics.json` key order, `safeRelativePath` normalization, the unmatchable `actor` filter, artifact dedupe on `undefined`) have all since been closed, re-investigated, or reclassified by prior nightly runs — every remaining Open item in both backlogs, read end to end this run rather than assumed, is now explicitly a design-decision item. That calibration note is now five weeks stale on this specific point.

## 5. Backlog delta

**Agentic-KB** — `docs/NIGHTLY-BACKLOG.md`: 1 entry updated in place (the repeating "web/ has no test suite" item gained its 4th sub-bullet). No entries added or closed.

**Agentic-Pi-Harness, hermes-harness-missioncontrol**: no changes — both backlogs were read for drain evaluation and nothing in either needed a new Open/Closed/Checked-not-applicable entry; both already carry their own up-to-date status.

Other 5 repos not surveyed for backlog changes this run (time went to the one repo with a real candidate).

## 6. Hygiene

- Worktrees created: 3 (`Agentic-KB-repos-route`, `Agentic-KB-main-merge`, `akb-backlog-update`), all in `/tmp/ntf/`, none inside the repo.
- Worktrees removed: 3 of 3, via `git worktree remove --force` + `git worktree prune`.
- Worktree count confirmed back to baseline: 2 remaining (`Agentic-KB-sofie-writeback-hardening`, `.claude/worktrees/affectionate-swanson-41d555`), both pre-existing and untouched.
- Local branch `ntf/2026-10-01-repos-route-tests` deleted after merge (never pushed as its own remote ref — the merge commit went straight to `origin/main`).
- Fresh-clone verification directory (`/tmp/ntf/akb-fresh-clone`) removed after use.
- Disk: 112 GB free throughout, no pressure.

## Phase 6 — daily commit

This report, `last-run.json` and `ledger.md` are committed to `Agentic-KB` on `main` as this job's own bookkeeping commit, separate from the two implementation commits above.
