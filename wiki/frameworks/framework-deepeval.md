---
title: DeepEval
type: framework
vendor: Confident AI Inc.
version: latest (rolling)
language: python
license: open-source
github: https://github.com/confident-ai/deepeval
tags: [evaluation, framework, llm-as-judge, pytest, opentelemetry]
last_checked: 2026-04-18
jay_experience: none
confidence: high
reviewed: false
reviewed_date: ""
related: [concepts/llm-as-judge, concepts/trajectory-evaluation, concepts/benchmark-design, concepts/agent-failure-modes, frameworks/framework-inspect-ai, frameworks/framework-promptfoo, frameworks/framework-langsmith]
---

# [[framework-deepeval]]

[[framework-deepeval]] is the Pytest-native LLM evaluation framework with the richest catalogue of named agent metrics — `PlanQualityMetric`, `PlanAdherenceMetric`, `ArgumentCorrectnessMetric`, `ToolCallingMetric` — that map directly onto [[concepts/trajectory-evaluation]]. Built by Confident AI Inc. Pairs with a paid cloud for team collaboration.

## Overview
Open-source Python framework positioning itself as the "Pytest for LLMs." You write test cases as Python functions, decorate them with `@deepeval`, and plug in one of 50+ research-backed metrics. It treats LLM evaluation like unit testing — fit naturally into existing CI pipelines.

## Core Concepts
- **LLMTestCase** — single unit of LLM-app interaction. Required: `input`, `actual_output`. Optional: `expected_output`, `retrieval_context`, `tools_called`, etc.
- **Metric** — scorer that returns a float + pass/fail. 50+ shipped metrics, most [[concepts/llm-as-judge]]-based.
- **Golden** — ideal input/output pair; source of truth for dataset-driven eval.
- **Dataset** — collection of goldens.
- **`@observe` decorator** — tracing hook; non-intrusive instrumentation for component-level eval.

## Architecture
Pure Python library on top of Pytest. No server, no cloud dependency for the OSS core. `pytest` runs your LLM test functions, metrics call out to a judge model (default [[openai]]), results are assertable + reportable. `@observe` emits OpenTelemetry traces for production observability interop. Confident AI's cloud adds team collaboration on top.

## Strengths
- **Named agent metrics**: `PlanQualityMetric`, `PlanAdherenceMetric`, `ArgumentCorrectnessMetric`, `ToolCallingMetric` out of the box. Closest match in this cohort to [[concepts/trajectory-evaluation]].
- **Pytest-native**: zero onboarding cost for Pytest-using teams; runs as `pytest` command; standard CI reports.
- **50+ metrics**: hallucination, faithfulness, answer relevancy, bias, toxicity, summarization, custom GEval, RAG metrics (recall@k, MRR, contextual relevance).
- **Multi-turn support**: `ConversationalTestCase` for chatbot + agent eval.
- **Judge flexibility**: [[openai]] default, also [[anthropic]], Azure, Gemini, Ollama, custom.
- **OpenTelemetry export**: production tracing interop for real deployments.
- **Research-backed**: vendor claims per-metric citations to academic literature.

## Weaknesses
- **Judge dependency**: metrics are [[llm-as-judge]]-heavy; subject to all caveats in [[concepts/llm-as-judge]]'s Counter-arguments & Gaps section (Chen 2024 positional bias, weak-judge/strong-generator ceiling).
- **Rate-limit stalling**: documented limitation — evals stall on provider quota exhaustion; framework retries with exponential backoff.
- **No built-in sandboxing**: for code-running agents, sandbox yourself. [[framework-inspect-ai]] wins here.
- **No declarative config path**: Python only; [[framework-promptfoo]] wins for teams wanting YAML.
- **Paid cloud for collaboration**: OSS core is solid, but team features live behind the Confident AI paywall.

## Minimal Working Example
```python
from deepeval import assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import GEval, ToolCallingMetric

def test_agent_tool_call():
    metric = ToolCallingMetric(threshold=0.8)
    test_case = LLMTestCase(
        input="What is the weather in Paris?",
        actual_output="The weather in Paris is 15°C and sunny.",
        tools_called=[{"name": "get_weather", "arguments": {"city": "Paris"}}],
        expected_tools=[{"name": "get_weather", "arguments": {"city": "Paris"}}]
    )
    assert_test(test_case, [metric])
```
Run: `pytest test_agent_tool_call.py` (or `deepeval test run`).

## Integration Points
- Pytest native — any Pytest-compatible CI works
- OpenTelemetry — export traces to Jaeger, Tempo, Datadog, etc.
- Confident AI cloud for team collaboration (paid)
- Any LLM framework: [[framework-langchain]], [[framework-langgraph]], [[framework-crewai]], raw API — DeepEval wraps the outputs, not the framework

## Jay's Experience
N/A — not yet piloted. Top candidate for the metrics layer of [[recipes/recipe-agent-evaluation]]; named agent metrics are a direct match for what the recipe needs.

## Version Notes
- Rolling release; last_checked 2026-04-18
- Active development at [confident-ai/deepeval](https://github.com/confident-ai/deepeval)

## Sources
- [[summaries/deepeval-framework-docs]]
- [[raw/framework-docs/deepeval]]
