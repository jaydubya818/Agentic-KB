Build a complete Node.js TypeScript monorepo called "team-brain" in the current directory. This is a greenfield project — a local-first personal knowledge base starter kit for software developers. Each developer runs their own instance. No shared server. No shared database.

## What to build

Monorepo structure:
```
team-brain/
├── packages/
│   ├── core/          shared domain logic
│   ├── cli/           `brain` CLI
│   └── mcp/           stdio MCP server
├── scaffold/          template copied to ~/team-brain on `brain init`
├── scripts/
│   ├── install.sh     Mac/Linux one-command installer
│   └── install.ps1    Windows one-command installer
├── tests/             vitest test suite
├── package.json       monorepo root
└── tsconfig.base.json
```

---

## packages/core/src/config.ts

```typescript
export interface BrainConfig {
  root: string;
  brainName: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
  ragEnabled: boolean;
  ragBaseUrl?: string;
  ragApiKey?: string;
  ragNamespace?: string;
  obsidianVaultPath?: string;
  obsidianSyncFolders?: string[];
  obsidianWriteBack?: boolean;
  obsidianWriteBackFolder?: string;
}

export async function resolveBrainConfig(opts?: { brainRoot?: string }): Promise<BrainConfig>
```

Resolution order: opts.brainRoot → BRAIN_ROOT env var → ~/team-brain
Load .env at brain root (dotenv). Load brain.config.json at brain root if exists.

---

## packages/core/src/paths.ts

```typescript
export function brainPaths(root: string) {
  return {
    raw:             path.join(root, 'raw'),
    wiki:            path.join(root, 'wiki'),
    hot:             path.join(root, 'wiki', 'hot.md'),
    index:           path.join(root, 'wiki', 'index.md'),
    log:             path.join(root, 'wiki', 'log.md'),
    outputs:         path.join(root, 'outputs'),
    config:          path.join(root, 'brain.config.json'),
    env:             path.join(root, '.env'),
    claudeMd:        path.join(root, 'CLAUDE.md'),
    compiled:        path.join(root, 'raw', '.compiled-log.json'),
    obsidianSyncLog: path.join(root, 'raw', '.obsidian-sync-log.json'),
  };
}
```

---

## packages/core/src/compile.ts

Export `runCompile(config: BrainConfig, opts?: { force?: boolean }): Promise<CompileResult>`.

Logic:
1. Walk raw/ recursively. Collect .md, .txt files. For .pdf use pdfjs-dist to extract text. For .docx use mammoth.
2. Load raw/.compiled-log.json (map of filepath → contenthash). Skip already-compiled unchanged files unless opts.force.
3. For each new/changed file, call Claude API (model: claude-sonnet-4-6, max_tokens: 8000) with:
   - System prompt: read CLAUDE.md from brain root
   - User: `Compile this source into wiki pages.\n\nSource: {filename}\n\n{content}\n\nRespond with JSON only: { "pages": [{ "path": "wiki/subdir/slug.md", "content": "full markdown with frontmatter" }], "log": "one-line summary" }`
4. Parse JSON response. Write each page to wiki/{path}, creating dirs as needed.
5. Update .compiled-log.json with new hash.
6. Append to wiki/log.md: `- {timestamp} | {source} | {pages created} | {log summary}`
7. Return `{ filesProcessed, pagesWritten, errors: string[] }`.

If no Anthropic key but OpenAI key present: use gpt-4o model via openai package.
If neither key: throw `Error("Set ANTHROPIC_API_KEY in ~/team-brain/.env")`.
Per-file errors are non-fatal — catch, push to errors[], continue.

---

## packages/core/src/search.ts

Export `searchWiki(query: string, config: BrainConfig, opts?: { scope?: 'all'|'wiki'|'raw' }): Promise<SearchResult[]>`.

```typescript
interface SearchResult {
  path: string;
  title: string;
  excerpt: string;
  score: number;
}
```

Logic:
1. Always read wiki/hot.md first — inject as first result if it exists and query matches any word.
2. Walk wiki/ (or raw/ if scope=raw, or both if scope=all).
3. Score each file: count query term occurrences in title (×3) + body (×1). Normalize by doc length.
4. Return top 10 by score.

No vector DB. No embeddings. Plain TF-IDF keyword scoring only.

---

## packages/core/src/ask.ts

Export `runAsk(question: string, config: BrainConfig): Promise<AskResult>`.

```typescript
interface AskResult {
  answer: string;
  sources: string[];
  ragUsed: boolean;
}
```

