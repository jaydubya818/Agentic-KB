---
title: Eval — Memory Approaches for Agentic Systems
type: evaluation
tags: [evaluation, memory, rag, vector-db, wiki, knowledge-graph, context-management]
created: 2026-04-04
updated: 2026-04-04
---

## What's Being Compared

Four approaches to giving an agent persistent memory beyond its context window:

1. **In-context** — put everything in the prompt; no external storage
2. **File-based wiki** — plaintext markdown files (Karpathy pattern); query via grep/search
3. **Vector DB (RAG)** — embeddings + vector search (Pinecone, Chroma, pgvector, etc.)
4. **Knowledge Graph** — graph database with entity relationships (LightRAG, Neo4j, etc.)

---

## Evaluation Criteria

| Criterion | Definition |
|-----------|------------|
| **Setup complexity** | Time and infrastructure to get running |
| **Query accuracy** | How reliably the right information is retrieved |
| **Token cost** | Cost to retrieve information per query |
| **Maintenance** | Effort to keep current as knowledge grows |
| **Scale limits** | Where it starts to fail as the KB grows |
| **Transparency** | Can you read/audit exactly what the agent sees? |
| **Write quality** | Can agents update the memory reliably? |

---

## Methodology

Scores (1-5) based on:
- Jay's direct experience (file-based wiki: extensive; in-context: extensive; vector DB: moderate)
- First-principles analysis of the architectural tradeoffs
- Published benchmarks where available

Context: this is evaluated for the specific use case of a **personal engineering knowledge base** used as agent context injection — not a production RAG system for end users.

---

## Scorecard

| Criterion | In-Context | File-Based Wiki | Vector DB (RAG) | Knowledge Graph |
|-----------|-----------|-----------------|-----------------|-----------------|
| Setup complexity | 5 | 4 | 2 | 1 |
| Query accuracy | 3 | 4 | 3 | 4 |
| Token cost | 2 | 5 | 4 | 3 |
| Maintenance | 5 | 4 | 2 | 2 |
| Scale limits | 1 | 3 | 5 | 5 |
| Transparency | 5 | 5 | 2 | 3 |
| Write quality | 5 | 5 | 2 | 2 |
| **TOTAL** | **26** | **30** | **20** | **20** |

---

## Criterion-by-Criterion Analysis

### Setup Complexity

**In-context (5)**: Zero setup. Paste the text into the prompt. This is the starting point for everything.

**File-based wiki (4)**: Create directories, write markdown files, write a simple grep-based query script. 30-60 minutes total setup. The CLAUDE.md schema is the hard part — once defined, adding content is trivial.

**Vector DB (2)**: Requires choosing a vector DB (Chroma, Pinecone, pgvector), setting up an embedding model (OpenAI, Voyage, local), writing an ingestion pipeline, and a query pipeline. Minimum 4-8 hours; realistically a day for a production-quality setup. Maintenance (re-indexing, embedding drift) adds ongoing cost.

**Knowledge Graph (1)**: Requires a graph database (Neo4j, or LightRAG which provides an abstraction layer), an entity extraction pipeline (LLM-based, error-prone), a relation extraction pipeline, and a Cypher/SPARQL query interface. Minimum 1-2 days; complex entity disambiguation is an unsolved problem in practice.

### Query Accuracy

**File-based wiki (4)**: Full-text search is deterministic — the word is there or it isn't. For technical content (exact tool names, framework names, code patterns), keyword search is extremely accurate. Misses: synonyms, related concepts not literally in the text. Mitigated by: good cross-linking in the wiki.

**Knowledge Graph (4)**: Once the graph is built correctly, relational queries ("what frameworks does Jay use for high-stakes features?") are powerful. The problem: entity and relation extraction is often wrong, so the graph doesn't always reflect reality.

**Vector DB (3)**: Semantic search is good for conceptual similarity but unreliable for technical precision. "What is the flag to disable rate limiting in X?" might retrieve conceptually similar but incorrect answers. Retrieval augmented by re-ranking helps but adds complexity.

**In-context (3)**: If everything fits, accuracy is perfect — the model has all the information. As context grows, attention degrades. "Lost in the middle" is real: information in the middle of a 100K context is less reliably attended to than information at the beginning or end.

### Token Cost

**File-based wiki (5)**: Query is cheap (grep/search), returns exact relevant pages (not the whole wiki), inject only relevant pages. Very efficient.

**Vector DB (4)**: Embedding queries are cheap (small models). Retrieval returns a chunk, not a page — often very token-efficient. But re-ranking and multi-query strategies add cost.

**Knowledge Graph (3)**: Graph traversal is cheap, but converting query → Cypher → results → context for LLM has overhead. Also, relationship context often requires including adjacent nodes, which expands tokens.

**In-context (2)**: If the KB is small, great. As it grows beyond 50K tokens, every query injecting the full KB burns enormous tokens. At 100K tokens of KB content × high-frequency queries = very expensive.

### Maintenance

**In-context (5)**: No maintenance — it's just a file you edit.

