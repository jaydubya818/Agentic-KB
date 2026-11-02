# Notes → Factory — 2026-11-02

Run fired 2026-11-02T16:56:15Z (scheduled for 16:20Z). Last run: 2026-11-01T16:44:00Z.

## 1. Ledger

**Merges (2):**

| Repo | SHA | What | Gate | Revert |
|---|---|---|---|---|
| obsidian-vault | `0b8cc38e230994b04876a28b5dd6f1c7ecd518f1` | Created missing `docs/NIGHTLY-BACKLOG.md` from the standard template (confirmed ABSENT via `gh api` 404 first) | Vacuous-green: additive new file, parse-checked, nothing to break | `git clone https://github.com/jaydubya818/obsidian-vault && cd obsidian-vault && git revert -m 1 0b8cc38e230994b04876a28b5dd6f1c7ecd518f1 && git push origin main` |
| agentic_hr | `c58623c5f7131ed2eecb1f286e42f47ff0b02670` | Closed two stale "needs a human to merge" Open reminders (PR #2, PR #3) — `gh pr list --state all` confirmed both merged 2026-10-17, 16 days before this run noticed | Docs-only: parse check, no new file/symbol claims (underlying fixes already in Closed) | `git clone https://github.com/jaydubya818/agentic_hr && cd agentic_hr && git revert -m 1 c58623c5f7131ed2eecb1f286e42f47ff0b02670 && git push origin main` |

**PRs opened:** none this run.

Neither merge touched application code — both are backlog-file bookkeeping. No work order from Apple Notes or the KB reached IMPLEMENT this run (0), and no repo's backlog surfaced a drainable Small/Medium code item either (0) — see §4 for why, repo by repo.

## 2. ACTION REQUIRED

- **SellerFi** — three items re-read in full this run, all still open: merge `nightly/2026-08-31-improvements` (6th-plus consecutive unmerged night per the file's own count); rotate the committed Stripe webhook secret (`we_1SvgLRAjJetHeSbDZCbQJVV5`) and Resend API key; resolve `Offer.purchasePrice`'s dollars-vs-cents ambiguity via a production DB query (`select id, "purchasePrice" from "Offer" order by "createdAt" desc limit 20`). All three need a human — this job has no merge authority, no credential access, and payments/money-movement is an explicit exclusion.
- **SellerFi** open PRs re-confirmed via `gh pr list`: still #221-224, unchanged from every prior run.
- **MissionControl** open PRs re-confirmed via `gh pr list`: #241 and #242 (already known) plus a **new #243**, opened 2026-11-02 by another job ("fix 5 broken relative links left over from docs reorg"). Three docs-only daily-fix PRs now stacked up awaiting a human merge — none of the three has moved since opening.
- **Twinz** — leaked `VERCEL_TOKEN` (open since 2026-09-01), redacted at HEAD only, rotation on the Vercel dashboard still unconfirmed. Not re-checked this run.
- **Twinz** — backlog still stale (12 Open items dated 2026-09-01, referencing branches/PRs not re-audited since). Needs a dedicated re-audit run before anything there can be trusted as a drain candidate; skipped again this run per that standing caution.
- **obsidian-vault** — `.obsidian-api-key` still tracked and unrotated. Not re-checked this run, carried forward from 2026-10-28.
- **agentic_hr** — worth flagging even though it's now fixed: PRs #1-#3 sat merged for 16 days (since 2026-10-17) before anything noticed the backlog file still called them pending. A "needs a human to merge" reminder has no mechanism that forces a revisit once the PR actually lands — this is the second time in this job's history a backlog file has drifted from reality in that specific direction (stale "still open" claims), and it's worth a `gh pr list --state all` sanity pass across the fleet periodically rather than only when this job happens to look at a given repo's Open section.

## 3. Harvest

| Class | Count |
|---|---|
| Notes seen | 1 (same note, `p9874`, already in `notesSeen` from last run) |
| Credential skips | 0 |
| Under 120-byte floor | 1 (`p9874` — unchanged) |
| Ingested as KB clippings | 0 |
| Became a work order | 0 |
| KB files with new commits since last run | 0 (`wiki/candidates.md`, `action-tracker.md`, `recently-added.md` — checked via `git log --since`) |

Nothing in Apple Notes or the KB moved since yesterday. The one note on file (`p9874`) is the same one last run already evaluated and correctly skipped.

## 4. Proposals

No ImprovementProposal reached `IMPLEMENT` this run — every candidate died at the sizing gate or earlier. Rejected, with reasons, by repo:

- **Agentic-Pi-Harness** — backlog unchanged since 2026-10-29 (last touched by this job). All 18 Open items re-confirmed: each is either an explicit design proposal ("decide X, don't patch"), a contract/schema change, or blocked on `workflow` scope. None newly Small.
- **hermes-harness-missioncontrol** — backlog unchanged since 2026-09-02 (over two months stale, confirmed via `git log` — nothing to re-screen that wasn't already screened). Same shape: every Open item is a named architectural decision (hook trust model, operator token redesign, read-model shape changes) or blocked on `workflow` scope for its own CI patch.
- **MissionControl** — all 5 Open items are explicitly Large by their own text (Factory Learning V1, a full Mission-Control E2E qualification run, the 5-phase Factory Memory subsystem, the Book Factory vertical, a full-repo audit). PR-only repo regardless.
- **SellerFi** — 17 Open items read in full, not skimmed. Every one lands in: ACTION REQUIRED (human action — see §2), a dependency major-version bump (excluded), auth/session/secrets/payments (excluded categories), or an explicit "pick one deliberately, don't add a 14th pattern" design proposal (the RAG redaction denylist). Zero survivors.
- **morning-review** — Open section empty.
- **ai-software-factory-mastery** — 1 Open item (eight dead chapter links on the published site); its own text says this is "a content decision for the maintainer," so it was reported rather than chosen, same as the run that originally wrote it.
- **agentic_hr** — 14 Open items (after this run's own 2 closures) read in full. The team-scenario-comparison, mapper-enum-casting, RLS, and milestone-day items are all explicit product or architecture decisions. Two looked briefly promising on a close read: the `toIso`/`mapGrowthPlan` sentinel-date disagreement ("Small, but they should agree") doesn't say *which* value should win, and picking one without a stated instruction is inventing a requirement the source doesn't support; the governance-filter normalize-then-match rewrite has clear direction but is a real algorithm replacement on a content-policy filter with measurable false-positive/negative risk — sized past "obvious test," not attempted.
- **AI-FDE-Agent** — 3 Open items (clone, confirmed via `gh api`). Operator de-authorization lag touches the auth/session exclusion list; a dead defensive check is explicitly flagged "remove only alongside a deliberate decision"; service-layer coverage is gated on a Docker daemon this environment doesn't have running.
- **Twinz** — not screened (see §2 — stale backlog, needs dedicated re-audit).

Where the honest answer was "this wants a human decision, not code": SellerFi's RAG redaction filter, agentic_hr's RLS/team-scenario/milestone items, ai-software-factory-mastery's dead links, and most of Agentic-Pi-Harness/hermes-harness-missioncontrol's Open lists all explicitly say so in their own text — this run took their word for it rather than re-litigating.

## 5. Backlog delta

| Repo | Added | Closed | Moved to not-applicable |
|---|---|---|---|
| obsidian-vault | — (file created; no entries yet) | — | — |
| agentic_hr | 2 (closing the two stale reminders) | 2 | 0 |
| All other repos | 0 | 0 | 0 |

## 6. Hygiene

- No worktrees opened in any locally-checked-out repo — no code work order qualified, so none was needed.
- Two plain clones used for the docs-only drains, both under `/tmp/ntf/`: `obsidian-vault-backlog` and `agentic_hr-backlog`. Both removed after their merge and push completed; `/tmp/ntf` confirmed empty afterward.
- Both remote feature branches (`ntf/2026-11-02-nightly-backlog-file`, `ntf/2026-11-02-close-stale-pr-reminders`) deleted after merge.
- Disk: `df -g /` showed 69 GiB available at preflight, well above the 30 GiB threshold — no parallelism constraint this run (moot; no repo subagents were spawned).
- Kill switch: absent at preflight (`CLEAR`).
