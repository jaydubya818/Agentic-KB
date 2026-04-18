---
title: RAG Systems (Retrieval-Augmented Generation)
type: concept
tags: [memory, tool-use, context-management, agentic, evaluation, rag]
confidence: high
sources:
  - "[[summaries/siagian-agentic-engineer-roadmap-2026]]"
  - "[[summaries/summary-nate-herk-llm-wiki]]"
  - "[[summaries/andrej-karpathy-thinks-rag-is-broken]]"
created: 2026-04-10
updated: 2026-04-10
related:
  - "[[concepts/memory-systems]]"
  - "[[concepts/context-management]]"
  - "[[concepts/tool-use]]"
  - "[[concepts/llm-as-judge]]"
  - "[[concepts/llm-wiki-pattern]]"
  - "[[concepts/guardrails]]"
status: stable
---

# RAG Systems (Retrieval-Augmented Generation)

## TL;DR

RAG injects external knowledge into a prompt at query time by retrieving relevant documents from a store, rather than baking that knowledge into model weights. It reduces hallucinations, enables private/fresh knowledge, and provides citable evidence for agent decisions — but introduces its own failure modes around chunking, retrieval quality, and index staleness.

---

## Definition

RAG (Retrieval-Augmented Generation) is an architecture where a retrieval system fetches relevant content from an external knowledge store and injects it into the LLM's context before generation. The model then synthesizes a response grounded in that retrieved content. It decouples *what the model knows* from *what the model can access*, allowing knowledge to be updated independently of model weights.

In agentic systems, RAG is not just a Q&A layer — it provides evidence for tool routing decisions, grounds multi-step planning, and acts as an external long-term memory that complements the agent's in-context working state.

---

## How It Works

### Core Pipeline

```
User query
    ↓
[Query processing] — rewrite, expand, classify
    ↓
[Retrieval] — embed query → ANN search against index
    ↓
[Re-ranking] — cross-encoder or LLM judge scores candidates
    ↓
[Context packing] — budget-aware selection and truncation
    ↓
[Generation] — LLM synthesizes answer with injected context
    ↓
[Citation verification] — validate claims map to retrieved chunks
```

### Indexing Pipeline (offline)

```
Raw documents
    ↓
[Parsing] — PDF/DOCX/HTML → clean text (e.g. MarkItDown)
    ↓
[Chunking] — split into semantically coherent units
    ↓
[Embedding] — encode chunks into vectors
    ↓
[Index storage] — vector store (Qdrant, Pinecone, pgvector, etc.)
    ↓
[Metadata tagging] — source, date, tenant, doc type, permissions
```

---

## Key Variants

### 1. Dense Retrieval
Uses embedding similarity (ANN search). Strong on semantic matching — finds relevant chunks even when keywords differ. Fails on exact technical terms, product names, IDs.

### 2. Sparse Retrieval (BM25)
Term-frequency-based. Excels at exact keyword and phrase matching. Misses semantic equivalence. Fast and interpretable.

### 3. Hybrid Retrieval (recommended default)
Combines dense + sparse scores (e.g. RRF — Reciprocal Rank Fusion). Outperforms either alone, especially in technical domains. Most production systems use hybrid, then re-rank.

### 4. Re-ranking
A second, stronger model (cross-encoder or LLM judge) re-scores the top-k retrieved candidates against the query. Improves precision significantly. Costs extra latency — cache frequent queries to amortize.

### 5. HyDE (Hypothetical Document Embedding)
Generate a hypothetical answer, embed that instead of the raw query. Bridges the query-document vocabulary gap. Useful when queries are short/sparse and documents are long.

### 6. Multi-hop RAG
For complex questions requiring synthesis across multiple sources. Retrieve → generate intermediate answer → retrieve again using that answer. Risk: error amplification across hops.

---

## Chunking Strategy

Chunk size is one of the highest-leverage decisions in a RAG system.

| Approach | Chunk Size | Best For |
|----------|-----------|----------|
| Small chunks | 100–300 tokens | High-precision retrieval, dense facts |
| Medium chunks | 300–800 tokens | General purpose; Siagian's recommended starting point |
| Large chunks | 800–1500 tokens | Narrative content, preserving document structure |
| Semantic chunks | Variable | Split by headings/sections; preserves coherence |

