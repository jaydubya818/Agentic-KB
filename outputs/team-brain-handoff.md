# Team Brain — Work Laptop Handoff Package
> Copy this entire document to your work laptop.
> Open a new Claude Code session in an empty folder, paste the PROMPT section verbatim.
> Claude Code will build the full repo autonomously.

---

## CONTEXT (read before handing off)

You are building **team-brain** — a lightweight, local-first personal knowledge base starter kit for software developers. Each developer runs their own instance. No shared server, no shared database. Each brain is a private git repo on the developer's machine.

**What it does:**
- Developer drops docs, notes, bookmarks, meeting notes into `raw/`
- `brain compile` → Claude reads raw docs, writes structured wiki pages in `wiki/`
- `brain ask "how does X work"` → Claude synthesizes answer from wiki
- MCP server → Claude Code and Cursor can query the brain mid-session
- RAG bridge → optional connection to company internal RAG/search API

**Stack:** Node.js 20+, TypeScript, ES modules, MCP SDK, Commander.js
**Works on:** macOS, Windows (WSL), Linux
**AI backends:** Anthropic Claude API (primary) or OpenAI (fallback)

---

## PROMPT (paste this verbatim into Claude Code)

```
Build a complete Node.js TypeScript monorepo called "team-brain" — a local-first personal knowledge base starter kit for software developers. This is a greenfield project in the current directory.

## What to build

A monorepo with these packages:
- packages/core     — shared domain logic (compile, search, ask, lint, RAG bridge)
- packages/cli      — `brain` CLI (init, compile, ask, ingest, lint, status)
- packages/mcp      — stdio MCP server (for Claude Code and Cursor)
- scripts/          — install.sh (Mac/Linux) and install.ps1 (Windows)

Plus a sample brain scaffold in:
- scaffold/         — template files copied to ~/team-brain/ on `brain init`

---

## Package: packages/core

### File: packages/core/src/config.ts
Exports `BrainConfig` interface and `resolveBrainConfig()`:
```typescript
export interface BrainConfig {
  root: string;           // absolute path to brain root (~/team-brain or custom)
  anthropicApiKey?: string;
  openaiApiKey?: string;  // fallback if no Anthropic key
  ragEnabled: boolean;
  ragBaseUrl?: string;    // e.g. https://rag.internal.company.com/api
  ragApiKey?: string;
  ragNamespace?: string;  // optional namespace/index name
  brainName: string;
}

