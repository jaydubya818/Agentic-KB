---
id: 01JB0FACTORY0RELIABILITY0003
title: "Production Reliability & Operational Judgment for Agentic Systems"
type: personal
tags: [reliability, incident-response, agents, production, operations, distributed-systems]
created: 2026-09-08
updated: 2026-09-08
visibility: private
confidence: medium
related: [concepts/agent-failure-modes, concepts/agent-observability, personal/agentic-software-factory-architecture]
source: [raw/clippings/2026-09-08T01-08-14__apple-notes__adobe-production-systems-reliability-operational-judgment__47bdbf76.md, raw/clippings/2026-09-07T20-48-02__apple-notes__adobe-production-systems-reliability-operational-judgment-2__50c1df1d.md, raw/clippings/2026-09-07T20-51-34__apple-notes__the-operating-framework-to-memorize__58a2672d.md]
---

# Production Reliability & Operational Judgment for Agentic Systems

## Definition

A synthesis of Jay's operating framework for running autonomous agentic systems in production — how to think about incidents, degradation, and reliability when part of the execution path is a nondeterministic model rather than deterministic code. Originally drafted as interview prep across three overlapping notes; consolidated here as a single reference.

## The Core Framework

```
ASSESS → CONTAIN → PRESERVE → ISOLATE → RESTORE → CORRECT → PREVENT → PROVE
```

> "Contain first. Preserve evidence. Restore safety. Diagnose deeply afterward."
> "Mean time to safe state comes before mean time to perfect understanding."

The priority order matters: establish severity/blast radius/expansion first, contain without destroying evidence, get to a *known-safe* state before insisting on a fully understood root cause, then diagnose, fix the systemic gap (not just the symptom), and prove the fix with evidence.

## Two Reliability Models, Not One

Traditional distributed-systems principles (timeouts, retries, backoff, circuit breakers, bulkheads, backpressure, idempotency, leases, observability, SLOs, progressive delivery, DR) still apply. What's new is that a fully "successful" execution — HTTP 200, tool executed, workflow completed — can still produce a wrong outcome. So reliability needs two separate lenses:

- **Operational reliability** — did the system execute correctly?
- **Behavioral reliability** — did it produce an acceptable outcome?

> "An agent returning HTTP 200 doesn't mean the system succeeded."

This is why evaluation and verification are production reliability capabilities, not just offline AI testing.

## Failure-Domain Map

When something breaks, don't default to blaming the model. Scan the whole stack:

```
MODEL → CONTEXT → PLAN → ROUTING → ORCHESTRATION → STATE → TOOL
   → SANDBOX → POLICY → VERIFICATION → DELIVERY → INFRASTRUCTURE
```

> "Agent failure is a system failure until we've isolated the failing layer."

## Blast Radius and Containment

Establish what's affected and whether it's still growing before attempting a fix. Contain at the smallest trustworthy boundary rather than reaching for a global stop:

```
Execution → Capability → Model → Factory Version → Execution Profile
   → Workflow → Organization → Region → Global
```

> "Before fixing the failure, understand how far the failure can travel."
> "Contain at the smallest boundary I can trust."

## The Operational Degradation Ladder

A reusable answer for "what happens when a subsystem fails" — degrade capability in steps rather than an all-or-nothing outage:

```
FULL AUTONOMY
  ↓ AUTONOMOUS EXECUTION + HUMAN ACCEPTANCE
  ↓ CANDIDATE GENERATION ONLY
  ↓ RECOMMENDATION ONLY
  ↓ READ-ONLY DIAGNOSIS
  ↓ QUEUE / PAUSE
```

> "Degrade capability before degrading safety."
> "When verification weakens, autonomy should contract."
> "Loss of governance should reduce authority, not expand it."

## Common Scenarios and the One-Line Answer

- **Runaway agent burning tokens** — stop from the control plane (not the agent itself), preserve the trajectory, resume from the last safe checkpoint with a *different* strategy. "The runtime, not the agent, owns the stopping condition."
- **10x cost spike** — break spend down by version/workload/model/repo/retry rate before assuming it's legitimate growth; optimize for cost per accepted outcome, not tokens.
- **Cascading failure (provider degraded → retries → queue explosion → cost)** — verify the cascade hypothesis from telemetry, then break the feedback loop (circuit-break the failing provider, kill uncontrolled retries, admission control) before considering autoscaling. "Don't scale the symptom. Break the feedback loop."
- **Agent-generated defect reaches production** — restore safety first (flag, rollback, roll-forward), then trace backward through Production → Deployment → Authority → Evidence → Verification → Candidate → Execution → Plan → Context → Route to find which trust boundary failed. "Fix both the defect and the trust-system gap that allowed the defect through."
- **All verification passed, production still failed** — this is high-value evidence that the trust model was incomplete; identify which property verification didn't represent and encode it into the qualification corpus. "Every production escape is evidence about what our verification model doesn't understand yet."
- **Worker crash mid-task** — the worker is disposable; authoritative state lives in the control plane behind a lease; a replacement worker resumes from durable state; a fencing token stops a stale worker from publishing after the fact. "A stale worker may continue computing. It must not continue committing."
- **Unauthorized vs. authorized-but-wrong action** — different incident classes. Unauthorized → investigate identity/policy/credentials/tool-gateway/sandbox. Authorized-but-incorrect → investigate intent/plan/context/model/verification.

## Twelve Failure Controls Worth Knowing Cold

Timeouts, retries (only for transient failure), exponential backoff + jitter, circuit breakers, bulkheads, backpressure, admission control, leases, fencing tokens, idempotency, checkpoints, reconciliation.

## Four Reliability Loops

1. **Execution loop** — Reason → Act → Observe → Persist → Verify (controls: budget, timeout, progress detection, retry, circuit breaker).
2. **Recovery loop** — Failure → Classify → Checkpoint → Reassign → Reconcile → Resume (controls: leases, fencing, idempotency, durable state).
3. **Incident loop** — Assess → Contain → Preserve → Restore → Diagnose → Correct (controls: kill switches, rollback, degraded modes, incident command).
4. **Learning loop** — Incident → Failure Case → Eval → Candidate Fix → Qualification → Promotion (controls: baseline comparison, canary, rollback).

> "Production reliability feeds factory learning, but learning never gets to bypass qualification."

## Automation Boundary

Automate recovery where the failure is well understood, remediation is bounded, and the action is reversible (checkpoint recovery, lease reassignment, qualified-fallback routing, backpressure). Where diagnosis is ambiguous or the action is irreversible, AI can accelerate investigation and propose options, but a human retains authority. The underlying question isn't "should a human be in the loop" — it's "what evidence does the system need before it earns the authority to act automatically."

## See Also

- [Agentic Software Factory — Architecture & System Design](agentic-software-factory-architecture.md)
- [Agent Failure Modes](../concepts/agent-failure-modes.md)
- [Agent Observability](../concepts/agent-observability.md)

## Provenance

Synthesized from three overlapping drafts of the same "Production Systems, Reliability & Operational Judgment" interview study note ingested from Apple Notes on 2026-09-07/08. See `source` frontmatter for exact clipping paths.
