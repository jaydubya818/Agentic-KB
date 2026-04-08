---
id: 01KNNVX2RHFRPG3W40Z4D3QFWF
title: "Architecture: overall-architecture/web-ui"
source: oh-my-mermaid
ingested: 2026-04-08T05:01:57Z
tags: [architecture, mermaid, autogen]
omm_perspective: "overall-architecture/web-ui"
---

# overall-architecture/web-ui

Next.js 14 app at web/. Server-rendered wiki browser with client-side compile/query panels. Three main routes: /wiki (article browser with sidebar + TOC), /query (Ask AI chat UI), /ingest (upload material). WikiSidebar loads its tree from /api/vault-structure. CompilePanel streams SSE from /api/compile and renders a terminal-style log.

## Diagram

```mermaid
flowchart LR
    wiki-page[/wiki page/] -->|renders| wiki-layout[WikiLayout]
    query-page[/query page/] -->|renders| query-ui[QueryUI]
    ingest-page[/ingest page/] -->|renders| ingest-ui[IngestUI]
    wiki-layout -->|uses| wiki-sidebar[WikiSidebar]
    wiki-layout -->|uses| article-renderer[ArticleRenderer]
    wiki-layout -->|uses| compile-panel[CompilePanel]
    wiki-sidebar -->|fetches| vault-api[/api/vault-structure/]
    compile-panel -->|SSE| compile-api[/api/compile/]
    query-ui -->|SSE| query-api[/api/query/]
```

