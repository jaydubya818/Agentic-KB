---
id: 01KQ2XBP9M3G2E28ZG92S4BHKJ
title: "fetch-readwise-highlights"
type: pattern
tags: [knowledge-base, retrieval, rag, workflow, automation]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: https://github.com/TristanH/wikiwise/blob/main/Sources/Wikiwise/Resources/scaffold/skills/fetch-readwise-highlights/SKILL.md
related: [ingest-pipeline, human-in-the-loop, llm-wiki-compile-pipeline]
---

# fetch-readwise-highlights

A Wikiwise skill for retrieving thematically relevant highlights from a Readwise library, deduplicating and grouping them by source document, and writing the result to a raw markdown file ready for ingestion.

## When to Use

Use this skill when you want to seed wiki content from your Readwise highlight library on a specific topic. It is the first stage of a two-step pipeline: fetch first, then run [INGEST](../concepts/ingest-pipeline.md) on the output file to compile highlights into actual wiki content.

Do **not** use this skill to dump broad or undirected swaths of your library — the protocol requires a scoped, user-confirmed query set.

## Structure

1. **Confirm query set with user** — present proposed search queries and get explicit approval before executing any search. Never silently decide what to search for.
2. **Vector search** — run semantic similarity queries against the Readwise highlight library to find thematically relevant results.
3. **Merge and deduplicate** — collapse duplicate highlights that appear across multiple documents in the result set.
4. **Group by parent document** — re-organise deduplicated results under their source document title and `doc_id`.
5. **Write to file** — save the grouped output to `raw/readwise/<topic>_highlights.md`.
6. **Trigger INGEST** — hand the output file off to the INGEST skill; highlights are raw source material, not finished wiki content.

## Example

### Output format

```markdown
# Highlights: <topic>

## <Document Title> (<doc_id>)
- "<highlight text>" — p. <location>
- "<highlight text>" — p. <location>

## <Document Title 2> (<doc_id>)
- "<highlight text>" — p. <location>
```

The file is written to `raw/readwise/<topic>_highlights.md` and becomes the input to the INGEST skill.

## Trade-offs

| Consideration | Notes |
|---|---|
| **Scoped vs. broad queries** | Narrow, user-confirmed queries produce higher signal; broad queries waste compute and introduce noise across a library that may contain thousands of entries. |
| **Vector search recall** | Semantic search will surface conceptually related highlights even when keywords differ, but may miss highly specific technical terms without exact-match fallback. |
| **Deduplication cost** | Merging results across documents adds a step but is essential — the same highlight can appear in multiple search results if a source is indexed under more than one document. |
| **Human gate** | The mandatory confirmation step slows the loop but prevents the agent from autonomously deciding what knowledge is relevant — a meaningful [human-in-the-loop](../concepts/human-in-the-loop.md) control. |

## Related Patterns

- [INGEST Pipeline](../concepts/ingest-pipeline.md) — downstream skill that converts the raw highlights file into structured wiki pages
- [LLM Wiki Compile Pipeline](../concepts/llm-wiki-compile-pipeline.md) — broader pipeline context in which this skill operates
- [Human-in-the-Loop](../concepts/human-in-the-loop.md) — design principle instantiated by the user confirmation step

## See Also

- [LLM-Owned Wiki](../concepts/llm-owned-wiki.md)
- [Context Management](../concepts/context-management.md)
