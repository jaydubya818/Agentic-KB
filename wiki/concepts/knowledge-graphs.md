---
id: 01KQ2YXH0CNXEZ4G6687W5GCDM
title: Knowledge Graphs
type: concept
tags: [knowledge-base, retrieval, rag, obsidian, agents]
created: 2024-01-01
updated: 2026-04-25
visibility: public
confidence: high
related: [ingest-pipeline, memory-systems, llm-wiki-compile-pipeline]
---

# Knowledge Graphs

## Definition

A knowledge graph is a structured representation of entities and the relationships between them, stored as nodes and edges. In the context of agentic systems, knowledge graphs serve as persistent, queryable memory that survives across sessions and can surface non-obvious connections between concepts.

Edges in a well-designed knowledge graph are typed by epistemic status:
- **EXTRACTED** — relationship explicitly stated in the source
- **INFERRED** — relationship implied by context; LLM-derived
- **AMBIGUOUS** — relationship present but unclear in provenance

This audit trail distinguishes knowledge graphs from raw vector stores: you know what was *found* vs what was *invented*.

## Why It Matters

LLMs have no persistent memory across sessions. A knowledge graph externalises relationships so they can be queried repeatedly without re-reading source documents. More importantly, **community detection** over a graph can surface cross-document connections that a user would never think to ask about directly — the "unknown unknowns" of a corpus.

Three capabilities a knowledge graph adds that an LLM alone cannot provide:
1. **Persistence** — relationships stored in `graph.json` survive across sessions
2. **Honest provenance** — every edge tagged EXTRACTED, INFERRED, or AMBIGUOUS
3. **Cross-document surprise** — clustering finds connections between concepts in different files

## Example

The `/graphify` skill implements this pattern end-to-end:

```
/graphify <path>          # extract graph from any folder of files
/graphify query "<q>"     # BFS traversal for broad context
/graphify path "A" "B"    # shortest path between two concepts
/graphify explain "Node"  # plain-language explanation
```

Inputs can be code, docs, papers, images, tweets, or screenshots. Outputs are:
- `graphify-out/graph.json` — GraphRAG-ready JSON
- `graphify-out/index.html` — interactive visualisation
- `GRAPH_REPORT.md` — plain-language audit report

This is built around Andrej Karpathy's `/raw` folder workflow: drop anything into a folder and get a structured graph that shows what you didn't know was connected.

## Traversal Strategies

| Mode | Use when |
|---|---|
| BFS (`--query`) | Broad context gathering around a topic |
| DFS (`--dfs`) | Tracing a specific reasoning path |
| Shortest path | Finding the link between two distant concepts |
| Community detection | Discovering clusters you didn't know to look for |

## Export Formats

Knowledge graphs can be exported to multiple targets depending on downstream use:
- **HTML** — interactive browser visualisation (default)
- **JSON** — GraphRAG-ready, agent-queryable
- **SVG** — embeds in Notion, GitHub
- **GraphML** — Gephi, yEd network analysis tools
- **Cypher/Neo4j** — graph database ingestion
- **MCP stdio server** — direct agent access

## Common Use Cases

- **Codebase onboarding** — understand architecture before touching anything
- **Reading list synthesis** — papers + tweets + notes → one navigable graph
- **Research corpus** — citation graph + concept graph combined
- **Personal `/raw` folder** — drop everything in, let it grow, query it

## Pitfalls

- **INFERRED edges without audit trails** — silently invented relationships erode trust in the graph over time; always tag edge provenance
- **One-shot extraction** — re-running extraction on changed files (`--update`) is essential for living corpora
- **Conflating graph queries with vector search** — graphs excel at relational/structural questions; RAG vector search excels at semantic similarity; combine both for best results

## See Also

- [Ingest Pipeline](ingest-pipeline.md) — how raw documents are processed before graph extraction
- [Memory Systems](memory-systems.md) — broader taxonomy of agent memory including graphs, vectors, and episodic stores
- [LLM Wiki Compile Pipeline](llm-wiki-compile-pipeline.md) — a related pattern using LLMs to maintain structured knowledge bases
- [RAG](../concepts/ingest-pipeline.md) — retrieval-augmented generation as a complement to graph traversal
