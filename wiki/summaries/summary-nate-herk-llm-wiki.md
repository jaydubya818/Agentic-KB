---
title: Set Up Your LLM Knowledge Base in 5 Minutes (Nate Herk)
type: summary
source_file: raw/transcripts/nate-herk-llm-wiki.md
author: Nate Herk | AI Automation
date_ingested: 2026-04-04
tags: [llm-wiki, karpathy, knowledge-base, obsidian, hot-cache, token-efficiency, second-brain]
key_concepts: [hot-cache, token-efficiency, obsidian-web-clipper, linting, wiki-vs-rag, scale-limits, executive-assistant]
confidence: medium
---

# Set Up Your LLM Knowledge Base in 5 Minutes (Nate Herk)

## Key Purpose

Practical 5-minute setup walkthrough of the Karpathy LLM wiki pattern. Emphasizes simplicity, token efficiency, and the hot cache concept. Notable for specific production metrics and a clear comparison with RAG.

## Key Quantitative Insights

- One user turned 383 scattered files and 100+ meeting transcripts into a compact wiki and **dropped token usage by 95%** when querying with Claude.
- Ingesting one long article (AI2027) created 23 wiki pages: 6 people, 5 organizations, 1 AI systems page, plus concepts and analysis.
- 36 YouTube videos ingested in 14 minutes using batch processing.

## Hot Cache Concept

A `~500-character` cache of most-recent/most-used context. The agent reads hot.md first on every query, then index, then domain subindex, then searches. Reduces the need to crawl wiki pages on common queries.

Especially valuable for executive assistant use cases: "Point an executive assistant's CLAUDE.md at the wiki path. The agent reads hot.md first, then index, then domain subindex, then searches. Instruction: 'Don't read from the wiki unless you actually need it.'"

## Wiki vs. RAG Comparison

| Dimension | LLM Wiki | Traditional RAG |
|-----------|----------|----------------|
| Retrieval | Reads indexes, follows links | Similarity search |
| Relationships | Explicit links | Implicit proximity |
| Infrastructure | Markdown files | Vector DB + embeddings |
| Cost | Tokens only | Compute + storage |
| Maintenance | Run lint | Re-embed on change |
| Scale limit | Hundreds of pages | Millions of documents |

Scale note: "If you have hundreds of pages with good indexes, you're fine with wiki. But if you're getting up to millions of documents, you'll want traditional RAG, at least for now."

## Linting

"Run LLM health checks to find inconsistent data, impute missing data with web searches, find interesting connections for new article candidates. Run weekly or on demand."

## Vault Structure

Herk's implementation:
- Obsidian vault → raw/ folder + wiki/ folder + CLAUDE.md + index.md + log.md
- Two vaults: YouTube transcripts KB + personal second brain (Herk Brain)
- Obsidian Web Clipper for ingesting articles from browser

## Karpathy's Intentional Vagueness

"Karpathy gist: left vague deliberately so builders can customize." The pattern is a starting point, not a specification. Each implementation can adapt the schema, page types, and workflows to the domain.

## Simplicity Emphasis

"You don't need a fancy vector database, embeddings, or complex infrastructure. It's literally just a folder with markdown files." — The lack of infrastructure is a feature, not a limitation.

## Related Concepts

- [[wiki/summaries/summary-karpathy-llm-wiki-gist]]
- [[wiki/summaries/summary-karpathy-llm-wiki-video]]

## Sources

- `raw/transcripts/nate-herk-llm-wiki.md`
