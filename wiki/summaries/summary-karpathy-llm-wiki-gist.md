---
title: Karpathy LLM Wiki Pattern — Gist
type: summary
source_file: raw/framework-docs/karpathy-llm-wiki-gist.md
author: Andrej Karpathy
date_ingested: 2026-04-04
tags: [llm-wiki, karpathy, knowledge-base, architecture, schema, obsidian]
key_concepts: [three-layer-architecture, ingest-query-lint, index-md, log-md, git-version-history, intentional-vagueness]
confidence: high
---

# Karpathy LLM Wiki Pattern — Gist

## Key Purpose

The original source document for the LLM wiki pattern. Describes the architecture, operations, special files, and why it works. Intentionally left vague for customization.

## Core Architecture

```
Raw Sources (immutable) → Wiki (LLM-generated markdown) → Schema (CLAUDE.md)
```

**Three principles:**
1. Raw sources are immutable — LLM reads, never writes
2. Wiki is entirely LLM-owned — you never write it manually
3. Schema co-evolves with you as you learn what works

## Operations

| Operation | Description |
|-----------|-------------|
| **Ingest** | Process new sources one at a time; update 10–15 wiki pages per document |
| **Query** | Ask questions; good answers get filed back as new pages |
| **Lint** | Health check — contradictions, orphans, stale claims, gap identification |

## Special Files

- **index.md** — Catalog organized by category with one-line summaries
- **log.md** — Append-only chronological record with parseable timestamps

## Why It Works

The pattern transfers tedious maintenance (cross-references, consistency, updates) to LLMs while keeping intellectual work (curation, analysis, direction) with humans.

## Implementation Notes from Karpathy

- Use Obsidian as IDE/frontend
- Enable local image downloads to avoid broken URLs
- Graph view shows relationship clusters
- Git provides version history for free
- At ~100 articles / 400K words, no RAG needed — LLM auto-maintains indexes

## Community Implementations

Research wikis, fiction writing (character/theme tracking), enterprise knowledge management, personal second brains, semiconductor analysis, trading strategies, YouTube channel organization.

## Intentional Vagueness

"Left vague so that you can hack it and customize it to your own project." — Andrej Karpathy

This is the founding document for the pattern that Jay's Agentic-KB is built on. The schema (CLAUDE.md in this vault) is a heavily expanded version of the minimal pattern Karpathy described.

## Related Concepts

- [[wiki/summaries/summary-karpathy-llm-wiki-video]]
- [[wiki/summaries/summary-nate-herk-llm-wiki]]

## Sources

- `raw/framework-docs/karpathy-llm-wiki-gist.md`
