# Agentic-KB Editor Run — Blocked

- **Job name:** agentic-kb-editor-run
- **Job ID:** unavailable in cron context
- **Timestamp:** 2026-06-18T06:49:20-0700
- **Failed stage:** pre-run dirty-worktree safety check
- **Status:** blocked before Editor processing

## Reason

`git status --porcelain` found dirty files outside the Editor Run's allowed write paths.

Allowed Editor dirty paths:
- `.night-shift/state/`
- `briefings/`
- `wiki/syntheses/`

Allowed noisy log exceptions:
- `logs/web-server-error.log`
- `logs/web-server.log`

Blocking dirty files found outside that scope:
- `logs/audit.log`
- `logs/kb-dev-server.log`

Full pre-run status observed:

```text
 M .night-shift/state/editor-state.json
 M logs/audit.log
 M logs/kb-dev-server.log
?? .night-shift/state/refinery-processed.json
?? briefings/2026-06-16.md
?? briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-18-0330.md
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md
?? briefings/refinery-2026-06-16.md
?? briefings/scout-2026-06-15.md
```

## Files Read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/editor-run.md`
- `.night-shift/state/editor-state.json`
- `wiki/log.md`

## Files Written or Attempted

- Written: `briefings/errors/agentic-kb-editor-run-2026-06-18-0649.md`
- Not attempted because blocked: `.night-shift/state/editor-state.json`, `briefings/2026-06-18.md`, any `wiki/syntheses/` update

## Files That May Need Review

Blocking:
- `logs/audit.log`
- `logs/kb-dev-server.log`

Pre-existing but inside expected Editor/state/briefing paths:
- `.night-shift/state/editor-state.json`
- `.night-shift/state/refinery-processed.json`
- `briefings/2026-06-16.md`
- `briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md`
- `briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md`
- `briefings/errors/agentic-kb-refinery-run-2026-06-18-0330.md`
- `briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md`
- `briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md`
- `briefings/refinery-2026-06-16.md`
- `briefings/scout-2026-06-15.md`

## Rollback Guidance

This run only wrote the error briefing above. To roll back this run, remove:

```bash
rm briefings/errors/agentic-kb-editor-run-2026-06-18-0649.md
```

Do not remove or reset the blocking log files until their source is understood.

## Safest Next Action

Review why `logs/audit.log` and `logs/kb-dev-server.log` are dirty. If they are expected noisy runtime logs, either commit/clean them deliberately or update the Editor playbook allowlist explicitly. Do not broaden the allowlist to all of `logs/`.
