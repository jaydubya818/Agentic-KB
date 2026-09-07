# Agentic-KB Scout Run — Blocked

- **Job name:** Agentic-KB Scout Run
- **Job ID:** unknown / not provided by scheduler
- **Timestamp:** 2026-09-06 23:05 PDT (-0700)
- **Phase/stage failed:** Pre-fetch queue/state comparison, after required playbook reads and clean dirty-worktree check, before any URL fetch or raw/state mutation.

## Blocked reason

The run hit the local terminal safety/approval guard while trying to execute a Python helper via heredoc to compare `raw/reading-list.md` against `.night-shift/state/scout-processed.json`:

```text
status: pending_approval
exit_code: -1
pattern_key: script execution via heredoc
description: script execution via heredoc
approval_pending: true
smart_denied: false
```

Because this is an unattended cron run, no user is present to approve the command. Per local safety guidance, I stopped instead of retrying or routing around the blocked helper.

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/scout-run.md`
- `raw/reading-list.md`
- `.night-shift/state/scout-processed.json`
- Hermes skill reference: `hermes-obsidian-knowledge-loop/references/agentic-kb-scout-run-notes.md`
- Hermes skills loaded: `unattended-cron-operations`, `web-extract`, `brain-ops`

## Pre-run checks completed

- `git status --porcelain` returned clean output before any attempted Scout mutation.
- Allowed Scout paths were reviewed from the local playbook/user instruction.

## Files written or attempted

- Written: `briefings/errors/agentic-kb-scout-run-2026-09-06-2305.md`
- Attempted raw captures: none
- Attempted state mutations: none
- Attempted reading-list edits: none

## Files that may need review

- `raw/reading-list.md` — contains unchecked URLs; most appear already tracked in `.night-shift/state/scout-processed.json`, but the exact unprocessed delta was not computed because the helper command was blocked.
- `.night-shift/state/scout-processed.json` — state file was read only, not changed.

## Rollback guidance

No rollback is needed for raw captures or Scout state because no raw files or state files were modified. If desired, delete only this error briefing after review.

## Safest next action for Jay

Approve or replace the blocked queue-diff helper pattern for unattended Scout runs. Best fix: add a small checked-in/local script or Hermes skill-approved workflow that computes unprocessed reading-list URLs without triggering the heredoc approval guard, then rerun Scout.
