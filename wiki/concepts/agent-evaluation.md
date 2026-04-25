---
id: 01KQ2YQ6DGFDMJ1NENWW3ZJV47
title: "Agent Evaluation"
type: concept
tags: [agents, evaluation, llm, orchestration, workflow]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [llm-as-judge, benchmark-design, agent-failure-modes, agent-observability, multi-agent-systems]
---

# Agent Evaluation

## Definition

Agent evaluation is the discipline of systematically measuring the quality, reliability, and efficiency of AI agent systems. Unlike traditional software testing or standard LLM benchmarking, agent evaluation must account for **non-determinism**, **multiple valid solution paths**, and **composite quality dimensions** — there is rarely a single correct answer or a single correct process.

A robust evaluation framework enables continuous improvement, catches regressions before deployment, and validates that context engineering choices achieve their intended effects.

## Why It Matters

Agents make dynamic decisions across extended interactions. A failure mode invisible on isolated queries may emerge only after context accumulates over many turns. Evaluation that checks for specific intermediate steps will frequently produce false negatives (penalising valid alternative paths) or false positives (passing agents that stumble on edge cases).

Without structured evaluation:
- Regressions from model or prompt changes go undetected
- Token budget and tool-call trade-offs are made by intuition rather than evidence
- Multi-agent architectures are hard to compare against single-agent baselines

## The 95% Performance Variance Finding

Research on the **BrowseComp** evaluation (testing browsing agents on hard-to-find information tasks) found that just three factors explain 95% of performance variance:

| Factor | Variance Explained | Implication |
|---|---|---|
| Token usage | ~80% | Realistic token budgets are essential in evaluation design |
| Number of tool calls | ~10% | More exploration generally helps; penalising tool calls is risky |
| Model choice | ~5% | Better models multiply efficiency gains beyond what token increases alone achieve |

**Key implications for evaluation design:**
- Always evaluate with realistic (not unlimited) token budgets
- Upgrading to a stronger model (e.g. Claude Sonnet 4.5) typically yields larger gains than doubling the token budget on an older model
- The finding validates multi-agent architectures that distribute work across separate context windows

## Core Evaluation Challenges

### Non-Determinism and Multiple Valid Paths
One agent might search three sources; another might search ten and reach the same correct answer. Evaluation must be **outcome-focused**, judging whether the agent achieved the right result via a reasonable process — not whether it followed a prescribed path.

### Context-Dependent Failures
Failures often surface only at higher complexity levels or after extended interaction. Evaluation suites must cover a range of difficulty levels and test multi-turn scenarios, not just isolated single-turn queries.

### Composite Quality Dimensions
Agent quality is multi-dimensional. A single score is usually insufficient. Common dimensions include:
- **Factual accuracy** — are claims correct?
- **Completeness** — does the response cover what was asked?
- **Citation accuracy** — are sources correctly attributed?
- **Source quality** — are cited sources authoritative?
- **Tool efficiency** — did the agent use tools economically?
- **Process quality** — was reasoning coherent and traceable?

Rubrics should weight dimensions according to the use case — a research agent weights citation accuracy heavily; a customer support agent weights completeness and tone.

## Evaluation Approaches

### LLM-as-Judge
A language model scores agent outputs against a rubric. Scalable and cost-effective for large test suites. Works best with explicit, multi-dimensional rubrics and calibrated prompt design. See [LLM-as-Judge](llm-as-judge.md) for implementation detail.

### Human Evaluation
Human raters catch subtle edge cases and failure modes that LLM judges miss. Expensive and slow — best used to calibrate automated judges and to audit production samples.

### Automated Regression Testing
Deterministic checks (e.g. output format, required field presence, latency SLAs) run on every deployment. Catches obvious regressions cheaply before deeper evaluation runs.

### Quality Gates in Pipelines
Evaluation scores can gate deployment: an agent configuration is only promoted to production if it meets minimum thresholds on all rubric dimensions. See [agent observability](agent-observability.md) for how to instrument pipelines to collect the signals needed.

## Example

A research agent is evaluated on 50 test queries spanning low, medium, and high complexity. Each response is scored by an LLM judge on five dimensions (accuracy, completeness, citation accuracy, source quality, tool efficiency) on a 1–5 scale. The agent must average ≥4.0 across all dimensions to pass the quality gate. Results are compared against a baseline configuration to detect regressions from prompt changes.

## Common Pitfalls

- **Evaluating with unlimited tokens** — produces optimistic scores that don't reflect production behaviour
- **Single-metric scoring** — hides trade-offs between accuracy and efficiency
- **Testing only happy paths** — misses context-dependent failures that emerge at the edges
- **Ignoring process quality** — an agent that reaches the right answer via hallucinated reasoning is fragile

## See Also

- [LLM-as-Judge](llm-as-judge.md) — scalable automated evaluation using language models as scorers
- [Benchmark Design](benchmark-design.md) — principles for constructing reliable agent benchmarks
- [Agent Failure Modes](agent-failure-modes.md) — taxonomy of ways agents break, informing what to test
- [Agent Observability](agent-observability.md) — instrumentation needed to collect evaluation signals in production
- [Multi-Agent Systems](multi-agent-systems.md) — architectures that the 95% variance finding validates
