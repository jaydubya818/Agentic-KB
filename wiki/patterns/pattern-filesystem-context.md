---
id: 01KQ2YS2KK5FVZHSEFHCYXWYNB
title: Filesystem-Based Context Pattern
type: pattern
tags: [context, memory, agents, patterns, architecture]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [context-management, memory-systems, agent-loops]
---

# Filesystem-Based Context Pattern

The filesystem provides a single interface through which agents can flexibly store, retrieve, and update an effectively unlimited amount of context — offloading bulk content from the context window while preserving the ability to retrieve specific information on demand.

## When to Use

- Tool outputs are bloating the context window (terminal logs, search results, database rows)
- Agents need to persist state across long trajectories
- Sub-agents must share information without direct message passing
- Tasks require more context than fits in a single context window
- Building agents that learn and update their own instructions over time
- Implementing scratch pads for intermediate computation results

## Structure

```
agent/
├── scratch/           # Temporary tool outputs and intermediate results
│   └── tool_name_timestamp.txt
├── memory/            # Persistent facts, learned preferences, state
│   └── session.md
├── instructions/      # Self-updating agent instructions and skills
│   └── domain-rules.md
└── shared/            # Files accessible to sub-agents
    └── findings.md
```

The agent maintains a minimal static context (pointers: file names, descriptions, paths) and uses search/read tools to load full content when relevant.

## Core Patterns

### Pattern 1: Scratch Pad for Large Tool Outputs

**Problem**: Tool calls can return massive outputs — a web search may return 10k tokens of raw content, a database query hundreds of rows. If this content enters the message history, it persists for the entire conversation, inflating costs and degrading attention.

**Solution**: Write large tool outputs to files instead of returning them directly. The agent then uses targeted retrieval (grep, line-specific reads) to extract only the relevant portions.

```python
def handle_tool_output(output: str, tool_name: str, threshold: int = 2000) -> str:
    if len(output) < threshold:
        return output

    # Write to scratch pad
    file_path = f"scratch/{tool_name}_{timestamp}.txt"
    write_file(file_path, output)

    # Return a reference pointer instead of the full content
    return f"[Output too large — written to {file_path}. Use grep or read_lines to retrieve relevant sections.]"
```

### Pattern 2: Persistent Agent Memory

Write structured notes to a memory file during task execution. At the start of each session or sub-task, load only the relevant sections. This allows agents to accumulate knowledge across long trajectories without re-reading full histories.

### Pattern 3: Self-Updating Instructions

Agents can read, revise, and write back their own instruction files as they encounter new domain rules, user preferences, or learned heuristics. This turns the filesystem into a live, evolving system prompt without requiring a redeployment.

### Pattern 4: Sub-Agent Shared State

Instead of routing information through a central orchestrator's message history, sub-agents write findings to shared files. Other agents discover and read those files via search tools. This reduces orchestrator context load and decouples sub-agent communication.

## Example

A research agent receives a task to summarise a large codebase. Rather than loading all files into context:
1. It writes a directory tree to `scratch/tree.txt`
2. It reads file summaries one at a time, appending key findings to `memory/findings.md`
3. It greps `memory/findings.md` when synthesising the final answer
4. The message history stays lean throughout

## Trade-offs

| Benefit | Cost |
|---|---|
| Effectively unlimited context | Requires reliable file I/O tooling |
| Token-efficient — only load what's needed | Model must self-direct retrieval |
| Persistent across restarts | File management complexity grows with task size |
| Sub-agents can share state cheaply | Discovery fails if file naming/structure is inconsistent |

## Limitations

- Requires frontier-class models that reliably recognise when to load additional context
- Weaker models may not initiate retrieval when needed, leading to silent context gaps
- File-based state is harder to inspect and audit than in-memory state without dedicated tooling

## Related Patterns

- [Context Management](../concepts/context-management.md) — foundational concept this pattern addresses
- [Memory Systems](../concepts/memory-systems.md) — broader taxonomy of agent memory approaches
- [Agent Loops](../concepts/agent-loops.md) — how context is consumed across the agent loop
- [Agent Failure Modes](../concepts/agent-failure-modes.md) — failure modes this pattern mitigates

## See Also

- [Context Management](../concepts/context-management.md)
- [Memory Systems](../concepts/memory-systems.md)
