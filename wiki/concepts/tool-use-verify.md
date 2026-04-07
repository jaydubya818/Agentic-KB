---
title: Tool Use
type: concept
tags: [tools, llm, agents]
updated: 2026-04-07
visibility: public
---

## Definition
Tool use lets LLMs call external functions, APIs, or scripts during inference. The model outputs a structured call; the host executes it and returns results.

## Why It Matters
Without tools, LLMs are limited to their training data. With tools they can search, compute, read files, call APIs, and take actions in the real world.

## Example
Claude calls `search("current AAPL price")`, gets back `$212.40`, then uses it in its answer.

## See Also
- [agent-loops](agent-loops.md)
- [pattern-tool-design](../patterns/pattern-tool-design.md)
