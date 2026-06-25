---
title: "LangChain RAG From Scratch"
type: summary
source_file: raw/framework-docs/langchain-ai-rag-from-scratch.md
source_url: https://github.com/langchain-ai/rag-from-scratch
author: LangChain AI
date_published: ""
date_ingested: 2026-06-25
tags: [rag, langchain, retrieval, tutorial]
key_concepts: [retrieval-augmented-generation, indexing, retrieval, grounded-generation]
confidence: medium
---

# LangChain RAG From Scratch

## Source

- Raw source: `raw/framework-docs/langchain-ai-rag-from-scratch.md`
- URL: https://github.com/langchain-ai/rag-from-scratch
- Captured context: Jay flagged these RAG notebooks to refresh Agentic-KB RAG recipes/evals.

## TL;DR

This is a lightweight LangChain tutorial repo for building RAG from first principles: indexing, retrieval, and generation. It reinforces existing [[concepts/rag-systems]] coverage but does not add enough implementation detail in the captured README to change Agentic-KB's RAG architecture pages.

## Key Points

- RAG is presented as a way to give LLMs access to private or recent information without fine-tuning.
- Fine-tuning is framed as often poorly suited for factual recall and potentially costly.
- The repo accompanies a video playlist and notebooks that build up indexing, retrieval, and generation basics.

## KB Decision

- Summary created for provenance.
- No new concept, pattern, framework, or recipe page created from this capture alone. The README is too thin; the notebooks/video content would need capture before updating RAG recipes meaningfully.
- Existing [[concepts/rag-systems]], [[concepts/hybrid-retrieval]], [[patterns/pattern-grounded-generation]], and [[recipes/recipe-hybrid-search-llm-wiki]] remain the canonical RAG pages.

## Jay-Relevant Takeaway

Useful as a beginner teaching source, not a production reference. If Jay wants to refresh Hopper/RAG eval loops, ingest the actual notebooks or a more production-grade LangChain RAG source rather than relying on this README.

## Sources

- `raw/framework-docs/langchain-ai-rag-from-scratch.md`
