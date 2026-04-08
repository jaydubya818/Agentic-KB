---
id: 01KNNVX2RHB0GJQMNP0S15YW6C
title: "Architecture: overall-architecture/mcp-server"
source: oh-my-mermaid
ingested: 2026-04-08T05:01:57Z
tags: [architecture, mermaid, autogen]
omm_perspective: "overall-architecture/mcp-server"
---

# overall-architecture/mcp-server

Model Context Protocol server at mcp/server.js. Exposes 7 tools so Claude (or any MCP client) can directly interact with the KB: query_wiki, ingest_raw, search_wiki, list_articles, read_article, compile_wiki, lint_wiki. Each tool is a thin wrapper over the corresponding /api/ route.

## Diagram

```mermaid
flowchart LR
    mcp-client[MCP client<br/>Claude] -->|JSON-RPC| server[server.js]
    server -->|routes| query-wiki[query_wiki]
    server -->|routes| ingest-raw[ingest_raw]
    server -->|routes| search-wiki[search_wiki]
    server -->|routes| list-articles[list_articles]
    server -->|routes| read-article[read_article]
    server -->|routes| compile-wiki[compile_wiki]
    server -->|routes| lint-wiki[lint_wiki]
    query-wiki -->|POST| query-api[/api/query/]
    compile-wiki -->|POST| compile-api[/api/compile/]
```

