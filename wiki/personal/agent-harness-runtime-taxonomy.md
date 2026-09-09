---
id: 01JB0FACTORY0TAXONOMY000005
title: "Agent / Harness / Runtime / Orchestrator / SDK Taxonomy"
type: personal
tags: [agents, harness, runtime, orchestrator, sdk, terminology, architecture]
created: 2026-09-08
updated: 2026-09-08
visibility: private
confidence: medium
related: [concepts/agent-harness-model-context, concepts/meta-harness, personal/agentic-software-factory-architecture, personal/agentic-software-development-execution-model]
source: [raw/clippings/2026-09-07T21-31-17__apple-notes__a-harness-is-the-bounded-execution-environment__dbd86a2b.md, raw/clippings/2026-09-08T00-58-28__apple-notes__yes-and-this-is-very-relevant-to-fdlc-mission-control-fab__c0c07541.md]
---

# Agent / Harness / Runtime / Orchestrator / SDK Taxonomy

## Definition

The industry uses "agent harness" to mean at least four different things: the loop inside a worker, the operating environment around a worker, the workflow layer coordinating many workers, and sometimes the enterprise policy/control layer itself. This article separates those concerns with a consistent vocabulary, extending the existing [Harness, Model, Context Triad](../concepts/agent-harness-model-context.md) and [Meta-Harness](../concepts/meta-harness.md) concepts with a fuller layer stack and an explicit place for "Agentic SDK."

## The Layer Stack

```
MODEL            — inference engine (Claude, GPT, Gemini, DeepSeek, ...)
AGENT            — goal-directed entity using model intelligence + context + capabilities
AGENT LOOP       — the iterative control cycle (load state → plan → act → observe → update → repeat)
AGENTIC SDK      — developer toolkit providing implementations of some of the above
AGENT HARNESS    — bounded operating environment governing how an agent runs
CODING HARNESS   — a harness specialized for software engineering
IDE HARNESS      — a coding harness centered on an IDE/editor interaction model
RUNTIME          — execution substrate (process/container/sandbox/compute/queue)
ORCHESTRATOR     — coordinates work across multiple agents/nodes
CONTROL PLANE    — enterprise identity, policy, budgets, and authority
```

> "Most disagreement about the meaning of 'agent harness' is a boundary disagreement... FDLC separates these concerns so that each layer has a clear responsibility, owner, lifecycle, and qualification boundary."

## Agent Loop Is Not the Harness

The `while not done: load_context() → model.reason() → select_tool() → execute() → observe() → evaluate_progress() → update_state()` loop is sometimes itself called "the harness" because it's the machinery wrapping repeated inference. Treat that as too narrow a definition — call it the **Agent Loop** or **Execution Loop**, and treat it as one component *inside* a harness, not a synonym for the harness.

## Agent Harness

The bounded operating environment that converts raw model intelligence into an operational capability: task contract/instructions, context construction and compression, state/memory, the agent loop itself, tool interfaces, permissions, retries/recovery, stopping conditions, token/cost budgets, artifact handling, telemetry, provenance.

> "AGENT = MODEL + HARNESS" (a useful architectural mental model, not a mathematical identity)
> "A harness determines how an agent is allowed to operate."

Enterprise policy authority should generally live outside the harness, in the control plane — the harness may enforce policy locally, but shouldn't own it.

## Coding Harness and IDE Harness

A **Coding Harness** is an Agent Harness specialized for software engineering: repository/workspace access, file diffs, shell execution, compiler/test-runner interaction, build-system and dependency-manager awareness, git operations, patch generation, checkpointing, repair loops. Claude Code is a coding harness, not merely "Claude with a prompt" — `Claude ≠ Claude Code`. An **IDE Harness** is a coding harness whose interaction model is centered on an IDE (buffers, cursor/selection, language server, diagnostics, diff UI, approvals) — a terminal-based coding agent can be a perfectly legitimate coding harness without being an IDE harness.

Other harness specializations worth naming explicitly rather than reaching for the vague "AI harness": Research Harness, Data Harness, Browser Harness, Security Harness, Operational Harness.

## Harness vs. Runtime

Different questions: the harness asks "how does this agent operate" (context, tools, loop, budgets, permissions, stop conditions); the runtime asks "where and how does this execution survive and run" (process/container, sandbox, compute, filesystem, network, queue, checkpointing, leases, scheduling, secrets injection). A coding harness (e.g. Claude Code) executes *through* a runtime, which provisions a sandbox/VM/container underneath it.

## Harness vs. Orchestrator

The harness controls one worker; the orchestrator coordinates work across many. A factory-level task ("upgrade this library across 73 repos") gets decomposed by an orchestrator into per-repository work, each dispatched to a coding-harness invocation, then reassembled through verify → human gate → release.

## Agentic SDK Is Not the Harness

An Agentic SDK (e.g. the OpenAI Agents SDK) is a *developer toolkit* that can *implement* pieces of an agent loop, harness, or even runtime — it is not itself synonymous with any of them. It typically ships agent definitions, an agent loop, tool abstractions, handoffs, guardrails, sessions/state, tracing, and sometimes sandbox/runtime integration.

> "SDK = construction toolkit. Harness = runtime execution mechanism built with or supplied by that toolkit."
> "SDK contains a runtime implementation/capability. It doesn't mean SDK = runtime."

Two further boundaries worth being explicit about:

- **SDK guardrails ≠ enterprise authority.** SDK guardrails can validate agent inputs/outputs/tool calls (sometimes concurrently with execution already underway), which is useful enforcement — but deterministic authority for questions like "can this work order run," "can this credential spend $X," "can this change be published" must live outside the model/SDK, in the control plane.
- **Handoffs ≠ orchestration.** Agent-to-agent handoffs inside an SDK are not the same problem as factory-level orchestration (`WorkOrder → Factory Version → Execution Profile → Attempt → Candidate → Verification → Authority → Release → Outcome`), which requires control-plane authority the SDK doesn't provide.

## See Also

- [The Harness, Model, Context Triad](../concepts/agent-harness-model-context.md)
- [Meta-Harness](../concepts/meta-harness.md)
- [Agentic Software Development — Agent Execution Model](agentic-software-development-execution-model.md)
- [Agentic Software Factory — Architecture & System Design](agentic-software-factory-architecture.md)

## Provenance

Synthesized from two clippings: a harness-taxonomy note ("A harness is the bounded execution environment...") and a follow-up note distinguishing Agentic SDK from harness/runtime/orchestrator ("Yes — and this is very relevant to FDLC..."), both ingested from Apple Notes on 2026-09-07/08. See `source` frontmatter for exact clipping paths.
