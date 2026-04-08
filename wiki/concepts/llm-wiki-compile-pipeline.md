---
id: 01KNNVX2QFZJKJ9Z858F6CPQMJ
title: "LLM Wiki Compile Pipeline"
type: concept
tags: [knowledge-base, llm, automation, workflow, architecture]
created: 2026-04-08
updated: 2026-04-08
visibility: public
confidence: high
related: [llm-wiki, llm-wiki-pattern, llm-owned-wiki]
source: architecture/2026-04-07-omm-compile-pipeline.md
---

# LLM Wiki Compile Pipeline

## Definition

The compile pipeline is the engine behind the [LLM-owned wiki pattern](llm-wiki.md). It reads raw documents from a `raw/` directory, deduplicates against a compiled-log state file, batches new or changed documents to Claude with a schema prompt, and writes the results back as structured wiki pages — all incrementally and with live progress streaming.

This is the core loop that transforms unstructured notes and documents into a curated, cross-referenced knowledge base without manual curation.

## Why It Matters

The compile pipeline operationalises the [LLM-wiki pattern](llm-wiki-pattern.md): instead of a human manually maintaining a wiki, an LLM processes raw inputs and produces structured pages on demand. Key properties:

- **Incremental by default** — only new or changed documents are processed per run, keeping costs and latency low
- **Full recompile is explicit** — a deliberate opt-in, not the default, preventing unnecessary API spend
- **State-tracked** — `raw/.compiled-log.json` records what has already been compiled, enabling idempotent reruns
- **Observable** — progress is streamed via SSE to a web UI (`CompilePanel`), making the pipeline transparent
- **Schema-driven** — `wiki/schema.md` is injected as the system prompt, so Claude knows exactly how to format and place pages

## Pipeline Flow

```
User triggers compile
  → POST SSE to /api/compile
  → Read raw/**/*.md + raw/.compiled-log.json
  → Filter: new or changed only
  → Batch with wiki/schema.md as system prompt
  → Claude API returns JSON ops (create/update)
  → Write wiki/**.md pages
  → Append run summary to wiki/log.md
  → Save updated state to .compiled-log.json
  → Stream SSE progress events → CompilePanel UI
  → Loop until all new docs processed → SSE done
```

## Example

A user drops three new markdown notes into `raw/`. They click **Compile New** in the web UI. The pipeline:
1. Reads all files in `raw/`
2. Checks `.compiled-log.json` — two files already compiled, one is new
3. Sends the new file + `wiki/schema.md` to Claude
4. Receives back a JSON array of page ops (e.g., `create concepts/my-topic.md`)
5. Writes the page, appends to `wiki/log.md`, updates `.compiled-log.json`
6. Streams a progress event to the UI; user sees it complete in real time

## Common Pitfalls

- **Schema drift** — if `wiki/schema.md` changes, previously compiled pages may be inconsistent with new ones. A selective recompile of affected pages may be needed.
- **Log corruption** — if `.compiled-log.json` is lost or corrupted, a full recompile must be triggered to restore correct state.
- **Batch sizing** — very large raw documents may need to be split before batching to stay within context limits.

## See Also

- [LLM Wiki](llm-wiki.md) — the wiki approach this pipeline powers
- [LLM Wiki Pattern](llm-wiki-pattern.md) — the broader design pattern
- [LLM-Owned Wiki](llm-owned-wiki.md) — philosophy behind LLM-curated knowledge bases
- [Cost Optimization](cost-optimization.md) — incremental compile as a cost control strategy
- [Agent Observability](agent-observability.md) — SSE streaming as an observability mechanism
