---
repo_name: "Agentic-KB"
repo_visibility: public
source_type: github
branch: main
commit_sha: a7d8ad0fa13c26cd8b0666fe354f6ee89d890d6a
source_path: README.md
imported_at: "2026-04-09T18:58:37.361Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Agentic-KB/main/README.md"
---

# Agentic Engineering Knowledge Base

> Jay West | Built: 2026-04-04 | Last major update: 2026-04-09 | Maintained by LLM + Human

A personal knowledge base for agentic AI engineering — 87+ articles covering concepts, patterns, frameworks, entities, recipes, and evaluations. Queryable via a Wikipedia-style web UI, CLI, and MCP server.

Inspired by [Andrej Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy) — raw sources are **compiled** by Claude into a persistent, cross-referenced wiki. Not RAG: the compile step is deliberate, auditable, and runs incrementally over a logged state.

---

## What's New — April 9, 2026

RLM pipeline upgrade pass — stages 6–9 now live, two-step compile, auto-reindex, raw file watcher:

- 🧠 **Two-step compile pipeline** — `/api/compile` now runs two separate Claude calls per raw doc. **Call 1 (Analysis)** extracts a structured knowledge graph (entities with salience, typed relationships with evidence, key claims, candidate pages, contradictions, tags) using a pure analyst persona. **Call 2 (Generation)** feeds that JSON into the wiki curator to write page content. Improves page quality and surfaces contradictions automatically as `⚠️ Contradictions` sections. Analysis failure is non-fatal — generation still runs. SSE now emits `{type:'analysis'}` progress events per doc.
- 🔄 **Auto-reindex** — after every compile run, `reindexWiki()` walks all 9 wiki sections and updates `## Section (N)` counts in `index.md` automatically. No more stale counts.
- 🎯 **Confidence weighting** (RLM stage 6) — `ranking.ts` now reads frontmatter `confidence` field and applies a multiplier: `high → ×1.10`, `medium → ×1.00`, `low → ×0.85`. Cached per mtime. High-confidence articles rank above speculation automatically.
- 🚫 **Contradiction filtering** (RLM stage 7) — `query/route.ts` parses `wiki/lint-report.md` for flagged contradictions and deprioritizes those pages to the end of synthesis context. `sources` SSE response includes a `contradicted[]` array so the UI can warn users.
- 📦 **Token-budget packing** (RLM stage 9) — query synthesis now caps context at `MAX_CONTEXT_CHARS = 24,000`. `packArticles()` distributes budget proportionally; `extractArticleSummary()` keeps frontmatter + first 3 paragraphs when an article is over budget. No more context overflow silently truncating critical pages.
- ⚖️ **Proportional bucket allocation** — `graph-search.ts` now enforces `{direct: 60%, graph: 20%, hot: 5%, citation: 15%}` across result buckets. Graph traversal can no longer crowd out direct keyword matches. Results tagged with their bucket for debugging.
- 👁️ **Raw file watcher** — `vault-watch/route.ts` now monitors `raw/` separately and emits `{type:'raw_pending'}` SSE events when new files appear, prompting the UI to surface them in the process queue immediately.
- 📄 **CLI: `ingest-file`** — `kb ingest-file <path>` converts any file to markdown via markitdown (PDF, DOCX, PPTX, XLSX, audio, YouTube URLs), writes it to the correct `raw/` subdirectory with frontmatter, and reports word count.
- 📊 **CLI: `reindex`** — `kb reindex` updates `wiki/index.md` section counts from actual directory listings without running a full compile.

---

## What's New — April 7, 2026

