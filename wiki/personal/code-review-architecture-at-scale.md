---
id: 01JB0FACTORY0CODEREVIEW00004
title: "Code Review Architecture for Agentic Systems at Enterprise Scale"
type: personal
tags: [code-review, agents, architecture, model-routing, enterprise, verification]
created: 2026-09-08
updated: 2026-09-08
visibility: private
confidence: medium
related: [patterns/pattern-code-review-agent, personal/agentic-software-factory-architecture, concepts/tool-use]
source: [raw/clippings/2026-09-07T21-36-25__apple-notes__code-review-architecture-module-core-design__b5f1b7a4.md]
---

# Code Review Architecture for Agentic Systems at Enterprise Scale

## Definition

A design for an AI-assisted code review platform meant to operate across a very large, polyglot repository population (the source note frames it at 100,000+ repositories), rather than a single-agent review pattern. Complements the smaller-scale [Code Review Agent Pattern](../patterns/pattern-code-review-agent.md), which describes one reviewer's internal structure (dimensions, severity tiers, output format); this article is about the platform around many such reviewers.

Core thesis:

> "I would not build one giant reviewer that tries to understand every repository equally well. I would build a common review platform with progressively specialized context, policy, skills, evaluation, and learning. The platform stays common. The intelligence becomes progressively more repository-specific."

## Reference Pipeline

```
PR / Change → Repository Classification → Context Assembly → Policy + Skills
   → Model/Capability Routing → AI Review → Deterministic Verification
   → Findings + Evidence → Human Review / Merge → Outcome Signals
   → Repository Learning → Evaluate Candidate vs. Baseline → Governed Promotion
```

## Layered Context, Not One Big Prompt

Context assembly happens at three levels: enterprise-wide (security policy, engineering standards), product/domain (architecture patterns, shared components, known failure modes), and repository-specific (CODEOWNERS, conventions, dependency graph, historical accepted/rejected review comments). Retrieval should pull the *minimum sufficient* context for the specific change — for a large mature codebase, expand outward from the diff (affected symbols → direct dependencies → tests/ownership → relevant history) rather than loading the whole repository.

> "Context should expand with uncertainty, not repository size."

## Build vs. Adopt for the Reviewer Itself

Benchmark commercial reviewers (Copilot, Cursor, CodeRabbit, etc.) against a representative sample of the repository population — quality, false positives, security, language coverage, context integration, latency, economics, extensibility — before assuming a proprietary reviewer is needed. Adopt commodity capability; build only where evaluation shows a real, differentiated gap (enterprise context integration, repository-specific learning, evidence/evaluation infrastructure, integration with the broader factory).

## What Stays Deterministic vs. What Needs a Model

Compilation, formatting, linting, unit/integration tests, dependency checks, secret detection, license checks, and known security rules should be deterministic — never spend inference on something a compiler or scanner can answer reliably. Model reasoning is reserved for interpretation, architectural judgment, ambiguity, and synthesis.

> "Use models for ambiguity. Use deterministic systems for certainty."

## Model Routing for Review Workloads

Route by language, framework, change type, complexity, security sensitivity, and historical model performance — not just PR size. A formatting change may need no LLM at all; a complex architectural refactor may justify a stronger reasoning model or multiple independent reviewers for security-sensitive changes. The routing objective is **cost per accepted finding**, not cost per token — a cheaper model producing more false positives and human corrections isn't actually cheaper.

## Learning Without Fine-Tuning Every Repository

Prefer, in order of increasing operational cost/irreversibility: retrieval + repository metadata + versioned skills/instructions (cheap to update, inspect, reverse) → fine-tuning or other adaptation, only once evaluation shows a stable behavioral pattern that context engineering can't solve efficiently. Learning signal should combine explicit developer feedback (accepted/dismissed findings) with observed outcomes (did the code change, did a related incident occur later, was a finding overridden). Candidate improvements to skills, prompts, retrieval, policy, or routing must beat the current baseline on both global and repository-specific evaluation sets before promotion.

> "Learning can be autonomous. Promotion should be governed."

## Security Posture

Treat all repository content (comments, READMEs, issues, test fixtures, generated files) as untrusted input that can influence reasoning but must never become authority: policy, tool authorization, and secrets live outside the model; execution happens in a sandbox with bounded permissions and restricted egress; consequential actions require deterministic policy enforcement regardless of what the model concluded.

> "Prompt injection is ultimately an authority problem, not merely a prompting problem."

## Rollout and Measurement

Start with a small set of design-partner repositories spanning different workload classes (a modern service, a mature large codebase, a security-sensitive repo, multiple languages), run the reviewer in shadow/advisory mode first, and expand visibility/capability only as evidence accumulates — "blast radius should grow with evidence." Measure across three buckets: quality (accepted findings, false-positive rate, defect escape rate), economics (cost per accepted finding, latency, developer time consumed), and impact (review cycle time, incidents, adoption). High adoption with high noise is not success — the bar is developers trusting findings enough to act on them.

## See Also

- [Code Review Agent Pattern](../patterns/pattern-code-review-agent.md)
- [Agentic Software Factory — Architecture & System Design](agentic-software-factory-architecture.md)
- [Tool Design for Agents](../concepts/tool-design.md)

## Provenance

Synthesized from a single detailed clipping ("Code Review Architecture module core design") ingested from Apple Notes on 2026-09-07. See `source` frontmatter for the exact clipping path.