**Rules of thumb:**
- Too small → context lost, retrieval noisy
- Too large → retrieval imprecise, context bloated
- Use 10–20% overlap between chunks to avoid splitting related content
- Always measure retrieval quality empirically; don't guess

---

## Context Budgeting for RAG

RAG content competes with system instructions, conversation history, and other memory classes for context window space. Enforce explicit budgets:

```
Recommended allocation (Siagian):
- Direct matches:    60%
- Graph/related:     20%
- Hot cache:          5%
- Citations/refs:    15%
```

Pack articles budget-aware: keep frontmatter + first 3 paragraphs when an article exceeds its per-article budget. Store large raw outputs externally and return reference IDs.

See [[concepts/context-management]] for full tiered loading strategy.

---

## Grounded Generation & Citations

The defining quality gate for production RAG. Claims in the generated response should be traceable to specific retrieved chunks.

**Implementation:**
1. Format retrieved chunks with IDs: `[SOURCE-001] ... content ...`
2. Require model to cite IDs inline: "According to [SOURCE-001], ..."
3. Post-generation: verify citation IDs exist and content is not misrepresented
4. "No relevant evidence" condition: model must abstain or ask a clarifying question rather than hallucinate

**Why it matters:** unverified citations are hallucination in disguise. A model that sounds grounded but cites the wrong chunk (or a non-existent one) is more dangerous than an obviously confused model.

---

## Metadata Filtering

Metadata filtering restricts retrieval by fields applied before or during vector search — not by the model, by the application layer.

**Required filters for enterprise RAG:**
- `tenant_id` — prevents cross-tenant data leaks (must be enforced in code, not prompt)
- `permissions` — user's access level gates which chunks are retrievable
- `doc_type` — restrict to relevant source types for the query
- `date` / `updated_at` — freshness filtering; exclude stale docs for time-sensitive queries
- `language` — avoid multilingual noise

**Security requirement:** metadata filters must be enforced in the retrieval layer, not the LLM. A model instructed to "only use documents from tenant X" can be prompted around. A query filter cannot.

---

## Index Freshness

Stale indexes cause wrong answers. Treat freshness as a production requirement, not a nice-to-have.

| Strategy | When to Use |
|----------|-------------|
| Full re-index | Small corpora; batch updates |
| Incremental indexing | Detect changed docs, re-embed only affected chunks; update metadata |
| Streaming ingestion | High-change sources (news, logs, live docs); near-real-time |
| Freshness scoring | Surface recency as a retrieval signal; downrank stale chunks |

Track document versions and timestamps. Monitor "index age" per source. See [[system/policies/freshness-policy]] for the Agentic-KB's freshness scoring model.

---

## Evaluation Metrics

### Retrieval Quality
| Metric | What It Measures |
|--------|-----------------|
| Recall@k | % of relevant docs in top-k results |
| Precision@k | % of top-k results that are relevant |
| MRR | Mean Reciprocal Rank — how early the first relevant result appears |
| nDCG | Normalized Discounted Cumulative Gain — weighted by rank position |

### Answer Quality
| Metric | What It Measures |
|--------|-----------------|
| Factuality | Are claims supported by retrieved content? |
| Citation correctness | Do citations map to the right chunks? |
| Task success | Did the user get what they needed? |
| Hallucination rate | % of claims with no source in retrieved context |

**Practical approach:** curate a small golden dataset (50–200 query/expected-source pairs), measure retrieval first, then answer quality. Error analysis on real query logs reveals more than synthetic benchmarks.

---

## Common Failure Modes

| Failure | Root Cause | Fix |
|---------|-----------|-----|
| Irrelevant chunks returned | Weak embeddings, bad top-k, no re-ranking | Hybrid retrieval + re-ranking |
| Missing relevant chunks | Bad chunking, low recall@k | Larger chunks, better chunking strategy, increase k |
| Stale information | No freshness management | Incremental indexing + freshness scoring |
| Cross-tenant data leak | No metadata filtering | Enforce filters in query layer (code, not prompt) |
| Hallucinated citations | No citation verification | Post-generation citation check |
| Query-document mismatch | User asks "how", retrieves "what" | Query rewriting / HyDE / hybrid retrieval |
| Context bloat | top-k too high | Budget-aware context packing + re-ranking |
| Noisy retrieval stored as memory | Unvalidated RAG outputs saved to KB | Validation gate before writing; "only store what you can justify" |

