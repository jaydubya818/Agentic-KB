---
title: LLM-Maintained Wiki
type: pattern
tags: [knowledge-base, architecture, llm-wiki, karpathy]
confidence: high
sources:
  - "[[summaries/karpathy-llm-wiki-gist]]"
created: 2026-04-07
updated: 2026-04-07
related:
  - "[[concepts/memory-systems]]"
  - "[[concepts/context-management]]"
  - "[[concepts/task-decomposition]]"
status: stable
---

# LLM-Maintained Wiki

## Intent
Delegate the maintenance of a structured knowledge base entirely to LLMs, while humans retain control over curation, direction, and raw source ingestion.

## Problem
Manually maintaining a cross-referenced, internally consistent knowledge base is tedious and doesn't scale. Human-written wikis drift: links rot, contradictions accumulate, and updates lag behind new sources.

## Solution
Split responsibility by a hard boundary:

```
Raw Sources (human-curated, immutable)
        ↓  [LLM reads]
      Wiki (LLM-owned, never manually edited)
        ↑  [governed by]
    Schema / CLAUDE.md (co-evolves with project)
```

The LLM processes raw sources via defined workflows (Ingest, Query, Lint) and produces structured markdown pages. Humans feed in new sources and issue queries — they never write wiki content directly.

## Structure
- **`raw/`** — Immutable input files (papers, transcripts, docs, code). LLM reads only.
- **`wiki/`** — LLM-owned output. Organized by type: concepts, patterns, summaries, syntheses, recipes, evaluations, personal.
- **`wiki/index.md`** — Master catalog, LLM-maintained, always current.
- **`wiki/log.md`** — Append-only operation log with parseable timestamps.
- **`CLAUDE.md`** (or equivalent schema file) — Defines structure, workflows, naming conventions, and frontmatter schemas.

## Core Workflows

### INGEST
Process one raw source at a time. For each source, create or update 10–15 wiki pages: a summary page (1:1 with the source), concept/pattern pages for new ideas, and update index + log.

### QUERY
Ask the LLM a question against the wiki. If the answer is good, file it back as a new synthesis or concept page — compounding the knowledge base.

### LINT
Periodic health check. The LLM scans for: contradictions between pages, orphaned pages with no inbound links, stale claims that conflict with newer sources, and gaps where coverage is thin.

## When to Use
- Building a personal or team knowledge base over a sustained period.
- When sources accumulate faster than manual summarization can keep up.
- When cross-referencing and consistency are high-value but low-creativity tasks.
- Up to ~100 articles / ~400K words before RAG becomes necessary.

## When Not to Use
- When the source corpus is static and small (a simple README suffices).
- When real-time retrieval over millions of documents is required (use RAG instead).
- When human editorial voice must be preserved throughout (LLM ownership conflicts with this).

## Implementation Notes
- Obsidian works well as a frontend: graph view, backlinks, and local file storage align with the pattern.
- Git on the wiki directory provides version history for free.
- The schema file should be intentionally minimal at first and co-evolve as you discover what works.
- Frontmatter should be consistent across page types to enable programmatic queries.

## Known Variants
- **Research wiki** — Ingests academic papers; produces concept, synthesis, and evaluation pages.
- **Fiction bible** — Ingests story drafts; maintains character, theme, and world-building pages.
- **Agentic engineering KB** — This KB. Ingests framework docs, transcripts, and personal patterns.

## Origin
Originated by Andrej Karpathy. See [[summaries/karpathy-llm-wiki-gist]].