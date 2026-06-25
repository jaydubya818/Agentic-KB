# Agentic-KB Scout Run — Blocked

- **Job name:** Agentic-KB Scout Run
- **Job ID:** unavailable (scheduled Hermes cron run)
- **Timestamp:** 2026-06-20T23:06:02-0700
- **Phase/stage failed:** Pre-run dirty-worktree safety check, before fetching URLs or writing raw captures
- **Status:** BLOCKED

## Blocked reason

`git status --porcelain` reported dirty files outside the Scout Run allowlist. Per `playbooks/scout-run.md`, Scout must stop before making changes when any dirty file exists outside these exact allowed paths/exceptions:

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

Dirty files outside that allowlist:

```text
 M playbooks/editor-run.md
 M playbooks/refinery-run.md
 M playbooks/scout-run.md
 M wiki/lint-report.md
```

Full dirty-worktree output:

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
?? briefings/errors/agentic-kb-editor-run-2026-06-20-0626.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-18-0330.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-19-0327.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-20-0316.md
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-1157.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-2310.md
?? briefings/errors/agentic-kb-scout-run-2026-06-19-2305.md
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
- `raw/reading-list.md`
- `.night-shift/state/scout-processed.json`

## Files written or attempted

- Wrote this error briefing: `briefings/errors/agentic-kb-scout-run-2026-06-20-2306.md`
- No raw captures were attempted.
- No Scout state update was attempted.
- `raw/reading-list.md` was not modified.

## Files that may need review

The following files are blocking Scout because they are outside the allowed Scout write paths:

- `playbooks/editor-run.md`
- `playbooks/refinery-run.md`
- `playbooks/scout-run.md`
- `wiki/lint-report.md`

Context: all unchecked URLs in `raw/reading-list.md` are already present in `.night-shift/state/scout-processed.json`, so after the dirty-worktree issue is resolved the next Scout run should likely be a no-op unless new queue items are added.

## Rollback guidance

No Scout raw captures or state mutations were made by this run. To undo this run's only change, remove this briefing file:

```bash
rm briefings/errors/agentic-kb-scout-run-2026-06-20-2306.md
```

Do not revert or clean the blocking files automatically; they may contain intentional local playbook/wiki edits.

## Safest next action

Review the four blocking files, then either commit/stash/revert them or explicitly expand the Scout allowlist if those paths are intentionally expected to remain dirty during scheduled runs. After the worktree is clean or only Scout-allowed paths are dirty, rerun Scout.
