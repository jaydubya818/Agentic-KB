---
title: Implementation Plan — Agentic-KB
type: canonical
repo_name: agentic-kb
doc_type: implementation_plan
tags: [canonical, agentic-kb]
status: active
created: 2026-04-09
updated: 2026-04-09
---

# Agentic-KB — Implementation Plan

## Phase Overview

| Phase | Duration | Status | Goal |
|-------|----------|--------|------|
| Phase 1: Core Wiki | Complete | ✅ Done | 47 pages, core workflows operational |
| Phase 2: Query Interfaces | In Progress | 🟡 60% | CLI, Web, [[mcp-ecosystem]] all working |
| Phase 3: Ingestion Agents | In Progress | 🟡 50% | Parallel source ingestion, INGEST workflow |
| Phase 4: Linting & Maintenance | In Progress | 🟡 75% | Monthly LINT, [[pattern-hot-cache]] management |
| Phase 5: Integration & Scaling | Pending | ⏳ Q2 | Graphify, full-text search, team onboarding |

---

## Phase 1: Core Wiki (COMPLETE)

### Milestone 1.1: Structure & Schema
**Status**: ✅ Complete (2026-04-04)

- [x] Create wiki/ directory structure (concepts/, patterns/, frameworks/, etc.)
- [x] Define YAML frontmatter schema in wiki/schema.md
- [x] Establish naming conventions (kebab-case, prefixes)
- [x] Create CLAUDE.md with workflows (INGEST, QUERY, LINT)

### Milestone 1.2: Initial Content Seeding
**Status**: ✅ Complete (2026-04-09)

- [x] Create 35 concept pages (agent loop, context windows, tool use, orchestration, memory, state)
- [x] Create 12 pattern pages ([[pattern-supervisor-worker]], [[pattern-fan-out-worker]], reflection, etc.)
- [x] Create 11 framework pages ([[framework-langgraph]], [[framework-autogen]], [[framework-crewai]], [[mcp-ecosystem]], [[framework-claude-code]], etc.)
- [x] Create 8 recipe pages (build [[pattern-supervisor-worker]], implement reflection loops, etc.)
- [x] Create 5 entity pages ([[anthropic]], [[openai]], key researchers)
- [x] Ingest 5 raw sources into summaries/

### Milestone 1.3: Cross-Linking & Index
**Status**: ✅ Complete (2026-04-06)

- [x] Add bidirectional links (all concept mentions linked)
- [x] Create wiki/index.md (master catalog of all pages)
- [x] Ensure zero orphan pages
- [x] Link first mention of every concept on every page
- [x] Create wiki/hot.md (cached top patterns)

### Milestone 1.4: Audit & Polish
**Status**: ✅ Complete (2026-04-08)

- [x] Run first lint pass (detect issues)
- [x] Fix orphan pages
- [x] Mark recipes tested: true/false
- [x] Validate all frontmatter fields
- [x] Update wiki/log.md

---

## Phase 2: Query Interfaces (IN PROGRESS — 60%)

### Milestone 2.1: CLI Tool
**Status**: 🟡 In Progress

- [x] NPM project structure (`/Users/jaywest/My\ LLM\ Wiki/`)
- [x] Query command: `npm run query "question"`
- [x] Index reader (parse wiki/index.md)
- [x] Page finder (keyword search)
- [x] Answer synthesizer (read pages, cite sources)
- [ ] [[pattern-hot-cache]] optimization (serve cached answers first)
- [ ] Backfill workflow (web search for gap discovery)

**Estimated completion**: 2026-04-15

### Milestone 2.2: Web UI
**Status**: 🟡 In Progress

- [x] React app scaffold (Vite)
- [x] Home page with KB stats
- [x] Search/filter interface
- [x] Page browser (view any wiki page)
- [ ] Related pages sidebar
- [ ] Full-text search (currently keyword-based)
- [ ] Tag-based navigation
- [ ] Dark mode support

**Estimated completion**: 2026-04-20

### Milestone 2.3: [[mcp-ecosystem]] Server
**Status**: 🟡 In Progress

- [x] [[mcp-ecosystem]] server scaffold (port 9001)
- [x] `query_kb(question)` tool
- [x] `list_topics()` tool
- [ ] `get_page(slug)` tool
- [ ] `get_related(slug)` tool
- [ ] Rate limiting (if needed)
- [ ] Structured JSON responses

