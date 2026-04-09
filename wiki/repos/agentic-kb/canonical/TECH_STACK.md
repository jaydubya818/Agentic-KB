---
title: Tech Stack — Agentic-KB
type: canonical
repo_name: agentic-kb
doc_type: tech_stack
tags: [canonical, agentic-kb]
status: current
created: 2026-04-09
updated: 2026-04-09
---

# Agentic-KB — Tech Stack

## Overview

Agentic-KB is a knowledge base system designed for ingestion (async, parallel), querying (multi-interface), and maintenance (linting, synthesis). The tech stack prioritizes reliability, extensibility, and integration with Claude Code and MCP ecosystem.

## Core Components

### 1. Knowledge Storage
**Technology**: Markdown + YAML frontmatter  
**Location**: `/mnt/Agentic-KB/wiki/`  
**Format**: Single-source-of-truth flat structure with bidirectional linking

**Why**:
- Human-readable and version-controllable
- Markdown widely supported (Obsidian, GitHub, web renderers)
- YAML frontmatter enables machine parsing (type, tags, confidence, dates)
- Flat structure keeps it simple (no database needed)
- Immutable `raw/` directory + append-only `log.md` = audit trail

**Structure**:
```
wiki/
├── concepts/          (foundational ideas)
├── patterns/          (reusable design patterns)
├── frameworks/        (third-party tools)
├── entities/          (people, companies, tools)
├── recipes/           (implementation guides)
├── evaluations/       (comparisons, benchmarks)
├── summaries/         (1:1 per raw source)
├── syntheses/         (cross-source analysis)
├── personal/          (Jay's private notes)
├── hot.md             (cached most-accessed)
├── index.md           (master catalog)
└── log.md             (audit trail)
```

### 2. Ingestion Pipeline
**Technology**: Claude Code agents (parallel, fan-out)  
**Language**: Prompt-driven (no code binaries)  
**Scalability**: Fan-out supports 5-10 simultaneous source ingestions

**Flow**:
1. New source lands in `raw/{category}/`
2. INGEST agent reads, extracts ideas
3. Creates/updates wiki pages in parallel
4. Updates index and log atomically
5. No conflicts (each page owned by one agent)

**Agents**:
- `ingestion-lead`: Coordinates parallel workers
- `source-analyzer`: Reads raw file, extracts key ideas
- `page-creator`: Writes new wiki pages with frontmatter
- `cross-linker`: Adds bidirectional links
- `contradiction-checker`: Flags source conflicts

### 3. Query Engine
**Technology**: Multi-interface pattern  
**Interfaces**: CLI (npm), Web (React), MCP Server (protocol)

#### CLI Tool
**Location**: `/Users/jaywest/My LLM\ Wiki/`  
**Command**: `npm run query "your question"`  
**Engine**: Node.js with simple file I/O

```bash
# Install
cd /Users/jaywest/My\ LLM\ Wiki && npm install

# Run
npm run query "How do I build a supervisor-worker system?"

# Output
Answer synthesized from wiki/concepts/, wiki/patterns/, wiki/recipes/
with [[wiki link]] citations
```

#### Web UI
**Location**: `/llmwiki` (served by LLMwiki repo)  
**Framework**: React 18+ with Vite  
**Features**: Search, filter by type/tag, full-text search, related pages sidebar

#### MCP Server
**Port**: 9001  
**Protocol**: Model Context Protocol  
**Clients**: MissionControl agents, Pi harness agents  
**Tools exposed**:
- `query_kb(question: string)` → returns structured answer with citations
- `list_topics()` → returns all pages grouped by type/tag
- `get_related(page_slug: string)` → returns related pages

### 4. Index & Catalog
**File**: `wiki/index.md`  
**Format**: Markdown table (machine-readable)  
**Updates**: Atomic (every INGEST or page edit)  
**Fields**: slug, title, type, tags, confidence, created, updated, status

**Sample**:
```markdown
| Slug | Title | Type | Tags | Confidence | Status |
|------|-------|------|------|-----------|--------|
| pattern-supervisor-worker | Supervisor-Worker Pattern | pattern | orchestration, multi-agent | high | stable |
| recipe-build-supervisor-worker | Build a Supervisor-Worker System | recipe | orchestration, tutorial | high | stable, tested |
```

### 5. Linting & Maintenance
**Technology**: Claude Code agents (reflection)  
**Frequency**: Monthly or post-growth  
**Tools**:
- Orphan detection (pages with 0 inbound links)
- Staleness detection (framework pages >60 days)
- Recipe validation (marked `tested: false` >30 days)
- Cross-reference validation (concepts mentioned but not linked)
- Contradiction tracking (source conflicts logged)

**Output**: `wiki/syntheses/lint-{YYYY-MM-DD}.md`

### 6. Hot Cache
**File**: `wiki/hot.md`  
**Size**: ≤500 words  
**Content**: Most-accessed patterns (8-12 entries)  
**Refresh**: Weekly  
**Purpose**: 50%+ of queries answered without full wiki scan

