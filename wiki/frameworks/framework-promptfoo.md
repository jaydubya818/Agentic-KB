---
title: promptfoo
type: framework
vendor: OpenAI (acquired from promptfoo team)
version: latest (rolling)
language: typescript
license: open-source
github: https://github.com/promptfoo/promptfoo
tags: [evaluation, red-team, framework, ci-cd, openai]
last_checked: 2026-04-18
jay_experience: none
confidence: high
reviewed: false
reviewed_date: ""
related: [concepts/benchmark-design, concepts/llm-as-judge, concepts/guardrails, frameworks/framework-inspect-ai, frameworks/framework-deepeval, frameworks/framework-langsmith]
---

# [[framework-promptfoo]]

[[framework-promptfoo]] is the declarative YAML-first eval + red-team CLI for LLM applications. Now an [[openai]] property (post-acquisition), MIT-licensed, runs entirely locally. Best fit for teams who want "define tests, run in CI, go" without learning a Python eval DSL.

## Overview
Built originally for a production LLM app serving 10M+ users; acquired by [[openai]] in 2025. Written in TypeScript with Python client bindings. Two personas: quality-eval (regression testing of prompts/models/RAG) and red-team (automated jailbreak + adversarial discovery). Runs 100% local — no telemetry, no upload.

## Core Concepts
- **Test case** — YAML-declared input + assertions.
- **Provider** — LLM endpoint; [[openai]], [[anthropic]], Azure, Google, HuggingFace, Llama, custom HTTP.
- **Assertion** — automated metric: equals, contains, llm-rubric, javascript function, similar, model-graded.
- **Matrix** — prompts × inputs × providers evaluation grid.
- **Red-team plugin** — adversarial test generator + vulnerability reporter.

## Architecture
YAML config file drives everything. CLI discovers it, runs evals concurrently, caches results, emits a web UI viewable locally. Node package for programmatic use. GitHub Actions action for CI/CD gating.

## Strengths
- **Declarative config**: YAML drops the eval barrier for non-Python teams.
- **Red-team first-class**: jailbreak and adversarial testing built into the same tool as quality eval. Unique in this cohort.
- **Local + privacy-respecting**: no uploads, no telemetry, purely local execution.
- **CI/CD native**: GitHub Actions integration out of the box; cache + concurrency for fast PR feedback.
- **Matrix views**: side-by-side prompt/model comparison makes regression testing visual.
- **Production scale**: battle-tested at 10M+ users before acquisition.
- **Distribution**: post-[[openai]] acquisition means continued investment and docs quality.

## Weaknesses
- **Weaker agent eval**: docs don't detail named agent metrics (tool-call correctness, trajectory adherence) — weaker fit than [[framework-deepeval]] or [[framework-inspect-ai]] for agentic workloads.
- **No built-in sandboxing**: if you're evaluating code-running agents, you need to provide isolation yourself (unlike [[framework-inspect-ai]]).
- **TypeScript-first**: Python library is a client wrapper; native Python teams might prefer [[framework-deepeval]].
- **Licensing narrative**: post-[[openai]] acquisition raises long-term neutrality questions; still MIT-licensed today.

## Minimal Working Example
```yaml
# promptfooconfig.yaml
prompts:
  - "Summarise the following in one sentence: {{text}}"
providers:
  - openai:gpt-4o-mini
  - anthropic:claude-haiku-4-5
tests:
  - vars:
      text: "The meeting was cancelled due to weather."
    assert:
      - type: llm-rubric
        value: "Output is a single declarative sentence preserving all facts."
  - vars:
      text: "..."
    assert:
      - type: contains
        value: "rescheduled"
```
Run: `promptfoo eval` → web UI at `localhost:15500`.

## Integration Points
- GitHub Actions for CI/CD gating
- Any LLM provider via custom HTTP provider config
- [[framework-mcp]] — not native, but any [[mcp-ecosystem]] server can be wrapped as a provider
- LangChain / other frameworks via custom provider

## Jay's Experience
N/A — not yet piloted. Candidate for red-team evaluation of Jay's agents; complement rather than replacement for agent-centric eval via [[framework-inspect-ai]].

## Version Notes
- Rolling release; MIT licensed; last_checked 2026-04-18
- Acquired by [[openai]] (circa 2025); remains open source
- Used internally by [[openai]] and [[anthropic]] per vendor claims

## Sources
- [[summaries/promptfoo-framework-docs]]
- [[raw/framework-docs/promptfoo]]
