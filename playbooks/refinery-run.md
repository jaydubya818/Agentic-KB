# Refinery Run

Schedule: daily overnight heavy shift.

## Job
Process unhandled items from `raw/inbox/` plus raw files with `status: unprocessed`.

For each run:
1. Read `AGENTS.md`, `house-rules.md`, `playbooks/night-shift-map.md`, and this playbook.
2. Run the pre-run dirty-worktree check below before making changes.
3. Process at most 10 sources unless Jay explicitly asks for bulk mode.

For each item:
1. Compute a content hash and check `.night-shift/state/refinery-processed.json`; skip unchanged sources already processed.
2. Read the raw capture/source in full.
3. Create or update `wiki/summaries/{source-slug}.md` with source-grounded key points and source references back to raw/source material.
4. Extract reusable concepts, patterns, frameworks, recipes, evaluations, and Jay-specific personal lessons.
5. Search existing `wiki/` pages before creating new pages.
6. Update the right existing pages or create new pages using the schemas in `AGENTS.md`.
7. Add backlinks from `wiki/index.md` and at least one relevant existing page.
8. Flag contradictions with `[FRICTION]` blocks and append to `wiki/log.md`.
9. Record processed hash/state and write `briefings/refinery-YYYY-MM-DD.md`.

## Pre-run dirty-worktree check
Before making changes, run:

```bash
git status --porcelain
```

Expected write paths for Refinery:
- `.night-shift/state/`
- `briefings/`
- `wiki/summaries/`
- `wiki/concepts/`
- `wiki/patterns/`
- `wiki/frameworks/`
- `wiki/recipes/`
- `wiki/evaluations/`
- `wiki/personal/`
- `wiki/index.md`
- `wiki/log.md`

Known noisy log and intake exceptions:
- Ignore exactly these runtime logs when evaluating dirty-worktree safety:
  - `logs/web-server-error.log`
  - `logs/web-server.log`
  - `logs/audit.log`
  - `logs/kb-dev-server.log`
- Ignore exactly `raw/reading-list.md` as the human/agent-maintained Scout intake queue.
- Do not ignore `logs/` or `raw/` broadly.
- Any other dirty file outside expected write paths must still block the job.

If the worktree has dirty files outside those expected write paths, stop before making changes and write a blocked/error briefing to `briefings/errors/agentic-kb-refinery-run-YYYY-MM-DD-HHMM.md`.

## Error briefing rule
If the job fails, blocks, or exits early before completing `briefings/refinery-YYYY-MM-DD.md`, write an error briefing to:

`briefings/errors/agentic-kb-refinery-run-YYYY-MM-DD-HHMM.md`

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

## Hard rules
- Obey the Prime Directive in `house-rules.md`.
- Never modify raw originals during scheduled runs.
- Never move, edit, delete, archive, mark ingested, truncate, or overwrite files under `raw/`.
- Use `.night-shift/state/` for processing state instead of modifying raw files.
- Never delete wiki pages.
- Do not invent sources or claims.
- If a merge is ambiguous, create a briefing item instead of forcing the update.
- Keep each run bounded: process at most 10 sources unless Jay explicitly asks for bulk mode.
