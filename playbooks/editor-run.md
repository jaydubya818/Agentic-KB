# Editor Run

Schedule: daily early morning after Refinery Run.

## Job
Turn last night's wiki changes into usable synthesis.

1. Read `AGENTS.md`, `house-rules.md`, `playbooks/night-shift-map.md`, this playbook, and recent `wiki/log.md` entries.
2. Run the pre-run dirty-worktree check below before making changes.
3. Read `.night-shift/state/editor-state.json` and use it for idempotency.
4. Identify wiki pages created or changed in the last 24 hours.
5. For clusters of related changes, update existing `wiki/syntheses/` pages or create a new synthesis page only when a real cross-source thread formed.
6. Keep synthesis source-grounded; cite wiki summaries or raw source paths.
7. Update `.night-shift/state/editor-state.json` with: last run timestamp, files considered, outputs written, status, and briefing path.
8. Write `briefings/YYYY-MM-DD.md`.

## Pre-run dirty-worktree check
Before making changes, run:

```bash
git status --porcelain
```

Expected write paths for Editor:
- `.night-shift/state/`
- `briefings/`
- `wiki/syntheses/`

Known noisy log exception:
- Ignore exactly `logs/web-server-error.log` and `logs/web-server.log` when evaluating dirty-worktree safety.
- Do not ignore `logs/` broadly.
- Any other dirty file outside expected write paths must still block the job.

If the worktree has dirty files outside those expected write paths, stop before making changes and write a blocked/error briefing to `briefings/errors/agentic-kb-editor-run-YYYY-MM-DD-HHMM.md`.

## Error briefing rule
If the job fails, blocks, or exits early before completing `briefings/YYYY-MM-DD.md`, write an error briefing to:

`briefings/errors/agentic-kb-editor-run-YYYY-MM-DD-HHMM.md`

The error briefing must include:
- job name
- job ID if available
- timestamp
- phase/stage where it failed
- error or blocked reason
- files read
- files written or attempted
- files that may need review
- rollback guidance
- safest next action for Jay

## Briefing format
### What Came In
Counts: sources pulled, raw inbox items processed, summaries made, wiki pages created/updated.

### Contradictions Jay Should Resolve
Every `[FRICTION]` raised in the last 24 hours, linked.

### Threads That Grew
Synthesis pages updated or created.

### One Thing Worth Jay's Attention Today
A single high-leverage insight, uncertainty, or decision.

## Rules
- Do not rewrite stable synthesis pages wholesale; make targeted edits.
- Do not create a synthesis page for a single isolated source.
- Do not modify raw files.
- If nothing changed, write a short no-op briefing and update `.night-shift/state/editor-state.json`.
