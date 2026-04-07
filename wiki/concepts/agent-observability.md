---
title: Agent Observability
type: concept
tags: [agentic, observability, production, monitoring, debugging]
confidence: medium
sources:
  - [[summaries/19-oss-agent-repos-curated]]
created: 2026-04-07
updated: 2026-04-07
related:
  - [[concepts/agent-failure-modes]]
  - [[concepts/human-in-the-loop]]
  - [[concepts/memory-systems]]
status: evolving
---

# Agent Observability

## Definition
Agent observability is the practice of capturing, storing, and surfacing the internal state and behavior of agentic systems during and after execution — enabling debugging, cost management, auditing, and iterative improvement.

## Why It Matters
Unlike stateless API calls, agents execute multi-step, often branching workflows with tool calls, memory reads/writes, and sub-agent invocations. Traditional application monitoring (logs, traces) is insufficient without agent-aware instrumentation that understands the structure of agent loops, tool use, and LLM calls.

## Core Dimensions

### 1. Session Replay
Full reconstruction of an agent's execution trace: every LLM call, tool invocation, input/output, and branching decision. Enables post-hoc debugging of unexpected behaviors.

### 2. Cost Tracking
Token usage and API cost attribution per step, per session, per agent. Critical for production cost control and identifying runaway loops.

### 3. Error Debugging
Identifying where and why agents fail — tool errors, hallucinated tool calls, context overflow, infinite loops, or guardrail violations.

### 4. Latency Profiling
Breaking down end-to-end latency by component (LLM inference, tool execution, memory retrieval) to identify bottlenecks.

### 5. Evaluation Hooks
Capturing ground-truth inputs/outputs for offline evaluation; feeding into LLM-as-judge pipelines.

## OSS Tools
- **AgentOps** — Session replays, cost tracking, error debugging. Cited as production-ready.
- **LangSmith** (LangChain ecosystem) — Tracing and evaluation for LangChain/LangGraph agents.
- **Langfuse** — Open-source LLM observability; spans, traces, evaluations.

## Patterns
- Instrument at the LLM call level and the tool call level independently.
- Treat agent sessions as distributed traces (similar to OpenTelemetry spans).
- Store session replays even when runs succeed — regressions are easier to catch with baselines.

## Status
Tooling is maturing rapidly (2025–2026) but standards are not yet settled. Most frameworks have proprietary observability integrations; open standards (OpenTelemetry for agents) are nascent.
