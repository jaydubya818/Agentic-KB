---
title: Agentic-KB Scout Run Error Briefing
type: error-briefing
job: agentic-kb-scout-run
timestamp: 2026-09-04 23:05:34 PDT -0700
status: blocked
---

# Agentic-KB Scout Run — Blocked

## Job name
agentic-kb-scout-run

## Job ID
Unknown / not provided by cron context.

## Timestamp
2026-09-04 23:05:34 PDT -0700

## Phase / stage where it failed
Pre-run dirty-worktree safety check, before any Scout fetch, raw capture, or state mutation.

## Error or blocked reason
`git status --porcelain` showed a dirty file outside the Scout allowed write paths/exceptions:

```text
 M state/notes-to-factory/ledger.md
```

Allowed Scout paths/exceptions are limited to:
- `.night-shift/state/`
- `briefings/`
- `raw/framework-docs/`
- `raw/transcripts/`
- `raw/code-examples/`
- `logs/web-server-error.log`
- `logs/web-server.log`
- `logs/audit.log`
- `logs/kb-dev-server.log`
- `raw/reading-list.md`

`state/notes-to-factory/ledger.md` is outside that allowlist, so the run stopped as required by `playbooks/scout-run.md`.

## Files read
- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/scout-run.md`
- `raw/reading-list.md`
- `.night-shift/state/scout-processed.json`

## Files written or attempted
- Written: `briefings/errors/agentic-kb-scout-run-2026-09-04-2305.md`
- Attempted: no raw captures, state updates, or normal Scout briefing were attempted.

## Files that may need review
- `state/notes-to-factory/ledger.md` — pre-existing dirty file blocking the Scout run.

## Rollback guidance
No Scout data changes were made. To rollback this run, delete only this error briefing if it is no longer useful. Do not change `state/notes-to-factory/ledger.md` unless Jay confirms that file can be cleaned, committed, or otherwise reconciled.

## Safest next action for Jay
Review `state/notes-to-factory/ledger.md` and either commit/stash/revert it or add it to a playbook-specific allowlist only if it is intentionally safe for Scout-era dirty-worktree checks. After the worktree is clean or the file is intentionally handled, rerun Scout.
