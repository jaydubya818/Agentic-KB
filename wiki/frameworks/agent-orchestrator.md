---
id: 01M06AHBFRPXGMTF95B1QH11GB
title: "Agent Orchestrator (Untrivial-ai)"
type: framework
tags: [agents, orchestration, automation, tools, workflow]
created: 2026-08-16
updated: 2026-08-31
visibility: public
confidence: medium
source: [[summaries/untrivial-ai-agent-orchestrator]]
related: [concepts/agent-loops, concepts/agent-layer-architecture, concepts/agent-observability]
---

# Agent Orchestrator (Untrivial-ai)

**Agent Orchestrator** is an open-source "agent IDE" from Untrivial-ai (GitHub: `Untrivial-ai/agent-orchestrator`) designed to manage fleets of coding agents. It ships with an orchestration layer that plans tasks, spawns worker agents, and autonomously handles common software-delivery friction points: CI failures, merge conflicts, and code review.

> "Agent IDE that enables you to manage fleets of coding agents. It comes with an agentic orchestrator that plans tasks, spawns agents, and autonomously handles CI fixes, merge conflicts, and code reviews." — repository description

## What It Does

Agent Orchestrator provides a workspace for running many coding agents in parallel against a codebase. Rather than a single agent working sequentially, the orchestrator plans out units of work, dispatches them to isolated agent workers, and then closes the loop by monitoring CI results, resolving merge conflicts, and running code review passes — largely without human intervention at each step.

## Key Concepts

- **Fleet management** — the tool is built around running multiple coding agents concurrently rather than one agent at a time, positioning it as infrastructure for scaling agentic coding rather than a single-agent assistant.
- **Isolated workspaces** — each spawned agent appears to operate in its own workspace/branch so parallel work doesn't collide before merge time (worth deeper investigation from the full README/docs, which were not fully captured in this pass).
- **Planner → spawn → feedback loop** — the orchestrator's core loop is: (1) plan tasks, (2) spawn agent workers against those tasks, (3) autonomously react to CI failures, merge conflicts, and review comments, looping until work is mergeable. This is a variant of the [agent loop](../concepts/agent-loops.md) pattern applied specifically to software delivery.
- **Autonomous CI/review/merge-conflict handling** — a distinguishing feature versus simpler coding-agent wrappers: the orchestrator treats CI failures, merge conflicts, and review feedback as first-class signals it can act on directly, rather than surfacing them back to a human.

## When to Use It

- When you need to run several coding agents against a codebase in parallel (e.g., breaking a large task into many smaller ones) and want built-in coordination rather than hand-rolled scripts.
- When the main friction in agentic coding workflows is *after* code generation — CI breakage, merge conflicts, and review cycles — since this is the orchestrator's specific value-add.
- As a reference implementation for building custom orchestration layers (e.g., MissionControl/Hermes-style systems) that need worker-delegation and feedback-loop patterns for coding agents specifically.

## Refinery Notes (2026-08-31)
- The full raw capture includes repository metadata, README, status notes, architecture docs, backend structure docs, CLI docs, ADRs, and implementation plans; the slugged source summary is [[summaries/untrivial-ai-agent-orchestrator]].
- The strongest architecture rule from the docs is **durable facts, derived status**: AO stores minimal durable session/PR/controller facts and computes Kanban/display status at read time.
- The review-gateway ADR is a useful safety signal: prompt text, launch flags, or a terminal transport do not make an interactive TUI reviewer read-only; containment requires a capability gateway plus platform isolation.

## Limitations

- No local clone, build, or runtime execution has been performed in this KB; behavior remains source-reported.
- Claims about autonomous CI fixes, merge-conflict handling, code review, adapter support, and browser-control behavior should be verified before adoption.
- The raw capture includes in-flight plans and status notes; distinguish released behavior from planned behavior when mining implementation details.

## See Also

- [[summaries/untrivial-ai-agent-orchestrator]]
- [Agent Loops](../concepts/agent-loops.md)
- [Agent Layer Architecture](../concepts/agent-layer-architecture.md)
- [Agent Observability](../concepts/agent-observability.md)
