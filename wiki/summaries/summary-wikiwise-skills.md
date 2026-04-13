---
title: Wikiwise Skill Library — Ingest, Digest, Readwise
type: summary
source_file: raw/framework-docs/wikiwise-skills/
source_url: https://github.com/TristanH/wikiwise
author: TristanH
date_published: 2025-01-01
date_ingested: 2026-04-12
tags: [memory, context-management, agentic, tool-use, llm-wiki]
key_concepts: [parallel-ingest, readwise-integration, context-overflow-prevention, cross-link-density, browser-mcp]
confidence: high
---

# Wikiwise Skill Library — Summary

## TL;DR
Wikiwise's 6 skill files encode battle-tested operational patterns for LLM-maintained wikis: stream large documents to disk (never into context), batch sources before ingesting, dispatch parallel subagents per source, and cross-link aggressively to prevent orphans.

## Source
Wikiwise is a native Mac app by TristanH for building and maintaining Karpathy-style LLM wikis. The skill library ships with the app scaffold and covers the core wiki maintenance workflows.

## Key Patterns Extracted

### 1. Context overflow prevention (fetch-readwise-document)
Never load large document bodies into context. Pipe to disk first:
```bash
readwise reader-get-document-details --document-id <id> | jq -r '.content' > raw/<slug>.md
```
This is the single most important operational rule in the library. Violating it causes context blowout on any document >10k tokens.

### 2. Parallel subagent dispatch (digest)
Main thread handles navigation state (reads home.md + index.md first). Then dispatches one subagent per 2-3 sources. Subagents return a ≤300-word structured deliverable. This is the same fan-out pattern as [[patterns/pattern-compounding-loop]] but scoped to a single ingest session.

### 3. Batch before ingest (import-readwise)
Collect 3-5 sources before starting any ingestion. Don't process one-at-a-time. Batching allows the main thread to build a coherent picture of what's incoming and update home.md with context before the subagents run.

### 4. Cross-link density rule (ingest)
2-3 existing pages must link TO any new page — not just the new page linking out. This is stricter than the no-orphan rule (which only requires ≥1 inbound link). The intent: high link density makes retrieval by link traversal competitive with vector search.

### 5. User confirmation before search (fetch-readwise-highlights)
Never silently decide what to search for. Confirm query set with user first. Rationale: highlight libraries contain thousands of entries; a broad query produces noise and wastes compute.

### 6. Single-file tweet collection (ingest-tweets)
All tweets from a session go into one file (`raw/tweets_<topic>_<date>.md`), never per-tweet files. Source trust is Tier 5 (Social/Anecdotal) — use for leads and early signals, not facts.

## Applicability to This KB

| Wikiwise Skill | KB Equivalent | Gap |
|---------------|---------------|-----|
| digest | Fan-out INGEST (parallel Agent calls) | KB has no formal main-thread/subagent split — should add |
| import-readwise | Not present | Would need `@readwise/cli` setup |
| fetch-readwise-document | Not present | Critical rule to adopt: pipe to disk |
| fetch-readwise-highlights | Not present | Would need Readwise API access |
| ingest | INGEST Workflow (CLAUDE.md) | Wikiwise adds "2-3 inbound links" rule — KB has ≥1 |
| ingest-tweets | Not present | Would need browser MCP |

## Recommended Adoptions
1. **Pipe-to-disk rule**: any time a large file is fetched via CLI/API, stream to disk — never let body land in context
2. **Tighten inbound-link rule**: upgrade from ≥1 to 2-3 inbound links for new pages
3. **Batch-before-ingest**: collect 3-5 sources before starting the ingest loop

## Related
- [[patterns/pattern-compounding-loop]] — The fan-out ingest pattern
- [[frameworks/framework-markitdown]] — File-to-markdown conversion for raw/ pipeline
- [[recipes/recipe-llm-wiki-setup]] — Setup guide referencing similar patterns
- [[concepts/context-management]] — Context overflow is the core risk being managed here
