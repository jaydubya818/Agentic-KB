---
id: 01KQ2X4EZT31AWMBW9VDBBW61W
title: "promptfoo — LLM Eval & Red-Team Framework"
type: framework
tags: [evaluation, red-team, frameworks, llm, safety, ci-cd, openai]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: https://www.promptfoo.dev/docs/intro/
related: [llm-as-judge, benchmark-design, agent-failure-modes, guardrails]
---

# promptfoo — LLM Eval & Red-Team Framework

Open-source CLI + library for evaluating and red-teaming LLM applications. Designed around **test-driven LLM development** — systematic, reproducible testing rather than ad-hoc iteration. Originally built for production apps serving 10M+ users. Now part of OpenAI following acquisition, but remains MIT-licensed and runs entirely locally with no external service dependencies.

## What It Does

promptfoo provides two core capabilities:

**Evaluation**: Benchmark prompts, models, and RAG pipelines against custom metrics. Runs a matrix of prompts × inputs, scores outputs automatically via configurable assertions, and surfaces results in a side-by-side CLI or web UI.

**Security / Red Teaming**: Automated adversarial testing to surface vulnerabilities, jailbreaks, and compliance gaps. Produces risk dashboards with structured vulnerability reporting.

## Key Concepts

- **Test cases** — declarative YAML definitions covering critical scenarios and known failure modes
- **Assertions** — configurable scoring criteria applied to each model output (exact match, regex, LLM-as-judge, custom functions)
- **Providers** — pluggable model backends: OpenAI, Anthropic, Azure, Google, HuggingFace, Llama, custom APIs
- **Evaluation matrix** — runs every prompt against every input across every provider, enabling systematic comparison
- **Red-team plugins** — automated probes for jailbreaks, prompt injection, PII leakage, and policy violations

## When to Use It

- You need **repeatable, versioned evals** before deploying prompt changes
- You want to run **CI/CD gates** on LLM output quality (GitHub Actions support built in)
- You need to **audit an LLM app for safety or compliance** risks before release
- You're comparing multiple models or providers on the same task
- You want **local-only execution** with no data leaving your environment

## Five-Step Eval Workflow

1. Define test cases covering critical scenarios and failure modes
2. Configure evaluations — prompts, providers, parameters
3. Execute evaluations; outputs are recorded and cached
4. Analyse results via automatic scoring or structured review
5. Expand test cases based on new user feedback or observed failures

## Usage Modes

| Mode | Description |
|---|---|
| CLI | `promptfoo eval` runs evaluations from the terminal |
| Node library | Programmatic integration for custom tooling |
| CI/CD | GitHub Actions integration for automated pipelines |

## Limitations

- Official docs do not detail hard technical constraints (token limits, rate-limit handling, parallelism caps) — consult GitHub issues for specifics
- Red-team coverage depends on the plugin set; novel attack surfaces may require custom probes
- YAML-centric config can become unwieldy for very large test suites
- Primarily a Node/JS-native tool; Python users interface via CLI or subprocess wrappers

## See Also

- [LLM-as-Judge](../concepts/llm-as-judge.md) — scoring outputs with another model, a technique used by promptfoo assertions
- [Benchmark Design](../concepts/benchmark-design.md) — principles for structuring meaningful eval suites
- [Agent Failure Modes](../concepts/agent-failure-modes.md) — the failure categories red-teaming aims to surface
- [Guardrails](../concepts/guardrails.md) — complementary runtime safety layer to eval-time red-teaming
