---
id: 01KQ2ZZ97A8CWYZ5WFRTS4ZTM4
title: "LLM Wiki Pattern"
type: pattern
tags: [knowledge-base, llm, rag, patterns, knowledge-management, obsidian]
created: 2026-04-07
updated: 2026-04-25
visibility: public
confidence: high
related: [concepts/knowledge-compilation, concepts/llm-wiki, concepts/ingest-pipeline, concepts/memory-systems]
source: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
---

# LLM Wiki Pattern

Proposed by **Andrej Karpathy**, the LLM Wiki Pattern replaces query-time RAG-on-raw-docs with an LLM-compiled, persistent, structured wiki. Rather than retrieving from unstructured sources at query time, an LLM reads raw documents during an ingestion step and maintains a continuously updated, interlinked knowledge base. Knowledge compounds with every ingest cycle.

## When to Use

- Your organisation accumulates raw documents (notes, transcripts, reports, specs) faster than humans can synthesise them.
- Query-time RAG latency or noise is a recurring problem.
- You want knowledge to compound over time rather than remain static and fragmented.
- You need humans to ask questions without first knowing which source documents are relevant.

## Structure

```
raw/                        ← unstructured source documents
  ├── doc-a.md
  ├── doc-b.pdf
  └── ...
          │
          ▼  (LLM compilation step)
wiki/                       ← structured, interlinked, persistent knowledge base
  ├── concepts/
  ├── patterns/
  ├── summaries/
  └── ...
```

1. **Ingest** — new raw documents are fed to the LLM.
2. **Compile** — the LLM synthesises, cross-references, and writes or updates wiki pages.
3. **Query** — humans (or agents) query the structured wiki directly, not the raw sources.
4. **Compound** — each new ingest enriches existing pages rather than adding isolated blobs.

The LLM handles cross-referencing and synthesis autonomously; humans only need to supply sources and ask questions.

## Example

An engineering team dumps meeting notes, ADRs, and Slack exports into `raw/`. A nightly job runs the LLM compilation step. By morning, `wiki/concepts/auth-strategy.md` has been updated with decisions from yesterday's architecture call, cross-linked to `wiki/patterns/pattern-token-refresh.md` — without any human editor touching it.

## Trade-offs

| Benefit | Cost |
|---|---|
| Knowledge compounds and becomes richer over time | Requires periodic re-ingestion to stay current |
| No query-time retrieval noise or latency | LLM compilation step adds upfront processing cost |
| Structured, navigable output (Obsidian-compatible) | Wiki can diverge from source truth if ingestion lapses |
| Humans can ask questions without knowing sources | Compilation quality depends on LLM capability and schema |

## Related Patterns

- [Ingest Pipeline](../concepts/ingest-pipeline.md)
- [LLM-Owned Wiki](../concepts/llm-owned-wiki.md)
- [LLM Wiki](../concepts/llm-wiki.md)
- [Memory Systems](../concepts/memory-systems.md)
- [Knowledge Graphs](../concepts/knowledge-graphs.md)

## ⚠️ Contradictions

> ⚠️ **Contradiction**: This pattern is framed as a full replacement for RAG-on-raw-docs. However, persistent wikis can become stale without continuous re-ingestion, whereas RAG always retrieves from the latest source documents. No mechanism for handling source updates, deletions, or conflicts is described in the source. The claim of full replacement may be overstated — in practice this pattern may complement rather than eliminate RAG for highly dynamic document sets.

## See Also

- [concepts/llm-wiki-compile-pipeline.md](../concepts/llm-wiki-compile-pipeline.md)
- [concepts/llm-wiki-pattern.md](../concepts/llm-wiki-pattern.md)
- [concepts/ingest-pipeline.md](../concepts/ingest-pipeline.md)
- [concepts/memory-systems.md](../concepts/memory-systems.md)
