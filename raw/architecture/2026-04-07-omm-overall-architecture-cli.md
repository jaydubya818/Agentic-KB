---
id: 01KNNVX2RHTSY6KGBA7AHQY66C
title: "Architecture: overall-architecture/cli"
source: oh-my-mermaid
ingested: 2026-04-08T05:01:57Z
tags: [architecture, mermaid, autogen]
omm_perspective: "overall-architecture/cli"
---

# overall-architecture/cli

Single-file Node CLI at cli/kb.js. Thin client over the web API — all real work happens in the Next.js routes. Commands: compile, lint, ingest-youtube, ingest-twitter, query, search. SSE-streaming commands parse events via fetch + ReadableStream reader.

## Diagram

```mermaid
flowchart LR
    compile-cmd[kb compile] -->|SSE| compile-api[/api/compile/]
    lint-cmd[kb lint] -->|POST| lint-api[/api/lint/]
    query-cmd[kb query] -->|SSE| query-api[/api/query/]
    youtube-cmd[kb ingest-youtube] -->|yt-dlp + parse| raw-dir[(raw/transcripts/)]
    twitter-cmd[kb ingest-twitter] -->|unzip + parse| raw-tw[(raw/twitter/)]
    search-cmd[kb search] -->|GET| search-api[/api/search/]
```

