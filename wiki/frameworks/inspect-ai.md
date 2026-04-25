---
id: 01KQ2X1N1WENQVW5HEHFHE0AWB
title: "Inspect AI — Evaluation Framework (UK AISI)"
type: framework
tags: [evaluation, agents, frameworks, benchmarks, llm, tools, orchestration]
created: 2026-04-18
updated: 2026-04-18
visibility: public
confidence: high
source: https://inspect.aisi.org.uk/
related: [llm-as-judge, agent-sandboxing, benchmark-design, agent-observability]
---

# Inspect AI — Evaluation Framework (UK AISI)

Open-source LLM evaluation framework built by the **UK AI Security Institute (AISI)**. Provides standardised, composable primitives for evaluating models across coding, reasoning, knowledge, behaviour, and multimodal tasks.

- **GitHub**: https://github.com/UKGovernmentBEIS/inspect_ai
- **Docs**: https://inspect.aisi.org.uk/

---

## What It Does

Inspect AI gives evaluators a structured way to define, run, and analyse LLM evaluations at scale. It is particularly strong for **agentic evaluation**: tasks that require tool use, multi-turn interaction, sandboxed code execution, and multi-agent coordination.

It is the primary harness used by UK AISI for frontier model safety evaluations.

---

## Key Concepts

Inspect is built around **three core primitives** that compose into a `Task`:

| Primitive | Role |
|---|---|
| **Dataset** | Labelled samples: `input` (prompts) + `target` (expected outputs or grading guidance) |
| **Solver** | Chained components that process inputs and generate results (from simple generation to multi-turn pipelines) |
| **Scorer** | Evaluation logic: text matching, model grading (LLM-as-judge), or custom functions |

A `Task` object unifies dataset + solver + scorer and is decorated with `@task` for CLI discovery.

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

```bash
# CLI
inspect eval theory.py --model openai/gpt-4
```

---

## Agent Evaluation Capabilities

Inspect is purpose-built for evaluating **agentic behaviour**, not just static QA:

- **Tool support**: custom tools, [Model Context Protocol (MCP)](../concepts/multi-agent-systems.md) integration, and built-in tools (bash, Python, text editing, web search, web browsing, computer interaction)
- **Agent architectures**: ReAct agent, multi-agent primitives, external agent support (Claude Code, Codex CLI, Gemini CLI)
- **Sandboxed execution**: isolated environments via Docker, Kubernetes, Modal, Proxmox — critical for safely running untrusted model-generated code (see [agent sandboxing](../concepts/agent-sandboxing.md))
- **Third-party agent bridge**: integrates OpenAI Agents SDK, LangChain, Pydantic AI

---

## Supported Model Providers

OpenAI, Anthropic, Google, Grok, Mistral, Hugging Face, AWS Bedrock, Azure AI, TogetherAI, Groq, Cloudflare, Goodfire. Local inference via vLLM, Ollama, llama-cpp-python, TransformerLens, nnterp.

---

## When to Use It

- You need to evaluate **agentic or tool-using** LLM behaviour, not just text generation
- You want **sandboxed code execution** as part of an eval task
- You need a harness that supports **multiple model providers** under a unified interface
- You want off-the-shelf benchmarks via the companion **Inspect Evals** library
- You're doing safety or capability evaluations at the model or system level
- You need **LLM-as-judge** scoring with audit trails (see [llm-as-judge](../concepts/llm-as-judge.md))

---

## Limitations

- Primarily Python-native; less suited for teams outside the Python ecosystem
- Sandboxing relies on Docker/K8s infra — adds operational overhead for local/lightweight use
- Best suited for **offline/batch evaluation**; not designed as a real-time production observability tool (contrast with [agent observability](../concepts/agent-observability.md))
- Reasoning model support is present but noted as requiring special configuration

---

## Notable Tooling

| Tool | Purpose |
|---|---|
| **Inspect View** | Web-based monitoring and visualisation with live log updates |
| **Log Viewer** | Browser UI for aggregated results and per-sample drill-down |
| **VS Code Extension** | Author, debug, and visualise evals in-editor |
| **Batch Processing** | Model batch APIs for reduced inference cost |
| **Structured Output** | JSON schema constraint support |
| **Model Output Caching** | Reduces repeated API costs during iterative eval development |

---

## Installation

```bash
pip install inspect-ai
```

Provider setup requires the corresponding SDK package and API key environment variables (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.).

---

## Companion Project: Inspect Evals

**Inspect Evals** is a curated library of pre-built benchmark implementations (e.g. MMLU, HumanEval, GPQA) that can be run off-the-shelf without custom development. It is the fastest path from install to a meaningful benchmark number.

---

## See Also

- [LLM-as-Judge](../concepts/llm-as-judge.md) — scoring mechanism used by Inspect's `model_graded_fact` scorer
- [Agent Sandboxing](../concepts/agent-sandboxing.md) — concept underlying Inspect's Docker/K8s execution isolation
- [Benchmark Design](../concepts/benchmark-design.md) — principles Inspect is built to support
- [Agent Observability](../concepts/agent-observability.md) — contrast with Inspect View's log-based approach
