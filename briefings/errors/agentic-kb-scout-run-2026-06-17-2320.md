# Agentic-KB Scout Run — Blocked

- **Job name:** agentic-kb-scout-run
- **Job ID:** unavailable
- **Timestamp:** 2026-06-17T23:20:55-0700
- **Failed stage:** pre-run dirty-worktree safety check

## Reason
The Scout run stopped before fetching or writing raw captures because `git status --porcelain` showed dirty files outside the Scout expected write paths and outside the two exact noisy-log allowlist entries.

Allowed Scout write paths:
- `.night-shift/state/`
- `briefings/`
- `raw/framework-docs/`
- `raw/transcripts/`
- `raw/code-examples/`

Allowed noisy-log exceptions:
- `logs/web-server-error.log`
- `logs/web-server.log`

Blocking dirty files:
```text
 M logs/audit.log
 M logs/kb-dev-server.log
```

Full pre-run status:
```text
 M .night-shift/state/editor-state.json
 M logs/audit.log
 M logs/kb-dev-server.log
?? .night-shift/state/refinery-processed.json
?? briefings/2026-06-16.md
?? briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/refinery-2026-06-16.md
?? briefings/scout-2026-06-15.md
```

## Files read
- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/scout-run.md`

## Files written or attempted
- Written: `briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md`
- Attempted raw captures: none
- Attempted state updates: none

## Files that may need review
- `logs/audit.log`
- `logs/kb-dev-server.log`

## Rollback guidance
No source captures or Scout state files were changed by this run. If this blocked report is not useful after review, remove only `briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md`.

## Safest next action
Review whether `logs/audit.log` and `logs/kb-dev-server.log` should be committed, reverted, ignored, or added explicitly to the Scout dirty-worktree allowlist. Do not broaden the allowlist to all of `logs/`.
