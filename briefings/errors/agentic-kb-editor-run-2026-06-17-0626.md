# Agentic-KB Editor Run — Blocked

- **Job name:** agentic-kb-editor-run
- **Job ID:** unavailable in cron context
- **Timestamp:** 2026-06-17 06:26:05 -0700
- **Failed stage:** Pre-run dirty-worktree safety check
- **Status:** blocked before Editor writes

## Blocked Reason

`git status --porcelain` showed dirty files outside the Editor Run expected write paths and outside the two exact noisy-log exceptions.

Editor expected write paths:
- `.night-shift/state/`
- `briefings/`
- `wiki/syntheses/`

Allowed noisy-log exceptions:
- `logs/web-server-error.log`
- `logs/web-server.log`

Blocking dirty files:
- `logs/audit.log`
- `logs/kb-dev-server.log`

Full pre-run status:

```text
 M .night-shift/state/editor-state.json
 M logs/audit.log
 M logs/kb-dev-server.log
?? .night-shift/state/refinery-processed.json
?? briefings/2026-06-16.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/refinery-2026-06-16.md
?? briefings/scout-2026-06-15.md
```

The `.night-shift/state/` and `briefings/` changes are within Editor-allowed paths. The two `logs/*` files above are not covered by the exact noisy-log allowlist, so the run stopped.

## Files Read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/editor-run.md`
- `.night-shift/state/editor-state.json`
- `wiki/log.md` partial recent section

## Files Written or Attempted

- Written: `briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md`
- Not attempted: `.night-shift/state/editor-state.json` update
- Not attempted: `briefings/2026-06-17.md`
- Not attempted: any `wiki/syntheses/` changes

## Files Needing Review

Blocking:
- `logs/audit.log`
- `logs/kb-dev-server.log`

Non-blocking but pre-existing dirty state/briefing files visible at run start:
- `.night-shift/state/editor-state.json`
- `.night-shift/state/refinery-processed.json`
- `briefings/2026-06-16.md`
- `briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md`
- `briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md`
- `briefings/refinery-2026-06-16.md`
- `briefings/scout-2026-06-15.md`

## Rollback Guidance

No Editor synthesis or state updates were made. The only write from this run is this error briefing. If desired, remove only this file after review:

```bash
rm briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md
```

Do not clean or revert the blocking log files blindly; inspect whether they are expected runtime logs first.

## Safest Next Action for Jay

Decide whether `logs/audit.log` and `logs/kb-dev-server.log` should be added to the explicit dirty-worktree allowlist for Night Shift jobs, or commit/stash/revert those log changes before rerunning the Editor Run.
