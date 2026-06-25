# Agentic-KB Editor Run — Blocked

- **Job name:** agentic-kb-editor-run
- **Job ID:** not provided by scheduler
- **Timestamp:** 2026-06-22T06:26:03-0700
- **Failed stage:** pre-run dirty-worktree safety check
- **Status:** blocked_dirty_worktree

## Reason
The Editor Run stopped before reviewing or writing syntheses because `git status --porcelain` showed dirty files outside the allowed Editor write paths and outside the two exact noisy log exceptions allowed by the cron instruction.

Allowed dirty paths for this run:
- `.night-shift/state/`
- `briefings/`
- `wiki/syntheses/`
- `logs/web-server-error.log`
- `logs/web-server.log`

Blocking dirty files:
- `logs/audit.log`
- `logs/kb-dev-server.log`
- `playbooks/editor-run.md`
- `playbooks/refinery-run.md`
- `playbooks/scout-run.md`
- `raw/reading-list.md`
- `raw/framework-docs/ar9av-obsidian-wiki.md`
- `raw/framework-docs/chopratejas-headroom.md`
- `raw/framework-docs/langchain-ai-rag-from-scratch.md`
- `raw/framework-docs/mgechev-skills-best-practices.md`
- `raw/framework-docs/microsoft-skillopt.md`
- `raw/framework-docs/rohitg00-ai-engineering-from-scratch.md`
- `raw/framework-docs/x-twitter-2066530299467706495.md`

Note: `playbooks/editor-run.md` itself lists broader exceptions (`logs/audit.log`, `logs/kb-dev-server.log`, and `raw/reading-list.md`), but the cron instruction for this run is stricter and allows ignoring exactly `logs/web-server-error.log` and `logs/web-server.log` only.

## Files Read
- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/editor-run.md`
- `.night-shift/state/editor-state.json`
- `wiki/log.md`

## Files Written or Attempted
- `briefings/errors/agentic-kb-editor-run-2026-06-22-0626.md`
- `.night-shift/state/editor-state.json`

## Files That May Need Review
- `logs/audit.log`
- `logs/kb-dev-server.log`
- `playbooks/editor-run.md`
- `playbooks/refinery-run.md`
- `playbooks/scout-run.md`
- `raw/reading-list.md`
- `raw/framework-docs/ar9av-obsidian-wiki.md`
- `raw/framework-docs/chopratejas-headroom.md`
- `raw/framework-docs/langchain-ai-rag-from-scratch.md`
- `raw/framework-docs/mgechev-skills-best-practices.md`
- `raw/framework-docs/microsoft-skillopt.md`
- `raw/framework-docs/rohitg00-ai-engineering-from-scratch.md`
- `raw/framework-docs/x-twitter-2066530299467706495.md`

## Rollback Guidance
No wiki synthesis pages or raw files were modified by this run. To roll back this run only, remove:
- `briefings/errors/agentic-kb-editor-run-2026-06-22-0626.md`

If needed, restore `.night-shift/state/editor-state.json` from git or from the prior state showing the 2026-06-21 blocked run.

## Safest Next Action
Decide whether the dirty files are expected outputs from Scout/Refinery/playbook edits. If yes, stage/commit them or explicitly widen the Editor Run dirty-worktree allowlist. If not, inspect and revert the unexpected files before the next scheduled Editor Run.
