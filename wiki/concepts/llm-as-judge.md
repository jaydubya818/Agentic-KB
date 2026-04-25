---
id: 01KQ2YQ6DH0AE6AYGQX83SK8PY
title: "LLM-as-Judge"
type: concept
tags: [evaluation, llm, agents, prompting]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [agent-evaluation, benchmark-design, agent-observability, few-shot-prompting]
---

# LLM-as-Judge

## Definition

LLM-as-judge is an evaluation technique where a language model acts as the scorer for another model's or agent's outputs. Rather than relying on exact-match or rule-based metrics, a judge LLM evaluates responses against a structured rubric, returning scores and (optionally) explanations.

This approach is particularly valuable for agent evaluation, where outputs are open-ended and multiple valid answers exist.

## Why It Matters

Human evaluation is the gold standard but is slow and expensive at scale. LLM-as-judge provides a scalable middle path: automated scoring that handles natural language nuance better than rigid heuristics. When combined with periodic human audits to calibrate the judge, it enables continuous evaluation of production agent systems.

## How It Works

1. **Define a rubric** — specify the dimensions to score (e.g. accuracy, completeness, source quality) and the scoring scale (typically 1–5)
2. **Construct a judge prompt** — provide the rubric, the original task, the agent's response, and optionally a reference answer
3. **Run the judge LLM** — the model returns scores per dimension and a brief rationale
4. **Aggregate and threshold** — scores are averaged or weighted; a quality gate threshold determines pass/fail

## Rubric Design

Effective rubrics are **multi-dimensional** and **use-case specific**. Common dimensions for agent evaluation:

| Dimension | Description |
|---|---|
| Factual accuracy | Are claims correct and verifiable? |
| Completeness | Does the response address all aspects of the task? |
| Citation accuracy | Are sources correctly attributed? |
| Source quality | Are cited sources authoritative and relevant? |
| Tool efficiency | Did the agent use tools economically? |
| Process quality | Was reasoning coherent and traceable? |

Weight dimensions according to the use case. A research agent should weight citation accuracy heavily; a task-execution agent should weight tool efficiency.

## Strengths

- Scales to thousands of test cases cost-effectively
- Handles open-ended, multi-valid-answer tasks
- Can score reasoning and process quality, not just final outputs
- Explanations from the judge are useful for debugging failures

## Limitations

- Judge LLMs have their own biases (e.g. preferring longer, more confident-sounding answers)
- Scores are not perfectly calibrated — require human validation to anchor the scale
- Poor rubric design leads to unreliable scores; vague criteria produce noisy results
- Cannot reliably catch subtle factual errors in specialist domains

## Calibration

Always calibrate the judge against human ratings on a sample of 50–100 cases before relying on it for quality gates. Measure inter-rater agreement (Pearson or Spearman correlation) between the LLM judge and human raters. A correlation ≥0.8 is a reasonable threshold for trusting the judge at scale.

## See Also

- [Agent Evaluation](agent-evaluation.md) — full evaluation framework for agent systems
- [Benchmark Design](benchmark-design.md) — how to construct reliable benchmarks that use LLM judges
- [Few-Shot Prompting](few-shot-prompting.md) — using examples in judge prompts to anchor scoring
- [Agent Observability](agent-observability.md) — collecting the data feeds that LLM judges evaluate