**Estimated completion**: 2026-04-18

---

## Phase 3: Ingestion Agents (IN PROGRESS — 50%)

### Milestone 3.1: INGEST Workflow
**Status**: 🟡 In Progress

- [x] Ingestion lead agent (coordinates workers)
- [x] Source analyzer agent (reads raw, extracts ideas)
- [ ] Page creator agent (writes wiki pages with frontmatter)
- [ ] Cross-linker agent (adds bidirectional links)
- [ ] Contradiction detector (flags source conflicts)

**Current capability**: Manual ingestion (Jay runs directly)  
**Target**: Fully automated parallel ingestion (5-10 sources simultaneously)

**Estimated completion**: 2026-04-25

### Milestone 3.2: Raw Source Integration
**Status**: 🟡 In Progress

- [x] Ingest papers (5 papers → summaries/)
- [x] Ingest transcripts (3 transcripts → summaries/)
- [x] Ingest framework docs (snapshot imports)
- [ ] Ingest code examples (annotated patterns)
- [ ] Ingest conversations ([[framework-claude-code]] sessions)
- [ ] Set up auto-detection of new sources (watch raw/)

**Progress**: 60% of raw sources imported

**Estimated completion**: 2026-04-30

---

## Phase 4: Linting & Maintenance (IN PROGRESS — 75%)

### Milestone 4.1: Lint Workflow
**Status**: 🟡 In Progress

- [x] Orphan page detector
- [x] Staleness detector (frameworks >60 days)
- [x] Cross-reference validator
- [x] Recipe validation (tested status, age)
- [x] Lint report generator (lint-{date}.md)
- [ ] Auto-fix capabilities (move to archive, update log)
- [ ] Escalation to Jay (email/Slack on critical issues)

**Current**: Manual lint runs (Jay runs monthly)  
**Target**: Automated lint with Jay notifications

**Estimated completion**: 2026-04-22

### Milestone 4.2: [[pattern-hot-cache]] Management
**Status**: 🟡 In Progress

- [x] [[pattern-hot-cache]] file (wiki/hot.md)
- [x] Manual refresh (weekly updates)
- [ ] Query pattern analyzer (track queries)
- [ ] Auto-promotion (patterns >3 queries/week)
- [ ] Auto-demotion (patterns <1 query/month)
- [ ] Cache hit monitoring

**Current**: 480 words, manually maintained  
**Target**: Automated, 50%+ cache hit rate

**Estimated completion**: 2026-04-29

### Milestone 4.3: Audit Log
**Status**: ✅ Complete

- [x] Create wiki/log.md (append-only)
- [x] Log all ingestions
- [x] Log all lint runs
- [x] Log contradictions discovered
- [x] Log page deprecations

---

## Phase 5: Integration & Scaling (PENDING — Q2 2026)

### Milestone 5.1: Graphify Integration
**Goal**: Visual knowledge graph of wiki connections

- [ ] Generate node-link diagram (concepts as nodes, patterns as links)
- [ ] Interactive visualization (zoom, filter by type)
- [ ] Export to HTML (save as wiki/syntheses/knowledge-graph-{date}.html)
- [ ] Identify clusters (under-linked areas, orphan concepts)

**Estimated start**: 2026-04-25  
**Estimated completion**: 2026-05-15

### Milestone 5.2: Full-Text Search
**Goal**: Replace keyword search with Elasticsearch/Meilisearch

- [ ] Index all wiki pages (title, body, tags, frontmatter)
- [ ] Implement search API (port 9002)
- [ ] Integrate into Web UI and CLI
- [ ] Query latency <500ms
- [ ] Support phrase queries, boolean operators, filtering

**Estimated start**: 2026-05-01  
**Estimated completion**: 2026-05-31

### Milestone 5.3: Team Onboarding
**Goal**: Enable Jay's team to learn KB and contribute

- [ ] Write contributor guide (contributing.md)
- [ ] Create video tutorials (INGEST, QUERY, LINT workflows)
- [ ] Set up GitHub issues (track suggested articles)
- [ ] Establish review process (peer review for new pages)
- [ ] Create templates for each page type

