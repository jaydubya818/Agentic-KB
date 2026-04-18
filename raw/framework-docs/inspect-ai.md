---
id: 01KNNVX2RK3BDG34Q1NWA7AI01
title: Inspect AI — Evaluation Framework (UK AISI)
type: framework-doc
source_url: https://inspect.aisi.org.uk/
github: https://github.com/UKGovernmentBEIS/inspect_ai
vendor: UK AI Security Institute (AISI)
date_captured: 2026-04-18
date_ingested: 2026-04-18
author: UK AISI
tags: [evaluation, agentic, benchmarks, framework, open-source, ukaisi]
---

# Inspect AI — Evaluation Framework

## Source
Official docs: https://inspect.aisi.org.uk/
GitHub: https://github.com/UKGovernmentBEIS/inspect_ai
Captured by WebFetch on 2026-04-18 as part of `/autoresearch` on "agent evaluation harnesses".

## What It Is
Open-source framework for evaluating LLMs across coding, reasoning, knowledge, behaviour, and multimodal tasks. Built by the UK AI Security Institute (AISI). Provides standardised interfaces for composing and reusing evaluation components.

## Core Architecture (Three Primitives)

1. **Datasets** — collections of labelled samples with `input` (prompts) and `target` (expected outputs or grading guidance).
2. **Solvers** — chained components that process dataset inputs and generate results. Range from simple generation to multi-turn prompt engineering.
3. **Scorers** — evaluation mechanisms using text comparison, model grading (LLM-as-judge), or custom logic.

A `Task` object unifies dataset + solver + scorer. Decorated with `@task` for CLI discovery via `inspect eval`.

## Supported Model Providers
OpenAI, Anthropic, Google, Grok, Mistral, Hugging Face, AWS Bedrock, Azure AI, TogetherAI, Groq, Cloudflare, Goodfire. Local via vLLM, Ollama, llama-cpp-python, TransformerLens, nnterp.

## Agent Evaluation Capabilities
- **Tools**: custom tools, Model Context Protocol (MCP) integration, built-in tools (bash, Python, text editing, web search, web browsing, computer interaction)
- **Agent types**: ReAct agent, multi-agent primitives, external agent support (Claude Code, Codex CLI, Gemini CLI)
- **Sandboxing**: isolated execution via Docker, Kubernetes, Modal, Proxmox (extensible APIs for untrusted model-generated code)
- **Architectures**: custom agent implementations with state management and internal interaction handling

## Notable Features
- **Inspect View** — web-based monitoring/visualisation with automatic log updates
- **Log Viewer** — browser interface for aggregated results and per-sample detail
- **VS Code Extension** — authoring, debugging, visualising evals in-editor
- **Agent Bridge** — integrate third-party frameworks (OpenAI Agents SDK, LangChain, Pydantic AI)
- **Batch Processing** — model batch APIs for inference cost reduction
- **Structured Output** — JSON schema constraint support
- **Reasoning Model Support** — special options/data for reasoning-focused models

## Installation
```bash
pip install inspect-ai
```
Provider setup requires corresponding packages + env-var API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc).

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

CLI: `inspect eval theory.py --model openai/gpt-4`
Programmatic: `eval(theory_of_mind(), model="openai/gpt-4o")`

## Companion Project
**Inspect Evals** — pre-built implementations of popular benchmarks; usable off-the-shelf without custom dev.

## Logging & Analysis
- Logs default to `./logs`
- Python API for programmatic log access
- Dataframe extraction for sample/message/event analysis
- Integrates with Python's standard `logging`

## Advanced Capabilities
- Highly parallel async architecture with tuning knobs
- Model output caching (API-cost reduction)
- Comprehensive error recovery
- Resource limits: time, messages, tokens, cost
- Early stopping: conditional task termination based on sample scores
- Static typing support; typed interfaces
- Extension APIs for new model providers, execution environments, storage platforms

## Limitations & Considerations
- Context-window constraints on long-running agents, addressed via message-history compaction
- No explicit security vulnerabilities documented; sandboxing emphasised for untrusted code execution

## License
Open source. Standard recommended citation for academic use.
