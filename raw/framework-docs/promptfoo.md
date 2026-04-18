---
id: 01KNNVX2RK3BDG34Q1NWA7AI02
title: promptfoo — LLM Eval & Red-Team Framework
type: framework-doc
source_url: https://www.promptfoo.dev/docs/intro/
github: https://github.com/promptfoo/promptfoo
vendor: OpenAI (acquired from promptfoo)
date_captured: 2026-04-18
date_ingested: 2026-04-18
author: promptfoo / OpenAI
tags: [evaluation, red-team, framework, open-source, ci-cd, prompts, openai]
---

# promptfoo — LLM Evaluation and Red-Teaming

## Source
Docs: https://www.promptfoo.dev/docs/intro/
GitHub: https://github.com/promptfoo/promptfoo
Captured by WebFetch on 2026-04-18 as part of `/autoresearch` on "agent evaluation harnesses".

## What It Is
Open-source CLI + library for evaluating and red-teaming LLM applications. Designed for systematic testing (test-driven LLM development) rather than trial-and-error iteration. Originally built for production apps serving 10M+ users.

## Ownership
Now part of OpenAI following acquisition. Remains open source (MIT), runs entirely locally — no external services required.

## Core Capabilities

### Evaluation
- Benchmark prompts, models, and RAG pipelines against custom metrics
- Automatic output scoring via configurable assertions
- Matrix-style comparison views (multiple prompts × many inputs)
- Side-by-side result visualisation (CLI + web UI)

### Security Testing (Red Team)
- Automated red-teaming to identify vulnerabilities and compliance gaps
- Pentesting for jailbreaks and adversarial attacks
- Risk-reporting dashboards with high-level vulnerability views

## Architecture

**Provider support**: OpenAI, Anthropic, Azure, Google, HuggingFace, open-source models (Llama), custom API endpoints.

**Key components**:
- Test cases representing core use scenarios and failure modes
- Configurable assertions and evaluation metrics
- Runtime: caching, concurrency, live reloading
- Language-agnostic (Python, JavaScript, etc.)

## Usage Modes
1. **CLI** — command-line evaluation runs
2. **Node library** — programmatic integration
3. **CI/CD** — GitHub Actions support for automated workflows

## Workflow (Five-Step Cycle)
1. Define test cases covering critical scenarios + failure modes
2. Configure evaluations (prompts + providers)
3. Execute evaluations, record outputs
4. Analyse results automatically or via structured review
5. Expand test cases based on user feedback / examples

## Notable Features
- Live reloads, caching, quality-of-life dev features
- Declarative YAML test case syntax
- Built-in sharing and collaboration tools
- Web-based result viewer
- Fully local execution (data privacy)
- Battle-tested in production at scale

## Configuration
YAML-based config files specify:
- LLM providers and models
- Test inputs and expected outputs
- Metrics and assertion criteria
- Evaluation parameters

## License
MIT — "no strings attached" per docs.

## Limitations & Known Issues
Documentation does not detail specific constraints; users should consult release notes and GitHub issues for current technical limits.

## Notable Adopters
Used internally by OpenAI and Anthropic (per promptfoo marketing).
