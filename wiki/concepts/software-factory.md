---
id: 01M0V3DQX54RGWB8TP1XGTZC7M
title: "Software Factory"
type: concept
tags: [agents, orchestration, architecture, automation, workflow]
created: 2026-08-15
updated: 2026-08-31
visibility: public
confidence: medium
source: clippings/2026-08-15T20-57-05__apple-notes__software-factory-review-vs-super-simple-software-factory-tie__b1d28b23.md
related: [agent-loops, agent-layer-architecture, agent-evaluation]
---

# Software Factory

## Definition
A **software factory** is a system of agents plus code — and, critically, plus an engineer directing it — assembled to give a single prompt or intent far more leverage than one agent acting alone. Rather than debating which single model is "best," a software factory chains together multiple agents (often running different models) with supporting code/tooling so the system can operate for you, sometimes fully autonomously, sometimes with a human in the loop.

The core thesis, as framed in Indie Devdan's "super simple software factory" walkthrough:

> "Agents plus code beats agents alone."

A software factory sits on a spectrum:
- **Low investment**: a handful of chained agents doing marginally more work with light configuration.
- **High investment**: a full system of agents + code that operates independently, sometimes outperforming the engineer who built it.

## Why It Matters
The amount of leverage a team gets from LLMs is not solely a function of model quality — it's a function of the *system* wrapped around the model: observability, reusability, and customizability. Three design principles recur in well-built software factories:

1. **Observable** — every agent workflow can be inspected step-by-step (e.g. a swim-lane view showing which model handled which step). You can't improve what you can't measure.
2. **Customizable** — the factory can be configured per use case rather than being a rigid pipeline.
3. **Reusable** — the same factory scaffolding is applied across many tasks instead of rebuilt each time.

This reframes the unit of value creation as three actors working together: **the engineer**, **the code**, and **the agent(s)** — not agents operating in isolation.

## Example
A reference implementation, [super-simple-software-factory](https://github.com/disler/super-simple-software-factory), demonstrates multi-model orchestration (e.g. running different model backends side-by-side for cost/speed/quality trade-offs) inside an observable, swim-lane-style dashboard — conceptually similar to a "mission control" for agent workflows.

## See Also
- [[summaries/x-twitter-2088359756096532965]]
- [[patterns/pattern-software-factory]]
- [agent-loops](../concepts/agent-loops.md)
- [agent-layer-architecture](../concepts/agent-layer-architecture.md)
- [agent-evaluation](../concepts/agent-evaluation.md)
- [summary-super-simple-software-factory](../summaries/summary-super-simple-software-factory.md)
