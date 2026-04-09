---
id: 01KNNVX3RQWT9UV12PX6KM8ZSA
title: Two-Step Ingest (Analyze → Generate)
type: pattern
category: prompt-engineering
problem: Single-call compilation conflates source analysis with wiki page generation, producing lower-quality pages that miss entity relationships and deep structure
solution: Split ingestion into two sequential LLM calls — first analyze the source and extract a knowledge graph, then generate wiki pages using the structured analysis as input
tradeoffs:
  - pro: Analysis call can focus entirely on understanding; generation call can focus entirely on formatting
  - pro: Knowledge graph is an explicit intermediate artifact — inspectable, correctable, reusable
  - pro: Second call has richer, more structured input → higher page quality and better cross-links
  - con: Doubles the token cost per ingest operation
  - con: Adds latency — two sequential calls cannot be parallelized
  - con: Analysis quality gates generation quality — errors in call 1 propagate to call 2
tags: [pattern-prompt-engineering, ingest-pipeline, memory, llm-wiki-compile-pipeline, context-management]
confidence: medium
sources:
  - "nashsu/llm_wiki — Two-step chain of thought ingest (2025)"
created: 2026-04-09
updated: 2026-04-09
---

## Problem

Single-call ingest asks the LLM to simultaneously understand a source document and produce formatted wiki pages. These are different cognitive tasks. The LLM is fast-forwarded past the analysis phase — it hasn't built an internal model of the document's entity relationships, key claims, and structure before it starts writing pages. The result is pages that miss non-obvious connections, under-link to existing concepts, and treat shallow mentions the same as central claims.

---

## Solution

Split ingest into two sequential calls:

**Call 1 — Analysis**: Given the raw source, extract a structured intermediate representation. Output a knowledge graph: entities, relationships, relationship strengths, key claims, contradictions with existing wiki content, and candidate page destinations.

**Call 2 — Generation**: Given the structured analysis from Call 1, write the actual wiki pages. The model starts from a rich, explicit understanding of the source rather than deriving it on the fly while typing.

The intermediate output from Call 1 is a first-class artifact — saved to disk, inspectable, correctable before generation runs.

---

## Implementation Sketch

### Call 1 — Analysis prompt structure

```
System: You are a knowledge analyst. Extract a structured knowledge graph from the source.
        Output JSON only. Do not write wiki pages.

Output schema:
{
  "entities": [{ "name": str, "type": str, "salience": 1-10, "description": str }],
  "relationships": [{ "from": str, "to": str, "label": str, "strength": 1-10, "evidence": str }],
  "key_claims": [{ "claim": str, "confidence": "high|medium|low", "entity_refs": [str] }],
  "candidate_pages": [{ "path": str, "type": str, "primary_entities": [str] }],
  "contradictions": [{ "existing_page": str, "conflict": str }],
  "tags": [str]
}

User: [raw source document]
```

The `salience` score (1-10) on entities and `strength` score (1-10) on relationships drive downstream decisions: high-salience entities get their own pages; low-salience entities become mentions in other pages. Relationship strength determines which backlinks get created.

### Call 2 — Generation prompt structure

```
System: You are a wiki author. Write structured wiki pages based on the analysis provided.
        Follow the wiki schema in wiki/schema.md. Output a JSON array of page ops:
        [{ "path": "wiki/concepts/foo.md", "content": "...", "operation": "create|update" }]

User: Knowledge graph analysis:
      [output from Call 1]

      Existing pages that may need updating:
      [list of existing page paths and their current frontmatter]

      Write pages for: [candidate_pages from analysis]
```

### Relationship strength as citation priority

During query, relationship strength from the graph can weight how aggressively to follow edges. A `strength: 9` relationship between two entities means a query hitting entity A should strongly pull in entity B's page. A `strength: 2` relationship means entity B is a candidate but not a priority.

This replaces pure keyword + decay ranking with graph-aware prioritization for entities that are demonstrably closely linked in the source material.

---

## Context Budget Allocation (Four-Stage Query)

A related optimization from the same source: rather than ranking all results by score and cutting at a token limit, allocate the context budget proportionally across result types before ranking within each bucket:

```
Total context budget: configurable (4K → 1M tokens)

Allocation:
  60% → direct keyword matches (highest precision)
  20% → graph-expanded results (1-2 hop neighbors via relationship strength)
   5% → hot cache / recently accessed pages
  15% → citation context (page excerpts showing how entities relate)
```

This prevents graph expansion from crowding out direct matches (a common failure when graph traversal is too aggressive) while ensuring related concepts always get some budget.

The proportional model is more predictable than pure score-based cutoff: you know exactly how much of your context came from each retrieval stage, making debugging and tuning easier.

**Implementation approach**: compute each bucket independently, apply the budget fraction, concatenate in priority order (direct → graph → hot → citation).

---

## Tradeoffs

| Dimension | Single-call | Two-step |
|-----------|-------------|----------|
| Token cost | 1× | ~2× |
| Latency | Low | Higher (sequential) |
| Page quality | Moderate | Higher |
| Cross-linking | Implicit | Explicit (graph-driven) |
| Auditability | Low (black box) | High (intermediate artifact) |
| Error propagation | Self-contained | Call 1 errors amplify in Call 2 |
| Incremental re-run | Re-run full ingest | Can re-run generation only if analysis is cached |

---

## When To Use

- Sources where entity relationships matter as much as the content (academic papers, architecture docs, decision records)
- Wikis where cross-linking quality is a primary goal — the explicit graph makes backlinks better
- When you have budget for 2× token cost per ingest in exchange for higher quality
- When you want the analysis to be inspectable — useful for auditing what the LLM understood before committing pages to disk

## When NOT To Use

- High-volume ingest pipelines where token cost is the primary constraint
- Simple sources (short notes, quick references) where the two-call overhead exceeds the quality benefit
- When latency matters — two sequential calls double the wall-clock time per document

---

## Real Examples

From nashsu/llm_wiki (2025): the two-step chain-of-thought ingest was the primary architectural improvement over the base Karpathy pattern. Files saved to the knowledge base undergo in-depth analysis via LLM to break down content and generate a knowledge graph; the second call writes structured wiki pages using that graph as context.

---

## Related Patterns

- [[concepts/llm-wiki-compile-pipeline]] — the single-call baseline this pattern improves on
- [[patterns/pattern-reflection-loop]] — adjacent pattern: one call generates, another critiques; here both calls are generative but different tasks
- [[patterns/pattern-hot-cache]] — the hot cache feeds the 5% budget slice in the four-stage query allocation
- [[concepts/context-management]] — the 60/20/5/15 proportional budget allocation is an application of principled context budgeting
