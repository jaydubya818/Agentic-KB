---
id: 01KQ2XBP9QM0Z8SEHSDQF0R4W9
title: "Ingest Pipeline"
type: concept
tags: [knowledge-base, workflow, automation, rag, agents]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [llm-wiki-compile-pipeline, fetch-readwise-highlights, llm-wiki-pattern]
---

# Ingest Pipeline

## Definition

The ingest pipeline is the stage of the Wikiwise workflow that converts raw source material into structured wiki content. It is the downstream complement to skills like [fetch-readwise-highlights](../patterns/fetch-readwise-highlights.md) that produce raw source files — those files are inputs *to* the ingest pipeline, not finished wiki pages.

The distinction is deliberate:

> Highlights are raw source material, not wiki content.

Raw material (fetched highlights, article dumps, notes) must pass through the INGEST skill to be compiled, structured, and cross-referenced before landing in the wiki.

## Why It Matters

Keeping the fetch and ingest stages separate enforces a clean data flow:

1. **Fetch** — gather relevant source material, scoped and confirmed by the user
2. **Ingest** — compile raw material into wiki pages following the schema, applying structure, tags, cross-references, and frontmatter

This separation means raw files can be reviewed, edited, or discarded before they influence the knowledge base. It also makes the pipeline auditable: the `raw/` directory is a staging area, not the wiki itself.

## Pipeline Flow

```
User query
    │
    ▼
fetch-readwise-highlights
    │  (vector search → dedup → group)
    ▼
raw/readwise/<topic>_highlights.md
    │
    ▼
INGEST skill
    │  (compile → structure → frontmatter → cross-reference)
    ▼
wiki/<section>/<page>.md
```

## File Path Convention

Raw source files produced by the fetch skill follow the naming convention:

```
raw/readwise/<topic>_highlights.md
```

This scopes all staging material under `raw/` and namespaces by source type, making it easy to identify what has and hasn't been ingested.

## Key Rules

- Never treat a raw file as finished wiki content — always run INGEST
- INGEST should apply the full wiki schema (frontmatter, section placement, cross-references)
- The `raw/` directory is ephemeral staging; the `wiki/` directory is the canonical knowledge base

## See Also

- [fetch-readwise-highlights](../patterns/fetch-readwise-highlights.md) — the upstream skill that produces raw highlight files
- [LLM Wiki Compile Pipeline](../concepts/llm-wiki-compile-pipeline.md) — broader compilation pipeline
- [LLM Wiki Pattern](../concepts/llm-wiki-pattern.md)
