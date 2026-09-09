---
id: 01JB0FACTORY0EXECMODEL00002
title: "Agentic Software Development — Agent Execution Model"
type: personal
tags: [agents, agent-loop, tool-use, context-engineering, model-routing, harness]
created: 2026-09-08
updated: 2026-09-08
visibility: private
confidence: medium
related: [concepts/agent-loops, concepts/tool-design, concepts/context-management, concepts/task-model-fit, personal/agentic-software-factory-architecture]
source: [raw/clippings/2026-09-07T23-18-45__apple-notes__agetnic-software-development__a4ac5523.md, raw/clippings/2026-09-08T00-46-53__apple-notes__adobe-agentic-software-development-final__52340da3.md]
---

# Agentic Software Development — Agent Execution Model

## Definition

A synthesis of Jay's working model for what distinguishes an "agent" from a raw LLM call, and how the pieces (model, agent, harness, runtime, orchestrator) divide responsibility during execution. Drafted as interview prep, but the model is a reusable mental framework for designing any coding agent.

## What Makes Something an Agent

A plain LLM call maps input to output: `Prompt → Model → Response`. An agent adds goal-directed, stateful, iterative control:

```
Goal → State → Decide → Act → Observe → Update → Continue / Stop
```

> "The model provides reasoning. The agent turns that reasoning into goal-directed behavior."

The distinguishing feature isn't "it calls tools" — it's the ability to pursue an objective across multiple steps using its own accumulated state.

## Model vs. Agent vs. Harness vs. Runtime vs. Orchestrator

Responsibilities matter more than which framework's vocabulary you use:

- **Model** — inference and reasoning.
- **Agent** — pursues the goal.
- **Harness** — manages the mechanics of iterative execution: context, model interaction, tools, observations, state, termination.
- **Runtime** — the actual execution environment/resources.
- **Orchestrator** — coordinates work across tasks, agents, or workflow nodes.
- **Control plane** — enterprise-wide policy, identity, and authority, sitting outside all of the above.

> "A harness can execute one agent without being a multi-agent orchestrator."

## The Execution Loop, in Detail

```
Goal → Context → Reason → Propose Action → Validate → Execute → Observe
   → Update State → Verify → Continue / Complete / Escalate
```

The critical architectural rule: the model should never own permissions, credentials, budgets, max-iteration limits, policy, or durable workflow state. Those live outside it.

> "The model proposes. Deterministic systems authorize and execute."
> "Probabilistic reasoning should cross deterministic system boundaries through explicit contracts."

Any tool-call-shaped output from the model is untrusted input: parse it against an explicit schema, validate policy/permissions, and only then execute. Malformed probabilistic output should never silently become an executable operation.

## Context Engineering

Context is a limited working set that gets actively constructed for the decision at hand — not a dump of "everything the model can hold." Layer it:

1. **Task** — objective, issue, acceptance criteria.
2. **Repository** — instructions, architecture, conventions.
3. **Code** — relevant files, symbols, dependencies, tests.
4. **Historical** — prior changes, reviews, decisions.
5. **Enterprise** — standards, security, policy.

> "Context should be retrieved because it's relevant, not accumulated because the model can hold it."

Separately, distinguish **context** (what the model sees right now), **memory** (persisted information selectively retrieved back into context later), and **state** (authoritative system-of-record data that must not depend on what the model "remembers").

## Untrusted Context and Tool Authority

Repository files, tickets, and tool output can carry adversarial or simply wrong instructions. They may influence the model's reasoning but must not be able to redefine permissions, expose credentials, or override policy — those controls live outside retrieved content.

> "Context can influence reasoning. It shouldn't redefine authority."
> "Tool discovery does not imply tool authority." "Connectivity is not governance."

Tool invocation flow: `Agent → Tool Request → Validate → Authorize → Execute → Normalize → Observe`. MCP standardizes discovery/invocation contracts but doesn't remove the need for identity, authorization, credential scoping, policy, or sandboxing.

## Model & Capability Routing

Don't route every task to the strongest model. Characterize the workload (task type, complexity, required capability, security, context size, latency, quality threshold), eliminate anything that fails a hard requirement, then optimize the remainder on quality, latency, availability, and cost. Routing should mature over time: static rules → workload classification → historical evaluation evidence → dynamic empirical routing.

> "I wouldn't optimize for cost per token. I'd optimize for cost per accepted outcome."

## Preventing Runaway Agents

Don't rely on a single stop condition like `max_iterations`. Combine independent runtime controls (iterations, tokens/cost, wall-clock time, tool-call count, retries) with progress detection, and distinguish transient failure from strategy failure — five failed attempts with the same approach isn't evidence a sixth attempt will help.

> "Repeated failure should eventually change the strategy, not merely increase the retry count."
> "The runtime, not the agent, owns the stopping condition."

## Failure Handling, Idempotency, State Machines

Recovery behavior should follow failure semantics, not a blanket retry: timeouts may justify retry; malformed output may justify bounded repair; repeated incorrect reasoning may require replanning or a stronger capability; authorization failure should stop outright. Side-effecting operations (opening a PR, deploying) need idempotency keys or transactional semantics, since retries and duplicate delivery will eventually happen — "retrying reasoning is cheap; retrying side effects can be dangerous." Long-running agent state is best modeled as an explicit state machine (`QUEUED → RUNNING → WAITING_FOR_TOOL → VERIFYING → SUCCEEDED`, with explicit `RETRYING`/`ESCALATED` transitions) rather than implicit control flow.

## See Also

- [Agentic Software Factory — Architecture & System Design](agentic-software-factory-architecture.md)
- [Agent / Harness / Runtime / Orchestrator / SDK Taxonomy](agent-harness-runtime-taxonomy.md)
- [Agent Loops](../concepts/agent-loops.md)
- [Tool Design for Agents](../concepts/tool-design.md)
- [Context Management (Agent Workflows)](../concepts/context-management.md)

## Provenance

Synthesized from two drafts of the same "Agentic Software Development" interview study note (an earlier working draft and its "final" revision), ingested from Apple Notes on 2026-09-07/08. See `source` frontmatter for exact clipping paths.
