# Agentic Engineering Knowledge Base

> Jay West | Built: 2026-04-04 | Maintained by LLM + Human

A personal knowledge base for agentic AI engineering — 83+ articles covering concepts, patterns, frameworks, entities, recipes, and evaluations. Queryable via a Wikipedia-style web UI, CLI, and MCP server.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Web UI](#web-ui)
- [CLI](#cli)
- [MCP Server](#mcp-server)
- [Private Wiki / PIN System](#private-wiki--pin-system)
- [Multi-Vault Support](#multi-vault-support)
- [Live Reload](#live-reload)
- [Ingest Workflow](#ingest-workflow)
- [Knowledge Base Structure](#knowledge-base-structure)
- [Architecture](#architecture)

---

## Quick Start

```bash
# 1. Start the web UI
cd /Users/jaywest/Agentic-KB/web
npm run dev
# → http://localhost:3000/wiki

# 2. Use the CLI
kb search "multi-agent orchestration"
kb query "What is the best pattern for a supervisor-worker system?"
kb read concepts/tool-use

# 3. Use via Claude Desktop MCP
# Tools: search_wiki, read_article, read_index, list_articles, query_wiki
```

---

## Web UI

Full Wikipedia-style knowledge base browser at `http://localhost:3000`.

### Features

- **Wiki index** — structured master index with sections, tables, article counts
- **Article pages** — Wikipedia-style layout with infobox, table of contents, backlinks
- **Search** — instant debounced search with scope filtering (public / private / all)
- **Ask AI (WikiQuery)** — SSE-streamed AI answers synthesized from relevant wiki articles, with citations
- **Vault switcher** — switch between any Obsidian vault from the top bar; article counts per vault shown in dropdown
- **Vault-aware breadcrumbs** — breadcrumb trail auto-built from folder path (e.g. `VaultName → folder → subfolder`)
- **Open in Obsidian** — every article has a purple button that fires `obsidian://open?vault=…&file=…` to jump directly to the note in Obsidian
- **Live reload** — edit a note in Obsidian, wiki auto-refreshes in the browser within ~1 second (no Cmd+R needed)
- **Private mode** — 🔒 button in top bar; enter PIN to unlock private articles in search and browsing
- **Process queue** — ingest raw material files through an AI processing pipeline
- **Add Material** — paste/upload raw content directly from the browser

### Pages

| Route | Description |
|-------|-------------|
| `/wiki` | Main index (Agentic KB structured view or generic vault browser) |
| `/wiki/[slug]` | Individual article |
| `/search` | Full search results page |
| `/query` | AI WikiQuery interface |
| `/process` | Pending raw material queue |
| `/ingest` | Paste/upload raw material |

---

## CLI

Install once (symlink already set up):

```bash
# Already linked to /usr/local/bin/kb
kb --help
```

### Commands

```bash
# Search public articles
kb search "tool use patterns"

# Search private articles (requires PRIVATE_PIN env var)
kb search "my stack" --scope private
kb search "everything" --scope all --limit 20

# Ask a natural language question (streams answer)
kb query "What is the ReAct pattern and when should I use it?"
kb query "What's my preferred framework?" --scope private

# Read a full article
kb read concepts/tool-use
kb read patterns/pattern-supervisor-worker

# List all articles in a section
kb list concepts
kb list personal

# Check pending ingestion queue
kb pending
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `KB_API_URL` | `http://localhost:3000` | Web server base URL |
| `PRIVATE_PIN` | _(empty)_ | PIN for private content access |

Set in `~/.zshrc`:
```bash
export KB_API_URL=http://localhost:3000
export PRIVATE_PIN=1124
```

---

## MCP Server

Exposes the KB as MCP tools for Claude Desktop and any MCP-compatible agent.

### Configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "agentic-kb": {
      "command": "node",
      "args": ["/Users/jaywest/Agentic-KB/mcp/server.js"],
      "env": {
        "KB_API_URL": "http://localhost:3000",
        "PRIVATE_PIN": "1124"
      }
    }
  }
}
```

> **Note:** Restart Claude Desktop after changing this config for env vars to take effect.

### Tools

| Tool | Description |
|------|-------------|
| `search_wiki` | Search articles. Supports `scope` (public/private/all) and `pin` for private access |
| `read_article` | Read full article by slug. Requires `pin` for private articles |
| `read_index` | Read the master wiki index |
| `list_articles` | List all articles in a section |
| `query_wiki` | Ask a natural language question — AI synthesizes answer from relevant articles. Supports `scope` and `pin` |

### Usage Examples

```
search_wiki(query: "supervisor worker pattern", scope: "public")
search_wiki(query: "my stack", scope: "private", pin: "1124")
read_article(slug: "concepts/tool-use")
read_article(slug: "personal/my-notes", pin: "1124")
query_wiki(question: "What is the best pattern for parallel tool execution?")
query_wiki(question: "What frameworks do I prefer?", scope: "all", pin: "1124")
```

---

## Private Wiki / PIN System

Private articles have `visibility: private` in their frontmatter (or live in `wiki/personal/`). They are hidden from all public searches and require a PIN to access.

### How it works

| Surface | How to unlock |
|---------|--------------|
| **Web UI** | Click 🔒 in top bar → enter PIN → private articles appear in search |
| **CLI** | Set `PRIVATE_PIN=1124` env var (auto-used) or pass `--pin 1124` |
| **MCP** | Pass `pin: "1124"` parameter to any tool with `scope: "private"` or `scope: "all"` |
| **API** | `?scope=private&pin=1124` query param or `x-private-pin: 1124` header |

### Marking an article private

Add to frontmatter:
```yaml
---
title: My Private Note
visibility: private
---
```

Or place in `wiki/personal/` — that directory is always treated as private.

### Setting your PIN

**Web server** — in `web/.env.local`:
```
PRIVATE_PIN=1124
```

**MCP + CLI** — in `claude_desktop_config.json` env and `~/.zshrc`:
```bash
export PRIVATE_PIN=1124
```

---

## Multi-Vault Support

The web UI supports switching between any Obsidian vault registered in `~/Library/Application Support/obsidian/obsidian.json`.

### Vault switcher features

- **Dropdown** in top bar shows all registered vaults with file counts (e.g. `Agentic-KB [83]`)
- **Active vault stored** in an `active_vault_path` cookie (1 year, readable by client)
- **Auto-detects content root** — uses `vault/wiki/` subdirectory if present, otherwise vault root
- **Generic vault index** — rich Wikipedia-style browser for any vault:
  - Stats bar (note count, folder count, last-modified timestamp)
  - **Recently Modified** panel — top 10 notes with relative time chips
  - **2-column section grid** — each folder becomes a card with count badge and note list
  - **Tag cloud** — auto-built from frontmatter tags, font-size scales with frequency
  - Inline 🔒 / ✦ badges on private and vault articles
- **Vault-aware search and AI query** — all surfaces respect the active vault cookie
- **Vault-aware sidebar** — sidebar regenerates from the new vault's structure on switch

---

## Live Reload

Edit a markdown file in Obsidian → wiki updates in the browser automatically (~1 second delay, no Cmd+R needed).

**How it works:**

1. `GET /api/vault-watch` opens an SSE connection and starts `fs.watch(vaultRoot, {recursive: true})`
2. Any `.md` file change fires a `{type: "change"}` SSE event
3. `VaultWatcher` client component debounces 600ms (handles Obsidian's burst-save behavior) then calls `router.refresh()`
4. Next.js re-fetches only the server components — no full page reload
5. Connection auto-reconnects after 3s if dropped

---

## Ingest Workflow

### Via browser

1. Go to `http://localhost:3000/ingest`
2. Paste raw text or upload a file
3. The AI processes it, extracts key knowledge, and writes a structured wiki article
4. View the queue at `http://localhost:3000/process`

### Via CLI (raw file drop)

1. Drop file into `raw/` subdirectory (`papers/`, `transcripts/`, `framework-docs/`, `note/`, etc.)
2. Check queue: `kb pending`
3. Process via browser at `/process` or trigger: `curl -X POST http://localhost:3000/api/process/run-all`

### Raw source directories

| Directory | Contents |
|-----------|----------|
| `raw/papers/` | PDFs and papers |
| `raw/transcripts/` | Video/podcast transcripts |
| `raw/framework-docs/` | Framework documentation |
| `raw/note/` | Quick notes and thoughts |
| `raw/code-examples/` | Annotated code patterns |
| `raw/conversations/` | Notable Claude sessions |
| `raw/changelogs/` | Framework version notes |
| `raw/my-agents/` | Agent definitions |
| `raw/my-skills/` | Skill files |

---

## Knowledge Base Structure

```
Agentic-KB/
├── wiki/
│   ├── index.md          # Master catalog
│   ├── hot.md            # Hot cache (read first for common queries)
│   ├── log.md            # Operation audit log
│   ├── concepts/         # Universal agentic concepts (20)
│   ├── patterns/         # Reusable design patterns (15)
│   ├── frameworks/       # Tool/framework reference (11)
│   ├── entities/         # People, companies, models (8)
│   ├── recipes/          # Copy-paste how-to guides (8)
│   ├── evaluations/      # Framework comparisons (2)
│   ├── summaries/        # Per-source summaries (16)
│   ├── syntheses/        # Cross-source synthesis articles (1)
│   └── personal/         # Jay's patterns & philosophy (private)
├── raw/                  # Unprocessed source material
├── web/                  # Next.js 16 web application
│   ├── src/app/          # App Router pages + API routes
│   ├── src/components/   # React components
│   └── src/lib/          # Shared utilities (articles.ts)
├── mcp/
│   └── server.js         # MCP server (Node.js stdio)
├── cli/
│   └── kb.js             # CLI tool
└── CLAUDE.md             # Schema, workflows, agent instructions
```

### Article frontmatter schema

```yaml
---
title: Article Title
type: concept | pattern | framework | entity | recipe | evaluation | personal
tags: [tag1, tag2]
confidence: high | medium | low
visibility: public | private     # default: public
vault: true | false              # marks highest-value articles
created: YYYY-MM-DD
updated: YYYY-MM-DD
description: One-line summary
---
```

---

## Architecture

```
Browser
  │
  ├── /wiki/*           Next.js App Router (force-dynamic, SSR)
  │     └── reads .md files directly via fs (no DB)
  │
  ├── /api/search       Full-text search across vault markdown files
  ├── /api/query        SSE-streamed AI answer synthesis (Anthropic SDK)
  ├── /api/vaults       Reads obsidian.json → vault list with file counts
  ├── /api/switch-vault Sets active_vault_path cookie
  ├── /api/vault-structure Recursive folder walker for sidebar
  ├── /api/vault-watch  SSE file watcher (fs.watch) for live reload
  └── /api/process      Raw material ingestion pipeline

CLI (kb.js)
  └── HTTP → web API (search, query)
  └── Direct fs reads (read, list)

MCP Server (server.js)
  └── Direct fs reads for search/read (no HTTP roundtrip)
  └── HTTP → /api/query for AI synthesis
```

### Key design decisions

- **No database** — all content is markdown files read directly with `fs.readFileSync`. Every page request reads fresh from disk. `force-dynamic` on all routes.
- **Cookie-based vault selection** — `active_vault_path` cookie propagates through server components via Next.js `cookies()` API
- **PIN auth is server-enforced** — `PRIVATE_PIN` env var read server-side only; never exposed to client
- **MCP is filesystem-first** — search and read go direct to disk (fast); only `query_wiki` calls the API for Anthropic synthesis

---

## Graph View Colors (Obsidian)

| Color | Type |
|-------|------|
| 🟢 Green | Concepts |
| 🟠 Orange | Patterns |
| 🔵 Blue | Frameworks |
| 🔴 Red | Entities |
| 🟤 Brown | Recipes |
| 🟣 Purple | Evaluations |
