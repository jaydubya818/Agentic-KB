---
id: 01KQ2ZBSZZMH692WHHJ2Q3CX8W
title: "Staged LLM Pipeline"
type: pattern
tags: [architecture, workflow, agents, patterns, llm]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [task-model-fit, ingest-pipeline, cost-optimization]
---

# Staged LLM Pipeline

## When to Use

Use this pattern when:
- Processing a batch of items through one or more LLM steps
- You need to re-run or resume processing without repeating expensive steps
- Multiple transformation stages exist between raw input and final output
- You want to isolate and debug individual stages independently
- Cost control matters — you want to cache intermediate results

## Structure

The canonical pipeline structure is:

```
acquire → prepare → process → parse → render
```

1. **Acquire** — Fetch raw data from sources (APIs, files, databases)
2. **Prepare** — Transform data into prompt format; apply any filtering or enrichment
3. **Process** — Execute LLM calls (the expensive step)
4. **Parse** — Extract structured output from LLM responses
5. **Render** — Format and deliver the final result

Each stage should be:

| Property | Description |
|---|---|
| **Discrete** | Clear input/output boundaries between stages |
| **Idempotent** | Re-running the same stage produces the same result |
| **Cacheable** | Intermediate results persist to disk between runs |
| **Independent** | Each stage can be run and tested in isolation |

## Example

A pipeline that summarises customer reviews:

1. **Acquire**: Pull reviews from a database or API, write to `raw/reviews.jsonl`
2. **Prepare**: Format each review into a prompt template, write to `prepared/prompts.jsonl`
3. **Process**: Send each prompt to the LLM, write raw responses to `processed/responses.jsonl`
4. **Parse**: Extract the summary and sentiment fields from each response, write to `parsed/summaries.jsonl`
5. **Render**: Generate a final report or push results to a dashboard

If the parse step fails mid-run, you can fix the parser and re-run only that stage — the expensive LLM calls in `processed/` are already cached.

## Trade-offs

**Advantages**
- Failures are isolated: a bug in `parse` does not require re-running `process`
- Cost control: LLM calls are cached and never repeated unnecessarily
- Debuggability: Each stage's output can be inspected independently
- Resumability: Pipelines can be stopped and restarted without losing progress

**Disadvantages**
- More upfront design than a single-script approach
- Disk I/O overhead for caching intermediate results
- Not suitable for real-time or conversational workflows
- Sequential dependencies between stages limit parallelism

## Related Patterns

- [Ingest Pipeline](../concepts/ingest-pipeline.md) — foundational concept for data ingestion stages
- [Task-Model Fit](../concepts/task-model-fit.md) — evaluate before building any pipeline
- [Cost Optimization](../concepts/cost-optimization.md) — caching and batching strategies
- [Agent Loops](../concepts/agent-loops.md) — when processing requires iterative reasoning rather than a fixed pipeline

## See Also

- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
- [Context Management](../concepts/context-management.md)
