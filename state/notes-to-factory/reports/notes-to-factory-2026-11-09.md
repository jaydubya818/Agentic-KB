# notes-to-factory — 2026-11-09

Run started 2026-11-09, lastRunAt carried from 2026-11-08T16:23:58Z. Kill switch: absent. Disk: ~75GiB free, no constraint.

## 1. Ledger

**Merges: none. PRs opened by this job: none.** Zero code changes landed or proposed this run — see Harvest and Proposals below for why.

## 2. ACTION REQUIRED

- **Apple Notes bridge unreachable again — 5 of the last 6 days down.** Two sequential 60s timeouts on `list_notes` this run (retried once, since it's a read-only call and a retry is harmless; both timed out). Pattern across the last 6 runs: 11-04 unreachable, 11-05 unreachable, 11-06 reachable, 11-07 unreachable, 11-08 unreachable, 11-09 (today) unreachable. The harvest side of this job has now been down more often than up for over a week. `notesSeen` carried forward unchanged — no listing was returned, so nothing to dedupe against.
- **SellerFi: Stripe webhook secret and Resend API key rotation still outstanding.** First flagged 2026-08-28 (over 10 weeks ago) — redaction at HEAD was never remediation; both values remain valid in git history. Not re-verified this run (no code change touched those files), but carrying a live credential exposure open this long is worth a direct nudge rather than another silent backlog carry-forward. Rotation steps are in `docs/NIGHTLY-BACKLOG.md`'s 2026-08-28 entry (Stripe Dashboard → roll signing secret for endpoint `we_1SvgLRAjJetHeSbDZCbQJVV5`; Resend → revoke/reissue at resend.com/api-keys).
- **Twinz: VERCEL_TOKEN rotation still outstanding.** First flagged 2026-09-01 (over 9 weeks ago) — a live Vercel token sat in `.mcp.json` from 2026-01-21 until redaction on 2026-09-01; redaction does not revoke it. Rotate at vercel.com/account/tokens. Until rotated, assume full Vercel account control is available to anyone with repo read access (env vars including `DATABASE_URL`, `AUTH_SECRET`, `OPENAI_API_KEY`, plus deploy/delete rights).
- **obsidian-vault: tracked `.obsidian-api-key` still present and unrotated.** Carried forward, not re-verified this run.
- **Open PRs, unchanged from 2026-11-08, none opened by this job:**
  - MissionControl: #241, #242, #243, #246, #248 (docs/accessibility fixes). 70 worktrees, steady.
  - SellerFi: #221–#224 (CI/hygiene). 8 worktrees, steady.
  - Twinz: #30–#33 (dependency/CI bumps).

## 3. Harvest

| Class | Count |
|---|---|
| Apple Notes listed | 0 (bridge unreachable, two timeouts, not retried a third time) |
| Notes ingested | 0 |

No notes were available to triage — the bridge never returned a listing. This is a repeat of the 2026-08-22→08-25 calibration finding by a different mechanism (infrastructure unreachable rather than input-stream mismatch), and manufacturing a work order to compensate would be the exact anti-pattern this job's calibration note warns against. Per Phase 2e, the run proceeded to drain the existing backlogs instead.

**Backlog re-screen (Phase 2e), all 8 routing-table repos, verified against `origin/<default-branch>` today rather than trusted from the prior run's conclusion:**

- Agentic-KB: 13 Open items, all Large / design-proposal / policy-decision-for-Jay (e.g. `requireAuth()` chokepoint, `atomicWrite` fsync consolidation, PIN work-factor, frontmatter-codec unification). One notable finding during re-derivation, not this run's own work: the `web/ has no test suite` item's route-handler series (part (a)) is **fully closed as of 2026-11-04** — all 36 enumerated route handlers now either carry characterization tests (32) or are confirmed, re-confirmed, structurally unsuited to this series (4: `compile`, `lint`, `process`, `query` — direct, non-mockable Anthropic SDK callers). Part (b) of that item (wiring the web tests into CI) remains open, blocked on `workflow` scope.
- Agentic-Pi-Harness: 14 Open items read in full. Every one is deliberately unpatched pending a design decision (contract/schema questions, inert-control reconciliation, ESLint major-version migration) or already delivered and awaiting human merge/CI (the `npm ci || npm install` fallback fix, PR #13).
- hermes-harness-missioncontrol: 11 Open items read in full, same shape — auth redesign, response-shape decisions, retention policy, or already-merged-and-superseded branch bookkeeping. No candidate cleared the "unambiguously Small, no interface change, obvious deterministic test, no governance/design question in the second half" bar.
- Twinz: 15 Open items, almost entirely dependency-advisory and credential items blocked on a human decision or a `workflow`-scope push this job doesn't have (see ACTION REQUIRED above for the two live credential items).
- ai-software-factory-mastery: 1 Open item (dead links from unpublished `evidence/` docs) — explicitly a content decision for the maintainer (publish vs. rewrite vs. render-as-text), not a nightly patch.
- MissionControl: 14 Open items (PR-only repo). All Large (Factory Learning V1, Book Factory vertical, secret-detection consolidation across 5 call sites) or already superseded by an open PR (#131 for the dual-control bypass).
- SellerFi (PR-only repo): Open items are either ACTION REQUIRED-for-Jay (merge the superseding branch, rotate two credentials, resolve a unit-ambiguity bug that needs a production DB query first) or explicit design proposals (redaction bypass, ESLint migration).
- Twinz's dependency-override item and ai-software-factory-mastery's link item were the two closest candidates to "Small"; both were rejected — the first is blocked on a workspace-structure decision (a nested `package-lock.json` the maintainer needs to explain or delete), the second is explicitly a content/publishing decision.

**Result: 0 work orders from harvest, 0 items drained from the backlog.** This is a deliberate conclusion from re-reading every Open item in all 8 repos today, not a copy-forward of the prior run's count.

## 4. Proposals

None reached `IMPLEMENT`. No item from Apple Notes (none available) or from the backlog drain (none cleared the Phase 2e bar) survived the cheap filters and the improvement gate this run.

## 5. Backlog delta

No `docs/NIGHTLY-BACKLOG.md` file in any of the 8 repos was modified this run — every item reviewed was already recorded with its own reasoning from a prior night; there was nothing new to record a disposition for.

## 6. Hygiene

Worktrees created: 0. Worktrees removed: 0 (none created). MissionControl steady at 70, SellerFi steady at 8. No `ntf/*` branches left on any of the 8 repos — confirmed via `git worktree list` on each.
