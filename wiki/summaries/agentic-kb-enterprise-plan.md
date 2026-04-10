---
title: "Agentic-KB — Enterprise Scaling Ultra Plan"
type: summary
source_file: wiki/repos/agentic-kb/repo-docs/ENTERPRISE_PLAN.md
source_url: https://raw.githubusercontent.com/jaydubya818/Agentic-KB/main/ENTERPRISE_PLAN.md
author: Jay West
date_published: 2026-04-07
date_ingested: 2026-04-10
tags: [agentic, enterprise-ai-governance, deployment, multi-tenancy, cost-optimization, observability, mcp]
key_concepts: [llm-wiki-pattern, compile-pipeline, semantic-search, multi-tenancy, rbac, knowledge-graph]
confidence: high
---

## TL;DR

A P0–P3 enterprise roadmap for scaling Agentic-KB from a personal tool to a team/enterprise platform, grounded in the Karpathy LLM-Wiki pattern. Core insight: "Every business has a raw/ directory. Nobody's ever compiled it. That's the product."

## Priority Tiers

### P0 — Foundational (Implement Now)
- **LLM Auto-Compilation** (`/api/compile`) — incremental raw doc → wiki page pipeline with SSE streaming. Tracks compiled state in `raw/.compiled-log.json`. Triggerable from UI, CLI (`kb compile`), webhook, or cron.
- **Wiki Lint** (`/api/lint`) — detects contradictions, stale pages, orphaned pages, knowledge gaps → `wiki/lint-report.md`
- **Audit Log** (`logs/audit.log`) — append-only JSONL capturing every op: query, ingest, compile. Foundation for analytics and compliance.
- **Webhook Ingest** (`/api/ingest/webhook`) — external push for GitHub issues/PRs/discussions, Slack threads, Notion pages, Jira tickets, generic JSON.

### P1 — Scale & Collaboration
- **Semantic search with local embeddings** — OpenAI `text-embedding-3-small` or `nomic-embed-text`, SQLite vector table, hybrid ranking: `0.7 × semantic + 0.3 × keyword`
- **Knowledge graph visualization** — D3 force graph from `[[WikiLinks]]`, stored in `wiki/.graph.json`
- **Multi-user auth** — NextAuth.js with GitHub OAuth or magic link
- **RBAC** — Viewer/Contributor/Editor/Admin roles per vault
- **Slack integration** — `/kb ask`, `/kb ingest`, daily digest bot, `:kb:` emoji auto-ingest

### P2 — Agent-Native APIs
- **OpenAI-compatible chat completion endpoint** — works with LangChain, AutoGen, CrewAI, Cursor
- **Schema-guided compilation** — `wiki/schema.md` as system prompt instructs how wiki evolves its own conventions
- **GitHub Actions integration** — auto-ingest on merged PR, closed issue, pushed docs

### P3 — Enterprise Infrastructure
- **Docker deployment** with separate watcher container
- **Knowledge freshness scoring** — `🟢 Fresh / 🟡 Aging / 🔴 Stale` badges per page
- **Cost & usage analytics dashboard** — queries/day, token costs, cache hit rate, per-user attribution
- **SSO/SAML** — Okta, Azure AD, Google Workspace

## Architecture Target

Three-layer design: INGEST (raw docs, webhooks, GitHub, Slack, Notion) → COMPILE (LLM builds wiki, updates cross-references, schema-guided) → QUERY (semantic + keyword, OpenAI-compat API, MCP tools, CLI). Storage: `raw/` (immutable), `wiki/` (compiled), `logs/` (audit JSONL), `embeddings/` (SQLite vectors).

## Related Pages

- [[concepts/enterprise-ai-governance]]
- [[concepts/llm-wiki-compile-pipeline]]
- [[concepts/multi-tenancy]]
- [[patterns/pattern-llm-wiki]]
- [[entities/andrej-karpathy]]
