---
title: "Yes and this is very relevant to FDLC Mission Control Fab"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8547
captured_at: 2026-09-08T00:58:28.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: c0c07541a9655e8f3c75b7a6cf0d2e818fb725616cd4b3963ea7f5656d4be8b0
---

Yes — and this is very relevant to FDLC, Mission Control, Fab, and the terminology work you just completed. The description you pasted is directionally correct, but it mixes several layers.

The most important clarification:

An Agentic SDK is not the agent, harness, runtime, orchestrator, sandbox, or control plane. It is a developer toolkit that can provide implementations of some of those layers.

For example, the  ⁠OpenAI Agents SDK provides a built-in agent loop, agents, tools, handoffs, guardrails, sessions, tracing, human-in-the-loop support, MCP integration, and sandbox agents.  

Where it fits in your taxonomy

I would model it like this:
AGENTIC SDK
Developer framework / implementation toolkit
        │
        ├── Agent definitions
        ├── Agent Loop
        ├── Tool abstractions
        ├── Handoffs
        ├── Guardrails
        ├── Sessions / state
        ├── Tracing
        └── sometimes Sandbox integration
                    │
                    ▼
              AGENT HARNESS
                    │
                    ▼
                 AGENT
                    │
             uses Capabilities


Then above it:

MISSION CONTROL / FACTORY CONTROL PLANE
                    │
        ┌───────────┼────────────┐
        ▼           ▼            ▼
 Factory Version  WorkOrder   Authority
        │
        ▼
 Execution Profile
        │
        ▼
 Agent/Harness Implementation
        │
        ├── OpenAI Agents SDK
        ├── Claude Agent SDK
        ├── Google ADK
        ├── custom harness
        └── coding harness


That’s the important FDLC boundary.

SDK vs Harness

These two are easy to confuse.

Agentic SDK = the library/framework you build with.

Agent Harness = the actual execution machinery around an agent: iterative model → tool → observation → model loop, state/context handling, stopping conditions, etc.

An SDK may provide an implementation of a harness.

For example, OpenAI explicitly says its Agent + Runner manages turns, tools, guardrails, handoffs and sessions, while using the Responses API directly means you own that loop yourself.  

So:

SDK = construction toolkit. Harness = runtime execution mechanism built with or supplied by that toolkit.

SDK vs Runtime

Also different.

A runtime answers:

Where and under what execution conditions does this work run?

The SDK answers:

What programming abstractions do I use to construct and execute the agent behavior?

Some SDKs blur this boundary by shipping runtime functionality. OpenAI, for example, now has sandbox agents with isolated filesystem workspaces, shell execution, editing, snapshots, and resumable sessions.  

That doesn’t mean SDK = runtime.

It means:

SDK contains a runtime implementation/capability.

SDK vs Orchestrator

Handoffs don’t automatically make an SDK your enterprise orchestrator.

OpenAI supports manager-style orchestration and handoffs between agents.  

But Mission Control is solving a much larger problem:

WorkOrder → Factory Version → Execution Profile → Attempt → Candidate → Verification → Authority → Release → Outcome

That’s Factory orchestration/control-plane authority, not merely agent-to-agent delegation.

And SDK guardrails ≠ FDLC authority

This one matters a lot.

SDK guardrails can validate agent inputs, outputs and tool calls. OpenAI even documents that some input guardrails can run concurrently with the agent, meaning model/tool work may already have started before the guardrail trips.  

That’s useful enforcement.

But FDLC still needs deterministic authority outside the model/SDK for:

Can this WorkOrder run?
Can this repository be modified?
Can this model spend $X?
Can this candidate be accepted?
Can this change be published?
Can Production be modified?

So your terminology work should explicitly say:

SDK guardrails enforce behavior within an agent execution framework. They do not inherently establish enterprise authority.

I would add Agentic SDK to your canonical taxonomy

Definition:

Agentic SDK — A software development toolkit providing reusable primitives and implementations for constructing agentic applications, such as agent definitions, execution loops, tools, handoffs, guardrails, sessions, tracing, and sometimes sandbox/runtime integration. An Agentic SDK may implement portions of an Agent Harness, Work Graph, Runtime, or Orchestrator, but is not itself synonymous with any of them.

And then your taxonomy becomes even cleaner:

Model — reasoning
Agent — goal-directed configuration
Agent Loop — iterative reasoning/action cycle
Agentic SDK — toolkit for building agentic systems
Agent Harness — machinery operating the agent loop
Coding Harness — harness specialized for software engineering
IDE Harness — IDE-integrated execution environment
Work Graph — dependencies and transitions across work
Orchestrator — coordinates execution across nodes/work
Runtime — execution environment
Sandbox — isolation boundary
Capability — what can be done
Capability Implementation — qualified implementation of that capability
Control Plane — deterministic authority/governance
Factory — outcome-producing operating system
Factory Version — immutable qualified composition

That distinction is exactly the kind of thing FDLC should teach because the industry currently throws agent, SDK, harness, runtime, and orchestrator around as if they’re interchangeable. They’re not.

￼
