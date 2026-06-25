# Agentic-KB Scout Run — BLOCKED

- **Job name:** Agentic-KB Scout Run
- **Job ID:** scheduled cron run; no explicit job ID available
- **Timestamp:** 2026-06-22 23:20:36 -0700
- **Phase/stage failed:** Pre-run dirty-worktree safety check
- **Status:** Blocked before fetching URLs or writing raw captures

## Blocked reason

`git status --porcelain` reported dirty files outside the Scout playbook's allowed write paths/exceptions.

Allowed Scout dirty/write paths are exactly:

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

Blocking dirty files outside that scope:

```text
 M playbooks/editor-run.md
 M playbooks/refinery-run.md
 M playbooks/scout-run.md
```

Full observed dirty status:

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
?? briefings/errors/agentic-kb-editor-run-2026-06-22-0626.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-18-0330.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-19-0327.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-20-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-21-0315.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-22-0315.md
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-1157.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-2310.md
?? briefings/errors/agentic-kb-scout-run-2026-06-19-2305.md
?? briefings/errors/agentic-kb-scout-run-2026-06-20-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-21-2305.md
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
- `raw/reading-list.md`
- `.night-shift/state/scout-processed.json`

## Files written or attempted

Written:

- `briefings/errors/agentic-kb-scout-run-2026-06-22-2320.md`

Not attempted because the run blocked before capture:

- No URL fetches
- No raw captures
- No state updates
- No normal `briefings/scout-2026-06-22.md` report

## Files that may need review

Review these dirty playbook files before the next unattended run:

- `playbooks/editor-run.md`
- `playbooks/refinery-run.md`
- `playbooks/scout-run.md`

Context: `raw/reading-list.md` still contains seven unchecked URLs, but `.night-shift/state/scout-processed.json` already records all seven as processed from 2026-06-18. I did not rely on that state for action because the worktree safety check blocks first.

## Rollback guidance

Do not roll back automatically from this job. Safest rollback path:

1. Inspect the three modified playbooks with `git diff -- playbooks/editor-run.md playbooks/refinery-run.md playbooks/scout-run.md`.
2. If the changes are intended, commit them or otherwise establish a clean baseline.
3. If they are unintended, revert only those playbook changes after confirming they are not active work.
4. Keep existing Scout raw captures and `.night-shift/state/scout-processed.json`; they appear to represent the prior successful Scout capture set and should not be deleted by this job.

## Safest next action for Jay

Resolve the dirty playbook files first. Once the playbook edits are either committed, reverted, or explicitly accepted, rerun Scout. With the current state file, Scout should likely produce a no-op/skip briefing rather than recapture the seven already-processed reading-list URLs.
