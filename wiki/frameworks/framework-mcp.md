---
id: 01KNNVX2QV90ZZJ9M1QDGRT6Z3
title: Model Context Protocol (MCP)
type: framework
vendor: Anthropic
version: "1.x (2025)"
language: any
license: open-source
github: "https://github.com/modelcontextprotocol/typescript-sdk"
tags: [mcp, anthropic, tool-use, agentic, extensibility, integration]
last_checked: 2026-04-04
jay_experience: moderate
---

## Overview

Model Context Protocol (MCP) is an open protocol from Anthropic that standardizes how AI agents connect to external tools, data sources, and services. Instead of each agent framework inventing its own plugin API, MCP defines a universal client/server interface: you write an MCP server once and any MCP-compatible host (Claude Code, Claude Desktop, OpenClaw, custom harnesses) can use its tools.

MCP is to AI agents what REST was to web services — a shared contract that decouples the consumer (the model/agent) from the provider (the tool implementation).

---

## Core Concepts

### What an MCP Server Can Expose

| Capability | Description | Example |
|------------|-------------|---------|
| **Tools** | Callable functions the model can invoke | `search_docs`, `query_database` |
| **Resources** | File/data sources the model can read | `project://schema.sql`, `config://env` |
| **Prompts** | Reusable prompt templates | `explain-error`, `write-test` |

Most production MCP servers focus on **tools** — the callable function interface is the most broadly useful capability and maps directly to Claude's tool-use format.

### Protocol Mechanics
MCP uses JSON-RPC 2.0 over stdio (for local servers) or HTTP+SSE (for remote servers). The flow:

1. Host (Claude Code) starts the MCP server as a subprocess or connects to its HTTP endpoint
2. Host calls `tools/list` to discover available tools
3. Host includes tools in model requests (auto-injected by Claude Code)
4. Model returns `tool_use` blocks targeting MCP tools
5. Host routes the call to the MCP server via `tools/call`
6. Server returns results; host injects as `tool_result`
7. Loop continues until model stops calling tools

Tool names in Claude Code are prefixed: `mcp__<server-name>__<tool-name>`.

### Trust Model
MCP servers run as separate processes with their own credentials and capabilities. Trust is not transitive:
- **Registered servers are trusted** to their stated capability scope — but the model can be tricked into calling them with malicious inputs (prompt injection risk)
- **Principle of least privilege**: expose only tools the agent actually needs
- **Stdio servers** are more trusted (local process, same user) than HTTP servers (network-exposed, potentially remote)
- **User confirmation** can be required per-tool via Claude Code's permission system

Security risk: a tool that reads arbitrary files + a tool that posts to the internet = an exfiltration vector. Scope tools tightly.

---

## Architecture

```
Claude Code (MCP Host)
    │
    ├── mcp_servers.json registration
    │   └── { name, command/url, args, env }
    │
    ├── On session start:
    │   └── spawn server subprocess / connect to HTTP endpoint
    │   └── call tools/list → get tool schemas
    │   └── inject tools into model's tool array
    │
    └── On model tool_use:
        └── route to mcp__<server>__<tool> → JSON-RPC call/call
        └── return tool_result to model
```

### Registration in Claude Code
Register MCP servers in `~/.claude/mcp_servers.json` (global) or `.claude/mcp_servers.json` (project-level):

```json
{
  "mcpServers": {
    "my-kb": {
      "command": "node",
      "args": ["/Users/jaywest/My LLM Wiki/packages/mcp/dist/index.js"],
      "env": { "KB_PATH": "/Users/jaywest/Agentic-KB" }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "exa": {
      "command": "npx",
      "args": ["-y", "exa-mcp-server"],
      "env": { "EXA_API_KEY": "${EXA_API_KEY}" }
    }
  }
}
```

---

## Strengths

- **Write once, use everywhere**: one MCP server works with Claude Code, Claude Desktop, OpenClaw, and any future MCP-compatible host
- **Separation of concerns**: tool implementation is decoupled from the agent; update the server without changing agent prompts
- **Rich ecosystem**: growing library of pre-built servers (Figma, context7, firecrawl, exa, Postgres, filesystem, GitHub, etc.)
- **Resources capability**: MCP resources give agents a structured way to read external data without arbitrary file access
- **Prompted templates**: standardized prompt sharing across teams and tools

---

## Weaknesses

- **Overhead**: each MCP call is a round-trip IPC or HTTP request — adds latency vs. native tool execution
- **Debugging**: failures in MCP servers are opaque from the model's perspective; need separate server logs
- **Versioning complexity**: server API changes can silently break agent behavior
- **Security surface**: each server is an attack surface; malicious tool results can contain prompt injections
- **stdio limitation**: local stdio servers aren't horizontally scalable; HTTP servers add deployment complexity

---

## Minimal Working Examples

### TypeScript MCP Server (2 tools)

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { readFileSync, readdirSync } from "fs"
import { join } from "path"

const KB_PATH = process.env.KB_PATH ?? "/Users/jaywest/Agentic-KB"

