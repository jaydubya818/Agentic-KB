---
id: 01KNNVX2QGN219VVFN0GD8BJHG
title: "LLM Wiki Pattern"
type: concept
tags: [knowledge-base, llm, architecture, obsidian, workflow]
created: 2025-01-01
updated: 2026-04-07
visibility: public
confidence: high
related: [pattern-llm-wiki, entities/andrej-karpathy, concepts/llm-wiki-pattern]
source: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
---

# LLM Wiki Pattern

Originated by Andrej Karpathy. A method for building and maintaining a personal or project knowledge base where LLMs do the maintenance work and humans retain editorial control.

## Definition

A three-layer architecture:

```
Raw Sources → Wiki (LLM-generated markdown) → Schema (CLAUDE.md / system prompt)
```

- **Raw Sources**: Immutable inputs — papers, articles, notes, transcripts. The LLM reads these but never writes to them.
- **Wiki**: Entirely LLM-owned structured markdown. Humans do not write wiki pages manually.
- **Schema**: A co-evolving system prompt (e.g. `CLAUDE.md`) that defines page structure, naming conventions, tag vocabulary, and compile behaviour. Evolves as you learn what works.

## Why It Matters

The pattern transfers tedious maintenance work — cross-references, consistency checks, updates, index management — to LLMs, while keeping intellectual work (curation, direction, analysis) with the human.

> "Left vague so that you can hack it and customize it to your own project." — Andrej Karpathy

At scale (~100 articles / ~400K words), no RAG pipeline is needed. The LLM can auto-maintain indexes and navigate the KB directly.

## Core Operations

| Operation | Description |
|---|---|
| **Ingest** | Process one raw source at a time; update 10–15 wiki pages per document |
| **Query** | Ask questions against the wiki; good answers get filed back as new pages |
| **Lint** | Health check — surface contradictions, orphan pages, stale claims, and knowledge gaps |

## Special Files

- **`index.md`** — Catalog organized by category with one-line summaries of every page
- **`log.md`** — Append-only chronological record of all compile operations, with parseable timestamps

## Implementation Notes

- Use **Obsidian** as the IDE/frontend — graph view reveals relationship clusters
- Enable local image downloads to avoid broken URLs over time
- **Git** provides version history for free — treat the wiki repo as a versioned artifact
- No RAG needed at the ~100-article scale; structured indexes suffice

## Example Use Cases (Community)

- Research wikis (papers, theses)
- Fiction writing (character and theme tracking)
- Enterprise knowledge management
- Personal second brains
- Semiconductor and domain analysis
- Trading strategy documentation
- YouTube channel organization

## See Also

- [LLM Wiki Pattern (patterns)](../patterns/pattern-llm-wiki.md)
- [LLM Wiki Pattern (concept variant)](../concepts/llm-wiki-pattern.md)
- [Andrej Karpathy (entity)](../entities/andrej-karpathy.md)
- [Context Management](../concepts/context-management.md)
- [Memory Systems](../concepts/memory-systems.md)
