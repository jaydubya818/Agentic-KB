---
title: Evaluation MoC
type: moc
tags: [evaluation, agentic, benchmarks, moc]
created: 2026-04-10
updated: 2026-04-10
---

# Evaluation — Map of Content
> Navigation hub for agent evaluation, benchmarking, self-critique, and judge patterns.

---

## Core Concepts

- [[concepts/llm-as-judge]] — Using LLMs to evaluate other LLM outputs; criteria design, bias, calibration
- [[concepts/trajectory-evaluation]] — Evaluating the full sequence of agent decisions, not just final output
- [[concepts/self-critique]] — Agents reviewing and improving their own outputs; reflection loops
- [[concepts/benchmark-design]] — Designing benchmarks for agentic tasks; task suites, success criteria, repeatability
- [[concepts/agent-failure-modes]] — Failure taxonomy; useful as eval criteria scaffold
- [[concepts/rag-systems]] — RAG eval metrics: recall@k, precision@k, MRR, nDCG, factuality, citation correctness

---

## Evaluations in This KB

- [[evaluations/eval-memory-approaches]] — In-context vs file-wiki vs vector DB vs knowledge graph; file-wiki wins for Jay's use case
- [[evaluations/eval-orchestration-frameworks]] — GSD vs [[framework-langgraph]] vs [[framework-autogen]] vs [[framework-crewai]] vs raw [[framework-claude-code]]; GSD first, raw [[framework-claude-code]] second

---

## Patterns

- [[patterns/pattern-compounding-loop]] — Verified ingest (×1.25 boost) as a primitive eval signal; quality gate on promotion

---

## Frameworks

### Eval-First Frameworks (added 2026-04-18 via /autoresearch)

- [[frameworks/framework-inspect-ai]] — UK AISI open-source eval framework; strongest agent + sandbox story in the cohort
- [[frameworks/framework-deepeval]] — Pytest-native eval with named agent metrics (PlanQuality, ToolCalling, ArgumentCorrectness)
- [[frameworks/framework-promptfoo]] — Declarative YAML eval + red-team CLI; now [[openai]]-owned, MIT
- [[frameworks/framework-langsmith]] — LangChain's proprietary eval + observability SaaS; unique trace-to-dataset workflow

### Agent-Stack Frameworks with Eval Features

- [[frameworks/framework-gsd]] — GSD verifier agent: four-level artifact check, stub detection, data-flow trace
- [[frameworks/framework-claude-code]] — [[framework-claude-code]]: built-in test running, hook-based verification
- [[frameworks/framework-langgraph]] — [[framework-langsmith]] evaluation integration for [[framework-langgraph]] agents

---

## Recipes

- [[recipes/recipe-agent-evaluation]] — Build an [[llm-as-judge]] evaluation harness for agents end-to-end

---

## System Policies (V2 — Promotion as Eval)

The V2 runtime uses promotion scoring as an inline evaluation mechanism:

- [[system/policies/promotion-rules]] — Scoring formula: evidence × confidence × freshness × trust × novelty × explicit_approval
- [[system/policies/source-trust-policy]] — Trust scoring as a dimension of evaluation quality
- [[system/policies/freshness-policy]] — Freshness as a quality signal for canonical knowledge
- [[system/policies/contradiction-policy]] — Contradiction detection as an eval gate before promotion

---

## Key Summaries

- [[summaries/siagian-agentic-engineer-roadmap-2026]] — Eval section: RAG metrics (recall@k, MRR, nDCG), agent task suites, error buckets, CI/CD blocking on metric regression
- [[summaries/summary-gsd-verifier]] — GSD Verifier agent: four-level check, stub detection, re-verification protocol
- [[summaries/summary-code-reviewer-agent]] — Code review as evaluation: severity levels, six dimensions, plan alignment
- [[summaries/inspect-ai-framework-docs]] — Inspect AI (UK AISI): three-primitive eval, sandbox defaults, Agent Bridge
- [[summaries/deepeval-framework-docs]] — DeepEval (Confident AI): 50+ metrics, named agent metrics, Pytest-native
- [[summaries/promptfoo-framework-docs]] — promptfoo ([[openai]]-owned, MIT): declarative YAML, red-team first-class, CI/CD native
- [[summaries/langsmith-framework-docs]] — LangSmith (LangChain): trace-to-dataset workflow, unified eval + observability
