---
title: Product Requirements — LLMwiki
type: canonical
repo_name: llmwiki
doc_type: prd
tags: [canonical, llmwiki]
status: draft
created: 2026-04-09
updated: 2026-04-09
---

# LLMwiki — Product Requirements Document

## Executive Summary

LLMwiki is the user-facing interface to Agentic-KB. It provides CLI, web UI, and MCP server access to the knowledge base, handles indexing and caching, and optimizes for fast queries. Users interact with the KB through LLMwiki while the system keeps data in sync with the canonical wiki.

## Interfaces

### 1. CLI Tool
- Command: `npm run query "your question"`
- Returns: Synthesized answer with citations, related links
- Latency target: <2 seconds for full wiki search

### 2. Web UI
- URL: `/llmwiki`
- Features: Search, browse, filter by type/tag, related pages
- Latency target: Page load <300ms

### 3. MCP Server
- Port: 9001
- Tools: query_kb(), list_topics(), get_related()
- Clients: MissionControl, Pi harness agents

## Core Features

1. **Query Interface** — Ask questions, get answers with citations
2. **Search** — Keyword search (now), full-text search (future)
3. **Caching** — Hot cache of frequent patterns (≤500 words)
4. **Discovery** — Browse by type, tag, related pages
5. **Integration** — Synced with Agentic-KB, agent-ready API

## Success Criteria

1. CLI queries <2s, Web load <300ms, MCP <100ms
2. Cache hit rate >50% on queries
3. Zero broken links
4. Full-text search by 2026-05-15
5. All agent queries working (MissionControl, Pi harness)

## Roadmap

- Q2 2026: CLI/Web/MCP stable, cache optimization
- Q3 2026: Full-text search, advanced filtering
- Q4 2026: Browser plugin, API documentation
