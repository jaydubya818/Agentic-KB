---
title: Karpathy LLM Wiki Pattern
type: framework-doc
tags: [knowledge-base, llm, obsidian, rag]
updated: 2026-04-07
visibility: public
source: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
---

Andrej Karpathy proposed replacing RAG-on-raw-docs with an LLM-compiled persistent wiki. Instead of retrieving from unstructured sources at query time, the LLM reads raw docs and maintains a structured interlinked wiki. Knowledge compounds with every ingest. The LLM handles cross-referencing and synthesis so humans only need to supply sources and ask questions.

Key insight: every organisation has a raw/ directory of uncompiled knowledge. The LLM wiki is the compile step.
