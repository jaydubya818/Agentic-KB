---
id: 01KNNVX2QGWC89AW6ZBZSKV0W7
title: LLM Wiki Pattern
type: concept
tags: [agentic, knowledge-base, architecture, rag, memory, karpathy]
confidence: high
sources:
  - "[[summaries/karpathy-llm-wiki-video]]"
created: 2026-04-07
updated: 2026-04-07
related:
  - "[[concepts/memory-systems]]"
  - "[[concepts/multi-agent-systems]]"
  - "[[concepts/context-management]]"
  - "[[concepts/agent-loops]]"
  - "[[concepts/task-decomposition]]"
status: evolving
---

# LLM Wiki Pattern

## Definition
An architectural pattern in which an LLM incrementally builds and maintains a persistent, interlinked wiki of structured markdown files positioned between the user and their raw source material. Popularized by Andrej Karpathy (2026).

Distinguished from RAG by its **pre-computation of synthesis**: rather than retrieving and re-weaving fragments at query time, cross-references, summaries, and contradiction flags are written once and compound over time.

## The Core Inversion

| RAG | LLM Wiki |
|-----|----------|
| Stateless — rediscovers knowledge each query | Stateful — knowledge persists and compounds |
| Retrieves chunks, synthesizes on demand | Synthesis pre-computed, stored as wiki pages |
| Nothing accumulates | Every ingest builds on prior state |
| Good for simple lookup | Good for deep, evolving research domains |

## Three-Layer Architecture

```
Raw Sources (immutable)
    ↓  [LLM reads]
Wiki (LLM-owned markdown)
    ↑  [human queries / directs]
Schema / Config (CLAUDE.md)
```

- **Raw layer**: immutable source material (papers, transcripts, docs, code)
- **Wiki layer**: LLM-written summaries, concepts, patterns, entities, syntheses
- **Schema layer**: configuration file defining conventions, workflows, and file structure

## Core Operations

### Ingest
Triggered when a new source is added to `raw/`. LLM reads the source, writes a summary page, updates the master index, and cross-links relevant existing wiki pages. A single ingest typically touches 10–15 files.

### Query
User asks a question against the wiki. Strong answers or novel insights get filed back as new pages — queries become permanent knowledge rather than ephemeral answers.

### Lint
Periodic maintenance pass. LLM scans for contradictions between pages, stale or outdated claims, orphan pages lacking cross-references, and identifies gaps that warrant new web searches or source ingestion.

## Division of Labor

**Human responsibilities:**
- Source curation (finding high-quality material)
- Directing analysis and asking good questions
- Deciding what matters and what to prioritize

**LLM responsibilities:**
- Writing and updating all wiki pages
- Maintaining cross-references
- Flagging contradictions
- Running lint and backfill passes

> Key insight: Wikis fail because human maintenance burden grows faster than perceived value. LLMs eliminate this — they don't get bored, don't forget conventions, and can update 15 files in one pass at near-zero marginal cost.

## Design Principles (Karpathy)
1. **Explicit** — all knowledge is visible in a navigable wiki, not buried in embeddings
2. **Yours** — local markdown files, no vendor lock-in
3. **File over app** — plain `.md` works with any viewer, CLI, or editor
4. **Bring your own AI** — model-agnostic; swap Claude, GPT, open-source, or fine-tuned models freely

## Tooling
- **Obsidian** is the recommended IDE/frontend (backlinks, graph view, search)
- **Claude Code** is the primary LLM harness for running operations
- Files are plain markdown — no proprietary format dependency

## Scalability Notes
- Parallel agents can be used during bulk ingest (demonstrated: 8 transcripts in one pass)
- The schema file (CLAUDE.md) is the critical leverage point — well-designed schemas produce consistent, high-quality wiki output
- As the wiki grows, the Lint operation becomes increasingly valuable for coherence maintenance

## Related Patterns
- [[concepts/memory-systems]] — the wiki is a form of external long-term memory
- [[concepts/multi-agent-systems]] — parallel agents accelerate bulk ingest
- [[concepts/task-decomposition]] — ingest decomposes into summary + index update + cross-link tasks
- [[concepts/agent-loops]] — lint operation is a reflective loop over the full wiki state