---
title: "Pattern: ReAct (Reasoning + Acting)"
type: pattern
category: orchestration
problem: "Agents that reason only from parametric memory hallucinate and cannot update beliefs from new information mid-task."
solution: "Interleave Reasoning and Acting in a single context: Thought → Action → Observation → Thought → ... Each tool call's observation updates the reasoning context before the next step."
tradeoffs:
  - "Each step adds tokens: Thought + Action + Observation compounds context growth"
  - "Exploratory tasks benefit from interleaved reasoning; known-structure tasks benefit from upfront planning"
  - "Requires loop control: max steps, cost budget, tool misuse detection"
  - "Better than pure chain-of-thought for tasks requiring external information"
tags: [orchestration, agentic, multi-agent, tool-use, prompt-engineering]
confidence: high
sources:
  - "[[summaries/siagian-agentic-engineer-roadmap-2026]]"
created: 2026-05-16
updated: 2026-05-16
reviewed: false
reviewed_date: ""
---

# Pattern: ReAct (Reasoning + Acting)

Interleave reasoning and tool use in a single forward pass. Every observation from a tool call updates the agent's reasoning before the next step — the agent's beliefs are never stale relative to information it has already retrieved.

## Problem

Agents operating purely from parametric memory hallucinate facts, can't access current information, and can't correct course when initial assumptions are wrong. Chain-of-thought reasoning without tool calls compounds the problem: the model reasons confidently from incorrect priors.

The naive fix — give the agent tools and tell it to use them when needed — fails because the agent must decide when to use tools based on the same parametric memory that is the source of the problem. ReAct solves this by making reasoning and acting a tight loop, not a plan-then-execute sequence.

## Solution

The ReAct loop (from Yao et al., 2022) interleaves three token types in the model's context:

```
Thought: I need to find the current CEO of Anthropic. Let me search.
Action: search("Anthropic CEO 2026")
Observation: Dario Amodei is co-founder and CEO of Anthropic as of 2026.
Thought: I have the current CEO. Now I need to find any recent statements he's made about safety.
Action: search("Dario Amodei Anthropic safety 2026 statement")
Observation: [retrieved content]
Thought: I have enough information to answer the question.
Action: finish("Dario Amodei, CEO of Anthropic, stated in 2026 that...")
```

Each Observation is appended directly to the context before the next Thought — the model's next reasoning step has full access to what was just retrieved.

## Implementation Sketch

```python
from anthropic import Anthropic

client = Anthropic()

SYSTEM = """You solve problems by alternating between Thought, Action, and Observation.
Format each step as:
Thought: <your reasoning about what to do next>
Action: <tool_name>(<args>)

Available tools: search(query), calculate(expr), finish(answer)
Stop when you call finish().
"""

def react_loop(question: str, max_steps: int = 10, tools: dict = None) -> str:
    messages = [{"role": "user", "content": question}]
    
    for step in range(max_steps):
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            system=SYSTEM,
            messages=messages,
            stop_sequences=["Observation:"]  # pause before observation injection
        )
        
        agent_output = response.content[0].text
        messages.append({"role": "assistant", "content": agent_output})
        
        # Parse the action
        action = parse_action(agent_output)
        
        if action.tool == "finish":
            return action.args  # terminal state
        
        # Execute tool and inject observation
        observation = tools[action.tool](action.args)
        observation_text = f"Observation: {observation}\n"
        messages.append({"role": "user", "content": observation_text})
    
    return "Max steps reached without resolution."
```

**Loop control (critical):**

```python
# Cost budget guard
def react_loop_budgeted(question: str, token_budget: int = 50_000) -> str:
    total_tokens = 0
    
    for step in range(10):
        # ... step logic ...
        total_tokens += response.usage.input_tokens + response.usage.output_tokens
        
        if total_tokens > token_budget:
            return f"Budget exceeded after {step} steps. Partial answer: {last_observation}"
```

## Tradeoffs

| Dimension | Value |
|---|---|
| Hallucination rate | Lower than chain-of-thought — each claim can be grounded in observation |
| Context growth | High — Thought + Action + Observation per step; 3-10 steps = significant token accumulation |
| Latency | Higher than single-shot — N tool calls × (tool latency + model call latency) |
| Exploratory tasks | Excellent — agent adapts plan based on intermediate results |
| Known-structure tasks | Worse than [[patterns/pattern-plan-execute-verify]] — upfront planning amortizes reasoning cost |
| Loop failure risk | Moderate — requires max step limits and cost guards |

## When To Use

- Research tasks where the next step depends on the result of the current step (genuinely exploratory)
- Question-answering over live or changing information (retrieval required mid-task)
- Debugging tasks where the agent must form and test hypotheses iteratively
- Any task where "what to do next" can't be determined without seeing intermediate results

## When NOT To Use

- Tasks with known structure where upfront planning is possible — use [[patterns/pattern-plan-execute-verify]] instead. PEV separates planning from execution, making the plan auditable and parallel execution possible. ReAct cannot parallelize because each step depends on the previous observation.
- Real-time tasks where per-step latency compounds into an unacceptable total. A 10-step ReAct loop with 500ms tool latency and 300ms model latency is 8 seconds minimum — unacceptable for interactive applications.
- Tasks where tool misuse is costly (API calls with rate limits, database writes, external service calls with side effects). ReAct's exploratory nature increases the risk of unnecessary or repeated tool calls.

## Distinction from Plan-Execute-Verify

ReAct and [[patterns/pattern-plan-execute-verify]] are often confused. The distinction is when reasoning happens:

- **ReAct:** Reasoning happens *interleaved* with acting. Every observation changes what the agent does next. No upfront plan.
- **PEV:** Reasoning happens *upfront* (plan phase), then execution proceeds on the plan, then verification checks the result. Reasoning and execution are separated into phases.

ReAct is better when the task is genuinely exploratory and the next action depends on intermediate results. PEV is better when the task structure is known and parallel execution of sub-tasks is possible.

## Engineering Challenges

**Infinite loops on ambiguous tool results.** An agent that keeps searching because each search result is "not quite right" will loop until it hits the step limit. Add a loop-detection heuristic: if the same tool is called with the same (or similar) arguments twice, halt and return the best available answer.

**Context growth.** At 10 steps with 200 tokens per Thought + Action + Observation, context accumulates 2,000 tokens minimum for reasoning scaffolding alone. Apply [[pattern-rolling-summary]] or [[pattern-context-manager-agent]] for loops that may run 20+ steps.

**Tool misuse detection.** If the agent calls a destructive tool (write, delete, submit) before having sufficient information, the loop has failed before the final step. Add a pre-execution validator for destructive tool calls: require a confidence Thought that explicitly states why the action is correct before executing.

## Related Patterns

- [[patterns/pattern-plan-execute-verify]] — the alternative for known-structure tasks; compare before choosing
- [[patterns/pattern-reflection-loop]] — adds a reflection step after the ReAct loop completes; complementary
- [[patterns/pattern-tool-output-validation]] — validates each Observation before injecting it into context
- [[concepts/tool-use]] — tool selection and schema design for the Action step
- [[concepts/agent-failure-modes]] — loop failures, tool misuse, and context-growth failures that ReAct is prone to
