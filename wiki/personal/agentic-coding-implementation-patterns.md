---
id: 01JB0FACTORY0IMPLPATTERNS006
title: "Agentic Coding Implementation Patterns (Model Router, Tool Registry, Bounded Agent Loop)"
type: personal
tags: [agents, implementation, model-routing, tool-use, agent-loop, coding-patterns]
created: 2026-09-08
updated: 2026-09-08
visibility: private
confidence: medium
related: [personal/agentic-software-development-execution-model, concepts/tool-design, concepts/agent-loops]
source: [raw/clippings/2026-09-08T19-12-30__apple-notes__adobe-coding-agentic-software-development__a4fe4495.md]
---

# Agentic Coding Implementation Patterns

## Definition

Concrete, small-scale implementation sketches for the components described more abstractly in [Agentic Software Development — Agent Execution Model](agentic-software-development-execution-model.md): a model router, a tool registry/dispatcher, and a bounded agent loop. Originally drafted as live-coding-interview prep; kept here as reusable implementation patterns rather than interview trivia.

## Universal Workflow for Building Any of These

```
Clarify contract → Simplest design → Happy path → Test it → Edge cases → Productionize
```

Define explicit input/output types before writing logic; get one working flow before handling edge cases; prove the happy path with a test before expanding; only then discuss concurrency, retries, observability, idempotency, authorization, timeouts.

## Pattern: Model Router

Separate **eligibility** from **ranking** — a cheap model should never win by violating a hard constraint.

```
Task { complexity, securityLevel, latencyRequirement }
Model { name, qualityScore, cost, securityLevel, latency }

route(task, models):
    eligible = [m for m in models if satisfies_hard_constraints(task, m)]
    return rank(eligible, by=[quality, cost])
```

> "Hard constraints first, optimization second."

## Pattern: Tool Registry / Dispatcher

Separate the model-facing tool name from the actual implementation so there's one place to add authorization, schema validation, telemetry, or versioning later.

```
ToolRegistry:
    register(name, handler)
    execute(name, args)
```

Handle unknown-tool lookups and input validation in the registry, not in each handler. Authorization should sit in the registry/gateway, outside the handler, so a handler can't accidentally skip a permission check: "I'd keep authorization outside the handler and make the registry or gateway enforce the policy before dispatch."

## Pattern: Bounded Agent Loop

```
while not complete:
    action = call_model(state)
    parsed = parse_action(action)
    result = invoke_tool(parsed)
    state.append(result)
    iterations += 1
    if iterations > max_iterations or budget_exceeded or timed_out:
        stop_or_escalate()
```

Start with the simplest loop that demonstrates the behavior, then layer in the controls (max iterations, budget, timeout) as a second pass rather than trying to design them all up front — this mirrors the "simplest design first" interview strategy and the runaway-agent controls described in the reliability and execution-model articles.

## See Also

- [Agentic Software Development — Agent Execution Model](agentic-software-development-execution-model.md)
- [Tool Design for Agents](../concepts/tool-design.md)
- [Agent Loops](../concepts/agent-loops.md)

## Provenance

Synthesized from a single clipping ("ADOBE: CODING & AGENTIC SOFTWARE DEVELOPMENT") ingested from Apple Notes on 2026-09-08, specifically its model-router, tool-registry, and bounded-agent-loop implementation sketches. See `source` frontmatter for the exact clipping path.
