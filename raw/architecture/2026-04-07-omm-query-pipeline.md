---
title: "Architecture: query-pipeline"
source: oh-my-mermaid
ingested: 2026-04-08T05:01:57Z
tags: [architecture, mermaid, autogen]
omm_perspective: "query-pipeline"
---

# query-pipeline

The query pipeline answers natural-language questions by running hybrid retrieval (keyword scanner + graph traversal), ranking results via temporal decay and hotness, then synthesizing an answer with Claude against the top-ranked wiki pages. Every query is logged to logs/audit.log with file hits — which feeds future hotness scoring. P2 target: the 10-stage RLM pipeline documented in docs/RLM_PIPELINE.md.

## Diagram

```mermaid
flowchart LR
    Q[User query] --> API[/api/query/]
    API --> KW[Keyword scan<br/>wiki/*.md]
    API --> GS[Graph search<br/>graph.json]
    KW --> MERGE[Hybrid merge<br/>dedupe by filePath]
    GS --> MERGE
    MERGE --> RANK[ranking.ts<br/>decay × hotness]
    RANK --> TOP[Top-K pages]
    TOP --> CLAUDE[Claude synthesis<br/>w/ citations]
    CLAUDE --> ANSWER[SSE answer stream]
    CLAUDE --> AUDIT[(audit.log<br/>op:query)]
    AUDIT -.feeds.-> RANK
```

