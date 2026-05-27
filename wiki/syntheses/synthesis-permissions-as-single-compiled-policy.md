---
title: Retrieval Filters and Tool Permissions Should Compile from a Single Policy Document
type: synthesis
sources:
  - [[concepts/rag-systems]]
  - [[concepts/permission-modes]]
  - [[syntheses/synthesis-retrieval-and-tool-permissions-as-co-enforced-boundary]]
  - [[summaries/siagian-agentic-engineer-roadmap-2026]]
question: In a multi-tenant agentic system, should the retrieval-side metadata filter (what an agent can read) and the tool-side allowlist (what an agent can do) be authored as separate engineering concerns, or compiled from a single policy document?
tags: [rag, security, multi-tenancy, agentic, permissions, deployment]
created: 2026-05-25
updated: 2026-05-25
reviewed: false
reviewed_date: ""
---

# Retrieval Filters and Tool Permissions Should Compile from a Single Policy Document

## Question
In a multi-tenant agentic system, should the retrieval-side metadata filter (what an agent can read) and the tool-side allowlist (what an agent can do) be authored as separate engineering concerns, or compiled from a single policy document?

## Argument
Single policy. Metadata filtering and tool permission modes are architecturally the same access-control primitive — subject (agent/user/tenant) → resource (document/tool) → allowed operations — applied at different layers of the request pipeline. Authoring them in different files, by different teams, with different review cadences guarantees drift. The fix is a single canonical policy document that compiles down to (a) the vector store metadata filter at retrieval time, and (b) the tool allowlist at execution time. The existing [[syntheses/synthesis-retrieval-and-tool-permissions-as-co-enforced-boundary|co-enforced-boundary synthesis]] argues these are "one boundary, not two" but stops at runtime co-enforcement; the deeper claim is that they should also share a single source of truth at design time.

## Evidence
[[concepts/rag-systems]] (per the Siagian roadmap) specifies metadata filtering by tenant, permission, doc-type, date, and language — "in code, not model" — as the key enterprise security requirement on the retrieval path. The filter is enforced at the vector store before any chunks reach the LLM context window.

[[concepts/permission-modes]] specifies allowlist + sandbox controls on the tool execution path: which tools may be called, with which arguments, against which resources. Both controls take the same logical inputs (who, what, where) and produce a yes/no decision.

The [[syntheses/synthesis-retrieval-and-tool-permissions-as-co-enforced-boundary|existing co-enforcement synthesis]] establishes that violating either layer breaks the security model — a tool allowlist is meaningless if the agent can retrieve unauthorized data into context, and a tight metadata filter is meaningless if the agent can call a tool that reads outside that scope. But the synthesis treats them as two enforcement points sharing intent; it does not name the underlying design fix.

The implementation shape is a policy DSL (YAML/Cedar/OPA) that defines subject→resource→operation rules once, with two compilers: one that emits the vector store filter clause, one that emits the tool allowlist + argument schema. Both compilers run from the same source on the same CI pipeline. A change to access scope means a single edit, two artifacts regenerated, one review.

## Counter-arguments & Gaps
**Cost of abstraction.** Single-policy compilation adds a build step and a DSL learning curve. For a small system with one or two tenants, hand-authored filter clauses and allowlists are simpler and just as correct. The argument is strongest at scale (10+ tenants, 50+ tools) where drift is statistically certain without it.

**Tool-side context.** Some tool permissions depend on runtime state the metadata filter doesn't see (e.g., "user can write to this issue only if they own it"). A compiled policy must either include enough runtime predicates to express this, or fall back to per-tool authorization code — at which point the "single source" promise weakens.

**Granularity mismatch.** Retrieval filters operate on chunks (paragraph-sized); tool permissions operate on actions (verb-object). The DSL needs to bridge these without forcing chunk-level predicates to look like action-level predicates.

**No production validation in the KB.** The synthesis is structurally clean but no source in the wiki documents a team that actually runs this architecture end-to-end. The closest is the Siagian roadmap's high-level prescription. Real validation requires implementing it in [[concepts/multi-tenancy-agents]] context and observing whether drift actually decreases.

## Conclusion
Author one policy document, compile to both surfaces. Treat the [[syntheses/synthesis-retrieval-and-tool-permissions-as-co-enforced-boundary|co-enforcement synthesis]] as the runtime story and this synthesis as the design-time story; both must hold for the security model to be trustworthy. Next step: prototype the DSL against a 2-tenant scenario and measure how many lines of allowlist/filter code collapse into shared rules — if the collapse rate is below 40%, the abstraction isn't paying for itself.

## Sources
- [[concepts/rag-systems]]
- [[concepts/permission-modes]]
- [[syntheses/synthesis-retrieval-and-tool-permissions-as-co-enforced-boundary]]
- [[summaries/siagian-agentic-engineer-roadmap-2026]]
