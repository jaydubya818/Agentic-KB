---
title: "Headroom — Context Compression Layer for AI Agents"
type: summary
source_file: raw/framework-docs/chopratejas-headroom.md
source_url: https://github.com/chopratejas/headroom
author: Tejas Chopra / Headroom contributors
date_published: ""
date_ingested: 2026-06-25
tags: [agentic, context-management, cost-optimization, compression, mcp, framework]
key_concepts: [context-compression, reversible-compression, tool-output-compression, cross-agent-memory]
confidence: medium
---

# Headroom — Context Compression Layer for AI Agents

## Source

- Raw source: `raw/framework-docs/chopratejas-headroom.md`
- URL: https://github.com/chopratejas/headroom
- Captured context: Jay flagged this as a token-compression proxy to evaluate for Hermes/local-agent cost reduction before enabling.

## TL;DR

[[frameworks/framework-headroom|Headroom]] is a local-first compression layer for LLM apps and coding agents. It can run as a Python/TypeScript library, HTTP proxy, agent wrapper, or MCP server, compressing tool outputs, logs, files, RAG chunks, and history before they hit the model while caching originals for retrieval.

## Key Points

- **Deployment modes:** library (`compress(messages)`), proxy (`headroom proxy`), agent wrapper (`headroom wrap claude|codex|cursor|aider|copilot`), and MCP server (`headroom_compress`, `headroom_retrieve`, `headroom_stats`).
- **Compression pipeline:** CacheAligner stabilizes cacheable prefixes; ContentRouter chooses a compressor; SmartCrusher handles JSON; CodeCompressor handles AST/code; Kompress-base handles prose; CCR stores originals.
- **Reversible compression:** CCR caches originals locally and exposes retrieval so the LLM can request detail when compressed context is insufficient.
- **Source-reported savings:** README reports 60–95% fewer tokens and examples such as SRE incident debugging 65,694 → 5,118 tokens. Treat benchmark claims as source-reported until reproduced locally.
- **Output shaping:** optional proxy behavior to reduce output verbosity and route lower reasoning effort for routine turns; output token savings are reported as estimates or measured with a holdout.
- **Cross-agent memory:** claims shared store across Claude, Codex, and Gemini with auto-dedup.
- **Failure mining:** `headroom learn` mines failed sessions and writes corrections to agent instruction files.
- **Operational caveat:** local install can require Rust/ONNX/HuggingFace assets; corporate SSL inspection and offline model download are called out in the source.

## Extracted KB Updates

- Created [[frameworks/framework-headroom]].
- Updated [[concepts/cost-optimization]] with reversible compression as a distinct option from rolling summaries.
- Related to [[recipes/recipe-context-compression]], but Headroom is proxy/library infrastructure rather than a summarize-and-replace recipe.

## Jay-Relevant Takeaway

Headroom is worth a controlled local pilot, not blind enablement. The useful pattern is reversible, content-aware compression with retrieval fallback. The risk is silently harming trace/eval quality if compressed context loses the detail needed for [[concepts/trajectory-evaluation]] or debugging.

## Caveats

- Benchmark numbers are README-reported.
- Compression tools can hide failure evidence if logs/traces are summarized too aggressively.
- For Hermes, start with read-only/report mode or a wrapper around non-critical sessions before putting this in front of primary work.

## Sources

- `raw/framework-docs/chopratejas-headroom.md`
