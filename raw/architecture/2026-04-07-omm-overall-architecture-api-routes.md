---
id: 01KNNVX2RGFYG5DADXVSSJZSZ0
title: "Architecture: overall-architecture/api-routes"
source: oh-my-mermaid
ingested: 2026-04-08T05:01:57Z
tags: [architecture, mermaid, autogen]
omm_perspective: "overall-architecture/api-routes"
---

# overall-architecture/api-routes

Next.js API routes under web/src/app/api/. The actual logic of the system lives here — the UI, CLI, and MCP server are all thin clients. Key routes: compile (SSE streaming Claude), query (hybrid retrieval + Claude synthesis), search (keyword + graph), ingest/webhook (RBAC-gated), lint (wiki health check). All writes pass through audit.ts.

## Diagram

```mermaid
flowchart TB
    compile[compile] -->|reads| raw[(raw/)]
    compile -->|writes| wiki[(wiki/)]
    query -->|reads| wiki
    query -->|ranks via| ranking-lib[ranking.ts]
    search -->|keyword| wiki
    search -->|graph| graph-search[graph-search.ts]
    ingest -->|writes| raw
    webhook -->|RBAC| rbac-lib[rbac.ts]
    webhook -->|writes| raw
    lint -->|analyzes| wiki
    compile & query & search & ingest & webhook & lint -->|appends| audit[audit.ts]
```

