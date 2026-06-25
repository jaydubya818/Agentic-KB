# Agentic-KB Scout Run — Blocked/Error Briefing

- **Job name:** agentic-kb-scout-run
- **Job ID:** unavailable in runtime context
- **Timestamp:** 2026-06-16T23:06:19-0700
- **Failed stage:** Pre-run dirty-worktree safety check
- **Status:** blocked before Scout capture/fetch/write operations

## Blocked reason

`git status --porcelain` showed dirty files outside the Scout Run's allowed write paths.

Allowed Scout write paths:
- `.night-shift/state/`
- `briefings/`
- `raw/framework-docs/`
- `raw/transcripts/`
- `raw/code-examples/`

Allowed noisy log exceptions:
- `logs/web-server-error.log`
- `logs/web-server.log`

Actual dirty status:

```text
 M .night-shift/state/editor-state.json
 M logs/audit.log
 M logs/kb-dev-server.log
?? .night-shift/state/refinery-processed.json
?? briefings/2026-06-16.md
?? briefings/refinery-2026-06-16.md
?? briefings/scout-2026-06-15.md
```

Blocking files:
- `logs/audit.log`
- `logs/kb-dev-server.log`

These are under `logs/` but are **not** the two exact allowed noisy log files, so the Scout Run stopped before making normal changes.

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/scout-run.md`

## Files written or attempted

- Written: `briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md`
- No raw captures were attempted.
- `.night-shift/state/scout-processed.json` was not modified.
- `briefings/scout-2026-06-16.md` was not written.

## Files needing review

- `logs/audit.log`
- `logs/kb-dev-server.log`

Optional context from dirty status that appears within expected Scout/Night Shift write paths and did not cause the block:
- `.night-shift/state/editor-state.json`
- `.night-shift/state/refinery-processed.json`
- `briefings/2026-06-16.md`
- `briefings/refinery-2026-06-16.md`
- `briefings/scout-2026-06-15.md`

## Rollback guidance

No source files were fetched or captured during this Scout Run. To roll back this blocked run, remove only this error briefing if desired:

```bash
rm briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
```

Do **not** delete or clean the dirty log files automatically without confirming their purpose.

## Safest next action for Jay

Review why `logs/audit.log` and `logs/kb-dev-server.log` are dirty. If they are expected runtime noise, either clean/stash them manually or explicitly add those exact files to the Scout dirty-worktree allowlist before rerunning the job.
