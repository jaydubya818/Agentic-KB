---
title: Retrieval & Tool Access Boundaries Must Be Co-Designed
type: synthesis
sources:
  - [[concepts/metadata-filtering]]
  - [[concepts/permission-modes]]
  - [[recipes/recipe-production-deployment]]
question: Why are metadata filtering and permission modes the same access-control boundary viewed from opposite directions, and what does designing them in isolation cost a multi-tenant agentic system?
tags: [agentic, security, multi-tenancy, access-control, rag, retrieval, permissions]
created: 2026-05-23
updated: 2026-05-23
reviewed: false
reviewed_date: ""
---

# Retrieval & Tool Access Boundaries Must Be Co-Designed

## Question
Why are metadata filtering and permission modes the same access-control boundary viewed from opposite directions, and what does designing them in isolation cost a multi-tenant agentic system?

## Argument
Metadata filtering governs what an agent can **see** (retrieval-time enforcement); permission modes govern what an agent can **do** (execution-time enforcement). They are two sides of the same access-control boundary, and any deployment that designs one without the other ships a system whose advertised security posture is contradicted by its actual data flow. The failure mode is bidirectional: perfect tool permissions still leak data when retrieval filtering is wrong, and perfect retrieval filtering is bypassed when the agent owns a tool that queries the store directly. The synthesis is that co-design is not a best practice — it is a correctness condition for multi-tenant agentic systems.

## Evidence

- `concepts/metadata-filtering` explicitly mandates retrieval-layer enforcement: *"filter by tenant/permission in the retrieval layer; never post-retrieval or by model instruction."* This is a hard rule because post-retrieval filtering and instruction-based filtering are both bypassable by prompt manipulation.
- `concepts/permission-modes` defines the tool-call allowlist as the runtime authorization boundary — the agent cannot invoke what it is not permitted to invoke.
- `recipes/recipe-production-deployment` specifies the PostgreSQL + vector store topology where both controls must coexist but does not currently cross-reference either concept, meaning the recipe gives no operational guidance on how to verify the two boundaries are co-extensive.

## Failure mode (concrete)

A multi-tenant deployment passes a security audit on permissions: the agent is restricted to read-only retrieval tools and a sanctioned write tool that scopes by tenant. Metadata filtering is misconfigured — retrieval returns chunks from neighboring tenants. The agent retrieves cross-tenant content, includes it verbatim in its response, and exfiltrates data through a permission boundary that audited clean. The permission mode is correct in isolation; the system is broken in composition.

The inverse failure: retrieval filtering is correct, but the agent has a "query vector store" tool that bypasses the retrieval layer entirely. Tool permissions trusted the retrieval boundary; the retrieval boundary trusted tool permissions; nothing enforces the actual invariant.

## Implication for design

For any multi-tenant deployment, the access-control review must:

1. Enumerate the retrieval boundary (which embeddings/chunks are reachable given a tenant context).
2. Enumerate the tool boundary (which tools the agent can call and what they can return).
3. Verify the two boundaries are co-extensive — every datum reachable through tools is also reachable through retrieval filtering, and vice versa, under the same tenant scope.
4. Test with a cross-tenant probe: a synthetic request that should return nothing if both boundaries are correct, and observe what comes back.

A single owner is responsible for both sides. If retrieval is owned by data-platform and tools are owned by application, that organizational seam is exactly where the failure ships.

## Related

- [[concepts/metadata-filtering]] — retrieval-layer enforcement
- [[concepts/permission-modes]] — execution-layer enforcement
- [[recipes/recipe-production-deployment]] — deployment topology where both must coexist
- [[syntheses/synthesis-eval-metrics-to-failure-modes]] — adjacent: evaluation metrics for access-control failures
- [[concepts/multi-tenancy-agents]] — broader multi-tenant context

## Status
Draft synthesis (auto-applied from daily-note Connection 2, 2026-05-23). `reviewed: false`. Human review needed to:

- Confirm the cross-tenant probe pattern matches Jay's preferred testing approach.
- Decide whether to extend `recipe-production-deployment` with the co-design checklist or keep it here.
- Add Jay's own operational examples if any.
