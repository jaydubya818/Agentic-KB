# Agentic-KB Audit Run — Blocked

- **Job name:** agentic-kb-audit-run
- **Job ID:** unavailable in environment
- **Timestamp:** 2026-06-29T00:05:38-0500
- **Failed stage:** pre-write dirty-worktree safety check
- **Status:** blocked before normal audit briefing

## Reason
The audit is report-only, but scheduled Night Shift rules require `git status --porcelain` before any scheduled/autonomous write. The worktree has dirty files outside this audit job's allowed write paths and outside the exact noisy-log allowlist (`logs/web-server-error.log`, `logs/web-server.log`). Per `AGENTS.md`, the job must stop and write an error briefing instead of continuing.

## Dirty worktree findings

```text
 M .night-shift/state/editor-state.json
 M logs/kb-dev-server.log
?? briefings/2026-06-26.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-28-0557.md
?? briefings/scout-2026-06-26.md
?? briefings/scout-2026-06-28.md
```

Notable point: `logs/kb-dev-server.log` is **not** one of the two allowed noisy logs. The allowed noisy logs are exactly `logs/web-server-error.log` and `logs/web-server.log`.

## Files read
- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/audit-run.md`
- `.night-shift/state/audit-state.json`
- `git status --porcelain` output

## Files written or attempted
- Written: `briefings/errors/agentic-kb-audit-run-2026-06-29-0005.md`
- Written: `.night-shift/state/audit-state.json`
- Not attempted: `briefings/audit-2026-06-29.md`

## Files needing review
- `.night-shift/state/editor-state.json`
- `logs/kb-dev-server.log`
- `briefings/2026-06-26.md`
- `briefings/errors/agentic-kb-refinery-run-2026-06-28-0557.md`
- `briefings/scout-2026-06-26.md`
- `briefings/scout-2026-06-28.md`

## Rollback guidance
No `raw/` or `wiki/` files were modified by this run. To roll back this blocked audit run only, remove this error briefing and restore the previous `.night-shift/state/audit-state.json` from git/history if needed. Do not clean or reset the dirty files above without deciding whether they are expected outputs from other Night Shift jobs.

## Safest next action
Review the dirty files, then either commit/stash intentional Night Shift outputs or explicitly extend the dirty-worktree allowlist/playbooks where appropriate. After the worktree is clean except for allowed audit outputs and exact noisy logs, rerun the audit.
