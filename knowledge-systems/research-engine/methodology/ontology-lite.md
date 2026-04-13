---
title: Ontology-Lite
type: methodology
created: 2026-04-12
---

# Ontology-Lite

Start with this. Do not jump to Neo4j/SPARQL until the markdown system demonstrably hits a ceiling.

## Node Types

| Type | Definition | Example |
|------|-----------|---------|
| `concept` | Abstract idea or principle | "reciprocal rank fusion", "forgetting curve" |
| `entity` | Real-world thing: person, company, product, place | "Anthropic", "LangGraph", "Andrej Karpathy" |
| `source` | A specific document, article, paper, or dataset | "karpathy-llm-wiki-gist.md", "arxiv:2312.xxxxx" |
| `project` | A bounded research effort | "SellerFi lender market analysis" |
| `finding` | A specific, sourced claim or observation | "Letta filesystem agents scored 74% on LoCoMo" |
| `metric` | A quantified data point | "95% token reduction vs RAG" |
| `question` | An unresolved question worth tracking | "What is the optimal RRF k value for this KB?" |

## Relationship Types

| Type | Direction | Meaning |
|------|-----------|---------|
| `relates_to` | bidirectional | general connection; use when nothing more specific fits |
| `supports` | A → B | A provides evidence for B |
| `contradicts` | A ↔ B | A and B conflict; requires contradiction protocol |
| `derived_from` | A → B | A was built from or inspired by B |
| `impacts` | A → B | A causally affects B |
| `depends_on` | A → B | A requires B to function or be true |

## Frontmatter for Typed Notes

```yaml
---
type: concept          # concept | entity | source | finding | metric | question
domain: [domain]
status: active         # active | deprecated | uncertain
confidence: medium     # high | medium | low
source: [wiki link or URL]
date_captured: YYYY-MM-DD
scope: global          # global | project-name
related:
  - [[related-page]]
---
```

## When to Add a New Node Type

Only add a new type if it genuinely behaves differently from all existing types. "I want to distinguish X from Y" is not enough — there must be a different retrieval or traversal pattern that justifies it.

## When to Add a New Relationship Type

Only add a new relationship type if existing types can't express the connection accurately. `relates_to` is always the fallback.

## Ceiling Signals (when to consider a real graph backend)

Add graph tooling when you observe:
- Multi-hop traversal that markdown wikilinks can't express cleanly
- Entity extraction needs automation (>500 entities)
- Inference queries ("what concepts does X transitively depend on?") are failing
- Provenance queries ("which findings came from Tier-1 sources published post-2024?") require SQL-like filtering

Until then, wikilinks + frontmatter + relationships.md is sufficient.
