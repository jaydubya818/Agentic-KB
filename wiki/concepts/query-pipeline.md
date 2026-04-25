---
id: 01KQ2WZ030SDGNW3C864HGGPNV
title: "Query Pipeline"
type: concept
tags: [retrieval, rag, architecture, knowledge-base, agents]
created: 2026-04-08
updated: 2026-04-08
visibility: public
confidence: high
source: architecture/2026-04-07-omm-query-pipeline.md
related: [ingest-pipeline, knowledge-graphs, llm-wiki-compile-pipeline, agent-observability]
---

# Query Pipeline

## Definition

The query pipeline is the end-to-end system that answers natural-language questions against the wiki knowledge base. It combines **hybrid retrieval** (keyword scanning + graph traversal), **temporal ranking**, and **Claude-powered synthesis** to return cited, streamed answers.

Every query is logged to `logs/audit.log`, and those logs feed back into future ranking — creating a lightweight reinforcement loop via hotness scoring.

## Pipeline Stages

```
User query
  → /api/query/
  → [Keyword scan (wiki/*.md)] + [Graph search (graph.json)]
  → Hybrid merge (dedupe by filePath)
  → ranking.ts (temporal decay × hotness score)
  → Top-K pages
  → Claude synthesis (with citations)
  → SSE answer stream
  → audit.log (op:query) -.feeds.-> ranking
```

### Stage Descriptions

| Stage | Description |
|---|---|
| **Keyword scan** | Full-text scan across `wiki/*.md` files for matching terms |
| **Graph search** | Traversal of `graph.json` to surface semantically related nodes |
| **Hybrid merge** | Deduplication of results by `filePath` across both retrieval strategies |
| **Ranking** | Scores results using temporal decay (recency) multiplied by hotness (query frequency) |
| **Top-K selection** | Filters to the highest-ranked pages passed to synthesis |
| **Claude synthesis** | Generates a cited answer grounded in the Top-K wiki pages |
| **SSE stream** | Answer is returned as a server-sent event stream for real-time display |
| **Audit log** | Each query is logged with file hits; this feeds hotness scoring in future ranking passes |

## Why It Matters

The feedback loop between audit logging and ranking is a key design feature — pages that are frequently surfaced in useful queries become more "hot" and are prioritised in future retrievals. This allows the system to self-tune retrieval quality over time without explicit human curation.

The hybrid retrieval strategy (keyword + graph) ensures both precision (exact term matches) and recall (related concepts reachable via graph edges).

## Example

1. User asks: *"How does hotness scoring work?"*
2. Keyword scan finds pages mentioning `hotness`, `scoring`, `ranking`
3. Graph search finds nodes connected to the `ranking` concept
4. Results are merged and deduplicated
5. Pages are ranked by `decay × hotness`; recently-queried pages score higher
6. Claude synthesises an answer citing the top 3–5 wiki pages
7. The query and its file hits are appended to `audit.log`

## Roadmap

P2 target: a 10-stage **RLM (Reinforcement Learning from Model feedback) Pipeline**, documented in `docs/RLM_PIPELINE.md`. This would extend the current feedback loop into a more structured learning mechanism.

## See Also

- [Ingest Pipeline](ingest-pipeline.md) — the complementary pipeline that populates the wiki
- [Knowledge Graphs](knowledge-graphs.md) — how `graph.json` is structured and traversed
- [LLM Wiki Compile Pipeline](llm-wiki-compile-pipeline.md) — how raw docs become wiki pages
- [Agent Observability](agent-observability.md) — audit logging patterns and principles
