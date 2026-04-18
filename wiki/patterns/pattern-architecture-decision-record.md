---
id: 01KNNVX2QXKGGE4Q9092GQKSKX
title: "Pattern: Architecture Decision Record (ADR)"
type: pattern
tags: [architecture, workflow, automation, knowledge-base]
created: 2026-04-07
updated: 2026-04-08
visibility: public
confidence: high
related: [concepts/llm-owned-wiki.md, concepts/agent-observability.md, frameworks/framework-mcp.md]
---

# Pattern: Architecture Decision Record (ADR)

## When to Use

Use ADRs to capture significant architectural decisions as they happen, including context, options considered, and rationale. In agentic KB systems, ADRs are often auto-ingested to keep the knowledge base current with evolving system design.

## Structure

ADRs typically include:
- **Title** — short description of the decision
- **Status** — proposed, accepted, deprecated, superseded
- **Context** — the problem being solved
- **Decision** — what was chosen
- **Consequences** — trade-offs and follow-on effects

## Example

In the Oh My Mermaid ([[oh-my-mermaid]]) system, ADR files under `docs/` or tracked ADR paths trigger automatic ingestion via GitHub Actions. When a PR touching these files is merged, the workflow fires and posts to `/api/ingest/webhook`, keeping the KB in sync with architecture evolution.

### GitHub Actions Integration ([[oh-my-mermaid]])

The KB ingest workflow (`.github/workflows/kb-ingest.yml`) fires on:
- Merged pull requests
- Closed issues
- Pushes touching `docs/` or ADR files

It posts to `/api/ingest/webhook` with the `X-GitHub-Event` header so the webhook adapter knows which payload shape to parse. Required repo secrets: `KB_WEBHOOK_URL` and `KB_WEBHOOK_SECRET`.

This creates a tight feedback loop: architecture decisions are written once (as ADRs or docs), and the KB stays current automatically.

## Trade-offs

| Pro | Con |
|---|---|
| Decisions are traceable over time | Requires discipline to write ADRs consistently |
| Auto-ingestion keeps KB current | Secrets management adds operational overhead |
| Decouples authoring from KB maintenance | Webhook failures can silently drop updates |

## Related Patterns

- [Architecture First](pattern-architecture-first.md) — ADRs support up-front design discipline
- [LLM-Owned Wiki](../concepts/llm-owned-wiki.md) — ADRs are a primary ingest source for living KB systems
- [Agent Observability](../concepts/agent-observability.md) — webhook delivery and ingest events should be observable

## See Also

- [MCP Framework](../frameworks/framework-mcp.md)
- [Context Management](../concepts/context-management.md)
