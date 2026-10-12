# Nightly CI Analysis — 2026-10-12 (UTC)

## Summary
Runs (24h): 10 — 8 passed, 2 failed, 0 cancelled, 0 in progress
New failures: 2 · Recurring: 0 · Suspected flaky: 0
PRs opened: 0 · Report-only: 2
Health: ok

## Failures

### [missioncontrol] CI — Mission Control — codex/unified-beta-missioncontrol-20261011
- Fingerprint: `f45172d5` — **NEW**
- Root cause: test failure — vitest `AssertionError: expected +0 to be 1` in
  `src/__tests__/factoryAttemptWorker.test.ts` ("FactoryAttemptWorker
  verification-first lifecycle > retains the normalized result when Fab
  exhausts its turn budget").
- Location: src/__tests__/factoryAttemptWorker.test.ts (line not identifiable from logs)
- Blocking a PR: no (branch has no open PR)
- Run: https://github.com/jaydubya818/MissionControl/actions/runs/38241287690
- Action: report-only — application test assertion, never auto-fixed (Tier B)
- Suggested fix: the normalized result appears to reset to `0` instead of
  retaining the last value of `1` when the worker's turn budget is
  exhausted — check the turn-budget-exhaustion branch in
  FactoryAttemptWorker for a reset happening before (instead of after)
  persisting the last-known-good normalized value.

### [missioncontrol] CI — Mission Control — codex/unified-beta-missioncontrol-20261011
- Fingerprint: `2d5a5d9e` — **NEW**
- Root cause: permissions/config (CI script logic, not workflow YAML) —
  `pnpm run security:authorization` → `scripts/check-convex-authorization.mjs`
  aborts with "Base commit 0000000000000000000000000000000000000000 is
  unavailable. CI must check out full history so baseline growth can be
  evaluated." The zero SHA is the git "no previous commit" sentinel for a
  new/force-pushed branch — there genuinely is no baseline commit, so a
  workflow `fetch-depth` change would not fix this.
- Location: scripts/check-convex-authorization.mjs (exact line not identifiable from logs)
- Blocking a PR: no
- Run: https://github.com/jaydubya818/MissionControl/actions/runs/38170105106
- Action: report-only — fix requires changing application/CI script logic,
  which is outside `.github/workflows/**`, so this is Tier B regardless of
  category
- Suggested fix: in `check-convex-authorization.mjs`, special-case
  `AUTHORIZATION_BASE_SHA === '0'.repeat(40)` (new branch / no prior commit)
  by skipping the ratchet comparison instead of erroring.

## Performance

Duration history (`durations.json`) last had real entries from
2026-08-21–08-29 — 46 days before today, outside the 14-day window — so it
was trimmed to empty before today's entries were added. No valid baseline
existed to compare today's run times against; today's durations become the
new baseline.

## Changes this run
- Agentic-KB — docs(reports): nightly CI analysis 2026-10-12 (state +
  briefing; see commit in this push)

## Notes
- **Session access gate (Track C) appears resolved.** Every
  nightly-ci-analysis run from 2026-09-28 through at least 2026-10-09
  aborted at preflight (§1d) because `api.github.com` returned 403 "not
  enabled for this session" for all 4 tracked repos. Today's preflight read
  all 4 repos successfully (HTTP 200) and this run completed end-to-end,
  including the KB push — the first clean run since 2026-09-11 (the
  `last-run.json` heartbeat was 31 days stale). If Track C recurs on a
  future run, flag it again; for now this is being treated as fixed.
- Credential source: the Mac's `gh` keyring login for jaydubya818
  (`GH_PAT_NIGHTLY_CI` was not set) — the designated fallback, no new token
  created or stored.
- Neither new failure qualified for an auto-fix PR: one is an application
  test assertion (Tier B by category), the other needs an application-script
  change rather than a workflow-only change (Tier B by the path allowlist,
  regardless of category).
- twinz: 0 runs in the 24h window (no activity); checked successfully, no error.
- 7 pre-existing fingerprints in `failures.json` (all from August) were left
  untouched — none recurred today. One, `e90110b2` (twinz, "Auto Version
  Bump", status `pr_open`), predates the multi-week outage and may be worth
  a manual check since this pipeline couldn't verify PR state while Track C
  was up.
