# Wikiwise — fetch-readwise-highlights/SKILL.md

Source: https://github.com/TristanH/wikiwise/blob/main/Sources/Wikiwise/Resources/scaffold/skills/fetch-readwise-highlights/SKILL.md
Retrieved: 2026-04-12

---

## Purpose
Retrieve thematically relevant highlights from Readwise and group them for ingestion.

## Protocol
1. **Confirm query set with user** before searching — never silently decide what to search for
2. Vector search highlights using relevance queries
3. Merge and dedup results across documents
4. Group results by parent document
5. Write grouped output to `raw/readwise/<topic>_highlights.md`

## Output format
```markdown
# Highlights: <topic>

## <Document Title> (<doc_id>)
- "<highlight text>" — p. <location>
- "<highlight text>" — p. <location>

## <Document Title 2> (<doc_id>)
...
```

## Why confirm first
The user's highlight library may have thousands of entries. Running a broad query wastes compute and produces noise. Get the specific angle the user wants before searching.

## After fetch
Run INGEST on the highlights file — highlights are raw source material, not wiki content.
