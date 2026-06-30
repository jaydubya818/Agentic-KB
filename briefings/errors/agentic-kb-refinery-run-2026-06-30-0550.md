# Agentic-KB Refinery Run — Blocked Error Briefing

- **Job name:** agentic-kb-refinery-run
- **Job ID:** unavailable in cron prompt
- **Timestamp:** 2026-06-30T05:50:23-0500
- **Failed stage:** Pre-run dirty-worktree safety check, before processing raw sources or writing wiki/state changes

## Blocked Reason

The run was blocked by a dirty file outside the user-approved Refinery write paths and outside the two exact noisy log exceptions.

User-level dirty-worktree policy for this run allows dirty files only under expected Refinery write paths plus exactly:

- `logs/web-server-error.log`
- `logs/web-server.log`

Current `git status --porcelain` included:

```text
 M .night-shift/state/audit-state.json
 M .night-shift/state/editor-state.json
 M logs/kb-dev-server.log
?? briefings/2026-06-26.md
?? briefings/errors/agentic-kb-audit-run-2026-06-29-0005.md
?? briefings/errors/agentic-kb-editor-run-2026-06-29-0847.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-28-0557.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-29-0625.md
?? briefings/scout-2026-06-26.md
?? briefings/scout-2026-06-28.md
?? briefings/scout-2026-06-29.md
?? briefings/scout-2026-06-30.md
```

The `.night-shift/state/` and `briefings/` changes are inside expected Refinery paths, so they do not block this job. `logs/kb-dev-server.log` is outside the allowed set for this run, so the Refinery did not proceed.

## Files Read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/refinery-run.md`
- Hermes skill reference: `hermes-obsidian-knowledge-loop/references/agentic-kb-refinery-run-notes.md`
- Git status output from `/Users/jaywest/Agentic-KB`

## Files Written or Attempted

- Written: `briefings/errors/agentic-kb-refinery-run-2026-06-30-0550.md`
- No wiki pages, summaries, raw files, or state records were written.

## Files Needing Review

- `logs/kb-dev-server.log` — dirty and outside this run's user-approved dirty-worktree allowlist.
- Existing dirty/untracked expected-path files may still need review, but they did not block this run:
  - `.night-shift/state/audit-state.json`
  - `.night-shift/state/editor-state.json`
  - `briefings/2026-06-26.md`
  - `briefings/errors/agentic-kb-audit-run-2026-06-29-0005.md`
  - `briefings/errors/agentic-kb-editor-run-2026-06-29-0847.md`
  - `briefings/errors/agentic-kb-refinery-run-2026-06-28-0557.md`
  - `briefings/errors/agentic-kb-refinery-run-2026-06-29-0625.md`
  - `briefings/scout-2026-06-26.md`
  - `briefings/scout-2026-06-28.md`
  - `briefings/scout-2026-06-29.md`
  - `briefings/scout-2026-06-30.md`

## Rollback Guidance

No Refinery content changes were made. To roll back this blocked run, delete only this error briefing if it is not useful:

```bash
rm briefings/errors/agentic-kb-refinery-run-2026-06-30-0550.md
```

Do not clean or overwrite `logs/kb-dev-server.log` without confirming whether the log contents are needed.

## Safest Next Action

Decide whether `logs/kb-dev-server.log` should be added to the explicit dirty-worktree allowlist for future Refinery runs, committed, ignored, rotated, or reverted. After that, rerun the Refinery job.
