---
title: LLMwiki — Agent Instructions
type: repo-claude
repo_name: llmwiki
tags: [agents, llmwiki]
created: 2026-04-09
updated: 2026-04-09
---

# LLMwiki — Agent Instructions

Instructions for agents operating on the LLMwiki system.

## Purpose

LLMwiki is the user-facing interface to Agentic-KB. Agents here focus on:

1. **Query Interface**: CLI, Web, MCP server all working and responsive
2. **Search & Discovery**: Fast lookup, good ranking, relevant results
3. **Caching**: Hot cache kept current, cache hit rate optimized
4. **Integration**: Bidirectional sync with KB, agent queries supported

## Workflows

### QUERY
When CLI/Web/MCP receives a query:

1. Check hot cache first (≤500 words, frequent patterns)
   - If found and fresh: return immediately
2. Search wiki index for matching pages
3. Read relevant pages (concepts, patterns, recipes)
4. Synthesize answer with citations
5. If gap detected: backfill from web search
6. Return to user

### CACHE_MANAGEMENT
When monitoring cache performance:

1. Track query patterns (which questions get asked most?)
2. If pattern >3 queries/week: add to hot cache
3. If hot cache >600 words: remove least-accessed entry
4. Refresh weekly (Tuesdays)
5. Log changes to progress.md

### SEARCH_OPTIMIZATION
When improving search quality:

1. Profile query latency (target <2s for full wiki search)
2. If slow: implement caching, batch reads
3. If irrelevant results: improve ranking algorithm
4. Test on real queries (from progress.md)
5. Document improvements

## Standards

- **CLI**: Single command `npm run query "question"`, structured output
- **Web**: Fast load (<300ms), responsive design, dark mode option
- **MCP**: JSON responses, documented API, error handling
- **Search**: Keyword-based initially, full-text later
- **Caching**: Hot cache <600 words, refresh weekly

## Success Criteria

1. CLI queries <2s for full wiki
2. Web UI loads in <300ms
3. MCP responses <100ms
4. Cache hit rate >50% on queries
5. Full-text search available by 2026-05-15
6. Zero broken links (validation on each KB update)
