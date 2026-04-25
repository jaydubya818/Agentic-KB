---
id: 01KQ2ZBSZXF7PFY16VNGMM32CY
title: "Task-Model Fit"
type: concept
tags: [llm, agents, architecture, evaluation, workflow]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [pipeline-architecture, cost-optimization, agent-loops]
---

# Task-Model Fit

## Definition

Task-model fit is the evaluation of whether a given problem is well-suited to LLM processing before any code is written. It is the first and most important step in any LLM project — skipping it leads to wasted development on systems that will fail at scale.

The evaluation should be done manually: take one representative input, run it through the target model directly, and assess the output. This takes minutes and prevents hours of misdirected work.

## Why It Matters

Not every problem benefits from LLM processing. LLMs are powerful for certain classes of tasks and reliably poor at others. Misidentifying task-model fit is one of the most common causes of failed LLM projects. A manual prototype test surfaces failure modes before they are baked into an automated pipeline.

## LLM-Suited Tasks

| Characteristic | Why It Fits |
|---|---|
| Synthesis across sources | LLMs excel at combining information from multiple inputs |
| Subjective judgment with rubrics | LLMs handle grading, evaluation, and classification with criteria |
| Natural language output | When the goal is human-readable text, not structured data |
| Error tolerance | Individual failures do not break the overall system |
| Batch processing | No conversational state required between items |
| Domain knowledge in training | The model already has relevant context |

## LLM-Unsuited Tasks

| Characteristic | Why It Fails |
|---|---|
| Precise computation | Math, counting, and exact algorithms are unreliable |
| Real-time requirements | LLM latency is too high for sub-second responses |
| Perfect accuracy requirements | Hallucination risk makes 100% accuracy impossible |
| Proprietary data dependence | The model lacks necessary context |
| Sequential dependencies | Each step depends heavily on the previous result |
| Deterministic output requirements | Same input must produce identical output |

## Example

**Good fit**: Classifying customer support tickets by sentiment and urgency using a rubric. The task tolerates occasional misclassification, benefits from language understanding, and processes in batch.

**Poor fit**: Calculating exact shipping costs from a rate table. This requires deterministic computation — a lookup table or formula is strictly better.

## The Manual Prototype Step

Before building any automation:
1. Copy one representative input into the model interface
2. Evaluate the output quality honestly
3. Ask: Does the model have the knowledge needed? Can it produce the required format? What failure modes appear?

If the manual prototype fails, the automated pipeline will fail. If it succeeds, you have a baseline and a template for prompt design.

## See Also

- [Pipeline Architecture](../concepts/ingest-pipeline.md)
- [Cost Optimization](../concepts/cost-optimization.md)
- [LLM as Judge](../concepts/llm-as-judge.md)
- [Agent Failure Modes](../concepts/agent-failure-modes.md)
