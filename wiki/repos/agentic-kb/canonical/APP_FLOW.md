---
title: Application Flow — Agentic-KB
type: canonical
repo_name: agentic-kb
doc_type: app_flow
tags: [canonical, agentic-kb]
status: stable
created: 2026-04-09
updated: 2026-04-09
---

# Agentic-KB — Application Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interfaces                           │
├─────────────────────────────────────────────────────────────┤
│ CLI Tool        │ Web UI (React)    │ MCP Server            │
│ (npm run query) │ (/llmwiki)        │ (port 9001)           │
└────────┬────────┴───────────┬───────┴──────────────┬────────┘
         │                    │                       │
         └────────────────────┼───────────────────────┘
                              │
                         ┌────▼─────────┐
                         │ Query Engine  │
                         │ (HotCache+    │
                         │  Index)       │
                         └────┬─────────┘
                              │
         ┌────────────────────┼───────────────────────┐
         │                    │                       │
    ┌────▼──────┐        ┌────▼──────┐         ┌─────▼────┐
    │ wiki/     │        │ wiki/     │         │ wiki/    │
    │ hot.md    │        │ index.md  │         │ [pages]/ │
    │ (500w)    │        │ (catalog) │         │          │
    └───────────┘        └───────────┘         └──────────┘
         │
         └──────────────────────┬──────────────────────┐
                                │                      │
                         ┌──────▼──────┐      ┌────────▼───┐
                         │ Ingestion   │      │ Lint &     │
                         │ Pipeline    │      │ Maintenance│
                         │ (INGEST     │      │ (LINT      │
                         │  workflow)  │      │  workflow) │
                         └──────┬──────┘      └────────┬───┘
                                │                      │
                    ┌───────────┴──────────────┬───────┴───────┐
                    │                          │               │
              ┌─────▼────┐            ┌────────▼────┐   ┌─────▼──────┐
              │ raw/     │            │ wiki/log.md │   │ Agent      │
              │ [sources]│            │ (audit      │   │ definitions│
              │          │            │  trail)     │   │ (.claude/) │
              └──────────┘            └─────────────┘   └────────────┘
```

## User Workflows

### QUERY Workflow
**Actor**: Jay West (or agent via [[mcp-ecosystem]])  
**Goal**: Get answer to a question about agentic systems

```
1. User asks question
   └─→ "How do I implement supervisor-worker pattern in Claude Code?"

2. CLI/Web/MCP receives query
   └─→ Routes to Query Engine

3. Query Engine checks hot.md (500-word cache)
   └─→ If answer cached: return fast

4. If not in hot cache, search wiki/index.md for relevant pages
   └─→ Identify: pattern-supervisor-worker, pattern-fan-out-worker, recipe-build-supervisor-worker

5. Read relevant wiki pages (concepts, patterns, recipes)
   └─→ Synthesize answer with citations

6. If knowledge gap detected (question touches unwritten topic):
   └─→ Do web search, backfill to raw/, run INGEST, retry query

7. Return structured answer with [[wiki links]] to related pages

8. If answer >200 words: offer to file as synthesis page
```

**Time to answer**: 
- Cached (hot.md): <100ms
- In wiki: 500ms–2s
- Gap discovery + backfill: 30s–2m

---

### INGEST Workflow
**Actor**: Agent running parallel ingestion  
**Goal**: Add new raw source material to wiki

```
1. New source arrives in raw/ directory
   └─→ raw/papers/paper-title.md
   └─→ raw/transcripts/talk-name.md
   └─→ raw/framework-docs/tool-docs.md

2. Agent reads source, extracts key ideas
   └─→ Identifies 1-3 core concepts/patterns

3. For each idea:
   ├─→ Check if existing wiki page covers it
   │   ├─ If YES: Update existing page, add source attribution
   │   └─ If NO: Create new page with full frontmatter
   │
   ├─→ Create summary page: wiki/summaries/{source-slug}.md
   │
   └─→ Cross-link everything bidirectionally
        └─→ New pages link to concepts
        └─→ Concept pages get backlinks to source

4. Check for contradictions
   ├─→ If found: Add blockquote to newer page, log to wiki/log.md
   └─→ Flag for Jay review

5. Update wiki/index.md with new/modified entries

6. Append to wiki/log.md: timestamp, source, pages created/updated, contradictions

7. If KB >1.5MB or 50+ pages: Trigger Graphify visualization
```

**Parallel execution**: 5-10 sources can be ingested simultaneously (no conflicts on pages)

---

### LINT Workflow
**Actor**: Jay West (manual) or scheduled agent (monthly)  
**Goal**: Maintain wiki health and detect issues

```
1. Scan wiki/index.md — enumerate all pages

