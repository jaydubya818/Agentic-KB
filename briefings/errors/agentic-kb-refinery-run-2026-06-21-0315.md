# Agentic-KB Refinery Run — Blocked

- **Job name:** agentic-kb-refinery-run
- **Job ID:** not available from cron context
- **Timestamp:** 2026-06-21T03:15:39-0700
- **Failed stage:** pre-run dirty-worktree safety check

## Blocked reason
The Refinery Run stopped before processing sources because `git status --porcelain` showed dirty files outside the user-approved Refinery write paths and outside the two exact allowed noisy logs (`logs/web-server-error.log`, `logs/web-server.log`).

Per the user instruction, this run did **not** treat `logs/audit.log`, `logs/kb-dev-server.log`, or `raw/reading-list.md` as safe exceptions, even though the local playbook lists broader exceptions.

## Blocking dirty files

```text
 M logs/audit.log
 M logs/kb-dev-server.log
 M playbooks/editor-run.md
 M playbooks/refinery-run.md
 M playbooks/scout-run.md
 M raw/reading-list.md
 M wiki/lint-report.md
?? raw/framework-docs/ar9av-obsidian-wiki.md
?? raw/framework-docs/chopratejas-headroom.md
?? raw/framework-docs/langchain-ai-rag-from-scratch.md
?? raw/framework-docs/mgechev-skills-best-practices.md
?? raw/framework-docs/microsoft-skillopt.md
?? raw/framework-docs/rohitg00-ai-engineering-from-scratch.md
?? raw/framework-docs/x-twitter-2066530299467706495.md
```

## Dirty files present but inside expected Refinery write paths

These did not block the job because they are under expected Refinery paths (`.night-shift/state/` or `briefings/`):

```text
 M .night-shift/state/editor-state.json
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
?? briefings/errors/agentic-kb-scout-run-2026-06-20-2306.md
?? briefings/refinery-2026-06-16.md
?? briefings/scout-2026-06-15.md
?? briefings/scout-2026-06-18.md
```

## Files read
- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/refinery-run.md`
- Git status output from repository root

## Files written or attempted
- Written: `briefings/errors/agentic-kb-refinery-run-2026-06-21-0315.md`
- No wiki, raw, state, index, or log writes were attempted.

## Files needing review
- `logs/audit.log`
- `logs/kb-dev-server.log`
- `playbooks/editor-run.md`
- `playbooks/refinery-run.md`
- `playbooks/scout-run.md`
- `raw/reading-list.md`
- `wiki/lint-report.md`
- untracked files under `raw/framework-docs/`

## Rollback guidance
No Refinery processing changes were made in this run. To roll back this blocked-run artifact only, remove:

```bash
rm briefings/errors/agentic-kb-refinery-run-2026-06-21-0315.md
```

Do not clean or reset the other dirty files unless Jay confirms they are safe to discard.

## Safest next action for Jay
Review whether the current dirty files are intentional work-in-progress. Either commit/stash them, or explicitly expand the scheduled-job dirty-worktree allowlist if these are expected products of other Night Shift jobs.
