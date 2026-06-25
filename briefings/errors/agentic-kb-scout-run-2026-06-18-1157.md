# Agentic-KB Scout Run — Blocked

- **Job name:** Agentic-KB Scout Run
- **Job ID:** unavailable from cron context
- **Timestamp:** 2026-06-18T11:57:58-0700
- **Failed stage:** Pre-run dirty-worktree safety check
- **Status:** blocked before Scout capture or state mutation

## Blocked reason

`git status --porcelain` reported dirty files outside the Scout Run's allowed write paths and outside the exact user-approved noisy log exceptions (`logs/web-server-error.log`, `logs/web-server.log`). Per the job instruction, Scout stopped before fetching URLs or writing raw captures.

Dirty files reported:

```text
 M .night-shift/state/editor-state.json
 M logs/audit.log
 M logs/kb-dev-server.log
 M playbooks/editor-run.md
 M playbooks/refinery-run.md
 M playbooks/scout-run.md
 M raw/reading-list.md
 M wiki/lint-report.md
?? .night-shift/state/refinery-processed.json
?? briefings/2026-06-16.md
?? briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-18-0649.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-18-0330.md
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md
?? briefings/refinery-2026-06-16.md
?? briefings/scout-2026-06-15.md
```

Blocking files outside the user-approved Scout safety scope include:

- `logs/audit.log`
- `logs/kb-dev-server.log`
- `playbooks/editor-run.md`
- `playbooks/refinery-run.md`
- `playbooks/scout-run.md`
- `raw/reading-list.md`
- `wiki/lint-report.md`

Notes:
- `.night-shift/state/`, `briefings/`, `raw/framework-docs/`, `raw/transcripts/`, and `raw/code-examples/` are expected Scout write paths.
- The user explicitly allowed ignoring only `logs/web-server-error.log` and `logs/web-server.log`; this run did **not** ignore `logs/audit.log`, `logs/kb-dev-server.log`, or `raw/reading-list.md` despite the local playbook mentioning broader exceptions.

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/scout-run.md`
- Git status output from `git status --porcelain`

## Files written or attempted

- Written: `briefings/errors/agentic-kb-scout-run-2026-06-18-1157.md`
- Not attempted: URL fetches, raw captures, `.night-shift/state/scout-processed.json`, normal `briefings/scout-2026-06-18.md`

## Files that may need review

Review or intentionally stage/commit/clear the dirty files listed above, especially:

- `playbooks/scout-run.md` — currently differs from the stricter user instruction for ignored dirty paths.
- `raw/reading-list.md` — Scout intake queue is dirty and was not in the user-approved ignore list.
- `wiki/lint-report.md` — outside Scout write paths.
- `logs/audit.log` and `logs/kb-dev-server.log` — local playbook says to ignore these, but the job instruction did not.

## Rollback guidance

This Scout run made no raw capture, state, or normal briefing changes. To roll back only this run's artifact, remove:

```bash
rm briefings/errors/agentic-kb-scout-run-2026-06-18-1157.md
```

Do not clean or reset the other dirty files unless Jay explicitly approves or confirms they are disposable.

## Safest next action

Decide whether the stricter cron instruction should remain authoritative. If yes, clean/stage/commit the dirty files outside Scout's expected paths and rerun Scout. If the local playbook exceptions are intended, update the scheduled job instruction to match them explicitly before the next run.
