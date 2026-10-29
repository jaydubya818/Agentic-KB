# notes-to-factory — 2026-10-29

## 1. Ledger

**Merges:** 1 (docs-only; no work order, no drained item).

- `Agentic-Pi-Harness` — `5491871` (merge of `ce6e149`, branch `ntf/2026-10-29-sanitization-note`, deleted after merge) — docs-only addition to `docs/NIGHTLY-BACKLOG.md` recording a near-miss (see §4). Revert: `git -C /Users/jaywest/Agentic-Pi-Harness revert -m 1 5491871 && git -C /Users/jaywest/Agentic-Pi-Harness push`.

**PRs opened:** none.

**Work orders implemented / drained:** 0. One candidate (persist `LoopResult.sanitizations` to `sanitizations.jsonl`, Agentic-Pi-Harness) was implemented, carried through the full merge gate green, and then discarded unmerged — see §4.

## 2. ACTION REQUIRED

- **Agentic-Pi-Harness PR #13** (next@16.3.8→16.4.3 security bump family, tracked in prior reports) — resolved externally; confirmed merged, `f96f1ba` is now the tip of `origin/main`.
- **Agentic-KB PR #31** (next 16.3.8→16.4.3, 2 critical RCE + 1 high DoS) — resolved externally since the last run; `gh pr view 31` reports `MERGED`. No action needed.
- **Twinz — leaked Vercel API token (`VERCEL_TOKEN`), open since 2026-09-01.** HEAD still redacts it to `${VERCEL_TOKEN}` (confirmed this run), but the value remains reachable in git history from `bc80237` (2026-01-21) onward. Rotation on the Vercel dashboard is a human action this job cannot verify or perform — carrying forward unconfirmed.
- **Twinz backlog is stale and should be re-audited, not just drained from.** All 12 Open items are dated 2026-09-01 — nearly two months with no new entries and no re-verification. Spot-checked this run: the `nightly/2026-09-01-improvements` dependency-bump branch the backlog says is "parked" no longer exists on the remote, and PRs #4/#7/#8 that three Open items reference are no longer in the open list (`gh pr list` shows only #29, opened 2026-10-28, an unrelated dependabot-style bump). At least three Open entries are describing a state that no longer exists. Did not edit the file myself this run — closing out someone else's PR references without first confirming *how* each was resolved (merged vs. closed-without-merge, same distinction that mattered for hermes-harness-missioncontrol PR #19 and SellerFi PR #218 previously) is a verification step, not a quick fix, and this run's budget went to the Pi-Harness investigation instead.
- **SellerFi backlog carries two 2026-08-28/08-31 ACTION REQUIRED items** (merge `nightly/2026-08-28-improvements`; rotate a committed Stripe webhook secret) that are now two months old. Not re-verified in depth this run (rotation status specifically requires a credential-sensitive check this job's sandbox correctly declined to run — see below). `gh pr list` shows four *different*, recent open PRs (#221–224, mid-to-late October), so the backlog file's PR-shaped claims are likely stale here too, same pattern as Twinz.
- One command this run (a search for `.env*` history on SellerFi, intended only to check whether the Stripe secret item was stale) was blocked by the sandbox's own credential-materialization guard. Not retried. This is the correct outcome, but it means the Stripe rotation status is still genuinely unverified by this job and needs a human or a differently-scoped check.
- **obsidian-vault `.obsidian-api-key`** (tracked, non-gitignored, present since at least 2026-06-18) — carried forward unresolved from 2026-10-28; not re-touched this run.
- **MissionControl worktree count: 66** (unchanged from 2026-10-28, down from the climbing 70 flagged 2026-10-25). No longer climbing, but still worth a cleanup pass whenever Jay has a slot — same standing note as prior reports.

## 3. Harvest

| Class | Count |
|---|---|
| Notes modified since last run (2026-10-28T15:26:14Z) | 5 |
| Screen 1 — credential-shaped title/body | 0 held back |
| Screen 2 — under 120 bytes plaintext | 2 skipped |
| Ingested as KB clippings | 3 |
| Of those: mapped to a repo / actionable as code | 0 |

Rejected, with reasons:

- `p9805` "Harrison Chase (@hwchase17)" — screenshot/tweet save, plaintext body is object-replacement characters only (~2 bytes of text). Skipped at Screen 2.
- `p9788` "Harrison Chase (@hwchase17) 1K likes · 99 replies" — same shape, empty body. Skipped at Screen 2.
- `p9795` "FlatRatePA LLC | Founders & Licensing Action Plan" — a real, substantial note (a legal/licensing action plan for a Texas public-adjusting LLC Jay is forming). Ingested as a clipping. Not a work order: it is a business/legal plan with no code or repo mapping — cheap filter 2 ("maps cleanly to a repo?") fails outright. This is personal/business KB material, not engineering backlog.
- `p9793` "x.com following + youtube channels link dump" — a list of YouTube channel URLs. Ingested as a clipping. Not actionable: a link dump with no instruction attached. Fails cheap filter 1.
- `p9787` "Grok Bot can now build you dashboards that update themselves every morning" — a saved tweet quoting someone else's prompt examples for a different product (Grok's bot-building feature), not Jay's own instruction to build something. Ingested as a clipping. Fails cheap filter 1 (this is "Jay saved someone else's idea," not "Jay wrote down that he wants X" — same distinction the calibration note draws).