const server = new Server(
  { name: "agentic-kb", version: "1.0.0" },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_wiki",
      description: "Search the Agentic KB wiki for pages matching a query",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search term" }
        },
        required: ["query"]
      }
    },
    {
      name: "read_wiki_page",
      description: "Read the full content of a specific wiki page by path",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative path from wiki/ e.g. frameworks/framework-gsd.md" }
        },
        required: ["path"]
      }
    }
  ]
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  if (name === "search_wiki") {
    const query = (args as { query: string }).query.toLowerCase()
    const results: string[] = []
    // Simple grep-style search across wiki/
    function walk(dir: string) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (entry.name.endsWith(".md")) {
          const content = readFileSync(full, "utf-8")
          if (content.toLowerCase().includes(query)) {
            results.push(full.replace(KB_PATH + "/wiki/", ""))
          }
        }
      }
    }
    walk(join(KB_PATH, "wiki"))
    return { content: [{ type: "text", text: results.join("\n") || "No results found" }] }
  }

  if (name === "read_wiki_page") {
    const pagePath = (args as { path: string }).path
    const full = join(KB_PATH, "wiki", pagePath)
    const content = readFileSync(full, "utf-8")
    return { content: [{ type: "text", text: content }] }
  }

  throw new Error(`Unknown tool: ${name}`)
})

const transport = new StdioServerTransport()
await server.connect(transport)
```

### Python MCP Server (minimal)

```python
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import json, subprocess

app = Server("shell-tools")

@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="run_tests",
            description="Run the project test suite and return results",
            inputSchema={"type": "object", "properties": {}, "required": []}
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "run_tests":
        result = subprocess.run(["npm", "test"], capture_output=True, text=True, timeout=120)
        output = result.stdout + result.stderr
        return [TextContent(type="text", text=output)]
    raise ValueError(f"Unknown tool: {name}")

async def main():
    async with stdio_server() as (read, write):
        await app.run(read, write, app.create_initialization_options())

import asyncio
asyncio.run(main())
```

---

## Ecosystem — Known MCP Servers

| Server | Function | Install |
|--------|----------|---------|
| **Figma MCP** | Read Figma designs, write back, Code Connect | claude.ai Figma integration |
| **context7** | Library documentation lookup (resolves `use context7`) | `npx @upstash/context7-mcp` |
| **firecrawl** | Web scraping and crawling with structured output | `npx firecrawl-mcp` |
| **exa** | Semantic web search | `npx exa-mcp-server` |
| **filesystem** | Scoped file read/write for specific directories | `npx @modelcontextprotocol/server-filesystem` |
| **GitHub** | Issues, PRs, repo operations | `npx @modelcontextprotocol/server-github` |
| **Postgres** | Query databases, inspect schemas | `npx @modelcontextprotocol/server-postgres` |
| **Jay's LLM Wiki** | This KB as a tool (`search_wiki`, `read_wiki_page`) | Local — `packages/mcp` |

---

## MCP vs Direct Tool Use

| Dimension | MCP Server | Native Claude Code Tool |
|-----------|-----------|------------------------|
| Portability | Any MCP host | Claude Code only |
| Setup | Server process + registration | Hook or built-in |
| Latency | IPC/HTTP overhead | Near-zero |
| Debugging | Separate server logs | Inline with session |
| Sharing | Easy (publish as npm package) | Hard (copy hooks) |
| Security | Isolated process | Same process as CC |

**Use MCP when**: you want the tool available across multiple agents/hosts, or the tool is complex enough to warrant its own process (DB connections, browser sessions, external APIs).

**Use native Claude Code hooks when**: the automation is simple, performance-critical, or tightly coupled to Claude Code's internal state.

---

## Integration Points

- **[[frameworks/framework-claude-code]]**: MCP servers are consumed by Claude Code; tools appear in the model's tool array automatically
- **[[frameworks/framework-claude-api]]**: Tool call format from MCP is identical to the raw API tool format; MCP is just a delivery mechanism
- **[[entities/mcp-ecosystem]]**: Catalog of available MCP servers
- **[[entities/anthropic]]**: Anthropic owns the MCP specification and reference implementations
- **[[recipes/recipe-mcp-server]]**: Step-by-step guide to writing and registering a custom MCP server

---

## Jay's Experience

Jay runs several MCP servers including his LLM Wiki KB server (exposes this knowledge base as tools) and Figma MCP for design-to-code work. Key findings:

1. **stdio servers are simpler to debug**: process logs go to stderr, visible in Claude Code's output. HTTP servers need separate infrastructure.
2. **Tool descriptions are load-bearing**: the model's tool selection depends heavily on the `description` field — write it like documentation, not like a function signature.
3. **Namespace your tools**: `mcp__server__toolname` is verbose but collision-free. If a server exposes tools with names that clash with built-in Claude Code tools, the MCP version wins.
4. **Security first**: Jay's KB server is read-only; the MCP server never writes to the wiki (that's Claude Code's job). Principle of least privilege.

---

## Version Notes

- MCP 1.x: stable JSON-RPC 2.0 over stdio; HTTP+SSE transport available but less common in local setups
- TypeScript SDK: `@modelcontextprotocol/sdk` — check npm for latest
- Python SDK: `mcp` package on PyPI

---

## Sources

- Jay's `~/.claude/settings.json` (MCP permissions)
- Jay's `/Users/jaywest/My LLM Wiki/packages/mcp/` (KB MCP server)
- [[entities/mcp-ecosystem]]
- [[entities/anthropic]]
- [[recipes/recipe-mcp-server]]