Enterprise-scaling pass inspired by the Karpathy LLM-Wiki gist and patterns borrowed from [archivist-oss](https://github.com/NetworkBuild3r/archivist-oss):

- 🔐 **Namespace-level RBAC** — `X-KB-Namespace` header or Bearer-token identity resolution, per-namespace read/write ACLs, audit log now records identity. See [`web/src/lib/rbac.ts`](web/src/lib/rbac.ts) and [`namespaces.example.json`](namespaces.example.json).
- 📉 **Temporal decay + hotness ranking** — search results are now scored as `baseScore × decay(mtime) × hotness(audit hits)`. 180-day half-life, 30-day hotness window. See [`web/src/lib/ranking.ts`](web/src/lib/ranking.ts).
- 🕸️ **Graph-based semantic search** — hybrid keyword + graph traversal over graphify's `graph.json` (222 nodes, 299 links, 12 hyperedges). 1-hop traversal + hyperedge expansion. See [`web/src/lib/graph-search.ts`](web/src/lib/graph-search.ts).
- 🧠 **Karpathy compile pipeline** — `/api/compile` streams SSE progress while Claude batches raw docs into wiki pages using `wiki/schema.md` as system prompt. Incremental via `raw/.compiled-log.json`.
- 🩺 **Wiki lint + scheduled daily health check** — `/api/lint` detects contradictions, orphans, stale pages, knowledge gaps → `wiki/lint-report.md`. Runs daily at 07:00 via a scheduled task.
- 🪝 **Webhook ingest with auto-adapters** — `/api/ingest/webhook` accepts GitHub issues/PRs, Slack, and generic JSON. GitHub Actions workflow at `.github/workflows/kb-ingest.yml` auto-ingests merged PRs, closed issues, and pushed docs.
- 🎥 **YouTube + Twitter ingest CLI** — `kb ingest-youtube <url>` (yt-dlp + SRT parsing) and `kb ingest-twitter <archive.zip>` (parses the Twitter/X data export).
- 🏛️ **Interactive architecture viewer** — [oh-my-mermaid](https://github.com/oh-my-mermaid/oh-my-mermaid) integration. Clickable drill-down through 6 nested perspectives of the system. Linked from the wiki sidebar.
- 🔗 **Sidebar Tools section** — one-click jump to the architecture viewer and to Obsidian's global graph view (via Advanced URI plugin).
- 🧪 **10-stage RLM retrieval pipeline** — reference design documented in [`docs/RLM_PIPELINE.md`](docs/RLM_PIPELINE.md). Temporal decay + hotness (stages 4–5) were live; **stages 6–9 are now live as of April 9**.

See [`ENTERPRISE_PLAN.md`](ENTERPRISE_PLAN.md) for the full P0–P3 roadmap.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Web UI](#web-ui)
- [CLI](#cli)
- [MCP Server](#mcp-server)
- [Compile Pipeline (Karpathy LLM Wiki)](#compile-pipeline-karpathy-llm-wiki)
- [Enterprise Features](#enterprise-features)
  - [Namespace RBAC](#namespace-rbac)
  - [Temporal Decay + Hotness Ranking](#temporal-decay--hotness-ranking)
  - [Webhook Ingest](#webhook-ingest)
  - [Scheduled Lint](#scheduled-lint)
- [Architecture Visualization (oh-my-mermaid)](#architecture-visualization-oh-my-mermaid)
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
PORT=3002 npm run dev
# → http://localhost:3002/wiki

# 1b. (Optional) Architecture viewer
omm view               # → http://localhost:4567

# 2. Use the CLI
kb search "multi-agent orchestration"
kb query "What is the best pattern for a supervisor-worker system?"
kb read concepts/tool-use

# 3. Use via Claude Desktop MCP
# Tools: search_wiki, read_article, read_index, list_articles, query_wiki
```

---

## Web UI

Full Wikipedia-style knowledge base browser at `http://localhost:3002`.

**Sidebar Tools section** — one-click jump to the interactive architecture viewer (oh-my-mermaid) and to Obsidian's global graph view (via the Advanced URI plugin). Added 2026-04-07.

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
# Search (hybrid keyword + graph with bucket allocation)
kb search "tool use patterns"
kb search "my stack" --scope private
kb search "everything" --scope all --limit 20

# Ask a natural language question (SSE-streams the answer)
kb query "What is the ReAct pattern and when should I use it?"
kb query "What's my preferred framework?" --scope private

# Read / list
kb read concepts/tool-use
kb read patterns/pattern-supervisor-worker
kb list concepts
kb list personal

# Karpathy compile pipeline (raw → analyze → generate → wiki + auto-reindex)
kb compile                   # incremental: only new/changed raw docs
kb compile --mode full       # recompile everything

# Update index.md section counts from directory listings (no recompile)
kb reindex

# Wiki health check
kb lint                      # writes wiki/lint-report.md

# Ingest a file (PDF, DOCX, PPTX, XLSX, audio, YouTube URL → raw/ + markitdown)
kb ingest-file <path>              # auto-detects raw/ subdirectory
kb ingest-file <path> --dir papers # override target subdirectory

# Ingest external sources
kb ingest-youtube <url>      # yt-dlp + SRT parse → raw/transcripts/
kb ingest-twitter <x.zip>    # parses Twitter/X archive → raw/twitter/

# Check pending ingestion queue
kb pending
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `KB_API_URL` | `http://localhost:3002` | Web server base URL |
| `PRIVATE_PIN` | _(empty)_ | PIN for private content access |

Set in `~/.zshrc`:
```bash
export KB_API_URL=http://localhost:3002
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
        "KB_API_URL": "http://localhost:3002",
        "PRIVATE_PIN": "1124"
      }
    }
  }
}
```

> **Note:** Restart Claude Desktop after changing this config for env vars to take effect.

### Tools (7 total)

| Tool | Description |
|------|-------------|
| `search_wiki` | Hybrid keyword + graph search. Supports `scope` (public/private/all) and `pin` |
| `read_article` | Read full article by slug. Requires `pin` for private articles |
| `read_index` | Read the master wiki index |
| `list_articles` | List all articles in a section |
| `query_wiki` | Natural language Q&A — Claude synthesizes an answer from ranked wiki pages |
| `compile_wiki` | Run the Karpathy compile pipeline — batches new/changed raw docs to Claude and writes wiki pages |
| `lint_wiki` | Health check — returns contradictions, orphans, stale pages, and knowledge gaps |

> **Note on long-running tools:** `compile_wiki` is a synchronous wrapper around an SSE endpoint and can time out on large batches. For full recompiles, use the web UI's `CompilePanel` (streams via `EventSource`, no timeout) or `kb compile --mode full`.

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

## Compile Pipeline (Karpathy LLM Wiki)

The compile pipeline is the heart of the KB — it's what makes this *not* a RAG system. Raw markdown in `raw/` is batched, sent to Claude with `wiki/schema.md` as the system prompt, and written back as structured wiki pages. State is tracked in `raw/.compiled-log.json` so re-runs are incremental.

### Running a compile

**Web UI (recommended for full runs):** Open `http://localhost:3002/wiki` and click **Compile New** in the `CompilePanel`. Streams live progress via `EventSource` with no timeout. Use **Recompile All** to force a full rebuild.

**CLI:** `kb compile` (incremental) or `kb compile --mode full`.

**MCP:** `compile_wiki` tool — works for small incremental runs but may time out on large batches.

### How it works

1. `collectMd(raw/)` walks every markdown file under `raw/`
2. `loadLog()` reads `raw/.compiled-log.json` — a map of `{relPath → {compiledAt, pagesAffected}}`
3. Files not yet in the log are selected for this run (or all files in `--mode full`)
4. **For each file — Call 1 (Analysis, analyst persona):**
   - Extracts a structured `KnowledgeAnalysis` JSON: entities (name, type, salience 0–1), typed relationships (from, to, label, strength, evidence), key claims, candidate pages (1–3 paths), contradictions, tags
   - Analysis failure is non-fatal; generation still runs with an empty graph
   - SSE emits `{type:'analysis', entities, candidates, contradictions, tags}`
5. **For each file — Call 2 (Generation, wiki curator persona):**
   - Receives the analysis JSON + raw excerpt + existing page list
   - Returns a JSON array of page ops `[{op, path, content}]`
   - Contradictions found in analysis surface as `⚠️ Contradictions` sections in pages
6. Each op is written to disk under `wiki/`
7. `wiki/log.md` gets an append-only entry for the run
8. `raw/.compiled-log.json` is updated so the next run skips already-compiled files
9. **After the loop — Auto-reindex:** `reindexWiki()` updates all `## Section (N)` counts in `index.md`

### Schema file

`wiki/schema.md` is the system prompt Claude sees on every compile. It defines:
- Directory routing rules (`concepts/`, `patterns/`, `frameworks/`, `entities/`, `recipes/`, `evaluations/`, `personal/`, `syntheses/`)
- Full frontmatter schema (required + optional fields)
- Per-type content guidelines
- Tag vocabulary
- Contradiction handling rules (never overwrite, always cross-link with dates)

Edit `wiki/schema.md` to change how Claude organizes content in future compile runs.

---

## Enterprise Features

Added 2026-04-07 as part of the enterprise-scaling pass.

### Namespace RBAC

Multi-tenant access control. Every write is scoped to a namespace. One KB, many teams / projects / agents.

**Config file:** `namespaces.json` (copy from [`namespaces.example.json`](namespaces.example.json))

```json
{
  "tokens": {
    "sk-engineering-replace-me": "engineering",
    "sk-product-replace-me": "product"
  },
  "namespaces": {
    "engineering": { "read": ["*"], "write": ["engineering", "shared"] },
    "product":     { "read": ["product", "shared"], "write": ["product"] },
    "readonly":    { "read": ["*"], "write": [] },
    "default":     { "read": ["*"], "write": ["*"] }
  }
}
```

**Identity resolution order:** `X-KB-Namespace` header → Bearer token lookup → `default` (back-compat).

**File-level enforcement:** writes into `raw/webhooks/<namespace>/`. Reads are filtered via `filterReadable(paths, acl)` which infers each file's namespace from its path prefix.

**Audit log:** every webhook write records `namespace` and `identitySource` (`header` | `token` | `default`) in `logs/audit.log`.

> Deleting `namespaces.json` returns the system to open-access mode. No migration needed.

### Temporal Decay + Hotness Ranking + Confidence Weighting

Search scores are multiplied by a ranking factor that blends recency, popularity, and declared confidence:

```
finalScore = baseScore × decay(mtime) × hotness(audit hits) × confidence(frontmatter)
```

- **decay(mtime)** — exponential with 180-day half-life, floored at 0.5. A doc touched 180 days ago scores at 0.5× of a freshly written one.
- **hotness(path)** — parses `logs/audit.log` for `op:query` entries in the last 30 days, counts hits per file, log-scales: 1 hit → +0.1, 10 hits → +0.33, 100 hits → +0.5 cap. Cached for 60 seconds.
- **confidence(path)** — reads the `confidence:` frontmatter field via a 512-byte head read (mtime-cached). `high → ×1.10`, `medium → ×1.00`, `low → ×0.85`. Pages marked low-confidence surface below speculation-free articles automatically. _(RLM stage 6, added 2026-04-09)_

Results include `baseScore`, `decay`, `hotness`, `confidence`, and `score` so the UI can show why a page ranked where it did.

Implementation: [`web/src/lib/ranking.ts`](web/src/lib/ranking.ts). Wired into [`graph-search.ts`](web/src/lib/graph-search.ts).

### Webhook Ingest

`POST /api/ingest/webhook` accepts external payloads and writes them into `raw/webhooks/<namespace>/`.

**Auth:** Bearer token (resolved via RBAC) or legacy `WEBHOOK_SECRET` env var.

**Built-in adapters:**

| Source | Detection | Filter |
|--------|-----------|--------|
| GitHub issues | `X-GitHub-Event: issues` header | Only on `action: closed` |
| GitHub PRs | `X-GitHub-Event: pull_request` header | Only on merged PRs |
| Slack | `token` or `channel_id` in body | Slash command or Events API |
| Generic JSON | Fallback | Requires `title` + `content` fields |

**GitHub Actions workflow:** [`.github/workflows/kb-ingest.yml`](.github/workflows/kb-ingest.yml) auto-ingests merged PRs, closed issues, and pushed `docs/**.md` on merge. Requires `KB_WEBHOOK_URL` and `KB_WEBHOOK_SECRET` repo secrets.

### Scheduled Lint

A scheduled task (`kb-daily-lint`) runs `POST /api/lint` every day at 07:00 local time.

**What `/api/lint` checks:**
- **Contradictions** — Claude-synthesized analysis of conflicting claims across wiki pages
- **Orphans** — pages with zero inbound wiki-links
- **Stale pages** — untouched for > 90 days
- **Knowledge gaps** — raw docs with no corresponding compiled wiki page

Results land in `wiki/lint-report.md`. The scheduled task alerts only on P0 contradictions or > 5 new orphans; otherwise a quiet `KB healthy` summary.

See [`docs/RLM_PIPELINE.md`](docs/RLM_PIPELINE.md) for how lint fits into the 10-stage retrieval pipeline reference design.

---

## Architecture Visualization (oh-my-mermaid)

Interactive clickable architecture explorer with drill-down nested perspectives.

### Setup

```bash
npm install -g oh-my-mermaid
cd /Users/jaywest/Agentic-KB
omm setup claude      # register /omm-scan skill with Claude Code
```

### View it

```bash
omm view              # launches http://localhost:4567
```

Or click **Architecture Diagram ↗** in the wiki sidebar Tools section.

### Current perspectives

`.omm/overall-architecture/` with 6 clickable child lenses:
- `web-ui` — Next.js app components and routes
- `cli` — `kb` command structure
- `mcp-server` — 7 MCP tools
- `api-routes` — all `/api/*` endpoints and their shared libs
- `github-actions` — kb-ingest workflow
- `vault` — raw/, wiki/, graphify-out, audit.log

Plus three leaf perspectives: `compile-pipeline`, `query-pipeline`, `ingest-flow`.

### Regenerating

In Claude Code, run `/omm-scan` to have Claude re-analyze the codebase and refresh the diagrams, then run `./scripts/ingest-omm.sh` to sync the refreshed perspectives into `raw/architecture/` (ready for the next compile).

> **Why kebab-case matters:** oh-my-mermaid drills into child elements by matching node IDs to child directory names. Always use kebab-case IDs (`web-ui`, `compile-pipeline`) in diagrams — uppercase or camelCase IDs break drill-down.

See [`docs/OH_MY_MERMAID.md`](docs/OH_MY_MERMAID.md) for the full workflow.

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

1. Go to `http://localhost:3002/ingest`
2. Paste raw text or upload a file
3. The AI processes it, extracts key knowledge, and writes a structured wiki article
4. View the queue at `http://localhost:3002/process`

### Via CLI (raw file drop)

1. Drop file into `raw/` subdirectory (`papers/`, `transcripts/`, `framework-docs/`, `note/`, etc.)
2. Check queue: `kb pending`
3. Process via browser at `/process` or trigger: `curl -X POST http://localhost:3002/api/process/run-all`

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

For an **interactive** version of this diagram with clickable drill-down, click the **Architecture Diagram ↗** link in the wiki sidebar, or run `omm view` and open `http://localhost:4567`.

```
Browser
  │
  ├── /wiki/*                  Next.js App Router (force-dynamic, SSR)
  │                            reads .md files via fs (no DB)
  │
  ├── /api/compile             Karpathy compile pipeline — SSE, Claude, incremental
  ├── /api/query               Hybrid search + decay/hotness ranking + Claude synthesis
  ├── /api/search              Keyword + graph-based hybrid search
  ├── /api/lint                Wiki health check (contradictions, orphans, stale, gaps)
  ├── /api/ingest              Raw material upload
  ├── /api/ingest/webhook      External ingest with namespace RBAC
  ├── /api/vaults              Reads obsidian.json → vault list
  ├── /api/switch-vault        Sets active_vault_path cookie
  ├── /api/vault-structure     Recursive folder walker for sidebar
  ├── /api/vault-watch         SSE file watcher for live reload
  └── /api/process             Legacy raw-material pipeline

Shared libs (web/src/lib/)
  ├── rbac.ts                  Namespace identity resolution + ACL enforcement
  ├── ranking.ts               decayFactor + hotnessBoost + confidenceBoost + rankMultiplier
  ├── graph-search.ts          Semantic search over graphify graph.json + 60/20/5/15 bucket allocation
  ├── audit.ts                 Append-only JSONL at logs/audit.log
  └── articles.ts              Article loaders, frontmatter parsing, vault resolution

CLI (kb.js)
  ├── HTTP → compile, lint, query, search (SSE-streaming where applicable)
  ├── Direct fs reads (read, list, pending)
  ├── Local yt-dlp + parsers (ingest-youtube, ingest-twitter)
  ├── markitdown conversion (ingest-file → raw/ with frontmatter)
  └── Local index recount (reindex → index.md section counts)

MCP Server (server.js, 7 tools)
  ├── Direct fs reads: search_wiki, read_article, read_index, list_articles
  └── HTTP: query_wiki, compile_wiki, lint_wiki

GitHub Actions (kb-ingest.yml)
  └── POST /api/ingest/webhook on merged PR / closed issue / pushed doc

Scheduled task (kb-daily-lint)
  └── POST /api/lint → wiki/lint-report.md (07:00 daily)
```

### Key design decisions

- **Compile, not retrieve** — Karpathy LLM-Wiki pattern. Raw docs are deliberately compiled into persistent wiki pages. Query-time retrieval operates over the compiled, curated wiki — not over raw chunks.
- **No database** — all content is markdown read directly via `fs.readFileSync`. Every request reads fresh from disk. `force-dynamic` on all routes.
- **Hybrid search, not pure vector** — keyword + graph traversal (over graphify's `graph.json`) + temporal decay + hotness. Vector store is an optional P2 add (see RLM pipeline doc).
- **Fail-open RBAC** — no `namespaces.json` = open access (back-compat). Add the file to enforce per-namespace ACLs.
- **Append-only audit log** — every `query`, `ingest`, `compile`, `lint`, `webhook` op writes a JSON line to `logs/audit.log`. Never truncated. Feeds the hotness ranking multiplier.
- **Cookie-based vault selection** — `active_vault_path` cookie propagates through Next.js server components via `cookies()`
- **PIN auth is server-enforced** — `PRIVATE_PIN` env var read server-side only; never exposed to client
- **MCP is filesystem-first** — `search_wiki`, `read_article`, `list_articles` go direct to disk. `query_wiki`, `compile_wiki`, `lint_wiki` call the HTTP API.

### RLM Pipeline Stage Status

10-stage Recursive Layered Memory retrieval pipeline — see [`docs/RLM_PIPELINE.md`](docs/RLM_PIPELINE.md) for full spec.

| Stage | Name | Status | Notes |
|-------|------|--------|-------|
| 1 | Semantic chunking | ⏳ Planned | P2 — vector/BM25 hybrid |
| 2 | Vector + BM25 search | ⏳ Planned | P2 — excluded from current scope |
| 3 | Two-step ingest (analyze → generate) | ✅ Live | `/api/compile` — 2026-04-09 |
| 4 | Temporal decay | ✅ Live | `ranking.ts` — 2026-04-07 |
| 5 | Hotness boost | ✅ Live | `ranking.ts` audit-log counts — 2026-04-07 |
| 6 | Confidence weighting | ✅ Live | `ranking.ts` frontmatter `confidence:` — 2026-04-09 |
| 7 | Contradiction filtering | ✅ Live | `query/route.ts` lint-report parse — 2026-04-09 |
| 8 | Graph traversal + bucket allocation | ✅ Live | `graph-search.ts` 60/20/5/15 — 2026-04-09 |
| 9 | Token-budget packing | ✅ Live | `query/route.ts` 24k char cap — 2026-04-09 |
| 10 | Two-model validation | ⏳ Planned | P2 — excluded from current scope |

### Reference documents

| Doc | Purpose |
|-----|---------|
| [`ENTERPRISE_PLAN.md`](ENTERPRISE_PLAN.md) | P0–P3 enterprise scaling roadmap |
| [`docs/RLM_PIPELINE.md`](docs/RLM_PIPELINE.md) | 10-stage retrieval pipeline reference design |
| [`docs/OH_MY_MERMAID.md`](docs/OH_MY_MERMAID.md) | Architecture visualization workflow |
| [`wiki/schema.md`](wiki/schema.md) | Compile pipeline system prompt |
| [`CLAUDE.md`](CLAUDE.md) | Agent workflows (EXPLORE, BRIEF, ingest conventions) |
| [`namespaces.example.json`](namespaces.example.json) | RBAC config template |

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

---

## 🤖 Agent Memory Runtime

Agentic-KB ships a zero-dep operational agent memory runtime at `lib/agent-runtime/` (plain `.mjs`, importable by the web app, CLI, and MCP server). It turns the vault into a layered brain for orchestrator / lead / worker agents with bounded context, transactional writeback, a discovery/escalation/standards/handoff bus, and canonical promotion/merge paths.

### Architecture

```
config/agents/*.yaml           machine-readable agent contracts (tier + context_policy + allowed_writes + forbidden_paths)
wiki/agents/{tier}/{id}/       profile · hot · task-log · gotchas · rewrites
wiki/system/bus/{channel}/     discovery · escalation · standards · handoffs (markdown + frontmatter)
wiki/system/policies|routing|schemas|templates
wiki/archive/                  bus-TTL archive, hot snapshots, merge snapshots (archive-never-delete)
logs/agent-runtime.log         JSONL traces: ContextLoadTrace + GuardDecisionTrace
logs/audit.log                 unified audit (humans + agents, same schema)
lib/agent-runtime/
  contracts.mjs       load/validate YAML contracts
  identity.mjs        unified human|agent|service|team identity
  paths.mjs           glob matching, path traversal defense, write guards
  memory-classes.mjs  profile|hot|working|learned|rewrite|bus metadata
  state-machines.mjs  bus/standards/rewrite legal transitions
  context-loader.mjs  tier+domain+project+subscription bundle builder + trace
  writeback.mjs       transactional closeTask (plan→guard all→commit all or reject all)
  bus.mjs             publish/list/read/transition bus items
  promotion.mjs       promoteLearning + canonical mergeRewrite with provenance
  retention.mjs       hot compaction, bus TTL, task-log rotation, archiveMove
  observability.mjs   JSONL trace writer + reader
  audit.mjs           shared audit log appender
  frontmatter.mjs     zero-dep YAML frontmatter
```

### Design pillars

1. **Single master vault, namespaces enforce isolation.** Every write goes through `assertWriteAllowed` which hard-rejects `..` / absolute / `//` paths before any glob match, then checks `forbidden_paths`, then `allowed_writes`.
2. **Memory classes route writes.** `profile | hot | working | learned | rewrite | bus` — `working` is append-only, `hot` is replace-and-compact, `bus` has a state machine.
3. **context_policy drives loading, not raw globs.** Contracts declare include rules by class+scope (`self`, `lead:planning-agent`) or by path, plus subscriptions to bus channels, a byte budget, and priority order. The loader sorts, applies the budget, and emits a `ContextLoadTrace` with `included[]`, `excluded[]`, reasons, and `truncated`.
4. **Transactional writeback.** `closeTask` plans all intended writes, runs the full set through the guard, and commits atomically — any single rejection aborts the whole close. Discoveries/escalations publish as bus items in the same transaction.
5. **Promotion is rewrite + backlink, never a move.** `promoteLearning` writes the target with `promoted_from` + provenance footer and transitions the source to `promoted`. `mergeRewrite` requires `approved` state, snapshots canonical to `wiki/archive/merges/`, writes new canonical with `merged_from` + provenance, and transitions the rewrite to `merged` with before/after hashes in the audit.
6. **First-class observability.** Every context load and guard decision is traceable from `logs/agent-runtime.log` and inline in API/CLI responses.

### Quickstart

```bash
# List agent contracts
node cli/kb.js agent list

# Show a scoped context bundle for a worker (respects budget + tier scoping)
node cli/kb.js agent context gsd-executor --project example-project

# Transactional end-of-task writeback
cat > /tmp/task.json <<'JSON'
{
  "project": "example-project",
  "taskLogEntry": "Implemented X",
  "hotUpdate": "Refreshed hot cache",
  "gotcha": "Watch out for Y",
  "discoveries": [{ "body": "Worth promoting later" }]
}
JSON
node cli/kb.js agent close-task gsd-executor --payload /tmp/task.json

# Bus + promotion
node cli/kb.js bus list discovery
node cli/kb.js promote discovery <id> --approver planning-agent

# Recent runtime traces
node cli/kb.js agent trace gsd-executor --last 20

# Full end-to-end smoke test (includes a forbidden-write rejection)
./scripts/agents-demo.sh
```

### Web API

| Route | Purpose |
|-------|---------|
| `GET /api/agents/list` | List all contracts |
| `GET /api/agents/[id]/context?project=…` | Scoped context bundle + trace |
| `POST /api/agents/[id]/close-task` | Transactional writeback |
| `GET/POST /api/agents/bus/[channel]` | List / publish bus items |
| `POST /api/agents/promote` | Promote a bus item |

### MCP tools

Added to `mcp/server.js`: `list_agents`, `load_agent_context`, `close_agent_task`, `publish_bus_item`, `list_agent_bus_items`, `promote_learning`. Worker-tier MCP sessions literally cannot write outside their sandbox — contracts gate every write.

### Tests

```bash
node --test tests/agents/
```

12 tests cover contract loading, path traversal rejection, tier/budget scoping, atomic close-task commit + atomic rejection, bus publish/list/read, state-machine illegal-transition rejection, and promotion with provenance.

### Retention & compaction (v1)

- Hot memory compaction triggers on task close when `hot.md` exceeds the compaction threshold; old hot is snapshotted to `wiki/archive/hot-snapshots/{agent}/{timestamp}.md`.
- Bus TTL archives discovery items after 30 days unless `promoted`, `in_progress`, or pinned. Archived items move to `wiki/archive/bus/{channel}/{year}/` and transition to `archived`.
- Task logs are append-only (enforced by memory-class) and rotate at 10k lines via snapshot + fresh log.
- All retention is archive-never-delete: every move is audited and reversible.
