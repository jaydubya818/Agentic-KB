---
title: "ADR-001: Defer MCP SDK Server → McpServer migration"
type: decision
date: 2026-04-25
status: deferred
author: jay
tags: [mcp, sdk, deprecation, tech-debt]
reviewed: false
reviewed_date: ""
confidence: high
---

# ADR-001 — Defer MCP SDK `Server` → `McpServer` Migration

## Status
**Deferred** — tracked, not blocking. Re-open when SDK 2.x lands or any tool breaks.

## Context

`mcp/server.js` (1,148 lines, 30+ tool handlers) imports the deprecated
`Server` class from `@modelcontextprotocol/sdk/server/index.js`. TypeScript
diagnostic flags it (`6385: deprecated`). The replacement is `McpServer` from
`@modelcontextprotocol/sdk/server/mcp.js`, with a different API:

```js
// Old (deprecated)
const server = new Server({ name, version }, { capabilities: { tools: {} } })
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [...] }))
server.setRequestHandler(CallToolRequestSchema, async (req) => { /* dispatch */ })

// New
const server = new McpServer({ name, version })
server.registerTool('foo', { description, inputSchema }, async (args) => ({...}))
```

## Decision

Defer the migration. Three reasons:

1. **No regression coverage.** `mcp/server.js` has zero integration tests. A
   1,148-line rewrite without tests is a recipe for silent breakage of any
   of the 30 tools (`load_agent_context`, `close_agent_task`, `promote_learning`,
   etc.) and the consumers (Claude Desktop, this Claude session).
2. **Currently functional.** Deprecation is a compile-time warning, not a
   runtime error. SDK 1.x will keep `Server` working through the 1.x line per
   semver convention.
3. **Scope mismatch.** Done correctly, this is a 1–2 hour focused task with
   manual smoke testing per tool in Claude Desktop. Doing it inside a 7-item
   batch is rushed.

## Migration plan (when re-opened)

1. Add a smoke test harness that boots the MCP server, sends one
   ListTools and one CallTool request per tool over stdio, asserts the
   shape of the response matches the current behavior. Land this BEFORE
   the rewrite. Pin baseline behavior.
2. Extract the `if (name === '...') { ... }` dispatch table in
   `setRequestHandler(CallToolRequestSchema, ...)` into a `TOOLS` registry
   array: `{ name, description, inputSchema, handler }`. No behavior change.
3. Swap `Server` → `McpServer`. Replace the two `setRequestHandler` calls
   with `for (const t of TOOLS) server.registerTool(t.name, { description: t.description, inputSchema: t.inputSchema }, t.handler)`.
4. Re-run smoke harness. Diff response shapes. Fix.
5. Manual smoke from Claude Desktop on the 5 most-used tools:
   `search_wiki`, `read_article`, `load_agent_context`, `close_agent_task`,
   `publish_bus_item`.
6. Remove deprecated imports.

## Consequences

- **Pro:** Zero risk to current MCP consumers in this batch.
- **Pro:** Forces pre-rewrite smoke harness, which is good infra anyway.
- **Con:** Deprecation warning persists in TS diagnostics until done.
- **Con:** SDK 2.x will remove `Server`. Must complete before then. Add to
  watch list: any minor SDK version bump triggers a re-evaluation.

## Trigger to re-open

Any of:
- `@modelcontextprotocol/sdk` releases a 2.x major
- Any tool starts misbehaving in Claude Desktop
- Free time block of ≥2 hours with deliberate focus

## Related

- `mcp/server.js`
- `[[wiki/concepts/mcp-ecosystem]]`
- Diagnostics: `Line 14:10` and `Line 135:20`, code `6385`
