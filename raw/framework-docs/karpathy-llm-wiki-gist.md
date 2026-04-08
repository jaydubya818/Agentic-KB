---
id: 01KNNVX2RJM0XV3537SWZRMYP3
title: "Karpathy LLM Wiki Pattern — Gist"
source: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
author: Andrej Karpathy
date: 2026
tags: [llm-wiki, karpathy, knowledge-base, architecture, schema]
---

# Karpathy's LLM Wiki Pattern

## Core Architecture
Raw Sources → Wiki (LLM-generated markdown) → Schema (CLAUDE.md)

## Key Principles
- Raw sources are immutable — LLM reads, never writes
- Wiki is entirely LLM-owned — you never write it manually
- Schema co-evolves with you as you learn what works

## Operations
- **Ingest**: Process new sources one at a time, update 10-15 wiki pages per document
- **Query**: Ask questions; good answers get filed back as new pages
- **Lint**: Health check — contradictions, orphans, stale claims, gap identification

## Special Files
- **index.md** — catalog organized by category with one-line summaries
- **log.md** — append-only chronological record with parseable timestamps

## Why It Works
The pattern transfers tedious maintenance (cross-references, consistency, updates) to LLMs while keeping intellectual work (curation, analysis, direction) with humans.

## Karpathy's Note
"Left vague so that you can hack it and customize it to your own project."

## Implementation Notes
- Use Obsidian as IDE/frontend
- Enable local image downloads to avoid broken URLs
- Graph view shows relationship clusters
- Git provides version history for free
- At ~100 articles / 400K words, no RAG needed — LLM auto-maintains indexes

## Community Implementations
- Research wikis (papers, theses)
- Fiction writing (character/theme tracking)
- Enterprise knowledge management
- Personal second brains
- Semiconductor analysis
- Trading strategies
- YouTube channel organization
