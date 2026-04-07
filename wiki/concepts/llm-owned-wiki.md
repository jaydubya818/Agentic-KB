---
title: LLM-Owned Wiki Pattern
type: concept
tags: [agentic, knowledge-base, architecture, karpathy]
confidence: high
sources:
  - "[[summaries/karpathy-llm-wiki-gist]]"
created: 2026-04-07
updated: 2026-04-07
related:
  - "[[concepts/memory-systems]]"
  - "[[concepts/context-management]]"
  - "[[concepts/self-critique]]"
status: stable
---

# LLM-Owned Wiki Pattern

## Definition
A knowledge management architecture where an LLM is the sole author and maintainer of a structured wiki, while humans retain ownership of raw source material and schema decisions. Coined and popularized by Andrej Karpathy.

## Core Invariants
1. **Raw sources are immutable** — humans add files; LLM never modifies them.
2. **Wiki is LLM-written** — humans never manually edit wiki pages.
3. **Schema is human-owned** — the CLAUDE.md (or equivalent) defines structure and workflows; humans update it as conventions evolve.

## Three Operations

### INGEST
Triggered when a new raw source is added. The LLM processes the source and creates or updates 10–15 wiki pages: a summary page, updated concept/pattern pages, an index entry, and a log entry.

### QUERY
A question is posed; the LLM answers using the wiki as context. High-value answers are filed back into the wiki as new pages or updates, compounding knowledge over time.

### LINT
A periodic health check. The LLM scans the wiki for:
- Contradictions between pages
- Orphaned pages (no inbound links)
- Stale claims (superseded by newer sources)
- Coverage gaps worth filling

## Why It Works
- **Division of labor**: LLMs handle maintenance; humans handle curation and judgment.
- **Compounding**: Every ingest and query makes the wiki denser and more useful.
- **No RAG needed at scale**: At ~100 pages / 400K words, a long-context LLM can hold the full wiki in context.
- **Auditability**: The log.md and git history give a full record of what changed and why.

## Implementation Notes
- Obsidian is the recommended frontend (wikilinks, graph view, local image caching).
- Git provides version control for free.
- Schema should be intentionally minimal at first — add conventions only when you feel the pain of not having them.

## Relationship to Agentic Patterns
The LLM-owned wiki is itself an agentic system: the INGEST workflow is a fan-out pattern (one source → many pages), LINT is a reflection/self-critique loop, and QUERY with filing is a retrieval-augmented generation loop with memory write-back.

## Source
- [[summaries/karpathy-llm-wiki-gist]]