# Agentic-KB Refinery Run — BLOCKED

- **Job name:** agentic-kb-refinery-run
- **Job ID:** unavailable in cron context
- **Timestamp:** 2026-09-05 03:16 PDT -0700
- **Failed stage:** pre-run dirty-worktree safety check

## Error / blocked reason

The Refinery run was stopped before processing sources because `git status --porcelain` showed a dirty file outside the user-allowed Refinery write paths and outside the two exact noisy log exceptions.

Controlling dirty-worktree policy for this run allowed only:
- Expected Refinery write paths: `.night-shift/state/`, `briefings/`, `wiki/summaries/`, `wiki/concepts/`, `wiki/patterns/`, `wiki/frameworks/`, `wiki/recipes/`, `wiki/evaluations/`, `wiki/personal/`, `wiki/index.md`, `wiki/log.md`
- Exact noisy logs: `logs/web-server-error.log`, `logs/web-server.log`

Dirty status observed:

```text
 M state/notes-to-factory/ledger.md
?? briefings/errors/agentic-kb-scout-run-2026-09-04-2305.md
```

Blocking file:
- `state/notes-to-factory/ledger.md` — outside allowed Refinery paths.

Non-blocking but pre-existing dirty file:
- `briefings/errors/agentic-kb-scout-run-2026-09-04-2305.md` — inside `briefings/`, which is an expected Refinery write path.

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/refinery-run.md`
- `.night-shift/state/refinery-processed.json`
- `wiki/index.md`
- `wiki/log.md`
- `raw/inbox/` file listing
- `raw/` search results for frontmatter `status: unprocessed`

## Files written or attempted

- Written: `briefings/errors/agentic-kb-refinery-run-2026-09-05-0316.md`
- No wiki pages, raw files, or state ledgers were modified.

## Files that may need review

- `state/notes-to-factory/ledger.md`
- `briefings/errors/agentic-kb-scout-run-2026-09-04-2305.md`

## Rollback guidance

If `state/notes-to-factory/ledger.md` is intentional, commit or otherwise clear that change before rerunning Refinery. If it is accidental, inspect and revert it. Do not broadly clean the worktree; preserve the Scout error briefing unless Jay confirms it should be removed.

## Safest next action

Resolve or commit `state/notes-to-factory/ledger.md`, then rerun `agentic-kb-refinery-run`. The run did not process raw sources because the dirty-worktree gate fired before mutation.
