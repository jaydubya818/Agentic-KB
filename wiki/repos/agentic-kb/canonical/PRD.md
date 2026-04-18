---
title: Product Requirements — Agentic-KB
type: canonical
repo_name: agentic-kb
doc_type: prd
tags: [canonical, agentic-kb]
status: stable
created: 2026-04-09
updated: 2026-04-09
---

# Agentic-KB — Product Requirements Document

## Executive Summary

Agentic-KB is a persistent, compounding knowledge base for agentic AI systems. It organizes Jay West's research, patterns, frameworks, and validated learnings into a searchable, cross-linked wiki that powers a CLI tool, web UI, [[mcp-ecosystem]] server, and agent runtime. The system itself implements agentic patterns—parallel ingestion, [[pattern-fan-out-worker]] compilation, reflection-based linting.

## User Personas

### Primary User: Jay West (Knowledge Architect)
- Builds agentic systems; needs to capture and recall patterns across projects
- Runs monthly lint passes; maintains index and [[pattern-hot-cache]]
- Feeds raw sources (papers, transcripts, code) into ingestion pipeline
- Queries the KB for inspiration on architectural decisions

### Secondary User: Agent Consumer ([[mcp-ecosystem]] Client)
- Asks KB questions via [[mcp-ecosystem]] server API or CLI
- Gets structured answers with citations and links
- Needs up-to-date framework info and pattern recommendations

### Tertiary User: Future Team Members
- Read KB to onboard on agentic architecture patterns
- Reference decision histories in personal/ pages
- Contribute validated learnings back to concepts/patterns

## Core Features

### 1. Wiki Compilation & Organization
- **Concept pages**: Foundational ideas (agent loop, context windows, tool use, state management)
- **Pattern pages**: Reusable design patterns ([[pattern-supervisor-worker]], [[pattern-fan-out-worker]]-worker, reflection loops)
- **Framework pages**: Third-party tools with strengths, weaknesses, Jay's experience level
- **Recipe pages**: Step-by-step implementation guides with test status
- **Synthesis pages**: Cross-source analysis and comparisons
- **Personal pages**: Jay's validated patterns, lessons, war stories (private)

### 2. Ingestion Pipeline
- Accepts raw sources: papers, transcripts, framework docs, code examples, conversations
- Creates summary pages (1:1 per source) and synthesizes into existing wiki structure
- Flags contradictions for review
- Updates index and log automatically
- Supports parallel [[pattern-fan-out-worker]] ingestion via agents

### 3. Query Interface
- **CLI**: `npm run query "your question"` → synthesized answer with citations
- **Web UI**: Search, filter by type/tag, browse index
- **[[mcp-ecosystem]] Server**: Structured queries from other agents (MissionControl, Pi harness)
- **[[pattern-hot-cache]]**: ≤500 words of most-accessed patterns for fast retrieval

### 4. Health & Maintenance
- **Monthly lint**: Detect orphan pages, stale frameworks, untested recipes, missing links
- **Bidirectional linking**: Every concept mentioned is linked; every page has ≥1 inbound link
- **Contradiction tracking**: Log any source conflicts; never silently overwrite
- **Version tracking**: Framework pages dated; recipe test status tracked

### 5. Integration Points
- **Obsidian vault**: Can reference external entities (Jay's main vault)
- **Agent definitions**: `/Users/jaywest/.claude/agents/` synced for runtime agents
- **Graphify**: Visual knowledge graph of connections (post-ingestion)

## Non-Functional Requirements

### Accuracy
- High-confidence claims must have multiple independent sources
- Recipes must be marked `tested: true` only after real-world validation
- Unverified claims marked `[UNVERIFIED]` and logged

### Maintainability
- Immutable `raw/` directory ensures source fidelity
- Append-only `log.md` creates audit trail
- Consistent frontmatter enables machine parsing
- Clear workflows (INGEST, QUERY, LINT) documented in CLAUDE.md

### Scalability
- Current: 47 pages, ~100k tokens
- Growth target: 10-15 pages/month (sustainable rate)
- At scale (200 pages): [[pattern-hot-cache]] becomes critical for query performance
- Graphify visualization essential for discovering connections

### Completeness
- Target coverage: Multi-agent architecture, orchestration, memory, safety, deployment, evaluation
- Current gaps: Safety patterns, production scaling, observability
- Backfill workflow handles gap discovery via queries

## Success Criteria

1. **KB is consulted before major architectural decisions** — Jay uses KB as reference for projects
2. **Lint passes monthly** — Orphan pages caught, frameworks kept current, recipes validated
3. **[[pattern-hot-cache]] drives 50%+ of queries** — Most-accessed patterns accessible in <100 words
4. **No contradictions older than 1 month** — Source conflicts resolved promptly
5. **≥70% of recipes tested** — Patterns validated on real projects
6. **[[mcp-ecosystem]]/CLI/Web all operational** — Multiple consumption paths working

## Roadmap

### Q2 2026
- [ ] Complete framework sync ([[framework-langgraph]], [[framework-autogen]], [[framework-crewai]], [[framework-openclaw]])
- [ ] Recipe testing campaign (2/4 → 4/8 recipes validated)
- [ ] Safety patterns section created (3 new pages)
- [ ] Graphify integration (visual KB browsing)

### Q3 2026
- [ ] Production scaling patterns (deployment, observability, monitoring)
- [ ] Expanded entity section (companies, researchers, tools)
- [ ] Evaluation frameworks page (comparing agentic systems)
- [ ] Internal cross-project case studies

### Q4 2026
- [ ] Personal agent coaching system (agents query KB, get coached on architectural decisions)
- [ ] Wiki-to-slides export (for presentations)
- [ ] Contributor onboarding docs (for team expansion)

## Out of Scope

- Doesn't generate code (links to recipes but doesn't execute)
- Doesn't replace primary ML/AI research publications (supplements them)
- Doesn't track real-time project status (that's MissionControl's job)
- Doesn't store raw experimental data (only validated learnings)

## Metrics

| Metric | Current | Target | Cadence |
|--------|---------|--------|---------|
| Total pages | 47 | 60 | Monthly |
| Framework pages current | 8/11 | 11/11 | Weekly |
| Recipes tested | 2/10 | 7/10 | Monthly |
| Orphan pages | 0 | 0 | Monthly (lint) |
| Contradictions logged | 2 | 0 (all resolved) | Monthly |
| Query success rate | N/A | >90% | Ongoing |
