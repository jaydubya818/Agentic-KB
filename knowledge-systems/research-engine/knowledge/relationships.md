---
title: Relationships
type: knowledge
updated: 2026-04-12
---

# Relationships

> Typed connections between concepts, entities, and findings. Accumulates across all research projects. Use relationship types from `methodology/ontology-lite.md`.

## Format

```
| Source | Relationship | Target | Confidence | Notes |
```

Relationship types: `relates_to` | `supports` | `contradicts` | `derived_from` | `impacts` | `depends_on`

---

## Relationships

| Source | Relationship | Target | Confidence | Notes |
|--------|-------------|--------|-----------|-------|
| [[wiki/concepts/rlm-pipeline]] | `depends_on` | [[wiki/concepts/reciprocal-rank-fusion]] | high | RRF is required for Stage 3 of RLM |
| [[wiki/concepts/rag-systems]] | `relates_to` | [[wiki/concepts/knowledge-graphs]] | high | KG enables multi-hop that pure RAG cannot |
| [[wiki/patterns/pattern-compounding-loop]] | `derived_from` | [[wiki/summaries/summary-karpathy-llm-wiki-video]] | high | Karpathy LLM Wiki pattern is the origin |
| [[wiki/patterns/pattern-typed-knowledge-graph]] | `supports` | [[wiki/concepts/rlm-pipeline]] | medium | Typed graph enables Stage 2 structural retrieval |
| [[wiki/frameworks/framework-gsd]] | `impacts` | [[wiki/evaluations/eval-orchestration-frameworks]] | high | GSD scores highest in Jay's eval |