**Tracking**:
```
Log query patterns (week-over-week)
If pattern >3 queries/week: add to hot cache
If hot cache >600 words: remove least-accessed entry
```

### 7. Integration with Claude Code
**Agents Location**: `~/.claude/agents/`  
**Skills Location**: `~/.claude/skills/`  
**Hooks Location**: `~/.claude/hooks/`  

Agents can:
- Query KB via MCP server
- Read wiki pages directly (file I/O)
- Ingest new raw sources (append to raw/)
- Run lint workflows

### 8. Version Control
**System**: Git  
**Repo**: Agentic-KB main repo  
**Key files tracked**:
- `wiki/` (all pages, index, log)
- `CLAUDE.md` (agent instructions)
- `raw/` (immutable; new sources, versioned by date added)

**Files NOT tracked**:
- `wiki/log.md` (append-only; too large; use git log for history)
- `outputs/` (staging area; not permanent)

### 9. Related Systems
**LLMwiki** (`/Users/jaywest/My\ LLM\ Wiki/`):
- CLI frontend (npm run query)
- Web UI backend (React + Node)
- MCP server implementation
- Database connector (optional; currently file-based)

**MissionControl**:
- Consumer of KB patterns via MCP
- Requests "what orchestration pattern for X?"
- Queries recipes for implementation

**Pi Harness** (Agentic-Pi-Harness):
- Edge deployment of KB patterns
- Queries edge-specific recipes
- Feeds deployment patterns back to KB

## Data Formats

### Page Frontmatter (YAML)
```yaml
---
title: Human-readable title
type: concept | pattern | framework | recipe | evaluation | summary | synthesis | personal
tags: [agentic, orchestration, safety]
created: 2026-04-09
updated: 2026-04-09
confidence: high | medium | low | speculative
status: stable | evolving | deprecated
sources: []
related: []
---
```

### Index Catalog (Markdown Table)
```markdown
| Field | Type | Purpose |
|-------|------|---------|
| slug | string | kebab-case filename (no .md) |
| title | string | human-readable |
| type | enum | section classification |
| tags | csv | searchable labels |
| confidence | enum | reliability of claims |
| created | date | YYYY-MM-DD |
| updated | date | YYYY-MM-DD |
| status | enum | lifecycle state |
```

### Audit Log (Append-only Markdown)
```markdown
## 2026-04-09 10:15 — Ingested LangGraph v0.2.0 Release Notes
- Created: wiki/frameworks/framework-langgraph.md (updated version to 0.2.0)
- Updated: wiki/syntheses/synthesis-orchestration-frameworks.md
- Contradictions: None
- Source: raw/framework-docs/langgraph-release-v0.2.0.md

[Previous entries below...]
```

## Deployment Model

### Development
- Files edited locally in `/mnt/Agentic-KB/wiki/`
- Agents read/write directly (no API)
- Git for version control

### Production
- Markdown files served by LLMwiki web UI
- MCP server instance running on port 9001
- CLI tool available via npm

### Backup & Recovery
- Git history (full audit trail)
- Immutable `raw/` directory (source recovery)
- Append-only `log.md` (change tracking)

## Security & Access Control

**No auth required** (Jay's personal system)

**File permissions**:
- `raw/` — read-only (no writes)
- `wiki/` — read/write by agents
- `outputs/` — temporary (auto-cleanup)

**Audit trail**:
- Every change logged in `wiki/log.md` with timestamp
- `wiki/summaries/` tracks sources
- Git history available for recovery

## Performance

| Operation | Target | Current |
|-----------|--------|---------|
| Query (cached) | <100ms | ~50ms |
| Query (full wiki) | 500ms–2s | ~1.2s |
| Ingest 1 source | 30–60s | ~45s |
| Monthly LINT | 2–5 min | ~3 min |
| Hot cache refresh | <30s | ~15s |
| Index update | <100ms | ~80ms |

## Scalability

| Metric | Current | Capacity |
|--------|---------|----------|
| Pages | 47 | 200+ (no DB bottleneck) |
| Total size | ~400KB | 50MB+ (still reasonable) |
| Queries/day | ~20 | 1000+ (MCP server can handle) |
| Concurrent ingestions | 1–2 | 5–10 (fan-out agents) |
| Hot cache size | 480 words | 600 words (configurable) |

## Known Limitations

1. **No full-text search** (currently keyword-based on index)
   - Fix: Elastic Search or Meilisearch for 100+ pages

2. **No version branching** (single master wiki)
   - Acceptable: Jay is sole author; git history sufficient

3. **Manual hot cache updates** (not yet automated)
   - Planned: Query pattern analysis agent

4. **No access control** (no auth)
   - Acceptable: Personal system; stored locally

5. **Markdown rendering** (client-side, not server-side)
   - Fix: Server-side rendering in Web UI if needed

## Future Upgrades

- Graphify integration (visual knowledge graph)
- Full-text search (Meilisearch)
- Auto-generated synthesis pages (cross-source analysis)
- Browser plugin (inline KB lookups)
- API documentation (for agent consumption)
