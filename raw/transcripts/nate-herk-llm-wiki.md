---
title: "Set Up Your LLM Knowledge Base in 5 Minutes (Nate Herk)"
source: YouTube video transcript
author: Nate Herk | AI Automation
date: 2026-04
tags: [llm-wiki, karpathy, knowledge-base, obsidian, claude-code, second-brain]
---

# Transcript: Set Up Your LLM Knowledge Base in 5 Minutes

## Key Concepts Covered
- Karpathy's post going viral on X
- Simple 5-minute setup walkthrough
- Obsidian Web Clipper for ingesting articles
- Graph view for visualizing relationships
- Hot cache concept for executive assistants
- Linting for wiki health
- LLM wiki vs traditional RAG comparison
- Personal second brain vs topic-specific KB
- Token efficiency (one user dropped 95% by switching from RAG to wiki)

## Key Insights

### On simplicity
"You don't need a fancy vector database, embeddings, or complex infrastructure. It's literally just a folder with markdown files."

### On token efficiency
One X user turned 383 scattered files and 100+ meeting transcripts into a compact wiki and dropped token usage by 95% when querying with Claude.

### On hot cache
A ~500-character cache of most-recent/most-used context. Reduces need to crawl wiki pages on common queries. Especially valuable for executive assistant use cases.

### On linting
Run LLM health checks to find inconsistent data, impute missing data with web searches, find interesting connections for new article candidates. Run weekly or on demand.

### LLM Wiki vs RAG Comparison
| Dimension | LLM Wiki | Traditional RAG |
|-----------|----------|----------------|
| Retrieval | Reads indexes, follows links | Similarity search |
| Relationships | Explicit links | Implicit proximity |
| Infrastructure | Markdown files | Vector DB + embeddings |
| Cost | Tokens only | Compute + storage |
| Maintenance | Run lint | Re-embed on change |
| Scale | Hundreds of pages (fine) | Millions of docs |

### On scale limits
"If you have hundreds of pages with good indexes, you're fine with wiki graph. But if you're getting up to millions of documents, you'll want traditional RAG, at least for now."

### On connecting to agents
Point an executive assistant's CLAUDE.md at the wiki path. The agent reads hot.md first, then index, then domain subindex, then searches. Instruction: "Don't read from the wiki unless you actually need it."

## Raw Transcript Key Sections
- 36 YouTube videos organized into knowledge system
- Two vaults: YouTube transcripts KB + personal second brain (Herk Brain)
- Karpathy gist: left vague deliberately so builders can customize
- Obsidian vault → raw/ folder + wiki/ folder + CLAUDE.md + index.md + log.md
- Ingested AI2027 article → created 23 wiki pages (6 people, 5 orgs, 1 AI systems, concepts, analysis)
- Ingest took 10 minutes for one long article, 14 minutes for 36 YouTube videos in batch
