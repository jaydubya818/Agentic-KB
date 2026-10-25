# Nightly CI Analysis — 2026-10-25 (UTC)

## Summary
Runs (24h): 1 — 1 passed, 0 failed, 0 cancelled, 0 in progress
New failures: 0 · Recurring: 0 · Suspected flaky: 0
PRs opened: 0 · Report-only: 0
Health: ok

All clear — no CI failures in the last 24 hours across all repos.

sellerfi had 1 run (Vercel Environment Check, success, 17s). missioncontrol
and twinz had no runs in the window (both dormant).

## Performance
No regressions. sellerfi's Vercel Environment Check ran in 17s, in line with
its 14-day median (~17.5s, well under the 1.5x threshold).

## Changes this run
- Agentic-KB — docs(reports): nightly CI analysis 2026-10-25 (this report,
  durations.json, last-run.json)

## Open items carried forward (no change this run)
- missioncontrol `2d5a5d9e` — open, Convex authorization ratchet failure,
  first/last seen 2026-10-12, no new occurrence (repo dormant in window).
- missioncontrol `f45172d5` — open, factoryAttemptWorker test assertion
  failure, first/last seen 2026-10-12, no new occurrence.
- missioncontrol `7a81dce6` — open, build error (RUNTIME_CONTRACT_VERSION
  not bumped). Suggested one-line fix: bump v33 -> v34 in
  `convex/lib/runtimeContract.ts` on the affected branches. Report-only
  (Tier B — source change).
- SellerFi `9172abb4` — open, repo ruleset (GH013) blocks the version-bump
  bot's push to main. Report-only — fix is a ruleset exemption for the bot
  actor, not a workflow-file edit.
- SellerFi `6ad700bc` — open, flaky E2E tests (6 flaky across
  auth-session-continuity, seller-listing-workflows, deal-close-full-flow,
  analytics-verified-traffic, entitlements, tier-validation). Flaky →
  report-only per policy, never auto-fixed.
- twinz `8d50de40` — open, `@rollup/rollup-linux-x64-gnu` optional-dependency
  resolution bug (npm/cli#4828) blocking Auto Version Bump on push to
  master. Tier B (dependency issue) — report-only. Suggested fix: run
  `npm ci --include=optional`, or delete `package-lock.json` +
  `node_modules` and regenerate the lockfile on the CI platform, or pin
  rollup to a version without native optional binaries.
- twinz `e90110b2` — **wontfix**. PR #7 (the `permissions:` block fix for
  Auto Version Bump) was closed without merging by Jay on 2026-10-17.
  Per dedupe policy this is a rejected fix and will never be re-proposed.

## Notes
Preflight passed cleanly: token valid, all four repos (sellerfi,
missioncontrol, twinz, Agentic-KB) readable with no session-level access
gate. No judgment calls needed this run — genuinely quiet night across all
three repos.
