# Wikiwise — import-readwise/SKILL.md

Source: https://github.com/TristanH/wikiwise/blob/main/Sources/Wikiwise/Resources/scaffold/skills/import-readwise/SKILL.md
Retrieved: 2026-04-12

---

## Purpose
Import highlights and documents from Readwise into the KB as raw sources, then run ingest on them.

## Tool
Uses `@readwise/cli` npm package.

## Protocol
1. Batch 3-5 sources before starting to ingest (don't ingest one at a time — batch for efficiency)
2. Update home.md immediately after identifying sources — show user what's incoming
3. Run parallel subagent ingest: one subagent per source
4. Each subagent runs the full ingest workflow on its source

## Key Constraint
Never call `reader-get-document-details` without piping to `| jq -r '.content' > file`.
Body content must stream to disk — never load the full document body into context.
Use `--document-id` flag, NOT `--id`.

## Fetch pattern for highlights
- Vector search highlights for relevance
- Merge/dedup across documents  
- Group by parent document
- Write output to `*_highlights.md`
- Confirm query set with user before searching

## Integration
After importing, sources land in `raw/readwise/` and get processed through INGEST workflow.
