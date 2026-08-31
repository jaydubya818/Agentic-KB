---
id: 01M0D32PX2BEKACEEQHYFXKFK6
title: "The Harness, Model, Context Triad"
type: concept
tags: [agents, architecture, context, orchestration, llm]
created: 2026-08-18
updated: 2026-08-31
visibility: public
confidence: medium
related: [agent-layer-architecture, agent-failure-modes, agent-loops, agent-memory-architecture]
source: [[summaries/x-twitter-2088782821535981815]]
---

# The Harness, Model, Context Triad

## Definition

A framing popularized by LangChain CEO Harrison Chase: every agent is composed of exactly three parts — the **harness** (the code/scaffolding that orchestrates tool calls, file edits, and control flow), the **model** (the underlying LLM), and the **context** (what the model actually sees at inference time — prompts, retrieved data, tool outputs, history). Most builders fixate on the model and neglect the other two, even though failures are rarely caused by the model itself.

> "when your agent fails, it's almost never the model. it's the context the model got. an agent is three things: harness, model, context. most people obsess over one and ignore the other two." — Harrison Chase

A key corollary is a rule of thumb about when custom harness work is worth it:

> the further out of distribution your task is, the more you need your own harness

Chase also notes that different foundation models (OpenAI vs. Anthropic) were trained to edit files and use tools in different ways, so a harness that works well for one model's conventions may need to be swapped or adapted per model — which is exactly what LangChain does internally, swapping the implementation layer based on which model is plugged in.

## Why It Matters

This triad reframes debugging and design priorities for agent builders. Instead of assuming a bad output means "the model isn't smart enough," the triad suggests first auditing:
1. **Context** — was the right information actually retrieved and passed in? (See [context window](../concepts/agent-memory-architecture.md) concerns.)
2. **Harness** — does the scaffolding correctly translate model intent into actions (file edits, tool calls) in the format that specific model expects?
3. **Model** — only last, whether the underlying model has the raw capability.

This aligns with and reinforces existing framing in [agent failure modes](agent-failure-modes.md) — context/harness issues are a more common root cause than raw model incapability — and complements the layered view in [agent layer architecture](agent-layer-architecture.md), which separates orchestration layers similarly.

## Example

LangChain's own framework swaps its file-editing implementation depending on whether the underlying model is from OpenAI or Anthropic, because each provider trained its models with different conventions for how tool-call arguments and file edits should be structured. This is a harness-level adaptation done specifically to compensate for model-level differences — a concrete case of harness and model interacting rather than being independent.

## See Also
- [[summaries/x-twitter-2088782821535981815]]
- [[summaries/summary-harrison-chase-harness-model-context]]
- [Agent Layer Architecture](agent-layer-architecture.md)
- [Agent Failure Modes](agent-failure-modes.md)
- [Agent Memory Architecture](agent-memory-architecture.md)
- [Agent Loops](agent-loops.md)
