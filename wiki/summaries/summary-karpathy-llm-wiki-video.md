---
id: 01KNNVX2REVW24T22P89GTFFGH
title: Building a Trading Strategies LLM Knowledge Base (Karpathy Pattern) — Video
type: summary
source_file: raw/transcripts/karpathy-llm-wiki-video.md
author: Unknown (trading-focused channel)
date_ingested: 2026-04-04
tags: [llm-wiki, karpathy, knowledge-base, obsidian, claude-code, rag-comparison]
key_concepts: [three-layer-architecture, ingest-query-lint, division-of-labor, compounding-knowledge, wiki-vs-rag, file-over-app]
confidence: medium
---

# Building a Trading Strategies LLM Knowledge Base (Karpathy Pattern) — Video

## Key Purpose

Video transcript explaining Karpathy's LLM wiki pattern and demonstrating a live build in Claude Code. Covers the core architecture, why it beats RAG, and the three core operations.

## Core Thesis: Knowledge That Compounds

Traditional RAG: LLM retrieves chunks and generates an answer. Nothing accumulates. Every query rediscovers knowledge from scratch.

LLM Wiki pattern: LLM builds and maintains a persistent interlinked wiki. Cross-references are pre-built. Contradictions are pre-flagged. Synthesis already reflects everything fed to it. Knowledge compounds instead of being thrown away after each conversation.

## Three-Layer Architecture

1. **Raw sources** — immutable. LLM reads, never writes.
2. **Wiki** — markdown files. LLM owns entirely. Summaries, entity pages, concept pages, comparisons.
3. **Schema** (CLAUDE.md) — tells the LLM how the wiki is structured and what conventions to follow.

Framing: "The wiki is a codebase. Obsidian is the IDE. The LLM is the programmer. The schema is the style guide."

## Three Core Operations

- **Ingest:** Drop new source into raw/, tell LLM to process it. LLM reads source, writes summary, updates index, cross-links across 10–15 wiki pages.
- **Query:** Ask questions against the wiki. Good answers get filed back as new pages — explorations compound.
- **Lint:** Maintenance pass. Find contradictions, stale claims, orphan pages, missing cross-references, gaps for web search.

## Division of Labor

| Role | Responsibilities |
|------|----------------|
| Human | Pick sources, direct analysis, ask good questions, decide what matters |
| LLM | Write all wiki pages, keep cross-references current, flag contradictions |

"Humans abandon wikis because maintenance burden grows faster than value. LLMs don't get bored. They can touch 15 files in a single pass. Cost of maintenance drops to near zero."

## Four Principles

1. **Explicit** — knowledge is visible in a navigable wiki
2. **Yours** — local files, not locked into any provider
3. **File over app** — markdown works with any tool, any CLI, any viewer
4. **Bring your own AI** — plug in Claude, GPT, open source, even fine-tune

## Live Build Notes

- Built with Opus 4.6
- Created trading strategies wiki from 8 raw transcripts using parallel agents
- Pages created: market structure concepts, strategy pages, psychology pages, entity pages for prop firms

## Connection to This KB

This transcript directly describes the pattern this Agentic-KB is built on. The three-layer architecture (raw/, wiki/, CLAUDE.md) is replicated exactly in this vault.

## Related Concepts

- [[wiki/summaries/summary-karpathy-llm-wiki-gist]]
- [[wiki/summaries/summary-nate-herk-llm-wiki]]

## Sources

- `raw/transcripts/karpathy-llm-wiki-video.md`
