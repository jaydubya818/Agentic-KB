# Agentic-KB Refinery Run — Blocked

- **Job name:** agentic-kb-refinery-run
- **Job ID:** not available
- **Timestamp:** 2026-06-22T03:15:43-0700
- **Failed stage:** Pre-run dirty-worktree safety check

## Blocked Reason
The Refinery Run stopped before processing sources because `git status --porcelain` showed dirty files outside the expected Refinery write paths and outside the two user-approved noisy log exceptions.

User-approved dirty-worktree exceptions for this run were exactly:
- `logs/web-server-error.log`
- `logs/web-server.log`

The following dirty files are outside those exceptions and outside expected Refinery write paths:

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

Note: there were also dirty files under expected Refinery write paths (`.night-shift/state/`, `briefings/`), which did not cause the block.

## Files Read
- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/refinery-run.md`

## Files Written or Attempted
- Written: `briefings/errors/agentic-kb-refinery-run-2026-06-22-0315.md`
- No wiki, state, or raw-source changes were attempted.

## Files Needing Review
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
No Refinery processing occurred. To roll back this run, remove only this error briefing if it is not useful:

```bash
rm briefings/errors/agentic-kb-refinery-run-2026-06-22-0315.md
```

Do not clean or reset the listed dirty files automatically; they pre-existed this run and may contain user or prior-job work.

## Safest Next Action
Review and either commit, stash, or intentionally approve the dirty files above. Then rerun the Refinery job. If the broader playbook exceptions (`logs/audit.log`, `logs/kb-dev-server.log`, `raw/reading-list.md`) are intended to be safe, align the scheduled job instruction with `playbooks/refinery-run.md`; today’s run used the stricter user instruction that allowed only `logs/web-server-error.log` and `logs/web-server.log`.
