---
title: Inspect AI — Framework Docs Summary
type: summary
source_file: raw/framework-docs/inspect-ai.md
source_url: https://inspect.aisi.org.uk/
author: UK AI Security Institute (AISI)
date_published: 2026-01-01
date_ingested: 2026-04-18
tags: [evaluation, agentic, benchmarks, framework, ukaisi]
key_concepts: [evaluation, llm-as-judge, trajectory-evaluation, benchmark-design, sandboxing]
confidence: high
reviewed: false
reviewed_date: ""
---

# Inspect AI Summary

## Core Claim
[[framework-inspect-ai]] is an open-source, three-primitive evaluation framework (datasets / solvers / scorers) built by the [[UK AISI]]. It combines standardised eval composition with first-class agent support — sandboxed tool use, [[mcp-ecosystem]] integration, and an Agent Bridge to third-party frameworks.

## Key Points
- Three primitives: **datasets** (input/target pairs), **solvers** (chained processors), **scorers** (text compare, model graded, custom).
- `Task` wraps all three; `@task` decorator makes it discoverable via `inspect eval` CLI.
- Supports essentially every major model provider ([[openai]], [[anthropic]], Google, Grok, Mistral, Bedrock, Azure, TogetherAI, Groq, Cloudflare) plus local via vLLM / Ollama / llama-cpp-python.
- **Agent primitives**: ReAct agent, multi-agent helpers, external agent support for [[framework-claude-code]], Codex CLI, Gemini CLI.
- **Agent Bridge**: adapts third-party frameworks ([[openai]] Agents SDK, [[framework-langchain]], Pydantic AI) to the Inspect eval loop.
- **Sandboxing**: Docker, Kubernetes, Modal, Proxmox — designed for untrusted model-generated code.
- **Built-in tools**: bash, Python, text editor, web search, web browser, computer use. [[mcp-ecosystem]] also supported.
- **Inspect View**: web-based eval log viewer; VS Code extension for in-editor dev.
- Companion project **Inspect Evals** ships pre-built benchmark implementations.

## Unique Differentiators vs Peers
- Only framework in this cohort with government-grade sandbox defaults and first-class support for running third-party agents (including [[framework-claude-code]]) inside an eval loop.
- Built-in resource limits (time, messages, tokens, cost) and early-stopping as first-class primitives.

## Links To Expand
- Add sandbox pattern page under patterns/ for `pattern-agent-sandbox`
- Evaluate for Jay's `recipe-agent-evaluation` once tested locally

## Contradictions With Existing KB
None — Inspect fills a gap: the KB had no dedicated evaluation-framework pages before this ingest.

## Source
Full captured source: [[raw/framework-docs/inspect-ai]]