Logic:
1. Call searchWiki() → top 10 results.
2. Read full content of top 5 (cap total at 20,000 chars).
3. If config.ragEnabled: call ragBridge(question, config) → append chunks to context.
4. Call Claude API:
   - System: `You are a personal knowledge assistant. Answer using ONLY the provided context. Cite sources as [[filename]]. If the answer is not in the context, say exactly: "Not in KB. Suggest: brain ingest <source>"`
   - User: `{question}\n\n## Wiki Context\n\n{pages content}\n\n## Company RAG\n\n{rag chunks if any}`
5. Extract [[source]] citations from answer.
6. Return `{ answer, sources, ragUsed: ragChunks.length > 0 }`.

---

## packages/core/src/rag.ts

```typescript
// RAG BRIDGE CONFIGURATION
// Set in ~/team-brain/.env:
//   RAG_ENABLED=true
//   RAG_BASE_URL=https://rag.internal.company.com/api
//   RAG_API_KEY=your-key-here
//   RAG_NAMESPACE=engineering-docs   (optional)
//
// Expected API contract:
//   POST {RAG_BASE_URL}/search
//   Request:  { query: string, top_k: number, namespace?: string }
//   Response: { results: [{ content: string, source: string, score: number }] }
//
// If your RAG API has a different response shape, edit normalizeRagResponse() below.
// Common alternative response keys (chunks, documents, hits, items) are handled automatically.

export interface RagResult {
  chunks: Array<{ content: string; source: string; score: number }>;
  error?: string;
}

export async function ragBridge(query: string, config: BrainConfig): Promise<RagResult>
```

Logic:
1. If !config.ragEnabled or !config.ragBaseUrl: return `{ chunks: [] }`.
2. POST to `{config.ragBaseUrl}/search` with body `{ query, top_k: 5, namespace: config.ragNamespace }`. Header: `Authorization: Bearer {config.ragApiKey}`.
3. Call `normalizeRagResponse(data)` — try keys: results, chunks, documents, hits, items. Each item needs content+source. Score defaults to 1 if missing.
4. On ANY error: log warning to stderr, return `{ chunks: [], error: message }`. Never throw. RAG failure is non-fatal.

---

## packages/core/src/ingest.ts

Export `runIngest(pathOrUrl: string, config: BrainConfig): Promise<void>`.

Logic:
- If starts with http/https: fetch page, extract title + meta description + first 500 chars of body text → write to raw/bookmarks/{slug}.md with frontmatter (title, url, date).
- .pdf → copy to raw/docs/
- .md .txt → copy to raw/notes/
- .docx .pptx → copy to raw/docs/
- Anything else → copy to raw/notes/

Print: `Added → raw/{subdir}/{filename}. Run 'brain compile' to index.`

---

## packages/core/src/lint.ts

Export `runLint(config: BrainConfig): Promise<LintResult>`.

Checks:
- Orphan wiki pages (no [[wikilink]] pointing to them from other pages)
- Pages missing frontmatter title or type field
- Raw files not yet in .compiled-log.json (pending compile)
- wiki/index.md page count out of sync with actual file count

Return `{ orphans: string[], missingFrontmatter: string[], pendingCompile: string[], indexStale: boolean, summary: string }`.

---

## packages/core/src/obsidian.ts

Export these functions:

**`syncFromObsidian(config: BrainConfig): Promise<SyncResult>`**

Logic:
1. If no config.obsidianVaultPath: print warning and return `{ filesCopied: 0, filesSkipped: 0 }`.
2. For each folder in config.obsidianSyncFolders: walk the vault subfolder recursively.
3. For each .md file found: check mtime against raw/.obsidian-sync-log.json (filepath → mtime map).
4. If new or changed: copy to raw/notes/{relative-path-from-vault} preserving subfolder structure.
5. Update raw/.obsidian-sync-log.json.
6. Return `{ filesCopied, filesSkipped }`.

**`writeBackToObsidian(config: BrainConfig): Promise<WriteBackResult>`**

Logic:
1. If !config.obsidianWriteBack or !config.obsidianVaultPath: return `{ pagesWritten: 0 }`.
2. Target folder: `{config.obsidianVaultPath}/{config.obsidianWriteBackFolder ?? 'Brain'}/`.
3. Mirror entire wiki/ directory into that folder — copy all .md files, preserve subdirs.
4. Obsidian wikilinks `[[wiki/concepts/foo]]` already render correctly in Obsidian — no transformation needed.
5. Write `{obsidianWriteBackFolder}/_index.md` in target folder with link list to all wiki pages.
6. Return `{ pagesWritten }`.

