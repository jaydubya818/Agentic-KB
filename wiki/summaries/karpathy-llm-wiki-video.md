---
id: 01KNNVX2RAJVYN9RBRFQP9P72S
title: "Building a Trading Strategies LLM Knowledge Base (Karpathy Pattern)"
type: summary
tags: [llm-wiki, karpathy, knowledge-base, obsidian, claude-code, rag, architecture]
source: raw/transcripts/karpathy-llm-wiki-video.md
source_type: transcript
author: Unknown (trading-focused channel)
date: 2026-04
created: 2026-04-07
updated: 2026-04-07
related:
  - "[[concepts/memory-systems]]"
  - "[[concepts/multi-agent-systems]]"
  - "[[concepts/context-management]]"
  - "[[concepts/task-decomposition]]"
  - "[[concepts/agent-loops]]"
  - "[[concepts/llm-wiki-pattern]]"
status: stable
---

# Summary: Building a Trading Strategies LLM Knowledge Base (Karpathy Pattern)

## Source
YouTube transcript from an unknown trading-focused channel explaining and demonstrating Andrej Karpathy's LLM wiki concept, applied to building a trading strategies knowledge base using Claude Code (opus 4.6) and Obsidian.

## Core Argument
RAG-based workflows discard knowledge after every query — nothing accumulates. The LLM-powered wiki pattern inverts this: the LLM builds a persistent, interlinked wiki *up front*, so knowledge compounds over time rather than being rediscovered from scratch on every query.

## Key Concepts

### The Problem with RAG
- Tools like ChatGPT file upload and NotebookLM do retrieval-at-query-time
- Each answer re-weaves fragments; cross-references and synthesis are ephemeral
- Knowledge is never retained between sessions

### Three-Layer Architecture
| Layer | Description | Who Owns It |
|-------|-------------|-------------|
| Raw sources | Articles, papers, datasets — immutable | Human |
| Wiki | Structured interlinked markdown files | LLM |
| Schema | CLAUDE.md config — conventions and workflows | Human |

> "The wiki is a codebase. Obsidian is the IDE. The LLM is the programmer. The schema is the style guide."

### Core Operations
- **Ingest**: Drop source into `raw/`, LLM writes summary, updates index, cross-links 10–15 pages
- **Query**: Ask questions against wiki; good answers get filed back as new pages
- **Lint**: Maintenance pass — find contradictions, stale claims, orphan pages, missing links, gaps

### Division of Labor
- **Human**: Curates sources, directs analysis, asks good questions, decides what matters
- **LLM**: Writes all wiki pages, maintains cross-references, flags contradictions
- Key insight: humans abandon wikis because maintenance burden exceeds value; LLMs don't get bored and can touch 15 files in a single pass

### Four Principles
1. **Explicit** — knowledge is visible and navigable
2. **Yours** — local files, no provider lock-in
3. **File over app** — plain markdown, works with any tool
4. **Bring your own AI** — swap Claude, GPT, open source, or fine-tuned models freely

### Use Cases Mentioned
- Domain research
- Personal second brain
- Business internal wiki
- Reading/book notes
- Due diligence

## Live Demo Details
- Model: Claude opus 4.6 via Claude Code
- Domain: Trading strategies
- Pages created: market structure concepts, strategy pages, psychology pages, prop firm entity pages
- Ingested 8 raw transcripts using **parallel agents** in a single pass
- Frontend: Obsidian (used as wiki viewer/IDE)

## Relevance to This KB
This source describes the exact architectural pattern underpinning this knowledge base. The three-layer structure (raw / wiki / schema), the INGEST/QUERY/LINT operations, the division of labor, and the file-over-app philosophy are all directly instantiated here. Treat this summary as both a content summary and a self-referential design document.
