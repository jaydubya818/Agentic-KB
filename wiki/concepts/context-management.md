---
id: 01KQ2YS2KHKJ6XHV41EWQM822R
title: Context Management
type: concept
tags: [context, memory, agents, architecture, retrieval]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [memory-systems, agent-loops, agent-failure-modes]
---

# Context Management

Context management is the discipline of controlling what information occupies an agent's context window at any given moment. Because context windows are finite, effective agents must make deliberate decisions about what to include, exclude, and defer.

## Definition

Context management encompasses the strategies, patterns, and mechanisms used to ensure agents have the right information available at the right time — without overloading or polluting the context window with irrelevant content.

Context engineering can fail in four predictable ways:
1. **Missing context** — the information the agent needs is not in the available context at all
2. **Poor retrieval** — retrieved context fails to encapsulate what was actually needed
3. **Over-retrieval** — retrieved context far exceeds what is needed, wasting tokens and degrading attention
4. **Discovery failure** — agents cannot locate niche information buried across many files or sources

## Why It Matters

As agents accumulate capabilities — more tools, instructions, skills, and conversation history — the context window fills up. Static context (always-included content like system prompts and tool definitions) grows over time, crowding out space for dynamic, task-relevant information. Poor context management leads to higher costs, degraded model attention, and agent failures.

## Static vs Dynamic Context

**Static context** is always included in the prompt regardless of task relevance: system instructions, tool definitions, critical rules. It is predictable and reliable but consumes tokens unconditionally.

**Dynamic context** is loaded on-demand when relevant to the current task. The agent receives minimal static pointers (names, descriptions, file paths) and uses retrieval tools to load full content only when needed.

Dynamic discovery is more token-efficient and can improve response quality by reducing potentially confusing or contradictory information. The trade-off: it requires the model to correctly recognise when additional context is needed. This works well with frontier models but may fail with less capable models.

## Example

An agent handling a complex research task stores large tool outputs (web search results, database query rows) to files rather than keeping them in the message history. When it needs a specific fact, it uses grep or a targeted file read to pull only the relevant lines — rather than re-reading thousands of tokens of raw output.

## Filesystem-Based Context

The filesystem is a particularly effective substrate for dynamic context management. It provides:

- **Persistence** across long agent trajectories and across sub-agent boundaries
- **Selective retrieval** via search tools (grep, line reads, semantic search)
- **Scratch pads** for intermediate results from large tool outputs
- **Shared state** between sub-agents without direct message passing
- **Self-updating instructions** for agents that learn and refine their own behaviour

See the [filesystem context pattern](../patterns/pattern-filesystem-context.md) for implementation details.

## Common Pitfalls

- Returning large tool outputs directly into message history instead of writing to files
- Including all possible instructions statically when most are rarely relevant
- Failing to implement any discovery mechanism, leaving the agent unable to find information it does not know is missing
- Over-relying on dynamic discovery with weaker models that do not self-prompt retrieval reliably

## See Also

- [Memory Systems](memory-systems.md)
- [Agent Loops](agent-loops.md)
- [Agent Failure Modes](agent-failure-modes.md)
- [Filesystem Context Pattern](../patterns/pattern-filesystem-context.md)
