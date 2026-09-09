---
id: 01JB0FACTORY0ARCHITECTURE0001
title: "Agentic Software Factory — Architecture & System Design"
type: personal
tags: [agents, architecture, control-plane, orchestration, harness, enterprise, factory]
created: 2026-09-08
updated: 2026-09-08
visibility: private
confidence: medium
related: [concepts/agent-harness-model-context, concepts/meta-harness, concepts/agent-layer-architecture, concepts/software-factory, personal/jay-agentic-software-factory]
source: [raw/clippings/2026-09-07T20-35-23__apple-notes__adobe-architecture-system-design__19ad72b4.md, raw/clippings/2026-09-08T01-00-28__apple-notes__adobe-architecture-system-design-final__66455118.md, raw/clippings/2026-09-07T21-36-03__apple-notes__adobe-meta-factory-architecture-system-design-study-guide__f05cc210.md, raw/clippings/2026-09-07T20-37-23__apple-notes__your-system-design-memory-map__bd7fe26d.md]
---

# Agentic Software Factory — Architecture & System Design

## Definition

A synthesis of Jay's own architectural model for an enterprise "agentic software factory" — a governed system that turns a builder's stated intent into verified, evidence-backed software outcomes, using replaceable models, agents, tools, and execution capabilities. This was originally drafted as interview-preparation material (multiple iterative drafts converge on the same design), but the architecture itself is a generalizable pattern, not company-specific trivia.

The one-sentence version:

> "Meta Factory turns builder intent into trusted software outcomes. A harness executes an agent. The factory governs the work."

## The Reference Pipeline

```
Builder Intent → Governed Plan → Capability/Model Routing → Control Plane
   → Durable Orchestration → Context Intelligence → Secure Sandbox Execution
   → Verification Plane → Evidence → Human/Policy Authority → Delivery
   → Outcome → Learning → Candidate Improvement → Eval + Promotion Gate
```

Cross-cutting control plane: Identity | Policy | Authorization | Budget | Scheduling | Observability | Audit | Governance.

## Ten Architectural Distinctions Worth Keeping

1. **Planner ≠ Plan** — the planner may be probabilistic; the resulting plan should be a durable, governed artifact (dependencies, acceptance criteria, budgets, authority boundaries).
2. **Capability ≠ Authority** — being able to perform an action doesn't mean being permitted to.
3. **Context ≠ State ≠ Memory** — context informs reasoning, state governs execution, memory informs future reasoning.
4. **Agent ≠ Harness ≠ Factory** — the agent reasons/works, the harness governs one agent's execution, the factory governs outcomes across many agents.
5. **Model Routing ≠ Capability Routing** — sometimes the right execution resource isn't an LLM at all.
6. **Generation ≠ Verification** — generation scales output; verification scales trust.
7. **Confidence ≠ Trust** — confidence is a model property, trust is a system property.
8. **Learning ≠ Promotion** — learning can be autonomous; promotion into production should be governed.
9. **Task Success ≠ Objective Success** — individual steps can succeed while the overall objective fails.
10. **Availability ≠ Correctness** — a factory can run perfectly and still produce the wrong answer.

## Control Plane vs. Execution Plane

The control plane is authoritative and durable: identity, policy, budgets, scheduling, leases, durable workflow state, approvals, audit. The execution plane is disposable: workers receive bounded authority, execute, produce artifacts/evidence, and disappear. This separation matters because a crashed, looping, or misbehaving agent cannot be the authoritative source of its own permissions, budget, or success — the system responsible for stopping it must stay healthy when the agent itself is not.

> "The worker performs the work. The control plane owns the truth."
> "The system governing the agent must remain healthy when the agent itself is unhealthy."

## Build vs. Adopt

The recurring judgment call across every layer (harness, routing, code review, orchestration) is the same: benchmark commercial/open capabilities against real workloads first, and build only where there's genuine differentiation.

> "Adopt commodity. Build differentiation."
> "Proprietary should be an outcome of differentiation, not an architectural preference."

Generic coding, planning, tool use, and orchestration are commoditizing quickly. Differentiation is more likely to live in: builder experience, enterprise/repository context, secure execution, identity/policy integration, evaluation, evidence, and learning loops feeding back into qualification.

## Capability & Model Routing

Two-phase routing, not a single complexity score:

1. **Eligibility** — hard constraints (security/data classification, required tools, context capacity, latency, reliability threshold, provider policy) filter out ineligible capabilities.
2. **Optimization** — among eligible capabilities, rank by historical evaluation performance, verification success, retries, latency, availability, and cost.

> "Hard constraints first. Optimization second."
> "Route work to capabilities, not automatically to intelligence."

The economic north star throughout is **cost per accepted outcome**, not cost per token — a cheaper model that triggers retries, fails verification, or needs human correction can be the more expensive path.

## Tokenomics Levers

Attack cost across the whole execution path rather than negotiating a lower per-token price: route by workload instead of defaulting to the frontier model; retrieve minimum sufficient context instead of dumping repositories into the window; push anything deterministic (compilers, linters, static analysis, queries) out of the model entirely; cache and reuse stable context; bound retry/loop behavior since failed attempts dominate cost; and instrument everything against accepted outcomes, not raw token counts.

## Whiteboard Habit

Don't open a system-design conversation by drawing 25 boxes. Clarify first: who's the builder, what outcome, expected scale, trust boundaries, autonomy level, success criteria. Then draw one pipeline diagram and let the reviewer pick where to go deeper, using a consistent expansion pattern for any component:

```
PURPOSE → CONTRACT → STATE → FAILURE → SECURITY → SCALE → TRADEOFF
```

And for every design decision, state the tradeoff explicitly: "I'm choosing X because Y. The cost is Z."

## See Also

- [The Harness, Model, Context Triad](../concepts/agent-harness-model-context.md)
- [Meta-Harness](../concepts/meta-harness.md)
- [Agent Layer Architecture](../concepts/agent-layer-architecture.md)
- [Software Factory](../concepts/software-factory.md)
- [Agentic Software Development — Execution Model](agentic-software-development-execution-model.md)
- [Production Reliability & Operational Judgment for Agentic Systems](production-reliability-operational-judgment.md)
- [Agent / Harness / Runtime / Orchestrator / SDK Taxonomy](agent-harness-runtime-taxonomy.md)

## Provenance

Synthesized from four overlapping drafts of the same architecture study guide ingested from Apple Notes on 2026-09-07/08 (see `source` frontmatter for exact clipping paths in `raw/clippings/`). The drafts converge on one consistent design; this article consolidates them into a single reference rather than keeping four near-duplicate notes.
