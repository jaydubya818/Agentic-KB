---
id: 01KNNVX2Q91YQFCJVKVB9QEAE7
title: Agent Loops
type: concept
tags: [agentic, loops, react, cot, tool-use, control-flow]
confidence: high
sources:
  - "Yao et al. ReAct: Synergizing Reasoning and Acting in Language Models (2022)"
  - "Anthropic: Extended Thinking documentation (2025)"
  - "LangChain agent executor documentation"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/chain-of-thought]]"
  - "[[concepts/tool-use]]"
  - "[[concepts/task-decomposition]]"
  - "[[concepts/agent-failure-modes]]"
  - "[[concepts/cost-optimization]]"
status: stable
---

## TL;DR

An agent loop is the control structure that drives an LLM to take actions until a terminal condition is reached. ReAct (Reason+Act) is the dominant paradigm. The loop is where most reliability problems live: infinite loops, context blowout, and premature stopping are all loop level failures. 

---

## Definition

An agent loop is the iterative execution pattern where an LLM: (1) reasons about the current state, (2) selects an action (tool call, response, or continuation), (3) observes the result, and (4) updates its understanding. The loop repeats until the LLM determines the task is complete or a hard limit is hit.

---

## How It Works

### ReAct (Reason + Act)

The canonical agentic loop pattern from Yao et al. (2022). The LLM alternates between reasoning traces and concrete actions:

```
Thought: I need to find the current version of the package before modifying it.
Action: read_file(path="package.json")
Observation: { "version": "1.4.2", "dependencies": {...} }
Thought: Version is 1.4.2. I need to bump to 1.5.0 and update the changelog.
Action: write_file(path="package.json", ...)
Observation: success
Thought: File updated. Task complete.
Action: finish(result="Bumped version to 1.5.0")
```

The interleaving of Thought and Action is key — reasoning is visible and inspectable. The Observation grounds the next reasoning step in actual reality rather than the LLM's prior.

### Chain-of-Thought Loops

Distinct from ReAct: the LLM reasons through multiple steps internally before committing to an action. No intermediate observations. Useful when the problem is self-contained (math, logic, text manipulation). Breaks down when the task requires external state.

### Tool-Use Loops

The LLM emits a tool call schema (JSON), the host executes the tool, the result is appended to context as a tool result, and the LLM continues. This is the mechanism behind Claude's function calling and [[framework-claude-code]]'s native loop.

```python
while True:
    response = model.generate(messages=context)
    if response.stop_reason == "end_turn":
        break
    if response.stop_reason == "tool_use":
        for tool_call in response.tool_calls:
            result = execute_tool(tool_call)
            context.append(tool_result(tool_call.id, result))
    context.append(response)
```

### Scratchpad Patterns

The LLM writes intermediate work to a scratchpad (a designated section of the context or an external file) before committing to output. Useful for:
- Long calculations where intermediate steps must be preserved
- Draft → critique → revise workflows
- When the final answer format differs significantly from reasoning format

In [[framework-claude-code]]: agents frequently write to temp files as a scratchpad, then read back for synthesis.

### While-Not-Done Loops

Explicit programmatic loops with an LLM deciding each iteration's action:

```python
max_iterations = 15
iteration = 0
done = False
while not done and iteration < max_iterations:
    action = agent.decide(state)
    state = execute(action)
    done = agent.check_completion(state)
    iteration += 1
```

The `check_completion` call is critical and often the weakest link — the LLM may declare success prematurely (sycophantic completion) or refuse to stop (runaway loop).

---

## How the LLM Decides to Stop

Three mechanisms:
1. **`stop_reason: end_turn`** — Model decides it's done. Reliable for well-scoped tasks; unreliable for long-horizon tasks where the model loses track of the original goal.
2. **Explicit finish tool** — Model must call `finish(result)` to terminate. Forces intentionality; harder to accidentally truncate.
3. **Host-side termination** — Programmatic check on state: if `acceptance_criteria_met(state)` → stop. Most reliable but requires you to define acceptance criteria upfront.

---

## Token Budget Management Within Loops

Each loop iteration appends tool results to context. Without management, the context fills up within 10-20 iterations on complex tasks.

Strategies:
- **[[pattern-rolling-summary]]**: Compress early context before it blooms — see [[patterns/pattern-rolling-summary]]
- **Tool output trimming**: Truncate tool results to relevant sections before appending
- **Selective retention**: Only keep the last N observations in context; summarize older ones
- **Checkpoint files**: Write state to disk, compress context, restore from checkpoint on next iteration

Track token usage per iteration. If usage grows faster than linearly, the loop will hit limits.

---

## Infinite Loop Prevention

A loop becomes infinite when:
- The LLM doesn't recognize the task is complete
- The task is actually impossible (tool always fails, goal is contradictory)
- The LLM is stuck in a local optima (keeps trying the same failing approach)

Prevention:
- **Hard iteration cap** — always. No exceptions. 15-50 iterations depending on task complexity.
- **Action deduplication** — if the model attempts the same action twice consecutively, break or prompt it to try differently
- **Progress detection** — check if state has changed since last iteration; if not for N iterations, escalate or abort
- **Token budget hard stop** — kill the loop before context is totally full to leave room for graceful termination

```python
seen_actions = set()
for iteration in range(MAX_ITERATIONS):
    action = agent.decide(state)
    action_key = hash_action(action)
    if action_key in seen_actions:
        raise LoopDetectedError(f"Agent repeated action at iteration {iteration}")
    seen_actions.add(action_key)
    # ...
```

---

## Key Variants

| Loop Type | Reasoning Style | Tool Access | Stop Mechanism |
|-----------|----------------|-------------|----------------|
| ReAct | Explicit thought traces | Yes | Model judgment or finish tool |
| [[chain-of-thought]]-only | Internal | No | end_turn |
| Tool-use | Implicit | Yes | end_turn after tools |
| Scratchpad | File-backed | Yes (file write/read) | Model judgment |
| Debate | Multi-agent exchange | Optional | Judge agent declares winner |

---

## When To Use

- Any task requiring multiple steps where intermediate results affect later steps
- Tasks requiring external data (APIs, files, databases) — you need a tool-use loop
- Tasks where planning requires seeing intermediate results before continuing

## Risks & Pitfalls

- **Sycophantic completion**: Model says "done" to be helpful, leaving work incomplete
- **Context blowout**: Tool outputs accumulate, eventually truncating the original instructions
- **Instruction drift**: In long loops, the model may forget early constraints still in context but outside its effective attention window
- **Tool call storms**: Model calls many tools in parallel without validating previous results, creating a thundering herd of downstream failures

---

## Related Concepts

- [[concepts/chain-of-thought]] — reasoning style within each loop iteration
- [[concepts/tool-use]] — the action mechanism inside tool-use loops
- [[concepts/context-management]] — managing the context that accumulates across iterations
- [[concepts/agent-failure-modes]] — what goes wrong in agent loops
- [[patterns/pattern-reflection-loop]] — a specific loop pattern for self-correction

---

## Sources

- Yao et al. "ReAct: Synergizing Reasoning and Acting in Language Models" (2022)
- [[anthropic]] Extended Thinking documentation (2025)
- LangChain Agent Executor internals
