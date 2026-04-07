---
title: "Karpathy LLM Wiki Pattern — Gist"
type: summary
tags: [llm-wiki, karpathy, knowledge-base, architecture, schema]
source: raw/framework-docs/karpathy-llm-wiki-gist.md
source_url: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
author: Andrej Karpathy
date: 2026
created: 2026-04-07
updated: 2026-04-07
related:
  - "[[concepts/memory-systems]]"
  - "[[concepts/context-management]]"
  - "[[concepts/multi-agent-systems]]"
---

# Karpathy LLM Wiki Pattern — Gist

## One-Line Summary
Andrej Karpathy's minimal spec for an LLM-maintained knowledge base: immutable raw sources, LLM-owned wiki markdown, and a schema file (CLAUDE.md) that co-evolves with the user.

## Core Architecture

```
Raw Sources → Wiki (LLM-generated markdown) → Schema (CLAUDE.md)
```

Three-layer separation of concerns:
1. **Raw** — immutable inputs (papers, transcripts, docs). LLM reads only.
2. **Wiki** — LLM-owned markdown pages. Never edited manually.
3. **Schema** — CLAUDE.md defines structure, workflows, and conventions; evolves with the project.

## Key Principles
- Raw sources are immutable — LLM reads, never writes
- Wiki is entirely LLM-owned — humans never write it manually
- Schema co-evolves with the user as they learn what works
- Intentionally left vague to encourage customization

## Operations
| Operation | Description |
|-----------|-------------|
| **Ingest** | Process new sources one at a time; update 10–15 wiki pages per document |
| **Query** | Ask questions; good answers get filed back as new wiki pages |
| **Lint** | Health check — find contradictions, orphans, stale claims, and gaps |

## Special Files
- **index.md** — catalog organized by category with one-line summaries per page
- **log.md** — append-only chronological record with parseable timestamps

## Implementation Stack
- **Obsidian** as IDE/frontend (graph view, wikilinks, local image downloads)
- **Git** for version history
- At ~100 articles / ~400K words, no RAG needed — the LLM can auto-maintain indexes within context

## Why It Works
Transfers tedious maintenance (cross-references, consistency, updates) to LLMs while keeping intellectual work (curation, analysis, direction) with humans.

## Known Community Use Cases
- Research wikis (papers, theses)
- Fiction writing (character and theme tracking)
- Enterprise knowledge management
- Personal second brains
- Semiconductor analysis
- Trading strategies
- YouTube channel organization

## Relevance to This KB
This KB is a direct implementation of Karpathy's pattern. The vault structure, CLAUDE.md schema, INGEST/QUERY/LINT workflows, and the raw/wiki split all derive from this source.