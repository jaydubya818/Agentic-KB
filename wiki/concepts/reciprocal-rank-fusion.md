---
title: Reciprocal Rank Fusion
type: concept
tags: [memory, context-management, rag-systems, evaluation, agentic]
confidence: high
sources:
  - [[summaries/summary-llm-wiki-v2]]
  - [[summaries/siagian-agentic-engineer-roadmap-2026]]
created: 2026-04-12
updated: 2026-04-12
related:
  - [[concepts/rlm-pipeline]]
  - [[concepts/rag-systems]]
  - [[patterns/pattern-typed-knowledge-graph]]
status: stable
---

# Reciprocal Rank Fusion

## TL;DR
A score-free algorithm for merging ranked result lists from incompatible retrievers (BM25, vector search, graph traversal) into a single unified ranking. Uses position in each list, not raw scores.

## Definition
Reciprocal Rank Fusion (RRF) is a rank aggregation algorithm that combines multiple ranked lists without requiring score normalization. Each item's final score is the sum of `1 / (k + rank_i)` across all retrievers, where `k` is a constant (typically 60) that prevents top-ranked items from dominating too strongly.

## How It Works

### The Problem It Solves
Multi-retriever hybrid search produces incompatible scores:
- BM25 returns TF-IDF scores (typically 0–20, scale depends on corpus)
- Vector search returns cosine similarity (0.0–1.0)
- Graph traversal returns hop count or path weight (different scale again)

You can't simply average these — a BM25 score of 8.4 is not comparable to a cosine similarity of 0.84. Normalization approaches (min-max, z-score) are fragile across different query types and corpus sizes.

### The RRF Formula
```
RRF_score(doc) = Σ_i [ 1 / (k + rank_i(doc)) ]

where:
  k = 60  (constant — smooths out rank differences at the top)
  rank_i(doc) = position of doc in retriever i's list (1-indexed)
  Σ_i = sum across all retrievers
```

If a document doesn't appear in retriever i's results at all, it contributes 0 to the sum.

### Example
Three retrievers, five documents, k=60:

| Doc | BM25 rank | Vector rank | Graph rank | RRF score |
|-----|-----------|-------------|------------|-----------|
| A | 1 | 3 | - | 1/61 + 1/63 = 0.0321 |
| B | 2 | 1 | 2 | 1/62 + 1/61 + 1/62 = 0.0484 |
| C | - | 2 | 1 | 1/62 + 1/61 = 0.0326 |
| D | 3 | - | 3 | 1/63 + 1/63 = 0.0317 |
| E | 4 | 4 | - | 1/64 + 1/64 = 0.0313 |

**B wins** because it ranked highly across all three retrievers — even though it wasn't #1 in any single one. This is the key insight: RRF rewards consistent cross-retriever relevance.

## Implementation (JavaScript, 20 lines)

```javascript
function reciprocalRankFusion(rankedLists, k = 60) {
  const scores = new Map();

  for (const list of rankedLists) {
    list.forEach((item, index) => {
      const rank = index + 1;  // 1-indexed
      const rrf = 1 / (k + rank);
      scores.set(item.id, (scores.get(item.id) || 0) + rrf);
    });
  }

  return Array.from(scores.entries())
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}

// Usage:
const merged = reciprocalRankFusion([bm25Results, vectorResults, graphResults]);
```

## Key Variants

**Standard RRF (k=60):** The original Cormack et al. (2009) formulation. k=60 was empirically derived and works well across most retrieval tasks.

**Weighted RRF:** Multiply each retriever's contribution by a weight: `w_i / (k + rank_i)`. Use when one retriever is significantly higher quality for your specific corpus.

**RRF with minimum threshold:** Filter out documents with final RRF score below a floor before returning results — prevents weak matches from surviving purely because they appeared in multiple retrievers.

## When To Use

- **Always** when combining BM25 + vector search results (their score spaces are incompatible)
- Any time ≥2 ranked lists need to be merged without re-ranking via a cross-encoder
- Preferred over learned fusion (e.g., linear combination of scores) when you don't have labeled training data for the fusion weights

## When NOT To Use

- When you only have one retriever — trivially unnecessary
- When scores are already on the same scale and you have labeled data to learn fusion weights (cross-encoder reranking or learned fusion will outperform RRF)
- Real-time systems where even the simple loop is too slow (rare — RRF is O(n) in total results)

## Risks & Pitfalls

- **k sensitivity:** k=60 works well generally but is worth tuning for specific use cases. Lower k (e.g., 10) makes top-ranked items more dominant; higher k (e.g., 100) flattens differences.
- **Missing retrievers:** If a retriever fails or returns no results, remaining retrievers still produce valid output — RRF degrades gracefully.
- **Positional bias:** If one retriever consistently returns 1,000+ results while another returns 10, the deep results from the large retriever contribute almost nothing (1/(60+1000) ≈ 0). Cap retriever output to the same N before fusion.

## Integration with This KB
RRF is the correct fusion algorithm for RLM Pipeline Stage 3 (candidate union). See [[concepts/rlm-pipeline]] Stage 3 — currently described as "weighted merge" which should be replaced with RRF when Stages 1–3 are implemented.

See [[recipes/recipe-hybrid-search-llm-wiki]] for the full implementation plan.

## Related Concepts
- [[concepts/rlm-pipeline]] — RRF belongs in Stage 3 (candidate union + dedup)
- [[concepts/rag-systems]] — Hybrid retrieval architecture this applies to
- [[patterns/pattern-typed-knowledge-graph]] — Graph traversal results are one of the lists RRF merges
