---
title: DeepEval — Framework Docs Summary
type: summary
source_file: raw/framework-docs/deepeval.md
source_url: https://deepeval.com/docs/getting-started
author: Confident AI Inc.
date_published: 2026-01-01
date_ingested: 2026-04-18
tags: [evaluation, framework, llm-as-judge, pytest, opentelemetry]
key_concepts: [evaluation, llm-as-judge, trajectory-evaluation, benchmark-design]
confidence: high
reviewed: false
reviewed_date: ""
---

# DeepEval Summary

## Core Claim
[[framework-deepeval]] is a Pytest-native LLM evaluation framework by Confident AI Inc. Its distinguishing bet: 50+ research-backed metrics (mostly [[llm-as-judge]]) including dedicated agent metrics for plan quality, plan adherence, tool-call correctness. Pairs with a paid cloud for team collaboration.

## Key Points
- **Core abstraction**: `LLMTestCase` with `input` + `actual_output` (and optional `expected_output`, retrieval context, etc.).
- **50+ metrics** — GEval (general), hallucination, faithfulness, answer relevancy, bias, toxicity, summarization, and agent-specific metrics.
- **Agent metrics** — `PlanQualityMetric`, `PlanAdherenceMetric`, `ArgumentCorrectnessMetric`, `ToolCallingMetric`. Direct mapping to [[concepts/trajectory-evaluation]].
- **Two modes**: end-to-end (black-box) and component-level (white-box via `@observe` tracing).
- **Pytest integration** — run `pytest` on your agent code, get standard CI reports.
- **OpenTelemetry export** — production-trace interop.
- **Judges**: [[openai]] (default), Azure [[openai]], [[anthropic]], Gemini, Ollama, custom.
- **Multi-turn support** — conversational test cases for chatbots and agents.

## Unique Differentiators vs Peers
- Only framework in cohort with **named, research-backed agent metrics** out of the box (PlanQualityMetric, ToolCallingMetric, etc.) — closest match to [[concepts/trajectory-evaluation]] needs.
- Native Pytest patterns reduce onboarding for engineering teams already using Pytest.
- OpenTelemetry export gives production-observability path.

## Known Limitations
- Eval runs can stall on LLM rate limits / quota exhaustion; framework retries with exponential backoff.
- Like all [[llm-as-judge]] frameworks, metric quality depends on judge-model choice and calibration — see [[concepts/llm-as-judge]] counter-arguments.

## Contradictions With Existing KB
None.

## Source
Full captured source: [[raw/framework-docs/deepeval]]
