---
title: Knowledge Graphs
type: concept
tags: [knowledge-graph, memory, agentic, context-management, rag-systems, multi-agent]
confidence: high
sources:
  - [[summaries/summary-knowledge-graphs-explainer]]
  - [[summaries/summary-llm-wiki-v2]]
created: 2026-04-12
updated: 2026-04-12
related:
  - [[patterns/pattern-typed-knowledge-graph]]
  - [[concepts/rlm-pipeline]]
  - [[concepts/rag-systems]]
  - [[concepts/reciprocal-rank-fusion]]
  - [[system/policies/contradiction-policy]]
status: stable
---

# Knowledge Graphs

## TL;DR
A structured representation of entities and their relationships stored as a network rather than a table — enabling multi-hop reasoning, inference of unstated facts, and traversal of connections that keyword or vector search cannot find.

## Definition
A knowledge graph is a graph-structured database where nodes represent entities (people, places, concepts, products) and edges represent labeled, directed relationships between them. The fundamental unit is the **triple**: Subject–Predicate–Object. Unlike relational databases, knowledge graphs excel when relationships are as important as the data itself, schemas evolve, or queries require traversing multiple hops.

## How It Works

### The Triple: Smallest Unit of Knowledge
```
Marie Curie   BORN_IN      Warsaw
Warsaw        CAPITAL_OF   Poland
Poland        LOCATED_IN   Europe
```
From three explicit triples, a machine derives: Marie Curie was born in a European capital. This chain of reasoning — never explicitly stored — is the core superpower of the knowledge graph.

### Structure
**Nodes (entities/vertices):** Things — persons, cities, concepts, products, chemical compounds. Each has a unique identity. Carry **properties** (attributes): a Person node carries birth_year; a Company node carries founding_date.

**Edges (relationships/predicates):** Connect two nodes. Always **directed** and always **labeled**. Direction is semantic: "Marie Curie BORN_IN Warsaw" is a different fact from "Warsaw BORN_IN Marie Curie." Edges also carry properties: a WORKED_AT edge carries start_date and end_date.

**Properties (literals/attributes):** Data on nodes or edges. The boundary between nodes and properties: if something needs its own relationships, make it a node; if it's just a value, make it a property.

### Ontology: The Grammar
An ontology defines what kinds of things exist and what relationships are valid between them. It prevents nonsense from entering the graph.

```
ONTOLOGY RULES:
  Person  CAN  own       → Business
  Business CAN supply_to → Business | Hotel
  City    CANNOT own     → Business  ← prevents nonsense
```

**Classes vs. Instances:**
- Class: a category of things (Person, City, Company)
- Instance: a specific thing (Marie Curie, Warsaw, Google)

Rules written at the class level apply automatically to every instance. An ontology makes the graph computable — not just searchable.

### Named Graphs: Provenance and Temporal Context
A named graph wraps a set of triples with metadata about who asserted them and when they were valid:

```yaml
triple: "APJ Abdul Kalam  WAS_PRESIDENT_OF  India"
context:
  valid_from: 2002
  valid_to: 2007
  asserted_by: Wikipedia
  confidence: 0.98
```

Without temporal context, a graph has no way to distinguish current facts from historical ones. Without provenance, it can't distinguish high-authority sources from speculation.

### Graph Inference
The ability to derive new facts that were never explicitly stored, by applying logical rules to existing facts:

```
Rule:  IF (X parent_of Y) AND (Y parent_of Z) → (X grandparent_of Z)
Facts: Anna parent_of Ben, Ben parent_of Clara
→ Derived: Anna grandparent_of Clara  [never stored, auto-computed]
```

Scale this to millions of facts + hundreds of rules = a system that surfaces knowledge no human explicitly encoded. The biomedical case study:
```
Stored:  Drug A  inhibits  Enzyme B
Stored:  Enzyme B  required_for  Protein C
Stored:  Protein C  overexpressed_in  Cancer D
Derived: Drug A  MAY_TREAT  Cancer D  [never asserted by any researcher]
```

### Querying: Multi-Hop Traversal
Instead of row lookups, graph queries follow relationship chains:

```sparql
# SQL (3 nested JOINs):
SELECT books.title FROM books
JOIN authors ON books.author_id = authors.id
JOIN universities ON authors.university_id = universities.id
JOIN cities ON universities.city_id = cities.id
WHERE cities.name = 'Warsaw';

# Graph (natural path):
MATCH (book)-[:WRITTEN_BY]->(author)-[:STUDIED_AT]->(uni)-[:LOCATED_IN]->(city {name: "Warsaw"})
RETURN book.title
```

## Key Variants

