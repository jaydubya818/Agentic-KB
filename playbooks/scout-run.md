# Scout Run

Schedule: daily late evening.

## Job
Use `/Users/jaywest/Agentic-KB/raw/reading-list.md` as the URL queue. For each unchecked URL:

1. Read `AGENTS.md`, `house-rules.md`, `playbooks/night-shift-map.md`, and this playbook.
2. Run the pre-run dirty-worktree check below before making changes.
3. Fetch the page text using available web/browser tools.
4. Save the full extracted source, not a summary, into the most appropriate `raw/` subfolder:
   - agent/framework docs → `raw/framework-docs/{slug}.md`
   - articles or essays → `raw/framework-docs/{slug}.md` unless a better existing raw folder fits
   - transcripts → `raw/transcripts/{slug}.md`
   - code examples → `raw/code-examples/{slug}.md`
5. Add frontmatter: `title`, `source_url`, `captured`, `captured_by`, `word_count`, `status: unprocessed`.
6. Record processed URL and destination path in `.night-shift/state/scout-processed.json`.
7. Write a brief report to `briefings/scout-YYYY-MM-DD.md`.

## Pre-run dirty-worktree check
Before making changes, run:

```bash
git status --porcelain
```

Expected write paths for Scout:
- `.night-shift/state/`
- `briefings/`
- `raw/framework-docs/`
- `raw/transcripts/`
- `raw/code-examples/`

Known noisy log exception:
- Ignore exactly `logs/web-server-error.log` and `logs/web-server.log` when evaluating dirty-worktree safety.
- Do not ignore `logs/` broadly.
- Any other dirty file outside expected write paths must still block the job.

If the worktree has dirty files outside those expected write paths, stop before making changes and write a blocked/error briefing to `briefings/errors/agentic-kb-scout-run-YYYY-MM-DD-HHMM.md`.

## Raw overwrite protection
Before writing any raw capture, check whether the destination path already exists.

If the path exists:
- never overwrite it
- never truncate it
- create a collision-safe filename using either `{slug}-{hash8}.md` or `{slug}-{YYYYMMDD-HHMMSS}.md`

Scout must never edit, delete, move, truncate, or overwrite existing files under `raw/`.

## Error briefing rule
If the job fails, blocks, or exits early before completing `briefings/scout-YYYY-MM-DD.md`, write an error briefing to:

`briefings/errors/agentic-kb-scout-run-YYYY-MM-DD-HHMM.md`

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

## Rules
- Preserve source text. Do not summarize in raw files.
- Do not edit or delete prior raw files.
- Do not remove URLs from `raw/reading-list.md`; state tracking lives in `.night-shift/state/`.
- If a page fails, log `[UNREACHABLE]` in the scout briefing and continue.
- If the page is paywalled or requires private browser state, skip and brief Jay.
