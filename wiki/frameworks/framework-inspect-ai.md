---
title: Inspect AI
type: framework
vendor: UK AI Security Institute (AISI)
version: latest (rolling)
language: python
license: open-source
github: https://github.com/UKGovernmentBEIS/inspect_ai
tags: [evaluation, agentic, benchmarks, sandboxing, ukaisi]
last_checked: 2026-04-18
jay_experience: none
confidence: high
reviewed: false
reviewed_date: ""
related: [concepts/benchmark-design, concepts/llm-as-judge, concepts/trajectory-evaluation, frameworks/framework-promptfoo, frameworks/framework-deepeval, frameworks/framework-langsmith]
---

# [[framework-inspect-ai]]

[[framework-inspect-ai]] is the UK AI Security Institute's open-source evaluation framework — the most agent-capable OSS eval stack as of 2026, with first-class sandboxing, [[mcp-ecosystem]] support, and an Agent Bridge that wraps third-party agent frameworks inside its eval loop.

## Overview
Built by UK AISI for safety-grade LLM evaluations. Python-first, async under the hood, and designed from day one for high-stakes eval work where sandbox isolation and reproducibility matter. It composes evals out of three primitives — datasets, solvers, scorers — wrapped in a `Task`. Every eval is discoverable via the `inspect eval` CLI.

## Core Concepts
- **Task** — the unit of evaluation. Decorated with `@task`. Combines a dataset, a solver chain, and a scorer.
- **Dataset** — labelled samples; `input` (prompt) + `target` (expected output or grading rubric).
- **Solver** — chainable component that transforms inputs to outputs. `chain_of_thought()`, `generate()`, `self_critique()`, custom.
- **Scorer** — evaluator. Text compare, [[concepts/llm-as-judge]] (`model_graded_fact()`), or custom logic.
- **Sandbox** — execution environment for agent tool use. Docker, Kubernetes, Modal, or Proxmox.
- **Agent Bridge** — wraps [[openai]] Agents SDK / [[framework-langchain]] / Pydantic AI agents as solvers.

## Architecture
Async, highly parallel core. Logs default to `./logs` in a structured format that the web-based **Inspect View** renders. Resource limits (time, messages, tokens, cost) and early-stopping are first-class primitives, not bolt-ons.

## Strengths
- **Agent-centric evaluation**: ReAct agent, multi-agent primitives, external agent support for [[framework-claude-code]], Codex CLI, Gemini CLI out of the box.
- **Sandboxing by default**: Docker/K8s/Modal/Proxmox isolation for untrusted model-generated code. The only mainstream OSS eval framework that treats sandboxing as a core feature.
- **Provider breadth**: [[openai]], [[anthropic]], Google, Grok, Mistral, HuggingFace, Bedrock, Azure, TogetherAI, Groq, Cloudflare, Goodfire, local via vLLM / Ollama / llama-cpp-python.
- **[[mcp-ecosystem]] integration**: first-class [[framework-mcp]] support.
- **Inspect Evals**: companion repo of pre-built benchmark implementations.

## Weaknesses
- Context-window constraints on long agent runs (mitigated via message-history compaction, but still a ceiling).
- Heavier learning curve than [[framework-promptfoo]] for teams that want declarative YAML rather than Python.
- SaaS observability story weaker than [[framework-langsmith]] — Inspect View is local-first.
- No named agent metrics equivalent to [[framework-deepeval]]'s `PlanQualityMetric` / `ToolCallingMetric`; teams must compose their own scorers.

## Minimal Working Example
```python
from inspect_ai import Task, task
from inspect_ai.dataset import example_dataset
from inspect_ai.scorer import model_graded_fact
from inspect_ai.solver import chain_of_thought, generate, self_critique

@task
def theory_of_mind():
    return Task(
        dataset=example_dataset("theory_of_mind"),
        solver=[chain_of_thought(), generate(), self_critique()],
        scorer=model_graded_fact()
    )
```

Run: `inspect eval theory.py --model anthropic/claude-sonnet-4-6`

## Integration Points
- [[framework-mcp]] — first-class tool server integration
- [[framework-claude-code]] — external agent support via Agent Bridge; evaluate a [[framework-claude-code]] agent inside Inspect
- [[framework-langchain]] / Pydantic AI — wrapped as solvers
- OpenTelemetry — standard tracing export
- VS Code extension for in-editor dev

## Jay's Experience
N/A — not yet piloted. Flagged as the leading candidate for the agent-evaluation [[recipes/recipe-agent-evaluation]] recipe given sandbox defaults and Agent Bridge.

## Version Notes
- Rolling release; last_checked 2026-04-18
- Active development at [UKGovernmentBEIS/inspect_ai](https://github.com/UKGovernmentBEIS/inspect_ai)
- Companion Inspect Evals repo tracks latest benchmark suites

## Sources
- [[summaries/inspect-ai-framework-docs]]
- [[raw/framework-docs/inspect-ai]]