**File-based wiki (4)**: Add pages as you learn new things. Lint monthly. Cross-link new pages. 15-30 minutes/week for a growing KB. Agent-maintained: agents can write and update pages autonomously.

**Vector DB (2)**: Requires re-embedding when documents change; embedding drift (model updates change vectors, invalidating similarity scores); chunk size tuning as content grows; monitoring retrieval quality (it degrades silently). Ongoing maintenance is substantial.

**Knowledge Graph (2)**: Entity extraction errors accumulate; relation graphs go stale as the world changes; schema migrations are painful; query optimization as the graph grows. LightRAG reduces this somewhat but doesn't eliminate it.

### Scale Limits

**In-context (1)**: Hard limit at the model's context window. Even with 200K tokens, a growing KB will outgrow this. The limit is architectural, not just practical.

**File-based wiki (3)**: Works well up to ~500 pages with keyword search. At 1,000+ pages, query results become noisy (too many matches). Mitigated with: better organization, section headers, tags, and eventually hybrid keyword+semantic search. Not a hard limit but a quality degradation.

**Vector DB (5)**: Designed to scale. Billions of vectors in managed vector DBs (Pinecone, Weaviate). Retrieval quality actually improves with more data (more examples = better approximate neighbors).

**Knowledge Graph (5)**: Graph databases handle millions of nodes; complex relational queries remain fast. The problem at scale is data quality (more entities = more extraction errors), not the query infrastructure.

### Transparency

**In-context (5)**: The model sees exactly what you put in the prompt. You can read it. You know what it knows.

**File-based wiki (5)**: Files are plaintext. You can read every page. You know exactly what was retrieved (which files were grep-matched). Full auditability.

**Vector DB (2)**: Retrieval is probabilistic. You don't know precisely why a chunk was retrieved or what the agent "sees" from its embedding. Debugging wrong answers requires tracing the embedding space — a non-trivial operation.

**Knowledge Graph (3)**: Graph queries are deterministic (Cypher), but the entity and relation extraction that populated the graph is probabilistic. You can query what's in the graph, but errors in extraction are invisible without manual audit.

### Write Quality (Agent-Maintained)

**In-context (5)**: The agent writes to the prompt itself — perfect quality control.

**File-based wiki (5)**: Agents write markdown files via standard Write/Edit tools. The format is enforced by CLAUDE.md schema and hooks. Very high write quality; agents understand markdown natively.

**Vector DB (2)**: Writing requires generating new documents and re-embedding them. The embedding pipeline adds latency and complexity. Agents must call an embedding API and update an index, not just write a file. Error-prone in practice.

**Knowledge Graph (2)**: Writing requires entity and relation extraction, then graph insertions. Agent-generated entity extraction is unreliable. The graph can become corrupted by confident but wrong extractions.

---

## Summary Verdict

**File-based wiki wins for Jay's use case.** It provides the best balance of setup simplicity, accuracy, transparency, write quality, and maintenance — all highly weighted criteria for a personal KB used by agents.

The Karpathy pattern (this KB) is validated: plaintext markdown with structure, grep-based search, MCP server for agent access. The scale limit at 500+ pages is a real constraint but Jay is years away from it at current growth rates.

**Vector DB** is the right answer when:
- Scale exceeds hundreds of documents (thousands+)
- The content is document-heavy (PDFs, long-form articles) where exact terms aren't reliable
- Semantic similarity matters more than keyword precision
- The team has infrastructure for embedding pipelines

**In-context** is the right answer when:
- The total knowledge fits under 100K tokens (early-stage KB, specialized domain)
- You want zero maintenance overhead
- You're prototyping and don't want storage infrastructure

**Knowledge Graph** is the right answer when:
- Relational queries are your primary access pattern ("what frameworks relate to X?", "what did Jay use for project Y?")
- You have a large, well-defined entity schema
- You're willing to invest in LightRAG or similar to reduce the implementation burden
- You need to answer questions that require multi-hop reasoning across relationships

**Hybrid (longer term)**: file-based wiki + optional semantic search layer. Keep the wiki as source of truth (transparent, agent-writable, version-controlled). Add embeddings lazily for semantic similarity queries without replacing the primary grep-based access pattern.

---

## When to Re-evaluate

Re-evaluate when:
- Jay's wiki grows beyond 300 pages (keyword search starts producing noisy results)
- LightRAG or a successor dramatically reduces knowledge graph setup cost
- Anthropic releases a native memory feature in Claude Code that manages persistence automatically
- A semantic search layer can be added to the file-based wiki with <1 hour setup (feasibility test)

Target re-evaluation date: when wiki hits 200 pages (current: ~20 pages).

---

## Sources

- [[entities/andrej-karpathy]] — file-based wiki pattern origin
- [[frameworks/framework-claude-code]] — context management and autoCompactThreshold
- [[recipes/recipe-llm-wiki-setup]] — implementation of the file-based wiki
- [[recipes/recipe-context-compression]] — in-context memory management
- [[entities/jay-west-agent-stack]] — Jay's actual memory implementation
