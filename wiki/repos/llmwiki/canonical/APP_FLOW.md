---
title: Application Flow — LLMwiki
type: canonical
repo_name: llmwiki
doc_type: app_flow
tags: [canonical, llmwiki]
status: draft
created: 2026-04-09
updated: 2026-04-09
---

# LLMwiki — Application Flow

## CLI Query Flow

```
User:
  npm run query "How do I implement supervisor-worker?"

LLMwiki CLI:
  1. Parse query
  2. Check hot.md cache (≤500 words)
  3. If not cached: search wiki/index.md for matches
  4. Read relevant pages (patterns, recipes, concepts)
  5. Synthesize answer with [[wiki links]]
  6. Output to stdout (formatted markdown)

User sees:
  Answer with links they can follow, in <2 seconds
```

## Web UI Flow

```
User:
  Navigate to /llmwiki
  
Browser loads:
  1. React app loads (bundle.js, styles.css)
  2. Fetch index from server (wiki/index.md)
  3. Display homepage with search box
  4. <300ms page load target

User searches "context window":
  1. Client-side keyword search on index
  2. Display matching pages (type, confidence, tags)
  3. User clicks page → load and display
  4. Show related pages in sidebar
```

## [[mcp-ecosystem]] Server Flow

```
Agent asks MissionControl:
  /query_kb?q="What patterns work for distributed agents?"

LLMwiki MCP server:
  1. Receives query JSON
  2. Runs query (same logic as CLI)
  3. Returns structured JSON:
     {
       "answer": "...",
       "citations": [{"title": "...", "link": "..."}],
       "related": [...]
     }

Agent receives:
  Structured answer, uses citations for follow-up queries
```

## Cache Refresh Cycle

```
Weekly (Tuesday 9am):
  1. Analyze query logs (which questions asked most?)
  2. If pattern >3 queries/week: add to hot.md
  3. If hot.md >600 words: remove least-accessed entry
  4. Commit changes to wiki
  5. Rebuild index

Result:
  Hot cache always fresh, cache hit rate increases
```

## Index Synchronization

```
When wiki page created/updated:
  1. Page added to wiki/ directory
  2. Commit to git
  3. LLMwiki detects change (webhook or polling)
  4. Regenerate wiki/index.md
  5. Rebuild hot cache if relevant
  6. Update search indexes (keyword + full-text)
  7. All interfaces reflect new/updated content
```

See canonical/TECH_STACK.md for technical details.
