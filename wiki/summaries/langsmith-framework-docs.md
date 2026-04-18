---
title: LangSmith — Framework Docs Summary
type: summary
source_file: raw/framework-docs/langsmith.md
source_url: https://docs.langchain.com/langsmith/evaluation
author: LangChain Inc.
date_published: 2026-01-01
date_ingested: 2026-04-18
tags: [evaluation, observability, framework, langchain, langgraph, saas]
key_concepts: [evaluation, trajectory-evaluation, observability, llm-as-judge]
confidence: medium
reviewed: false
reviewed_date: ""
---

# LangSmith Summary

## Core Claim
[[framework-langsmith]] is LangChain's evaluation + observability SaaS for LLM applications. Two-surface model: **offline** (datasets + experiments for dev-time testing) and **online** (production trace monitoring with sampled eval). Primary moat: deep integration with [[framework-langgraph]] + [[framework-langchain]] and the production-trace-to-dataset loop.

## Key Points
- **Core primitives**: Datasets (inputs + reference outputs), Evaluators (human / code / LLM-judge / pairwise), Experiments (runs against a dataset), Traces/Runs (execution records with intermediate steps).
- **Offline eval**: benchmarking, unit tests, regression, backtesting — four-step workflow.
- **Online eval**: real-time safety / format / quality checks with sampling + filtering to control cost.
- **Multi-turn**: thread-based conversational eval.
- **SDK**: Python + TypeScript. Usable on any framework, not only LangChain.
- **Deployment**: Cloud (default) + self-hosted (enterprise tier).

## Unique Differentiators vs Peers
- Only one of the cohort that fuses eval + production observability in a single platform — trace-to-dataset conversion is the core workflow.
- Deepest integration with [[framework-langgraph]] / [[framework-langchain]]; weakest fit for teams not on that stack.
- SaaS-first; all three OSS peers ([[framework-inspect-ai]], [[framework-promptfoo]], [[framework-deepeval]]) are local-first.

## Gaps in Fetched Docs
The single page fetched did not detail:
- Specific agent trajectory / tool-call eval APIs (known to exist; need deeper doc pull)
- Insights Agent (automated trace triage)
- Self-hosted tier specifics
- Pricing
- Minimal working code example

Deeper content available at https://docs.langchain.com/llms.txt — queue for Round 2 if warranted.

## Confidence
`medium` — fetched doc was navigational. Specifics of agent eval, multi-turn, and pricing need additional ingestion for `high` confidence.

## Contradictions With Existing KB
None. Extends the existing [[framework-langgraph]] page with eval-surface coverage.

## Source
Full captured source: [[raw/framework-docs/langsmith]]
