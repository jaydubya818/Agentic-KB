---
id: 01KNNVX2RH1F8F2YEWHSYAGACM
title: "Architecture: overall-architecture/vault"
source: oh-my-mermaid
ingested: 2026-04-08T05:01:57Z
tags: [architecture, mermaid, autogen]
omm_perspective: "overall-architecture/vault"
---

# overall-architecture/vault

The Vault is the on-disk state of the KB. raw/ holds source material (notes, transcripts, webhooks) staged for compilation. wiki/ holds compiled pages that Claude produced via the compile pipeline. graphify-out/graph.json is the knowledge graph (222 nodes, 299 links, 12 hyperedges) used for semantic search. logs/audit.log is an append-only JSONL record of every operation.

## Diagram

```mermaid
flowchart LR
    raw[(raw/<br/>source docs)] -->|compile| wiki[(wiki/<br/>compiled pages)]
    wiki -->|graphify| graph[(graphify-out/<br/>graph.json)]
    raw -->|every write| audit[(logs/audit.log)]
    wiki -->|every write| audit
    wiki -->|lint report| lint-report[(wiki/lint-report.md)]
```

