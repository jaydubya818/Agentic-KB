---
title: Typed Knowledge Graph
type: pattern
category: memory
problem: Wiki link graphs track existence of connections but not their semantics — you can't distinguish "A caused B" from "A contradicts B" from "A implements B", so graph traversal can't find structurally meaningful connections.
solution: Augment the knowledge graph with typed, directional edges that carry relationship semantics, confidence scores, and source counts. Graph traversal then finds connections that keyword and vector search miss.
tradeoffs:
  - pro: Graph traversal catches non-obvious connections (implementation → concept → risk)
  - pro: Contradiction edges enable automated conflict detection across the graph
  - pro: Confidence scores on edges enable path-weighted reasoning
  - con: Requires re-extracting relationships from existing pages (one-time cost)
  - con: Typed edge schema must be agreed on and stable before bulk extraction
  - con: Increases graph maintenance burden on page edits
tags: [memory, knowledge-graph, context-management, agentic, evaluation]
confidence: medium
sources:
  - [[summaries/summary-llm-wiki-v2]]
created: 2026-04-12
updated: 2026-04-12
related:
  - [[concepts/rlm-pipeline]]
  - [[concepts/reciprocal-rank-fusion]]
  - [[system/policies/contradiction-policy]]
---

# Pattern: Typed Knowledge Graph

## Problem
Current wiki link graphs (including this KB's Graphify output) track that "Page A links to Page B" — but not *why* or *how*. All edges are structurally identical:

```json
{ "from": "pattern-fan-out-worker", "to": "concepts/multi-agent-systems" }
```

This means graph traversal can find connected pages, but can't answer:
- "What patterns *implement* this concept?" (vs. merely reference it)
- "What pages *contradict* this claim?"
- "What is the *causal chain* from this decision to that failure mode?"

The original LLM Wiki had the same flat-link problem. LLM Wiki v2 identifies typed relationships as the fix: **"A caused B, confirmed by 3 sources, confidence 0.9."**

## Solution
Add typed, directional edges to the knowledge graph. Each edge carries:
- `from` / `to` — source and target page paths
- `type` — semantic relationship type (see taxonomy below)
- `confidence` — float 0.0–1.0
- `sources` — count of independent sources supporting this relationship
- `extracted_by` — `human` or `llm` (trust modifier)
- `created` — ISO date

### Relationship Type Taxonomy

| Type | Meaning | Example |
|------|---------|---------|
| `implements` | A is a concrete instantiation of B | `pattern-fan-out-worker implements concepts/parallelization` |
| `extends` | A adds to B without replacing it | `pattern-layered-injection-hierarchy extends pattern-tiered-agent-memory` |
| `contradicts` | A's claims conflict with B | `eval-A contradicts eval-B on framework performance` |
| `supersedes` | A replaces B (B is deprecated) | `v2-pattern supersedes v1-pattern` |
| `caused` | A led to B (causal) | `pattern-missing-validation caused failure-mode-silent-data-loss` |
| `supports` | A provides evidence for B | `summary-X supports concept-Y's key claim` |
| `requires` | A depends on B | `recipe-hybrid-search requires concepts/reciprocal-rank-fusion` |
| `related` | General association (fallback) | Use sparingly — prefer specific types |

### Edge Schema (JSON)
```json
{
  "from": "wiki/patterns/pattern-fan-out-worker.md",
  "to": "wiki/concepts/multi-agent-systems.md",
  "type": "implements",
  "confidence": 0.95,
  "sources": 3,
  "extracted_by": "llm",
  "created": "2026-04-12"
}
```

### Storage
Edges stored in `graphify-out/typed-edges.json` alongside the existing `graph.json`. The Graphify skill can be extended to emit typed edges during extraction.

## Graph Traversal Use Cases

Once typed edges exist, queries become structurally richer:

```
Query: "What are the risks of using pattern-fan-out-worker?"
→ Graph: fan-out-worker --implements--> parallelization
→ Graph: parallelization --caused--> failure-mode-telephone-game
→ Graph: failure-mode-telephone-game --requires--> pattern-context-isolation
Result: surface telephone game and context isolation without keyword match
```

```
Query: "Is there any evidence against this architecture decision?"
→ Graph: find all edges of type 'contradicts' pointing to this ADR
→ Return contradicting pages with confidence scores
```

## Extraction Prompt (LLM-Assisted)

```
Given these two wiki pages, identify the relationship between them.
Choose from: implements | extends | contradicts | supersedes | caused | supports | requires | related
Output JSON: { "type": string, "confidence": float, "rationale": string }
Only output "related" if no specific type applies.
```

Run this prompt over all page pairs that share existing wiki links. This one-time extraction populates the typed edge graph from existing content.

## Integration with RLM Pipeline

In RLM Stage 2 (multi-retriever fanout), typed graph traversal augments keyword and vector retrieval:

```
Stage 2 fanout:
  keyword_results = bm25_search(query)
  vector_results = vector_search(query)
  graph_results = typed_graph_traversal(query_entities, types=["implements","supports","causes"])
  → merge all three via RRF (see [[concepts/reciprocal-rank-fusion]])
```

The `contradicts` edge type also feeds directly into Stage 7 (contradiction filter) — any page reached via a `contradicts` edge is automatically flagged for the filter.

## Tradeoffs

| | Pros | Cons |
|--|------|------|
| **Discoverability** | Finds structural connections keyword search misses | One-time extraction cost for existing content |
| **Contradiction detection** | `contradicts` edges automate conflict flagging | Schema drift if types are added without migration |
| **Query depth** | Multi-hop traversal for causal chains | Increased graph maintenance on page edits |
| **Trust** | Edge confidence scores enable weighted reasoning | LLM-extracted edges need human spot-check |

## Relationship to Current Graphify
Graphify currently emits `graph.json` with untyped nodes and link edges. This pattern extends Graphify to:
1. Extract relationship types during the graph-build pass
2. Store typed edges in a separate `typed-edges.json`
3. Expose typed traversal in the RLM pipeline Stage 2

The existing untyped graph remains valid as a fallback for "find connected pages" queries.

## Related Patterns
- [[concepts/rlm-pipeline]] — Stage 2 fanout and Stage 7 contradiction filter both benefit from typed edges
- [[concepts/reciprocal-rank-fusion]] — Merges typed graph results with BM25 and vector results
- [[system/policies/contradiction-policy]] — `contradicts` edges feed directly into the pre-check algorithm
- [[patterns/pattern-per-claim-confidence]] — Claim-level confidence pairs with edge-level confidence for fine-grained reasoning
