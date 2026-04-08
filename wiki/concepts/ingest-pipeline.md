---
title: "Ingest Pipeline"
type: concept
tags: [architecture, knowledge-base, workflow, automation, mcp]
created: 2026-04-08
updated: 2026-04-08
visibility: public
confidence: high
related: [llm-owned-wiki, state-persistence, enterprise-ai-governance]
source: architecture/2026-04-07-omm-ingest-flow.md
---

# Ingest Pipeline

## Definition

The ingest pipeline is the set of entry points and routing logic that brings raw content into a knowledge base vault before any compilation or structuring occurs. In the Oh My Mermaid (OMM) system, ingest and compile are explicitly decoupled: content is staged in `raw/` directories and only promoted to structured wiki pages during a separate, explicit compile run.

## Why It Matters

Decoupling ingest from compile allows content to be staged, reviewed, and batched before it influences the knowledge base. This prevents noisy or unreviewed content from immediately polluting structured wiki pages, and supports audit trails on all writes.

The separation also enables multi-source ingestion without coupling source-specific logic to the compilation step — each source deposits into `raw/`, and the compile step handles the rest uniformly.

## Entry Points

The OMM ingest system supports four categories of entry points:

| Entry Point | Mechanism | Destination |
|---|---|---|
| Web UI upload | `/api/ingest` | `raw/uploads/` |
| YouTube URL | `kb ingest-youtube` CLI | `raw/transcripts/` |
| Twitter archive | `kb ingest-twitter` CLI | `raw/twitter/` |
| Webhooks (GitHub, Slack, custom) | `/api/ingest/webhook` with namespace RBAC | `raw/webhooks/<ns>/` |

GitHub webhooks fire on merged PRs, closed issues, and pushed docs. Slack and custom API clients use the same webhook endpoint, scoped by namespace token.

## Audit Trail

All writes to `raw/` are logged to `audit.log` with operation type (`ingest` or `webhook`). Nothing bypasses the audit step.

## Example

A GitHub Action on a merged PR POSTs to `/api/ingest/webhook` with a namespace token. The payload lands in `raw/webhooks/github/`. On the next scheduled compile run, the compile step picks up the new file, identifies the appropriate wiki section, and creates or updates the relevant page.

## Common Pitfalls

- **Forgetting to trigger compile**: Content sits in `raw/` indefinitely if no compile run is scheduled or manually triggered.
- **Namespace token leakage**: Webhook RBAC relies on namespace tokens — rotating and scoping these properly is essential for multi-tenant deployments.
- **Source fan-out**: Adding new sources requires only a new entry point → `raw/<dir>/` mapping, not changes to the compile logic.

## See Also

- [LLM-Owned Wiki](llm-owned-wiki.md) — the broader pattern this pipeline serves
- [State Persistence](state-persistence.md) — how staged raw content relates to durable knowledge state
- [Enterprise AI Governance](enterprise-ai-governance.md) — audit logging and RBAC in agentic systems
- [Multi-Tenancy Agents](multi-tenancy-agents.md) — namespace-scoped webhook access
