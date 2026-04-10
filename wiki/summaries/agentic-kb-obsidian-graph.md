---
title: "Agentic-KB — Obsidian Knowledge Graph Integration"
type: summary
source_file: wiki/repos/agentic-kb/repo-docs/docs/OBSIDIAN_GRAPH.md
source_url: https://raw.githubusercontent.com/jaydubya818/Agentic-KB/main/docs/OBSIDIAN_GRAPH.md
author: Jay West
date_published: 2026-04-07
date_ingested: 2026-04-10
tags: [agentic, knowledge-management, memory, context-management, observability]
key_concepts: [vault-architecture, llm-wiki-pattern, compile-pipeline, compounding-loop]
confidence: high
---

## TL;DR

Documents how the Agentic-KB vault functions as an Obsidian knowledge graph, using wikilinks as the only explicit link type and relying on Obsidian's automatic backlink derivation. Covers stable ULID IDs, the autolinker script, and the compounding Q&A loop.

## Key Concepts

**Wikilinks vs Backlinks**: Only forward wikilinks are written (`[[pattern-supervisor-worker]]`). Backlinks are auto-derived by Obsidian — never manually created. The autolinker's job is to insert wikilinks for canonical entities; Obsidian does the rest.

**Stable ULIDs**: Every file in `wiki/` and `raw/` carries a stable ULID in frontmatter (`id: 01JRK...`). Paths can change during reorganization — IDs cannot. Backfill is idempotent via `node scripts/backfill-ids.mjs`.

**Autolinker** (`scripts/autolink.py`): Inserts wikilinks for approved canonical entities from `scripts/entity-map.json`. Never touches frontmatter, code blocks, inline code, existing wikilinks, or HTML comments. Always dry-run first (`--report reports/autolink-dry.md`), then write-run. `--first-only` flag links first occurrence per file only.

**Compounding Loop**:
```
raw/ → Compile → wiki/*.md → autolink.py → Obsidian Backlinks → Graph View
                                                    ↑
                              /api/query reads wiki/ → user saves Q&A → raw/qa/
                              → next compile loops back
```
Saved Q&A with `verified: true` frontmatter gets a ×1.25 ranking boost.

**Note Schema**: `id`, `type`, `title`, `tags` required. Optional typed relationships: `parent`, `related`, `depends_on`, `works_with`, `sources`.

## Essential Plugins

Core (no install): Backlinks, Properties, Graph view, Canvas, Daily Notes, Templates.
Community: Dataview (orphan checks, relationship dashboards), Templater (guided note creation), Advanced URI (deep-links into Obsidian from web UI).

## Dataview Checks

Weekly orphan check: `TABLE file.folder FROM "" WHERE length(file.inlinks) = 0 AND length(file.outlinks) = 0`

## Related Pages

- [[concepts/vault-architecture]]
- [[concepts/llm-wiki-compile-pipeline]]
- [[patterns/pattern-compounding-loop]]
- [[entities/oh-my-mermaid]]
