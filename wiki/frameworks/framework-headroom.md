---
title: Headroom
type: framework
vendor: Tejas Chopra / Headroom contributors
version: rolling
language: any
license: open-source
github: https://github.com/chopratejas/headroom
tags: [agentic, context-management, cost-optimization, mcp, compression, local-first]
last_checked: 2026-06-25
jay_experience: none
---

## Overview

Headroom is a local-first context compression layer for AI agents and LLM apps. It compresses tool outputs, logs, RAG chunks, files, and conversation history before they reach the model, while caching originals for retrieval when detail is needed.

It can run as a Python/TypeScript library, an OpenAI/Anthropic-compatible proxy, a wrapper around coding agents, or an MCP server. The source positions it as a cost and context-pressure reducer for daily coding-agent use.

## Core Concepts

- **ContentRouter:** detects content type and chooses the compression path.
- **SmartCrusher:** compresses JSON and structured tool outputs.
- **CodeCompressor:** uses AST-aware compression for code.
- **Kompress-base:** HuggingFace model for text/prose compression.
- **CacheAligner:** stabilizes prompt prefixes to preserve provider KV/prompt-cache hits.
- **CCR (Compress-Cache-Retrieve):** stores originals locally and exposes retrieval when compressed content is insufficient.
- **Output shaping:** optional proxy behavior to trim verbose model responses and route lower effort for routine turns.

## Architecture

```text
agent / app
  → prompts, tool outputs, logs, RAG chunks, files
  → Headroom
      → CacheAligner
      → ContentRouter
          → SmartCrusher | CodeCompressor | Kompress-base
      → CCR local original cache
  → compressed prompt + retrieval tool
  → LLM provider
```

## Strengths

- **Reversible compression:** safer than one-way truncation because originals remain retrievable.
- **Multiple integration modes:** library, proxy, MCP, and agent wrappers cover most agent stacks.
- **Local-first privacy posture:** the README says data stays local when running local modes.
- **Content-aware compression:** JSON, code, logs, diffs, and prose take different paths.
- **Agent compatibility:** README lists Claude Code, Codex, Cursor, Aider, Copilot, and OpenClaw support.

## Weaknesses

- **Eval trace risk:** compression can remove evidence needed for [[concepts/trajectory-evaluation]] unless traces are preserved separately.
- **Benchmark claims require reproduction:** token-savings numbers are source-reported.
- **Install/runtime complexity:** optional ML compression can require Rust, ONNX Runtime, HuggingFace model downloads, and corporate TLS workarounds.
- **Proxy blast radius:** putting it in front of primary Hermes/Codex sessions changes every request/response path.

## Minimal Working Example

```bash
# Python
pip install "headroom-ai[all]"
headroom proxy --port 8787

# Wrap an agent
headroom wrap claude
headroom wrap codex

# MCP tools
headroom mcp install
```

A conservative local pilot should start with non-critical sessions and measure before/after quality, not just token count.

## Integration Points

- **[[concepts/cost-optimization]]:** local compression can reduce input/output token spend.
- **[[recipes/recipe-context-compression]]:** Headroom is infrastructure for compression; the recipe is a manual rolling-summary implementation.
- **[[concepts/rag-systems]]:** compress RAG chunks before generation, but preserve citation chunk IDs and retrieval logs.
- **[[mcp-ecosystem]]:** exposes compression/retrieval/stat tools to MCP clients.

## Jay's Experience

N/A — not yet used.

## Version Notes

- Captured README reports Python and npm packages, Docker image, MCP server, output shaping, and `headroom learn` failure mining.
- License in source: Apache 2.0.

## Sources

- [[summaries/chopratejas-headroom]]
- Raw source: `raw/framework-docs/chopratejas-headroom.md`
- GitHub: https://github.com/chopratejas/headroom
