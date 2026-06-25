# Agentic-KB Scout Run — Blocked

- **Job name:** agentic-kb-scout-run
- **Job ID:** scheduled cron job; no explicit job ID available
- **Timestamp:** 2026-06-21T23:05:47-0700
- **Phase/stage failed:** pre-run dirty-worktree safety check, before reading the URL queue or writing raw captures

## Blocked reason

Scout must stop before making changes when `git status --porcelain` shows dirty files outside the Scout allowlist.

Allowed Scout write paths/exceptions are exactly:

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

The worktree has dirty files outside that allowlist:

```text
 M playbooks/editor-run.md
 M playbooks/refinery-run.md
 M playbooks/scout-run.md
```

Full pre-run status observed:

```text
 M .night-shift/state/audit-state.json
 M .night-shift/state/editor-state.json
 M logs/audit.log
 M logs/kb-dev-server.log
 M playbooks/editor-run.md
 M playbooks/refinery-run.md
 M playbooks/scout-run.md
 M raw/reading-list.md
?? .night-shift/state/refinery-processed.json
?? .night-shift/state/scout-processed.json
?? briefings/2026-06-16.md
?? briefings/errors/agentic-kb-audit-run-2026-06-21-2205.md
?? briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-18-0649.md
?? briefings/errors/agentic-kb-editor-run-2026-06-20-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-21-0626.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-18-0330.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-19-0327.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-20-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-21-0315.md
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-1157.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-2310.md
?? briefings/errors/agentic-kb-scout-run-2026-06-19-2305.md
?? briefings/errors/agentic-kb-scout-run-2026-06-20-2306.md
?? briefings/refinery-2026-06-16.md
?? briefings/scout-2026-06-15.md
?? briefings/scout-2026-06-18.md
?? raw/framework-docs/ar9av-obsidian-wiki.md
?? raw/framework-docs/chopratejas-headroom.md
?? raw/framework-docs/langchain-ai-rag-from-scratch.md
?? raw/framework-docs/mgechev-skills-best-practices.md
?? raw/framework-docs/microsoft-skillopt.md
?? raw/framework-docs/rohitg00-ai-engineering-from-scratch.md
?? raw/framework-docs/x-twitter-2066530299467706495.md
```

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/scout-run.md`

## Files written or attempted

- Written: `briefings/errors/agentic-kb-scout-run-2026-06-21-2305.md`
- Attempted raw captures: none
- Attempted state updates: none
- Attempted Scout daily briefing: none

## Files that may need review

These dirty files are outside Scout's allowed write paths and should be reviewed before the next unattended Scout run:

- `playbooks/editor-run.md`
- `playbooks/refinery-run.md`
- `playbooks/scout-run.md`

There are also many untracked prior briefings and raw captures. Those are within Scout/other Night Shift expected paths, but they should eventually be committed or intentionally left untracked as part of the vault's operating model.

## Rollback guidance

No raw source files, queue entries, or Scout state files were changed by this run. The only change from this run is this error briefing. If needed, remove only:

```bash
rm briefings/errors/agentic-kb-scout-run-2026-06-21-2305.md
```

Do not clean or reset the dirty playbooks automatically; they may contain intentional local edits.

## Safest next action for Jay

Review the three modified playbooks and either commit/stash them or explicitly authorize Scout to ignore those specific playbook changes. Until then, the safe behavior is to keep blocking scheduled Scout runs rather than ingesting new URLs against a potentially changed playbook contract.
