---
title: Agentic-KB Refinery Run Blocked
type: error-briefing
job: agentic-kb-refinery-run
timestamp: 2026-06-17 03:16 PDT -0700
status: blocked
---

# Agentic-KB Refinery Run Blocked

## Job
- **Job name:** agentic-kb-refinery-run
- **Job ID:** unavailable in cron prompt
- **Timestamp:** 2026-06-17 03:16 PDT -0700
- **Phase/stage failed:** Pre-run dirty-worktree safety check

## Blocked reason
The Refinery Run must stop before wiki/state processing when `git status --porcelain` shows dirty files outside expected Refinery write paths and outside the two exact noisy log exceptions (`logs/web-server-error.log`, `logs/web-server.log`).

`git status --porcelain` returned:

```text
 M .night-shift/state/editor-state.json
 M logs/audit.log
 M logs/kb-dev-server.log
?? .night-shift/state/refinery-processed.json
?? briefings/2026-06-16.md
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/refinery-2026-06-16.md
?? briefings/scout-2026-06-15.md
```

Blocking files outside the allowed Refinery write paths / allowed noisy-log exceptions:
- `logs/audit.log`
- `logs/kb-dev-server.log`

Allowed or expected dirty paths observed but not blocking:
- `.night-shift/state/editor-state.json`
- `.night-shift/state/refinery-processed.json`
- `briefings/2026-06-16.md`
- `briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md`
- `briefings/refinery-2026-06-16.md`
- `briefings/scout-2026-06-15.md`

## Files read
- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/refinery-run.md`

## Files written or attempted
- Written: `briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md`
- No wiki, raw, or state processing was attempted.

## Files that may need review
- `logs/audit.log`
- `logs/kb-dev-server.log`
- Existing dirty/untracked files from prior runs:
  - `.night-shift/state/editor-state.json`
  - `.night-shift/state/refinery-processed.json`
  - `briefings/2026-06-16.md`
  - `briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md`
  - `briefings/refinery-2026-06-16.md`
  - `briefings/scout-2026-06-15.md`

## Rollback guidance
This run only created this error briefing. To roll back this run, remove:

```bash
rm briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md
```

Do not modify `raw/` files. Do not clean or reset the unrelated dirty log files without Jay's explicit approval.

## Safest next action
Review why `logs/audit.log` and `logs/kb-dev-server.log` are dirty. Either commit/stash/restore those log changes, add an explicit playbook exception if they are expected noise, or rerun the Refinery after the worktree is clean except for allowed Refinery paths and the two exact noisy logs.
