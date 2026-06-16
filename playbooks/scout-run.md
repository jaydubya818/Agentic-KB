# Scout Run

Schedule: daily late evening.

## Job
Use `/Users/jaywest/Agentic-KB/raw/reading-list.md` as the URL queue. For each unchecked URL:

1. Fetch the page text using available web/browser tools.
2. Save the full extracted source, not a summary, into the most appropriate `raw/` subfolder:
   - agent/framework docs → `raw/framework-docs/{slug}.md`
   - articles or essays → `raw/framework-docs/{slug}.md` unless a better existing raw folder fits
   - transcripts → `raw/transcripts/{slug}.md`
   - code examples → `raw/code-examples/{slug}.md`
3. Add frontmatter: `title`, `source_url`, `captured`, `captured_by`, `word_count`, `status: unprocessed`.
4. Record processed URL and destination path in `.night-shift/state/scout-processed.json`.
5. Write a brief report to `briefings/scout-YYYY-MM-DD.md`.

## Rules
- Preserve source text. Do not summarize in raw files.
- Do not edit or delete prior raw files.
- Do not remove URLs from `raw/reading-list.md`; state tracking lives in `.night-shift/state/`.
- If a page fails, log `[UNREACHABLE]` in the scout briefing and continue.
- If the page is paywalled or requires private browser state, skip and brief Jay.
