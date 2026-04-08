---
id: 01KNNVX2QC0K6NFMCDPQCFK6MT
title: "Context Management"
type: concept
tags: [context, agents, architecture, orchestration]
created: 2025-01-01
updated: 2025-01-01
visibility: public
confidence: high
related: [concepts/task-decomposition.md, concepts/multi-agent-systems.md, patterns/pattern-context-manager-agent.md, patterns/pattern-external-memory.md]
---

# Context Management

## Definition

Context management is the practice of deliberately controlling what information is present in an LLM's prompt window at any given moment — including what is included, what is excluded, and in what order content appears. In agentic systems, poor context management is a primary cause of degraded output quality and increased cost.

## Why It Matters

LLMs have finite context windows, and performance degrades as prompts grow — both due to the hard token limit and the "lost in the middle" effect where relevant information buried in a long prompt is underweighted. In multi-step or multi-agent pipelines, context accumulates rapidly:

- Previous task outputs bleed into current task prompts
- Large architecture or specification documents are included wholesale when only a slice is needed
- Test files, unrelated modules, or superseded code pollute the working context

**Context bloat** is the state where the effective signal-to-noise ratio in the prompt has fallen below the point where the model reliably attends to what matters.

## Example

In a coding pipeline, a Code Generation Agent asked to implement one endpoint does not need the authentication module, the test suite, or the logging utilities — even if they are part of the same project. Including them wastes tokens and increases the chance the agent references the wrong patterns.

The [Context Manager Agent pattern](../patterns/pattern-context-manager-agent.md) addresses this directly: a dedicated agent runs before each execution step and produces a scoped context package — a curated list of files to read, interfaces to inline, and files to explicitly ignore.

### Practical techniques

| Technique | Description |
|---|---|
| **Selective file loading** | Identify and pass only the files (or functions within files) relevant to the current task |
| **Explicit ignore lists** | Name files that look relevant but aren't — prevents the execution agent from fetching them |
| **Inlined contracts** | Copy-paste the specific function signatures or types needed rather than including entire files |
| **State summaries** | Replace full prior output with a 2–3 sentence summary of what is already done |
| **Token budgets** | Set hard limits on context output (e.g. 400 tokens) as a forcing function for selectivity |
| **Role-scoped prompts** | Remind the agent of its exact scope at the end of every context package |

## Common Pitfalls

- **Assuming more context is safer** — it rarely is; it increases hallucination surface and token cost
- **Including test files by default** — tests define behaviour but are rarely needed when implementing non-test code
- **No explicit ignore list** — without it, the execution agent may independently fetch irrelevant files via tool calls
- **Context creep across milestones** — files from earlier project phases stay in context long after they stop being relevant

## See Also

- [Context Manager Agent Pattern](../patterns/pattern-context-manager-agent.md)
- [Task Decomposition](../concepts/task-decomposition.md)
- [External Memory Pattern](../patterns/pattern-external-memory.md)
- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
- [Cost Optimization](../concepts/cost-optimization.md)
