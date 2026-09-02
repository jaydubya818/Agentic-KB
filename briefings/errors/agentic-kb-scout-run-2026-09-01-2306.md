# Agentic-KB Scout Run — Blocked

- **Job name:** Agentic-KB Scout Run
- **Job ID:** not provided by runtime
- **Timestamp:** 2026-09-01 23:06:02 PDT -0700
- **Phase/stage where it failed:** Pre-run dirty-worktree safety gate, before URL fetches, raw captures, or Scout state mutation
- **Status:** blocked

## Blocked reason

`git status --porcelain` reported a dirty file outside Scout's allowed write paths/exceptions:

```text
 M wiki/daily-systems/logs/2026-09-01.md
```

Allowed Scout paths/exceptions for this run are exactly:

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

`wiki/daily-systems/logs/2026-09-01.md` is outside that allowlist, so Scout stopped without processing URLs.

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/scout-run.md`
- Hermes skill reference: `hermes-obsidian-knowledge-loop/references/agentic-kb-scout-run-notes.md`

## Files written or attempted

- Written: `briefings/errors/agentic-kb-scout-run-2026-09-01-2306.md`
- Attempted raw captures: none
- Attempted state updates: none
- Attempted reading-list edits: none

## Files that may need review

- `wiki/daily-systems/logs/2026-09-01.md` — pre-existing dirty file blocking Scout

## Rollback guidance

This run only wrote the error briefing above. If Jay wants to remove the run artifact, delete:

```text
briefings/errors/agentic-kb-scout-run-2026-09-01-2306.md
```

Do **not** roll back or modify `wiki/daily-systems/logs/2026-09-01.md` from this job; it was pre-existing work outside Scout scope.

## Safest next action for Jay

Review `wiki/daily-systems/logs/2026-09-01.md`, then either commit/stash/revert it or explicitly expand the Scout dirty-worktree allowlist if that path is expected scheduled-job noise. After the worktree is clean or intentionally allowed, rerun Scout.
