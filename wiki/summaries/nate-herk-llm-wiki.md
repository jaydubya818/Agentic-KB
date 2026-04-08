---
id: 01KNNVX2RAV3T55J7WA0PVDGX4
title: "Set Up Your LLM Knowledge Base in 5 Minutes (Nate Herk)"
type: summary
tags: [llm-wiki, knowledge-base, obsidian, claude-code, rag, token-efficiency, hot-cache]
source: raw/transcripts/nate-herk-llm-wiki.md
author: Nate Herk | AI Automation
date: 2026-04
created: 2026-04-07
updated: 2026-04-07
related:
  - "[[concepts/memory-systems]]"
  - "[[concepts/context-management]]"
  - "[[concepts/multi-agent-systems]]"
---

# Set Up Your LLM Knowledge Base in 5 Minutes (Nate Herk)

## Source
YouTube video by Nate Herk | AI Automation, covering [[andrej-karpathy]]'s viral post about LLM wikis as a replacement for or complement to traditional RAG.

## Core Thesis
A plain folder of markdown files — organized as a wiki with an index, [[pattern-hot-cache]], and CLAUDE.md — is sufficient infrastructure for an LLM knowledge base at hundreds-of-pages scale. No vector database or embeddings required. Token efficiency gains can be dramatic (one user reduced token usage by 95%).

## Key Concepts

### Vault Structure
- `raw/` — immutable source files (articles, transcripts, docs)
- `wiki/` — LLM-owned pages (concepts, summaries, syntheses, etc.)
- `CLAUDE.md` — schema and workflow instructions
- `index.md` — master catalog, LLM-maintained
- `log.md` — append-only operation log

### Hot Cache
A ~500-character snippet of most-recent or most-used context. Reduces the need to crawl wiki pages on common queries. Especially valuable for executive assistant agents. Agent reads `hot.md` first before touching the broader index.

### Agent Retrieval Pattern
Connect an executive assistant agent by pointing its CLAUDE.md at the wiki path. Retrieval order: `hot.md` → `index.md` → domain subindex → targeted page search. Instruction pattern: "Don't read from the wiki unless you actually need it."

### [[llm-wiki]] vs Traditional RAG

| Dimension | LLM Wiki | Traditional RAG |
|-----------|----------|-----------------|
| Retrieval | Reads indexes, follows links | Similarity search |
| Relationships | Explicit links | Implicit proximity |
| Infrastructure | Markdown files | Vector DB + embeddings |
| Cost | Tokens only | Compute + storage |
| Maintenance | Run lint | Re-embed on change |
| Scale | Hundreds of pages | Millions of docs |

### Linting / Wiki Health
Run LLM health checks weekly or on demand to: find inconsistent data, impute missing fields via web search, surface interesting cross-page connections as new article candidates.

### Scale Limits
Wiki graph approach works well up to hundreds of pages with good indexes. Beyond millions of documents, traditional RAG remains necessary ("at least for now").

## Practical Notes
- Nate's setup: two vaults — YouTube transcripts KB + personal second brain ("Herk Brain")
- Obsidian Web Clipper used for ingesting web articles into `raw/`
- Ingesting one long article (AI2027) produced 23 wiki pages in ~10 minutes
- Batch ingest of 36 YouTube videos took ~14 minutes
- [[andrej-karpathy]]'s original gist was intentionally vague to let builders customize

## Relevance to This KB
This source directly describes the architecture pattern this KB implements. The vault structure, hot cache, CLAUDE.md workflow, and lint cycle are all first-class features of the current setup.