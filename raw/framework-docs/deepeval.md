---
id: 01KNNVX2RK3BDG34Q1NWA7AI03
title: DeepEval — LLM Evaluation Framework
type: framework-doc
source_url: https://deepeval.com/docs/getting-started
github: https://github.com/confident-ai/deepeval
vendor: Confident AI Inc.
date_captured: 2026-04-18
date_ingested: 2026-04-18
author: Confident AI Inc.
tags: [evaluation, framework, open-source, llm-as-judge, pytest, opentelemetry]
---

# DeepEval — LLM Evaluation Framework

## Source
Docs: https://deepeval.com/docs/getting-started
GitHub: https://github.com/confident-ai/deepeval
Captured by WebFetch on 2026-04-18 as part of `/autoresearch` on "agent evaluation harnesses".

## What It Is
Open-source evaluation framework for LLM applications. Positions itself as making it "extremely easy to build and iterate on LLM (applications)." Built by Confident AI Inc., which also offers a paid cloud platform for collaborative eval and monitoring.

## Core Concepts

**Test Cases** — `LLMTestCase` = single unit of LLM-app interaction. Required: `input`, `actual_output`. Optional: `expected_output`, retrieval context, etc.

**Metrics** — 50+ built-in metrics, predominantly LLM-as-a-Judge with research backing. Multimodal support.

**Datasets (Goldens)** — ideal output + input pairs used to drive systematic evaluations.

## Evaluation Modes
1. **End-to-End** — black-box eval treating the app holistically
2. **Component-Level** — white-box eval with LLM tracing; `@observe` decorator for per-component visibility

## Agent-Specific Metrics
DeepEval ships agent-focused metrics:
- **PlanQualityMetric** — quality of agent-generated plans
- **PlanAdherenceMetric** — does the agent follow its plan
- **ArgumentCorrectnessMetric** — correctness of tool-call arguments
- **ToolCallingMetric** — correctness of tool selection

## Key Features
- **Pytest-style integration** — unit-test LLM outputs with familiar Pytest patterns
- **LLM tracing** — non-intrusive `@observe` decorator
- **OpenTelemetry export** — production tracing/monitoring interop
- **Multi-turn support** — conversational test cases for chatbots + agents

## Supported Judge Models
OpenAI (default), Azure OpenAI, Anthropic, Gemini, Ollama, custom LLM implementations.

## Installation
```bash
pip install -U deepeval
```

## Minimal Working Example
```python
from deepeval import assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import GEval

def test_correctness():
    metric = GEval(
        name="Correctness",
        criteria="Determine if output is correct based on expected output.",
        threshold=0.5
    )
    test_case = LLMTestCase(
        input="Sample question",
        actual_output="Model response",
        expected_output="Ideal response"
    )
    assert_test(test_case, [metric])
```

## Known Limitations
- Evaluations may stall on LLM provider rate limits or insufficient quotas
- Framework implements exponential backoff with automatic retry for transient errors

## License & Repository
Open source at `confident-ai/deepeval`. Community support via Discord.
