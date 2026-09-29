# notes-to-factory — 2026-09-29

Fired 15:48 UTC (scheduled 15:20 UTC). Kill switch: not set. Disk: 184GB free / 7% used — no pressure.

## 1. Ledger

Merges: none.
PRs opened this run: none.
Carried open PRs, reverified via `gh` this run (all unchanged):
- Agentic-KB #29 — OPEN — fix(agent-runtime): assertReadAllowed rejects unsafe paths like its write twin
- hermes-harness-missioncontrol #19 — OPEN — fix(orchestrator-api): normalize legacy persisted runs once at hydration
- hermes-harness-missioncontrol #20 — OPEN — fix(harness-console): guard VITE_OPERATOR_TOKEN against .env files

## 2. ACTION REQUIRED

All carried, unchanged since 2026-09-28 unless noted:
- SellerFi: Stripe webhook secret and Resend API key committed to docs history — redacted at HEAD only, rotation still open.
- Twinz: leaked Vercel API token in git history, still unrevoked.
- Twinz: `.mcp.json` tracked despite intended `.gitignore` rule — leak recurrence path open.
- Twinz: root `package.json` `overrides` silently ignored by npm workspace install — advisory bumps parked, unmerged on `nightly/2026-09-01-improvements`.
- SellerFi: `nightly/2026-08-31-improvements` supersedes 5 stale nightly branches and fixes the Next.js 16.1.6 libheif RCE (GHSA-2xp9-vwfh-vxw4) — unmerged, human click needed.
- Agentic-KB PR #29, hermes-harness-missioncontrol PR #19/#20 — confirmed still OPEN via `gh` this run (28–34 days open now), worth Jay's direct review rather than another nightly re-verification.
- p8887 (credential-shaped title) not re-fetched this run per Screen 1 policy, unchanged since 2026-09-26 clean verification.

## 3. Harvest

3 new Apple Notes since 2026-09-28 (p8951, p8945, p8944). All 3 failed Screen 2 (under 120 bytes of extracted plaintext): p8951 is an empty "New Note" (object-replacement char only), p8945 is a link-preview clipping ("Team Bots: AI coworkers that learn from your team" + 2 image placeholders, no body text), p8944 is a bare `lnkd.in` URL. 0 ingested, 0 credential-flagged (Screen 1 found nothing new).

`wiki/candidates.md`: every entry is a conceptual KB topic (e.g. `tdd-execution`, `worktree-isolation`, `tool-output-compression`) — none map to a specific repo/file change, so none are actionable code items.

`wiki/action-tracker.md`: Open section empty — no open commitments extracted from calls/sessions.

## 4. Proposals

None reached ImprovementProposal stage. Harvest yielded 0 survivors past the cheap filters (Phase 2a).

## 5. Backlog delta

Phase 2e drain sweep run across all 6 repos with `docs/NIGHTLY-BACKLOG.md` confirmed present on `origin` (Agentic-KB, Agentic-Pi-Harness, hermes-harness-missioncontrol, Twinz, MissionControl, SellerFi — re-verified via `git cat-file -e origin/<default>:docs/NIGHTLY-BACKLOG.md`, not trusted from memory).

Agentic-KB, Agentic-Pi-Harness, hermes-harness-missioncontrol: every Open entry read in full (not sampled). All are explicitly self-declared Large, a design proposal, blocked on a human/policy decision, or already carried as ACTION REQUIRED. Zero unambiguously-Small items.

Twinz, MissionControl, SellerFi: surveyed by entry headline (same pattern — security/credential rotation, ACTION REQUIRED, or design proposal). Nothing read as a quick Small item worth a full-text check.

0 drained. This independently reconfirms 2026-09-28's exhaustive-sweep finding rather than copying it forward.

Added / closed / moved-to-not-applicable, per repo: none.

## 6. Hygiene

No worktrees created this run (no work orders, no drain). Worktree count not re-measured tonight (nothing touched `/tmp/ntf/`); MissionControl's ~94 accumulated local worktrees (flagged in prior reports) not re-audited this run.
