---
title: Hybrid Retrieval
type: concept
tags: [memory, rag-systems, evaluation, context-management, agentic]
confidence: high
sources:
  - "[[summaries/siagian-agentic-engineer-roadmap-2026]]"
  - "[[concepts/reciprocal-rank-fusion]]"
  - "[[recipes/recipe-hybrid-search-llm-wiki]]"
created: 2026-05-16
updated: 2026-05-16
related:
  - "[[concepts/rag-systems]]"
  - "[[concepts/reciprocal-rank-fusion]]"
  - "[[concepts/metadata-filtering]]"
  - "[[patterns/pattern-grounded-generation]]"
status: stable
reviewed: false
reviewed_date: ""
---

# Hybrid Retrieval

Hybrid retrieval fuses sparse (BM25) and dense (vector) search — and optionally graph traversal — using [[concepts/reciprocal-rank-fusion]] to produce results neither approach gets alone. It is the default retrieval architecture for production [[concepts/rag-systems]] where query patterns are unpredictable.

## Definition

Hybrid retrieval runs multiple retrieval strategies in parallel over the same document corpus and merges their ranked result lists into a single ranked output. The merge uses a score-free algorithm (typically Reciprocal Rank Fusion) that doesn't require normalizing scores across retrievers — it only needs rank positions.

## How It Works

**Three retrievers, one merge:**

1. **BM25 (sparse):** Tokenizes the query and scores documents by term frequency × inverse document frequency. Fast, no embeddings needed, excellent on exact keyword matches, rare terms, product names, and technical identifiers. Fails on paraphrase queries where the user uses different words than the document.

2. **Dense vector (semantic):** Embeds query and documents into a shared vector space; retrieves by cosine similarity or dot product. Excellent on paraphrase queries, conceptual questions, and language variation. Fails on rare terms that appear infrequently in the training data — a novel framework name, a niche product code, or a specific person's name may have poor embedding coverage.

3. **Graph traversal (optional):** Starting from chunk nodes matched by BM25 or vector search, traverse entity relationship edges to expand recall. Required for multi-hop questions ("What companies did the author of paper X later work for?") where the answer is not in any single chunk.

**Reciprocal Rank Fusion merge:**

```
score(d) = Σ_i  1 / (k + rank_i(d))
```

Where `k = 60` (empirically stable constant), `rank_i(d)` is the rank of document `d` in retriever `i`'s list, and the sum is over all retrievers. Documents not present in a retriever's results receive a rank of ∞ and contribute 0 to the sum. The merged list is sorted descending by RRF score.

The formula works because it rewards consistent high ranking across retrievers without requiring score normalization. A document ranked #1 by BM25 and #3 by vector search beats a document ranked #1 by BM25 and absent from vector search.

**Example:**

| Document | BM25 rank | Vector rank | RRF score (k=60) |
|---|---|---|---|
| Doc A | 1 | 3 | 1/61 + 1/63 = 0.032 |
| Doc B | 2 | 1 | 1/62 + 1/61 = 0.032 |
| Doc C | 1 | absent | 1/61 + 0 = 0.016 |
| Doc D | absent | 2 | 0 + 1/62 = 0.016 |

Doc A and Doc B tie — both well-ranked across both systems. Doc C (BM25 #1 only) and Doc D (vector #2 only) score half as much — the system discounts single-retriever hits.

## Key Variants

**BM25 + vector (standard hybrid):** The most common form. Supported natively by Weaviate, Qdrant (with `fusion` parameter), Elasticsearch, and OpenSearch. Recommended default.

**BM25 + vector + graph (full hybrid):** Add knowledge graph traversal for multi-hop questions. The [[recipes/recipe-hybrid-search-llm-wiki]] implements this as RLM Stages 1-3. Adds complexity; justified when question patterns require following entity relationships across chunks.

**Re-ranking as a fourth stage:** After RRF merge, optionally re-rank the top-k results using a cross-encoder model (e.g., Cohere Rerank, BGE-Reranker). Cross-encoders score query-document pairs jointly — more accurate than bi-encoder similarity but 10-100× slower. Use on top-5 results only.

**Hybrid with metadata filtering:** Apply [[concepts/metadata-filtering]] as a pre-retrieval gate — filter by tenant, permission level, or document type before BM25 and vector search run. Never apply metadata filtering post-RRF.

## When To Use

- Production RAG with unpredictable query patterns (users ask both keyword queries and conceptual questions)
- Technical documentation search where product names and identifiers must be found exactly
- Enterprise knowledge bases with multiple document types (structured tables + prose)
- Any system where recall matters more than latency — hybrid retrieval recovers documents that single-retriever approaches miss

## Risks & Pitfalls

**RRF k=60 is a heuristic — tune it.** The constant `k` controls how much weight early ranks receive vs. later ranks. k=60 is a stable default from the 2009 Cormack et al. paper, but optimal k varies by corpus and query distribution. Tune on a held-out evaluation set.

**If one retriever dominates, RRF doesn't help.** If BM25 consistently ranks the correct document #1 and vector search ranks it #15, the merged result will still be dominated by BM25. Hybrid retrieval adds value when retrievers are complementary — when they each find documents the other misses.

**Hybrid adds latency from running multiple retrievers.** BM25 and vector search can run in parallel, but both must complete before RRF can merge. Budget 50-150ms for BM25, 100-300ms for vector search (embedding + ANN), plus merge overhead. Total P95 hybrid retrieval latency is typically 200-400ms.

**Cold start on rare terms still fails.** If a technical term appears in zero training documents for the embedding model, vector search will have poor coverage regardless of hybrid fusion.

## Counter-arguments & Gaps

Hybrid retrieval adds operational complexity: two retrieval systems to maintain, tune, and monitor instead of one. For many use cases — especially those with consistent, predictable query patterns — a well-tuned single vector retriever with careful chunking is sufficient. The incremental recall improvement from adding BM25 is typically 5-15% on mixed query distributions; whether that improvement justifies the engineering investment depends on the application.

Graph traversal in particular is difficult to operationalize: it requires building and maintaining an entity graph, defining relationship types, and handling graph schema evolution as the document corpus changes. Most teams should delay graph retrieval until vector + BM25 hybrid has been exhausted and multi-hop recall is confirmed as a specific failure mode.

## Related Concepts

- [[concepts/rag-systems]] — broader RAG architecture context; hybrid retrieval is the retrieval stage
- [[concepts/reciprocal-rank-fusion]] — the merge algorithm underlying hybrid retrieval
- [[concepts/metadata-filtering]] — pre-retrieval filter that runs before hybrid retrieval
- [[patterns/pattern-grounded-generation]] — generation stage that depends on retrieval quality
- [[concepts/knowledge-graphs]] — graph traversal component for multi-hop hybrid retrieval

## Sources

- [[summaries/siagian-agentic-engineer-roadmap-2026]] — Section 7: RAG Systems, hybrid retrieval section
- [[concepts/reciprocal-rank-fusion]] — RRF algorithm and k-parameter guidance
- [[recipes/recipe-hybrid-search-llm-wiki]] — RLM Stages 1-3 full implementation
