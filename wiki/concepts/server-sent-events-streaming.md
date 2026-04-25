---
id: 01KQ2WW0TYEGB1W92BVJX29B6G
title: "Server-Sent Events (SSE) for AI Streaming"
type: concept
tags: [streaming, web-ui, architecture, patterns, workflow]
created: 2026-04-08
updated: 2026-04-25
visibility: public
confidence: high
source: architecture/2026-04-07-omm-overall-architecture-web-ui.md
related: [concepts/oh-my-mermaid-web-ui.md, concepts/llm-wiki-compile-pipeline.md, concepts/agent-observability.md]
---

# Server-Sent Events (SSE) for AI Streaming

## Definition

**Server-Sent Events (SSE)** is a browser-native HTTP streaming protocol where the server pushes a continuous stream of text events to a connected client over a single long-lived HTTP connection. Unlike WebSockets, SSE is unidirectional (server → client) and works natively with standard HTTP/1.1.

In the context of oh-my-mermaid, SSE is the primary mechanism for delivering real-time AI output — compile logs and query responses — from backend API routes to the browser UI.

## Why It Matters

LLM responses and compilation pipelines are inherently long-running and produce output incrementally. SSE allows the UI to render tokens or log lines as they arrive rather than waiting for a full response, which dramatically improves perceived responsiveness and lets users monitor progress in real time.

## Example: oh-my-mermaid

Two components in oh-my-mermaid use SSE:

### CompilePanel → `/api/compile`

`CompilePanel` opens an SSE connection to `/api/compile` and renders each incoming event as a new line in a terminal-style log. This gives users live visibility into the compilation process as the AI generates or updates wiki pages.

### QueryUI → `/api/query`

`QueryUI` streams AI query responses from `/api/query` via SSE. The chat interface receives token-by-token (or chunk-by-chunk) output and appends it to the displayed message, mimicking the streaming experience common in modern LLM chat interfaces.

## When to Use

- When the server produces output incrementally (token streaming, log lines, progress updates)
- When communication is **one-directional**: server pushes, client only reads
- When you want simplicity over WebSockets — SSE reconnects automatically and works over standard HTTP
- When building terminal-style log views or streaming chat UIs

## Trade-offs

| Advantage | Limitation |
|---|---|
| Native browser support (`EventSource` API) | Server → client only; no client push |
| Auto-reconnects on disconnect | Single HTTP connection held open per stream |
| Works over standard HTTP/1.1 | Not ideal for bidirectional protocols |
| Simple server implementation | Can exhaust connections under high concurrency |

## See Also

- [oh-my-mermaid Web UI Architecture](concepts/oh-my-mermaid-web-ui.md) — where SSE is used in the application
- [LLM Wiki Compile Pipeline](concepts/llm-wiki-compile-pipeline.md) — the backend process streamed via `/api/compile`
- [Agent Observability](concepts/agent-observability.md) — SSE-based log streaming is a lightweight observability pattern
