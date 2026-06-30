# Agentic-KB Refinery Run — Blocked

- **Job name:** agentic-kb-refinery-run
- **Job ID:** not available from cron context
- **Timestamp:** 2026-06-28 05:57:38 CDT
- **Failed stage:** pre-run dirty-worktree safety check
- **Status:** blocked before processing raw sources or writing wiki/state updates

## Blocked reason

`git status --porcelain` reported dirty files outside the user-approved Refinery paths and outside the two exact noisy log exceptions (`logs/web-server-error.log`, `logs/web-server.log`). Per the job instruction, the run must stop instead of mutating the KB.

Dirty paths observed:

```text
 M .night-shift/state/editor-state.json
 M logs/kb-dev-server.log
?? briefings/2026-06-26.md
?? briefings/scout-2026-06-26.md
?? briefings/scout-2026-06-28.md
```

Allowed/expected under this Refinery run:

- `.night-shift/state/editor-state.json` — inside expected `.night-shift/state/`; non-blocking but pre-existing.
- `briefings/2026-06-26.md`, `briefings/scout-2026-06-26.md`, `briefings/scout-2026-06-28.md` — inside expected `briefings/`; non-blocking but pre-existing.

Blocking path:

- `logs/kb-dev-server.log` — not one of the two user-approved noisy log exceptions, and the user explicitly said not to ignore `logs/` broadly.

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/refinery-run.md`
- Hermes skill reference: `hermes-obsidian-knowledge-loop/references/agentic-kb-refinery-run-notes.md`

## Files written or attempted

- Written: `briefings/errors/agentic-kb-refinery-run-2026-06-28-0557.md`

## Files needing review

- `logs/kb-dev-server.log` — decide whether this should be committed, reverted, or explicitly added to a future allowlist.
- `.night-shift/state/editor-state.json` — pre-existing state modification; confirm it belongs to the Editor run.
- `briefings/2026-06-26.md`
- `briefings/scout-2026-06-26.md`
- `briefings/scout-2026-06-28.md`

## Rollback guidance

This run did not process raw sources and did not modify wiki pages or Refinery state. To roll back this blocked-run artifact only:

```bash
rm briefings/errors/agentic-kb-refinery-run-2026-06-28-0557.md
```

Do not remove or reset the other dirty files unless Jay explicitly confirms they are disposable.

## Safest next action

Review `logs/kb-dev-server.log`. If it is expected runtime noise, either clean it before the next scheduled Refinery run or explicitly add that exact file to the job-level dirty-worktree allowlist. Then rerun the Refinery job.
