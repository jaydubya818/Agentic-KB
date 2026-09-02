# Agentic-KB Refinery Run — Blocked

- **Job name:** agentic-kb-refinery-run
- **Job ID:** unavailable from cron context
- **Timestamp:** 2026-09-02 03:15:39 PDT (-0700)
- **Failed stage:** pre-run dirty-worktree safety check
- **Status:** blocked before source processing or wiki writes

## Blocked Reason

The required `git status --porcelain` check found a dirty file outside the allowed Refinery write paths and outside the two exact noisy log exceptions allowed by the job instruction.

Dirty files found:

```text
M wiki/daily-systems/logs/2026-09-01.md
?? briefings/errors/agentic-kb-scout-run-2026-09-01-2306.md
```

Allowed by this job instruction:
- Expected Refinery write paths: `.night-shift/state/`, `briefings/`, `wiki/summaries/`, `wiki/concepts/`, `wiki/patterns/`, `wiki/frameworks/`, `wiki/recipes/`, `wiki/evaluations/`, `wiki/personal/`, `wiki/index.md`, `wiki/log.md`
- Exact noisy logs: `logs/web-server-error.log`, `logs/web-server.log`

Blocking file:
- `wiki/daily-systems/logs/2026-09-01.md` — outside allowed Refinery paths.

Non-blocking but pre-existing/untracked:
- `briefings/errors/agentic-kb-scout-run-2026-09-01-2306.md` — under allowed `briefings/` path, but not created by this run.

## Files Read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/refinery-run.md`
- Hermes skill: `hermes-obsidian-knowledge-loop`
- Hermes skill reference: `references/agentic-kb-refinery-run-notes.md`
- Hermes skill: `unattended-cron-operations`
- Hermes skill: `brain-ops`
- Hermes skill: `ingest`
- Hermes skill: `repo-architecture`

## Files Written or Attempted

- Written: `briefings/errors/agentic-kb-refinery-run-2026-09-02-0315.md`

No raw files, wiki pages, index, log, or state files were modified by the Refinery run.

## Files Needing Review

- `wiki/daily-systems/logs/2026-09-01.md` — decide whether this dirty change is intentional and should be committed, reverted, or explicitly handled by its owning workflow.
- `briefings/errors/agentic-kb-scout-run-2026-09-01-2306.md` — review/commit if this Scout error briefing is expected.

## Rollback Guidance

This run only wrote this error briefing. If needed, rollback is limited to deleting or reverting:

```text
briefings/errors/agentic-kb-refinery-run-2026-09-02-0315.md
```

Do not alter `raw/` as part of rollback.

## Safest Next Action

Resolve the pre-existing dirty worktree state first:

1. Inspect `wiki/daily-systems/logs/2026-09-01.md`.
2. Commit or revert that change.
3. Review and commit/clean `briefings/errors/agentic-kb-scout-run-2026-09-01-2306.md` if appropriate.
4. Re-run the Agentic-KB Refinery job after `git status --porcelain` contains only allowed paths/noise.