2. For each page, check:
   ├─→ Has ≥1 inbound link? (orphan detection)
   ├─→ All mentioned concepts linked? (cross-reference validation)
   ├─→ If framework: last_checked date <60 days old? (staleness check)
   ├─→ If recipe: tested: false AND >30 days old? (validation reminder)
   └─→ Confidence level appropriate? (mark unverified claims)

3. Generate lint report: wiki/syntheses/lint-{YYYY-MM-DD}.md
   ├─→ List all issues
   ├─→ Prioritize by severity
   └─→ Suggest fixes

4. For critical issues:
   ├─→ Orphan pages: move to wiki/archive/, log reason
   ├─→ Stale frameworks: fetch latest version, update page
   ├─→ Untested recipes: ping Jay for testing or deprecate
   └─→ Low-confidence claims: mark [UNVERIFIED] and log

5. Update wiki/log.md with lint findings

6. Keep orphan count at 0 (high priority)
```

**Frequency**: Monthly or when wiki grows >20 pages  
**Expected fixes**: 90%+ automated, 10% require Jay review

---

### [[pattern-hot-cache]] Workflow
**Actor**: Agent monitoring query patterns  
**Goal**: Keep ≤500 words of most-accessed patterns in hot.md

```
1. Monitor query logs (week-over-week)
   └─→ Track: which patterns get >3 queries/week?

2. If pattern is frequently queried:
   ├─→ Write concise summary (≤100 words)
   ├─→ Add wiki link [[pattern-name]]
   └─→ Insert into hot.md

3. Maintain ≤600 words total
   └─→ When adding new entry: remove least-accessed old entry

4. Refresh weekly (Tuesdays)
   └─→ Update counts, adjust priorities

5. Monitor cache hit rate
   ├─→ Goal: >50% of queries answered from hot cache
   └─→ If <30%: expand cache (critical patterns missing)
```

**Current hot entries** (as of 2026-04-09):
- [[pattern-supervisor-worker]] pattern (8 queries/week)
- reflection loops (6 queries/week)
- context window management (4 queries/week)
- tool use patterns (3 queries/week)

---

## Data Flows

### Add Source to KB
```
raw/papers/new-paper.md 
  → INGEST agent reads
  → Extracts concepts
  → Creates wiki/summaries/new-paper.md
  → Updates wiki/concepts/[existing pages]
  → Updates wiki/index.md
  → Appends to wiki/log.md
  → Bidirectional links created
```

### Query the KB
```
"How do I build a supervisor-worker system?"
  → CLI/Web/MCP receives
  → Checks wiki/hot.md (first)
  → Searches wiki/index.md for matches
  → Reads wiki/patterns/pattern-supervisor-worker.md
  → Reads wiki/recipes/recipe-build-supervisor-worker.md
  → Reads wiki/concepts/[prerequisite concepts]
  → Synthesizes answer + citations
  → Returns to user
  → (If >200 words: offer to save as synthesis page)
```

### Validate Recipe
```
wiki/recipes/recipe-build-supervisor-worker.md (tested: false)
  → LINT detects it's >30 days old
  → Pings Jay for testing
  → Jay implements in MissionControl project
  → Updates recipe: tested: true, tested_date: 2026-04-15
  → LINT passes on next run
  → Logs validation in wiki/log.md
```

## Error Handling

| Error | Detection | Response |
|-------|-----------|----------|
| Orphan page created | LINT workflow | Move to wiki/archive/; log reason |
| Contradiction in source | INGEST workflow | Add blockquote warning; log both pages |
| Framework page stale | LINT workflow | Fetch latest version; update; log change |
| Recipe untested >30 days | LINT workflow | Escalate to Jay; mark for testing or deprecation |
| Query has no answer | QUERY workflow | Backfill: web search → raw/ → INGEST → retry |
| Broken cross-reference | LINT workflow | Remove link; log orphaned reference |

## Performance Targets

| Operation | Target | SLA |
|-----------|--------|-----|
| Query (cached) | <100ms | 95% <200ms |
| Query (in wiki) | 500ms–2s | 95% <3s |
| Ingest 1 source | 30–60s | Full backfill <5m |
| Monthly LINT pass | 2–5 minutes | Run on 1st of month |
| [[pattern-hot-cache]] refresh | <30s | Weekly on Tuesday 9am |

## Integration Points

- **[[mcp-ecosystem]] Server**: Exposes query engine to MissionControl, Pi harness agents
- **CLI Tool**: `npm run query` wraps query engine for Jay's shell access
- **Web UI**: React app at /llmwiki with search, browse, tag filtering
- **Obsidian Vault**: Can embed [[obsidian notes]] as external references (read-only)
- **Agent definitions**: Reads from ~/.claude/agents/ for runtime agents
