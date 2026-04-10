---
title: "Agentic-KB — RLM Retrieval Pipeline"
type: summary
source_file: wiki/repos/agentic-kb/repo-docs/docs/RLM_PIPELINE.md
source_url: https://raw.githubusercontent.com/jaydubya818/Agentic-KB/main/docs/RLM_PIPELINE.md
author: Jay West
date_published: 2026-04-09
date_ingested: 2026-04-10
tags: [agentic, observability, context-management, memory, evaluation, deployment]
key_concepts: [rlm-pipeline, ingest-pipeline, token-budget, context-management, observability]
confidence: high
---

## TL;DR

A 10-stage Recursive Layered Memory (RLM) retrieval pipeline for the Agentic-KB query system, inspired by archivist-oss. Each stage is observable, budget-aware, and fail-open — any stage can be bypassed and the pipeline degrades gracefully.

## The 10 Stages

| Stage | Name | Status (Apr 2026) |
|---|---|---|
| 1 | Query normalization | P2 target (intent detection) |
| 2 | Multi-retriever fanout | Partial — keyword + graph live |
| 3 | Candidate union | Partial — weighted merge |
| 4 | Temporal decay | ✅ Live — 180d half-life, floor 0.5 |
| 5 | Hotness boost | ✅ Live — 30d audit window |
| 6 | Confidence weighting | ✅ Live — high×1.10, med×1.00, low×0.85 |
| 7 | Contradiction filter | ✅ Live — parses lint-report.md |
| 8 | Reranking | Optional — cross-encoder top50→10 |
| 9 | Token-budget packing | ✅ Live — 24,000 char cap, proportional |
| 10 | LLM synthesis | ✅ Live — Claude with citations |

## Design Principles

- **Pure similarity is not ranking.** Final score blends relevance, recency, popularity, and confidence.
- **Every stage is observable.** Each produces a JSON log line to `logs/pipeline.log` with inputs, outputs, and timing.
- **Budget-aware.** Token budget enforced *before* Claude is called.
- **Fail open.** Any stage can be bypassed; degrades gracefully to keyword+graph.

## Observability Contract

Each stage emits one JSON line: `{ ts, traceId, stage, durationMs, inputCount, outputCount, meta }`. One query = ten log lines + one `op: query` audit entry.

## P2 Implementation Targets

Seven new modules: `normalize.ts`, `fanout.ts`, `merge.ts`, `confidence.ts`, `contradict.ts`, `pack.ts`, `pipeline.ts`. The `/api/query` route will swap inline logic for `runPipeline(query, identity)`.

## Related Pages

- [[concepts/rlm-pipeline]]
- [[concepts/ingest-pipeline]]
- [[concepts/context-management]]
- [[concepts/observability]]
- [[patterns/pattern-hot-cache]]
