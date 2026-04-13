---
title: "RLM Pipeline (Recursive Layered Memory)"
type: concept
tags: [agentic, context-management, memory, observability, evaluation, deployment]
confidence: high
sources: ["[[summaries/agentic-kb-rlm-pipeline]]", "[[summaries/agentic-kb-readme]]"]
created: 2026-04-10
updated: 2026-04-12
related: ["[[concepts/ingest-pipeline]]", "[[concepts/context-management]]", "[[concepts/observability]]", "[[patterns/pattern-hot-cache]]"]
status: evolving
claims:
  - text: "Stages 4–9 are live in Agentic-KB as of April 2026"
    confidence: high
    sources: ["[[summaries/agentic-kb-rlm-pipeline]]"]
    last_verified: 2026-04-12
    contradictions: []
  - text: "Stages 1–3 (BM25 + vector fanout + RRF) are the highest-leverage missing capability"
    confidence: high
    sources: ["[[summaries/summary-llm-wiki-v2]]", "[[concepts/reciprocal-rank-fusion]]"]
    last_verified: 2026-04-12
    contradictions: []
  - text: "Temporal decay uses 180-day half-life, floor 0.5"
    confidence: medium
    sources: ["[[summaries/agentic-kb-rlm-pipeline]]"]
    last_verified: 2026-04-12
    contradictions: ["Half-life is designed, not empirically validated — optimal value is unknown"]
  - text: "RRF k=60 is the correct default for merging BM25 + vector + graph"
    confidence: high
    sources: ["[[concepts/reciprocal-rank-fusion]]", "[[summaries/summary-llm-wiki-v2]]"]
    last_verified: 2026-04-12
    contradictions: []
  - text: "Multi-retriever fanout: flexsearch BM25, @xenova/transformers vector, typed-edges.json graph"
    confidence: medium
    sources: ["[[recipes/recipe-hybrid-search-llm-wiki]]"]
    last_verified: 2026-04-12
    contradictions: ["Implementation plan only — not yet built. Library choices may change."]
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

Stages 4–9 are live in Agentic-KB as of April 2026. **Stages 1–3 are P1 targets** (promoted from P2 following LLM Wiki v2 validation — see [[summaries/summary-llm-wiki-v2]]). See implementation plan below.

## Stages 1–3 Implementation Plan (P1)

Validated by LLM Wiki v2 as the core of hybrid search. Full implementation spec in [[recipes/recipe-hybrid-search-llm-wiki]].

### Stage 1 — Query Normalization
- **Intent detection:** classify query as `lookup | synthesis | comparison | gap-find`
- **Entity extraction:** identify wiki page slugs and concept names mentioned in query
- **Query expansion:** synonym mapping for common abbreviations (e.g., "RAG" → "retrieval augmented generation")
- **Library:** regex + lightweight trie or Claude structured output for intent classification

### Stage 2 — Multi-Retriever Fanout (parallel)
Three retrievers run in parallel, each returning top-N ranked results:

| Retriever | Implementation | Best For |
|-----------|---------------|----------|
| **BM25** | `flexsearch` or `lunr.js` on wiki index | Exact terminology, technical terms |
| **Vector** | Local embeddings (e.g., `transformers.js`) or Jina API | Semantic similarity, paraphrase matching |
| **Typed graph** | Traverse `graphify-out/typed-edges.json` | Structural connections, causal chains |

Cap each retriever at top-50 results before fusion.

### Stage 3 — Candidate Union + RRF Dedup
- Merge three result sets
- Deduplicate by canonical file path
- Apply [[concepts/reciprocal-rank-fusion]] with k=60
- Output: single ranked list of up to 100 candidates → feeds into Stage 4 (temporal decay)

**Note:** Stage 3 replaces the current "weighted merge" with RRF. The current weighted merge is a placeholder — it requires score normalization that RRF avoids entirely.

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
