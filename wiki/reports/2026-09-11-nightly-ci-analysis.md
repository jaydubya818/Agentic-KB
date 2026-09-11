# Nightly CI Analysis — 2026-09-11 (UTC)

**Method note:** the Linux sandbox (`mcp__workspace__bash`) failed to provision 3/3 times today with `useradd: cannot create directory /sessions/relaxed-funny-hopper` (exit 12) — the same failure logged on 2026-08-20, 08-26, 09-02, 09-03, 09-04, 09-08, 09-09, and 09-10. No `curl`/`git`/`python3` were reachable. This run was completed instead via Claude-in-Chrome against github.com's Actions UI directly (per-repo, filtered `created:>=2026-09-09`, ~48h window rather than the usual 24h). No log-grep fingerprinting, no duration tracking, no auto-fix PRs — those all need a real git clone + push + actionlint, which need bash.

## Summary
Runs (48h window): 20 — 15 passed, 5 failed, 0 cancelled, 0 in progress
New failures: not fingerprinted this run (degraded triage) · Recurring: at least 1 confirmed (Auto Version Bump push-to-main block) · Suspected flaky: 2 (missioncontrol, both self-resolved on rerun)
PRs opened: 0 · Report-only: 5
Health: partial

## Failures

### [sellerfi] Auto Version Bump #291 — main
- Root cause: permissions/config — direct push to `main` rejected: `remote: - Changes must be made through a pull request.` / `GH013: Repository rule violations`. The workflow pushes version-bump commits straight to main; a branch ruleset now blocks that for every actor, Actions included.
- Location: `.github/workflows/version-bump.yml` (the `git push` step)
- Blocking a PR: no
- Action: report-only — the mechanical fix isn't a small workflow diff: either exempt the workflow's actor in the branch ruleset (repo Settings, outside `.github/workflows/**`) or rewrite the job to open a PR instead of pushing directly (a real logic change, not a typo/permissions-block fix)
- Suggested fix: add a bypass actor for `github-actions[bot]` (or the PAT identity) on the ruleset at Settings → Rules, or restructure version-bump.yml to branch + PR + auto-merge

### [sellerfi] Production CI/CD Pipeline #831 — main
- Root cause: mixed, 3 job failures in one run: (1) Security & Vulnerability Scanning — CodeQL fails with "Code scanning is not enabled for this repository" (repo Settings, not a workflow fix); (2) Production Deployment — `/usr/local/bin/npx` exited 1 (annotations alone don't say why); (3) E2E Full Chromium — exited 1 after 2h20m runtime, abnormally long for that job
- Location: not identifiable from annotations alone — needs a full job-log pull
- Blocking a PR: no (push to main)
- Action: report-only. Flagging the 2h20m E2E duration as worth a look on its own — that's either a hang or a real perf regression, independent of the exit-1 failure

### [sellerfi] Post-Deploy Production Smoke #177 — main (deployment_status)
- Root cause: test failure — smoke test against live prod exited 1, no further detail surfaced in annotations
- Location: not identifiable from logs
- Blocking a PR: no
- Action: report-only

### [missioncontrol] CI — Mission Control #729 — codex/security-advisories-20260909
- Root cause: unknown — failed, but the PR's next run (#730) and the follow-up push run (#731) both passed
- Action: report-only, no action needed — self-resolved, likely flaky

### [missioncontrol] CI — Mission Control #728 — codex/todo063-aws-support-case-20260907
- Root cause: unknown — same pattern; the merge run (#733) passed
- Action: report-only, no action needed — self-resolved, likely flaky

### [twinz]
No workflow runs in the 48h window.

## Performance
Not measured this run — duration-regression tracking needs `durations.json` + the log-grep pipeline, unavailable without bash.

## Changes this run
- Agentic-KB — `state/nightly-ci/last-run.json` updated (commit 116a29d) — first real update since 2026-08-29
- Agentic-KB — this report (`wiki/reports/2026-09-11-nightly-ci-analysis.md`)

## Notes
- **13-day reporting gap found and flagged, not silently backfilled.** `state/nightly-ci/last-run.json` and `wiki/reports/*-nightly-ci-analysis.md` were last genuinely updated 2026-08-29, despite daily "aborted" escalations being filed since. Those escalations land in `wiki/repos/Agentic-KB/bus/escalation/` and get autocommitted by the separate `notes-to-factory` pipeline — they never touch this heartbeat file or `wiki/reports/`, so the gap was invisible until checked directly tonight. 2026-08-30 through 2026-09-10 (12 days) remain unreported; a browser-based backfill of that size would be slow and unreliable, so it wasn't attempted here — flagging for a decision instead.
- Sandbox provisioning failure (`useradd` exit 12) is now a 9-time-documented recurrence since 2026-08-20 with no fix. That's a platform-level problem, not something fixable from inside this task.
- `gho_` user-OAuth token in the task's plaintext config, flagged for rotation 2026-08-20, is still unrotated (used again tonight, out of necessity, to make this exact commit).
