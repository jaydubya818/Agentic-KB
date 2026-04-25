---
id: 01KQ2ZZ97BBRV7PT00V42RDP3T
title: "Knowledge Compilation"
type: concept
tags: [knowledge-base, llm, knowledge-management, patterns, workflow]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [concepts/ingest-pipeline, concepts/llm-wiki, patterns/llm-wiki-pattern]
source: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
---

# Knowledge Compilation

## Definition

Knowledge compilation is the process of transforming unstructured, raw knowledge assets into a structured, interlinked, queryable knowledge base — analogous to how a software compiler transforms human-readable source code into optimised machine output.

In the context of LLM-powered systems, the compilation step is performed by an LLM: it reads raw documents and produces structured wiki pages with cross-references, summaries, and synthesised concepts.

> "Every organisation has a raw/ directory of uncompiled knowledge. The llm-wiki is the compile step."
> — Andrej Karpathy

## Why It Matters

Most organisations accumulate knowledge in unstructured forms — meeting notes, PDFs, chat logs, specs — that sit in a `raw/` directory equivalent and are never synthesised. This creates:

- **Retrieval friction**: humans and agents must know what to look for before they can find it.
- **Duplication**: the same insight is re-derived repeatedly because it was never distilled.
- **Knowledge decay**: raw documents age and contradict each other without reconciliation.

The compilation metaphor reframes knowledge management as an engineering problem: raw inputs go in, structured outputs come out, and the output improves with each cycle.

## Example

A startup has three years of Notion pages, Slack exports, and interview transcripts. Running the LLM compilation step over these produces a `wiki/` with concept pages for their core domain model, pattern pages for their recurring technical decisions, and summary pages for key customer insights — all cross-linked and queryable.

Subsequent compilation runs update existing pages rather than creating new blobs, so knowledge compounds instead of fragmenting.

## Key Properties

- **Incremental**: each ingest enriches existing pages rather than appending raw material.
- **Autonomous cross-referencing**: the LLM identifies and creates links between related concepts without human intervention.
- **Lossy by design**: compilation discards raw noise and retains structured signal — this is a feature, not a bug.
- **Schema-driven**: the output quality depends on having a clear schema (like this wiki's frontmatter and section conventions).

## See Also

- [LLM Wiki Pattern](../patterns/llm-wiki-pattern.md)
- [Ingest Pipeline](../concepts/ingest-pipeline.md)
- [LLM Wiki](../concepts/llm-wiki.md)
- [LLM Wiki Compile Pipeline](../concepts/llm-wiki-compile-pipeline.md)