**`watchObsidian(config: BrainConfig, onChange: (files: string[]) => void): chokidar.FSWatcher`**

Logic:
1. Use chokidar to watch each folder in config.obsidianSyncFolders inside the vault.
2. On add/change: debounce 2000ms, call onChange with list of changed .md files.
3. Return the watcher so CLI can close it on Ctrl+C.

---

## packages/core/src/scaffold.ts

Export `runInit(targetDir: string, opts?: { obsidianVaultPath?: string }): Promise<void>`.

1. Create directories: raw/notes, raw/docs, raw/bookmarks, raw/code-snippets, raw/team-docs, wiki, outputs.
2. Write all scaffold/ template files.
3. If opts.obsidianVaultPath provided:
   - Set obsidianVaultPath in brain.config.json.
   - Scan vault for folders starting with numbers (00, 01, 02...) or named Inbox, Notes, Meetings, Journal, Daily.
   - Auto-populate obsidianSyncFolders with detected folders.
   - Run syncFromObsidian() immediately.
   - Print Obsidian checklist (see below).
4. Otherwise print standard checklist.

Standard checklist:
```
✓ Brain created at {targetDir}

Next steps:
  1. Set API key:   echo 'ANTHROPIC_API_KEY=sk-ant-...' >> {targetDir}/.env
  2. Add files:     brain ingest ~/path/to/doc.pdf
  3. Compile:       brain compile
  4. Ask:           brain ask "how do I deploy to staging?"
  5. Wire to IDE:   brain serve --print-config
```

Obsidian checklist:
```
✓ Brain created at {targetDir}
✓ Obsidian vault linked: {vaultPath}
✓ Sync folders detected: {folders}
✓ Initial sync complete: {N} files copied

Next steps:
  1. Set API key:   echo 'ANTHROPIC_API_KEY=sk-ant-...' >> {targetDir}/.env
  2. Compile:       brain compile
  3. Ask:           brain ask "summarize my meeting notes from this week"
  4. Auto-sync:     brain sync --watch   (run in a background terminal)
  5. Wire to IDE:   brain serve --print-config
```

---

## packages/cli/src/index.ts

Use Commander.js. All commands load BrainConfig before running.

### brain init [--target \<dir\>] [--obsidian \<vault-path\>]
Default target: ~/team-brain. Calls runInit(targetDir, { obsidianVaultPath }).

### brain compile [--force]
Calls runCompile(). Show spinner (ora). Print per-file progress. Print summary: "X files processed, Y pages written" or errors.

### brain ask "\<question\>"
Calls runAsk(). Print answer. Print "Sources: [[x]], [[y]]". If ragUsed, print "(+ company RAG)".

### brain ingest \<path-or-url\>
Calls runIngest().

### brain lint
Calls runLint(). Print formatted report.

### brain status
Print:
```
Brain:    ~/team-brain
Raw:      12 files (10 compiled, 2 pending — run `brain compile`)
Wiki:     47 pages
RAG:      enabled → https://rag.company.com/api
Obsidian: linked → ~/Documents/MyVault (sync: Notes, Meetings, Inbox)
API:      Claude (ANTHROPIC_API_KEY set)
```

### brain sync [--watch]
Without --watch:
1. Call syncFromObsidian(). Print "Synced N files from Obsidian vault".
2. Call runCompile() — hash check skips already-compiled files automatically, only newly synced files recompile.
3. If config.obsidianWriteBack: call writeBackToObsidian(). Print "Wrote N wiki pages back to Obsidian Brain folder".

With --watch:
1. Call syncFromObsidian() once first, then runCompile(), then writeBackToObsidian().
2. Start watchObsidian(). On change: syncFromObsidian() → runCompile() → writeBackToObsidian().
3. Print "Watching Obsidian vault... (Ctrl+C to stop)".

### brain serve [--print-config]
If --print-config: print MCP config blocks for Claude Code and Cursor (see below), then exit.
Otherwise: start MCP server (stdio, long-running).

---

## packages/mcp/src/index.ts

Stdio MCP server using @modelcontextprotocol/sdk. Register 5 tools:

**search_brain**
description: "Search your personal knowledge base. Use for questions about your own notes, docs, and expertise."
input: `{ query: z.string(), scope: z.enum(['all','wiki','raw']).optional() }`
Calls searchWiki(). Return top results as formatted text.

**ask_brain**
description: "Ask a question. Get a synthesized answer from your knowledge base + optional company RAG."
input: `{ question: z.string() }`
Calls runAsk(). Return answer + sources.

