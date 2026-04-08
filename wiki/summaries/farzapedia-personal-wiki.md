---
id: 01KNNVX2R988F60A06J7C5ESH2
title: Farzapedia Personal Wiki
type: summary
tags: [memory, personal-knowledge-management, agentic, retrieval, librarian-pattern]
source: raw/transcript/farzapedia-personal-wiki.md
source_type: transcript
source_url: https://x.com/farzaa
date_ingested: 2026-04-07
created: 2026-04-07
updated: 2026-04-07
related:
  - [[concepts/memory-systems]]
  - [[concepts/agent-loops]]
  - [[concepts/task-decomposition]]
---

# Farzapedia Personal Wiki

## Source Overview
A personal wiki system built by Farzaa, inspired by [[andrej-karpathy]]'s [[llm-wiki]] pattern. The system ingests personal data from iMessages, Apple Notes, and diary entries into a navigable wiki. Retrieval is handled by a WikiQuery agent that reads an index file and navigates articles agentically — no vector search or RAG involved.

## Key Ideas

### Librarian Pattern
The core retrieval mechanism is a "Librarian" agent that:
1. Reads a top-level `index.md` to understand what articles exist
2. Navigates to relevant articles directly based on the query
3. Answers questions from the article content

This is an agentic traversal approach rather than embedding-based similarity search.

### No RAG — Agentic Navigation Instead
Unlike typical personal knowledge management systems that chunk content and retrieve by embedding similarity, this system relies on structured article navigation. The agent reasons about *which* article to read rather than performing a vector lookup. This trades retrieval latency for interpretability and structural coherence.

### Personal Data Sources
- iMessages
- Apple Notes
- Diary entries

These are presumably pre-processed and structured into wiki-style articles before the agent interacts with them.

### [[andrej-karpathy]] LLM Wiki Pattern
The underlying pattern (attributed to Andrej Karpathy) involves maintaining a human-readable wiki that an LLM can navigate as a first-class agent task — treating the wiki as a structured knowledge graph traversed via reasoning rather than a flat vector store.

## Limitations / Open Questions
- Source is very brief (tweet/short post level); implementation details are sparse
- Unclear how ingestion/structuring of raw personal data (iMessages, Notes) is handled
- Index design and article schema are not specified
- Scalability of agentic navigation vs. RAG at large article counts is not addressed

## Relevance to This KB
Directly relevant to the [[concepts/memory-systems]] concept — demonstrates a non-RAG approach to personal long-term memory using agentic navigation. The Librarian pattern is a concrete instantiation of an agent-as-retriever design worth tracking.