---

## RAG vs [[llm-wiki]] ([[andrej-karpathy]] Pattern)

This KB exists partly because RAG has known failure modes. Key comparison:

| Dimension | RAG | [[llm-wiki]] (this KB) |
|-----------|-----|---------------------|
| Knowledge structure | Flat chunks | Interconnected pages with typed links |
| Update mechanism | Re-embed on change | LLM rewrites/updates page in place |
| Retrieval | ANN similarity search | Explicit link traversal + index navigation |
| Cross-source synthesis | Implicit (in context) | Explicit (synthesis pages) |
| Contradiction handling | None (silently retrieves both) | Explicit contradiction flags in log |
| Compounding | None — each query starts fresh | Each ingest enriches existing pages |
| Best for | Large unstructured corpora | Curated, structured, compounding knowledge |

[[andrej-karpathy]]'s argument: RAG is broken for *compounding* knowledge because it treats each query as stateless. The [[llm-wiki]] pattern builds knowledge that gets better over time. See [[concepts/llm-wiki-pattern]], [[summaries/andrej-karpathy-thinks-rag-is-broken]].

**Verdict for Jay's stack:** use the [[llm-wiki]] as the primary knowledge layer; RAG is appropriate when the source corpus is too large to maintain as wiki pages (e.g., large codebases, document repositories).

---

## When To Use RAG

- Large external corpora you can't maintain as wiki pages (thousands of documents)
- Frequently-updated content where manual wiki maintenance would lag
- Private enterprise knowledge needing secure, permission-scoped retrieval
- Queries that require citing specific source passages
- When semantic search across unstructured text is the primary access pattern

## When NOT To Use RAG

- When the KB is small enough to load in context directly (the [[pattern-hot-cache]] pattern is faster and more reliable)
- When knowledge needs to compound and cross-reference (use [[llm-wiki]] instead)
- When you need deterministic, reproducible retrieval (RAG is probabilistic)
- When you don't have the engineering bandwidth to manage chunking + indexing + freshness properly — a bad RAG system is worse than no RAG

---

## Risks & Pitfalls

- **Hallucination laundering** — model generates plausible-sounding content and attributes it to a retrieved chunk it didn't actually use; citation verification is the only defense
- **Retrieval feedback loops** — if agents store RAG outputs back to the knowledge base without validation, errors compound over time
- **Overconfidence on stale data** — model presents outdated information confidently because the index hasn't been refreshed
- **Prompt injection via retrieved content** — malicious content in indexed docs can redirect agent behavior; treat retrieved text as untrusted data (see [[concepts/guardrails]])
- **Metadata filter bypass** — relying on the LLM to enforce access controls is insufficient; enforce in the retrieval layer

---

## Related Concepts

- [[concepts/memory-systems]] — RAG as one of four memory approaches (in-context / file-wiki / vector / knowledge graph)
- [[concepts/context-management]] — Budget allocation between RAG content and other context classes
- [[concepts/llm-wiki-pattern]] — The [[llm-wiki]] as an alternative to RAG for compounding knowledge
- [[concepts/llm-as-judge]] — Using LLMs for re-ranking and citation verification
- [[concepts/guardrails]] — Prompt injection defense for retrieved content
- [[concepts/tool-use]] — RAG as a tool in an agentic pipeline
- [[concepts/observability]] — Tracing retrieval quality in production

---

## Sources

- [[summaries/siagian-agentic-engineer-roadmap-2026]] — Section 7: RAG Systems
- [[summaries/andrej-karpathy-thinks-rag-is-broken]] — [[llm-wiki]] as RAG alternative
- [[summaries/summary-nate-herk-llm-wiki]] — [[pattern-hot-cache]] pattern; token efficiency vs RAG
- [[summaries/langchain-deepagents-production]] — Scoped memory and RAG in [[framework-langgraph]] production stacks