**ingest_to_brain**
description: "Add a file path or URL to your knowledge base raw folder for indexing."
input: `{ path_or_url: z.string() }`
Calls runIngest().

**brain_status**
description: "Get current status of your knowledge base: page count, pending files, RAG and Obsidian config."
input: `{}`
Returns status summary string.

**sync_from_obsidian**
description: "Sync latest notes from your Obsidian vault into the knowledge base and recompile. Run at the start of a session to get fresh context."
input: `{}`
Calls syncFromObsidian() then runCompile(). Returns sync summary.

---

## brain serve --print-config output

Print this (with real resolved absolute paths):

```
=== MCP Config — Claude Code ===
Add to ~/.claude/settings.json:

{
  "mcpServers": {
    "team-brain": {
      "command": "node",
      "args": ["{absolute_path}/packages/mcp/dist/index.js"],
      "env": { "BRAIN_ROOT": "{home}/team-brain" }
    }
  }
}

=== MCP Config — Cursor ===
Cursor Settings → MCP → Add Server, or edit ~/.cursor/mcp.json:

{
  "mcpServers": {
    "team-brain": {
      "command": "node",
      "args": ["{absolute_path}/packages/mcp/dist/index.js"],
      "env": { "BRAIN_ROOT": "{home}/team-brain" }
    }
  }
}

Restart Claude Code / Cursor after adding.
```

---

## scaffold/ template files

### scaffold/CLAUDE.md
```markdown
# Team Brain — Personal Knowledge Base
> Owner: YOUR_NAME | Domain: YOUR_DOMAIN | Fork and customize this file.

## Purpose
Personal compounding second brain. Drop raw material into raw/, run `brain compile`, ask with `brain ask`.

## Vault Structure
raw/            — your drop zone (never edited by LLM)
  notes/        — personal notes, meeting notes
  docs/         — PDFs, specs, RFCs, Word docs
  bookmarks/    — saved articles (brain ingest <url>)
  code-snippets/— useful patterns with explanations
  team-docs/    — shared team docs you've copied in
wiki/           — LLM-maintained (never edit manually)
  concepts/     — definitions of concepts in your domain
  how-to/       — step-by-step guides
  decisions/    — architecture and technical decisions
  references/   — quick-reference summaries
  hot.md        — most-used context, loaded first on every query
  index.md      — master catalog (auto-maintained)
  log.md        — compile audit trail
outputs/        — generated reports and synthesis

## Obsidian Integration
raw/notes/ mirrors your Obsidian vault sync folders.
wiki/ pages are written back to your Obsidian vault under the "Brain" folder.
Wikilinks use [[wiki/subdir/slug]] syntax — renders natively in Obsidian.
Never edit the Brain/ folder in Obsidian — it is LLM-owned. Edit raw/ instead.

Daily workflow:
  brain sync          → pull latest Obsidian notes + compile + write back to vault
  brain sync --watch  → continuous sync while you work in Obsidian

## Compile Rules (Claude follows these when writing wiki pages)
1. One wiki page per distinct concept, decision, or guide
2. Frontmatter required: title, type (concept|how-to|decision|reference), tags, created, confidence
3. confidence: high=verified docs, medium=inferred, low=speculative
4. Cross-link with [[wiki/path/slug]] — link first mention of every concept
5. Update wiki/index.md with new pages
6. Append to wiki/log.md: timestamp | source | pages created | summary
7. Never write to raw/
8. If concept page exists, UPDATE it — no duplicates

## Query Rules (Claude follows these when answering questions)
1. Read wiki/hot.md first
2. Cite every claim as [[wiki/page]]
3. If answer not in KB: say "Not in KB. Suggest: brain ingest <source>"
4. If RAG results provided, cite as [RAG: source-name]
5. Lead with direct answer, detail after
```

### scaffold/.env.example
```
# AI Backend — set at least one
ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...

# Company RAG (optional)
# RAG_ENABLED=true
# RAG_BASE_URL=https://rag.internal.company.com/api
# RAG_API_KEY=your-rag-key
# RAG_NAMESPACE=engineering-docs

# Obsidian Integration (optional)
# OBSIDIAN_VAULT_PATH=/Users/yourname/Documents/ObsidianVault
# OBSIDIAN_SYNC_FOLDERS=00 - Inbox,01 - Notes,02 - Meetings,03 - Projects
# OBSIDIAN_WRITE_BACK=true
# OBSIDIAN_WRITE_BACK_FOLDER=Brain
```

