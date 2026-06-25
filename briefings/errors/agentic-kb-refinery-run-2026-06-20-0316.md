# Agentic-KB Refinery Run — Blocked

- **Job name:** Agentic-KB Refinery Run
- **Job ID:** unavailable in cron context
- **Timestamp:** 2026-06-20T03:16:28-0700
- **Failed stage:** Pre-run dirty-worktree safety check

## Blocked reason

The Refinery Run stopped before processing raw sources because `git status --porcelain` showed dirty files outside the expected Refinery write paths and outside the two exact noisy log files allowed by the job instruction (`logs/web-server-error.log`, `logs/web-server.log`).

Expected Refinery write paths for this job:
- `.night-shift/state/`
- `briefings/`
- `wiki/summaries/`
- `wiki/concepts/`
- `wiki/patterns/`
- `wiki/frameworks/`
- `wiki/recipes/`
- `wiki/evaluations/`
- `wiki/personal/`
- `wiki/index.md`
- `wiki/log.md`

Dirty files that block this run:

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

Non-blocking dirty files under expected Refinery paths observed:

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
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-1157.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-2310.md
?? briefings/errors/agentic-kb-scout-run-2026-06-19-2305.md
?? briefings/refinery-2026-06-16.md
?? briefings/scout-2026-06-15.md
?? briefings/scout-2026-06-18.md
```

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/refinery-run.md`

## Files written or attempted

- Written: `briefings/errors/agentic-kb-refinery-run-2026-06-20-0316.md`

## Files needing review

Review and either commit, stash, or explicitly allow the blocking dirty files listed above before the next unattended Refinery Run. Pay special attention to:
- `playbooks/*.md` changes, because they affect future scheduled behavior.
- `raw/reading-list.md` and untracked `raw/framework-docs/*.md`, because raw/source changes are outside this mutable job's expected write paths.
- `wiki/lint-report.md`, because it is outside the expected Refinery output paths.
- `logs/audit.log` and `logs/kb-dev-server.log`, because the current user instruction only allowed ignoring `logs/web-server-error.log` and `logs/web-server.log`.

## Rollback guidance

No wiki/source processing occurred during this run. The only intentional write from this run is this error briefing. If needed, remove only this file after confirming it is no longer useful:

```bash
rm briefings/errors/agentic-kb-refinery-run-2026-06-20-0316.md
```

Do not clean or revert any other dirty files without Jay's explicit approval.

## Safest next action

Resolve the dirty-worktree state by committing, stashing, or explicitly approving the listed blocking files. Then rerun the Refinery Run.
