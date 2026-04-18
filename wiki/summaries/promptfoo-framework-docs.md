---
title: promptfoo — Framework Docs Summary
type: summary
source_file: raw/framework-docs/promptfoo.md
source_url: https://www.promptfoo.dev/docs/intro/
author: promptfoo / OpenAI
date_published: 2026-01-01
date_ingested: 2026-04-18
tags: [evaluation, red-team, framework, ci-cd, openai]
key_concepts: [evaluation, benchmark-design, red-team, prompt-engineering]
confidence: high
reviewed: false
reviewed_date: ""
---

# promptfoo Summary

## Core Claim
[[framework-promptfoo]] is a declarative, YAML-driven CLI + library for evaluating and red-teaming LLM applications. Now an [[openai]] property post-acquisition, MIT-licensed, runs entirely locally. Emphasises test-driven LLM development over trial-and-error.

## Key Points
- **Two surfaces**: CLI (commands) + Node library (programmatic). Language-agnostic templates work from Python, JS, anywhere.
- **Declarative config**: YAML files specifying prompts, providers, tests, assertions, metrics.
- **Providers**: [[openai]], [[anthropic]], Azure, Google, HuggingFace, Llama, custom HTTP.
- **Red-team mode**: first-class jailbreak + adversarial testing with dashboard reporting. Distinguishes promptfoo from pure-eval peers.
- **CI/CD**: GitHub Actions integration; caching + concurrency.
- **Matrix views**: prompts × inputs comparison, side-by-side diff.
- **Data privacy**: 100% local execution — no telemetry, no upload.

## Workflow (Five-Step Cycle)
1. Define test cases (core scenarios + failure modes)
2. Configure evaluations (prompts + providers)
3. Execute evaluations
4. Analyse results (auto-assertions or structured review)
5. Expand test cases from feedback

## Unique Differentiators vs Peers
- Only framework in the cohort that treats **red-teaming as a first-class workflow** alongside quality eval.
- Post-acquisition by [[openai]] (2025) gives it distribution muscle; licensing remains MIT.
- Production-battle-tested (claims 10M+ end-user app usage); used internally by [[openai]] and [[anthropic]].

## Gaps in Source
- Docs don't detail agent-specific metrics (tool-call correctness, trajectory eval). Agent eval support may be weaker than Inspect AI / DeepEval.
- No explicit limitations section; users must consult GitHub issues.

## Contradictions With Existing KB
None.

## Source
Full captured source: [[raw/framework-docs/promptfoo]]