### scaffold/brain.config.json
```json
{
  "brainName": "my-brain",
  "ragEnabled": false,
  "obsidianVaultPath": "",
  "obsidianSyncFolders": ["Inbox", "Notes", "Meetings"],
  "obsidianWriteBack": true,
  "obsidianWriteBackFolder": "Brain"
}
```

### scaffold/wiki/hot.md
```markdown
# Hot Cache
> ≤500 words. Most-used context. Loaded first on every query. Update manually or via compile.
```

### scaffold/wiki/index.md
```markdown
# Knowledge Base Index
> Auto-maintained by `brain compile`.

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
raw/.obsidian-sync-log.json
outputs/
```

### scaffold/README.md
```markdown
# My Brain

## Commands
brain status
brain ingest <file-or-url>
brain compile
brain ask "your question here"
brain sync
brain sync --watch
brain lint
brain serve --print-config
```

Create empty .gitkeep files in: raw/notes/, raw/docs/, raw/bookmarks/, raw/code-snippets/, raw/team-docs/, wiki/, outputs/

---

## scripts/install.sh
```bash
#!/bin/bash
set -e
echo "=== Team Brain Installer ==="
NODE_VER=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_VER" ] || [ "$NODE_VER" -lt 20 ]; then
  echo "ERROR: Node.js 20+ required. https://nodejs.org"; exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR"
npm install --silent
npm run build --silent
npm link --silent 2>/dev/null || sudo npm link --silent
brain init
echo ""
echo "=== Done! ==="
echo "Next: echo 'ANTHROPIC_API_KEY=sk-ant-...' >> ~/team-brain/.env"
echo "Then: brain compile && brain ask 'test question'"
```

## scripts/install.ps1
```powershell
$ErrorActionPreference = "Stop"
Write-Host "=== Team Brain Installer ===" -ForegroundColor Cyan
$nodeVer = (node --version 2>$null) -replace 'v','' -split '\.' | Select-Object -First 1
if (-not $nodeVer -or [int]$nodeVer -lt 20) {
  Write-Host "ERROR: Node.js 20+ required. https://nodejs.org" -ForegroundColor Red; exit 1
}
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
npm install --silent; npm run build --silent; npm link --silent
brain init
Write-Host "Done! Add ANTHROPIC_API_KEY to ~/team-brain/.env then run: brain compile"
```

---

## Root package.json
```json
{
  "name": "team-brain",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "npm run build -w packages/core && npm run build -w packages/mcp && npm run build -w packages/cli",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "vitest": "^1.6.0",
    "@types/node": "^22.0.0"
  }
}
```

---

## Dependencies

packages/core: `@anthropic-ai/sdk openai dotenv pdfjs-dist mammoth fast-glob gray-matter marked chokidar`
packages/mcp: `@modelcontextprotocol/sdk @team-brain/core dotenv zod fast-glob`
packages/cli: `commander @team-brain/core @team-brain/mcp dotenv chalk ora`

Each package's package.json name field:
- packages/core → `"name": "@team-brain/core"`
- packages/mcp  → `"name": "@team-brain/mcp"`
- packages/cli  → `"name": "@team-brain/cli"`, `"bin": { "brain": "./dist/index.js" }`

---

## Tests (tests/ at root, vitest)

Write tests for:
- Config resolution: env vars override defaults, brain.config.json merges correctly
- brainPaths: all returned paths are under the root dir, obsidianSyncLog path is correct
- ragBridge normalizeRagResponse: handles response shapes with keys results/chunks/documents/hits/items
- runLint: detects orphan pages, detects missing frontmatter title field
- searchWiki: returns results sorted by score, hot.md injected first when query matches
- runInit: creates all required directories and files
- syncFromObsidian: skips unchanged files (mtime check), copies new files to raw/notes/
- writeBackToObsidian: mirrors wiki/ to correct vault subfolder
- watchObsidian: debounces rapid file changes (mock chokidar)

Mock fs and fetch. No real API calls in tests. All tests must pass.

---

## Constraints

- TypeScript strict mode — no `any`
- All async functions have explicit return types
- No hardcoded paths — use brainPaths() everywhere
- ragBridge never throws — always returns `{ chunks: [], error? }`
- compile errors per file are non-fatal — collect and report at end
- Total TypeScript (excluding tests and scaffold) under 2500 lines
- No web dashboard, no vector DB, no embeddings, no multi-brain mode

---

After building: run `npm run build` to verify zero TypeScript errors. Run `npm test` to verify all tests pass. Print a summary of files created and line counts.
