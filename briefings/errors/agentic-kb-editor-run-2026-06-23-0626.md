# Agentic-KB Editor Run — Blocked

- **Job name:** agentic-kb-editor-run
- **Job ID:** not available
- **Timestamp:** 2026-06-23T06:26:14-0700
- **Failed stage:** pre-run dirty-worktree safety check
- **Status:** blocked before normal Editor work

## Reason
The Editor Run was instructed to stop if `git status --porcelain` showed dirty files outside the expected Editor write paths:

- `.night-shift/state/`
- `briefings/`
- `wiki/syntheses/`

The user-level instruction allowed ignoring exactly these noisy log files only:

- `logs/web-server-error.log`
- `logs/web-server.log`

The worktree contains dirty files outside those allowed paths, so the run stopped before reading/updating `editor-state.json`, reviewing recent wiki changes, or writing a normal daily briefing.

## Dirty files that blocked the run

```text
 M logs/audit.log
 M logs/kb-dev-server.log
 M playbooks/editor-run.md
 M playbooks/refinery-run.md
 M playbooks/scout-run.md
 M raw/reading-list.md
?? raw/framework-docs/ar9av-obsidian-wiki.md
?? raw/framework-docs/chopratejas-headroom.md
?? raw/framework-docs/langchain-ai-rag-from-scratch.md
?? raw/framework-docs/mgechev-skills-best-practices.md
?? raw/framework-docs/microsoft-skillopt.md
?? raw/framework-docs/rohitg00-ai-engineering-from-scratch.md
?? raw/framework-docs/x-twitter-2066530299467706495.md
```

Dirty files inside expected Editor write paths were present but did not block this run:

```text
 M .night-shift/state/audit-state.json
 M .night-shift/state/editor-state.json
?? .night-shift/state/refinery-processed.json
?? .night-shift/state/scout-processed.json
?? briefings/2026-06-16.md
?? briefings/errors/agentic-kb-audit-run-2026-06-21-2205.md
?? briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-18-0649.md
?? briefings/errors/agentic-kb-editor-run-2026-06-20-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-21-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-22-0626.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-18-0330.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-19-0327.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-20-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-21-0315.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-22-0315.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-23-0315.md
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-1157.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-2310.md
?? briefings/errors/agentic-kb-scout-run-2026-06-19-2305.md
?? briefings/errors/agentic-kb-scout-run-2026-06-20-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-21-2305.md
?? briefings/errors/agentic-kb-scout-run-2026-06-22-2320.md
?? briefings/refinery-2026-06-16.md
?? briefings/scout-2026-06-15.md
?? briefings/scout-2026-06-18.md
```

## Files read
- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/editor-run.md`
- `git status --porcelain` output

## Files written or attempted
- Written: `briefings/errors/agentic-kb-editor-run-2026-06-23-0626.md`
- Not attempted because blocked: `.night-shift/state/editor-state.json`
- Not attempted because blocked: `briefings/2026-06-23.md`
- Not attempted because blocked: `wiki/syntheses/*`

## Files that may need review
- `playbooks/editor-run.md`
- `playbooks/refinery-run.md`
- `playbooks/scout-run.md`
- `raw/reading-list.md`
- New `raw/framework-docs/*.md` files listed above
- `logs/audit.log`
- `logs/kb-dev-server.log`

## Rollback guidance
Do not blindly revert these files from automation. The dirty raw and playbook files may represent intentional Scout/Refinery setup work. Review the blocking files, then either commit/stage accepted changes or explicitly revert the ones that are accidental. Keep `raw/` preservation intact.

## Safest next action
Jay should review the blocking dirty files and decide whether they are expected Night Shift setup artifacts. Once the worktree is clean or the dirty-worktree policy is intentionally expanded, rerun the Editor job.
