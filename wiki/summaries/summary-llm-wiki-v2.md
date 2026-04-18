---
title: "LLM Wiki v2 — Confidence, Graph, Hybrid Search, Automated Hooks"
type: summary
source_file: raw/transcripts/llm-wiki-v2-social-post.md
source_url: https://twitter.com/ (social post, exact URL unavailable)
author: Unknown (social post, references agentmemory library)
date_published: 2026-04
date_ingested: 2026-04-12
tags: [memory, context-management, agentic, knowledge-graph, evaluation, rag-systems]
key_concepts:
  - per-claim-confidence
  - typed-knowledge-graph
  - reciprocal-rank-fusion
  - kb-lifecycle-hooks
  - forgetting-curves
  - contradiction-resolution
confidence: medium
---

# Summary: [[llm-wiki]] v2

## Source
Social post describing an extension of [[andrej-karpathy]]'s [[llm-wiki]] pattern, attributed to lessons from the `agentmemory` library (persistent memory engine for AI agents). 5,000 GitHub stars in 48 hours. Primary source not yet ingested — this summary is from the social post only.

> **Note:** Several v2 features are already implemented in this KB at equal or greater sophistication. See Gap Analysis below.

---

## What v2 Adds (vs. Original [[andrej-karpathy]] [[llm-wiki]])

The original [[llm-wiki]] treated all knowledge as equally valid forever — flat pages, no decay, no confidence scoring, no automation. v2 turns it into a living system.

### Confidence Scoring
Every fact carries a score based on: number of supporting sources, recency of last confirmation, and whether anything contradicts it. Knowledge that decays over time. Not everything is equally true forever.

### Memory Tiers
Working (recent observations) → Episodic (session summaries) → Semantic (cross-session facts) → Procedural (workflows). Each tier more compressed and longer-lived.

### Knowledge Graph
Not flat pages with links. Typed entities with typed relationships: "A caused B, confirmed by 3 sources, confidence 0.9." Graph traversal catches connections keyword search misses.

### Hybrid Search
BM25 (keywords) + vector search (semantics) + graph traversal (structure), fused with **reciprocal rank fusion**. Replaces the `index.md` file that breaks past ~200 pages.

### Automated Hooks
On new source: auto-ingest. On session end: compress and file. On schedule: lint, consolidate, decay. The bookkeeping that kills wikis is now fully automated.

### Forgetting Curves
Facts not accessed or reinforced in months fade — not deleted, deprioritized. Architecture decisions decay slowly. Transient bugs decay fast.

### Contradiction Resolution
AI doesn't just flag contradictions — it resolves them based on source recency, authority, and supporting evidence.

---

## Gap Analysis: v2 vs. This KB

| v2 Feature | This KB | Status |
|---|---|---|
| Confidence scoring (page) | `source-trust-policy.md` + `promotion-rules.md` | ✅ Covered, more sophisticated |
| Memory tiers (4) | 8-class system with half-lives | ✅ Covered, more granular |
| Forgetting curves | `freshness-policy.md` exponential decay | ✅ Covered |
| Automated hooks (partial) | raw-file-watcher exists | ⚠️ Partial |
| Knowledge graph (typed) | Graphify (222 nodes) but untyped links | ⚠️ Gap: no typed relationships |
| Hybrid search + RRF | RLM Pipeline Stages 1–3 planned, not live | ⚠️ Gap: RRF algorithm missing |
| Per-claim confidence | Page-level only | ❌ Gap |
| AI contradiction resolution | Routes to human review only | ❌ Gap |

---

## Novel Patterns Identified

- [[patterns/pattern-per-claim-confidence]] — Confidence at claim/sentence level, not just page level
- [[patterns/pattern-typed-knowledge-graph]] — Typed entity-relationship graph with confidence scores on edges
- [[concepts/reciprocal-rank-fusion]] — Algorithm for merging incompatible score spaces (BM25 + cosine + graph)
- [[recipes/recipe-kb-lifecycle-hooks]] — Full automation: ingest, session-end compression, scheduled decay
- [[recipes/recipe-hybrid-search-llm-wiki]] — Implementing BM25 + vector + graph + RRF on markdown wiki

---

## Key Quote
> "The Memex is finally buildable. Not because we have better documents or better search, but because we have librarians that actually do the work."

---

## Related
- [[summaries/summary-karpathy-llm-wiki-gist]] — Original pattern this extends
- [[summaries/summary-karpathy-llm-wiki-video]] — Three-layer architecture
- [[summaries/summary-nate-herk-llm-wiki]] — [[pattern-hot-cache]], token efficiency
- [[concepts/rlm-pipeline]] — This KB's implementation of hybrid retrieval
- [[system/policies/freshness-policy]] — Forgetting curves implementation
- [[system/policies/contradiction-policy]] — Contradiction detection and resolution

## TODO
Ingest primary source: find `agentmemory` GitHub repo URL and run INGEST workflow on it. This will likely surface additional patterns not captured in this social post summary.