export async function resolveBrainConfig(opts?: { brainRoot?: string }): Promise<BrainConfig>
```
Resolution order: opts.brainRoot → BRAIN_ROOT env var → ~/team-brain
Reads .env at brain root if it exists (dotenv).
Reads brain.config.json at brain root if it exists.

### File: packages/core/src/paths.ts
```typescript
export function brainPaths(root: string) {
  return {
    raw:     path.join(root, 'raw'),
    wiki:    path.join(root, 'wiki'),
    hot:     path.join(root, 'wiki', 'hot.md'),
    index:   path.join(root, 'wiki', 'index.md'),
    log:     path.join(root, 'wiki', 'log.md'),
    outputs: path.join(root, 'outputs'),
    config:  path.join(root, 'brain.config.json'),
    env:     path.join(root, '.env'),
    claudeMd: path.join(root, 'CLAUDE.md'),
  };
}
```

### File: packages/core/src/compile.ts
Exports `runCompile(config: BrainConfig): Promise<CompileResult>`:

Logic:
1. Walk raw/ recursively, collect all .md, .txt, .pdf (pdf → extract text via pdfjs-dist), .docx (docx → plain text via mammoth)
2. Skip files in raw/.compiled-log.json (already compiled, check by content hash)
3. For each new/changed file: call Claude API (claude-sonnet-4-6 model, max 8000 tokens output) with:
   - System: contents of wiki/CLAUDE.md (the brain schema)
   - User: "Compile this source into wiki pages. Source file: {filename}\n\n{content}\n\nOutput JSON: { pages: [{path: string, content: string}], log: string }"
4. Write each returned page to wiki/{path} (create dirs as needed)
5. Update raw/.compiled-log.json with file hash
6. Append to wiki/log.md
7. Return { pagesWritten, filesProcessed, errors }

If no Anthropic key but OpenAI key present: use gpt-4o instead.
If neither key: throw clear error "Set ANTHROPIC_API_KEY or OPENAI_API_KEY in {brain}/.env".

### File: packages/core/src/search.ts
Exports `searchWiki(query: string, config: BrainConfig): Promise<SearchResult[]>`:

Logic:
1. Read wiki/hot.md first (always inject into results if exists)
2. Walk wiki/ recursively, collect all .md files
3. Simple TF-IDF keyword scoring (no vector DB, no embeddings)
4. Return top 10 matches with { path, title, excerpt, score }

### File: packages/core/src/ask.ts
Exports `runAsk(question: string, config: BrainConfig): Promise<AskResult>`:

Logic:
1. Call searchWiki() to get top 10 relevant wiki pages
2. Read full content of top 5 pages (cap at 20,000 chars total)
3. If config.ragEnabled: call ragBridge() to get additional context (see rag.ts)
4. Call Claude API with:
   - System: "You are a knowledge assistant. Answer using ONLY the provided wiki context. Cite sources as [[filename]]. If the answer isn't in the context, say so clearly."
   - User: "{question}\n\n## Wiki Context\n\n{pages}"
5. Return { answer, sources: string[], ragUsed: boolean }

### File: packages/core/src/rag.ts
Exports `ragBridge(query: string, config: BrainConfig): Promise<RagResult>`:

This is the company RAG integration. Generic REST bridge.

```typescript
export interface RagResult {
  chunks: Array<{ content: string; source: string; score: number }>;
  error?: string;
}

