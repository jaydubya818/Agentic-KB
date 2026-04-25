---
id: 01KQ2XDQJFCA324SF9BWSBQGTW
title: "Import-Readwise Skill"
type: pattern
tags: [knowledge-base, workflow, automation, retrieval, mcp]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: https://github.com/TristanH/wikiwise/blob/main/Sources/Wikiwise/Resources/scaffold/skills/import-readwise/SKILL.md
related: [pattern-parallel-subagent-ingest, concepts/ingest-pipeline, concepts/context-management]
---

# Import-Readwise Skill

A Wikiwise skill that imports highlights and documents from [Readwise](https://readwise.io) into the KB as raw sources, then triggers the downstream [INGEST workflow](../concepts/ingest-pipeline.md).

## When to Use

- You want to pull saved highlights or full documents from Readwise into the KB
- You have 1 or more new Readwise sources to process and want them compiled into wiki pages
- You are running a batch ingestion session to keep the KB up to date with reading activity

## Structure

1. **Identify sources** — query Readwise via `@readwise/cli` to find documents/highlights to import
2. **Update `home.md`** — immediately after identifying sources, update `home.md` to show the user what is incoming (do not wait until after ingestion)
3. **Batch sources** — group 3–5 sources before beginning ingestion; never ingest one source at a time
4. **Run parallel subagent ingest** — spawn one subagent per source; each subagent runs the full INGEST workflow on its source independently
5. **Sources land in `raw/readwise/`** — imported files are written here before downstream processing

## Example

```bash
# Fetch full document content safely — always pipe to jq and stream to disk
npx @readwise/cli reader-get-document-details --document-id <id> | jq -r '.content' > raw/readwise/my-article.md
```

After all sources are written to `raw/readwise/`, parallel subagents are launched — one per file — each executing the full ingest workflow.

## Highlight Fetch Pattern

When importing highlights (rather than full documents):

1. **Vector search** highlights by relevance to a query
2. **Merge and deduplicate** across documents
3. **Group by parent document**
4. **Write output** to `*_highlights.md` files in `raw/readwise/`
5. **Confirm query set with user** before executing the search — do not run highlight queries unilaterally

## Key Constraints

> ⚠️ **Never** call `reader-get-document-details` without piping output to `| jq -r '.content' > file`. The full document body must stream to disk — loading it into context will blow the [context window](../concepts/context-management.md).

> ⚠️ Use the `--document-id` flag, **not** `--id`, when calling `reader-get-document-details`.

## Trade-offs

| Concern | Detail |
|---|---|
| Efficiency | Batching 3–5 sources amortises subagent spin-up cost |
| Context safety | Streaming to disk prevents large document bodies from filling context |
| Parallelism | One subagent per source maximises throughput but increases concurrency overhead |
| User visibility | Updating `home.md` early keeps the user informed without blocking ingestion |

## ⚠️ Contradictions

- The batching rule specifies 3–5 sources, but the document does not address what to do when fewer than 3 sources are available. The rule may be intended as a soft guideline for efficiency rather than a hard minimum. Flagged for clarification.

## Related Patterns

- [Parallel Subagent Ingest](./pattern-parallel-subagent-ingest.md)
- [Ingest Pipeline](../concepts/ingest-pipeline.md)
- [Context Management](../concepts/context-management.md)
- [LLM-Owned Wiki](../concepts/llm-owned-wiki.md)

## See Also

- [Ingest Pipeline concept](../concepts/ingest-pipeline.md)
- [Context Management](../concepts/context-management.md)
- [LLM Wiki Compile Pipeline](../concepts/llm-wiki-compile-pipeline.md)
