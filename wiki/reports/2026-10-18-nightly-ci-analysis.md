# Nightly CI Analysis — 2026-10-18 (UTC)

## Summary
Runs (24h): 32 — 19 passed, 1 failed, 12 skipped, 0 in progress
New failures: 1 · Recurring: 0 · Suspected flaky: 0
PRs opened: 0 · Report-only: 1
Health: ok

## Failures

### [twinz] Auto Version Bump — master
- Fingerprint: `8d50de40` — **NEW**
- Root cause: dependency issue — `npm ci` / vitest pre-bump test step failed before the "Bump Version" job could run; `node_modules/rollup/dist/native.js` can't find `@rollup/rollup-linux-x64-gnu`, a known npm optional-dependency resolution bug (npm/cli#4828), not an application bug.
- Location: `node_modules/rollup/dist/native.js` (step "Determine version bump type"); not an app source location — infra/dependency.
- Blocking a PR: no — this run is a direct push-triggered run on `master`, not a PR check. It does block the Auto Version Bump workflow itself from completing on `master`.
- Action: report-only — dependency issue is Tier B per the standing gate, never auto-fixed.
- Suggested fix (one step, for Jay): switch the install step from `npm ci` to `npm ci --include=optional` (or delete `package-lock.json` + `node_modules` and regenerate the lockfile on a Linux x64 runner) so the platform-specific rollup binary resolves. Alternatively pin `rollup` to a version that bundles the native binary differently.
- Run: https://github.com/jaydubya818/twinz/actions/runs/39051380574

## Dedupe / standing-issue update (not a new failure, but changes state)
- Fingerprint `e90110b2` (twinz, "Auto Version Bump" — `git push origin master` 403, "Write access to repository not granted") — its fix, **PR #7**, was **closed without merge** by Jay on 2026-10-17T16:54:52Z (~1 minute around today's run window). Per the dedupe rule, a closed-not-merged PR means the fix was rejected: `e90110b2` is now set to `status: wontfix` and will never be re-proposed as a PR again. This is unrelated to today's new `8d50de40` failure — different root cause (that one never reaches the push step; it fails earlier, during the pre-bump test run).

## Performance
No regressions. Only one workflow (`sellerfi/Vercel Environment Check`) had enough 14-day history to compare against today's run: 17s today vs 17.5s 14-day median. All other workflows that ran tonight (`sellerfi/Production Validation`, `sellerfi/Production CI/CD Pipeline`, `sellerfi/Test Suite`, `twinz/Production CI/CD Pipeline`, `twinz/Tier Validation Tests`, `twinz/Test Suite`) are logging their first duration samples this run — no baseline yet to compare against.

## Changes this run
- No code-repo PRs opened (nothing met the Tier A auto-fix gate tonight).
- Agentic-KB — this commit: `docs(reports): nightly CI analysis 2026-10-18` (briefing + failures.json + durations.json + last-run.json).

## Notes
- `missioncontrol` had zero Actions runs in the 24h window — dormant, consistent with the last several nights (last activity recorded was 2026-10-13).
- Preflight passed cleanly: token valid, all 4 repos (`sellerfi`, `missioncontrol`, `twinz`, `Agentic-KB`) readable, no session-level GitHub access gate (Track C) encountered — the 2026-09-28 class of failure has not recurred.
- `sellerfi` had 12 "skipped" `Post-Deploy Production Smoke` runs in the window; these are counted separately from pass/fail (not failures) and not triaged as such.
- No flaky-test signal detected (no fingerprint seen on ≥3 branches or alternating pass/fail on the same SHA tonight).
