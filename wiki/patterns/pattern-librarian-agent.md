---
title: Librarian Agent Pattern
type: pattern
tags: [agentic, memory, retrieval, personal-knowledge-management, orchestration]
confidence: low
sources:
  - [[summaries/farzapedia-personal-wiki]]
created: 2026-04-07
updated: 2026-04-07
related:
  - [[concepts/memory-systems]]
  - [[concepts/agent-loops]]
  - [[concepts/task-decomposition]]
status: evolving
---

# Librarian Agent Pattern

## Intent
An agent navigates a structured knowledge base by reading an index and following article links — mirroring how a librarian traverses a physical library — rather than using embedding-based retrieval (RAG).

## Motivation
RAG retrieves by semantic similarity, which can miss structural or relational context. A librarian agent reads the index first, understands what exists and how it is organized, then deliberately navigates to relevant articles. This preserves document relationships and avoids embedding maintenance overhead.

## Structure
1. **Index read** — Agent reads `index.md` (or equivalent catalog) to understand available knowledge and structure.
2. **Agentic navigation** — Agent selects and reads specific articles based on the query and index metadata, following links as needed.
3. **Synthesis** — Agent composes a response from the retrieved articles.

## When to Use
- Knowledge base is well-structured with a maintained index
- Relationships between articles matter for answering queries
- Corpus is small-to-medium (fits within navigable agentic loops)
- Avoiding RAG infrastructure complexity is desirable

## When NOT to Use
- Corpus is very large (navigation becomes expensive)
- Articles are unstructured or poorly indexed
- Latency is critical (agentic traversal adds turns)

## Known Uses
- **Farzapedia** (Farzaa/@farzaa) — personal wiki over iMessages, Apple Notes, diary entries
- **This KB** — WikiQuery agent reads `index.md` and navigates wiki articles agentically
- **Karpathy LLM wiki pattern** — original inspiration cited by Farzaa

## Notes
Also called the **WikiQuery pattern** or **index-navigation pattern**. Confidence is low — limited published detail on implementation specifics. Treat as a validated concept awaiting deeper documentation.