export async function ragBridge(query: string, config: BrainConfig): Promise<RagResult>
```

Logic:
1. If !config.ragEnabled or !config.ragBaseUrl: return { chunks: [] }
2. POST to `{config.ragBaseUrl}/search` with body:
   ```json
   { "query": "{query}", "top_k": 5, "namespace": "{config.ragNamespace}" }
   ```
   Headers: Authorization: Bearer {config.ragApiKey}, Content-Type: application/json
3. Expect response: `{ results: [{ content, source, score }] }` (standard RAG API shape)
4. If response shape differs, try these fallback keys: chunks, documents, hits, items
5. On any error: log warning, return { chunks: [], error: message } — never throw, RAG failure is non-fatal

Include a comment block at top of rag.ts:
```
// RAG BRIDGE CONFIGURATION
// Set in ~/team-brain/.env:
//   RAG_ENABLED=true
//   RAG_BASE_URL=https://rag.internal.company.com/api
//   RAG_API_KEY=your-key-here
//   RAG_NAMESPACE=engineering-docs   (optional)
//
// Expected API contract (POST /search):
//   Request:  { query: string, top_k: number, namespace?: string }
//   Response: { results: [{ content: string, source: string, score: number }] }
//
// If your RAG API has a different shape, edit the normalizeRagResponse()
// function below. Common alternatives are handled automatically.
```

### File: packages/core/src/ingest.ts
Exports `runIngest(filePath: string, config: BrainConfig): Promise<void>`:

Logic:
1. Detect file type from extension
2. Copy/convert to appropriate raw/ subfolder:
   - .md .txt → raw/notes/
   - .pdf → raw/docs/ (keep original)
   - .docx .pptx → raw/docs/
   - URLs (string starting with http) → fetch title + description → raw/bookmarks/{slug}.md
3. Print confirmation: "Added to raw/notes/filename.md — run `brain compile` to index"

### File: packages/core/src/lint.ts
Exports `runLint(config: BrainConfig): Promise<LintResult>`:

Checks:
- Orphan wiki pages (no inbound links from other pages)
- Pages missing required frontmatter fields (title, type)
- Raw files not yet compiled (not in .compiled-log.json)
- wiki/index.md out of date (count mismatch)
Returns { orphans, missingFrontmatter, uncompiled, indexStale, summary }

### File: packages/core/src/scaffold.ts
Exports `runInit(targetDir: string): Promise<void>`:

Copies scaffold/ template to targetDir, then:
1. Creates all required directories
2. Writes .env.example with all config keys documented
3. Writes brain.config.json with defaults
4. Prints next-steps checklist

---

## Package: packages/cli

Single entry: packages/cli/src/index.ts
Uses Commander.js. Commands:

### brain init [--target <dir>]
Default target: ~/team-brain
Calls runInit(). Prints checklist.

### brain compile [--force]
Calls runCompile(). Shows progress per file.
--force: recompile all files (ignore .compiled-log.json)

### brain ask "<question>"
Calls runAsk(). Prints answer + sources.
If RAG was used, prints "(+ company RAG)" after sources.

### brain ingest <path-or-url>
Calls runIngest(). Single file or URL.

### brain lint
Calls runLint(). Prints report.

### brain status
Prints:
- Brain root location
- Raw files: N total, N compiled, N pending
- Wiki pages: N total
- RAG: enabled/disabled + URL if enabled
- API: Claude/OpenAI/None (which key is set)

### brain serve
Starts the MCP server (delegates to packages/mcp).
Prints the config block to paste into Claude Code / Cursor settings.

---

## Package: packages/mcp

Single file: packages/mcp/src/index.ts
Stdio MCP server using @modelcontextprotocol/sdk.

Register these tools:

### search_brain
description: "Search your personal knowledge base. Use for questions about your own notes, docs, and expertise."
input: { query: string, scope?: "all" | "wiki" | "raw" }
Calls searchWiki() from core. Returns top results as text.

### ask_brain
description: "Ask a question and get a synthesized answer from your knowledge base + optional company RAG."
input: { question: string }
Calls runAsk() from core. Returns answer + sources.

### ingest_to_brain
description: "Add a file or URL to your knowledge base for future indexing."
input: { path_or_url: string }
Calls runIngest() from core.

### brain_status
description: "Get the current status of your knowledge base (page count, pending files, RAG config)."
input: {}
Returns status summary.

---

## Scaffold template (scaffold/ directory)

### scaffold/CLAUDE.md
This is the schema file developers fork. Write it as follows:

```markdown
# Team Brain — Personal Knowledge Base Schema
> Owner: {YOUR_NAME} | Domain: {YOUR_DOMAIN} | Built: {DATE}
> Fork this file and customize the domain, folder structure, and workflows.

## Purpose
Your personal, compounding second brain. Drop raw material into raw/, run `brain compile`,
ask questions with `brain ask`. The wiki grows as you add more sources.

## Vault Structure

\`\`\`
~/team-brain/
├── raw/                    # YOUR DROP ZONE — add anything here
│   ├── notes/              # Personal notes, meeting notes, decisions
│   ├── docs/               # PDFs, Word docs, specs, RFCs
│   ├── bookmarks/          # Saved articles (brain ingest <url>)
│   ├── code-snippets/      # Useful code patterns with explanations
│   └── team-docs/          # Shared team docs you've copied in
├── wiki/                   # LLM-MAINTAINED — never edit manually
│   ├── concepts/           # Definitions of concepts in your domain
│   ├── how-to/             # Step-by-step guides derived from your docs
│   ├── decisions/          # Architecture and technical decisions
│   ├── references/         # Quick-reference summaries
│   ├── hot.md              # Most-used context (≤500 words) — loaded first on every query
│   ├── index.md            # Master catalog (auto-maintained)
│   └── log.md              # Audit trail of all compile runs
└── outputs/                # Generated reports, synthesis outputs
\`\`\`

## Compile Instructions (system prompt for Claude)
When compiling raw sources into wiki pages, follow these rules:

1. Create ONE wiki page per distinct concept, decision, or guide found in the source
2. Use frontmatter: title, type (concept|how-to|decision|reference), tags, created, confidence
3. Confidence: high = verified/official docs; medium = inferred; low = speculative
4. Cross-link using [[wiki/path/to/page]] syntax — link first mention of every concept
5. Append to wiki/log.md: timestamp, source file, pages created/updated
6. Update wiki/index.md with new pages
7. Never edit raw/ files
8. If a concept already has a wiki page, UPDATE it rather than creating a duplicate

## Query Instructions (system prompt for ask)
When answering questions:
1. Read wiki/hot.md first — it contains the most-used context
2. Cite every claim as [[wiki/page-name]]
3. If the answer isn't in the wiki, say "Not in KB — suggest running: brain ingest <source>"
4. If RAG results are provided, cite them as [RAG: source-name]
5. Keep answers concise — lead with the direct answer, add detail after
```

