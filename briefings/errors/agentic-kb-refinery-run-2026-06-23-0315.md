# Agentic-KB Refinery Run — Blocked

- **Job name:** agentic-kb-refinery-run
- **Job ID:** unavailable in cron context
- **Timestamp:** 2026-06-23 03:15:47 PDT
- **Failed stage:** pre-run dirty-worktree safety check
- **Status:** blocked before processing raw sources

## Blocked reason

`git status --porcelain` showed dirty files outside the expected Refinery write paths and outside the two exact noisy log files allowed by the job instruction (`logs/web-server-error.log`, `logs/web-server.log`).

The run stopped before processing sources to avoid mixing this scheduled Refinery write with unrelated pre-existing changes.

## Dirty files that caused the block

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

Other dirty files were present under allowed Refinery paths (`.night-shift/state/`, `briefings/`) and were not treated as blockers.

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/refinery-run.md`

## Files written or attempted

- Written: `briefings/errors/agentic-kb-refinery-run-2026-06-23-0315.md`

No wiki pages, raw files, state hashes, or normal Refinery briefing were written.

## Files that may need review

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

## Rollback guidance

No Refinery content changes were made before the block. To remove this error report only, delete:

```bash
rm briefings/errors/agentic-kb-refinery-run-2026-06-23-0315.md
```

Do not clean or revert the dirty files above without confirming whether they are intentional Scout/playbook/log changes.

## Safest next action for Jay

Decide whether the modified playbooks, raw reading-list changes, untracked `raw/framework-docs/` captures, and extra log files are expected. Then either commit/stash those changes or explicitly expand the Refinery dirty-worktree allowlist before re-running the job.
