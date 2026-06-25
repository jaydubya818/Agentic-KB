# Agentic-KB Refinery Run — Blocked

- **Job name:** agentic-kb-refinery-run
- **Job ID:** unavailable in cron context
- **Timestamp:** 2026-06-18 03:30 -0700
- **Failed stage:** pre-run dirty-worktree safety check

## Blocked Reason

The Refinery Run stopped before processing sources because `git status --porcelain` showed dirty files outside the expected Refinery write paths and outside the two exact noisy-log exceptions allowed by the playbook.

Allowed noisy log exceptions:
- `logs/web-server-error.log`
- `logs/web-server.log`

Disallowed dirty files detected:
- `logs/audit.log`
- `logs/kb-dev-server.log`

Other dirty files were present but are inside expected Refinery write paths or briefing/state paths:
- `.night-shift/state/editor-state.json`
- `.night-shift/state/refinery-processed.json`
- `briefings/2026-06-16.md`
- `briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md`
- `briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md`
- `briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md`
- `briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md`
- `briefings/refinery-2026-06-16.md`
- `briefings/scout-2026-06-15.md`

## Files Read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/refinery-run.md`

## Files Written or Attempted

- Written: `briefings/errors/agentic-kb-refinery-run-2026-06-18-0330.md`

## Files That May Need Review

- `logs/audit.log`
- `logs/kb-dev-server.log`

These are outside the Refinery expected write paths and are not included in the exact dirty-log allowlist.

## Rollback Guidance

No raw files, wiki pages, state records, index entries, or log entries were modified by this run before the block. If this error briefing itself should be removed or amended, review and revert only:

```bash
git checkout -- briefings/errors/agentic-kb-refinery-run-2026-06-18-0330.md
```

If the log changes are expected operational noise, either commit/stash them or explicitly add those exact paths to the Refinery dirty-worktree allowlist in the playbook.

## Safest Next Action

Decide whether `logs/audit.log` and `logs/kb-dev-server.log` are expected background noise. If yes, update the playbook allowlist narrowly. If not, inspect the process writing them before rerunning the Refinery Run.
