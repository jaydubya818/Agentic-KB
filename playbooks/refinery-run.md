# Refinery Run

Schedule: daily overnight heavy shift.

## Job
Process unhandled items from `raw/inbox/` plus raw files with `status: unprocessed`.

For each item:
1. Read `AGENTS.md` and `house-rules.md`.
2. Compute a content hash and check `.night-shift/state/refinery-processed.json`; skip unchanged sources already processed.
3. Read the raw capture/source in full.
4. Create or update `wiki/summaries/{source-slug}.md` with source-grounded key points.
5. Extract reusable concepts, patterns, frameworks, recipes, evaluations, and Jay-specific personal lessons.
6. Search existing `wiki/` pages before creating new pages.
7. Update the right existing pages or create new pages using the schemas in `AGENTS.md`.
8. Add backlinks from `wiki/index.md` and at least one relevant existing page.
9. Flag contradictions with `[FRICTION]` blocks and append to `wiki/log.md`.
10. Record processed hash/state and write `briefings/refinery-YYYY-MM-DD.md`.

## Hard rules
- Obey the Prime Directive in `house-rules.md`.
- Never modify raw originals during scheduled runs.
- Never delete wiki pages.
- Do not invent sources or claims.
- If a merge is ambiguous, create a briefing item instead of forcing the update.
- Keep each run bounded: process at most 10 sources unless Jay explicitly asks for bulk mode.
