---
title: Retrieval Filtering and Tool Permissions as a Co-Enforced Access Boundary
type: synthesis
sources:
  - [[concepts/metadata-filtering]]
  - [[concepts/permission-modes]]
  - [[recipes/recipe-production-deployment]]
question: In a multi-tenant agentic deployment, where do retrieval-layer metadata filtering and tool-execution permission modes intersect, and what failure modes emerge when they're designed independently?
tags: [safety, agentic, multi-tenant, rag-systems, deployment, security]
created: 2026-05-23
updated: 2026-05-23
reviewed: false
reviewed_date: ""
---

# Retrieval Filtering and Tool Permissions as a Co-Enforced Access Boundary

## Question
In a multi-tenant agentic deployment, where do retrieval-layer metadata filtering and tool-execution permission modes intersect, and what failure modes emerge when they're designed independently?

## Argument
Metadata filtering on retrieval and permission modes on tools are two enforcement points on the same access-control boundary, and any tenant-isolation guarantee in a multi-tenant agentic system requires both to be designed together. Treating them as separate concerns — retrieval as a search problem, permissions as an authorization problem — produces a security posture where each control passes its own audit while the system as a whole leaks. The correct mental model is that **the agent's effective access is the union of what it can retrieve and what it can act on**, and that union must be enforced as a single boundary at design time, not assembled piecemeal.

## Evidence
[[concepts/metadata-filtering]] is explicit: *"filter by tenant/permission in the retrieval layer; never post-retrieval or by model instruction."* The page's rationale is that any filter applied after retrieval (or via prompt instruction) is bypassable — the agent has already seen the data. Retrieval is the only place where tenant isolation can be guaranteed for the *read* path.

[[concepts/permission-modes]] governs what tools the agent is allowed to invoke at runtime. The page enumerates patterns like ask-once, ask-each-time, allow-listed paths, and capability tokens. Its scope is the *write* path and the *action* path — what the agent can do with what it knows.

These two pages describe enforcement on opposite sides of the agent loop:

| Concern | Enforced at | What it prevents |
|---|---|---|
| What the agent can *see* | Retrieval (metadata filter) | Cross-tenant data leakage via reads |
| What the agent can *do* | Tool execution (permission mode) | Cross-tenant action via writes |

The failure mode is when these are designed independently. Two concrete cases:

1. **Tight permissions, loose retrieval.** An agent restricted to read-only tools can still exfiltrate cross-tenant data by including retrieved chunks in its output to the user. The permission mode passes review (no destructive tools allowed); the retrieval boundary leaked.

2. **Tight retrieval, loose tools.** An agent whose retrieval is correctly tenant-filtered can still bypass it if it has a `vector_store.query()` tool exposed without the same tenant filter. The retrieval boundary holds for the system-issued queries; the tool boundary doesn't.

[[recipes/recipe-production-deployment]] specifies a PostgreSQL + vector-store topology with a per-tenant column on both. The recipe currently does not cross-reference either [[concepts/metadata-filtering]] or [[concepts/permission-modes]]. This is the operational gap: the deployment recipe and the two enforcement-point pages exist in isolation, so a team following the recipe could implement either control without the other.

## Counter-arguments & Gaps
The strongest counter-argument is that this synthesis is solving a problem that defense-in-depth already addresses. A team running both controls — even if they were designed by separate sub-teams without coordination — gets the union of their protections. The synthesis assumes the failure mode is "either control alone is insufficient"; the realistic failure mode is more often "*neither* control was implemented, because nobody owned the boundary." That's a governance problem, not a co-design problem.

The synthesis also does not handle the case where an agent's *output* is the leak channel. Even with perfectly co-designed retrieval and tool boundaries, an agent that retrieves tenant-A data and writes it to tenant-A's chat history can still leak it if a tenant-B user later gains access to that conversation log. Output-channel filtering is a third enforcement point this synthesis ignores.

What's missing from the evidence: there is no production incident report cited that explicitly demonstrates the failure mode of independently-designed retrieval and tool boundaries. The case is theoretical. A real incident — even a redacted one — would harden this synthesis from "this is a plausible failure" to "this is a documented one."

## Conclusion
For any multi-tenant agentic deployment, the design artifact should be a single document that enumerates *all* enforcement points on the access boundary — retrieval filters, tool permissions, and output channels — with a test plan that verifies each in isolation and the system as a whole with cross-tenant probes. [[recipes/recipe-production-deployment]] should be updated to require this artifact and to cross-reference both concept pages. Open question worth tracking: whether the output-channel leak vector deserves its own concept page (currently implicit in [[concepts/permission-modes]] but not separately named).

## Sources
- [[concepts/metadata-filtering]]
- [[concepts/permission-modes]]
- [[recipes/recipe-production-deployment]]
- [[concepts/rag-systems]]
- [[concepts/multi-agent-systems]]
