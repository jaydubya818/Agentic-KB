---
title: LangSmith
type: framework
vendor: LangChain Inc.
version: latest (rolling)
language: any
license: proprietary
github: (client SDK open source; backend proprietary)
tags: [evaluation, observability, framework, langchain, langgraph, saas]
last_checked: 2026-04-18
jay_experience: none
confidence: medium
reviewed: false
reviewed_date: ""
related: [frameworks/framework-langgraph, frameworks/framework-inspect-ai, frameworks/framework-promptfoo, frameworks/framework-deepeval, concepts/observability, concepts/trajectory-evaluation]
---

# [[framework-langsmith]]

[[framework-langsmith]] is LangChain's proprietary evaluation + observability SaaS. Its moat is the trace-to-dataset workflow: production traces from [[framework-langgraph]] / [[framework-langchain]] agents flow into LangSmith, become datasets, drive regression eval, and emit back into production monitoring. The only commercial-grade platform in the eval-framework cohort.

## Overview
Built by LangChain Inc. to complement the OSS LangChain stack. Offers two evaluation surfaces — **offline** (dataset-driven dev-time testing) and **online** (production trace monitoring with sampled eval). Deepest integration with [[framework-langgraph]], but usable standalone via the `langsmith` SDK on any framework.

## Core Concepts
- **Trace / Run** — execution record with inputs, outputs, and intermediate steps. Primary observability unit.
- **Dataset** — collection of test cases. Sourced from manual curation, historical traces (key workflow), or synthetic generation.
- **Evaluator** — scoring function. Human review, code rule, [[concepts/llm-as-judge]], pairwise comparison.
- **Experiment** — result of running an application against a dataset. Configurable for repetitions, concurrency, caching.
- **Thread** — multi-turn conversation wrapper for online eval.

## Architecture
SaaS-first. Python + TypeScript SDKs push traces to LangSmith cloud (or self-hosted backend at enterprise tier). Cloud UI handles dataset curation, experiment runs, evaluator config, dashboard views. Online eval runs as sampled inline evaluators against production traces.

## Strengths
- **Trace-to-dataset workflow**: capture a failing production trace, promote to regression dataset in one click. Unique in this cohort.
- **Unified eval + observability**: single platform for both, rather than bolting them together. [[framework-inspect-ai]] + [[framework-deepeval]] + [[framework-promptfoo]] are all eval-only.
- **Deep [[framework-langgraph]] integration**: traces are first-class in the [[framework-langgraph]] execution model; multi-turn evals mapped onto [[framework-langgraph]] threads.
- **Multi-language SDK**: Python + TypeScript parity.
- **Online production monitoring**: real-time safety / format / quality checks with sampling + filtering.

## Weaknesses
- **Proprietary**: backend is closed; vendor lock-in risk. The three OSS alternatives ([[framework-inspect-ai]], [[framework-deepeval]], [[framework-promptfoo]]) are all MIT/Apache.
- **Best value for LangChain-stack teams**: diminishing returns for non-[[framework-langchain]] users — you're paying for tight integration you may not use.
- **Pricing opaque from docs**: per-trace + per-seat model; exact numbers not in fetched content.
- **SaaS-first**: self-hosted is enterprise-tier; not a fit for privacy-strict orgs without negotiation.
- **Docs coverage gap**: the main eval doc page doesn't detail named agent metrics, Insights Agent capability, or full trajectory eval APIs — deeper ingestion needed for high confidence.

## Minimal Working Example
Not present in fetched content. Typical pattern:
```python
from langsmith import Client, evaluate

client = Client()

def my_agent(inputs: dict) -> dict:
    # your agent here
    return {"output": ...}

def correctness_evaluator(run, example):
    # LLM-judge or code rule
    return {"key": "correctness", "score": 1.0 if run.outputs["output"] == example.outputs["expected"] else 0.0}

evaluate(
    my_agent,
    data="my-dataset-name",
    evaluators=[correctness_evaluator],
    experiment_prefix="v1"
)
```

## Integration Points
- [[framework-langgraph]] — native; traces emitted automatically
- [[framework-langchain]] — native
- Any Python / TypeScript framework via `langsmith` SDK
- Export to OpenTelemetry (newer feature)

## Jay's Experience
N/A — not yet piloted. Secondary option for the [[recipes/recipe-agent-evaluation]] recipe if [[framework-inspect-ai]] + [[framework-deepeval]] don't cover production-observability needs.

## Version Notes
- Rolling release; last_checked 2026-04-18
- Client SDK open source; backend proprietary
- Insights Agent + automated trace triage advertised but not covered in fetched docs

## Sources
- [[summaries/langsmith-framework-docs]]
- [[raw/framework-docs/langsmith]]