### scaffold/.env.example
```
# AI Backend (set at least one)
ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...     # fallback if no Anthropic key

# Company RAG Integration (optional)
# RAG_ENABLED=true
# RAG_BASE_URL=https://rag.internal.company.com/api
# RAG_API_KEY=your-rag-api-key
# RAG_NAMESPACE=engineering-docs

# Brain location (optional — defaults to ~/team-brain)
# BRAIN_ROOT=/custom/path/to/brain
```

### scaffold/brain.config.json
```json
{
  "brainName": "my-brain",
  "ragEnabled": false,
  "ragBaseUrl": "",
  "ragNamespace": ""
}
```

### scaffold/raw/notes/.gitkeep
### scaffold/raw/docs/.gitkeep
### scaffold/raw/bookmarks/.gitkeep
### scaffold/raw/code-snippets/.gitkeep
### scaffold/raw/team-docs/.gitkeep
### scaffold/wiki/.gitkeep
### scaffold/outputs/.gitkeep

### scaffold/wiki/hot.md
```markdown
# Hot Cache
> ≤500 words | Most-used context | Updated by `brain compile`

Add your most-referenced facts, patterns, and shortcuts here.
Brain will read this file first on every query.

## Quick Links
- [[wiki/index]] — full page catalog
- [[wiki/log]] — compile history
```

### scaffold/wiki/index.md
```markdown
# Knowledge Base Index
> Auto-maintained by `brain compile`

## Concepts (0)

## How-To Guides (0)

## Decisions (0)

## References (0)
```

### scaffold/wiki/log.md
```markdown
# Compile Log
> Append-only. Never edit manually.

```

### scaffold/.gitignore
```
node_modules/
.env
raw/.compiled-log.json
outputs/
```

### scaffold/README.md
```markdown
# My Brain

Personal knowledge base. See [team-brain docs](https://github.com/your-org/team-brain) for full setup.

## Quick Commands

\`\`\`bash
brain status          # check what's in your brain
brain ingest <file>   # add a file
brain ingest <url>    # add a web page
brain compile         # index everything in raw/
brain ask "how do I deploy to staging?"
brain lint            # find gaps
\`\`\`

## Add to Claude Code / Cursor
Run:
\`\`\`bash
brain serve --print-config
\`\`\`
Then paste the output into your Claude Code / Cursor MCP settings.
```

---

## Install Scripts

### scripts/install.sh (Mac/Linux)
```bash
#!/bin/bash
set -e

echo "=== Team Brain Installer ==="
echo ""

# Check Node version
NODE_VER=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_VER" ] || [ "$NODE_VER" -lt 20 ]; then
  echo "ERROR: Node.js 20+ required. Install from https://nodejs.org"
  exit 1
fi

# Clone or use current dir
INSTALL_DIR="$HOME/.team-brain-engine"
if [ ! -d "$INSTALL_DIR" ]; then
  echo "Installing engine to $INSTALL_DIR..."
  cp -r . "$INSTALL_DIR"
fi

# Install and build
cd "$INSTALL_DIR"
npm install --silent
npm run build --silent

# Link CLI globally
npm link --silent 2>/dev/null || sudo npm link --silent

# Init brain
echo ""
echo "Initializing your brain at ~/team-brain..."
brain init

echo ""
echo "=== Done! ==="
echo ""
echo "Next steps:"
echo "  1. Add your API key: echo 'ANTHROPIC_API_KEY=sk-ant-...' >> ~/team-brain/.env"
echo "  2. Add files:        brain ingest ~/Documents/some-doc.pdf"
echo "  3. Compile:          brain compile"
echo "  4. Ask:              brain ask 'how do I...'"
echo "  5. Wire to Cursor:   brain serve --print-config"
echo ""
```

