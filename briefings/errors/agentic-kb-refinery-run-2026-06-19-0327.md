# Agentic-KB Refinery Run — Blocked

- **Job name:** agentic-kb-refinery-run
- **Job ID:** not available from cron context
- **Timestamp:** 2026-06-19 03:27:50 PDT
- **Failed stage:** pre-run dirty-worktree safety check

## Blocked reason

Refinery stopped before processing sources because `git status --porcelain` showed dirty files outside the expected Refinery write paths and outside the two exact noisy log exceptions allowed by the run instruction (`logs/web-server-error.log`, `logs/web-server.log`).

The stricter run instruction overrides the broader playbook exceptions for this run.

## Dirty files that blocked the run

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

Existing dirty files under expected Refinery write paths were not treated as blockers for this specific check:

```text
 M .night-shift/state/editor-state.json
?? .night-shift/state/refinery-processed.json
?? .night-shift/state/scout-processed.json
?? briefings/2026-06-16.md
?? briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-18-0649.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-18-0330.md
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-1157.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-2310.md
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

- `briefings/errors/agentic-kb-refinery-run-2026-06-19-0327.md`

## Files that may need review

Review the blocking dirty files listed above before the next unattended Refinery run. Pay particular attention to:

- Modified playbooks: `playbooks/editor-run.md`, `playbooks/refinery-run.md`, `playbooks/scout-run.md`
- Modified intake/source-adjacent files: `raw/reading-list.md`, untracked `raw/framework-docs/*.md`
- Modified non-allowed logs: `logs/audit.log`, `logs/kb-dev-server.log`
- Modified wiki file outside the Refinery expected write set: `wiki/lint-report.md`

## Rollback guidance

No raw files or wiki content were changed by this run. The only intentional write from this run is this error briefing. If needed, remove only this briefing after reviewing it; do not clean or revert the other dirty files unless Jay confirms they are stale or safe to discard.

## Safest next action

Decide whether the dirty files are legitimate outputs from prior jobs that should be committed/accepted, or stale working-tree noise that should be cleaned. After the worktree is clean or the allowed dirty-worktree policy is explicitly widened, rerun the Refinery job.
