---
title: "RLM Pipeline (Recursive Layered Memory)"
type: concept
tags: [agentic, context-management, memory, observability, evaluation, deployment]
confidence: high
sources: ["[[summaries/agentic-kb-rlm-pipeline]]", "[[summaries/agentic-kb-readme]]"]
created: 2026-04-10
updated: 2026-04-10
related: ["[[concepts/ingest-pipeline]]", "[[concepts/context-management]]", "[[concepts/observability]]", "[[patterns/pattern-hot-cache]]"]
status: evolving
---

## TL;DR

A 10-stage retrieval pipeline that blends relevance, recency, popularity, and confidence to rank context before LLM synthesis — not just semantic similarity.

## Definition

The Recursive Layered Memory (RLM) Pipeline is a staged retrieval architecture for LLM-backed knowledge bases where raw similarity score is insufficient for ranking. Each stage applies a specific scoring or filtering transform, is independently observable, and can be bypassed without breaking the pipeline (fail-open design).

## How It Works

| Stage | Name | Transform |
|---|---|---|
| 1 | Query normalization | Intent detection, stemming, synonym expansion |
| 2 | Multi-retriever fanout | Keyword + graph + BM25 + vector in parallel |
| 3 | Candidate union | Weighted merge + dedup by file path |
| 4 | Temporal decay | `score × decayFactor(mtime)` — 180d half-life, floor 0.5 |
| 5 | Hotness boost | `score × hotnessBoost(auditHits)` — 30d query window |
| 6 | Confidence weighting | `high ×1.10, medium ×1.00, low ×0.85` from frontmatter |
| 7 | Contradiction filter | Deprioritize pages flagged in `lint-report.md` |
| 8 | Reranking (optional) | Cross-encoder rerank top-50 → top-10 |
| 9 | Token-budget packing | Pack highest-score pages up to `MAX_CONTEXT_CHARS = 24,000` |
| 10 | LLM synthesis | Claude with citations; optional validator model |

Stages 4–9 are live in Agentic-KB as of April 2026. Stage 1 (intent detection) is a P2 target.

## Key Variants

**Minimal** (keyword + graph only): Stages 2–3 + 10. Fast, sufficient for small vaults.
**Standard** (current Agentic-KB): Stages 2–9 active, stage 1 bypassed.
**Full**: All 10 stages with cross-encoder reranking and two-model validation.

## When To Use

Any LLM-backed knowledge base where query quality matters: when pure keyword search returns too many false positives, when stale pages crowd out fresh ones, or when you need to suppress contradicted content automatically.

## Risks & Pitfalls

- **Stage coupling**: If contradiction filter (stage 7) has bugs, valid pages can be silently excluded.
- **Budget packing cliff**: Proportional allocation can drop entire pages if the budget is tight — always log what was dropped.
- **Hotness drift**: 30-day query window means very popular old topics can boost stale pages; pair with temporal decay.

## Related Concepts

- [[concepts/ingest-pipeline]]
- [[concepts/context-management]]
- [[concepts/observability]]
- [[concepts/llm-wiki-compile-pipeline]]

## Sources

- [[summaries/agentic-kb-rlm-pipeline]]
- [[summaries/agentic-kb-readme]]
