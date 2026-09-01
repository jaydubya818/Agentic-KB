# Agentic-KB Scout Run — Blocked

- **Job name:** Agentic-KB Scout Run
- **Job ID:** Not available in cron context
- **Timestamp:** 2026-08-31T23:21:00-0700
- **Phase/stage failed:** Pre-run dirty-worktree gate, before URL fetch/raw capture/state mutation
- **Status:** Blocked

## Blocked reason

`git status --porcelain` reported a dirty file outside Scout's allowed write paths/exceptions:

```text
?? wiki/daily-systems/logs/2026-08-31.md
```

Scout is allowed to ignore only these paths/exceptions:

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

Because `wiki/daily-systems/logs/2026-08-31.md` is outside that set, the scheduled run stopped before processing the reading-list queue.

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/scout-run.md`
- `raw/reading-list.md`
- `.night-shift/state/scout-processed.json`
- Hermes skill reference: `hermes-obsidian-knowledge-loop/references/agentic-kb-scout-run-notes.md`

## Files written or attempted

- Written: `briefings/errors/agentic-kb-scout-run-2026-08-31-2321.md`
- Not attempted: raw captures
- Not attempted: `.night-shift/state/scout-processed.json` update
- Not attempted: `briefings/scout-2026-08-31.md`

## Files that may need review

- `wiki/daily-systems/logs/2026-08-31.md` — untracked dirty file blocking Scout.

## Rollback guidance

No raw captures or Scout state changes were made. To roll back this blocked run, remove this error briefing if desired:

```bash
rm briefings/errors/agentic-kb-scout-run-2026-08-31-2321.md
```

Do **not** remove or modify `wiki/daily-systems/logs/2026-08-31.md` blindly; it may be legitimate output from another workflow.

## Safest next action for Jay

Review `wiki/daily-systems/logs/2026-08-31.md`. Commit it, move it to an allowed/appropriate path, or explicitly allow Scout to ignore that path in the playbook if it is expected scheduled-job output. Then rerun Agentic-KB Scout.