### scripts/install.ps1 (Windows)
```powershell
# Team Brain Installer — Windows (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "=== Team Brain Installer ===" -ForegroundColor Cyan

# Check Node
$nodeVer = (node --version 2>$null) -replace 'v','' -split '\.' | Select-Object -First 1
if (-not $nodeVer -or [int]$nodeVer -lt 20) {
    Write-Host "ERROR: Node.js 20+ required. Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

$installDir = "$env:USERPROFILE\.team-brain-engine"
if (-not (Test-Path $installDir)) {
    Write-Host "Installing engine to $installDir..."
    Copy-Item -Recurse -Force . $installDir
}

Set-Location $installDir
npm install --silent
npm run build --silent
npm link --silent

Write-Host ""
brain init
Write-Host ""
Write-Host "=== Done! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Add API key: Add-Content ~/team-brain/.env 'ANTHROPIC_API_KEY=sk-ant-...'"
Write-Host "  2. Add files:   brain ingest path\to\doc.pdf"
Write-Host "  3. Compile:     brain compile"
Write-Host "  4. Ask:         brain ask 'how do I...'"
Write-Host "  5. Wire Cursor: brain serve --print-config"
```

---

## brain serve --print-config behavior

When `brain serve --print-config` is run, it should print:

```
=== MCP Config for Claude Code ===
Add to ~/.claude/settings.json → mcpServers:

{
  "team-brain": {
    "command": "node",
    "args": ["/absolute/path/to/packages/mcp/dist/index.js"],
    "env": {
      "BRAIN_ROOT": "/Users/yourname/team-brain"
    }
  }
}

=== MCP Config for Cursor ===
Add to ~/.cursor/mcp.json (or Cursor Settings → MCP):

{
  "mcpServers": {
    "team-brain": {
      "command": "node",
      "args": ["/absolute/path/to/packages/mcp/dist/index.js"],
      "env": {
        "BRAIN_ROOT": "/Users/yourname/team-brain"
      }
    }
  }
}

MCP server is ready. Run without --print-config to start it.
```
(Use actual resolved paths from the running process.)

---

## package.json (root — monorepo)

```json
{
  "name": "team-brain",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "npm run build -w packages/core && npm run build -w packages/mcp && npm run build -w packages/cli",
    "dev": "npm run build",
    "test": "node --experimental-vm-modules node_modules/.bin/vitest run"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "vitest": "^1.6.0"
  }
}
```

---

## tsconfig.base.json (root)
Standard strict TypeScript config targeting ES2022, NodeNext module resolution.

---

## Dependencies to use

packages/core:
- @anthropic-ai/sdk
- openai
- dotenv
- pdfjs-dist (PDF text extraction)
- mammoth (DOCX extraction)
- fast-glob
- gray-matter (frontmatter parsing)
- marked (markdown parsing for link extraction)

packages/mcp:
- @modelcontextprotocol/sdk
- @second-brain/core (workspace dep)
- dotenv
- zod

packages/cli:
- commander
- @second-brain/core (workspace dep)
- @second-brain/mcp (workspace dep)
- dotenv
- chalk
- ora (spinner)

---

## Tests (tests/ at root)

Write tests for:
- config resolution (env vars, brain.config.json, defaults)
- paths helper (all paths resolve correctly)
- ragBridge normalizeRagResponse (handles 4 different response shapes)
- runLint (detects orphan pages, missing frontmatter)
- searchWiki (returns results, respects scope)
- runInit (creates correct directory structure)

