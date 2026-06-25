---
title: Agentic-KB Scout Run Blocked
type: error-briefing
job: agentic-kb-scout-run
timestamp: 2026-06-19T23:05:47-0700
status: blocked
---

# Agentic-KB Scout Run Blocked — 2026-06-19 23:05

## Job name
agentic-kb-scout-run

## Job ID
Not provided by scheduler.

## Timestamp
2026-06-19T23:05:47-0700

## Phase / stage where it failed
Pre-run dirty-worktree safety check, before reading the URL queue or writing any raw captures/state.

## Error or blocked reason
Scout is allowed to proceed only when dirty worktree entries are limited to the Scout write paths/exceptions:

- `.night-shift/state/`
- `briefings/`
- `raw/framework-docs/`
- `raw/transcripts/`
- `raw/code-examples/`
- `logs/web-server-error.log`
- `logs/web-server.log`
- `logs/audit.log`
- `logs/kb-dev-server.log`
- `raw/reading-list.md`

`git status --porcelain` showed dirty files outside those allowed paths, so the scheduled run was blocked before Scout attempted any URL fetching.

Blocking dirty files:

```text
 M playbooks/editor-run.md
 M playbooks/refinery-run.md
 M playbooks/scout-run.md
 M wiki/lint-report.md
```

Full dirty-worktree output at block time:

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
?? .night-shift/state/scout-processed.json
?? briefings/2026-06-16.md
?? briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-18-0649.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-18-0330.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-19-0327.md
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-1157.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-2310.md
?? briefings/refinery-2026-06-16.md
?? briefings/scout-2026-06-15.md
?? briefings/scout-2026-06-18.md
?? raw/framework-docs/ar9av-obsidian-wiki.md
?? raw/framework-docs/chopratejas-headroom.md
?? raw/framework-docs/langchain-ai-rag-from-scratch.md
?? raw/framework-docs/mgechev-skills-best-practices.md
?? raw/framework-docs/microsoft-skillopt.md
?? raw/framework-docs/rohitg00-ai-engineering-from-scratch.md
?? raw/framework-docs/x-twitter-2066530299467706495.md
```

## Files read
- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/scout-run.md`

## Files written or attempted
- Written: `briefings/errors/agentic-kb-scout-run-2026-06-19-2305.md`
- Attempted raw captures: none
- Attempted state updates: none
- Attempted reading-list edits: none

## Files that may need review
- `playbooks/editor-run.md`
- `playbooks/refinery-run.md`
- `playbooks/scout-run.md`
- `wiki/lint-report.md`

These files are outside the Scout allowlist and should be reviewed before the next unattended Scout run.

## Rollback guidance
No Scout raw captures, state updates, or reading-list edits were performed. To roll back this blocked run, remove only this error briefing if it is not useful for audit history:

```bash
rm briefings/errors/agentic-kb-scout-run-2026-06-19-2305.md
```

Do not clean or revert the blocking files automatically; they may contain intentional user or agent work.

## Safest next action for Jay
Review the four blocking dirty files. Commit, stash, or intentionally revert them before the next scheduled Scout run. Once the worktree contains only allowed Scout paths/exceptions, rerun Scout.
