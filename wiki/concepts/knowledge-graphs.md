---
id: 01KQ2WTMD6BMFKY4GHRB2X5XRG
title: "Knowledge Graphs"
type: concept
tags: [knowledge-base, knowledge-graph, semantic-search, architecture]
created: 2026-04-08
updated: 2026-04-08
visibility: public
confidence: high
related: [vault-architecture, llm-wiki-compile-pipeline, memory-systems]
source: architecture/2026-04-07-omm-overall-architecture-vault.md
---

# Knowledge Graphs

## Definition

A **knowledge graph** is a structured representation of entities and the relationships between them. In this KB, the knowledge graph is stored at `graphify-out/graph.json` and is produced by running `graphify` over the compiled pages in `wiki/`.

The current graph contains **222 nodes**, **299 links**, and **12 hyperedges**.

## Why It Matters

The knowledge graph is what transforms a flat collection of wiki pages into a semantically queryable network. It enables:

- **Semantic search**: Queries can traverse entity relationships rather than relying on keyword matching
- **Discoverability**: Related concepts surface even when not explicitly linked in page text
- **Structural reasoning**: Hyperedges capture n-ary relationships that binary links cannot express

## How It Fits in the Vault

The knowledge graph sits downstream of the [compile pipeline](llm-wiki-compile-pipeline.md) in the [Vault](vault-architecture.md):

```
wiki/ ──graphify──▶ graphify-out/graph.json ──enables──▶ semantic search
```

`graphify` is the process (or tool) that reads compiled wiki pages and extracts nodes, links, and hyperedges into `graph.json`. The graph is refreshed whenever new pages are compiled.

## Example

A query for "agent memory" can traverse the graph from the `memory-systems` node through its relationships to find `context-management`, `retrieval`, and `rag` nodes — surfacing relevant pages even if they don't contain the exact phrase.

## See Also

- [Vault Architecture](vault-architecture.md) — how `graph.json` fits into the overall on-disk structure
- [LLM Wiki Compile Pipeline](llm-wiki-compile-pipeline.md) — the upstream process that produces content for graphification
- [Memory Systems](memory-systems.md) — a concept domain well-represented in the knowledge graph
