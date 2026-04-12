---
title: "Knowledge Graphs — Everything Is Connected"
type: summary
source_file: raw/transcripts/knowledge-graphs-explainer.md
source_url: https://medium.com/@techwith_ram (estimated)
author: "@techwith_ram"
date_published: 2025-2026
date_ingested: 2026-04-12
tags: [knowledge-graph, memory, agentic, context-management, rag-systems, evaluation]
key_concepts:
  - knowledge-graphs
  - triple-model
  - ontology
  - graph-inference
  - named-graphs
confidence: medium
---

# Summary: Knowledge Graphs — Everything Is Connected

## Source
Long-form explainer article on knowledge graphs: fundamentals, structure, ontology, querying, inference, limitations, and real-world use cases (Google Knowledge Graph, biomedical research). Author works in healthcare sector.

---

## Core Claim
Human knowledge is a dense tangled network of associations, not isolated boxes. Knowledge graphs are a computer's attempt to replicate this structure — entities connected by typed, directed, labeled relationships, enabling multi-hop reasoning that relational databases cannot perform efficiently.

---

## Key Concepts Covered

### The Triple (Subject–Predicate–Object)
The atomic unit of a knowledge graph. Three parts: a subject entity, a predicate (relationship type), an object entity or value.

```
Marie Curie  BORN_IN  Warsaw
Warsaw       CAPITAL_OF  Poland
Poland       LOCATED_IN  Europe
```
From three triples, a machine can infer: Marie Curie was born in a European capital. This chained reasoning is the superpower of the knowledge graph.

### Nodes, Edges, Properties
- **Nodes** (entities): things — person, city, concept, product, chemical compound. Each has a unique identity.
- **Edges** (relationships/predicates): connect two nodes with a labeled, **directed** relationship. Direction matters: "Marie Curie BORN_IN Warsaw" ≠ "Warsaw BORN_IN Marie Curie."
- **Properties** (attributes): data carried on nodes or edges — birth year on a person node, start/end date on a WORKED_AT edge.

### Why Relational Databases Fall Short
Three failure modes for relational DBs on highly connected data:
1. **Variable-arity relationships** — a scientific paper has co-authors, institution, funding body, dataset — can't fit cleanly in one table structure
2. **Schema evolution** — adding a new relationship type in a graph = add an edge type; in SQL = restructure schema
3. **Multi-hop traversal cost** — "authors who studied under professors who won the same prize" = multiple nested JOINs in SQL; natural path traversal in a graph

### Ontology: The Grammar of a Graph
Formal description of what kinds of things exist and what relationships are possible. Prevents nonsense from entering: "A Person can OWN a Business, but a City cannot."

Distinguishes **classes** (categories: Person, City) from **instances** (specific things: Marie Curie, Warsaw). Rules written at the class level apply to all instances automatically.

### Named Graphs: Provenance and Temporal Context
A wrapper around a set of triples that adds:
- **Who** said it (provenance)
- **When** it was true (temporal validity)

```
APJ Abdul Kalam  WAS_PRESIDENT_OF  India
  [valid: 2002–2007]
```
Without temporal context, a graph asserts things that are no longer true with no way to distinguish current from historical facts.

### Graph Inference
The ability to derive new facts never explicitly stored, by applying logical rules to existing facts.

```
Rule: IF X parent_of Y AND Y parent_of Z → X grandparent_of Z
Facts: Anna parent_of Ben, Ben parent_of Clara
Derived: Anna grandparent_of Clara
```

Scale to millions of facts + hundreds of rules = a system that surfaces knowledge no human explicitly stored. Biomedical example: "Drug A inhibits Enzyme B" + "Enzyme B required for Protein C overexpressed in Cancer D" → Drug A may treat Cancer D (auto-derived, never explicitly asserted).

### When to Use a KG vs Relational DB

| Use Knowledge Graph | Use Relational DB |
|---------------------|-------------------|
| Relationships are as important as data | Highly tabular, stable data |
| Data from many heterogeneous sources | Simple lookups or aggregations |
| Schema evolves frequently | ACID transactions required above all |
| Need multi-hop traversal | Team is SQL-proficient, data fits tables |

### Limitations
- **Incompleteness:** No KG is complete. Wikidata has millions of entities but enormous gaps.
- **Error propagation:** One incorrect fact + inference = many corrupted derived conclusions. Bad inputs propagate through the graph.

---

## New Pages Identified
- [[concepts/knowledge-graphs]] — Comprehensive concept page for the KB
- Updates to [[patterns/pattern-typed-knowledge-graph]] — add triple model, ontology, named graphs with temporal context, inference

## Related
- [[patterns/pattern-typed-knowledge-graph]] — This KB's typed edge schema; enhanced by triple model + named graphs
- [[concepts/rlm-pipeline]] — Stage 2 graph traversal; Stage 7 contradiction filter
- [[concepts/rag-systems]] — Knowledge graphs as alternative to vector RAG
- [[system/policies/contradiction-policy]] — Graph inference is the mechanism behind auto-resolution
- [[system/policies/freshness-policy]] — Named graphs' temporal validity maps to freshness decay
