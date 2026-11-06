# Notes → Factory — 2026-11-06

## 1. Ledger

**Merges:** none.
**PRs opened:** none.
Both empty this run — no code changes anywhere.

## 2. ACTION REQUIRED

- **2 Apple Notes contain plaintext 2FA secrets for a Fairhome admin account** (`p9943`: recovery codes + a hash; `p9941`: TOTP setup key, SHA1/6-digit/30s). Per the credential screen, these were not ingested, not echoed here or in the ledger, and not grepped against the repos (personal-account 2FA material, not a repo-credential shape). Recommend moving them out of Apple Notes into a password manager and rotating the TOTP seed/recovery codes once moved, since they've sat in plaintext notes.
- **Twinz:** leaked `VERCEL_TOKEN` (open since 2026-09-01) still unrotated — not re-verified this run, carried forward again.
- **SellerFi:** Stripe webhook secret and Resend API key rotation still outstanding — not re-verified this run, carried forward.
- **obsidian-vault:** `.obsidian-api-key` still tracked and unrotated — not re-checked this run (no local checkout), carried forward.
- **MissionControl:** 5 open PRs (#241, #242, #243, #246, #248), unchanged from last run, none opened by this job, still awaiting human review/merge per MissionControl's own governance.
- **SellerFi:** 4 open PRs (#221–224), unchanged from last run.
- **Net for today:** 0 Apple Notes work orders, 0 KB-candidate work orders, 0 backlog items drained, 0 merges, 0 PRs opened. Disk fine (77Gi free, 15% used). Kill switch clear.

## 3. Harvest

Apple Notes bridge was reachable today (one 60s timeout on the first `list_notes` call, succeeded on retry), after two consecutive unreachable days (11-04, 11-05). Because `lastRunAt` had advanced across those two failed days without an actual harvest, I treated everything not in the carried-forward `notesSeen` (and modified since roughly 2026-11-02, the last confirmed successful harvest) as the real candidate set — about 31 notes — rather than trusting the stale `lastRunAt` timestamp literally.

Disposition:

| Class | Count | Notes |
|---|---|---|
| Credential-bearing, skipped | 2 | Fairhome 2FA recovery codes / TOTP seed (see ACTION REQUIRED) |
| Under 120-byte floor / pure link or screenshot dumps | ~15 | lnkd.in link notes, "New Note" placeholders, a health-news clipping, a job-title-only note |
| Personal resume / job-search drafts, to-do lists | ~8 | Multiple "JARRETT WEST" / "MASTER RESUME" drafts, a 3-resume to-do — not code-actionable |
| Substantive, ingested to KB, NOT_APPLICABLE to this pipeline | 5 (6th deduped) | See below |

The 5 ingested notes:

- **4 near-duplicate "CODEX IMPLEMENTATION PROMPT" drafts** (`p10029`, `p10032`, `p10035`, `p10037`) — agent prompts Jay is iterating for **Codex** to execute against the `fdlc.ai` site/repo (Factory Development Lifecycle framework + Guide, referencing Itamar Friedman's "Software Factory Engineer" article). `fdlc.ai` is not in this job's repository routing table, so these are KB candidates only, not notes-to-factory work orders, even though they are clearly actionable — just actionable by a different tool against a different repo.
- **1 MyEve Software Factory architecture note** (`p9942`) — a short note on test-execution and correction-loop ownership (Sofie → Deep Agent → Coding Agent → MyFactory → Independent Verifier → Sofie → MyApps). MyEve/MyFactory/Sofie are not in the routing table either.
- A 6th note (FlatRatePA LLC founders & licensing plan, `p9795`) deduped — already ingested in a prior run.

This matches the job's own calibration: the input stream is overwhelmingly agent prompts for other tools, personal job-search material, and link/screenshot dumps. **Zero work orders is the correct result of a careful harvest, not a shortfall.**

## 4. Proposals

None reached the ImprovementProposal gate — both substantive items failed the cheap filter ("maps cleanly to one of the routed repos?") before proposal-writing, so no Decision/Hypothesis/Acceptance-evidence was needed.

## 5. Backlog delta — and why nothing drained

Since harvest produced 0 work orders, Phase 2e calls for draining the existing backlogs. I surveyed the Open sections of:

- **Agentic-KB** — 18 Open items
- **Agentic-Pi-Harness** — 23 Open items
- **hermes-harness-missioncontrol** — 19 Open items
- **Twinz** — 11 Open items

I read every item not obviously excluded by scope (`.github/workflows/`, auth/security boundaries, dependency bumps, or already claimed by an open `nightly/*` branch) in full. Every single one of them is **self-flagged, in its own entry, as requiring a decision from Jay rather than a patch**. A representative sample:

- Agentic-Pi-Harness, `"Mutating tool" is spelled as the literal string write_file in three unrelated places` — the author identifies the exact fix (a `mutates: true` property three call sites would read instead of string comparisons) and then writes "which is why it is recorded rather than patched" — because two of those call sites are security/authority code (`workerControls.ts`, `sofie/authority.ts`).
- Twinz, `FSRS interval formula uses the wrong constants` — a one-line formula fix with a pinned characterization test, explicitly held back because "roughly doubling every user's review interval is a product decision."
- hermes-harness-missioncontrol, the pending-approval `actor`-filter bug (the exact item named in this job's own calibration note as a past example of a quick win) — already closed back on 2026-08-25→09-02 per the Closed log; the *current* Open entries in this repo are now one layer further out, each blocked on a response-shape or auth-model decision.
- Agentic-KB — every sampled item (cost-meter silent write failures, confidence type-coercion bug, task-lifecycle state machine) ends the same way: "wants a fail-closed decision from Jay," "is a design proposal... per the whack-a-mole rule," or similar.

**Result: zero items found that are both unambiguously Small and not decision-gated. 0 drained this run.** This is a stronger version of the 2026-08-25 finding ("Agentic-KB's Open items are all Large") — it now holds across all four repos I screened in depth. Per this job's own rule, I did not lower the bar or manufacture a work order to avoid a zero-output run.

I did not re-screen MissionControl, SellerFi, ai-software-factory-mastery, morning-review, or obsidian-vault backlogs in depth this run (time budget); I re-verified only their PR counts (reported above), both unchanged from yesterday.

## 6. Hygiene

No worktrees were opened and none needed cleanup — no work order qualified for implementation this run, so no `git worktree add` ever ran. Nothing to confirm against a baseline.

---

*Durable copy of this report committed to `Agentic-KB/state/notes-to-factory/reports/notes-to-factory-2026-11-06.md` per Phase 6.*
