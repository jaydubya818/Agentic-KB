---
id: 01KNNVX2RHX1W10NWSPRHW2RPS
title: "Architecture: overall-architecture"
source: oh-my-mermaid
ingested: 2026-04-08T05:01:57Z
tags: [architecture, mermaid, autogen]
omm_perspective: "overall-architecture"
---

# overall-architecture

Agentic-KB is a Karpathy-pattern "LLM Wiki" knowledge base. Raw markdown (raw/) is compiled by Claude into a structured, persistent wiki (wiki/). Not RAG — the compile step is deliberate and auditable. Three entry points: Next.js web app (web/), CLI (cli/kb.js), and MCP server (mcp/server.js). Hybrid search combines keyword scanning with graph traversal over graphify's knowledge graph. Namespace-level RBAC, temporal decay + hotness ranking, append-only audit log, and scheduled lint round out the enterprise surface.

## Diagram

```mermaid
flowchart TB
    subgraph Clients
        web-ui[Web UI<br/>Next.js :3002]
        cli[kb CLI]
        mcp-server[MCP Server]
        github-actions[GitHub Actions]
    end

    api-routes[API Routes]

    subgraph Vault
        raw[(raw/)]
        wiki[(wiki/)]
        graph[(graphify-out)]
        audit-log[(logs/audit.log)]
    end

    web-ui -->|calls| api-routes
    cli -->|calls| api-routes
    mcp-server -->|calls| api-routes
    github-actions -->|webhook| api-routes

    api-routes -->|reads/writes| raw
    api-routes -->|reads/writes| wiki
    api-routes -->|reads| graph
    api-routes -->|appends| audit-log
```