**Estimated start**: 2026-06-01  
**Estimated completion**: 2026-06-30

### Milestone 5.4: Production Scaling
**Goal**: Handle 1000+ daily queries, 100+ pages

- [ ] Implement caching layer (Redis for [[pattern-hot-cache]])
- [ ] Database migration (SQLite or Postgres for fast indexing)
- [ ] API rate limiting (per-client quotas)
- [ ] Monitoring & alerting (query latency, error rates)
- [ ] Load testing (1000 concurrent queries)

**Estimated start**: 2026-07-01  
**Estimated completion**: 2026-09-30

---

## Development Dependencies

### Required
- Node.js 18+ (CLI, Web UI)
- Git (version control)
- [[framework-claude-code]] (agents)

### Optional (Future)
- Elasticsearch or Meilisearch (full-text search, Phase 5.2)
- Redis (caching, Phase 5.4)
- PostgreSQL (scaling, Phase 5.4)

---

## Success Criteria (by Phase)

### Phase 1 ✅
- [x] 47 wiki pages created
- [x] Zero orphan pages
- [x] All cross-references validated
- [x] Frontmatter schema applied consistently
- [x] Index created and maintained

### Phase 2 (target 2026-04-20)
- [ ] CLI tool queries KB and returns answer <2s
- [ ] Web UI loads pages and lists related content
- [ ] [[mcp-ecosystem]] server responds to queries from agents
- [ ] All three interfaces consistent (same data)

### Phase 3 (target 2026-04-30)
- [ ] INGEST workflow handles 5 sources in parallel
- [ ] No conflicts when ingesting simultaneously
- [ ] New pages automatically linked and indexed
- [ ] Contradictions flagged for Jay review

### Phase 4 (target 2026-04-29)
- [ ] Monthly LINT pass finds all issues
- [ ] Zero orphan pages after LINT
- [ ] 50%+ queries answered from [[pattern-hot-cache]]
- [ ] Recipes validated on real projects

### Phase 5 (target 2026-09-30)
- [ ] Graphify reveals connection clusters
- [ ] Full-text search works for 100+ pages
- [ ] Team can contribute new articles
- [ ] System handles 1000+ queries/day

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Framework docs go stale | High | Medium | Monthly lint; auto-update detection |
| Recipes untested | Medium | Medium | Validation campaign; mark status |
| Missing cross-links | Medium | Low | Lint pass catches; backlink check |
| Team onboarding delayed | Low | Medium | Start early; document as we go |
| Search performance degrades | Low | High | Cache strategy; pre-compute hot pages |

---

## Rollback Plan

If a phase is blocked or fails:

1. **Phase 2 blocked** (Web UI fails):
   - Fallback: CLI + [[mcp-ecosystem]] are sufficient for queries
   - Web UI can be rebuilt later (not critical path)

2. **Phase 3 blocked** (INGEST agents):
   - Fallback: Continue manual ingestion (working today)
   - Target: Automate before hitting 100 pages

3. **Phase 4 blocked** (Linting):
   - Fallback: Manual monthly lint (current state)
   - Target: Automate by 2026-05-01

4. **Phase 5 blocked** (Scaling):
   - Fallback: Current system handles 1000+ queries/day (no urgency)
   - Can defer to Q3 2026

---

## Timeline Summary

```
Apr 2026:
  ✅ Phase 1 (Complete)
  🟡 Phase 2 (In progress, target 2026-04-20)
  🟡 Phase 3 (In progress, target 2026-04-30)
  🟡 Phase 4 (In progress, target 2026-04-29)

May 2026:
  🟡 Phase 5 Milestone 5.1 (Graphify, target 2026-05-15)
  🟡 Phase 5 Milestone 5.2 (Full-text search, target 2026-05-31)

Jun 2026:
  🟡 Phase 5 Milestone 5.3 (Team onboarding, target 2026-06-30)

Jul–Sep 2026:
  🟡 Phase 5 Milestone 5.4 (Production scaling, target 2026-09-30)
```

**Current milestone**: Phase 2.2 (Web UI) and Phase 3.1 (INGEST agents)  
**Next focus**: Complete CLI (2026-04-15) → Web UI (2026-04-20) → [[mcp-ecosystem]] (2026-04-18)