Use vitest. Mock fs and fetch. No real API calls in tests.

---

## Quality requirements

- TypeScript strict mode — no `any` types
- All async functions have explicit return types
- No hardcoded paths — use brainPaths() everywhere
- ragBridge never throws — catches all errors, returns { chunks: [], error }
- compile errors per-file are non-fatal — continue with remaining files, report at end
- All CLI commands print clear error messages with fix instructions
- README.md at root explains setup in under 20 lines

---

## What NOT to build

Do not build:
- A web dashboard (out of scope for v1)
- Vector embeddings or semantic search (plain TF-IDF is enough)
- Multi-brain / workspace mode
- Governance / canon council / review debt
- Obsidian sync
- YouTube/Twitter ingest
- Any authentication or multi-user features

Keep it simple. The whole thing should be under 2000 lines of TypeScript excluding tests.

---

Build this completely. Run `npm run build` to verify it compiles. Run `npm test` to verify tests pass. Then print a summary of what was built.
```

---

## After Claude Code builds it

### Wire to Claude Code (global settings)

Run this once after install:
```bash
brain serve --print-config
```

Copy the output. Add the `mcpServers` block to `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "team-brain": {
      "command": "node",
      "args": ["/path/to/packages/mcp/dist/index.js"],
      "env": { "BRAIN_ROOT": "/Users/yourname/team-brain" }
    }
  }
}
```

### Wire to Cursor

1. Open Cursor → Settings → MCP (or edit `~/.cursor/mcp.json`)
2. Paste the Cursor config block from `brain serve --print-config`
3. Restart Cursor
4. Verify: open Cursor chat, type `@brain` — should autocomplete to `ask_brain`

### Wire your company RAG

Edit `~/team-brain/.env`:
```bash
RAG_ENABLED=true
RAG_BASE_URL=https://rag.internal.company.com/api
RAG_API_KEY=your-key-here
RAG_NAMESPACE=engineering-docs   # optional
```

Test it:
```bash
brain ask "how do we deploy to production"
# Should show "(+ company RAG)" in sources if RAG is configured
```

If your RAG API has a different request/response shape than the default:
Edit `packages/core/src/rag.ts` → `normalizeRagResponse()` function.
The comments in that file document exactly what to change.

### Daily workflow

```bash
# Morning: drop yesterday's notes in
brain ingest ~/Downloads/meeting-notes.md
brain ingest https://internal-wiki.company.com/some-doc

# Compile new stuff (runs incrementally — only new files)
brain compile

# Use it
brain ask "what's the deployment process for service X"
brain ask "how do we handle DB migrations"

# Or use it from Cursor/Claude Code without leaving your editor:
# Just ask Claude — it will call ask_brain automatically
```

---

## Distributing to your team

Once you've tested it:
1. Push repo to your internal GitHub/GitLab
2. Tell devs: `git clone <repo> && cd team-brain && bash scripts/install.sh`
3. They set their own API key in `~/team-brain/.env`
4. Each person's `~/team-brain/` is private — nothing shared

**Optional:** Create a shared `raw/team-docs/` seed pack — a zip of your team's most important docs that devs unzip into their `raw/team-docs/` folder before first compile. Instant shared baseline knowledge.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `brain: command not found` | Run `npm link` in engine dir, or add to PATH manually |
| `ANTHROPIC_API_KEY not set` | Add key to `~/team-brain/.env` |
| Compile produces empty wiki | Check that `raw/` has `.md` or `.txt` files |
| RAG returns no results | Check `RAG_BASE_URL` is reachable: `curl -X POST $RAG_BASE_URL/search -d '{"query":"test","top_k":3}'` |
| Cursor doesn't see MCP tools | Restart Cursor after editing `~/.cursor/mcp.json` |
| `brain serve` exits immediately | Run `brain serve` (no flags) — it's a long-running stdio process, don't run in terminal directly |
