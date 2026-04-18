---
id: 01KNNVX2RK3BDG34Q1NWA7AI04
title: LangSmith — Evaluation & Observability Platform
type: framework-doc
source_url: https://docs.langchain.com/langsmith/evaluation
vendor: LangChain Inc.
date_captured: 2026-04-18
date_ingested: 2026-04-18
author: LangChain Inc.
tags: [evaluation, observability, framework, langchain, langgraph, traces, saas]
---

# LangSmith — Evaluation Platform

## Source
Docs: https://docs.langchain.com/langsmith/evaluation
Captured by WebFetch on 2026-04-18 as part of `/autoresearch` on "agent evaluation harnesses".

## What It Is
LangChain's evaluation + observability platform for LLM applications. Supports two complementary evaluation surfaces: **offline** (development-time, dataset-driven) and **online** (production monitoring).

## Core Concepts

**Datasets** — collections of test cases (inputs + reference outputs). Sourced from manual curation, historical traces, or synthetic generation.

**Evaluators** — scoring functions: human review, code-based rules, LLM-as-judge, pairwise comparison.

**Experiments** — results of running an application against a dataset. Configurable for repetitions, concurrency, caching.

**Traces / Runs** — individual execution records with inputs, outputs, and intermediate steps. Primary observability primitive.

## Evaluation Types

### Offline (Development)
- "Test before you ship" — curated datasets
- Supports benchmarking, unit tests, regression testing, backtesting
- Four-step workflow: create dataset → define evaluators → run experiment → analyse

### Online (Production)
- "Monitor in production" — real-time quality detection
- Safety checks, format validation, quality heuristics
- Sampling rates + filtering for cost control
- Multi-turn conversation support via threads

## Integration
Native to LangChain / LangGraph ecosystems. Works with Python + TypeScript. Standalone usage possible with `langsmith` SDK on any framework.

## Deployment
Cloud (SaaS, default) + self-hosted options. Pricing based on trace volume and seats (details not in the fetched docs).

## Known Gaps (in Fetched Docs)
The fetched page did not cover:
- Specific agent trajectory/tool-call eval APIs
- Insights Agent capabilities
- Full LangGraph integration details
- Exact self-hosted tier differences
- Pricing specifics
- Minimal code example

Full docs index available at https://docs.langchain.com/llms.txt for deeper coverage.

## Position in Ecosystem
LangSmith competes with promptfoo (OSS CLI), DeepEval (OSS Pytest), Inspect AI (OSS framework, stronger sandbox story), and emerging eval vendors. Differentiator: tight LangGraph / LangChain integration and production-trace-to-dataset workflow.