**Property Graph (Neo4j, TinkerPop):** Nodes and edges carry arbitrary key-value properties. Query language: Cypher or Gremlin. Best for: operational knowledge graphs, recommendation engines, fraud detection.

**RDF Graph (W3C standard):** Triples only. Properties are also triples. Query language: SPARQL. Best for: semantic web, interoperability across organizations, Linked Data.

**Hypergraph:** Edges can connect more than two nodes simultaneously. Best for: scientific data (a reaction involves multiple reactants and products simultaneously).

**Labeled Property Graph (LPG):** Most practical variant for agentic systems. Nodes and edges have type labels plus a property bag. This is what `graphify-out/graph.json` approximates.

## When To Use

**Use a knowledge graph when:**
- Relationships between data are as important as the data itself
- Data comes from many heterogeneous sources with different schemas
- You need to traverse chains of relationships (multi-hop queries)
- Schema evolves frequently — adding a new relationship type = add an edge type
- You want to derive new facts by reasoning over existing ones (inference)

**Stick with a relational database when:**
- Data is highly tabular and stable
- Queries are simple lookups or aggregations
- ACID transactional guarantees are required above all else
- Your team is SQL-proficient and data fits the table model cleanly

**Prefer vector/RAG when:**
- You need semantic similarity retrieval over unstructured text
- You don't have the structure to define an ontology
- Query patterns are more "find similar things" than "traverse relationships"

## Risks & Pitfalls

**Incompleteness:** No knowledge graph is complete. Wikidata has millions of entities but enormous gaps. Missing nodes and edges create silent reasoning failures — the graph returns "no path found" when the true answer exists but isn't represented.

**Error propagation via inference:** One incorrect fact, propagated through inference rules, can corrupt many derived conclusions. A bad input is worse in a KG than in a flat database precisely because inference amplifies it. Confidence scoring on edges is the mitigation.

**Ontology rigidity:** A badly designed ontology is hard to change once the graph is populated. Under-specified ontologies let nonsense in; over-specified ones make it impossible to represent edge cases. Design ontologies incrementally.

**Temporal staleness:** Without named graphs tracking `valid_from`/`valid_to`, the graph asserts historical facts as current truths. This is the knowledge graph equivalent of [[system/policies/freshness-policy]] decay — facts must be timestamped or they become liabilities.

## Application to This KB

This KB already implements several knowledge graph principles:

| KG Concept | KB Implementation |
|---|---|
| Typed edges | [[patterns/pattern-typed-knowledge-graph]] |
| Confidence on edges | `source-trust-policy.md` (page-level), `pattern-per-claim-confidence` (claim-level) |
| Temporal validity | `freshness-policy.md` exponential decay + `last_checked` frontmatter |
| Provenance | `source-trust-policy.md` `extracted_by: human | llm` |
| Inference | `contradiction-policy.md` v2.1 Tier 1 auto-resolution |
| Ontology | Relationship type taxonomy in `pattern-typed-knowledge-graph` |
| Multi-hop traversal | RLM Pipeline Stage 2 graph retriever |

**Gap remaining:** Named graph temporal context on individual edges (`valid_from`, `valid_to`, `asserted_by`) is not yet implemented in `typed-edges.json`. See [[patterns/pattern-typed-knowledge-graph]] for the updated edge schema.

## Real-World Scale
- **Google Knowledge Graph:** Tens of billions of facts across hundreds of millions of entities. Powers search result cards, Google Assistant, Google Maps.
- **Wikidata:** ~100M+ statements, open, community-maintained.
- **Biomedical KGs:** Drug databases + genomic databases + clinical literature integrated into one graph — enabling drug repurposing and adverse interaction prediction that no single database could support alone.

## Related Concepts
- [[patterns/pattern-typed-knowledge-graph]] — This KB's implementation: typed directed edges with confidence scores
- [[concepts/rlm-pipeline]] — Stage 2 graph traversal retriever; Stage 7 contradiction filter via `contradicts` edges
- [[concepts/rag-systems]] — Knowledge graphs vs. vector RAG: complementary, not competing
- [[concepts/reciprocal-rank-fusion]] — Algorithm for merging graph traversal results with BM25 + vector results
- [[system/policies/contradiction-policy]] — Contradiction detection using graph edges; Tier 1 inference-based auto-resolution
- [[system/policies/freshness-policy]] — Named graph temporal validity maps to freshness decay

## Sources
- [[summaries/summary-knowledge-graphs-explainer]] — Primary explainer source
- [[summaries/summary-llm-wiki-v2]] — [[llm-wiki]] v2: knowledge graphs as memory substrate
