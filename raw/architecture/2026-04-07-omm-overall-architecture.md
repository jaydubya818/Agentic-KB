---
title: "Architecture: overall-architecture"
source: oh-my-mermaid
ingested: 2026-04-08T04:40:14Z
tags: [architecture, mermaid, autogen]
omm_perspective: "overall-architecture"
---

# overall-architecture

Agentic-KB is a Karpathy-pattern "LLM Wiki" knowledge base. Raw markdown (raw/) is compiled by Claude into a structured, persistent wiki (wiki/). Not RAG — the compile step is deliberate and auditable. Three entry points: Next.js web app (web/), CLI (cli/kb.js), and MCP server (mcp/server.js). Hybrid search combines keyword scanning with graph traversal over graphify's knowledge graph. Namespace-level RBAC, temporal decay + hotness ranking, append-only audit log, and scheduled lint round out the enterprise surface.

## Diagram

```mermaid
graph TB
    subgraph Clients
        WEB[Web UI<br/>Next.js :3002]
        CLI[kb CLI<br/>cli/kb.js]
        MCP[MCP Server<br/>mcp/server.js]
        GH[GitHub Actions<br/>kb-ingest.yml]
    end

    subgraph API["Next.js API routes"]
        COMPILE[/api/compile<br/>SSE stream/]
        QUERY[/api/query<br/>Claude synthesis/]
        SEARCH[/api/search<br/>hybrid/]
        INGEST[/api/ingest<br/>direct/]
        WEBHOOK[/api/ingest/webhook<br/>RBAC/]
        LINT[/api/lint<br/>health check/]
    end

    subgraph Vault["Agentic-KB vault"]
        RAW[(raw/<br/>source docs)]
        WIKI[(wiki/<br/>compiled pages)]
        GRAPH[(graphify-out/<br/>graph.json)]
        AUDIT[(logs/<br/>audit.log)]
    end

    WEB --> COMPILE & QUERY & SEARCH & LINT
    CLI --> COMPILE & QUERY & INGEST & LINT
    MCP --> QUERY & SEARCH & COMPILE & LINT
    GH --> WEBHOOK

    INGEST & WEBHOOK --> RAW
    COMPILE --> RAW
    COMPILE --> WIKI
    QUERY --> WIKI
    SEARCH --> WIKI
    SEARCH --> GRAPH
    QUERY & INGEST & WEBHOOK & COMPILE & LINT --> AUDIT
```

