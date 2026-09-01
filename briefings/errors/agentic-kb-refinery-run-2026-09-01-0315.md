# Agentic-KB Refinery Run — Blocked

- **Job name:** Agentic-KB Refinery Run
- **Job ID:** unavailable in cron context
- **Timestamp:** 2026-09-01 03:15 PDT -0700
- **Phase/stage failed:** Pre-run dirty-worktree safety check
- **Status:** Blocked before processing raw sources or writing wiki/state files

## Reason

The required `git status --porcelain` check found a dirty file outside the Refinery expected write paths and outside the explicitly allowed noisy log files.

Dirty-worktree output:

```text
?? briefings/errors/agentic-kb-scout-run-2026-08-31-2321.md
?? wiki/daily-systems/logs/2026-08-31.md
```

Allowed by this run's instructions:
- Expected Refinery paths: `.night-shift/state/`, `briefings/`, `wiki/summaries/`, `wiki/concepts/`, `wiki/patterns/`, `wiki/frameworks/`, `wiki/recipes/`, `wiki/evaluations/`, `wiki/personal/`, `wiki/index.md`, `wiki/log.md`
- Noisy logs only: `logs/web-server-error.log`, `logs/web-server.log`

Blocking file:
- `wiki/daily-systems/logs/2026-08-31.md` — outside the expected Refinery write paths.

Observed but not blocking under the provided path allowlist:
- `briefings/errors/agentic-kb-scout-run-2026-08-31-2321.md` — under `briefings/`.

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/refinery-run.md`

## Files written or attempted

- `briefings/errors/agentic-kb-refinery-run-2026-09-01-0315.md`

No raw files were read or modified. No wiki summaries, atomic pages, index, log, or state files were updated.

## Files that may need review

- `wiki/daily-systems/logs/2026-08-31.md`
- `briefings/errors/agentic-kb-scout-run-2026-08-31-2321.md`

## Rollback guidance

This blocked run intentionally wrote only this error briefing. If the briefing itself is not wanted, remove this file after reviewing the dirty-worktree issue:

```bash
rm briefings/errors/agentic-kb-refinery-run-2026-09-01-0315.md
```

Do not delete or move `wiki/daily-systems/logs/2026-08-31.md` automatically; it may contain output from another workflow.

## Safest next action for Jay

Review and either commit, move, or intentionally ignore `wiki/daily-systems/logs/2026-08-31.md`. Once the working tree is clean or the file is explicitly allowed for this job, rerun the Agentic-KB Refinery Run.
