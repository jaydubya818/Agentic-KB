# Agentic-KB Editor Run — BLOCKED

- **Job name:** agentic-kb-editor-run
- **Job ID:** not available in cron context
- **Timestamp:** 2026-06-20 06:26 PDT
- **Failed stage:** Pre-run dirty-worktree safety check, before wiki page review or synthesis writes
- **Reason:** `git status --porcelain` showed dirty files outside the Editor Run allowed write paths (`.night-shift/state/`, `briefings/`, `wiki/syntheses/`) and outside the user-approved noisy log allowlist (`logs/web-server-error.log`, `logs/web-server.log`). Per Night Shift rules, the job stopped before making normal Editor changes.

## Files read
- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/editor-run.md`
- `.night-shift/state/editor-state.json`
- `wiki/log.md`

## Files written or attempted
- Written: `briefings/errors/agentic-kb-editor-run-2026-06-20-0626.md`
- Written: `.night-shift/state/editor-state.json` with blocked status and this briefing path
- Not attempted: wiki synthesis updates
- Not attempted: normal daily briefing

## Blocking dirty files outside Editor write paths
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

Allowed/expected dirty paths observed but not blocking:
```text
 M .night-shift/state/editor-state.json
?? .night-shift/state/refinery-processed.json
?? .night-shift/state/scout-processed.json
?? briefings/2026-06-16.md
?? briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-18-0649.md
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
```

## Files needing review
- `playbooks/editor-run.md`, `playbooks/refinery-run.md`, `playbooks/scout-run.md` — playbook edits are outside the Editor job scope.
- `raw/reading-list.md` and untracked `raw/framework-docs/*.md` — raw/intake changes are outside the Editor job scope and must not be normalized by this run.
- `wiki/lint-report.md` — wiki write outside `wiki/syntheses/` and outside this job's allowed scope.
- `logs/audit.log`, `logs/kb-dev-server.log` — the playbook mentions these as ignorable, but the direct cron instruction only allowed `logs/web-server-error.log` and `logs/web-server.log`, so this run treated them as blocking.

## Rollback guidance
No wiki synthesis files or raw files were modified by this run. To roll back this blocked run only:

```bash
git checkout -- .night-shift/state/editor-state.json
rm briefings/errors/agentic-kb-editor-run-2026-06-20-0626.md
```

Do **not** run broad cleanup commands against `raw/`, `logs/`, or `playbooks/`; those contain pre-existing changes that need owner review.

## Safest next action
Review or commit/stash the dirty files outside the Editor allowed paths, then rerun the Editor job. If `logs/audit.log`, `logs/kb-dev-server.log`, and `raw/reading-list.md` should be allowed for this cron job, align the cron instruction with the playbook explicitly; right now the direct cron instruction is stricter, so Hermes correctly blocked.