KB candidates (`wiki/candidates.md`, `wiki/action-tracker.md`): unchanged pattern — every entry in `candidates.md` sampled is still single-source, and `action-tracker.md`'s Open and Blocked sections are both still empty. 0 KB-sourced work orders, consistent with every prior run.

## 4. Proposals

One item reached the full ImprovementProposal → sizing → implementation → merge-gate pipeline and was then discarded before merging. Recording it in detail because the near-miss itself is the most useful thing this run produced.

**Item:** Agentic-Pi-Harness `docs/NIGHTLY-BACKLOG.md`, "Persist `LoopResult.sanitizations` to its own artifact" (open since 2026-08-21, second pass).

- **Problem / current state:** `LoopResult.sanitizations` lives in memory only. Every sibling record type (`effects.jsonl`, `policy.jsonl`) has a durable sink; this one does not, so `verify`/`replay` cannot check sanitization history after the process exits.
- **What I did:** Added an optional `LoopInputs.sanitizationLogPath`, wrote it from `flushPendingToolUses` at the exact point that already collates the in-memory array onto plan order (not tool-completion order — this matters, since a readonly concurrent group can finish tool calls out of plan order), and wired it into the golden-path CLI at `sessions/<id>/sanitizations.jsonl`. Added two new test cases (plan-order persistence under out-of-order completion; no file written when the path is omitted). Full gate: `tsc --noEmit` clean, `eslint` clean, 469/469 tests green (were 467), build clean, the actual `golden-proof` CI steps run locally (`run.ts`, `compare-tape-events.ts`, `compare-effects.mjs`, `compare-decisions.mjs` exact + semantic) all green with the canonical digests unchanged, and the new test confirmed failing against the pre-change source (via `git stash`) before confirming it passes after.
- **Why it did not merge:** This exact item carries two prior rejection notes (2026-08-29, 2026-08-31) nested as sub-bullets under the Open entry — which a first-line-only scan of the backlog does not surface. `docs/SCHEMAS.md` §5 states, as of `29b6037` (2026-08-31, unchanged since): the Tier A schema surface for sanitization/tool-audit sidecars is "kept versioned even though the Tier A golden path does not yet emit separate sidecar files for them." Wiring `run.ts` to emit `sanitizations.jsonl` reverses that documented statement regardless of how clean the diff is, and reopens a decision ("which sidecars are Tier A contract surface?") that two other Open entries are explicitly blocked on. I read the full entry — including its sub-bullets — only after the implementation was done and gated, caught the conflict, and discarded the branch (`ntf/2026-10-29-persist-sanitizations`, `16d4b87`) unmerged and unpushed.
- **Decision:** `ALREADY_BLOCKED` (not one of the standard six — this is a backlog item whose own history already settled it, and I re-derived the rejection independently instead of trusting the note on sight; recording it this way rather than silently matching the prior `BACKLOG`/`NOT_APPLICABLE` outcome).
- **Process fix applied:** Appended a third sub-bullet to the Open entry (docs-only commit, `5491871`, see §1) stating the near-miss plainly and naming the mechanism: a backlog scan that filters on top-level `- [ ] ` bullets for disqualifying language misses indented sub-bullets, which is exactly where this entry's disqualification lives. This run's own harvest and backlog-coverage checks used exactly that kind of top-level grep earlier — worth this job's future runs reading full entries before implementing, not just the first line.

No other item reached `IMPLEMENT`. Everything else surveyed in Agentic-Pi-Harness (17 other Open items), hermes-harness-missioncontrol (full Open section, dominated by a well-tracked multi-branch PR queue — #19/#20 were already resolved by a human before this run per the 2026-10-28 report), Twinz (12 items, security/dependency/decision-shaped), and MissionControl (9 items, all Large/design-proposal, PR-only repo anyway) is explicitly self-described in its own text as a design proposal, a decision for Jay, or blocked on an external action — none is "one file or module, no interface change, obvious test."

## 5. Backlog delta

| Repo | Added | Closed | Moved to not-applicable |
|---|---|---|---|
| Agentic-Pi-Harness | 1 (near-miss note, sub-bullet) | 0 | 0 |

No other repo's `docs/NIGHTLY-BACKLOG.md` was edited this run.

## 6. Hygiene

- Worktrees created this run: 2 (`/tmp/ntf/api-sanitizations`, `/tmp/ntf/api-backlog-note`), both on Agentic-Pi-Harness. Both removed (`git worktree remove --force` + `git worktree prune`); both branches deleted after use (one discarded unmerged, one merged-and-deleted). Agentic-Pi-Harness worktree count: 4 before, 4 after — confirmed via `git worktree list`.
- MissionControl worktrees: 66 (unchanged from 2026-10-28).
- SellerFi worktrees: 8 (unchanged).
- Agentic-KB worktrees: 3 (unchanged).
- Disk: ~14 GiB free on the data volume (consistent with 2026-10-28's ~15 GiB; still under the 30 GiB preflight threshold — single-repo work this run, no parallel wave needed).
