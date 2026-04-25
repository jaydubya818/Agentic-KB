---
id: 01KQ2X06X6N0YKAF6BHQ5K70A0
title: "DeepEval"
type: framework
tags: [evaluation, llm-as-judge, frameworks, agents, testing]
created: 2026-04-18
updated: 2026-04-18
visibility: public
confidence: high
source: https://deepeval.com/docs/getting-started
related: [llm-as-judge, agent-observability, benchmark-design]
---

# DeepEval

Open-source LLM evaluation framework built by Confident AI Inc. Designed to make it easy to build and iterate on LLM applications by providing pytest-style unit testing, 50+ built-in metrics, and agent-specific evaluations. Backed by a paid cloud platform for collaborative eval and monitoring.

## What It Does

DeepEval lets you write structured evaluations for LLM outputs — from simple correctness checks to multi-turn conversational tests. It treats evaluation as software testing: each interaction is a `LLMTestCase`, each quality criterion is a `Metric`, and suites of them run just like pytest.

Key capabilities:
- **50+ built-in metrics** — mostly [LLM-as-a-Judge](../concepts/llm-as-judge.md) with research backing, plus multimodal support
- **Agent-specific metrics** — plan quality, plan adherence, argument correctness, tool selection
- **LLM tracing** — non-intrusive `@observe` decorator for component-level visibility
- **OpenTelemetry export** — production tracing and monitoring interop
- **Multi-turn support** — conversational test cases for chatbots and agents

## Key Concepts

**Test Case** (`LLMTestCase`) — a single unit of LLM-app interaction. Required fields: `input`, `actual_output`. Optional: `expected_output`, retrieval context, conversation history.

**Metric** — a scoring function applied to a test case. Can be deterministic or LLM-judged. Threshold-based pass/fail.

**Dataset (Goldens)** — collections of ideal input/output pairs used to drive systematic evaluations at scale.

**Evaluation Modes:**
1. **End-to-End** — black-box evaluation treating the full app as a unit
2. **Component-Level** — white-box evaluation using LLM tracing; `@observe` decorator provides per-component visibility aligned with [agent observability](../concepts/agent-observability.md) patterns

## Agent-Specific Metrics

| Metric | What It Measures |
|---|---|
| `PlanQualityMetric` | Quality of agent-generated plans |
| `PlanAdherenceMetric` | Whether the agent follows its plan |
| `ArgumentCorrectnessMetric` | Correctness of tool-call arguments |
| `ToolCallingMetric` | Correctness of tool selection |

These make DeepEval particularly suited to evaluating agentic systems where tool use and planning are central behaviours.

## When to Use It

- You want **pytest-native LLM testing** in an existing Python CI pipeline
- You need **agent-level metrics** (tool calls, plan adherence) beyond simple output correctness
- You want **component-level tracing** without heavy instrumentation overhead
- Your team is evaluating with multiple judge model providers (OpenAI, Anthropic, Gemini, Ollama, Azure)

## Minimal Example

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

## Limitations

- Evaluations can **stall on LLM provider rate limits** or insufficient quotas; framework uses exponential backoff with automatic retry
- Heavy reliance on LLM-as-a-Judge means evaluation cost scales with test suite size
- Advanced features (collaborative dashboards, CI integrations) require the paid Confident AI cloud platform

## Installation

```bash
pip install -U deepeval
```

License: Open source (`confident-ai/deepeval`). Community support via Discord.

## See Also

- [LLM-as-Judge](../concepts/llm-as-judge.md) — the evaluation paradigm underpinning most DeepEval metrics
- [Agent Observability](../concepts/agent-observability.md) — how tracing and `@observe` fit into broader observability
- [Benchmark Design](../concepts/benchmark-design.md) — principles for designing evaluation datasets and goldens
