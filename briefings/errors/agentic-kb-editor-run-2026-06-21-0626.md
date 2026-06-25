# Agentic-KB Editor Run — Blocked Error Briefing

- **Job name:** agentic-kb-editor-run
- **Job ID:** not available
- **Timestamp:** 2026-06-21T06:26:11-0700
- **Failed stage:** pre-run dirty-worktree safety check
- **Status:** blocked_dirty_worktree

## Reason

The Editor Run stopped before reviewing recent wiki changes or writing the normal daily briefing because `git status --porcelain` showed dirty files outside the Editor Run's permitted write paths.

Per the user instruction for this scheduled run, dirty-worktree safety may ignore exactly:
- `logs/web-server-error.log`
- `logs/web-server.log`

The current dirty files include other paths outside the Editor Run's expected write paths (`.night-shift/state/`, `briefings/`, `wiki/syntheses/`), so the safest action is to block rather than synthesize against a moving/unclean vault.

## Blocking Dirty Files

- `logs/audit.log`
- `logs/kb-dev-server.log`
- `playbooks/editor-run.md`
- `playbooks/refinery-run.md`
- `playbooks/scout-run.md`
- `raw/reading-list.md`
- `wiki/lint-report.md`
- `raw/framework-docs/ar9av-obsidian-wiki.md`
- `raw/framework-docs/chopratejas-headroom.md`
- `raw/framework-docs/langchain-ai-rag-from-scratch.md`
- `raw/framework-docs/mgechev-skills-best-practices.md`
- `raw/framework-docs/microsoft-skillopt.md`
- `raw/framework-docs/rohitg00-ai-engineering-from-scratch.md`
- `raw/framework-docs/x-twitter-2066530299467706495.md`

## Files Read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/editor-run.md`
- `.night-shift/state/editor-state.json`
- `wiki/log.md`
- `git status --porcelain` output

## Files Written or Attempted

- `briefings/errors/agentic-kb-editor-run-2026-06-21-0626.md`
- `.night-shift/state/editor-state.json`

No `raw/` files were modified. No `wiki/syntheses/` files were created or updated.

## Files That May Need Review

The blocking dirty files above need human review, commit, revert, or an explicit expanded allowlist before the Editor Run can proceed safely. Pay special attention to:
- `playbooks/*.md` because playbook changes alter scheduled-job behavior.
- `raw/framework-docs/*.md` because raw source files are normally immutable once captured and scheduled jobs must not modify them.
- `raw/reading-list.md` because the user instruction for this run did **not** allow ignoring it, even though the playbook currently lists it as an intake exception.
- `logs/audit.log` and `logs/kb-dev-server.log` because the user instruction allowed only two specific noisy logs, not all operational logs.

## Rollback Guidance

This run made only an error briefing and state update. To roll back this run's own changes:
1. Remove `briefings/errors/agentic-kb-editor-run-2026-06-21-0626.md` if you do not want to keep the audit record.
2. Revert `.night-shift/state/editor-state.json` to its previous version if needed.

Do **not** delete or modify the blocking files as part of rollback unless Jay explicitly asks; they pre-existed this run.

## Safest Next Action

Review the blocking dirty files, then either commit/revert them or explicitly update the Editor Run dirty-file policy. After the worktree is clean except for permitted Editor paths and the two exact noisy logs, rerun the Editor Run.
