---
id: 01KQ302S13YKKHDS3XFHYDZ1TN
title: "Agent Failure Modes"
type: concept
tags: [agents, safety, deployment, orchestration]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [agent-loops, agent-observability, human-in-the-loop, agentic-engineering-stack]
---

# Agent Failure Modes

A taxonomy of the ways agentic systems fail in practice — spanning engineering errors, model errors, and systemic risks. Most production failures are engineering failures, not model failures.

---

## Definition

Agent failure modes are the recurring categories of breakdowns that occur when LLM-based agents interact with tools, memory, and other agents. They can be grouped into: **loop/control failures**, **input/output validation failures**, **security failures**, and **operational failures**.

---

## Why It Matters

Agents that can take real-world actions (send emails, call APIs, modify data) have a much higher blast radius than a standard LLM query. Identifying failure modes early — at design time — allows engineers to build in appropriate guardrails, circuit breakers, and human escalation paths.

---

## Failure Mode Taxonomy

### Loop & Control Failures
- **Unbounded loops**: agent retries indefinitely without a max-step or time budget guard
- **Repeated tool calls**: agent oscillates between the same two tools without progress; detectable via state counters
- **Missing stop conditions**: agent continues past a valid terminal state
- **Mitigation**: max steps + time budgets + stop conditions; watchdog node forcing escalation; guard edges in the graph

### Input/Output Validation Failures
- **Hallucinated tool parameters**: model generates plausible-but-wrong arguments for a tool call
  - *Mitigation*: Pydantic schemas validated before execution; structured output with schema-gated tool dispatch
- **Untyped state**: passing raw dicts through the agent graph makes failures invisible
  - *Mitigation*: typed state objects throughout; fail fast on schema mismatch
- **Malformed structured output**: downstream systems break when JSON is invalid or missing required fields

### Security Failures
- **Prompt injection**: malicious content in retrieved documents or tool outputs hijacks agent instructions
  - *Mitigation*: treat retrieved text as untrusted; separate tool outputs from system instructions; content provenance tags; strict system policy
- **PII leakage**: user data surfaces in logs, tool calls, or model inputs inappropriately
- **Credential exposure**: secrets passed through uncontrolled tool parameters

### Operational / Production Failures
- **Missing timeouts**: tool calls hang indefinitely, blocking the agent loop
- **Unbounded retries**: transient errors become infinite retry storms
- **Global state**: shared mutable state across concurrent agent runs causes race conditions
- **Mixed prompt/business logic**: tightly coupled code that can't be tested or evolved independently
- **No observability**: failures are invisible until users report them (see [agent observability](agent-observability.md))
- **Dependency drift**: unpinned library versions silently change tokenization or model behavior

### Model-Level Failures
- **Hallucination**: model asserts false facts confidently
  - *Mitigation*: tools for factual queries, RAG + citations, constrained outputs, abstain rules, verification loops, second-pass critic
- **Evaluation drift**: model behavior shifts over time without detection; requires ongoing golden-set evaluation

---

## Example

A research agent without loop prevention:
1. Calls `search(query)` → gets ambiguous results
2. Calls `search(refined_query)` → still ambiguous
3. Loops back to step 1 indefinitely

Fix: state counter tracking search attempts; guard edge at N=3 → escalate to human or return best-effort answer.

---

## See Also

- [Agent Loops](agent-loops.md)
- [Agent Observability](agent-observability.md)
- [Human-in-the-Loop](human-in-the-loop.md)
- [Guardrails](guardrails.md)
- [Agentic Engineering Stack](agentic-engineering-stack.md)
