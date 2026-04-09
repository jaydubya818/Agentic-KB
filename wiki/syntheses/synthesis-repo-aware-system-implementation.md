---
title: Repo-Aware Knowledge & Agent Memory System — Implementation Summary
type: synthesis
sources:
  - lib/repo-runtime/
  - config/repos/registry.json
  - wiki/repos/
  - web/src/app/api/repos/
  - web/src/app/repos/
  - cli/kb.js
  - mcp/server.js
  - tests/repos/repo-runtime.test.mjs
question: How was the repo-aware organizational brain built on top of Agentic-KB?
tags: [agentic, multi-agent, memory, orchestration, repo-aware, deployment]
created: 2026-04-09
updated: 2026-04-09
---

# Repo-Aware Knowledge & Agent Memory System — Implementation Summary

> Built: April 9, 2026 | Author: Jay West + Claude | Status: Complete

---

## What Was Built

A full **repo-aware organizational brain** layered on top of the existing Agentic-KB architecture. Agents can now load context scoped to a specific GitHub repository, write task logs and progress entries per-repo, publish bus messages into repo-namespaced channels, and have their rewrites tracked against canonical project documents — all without touching the core wiki or any imported mirror files.

One master vault. Five tracked repos. Zero separate vaults.

---

## Architecture Overview

```
Agentic-KB/
├── lib/repo-runtime/          # NEW — shared runtime (9 modules, ~1,800 lines)
├── config/repos/
│   ├── registry.json          # NEW — 5 repos seeded
│   └── auth.example.json      # NEW — PAT template
├── wiki/repos/                # NEW — per-repo namespaces (36 md files)
│   ├── index.md
│   └── <repo>/
│       ├── home.md            canonical/  repo-docs/
│       ├── progress.md        agent-memory/  tasks/
│       ├── CLAUDE.md          rewrites/  bus/
├── web/src/app/
│   ├── api/repos/             # NEW — 8 Next.js API routes
│   └── repos/                 # NEW — 2 UI pages
├── cli/kb.js                  # EXTENDED — 15 new repo/bus/rewrite/canonical cmds
├── mcp/server.js              # EXTENDED — 12 new MCP tools
└── tests/repos/
    └── repo-runtime.test.mjs  # NEW — 29 tests, all passing
```

---

## Tracked Repositories

| Repo | GitHub | Status |
|------|--------|--------|
| Agentic-KB | jaydubya818/Agentic-KB | active |
| Agentic-Pi-Harness | jaydubya818/Agentic-Pi-Harness | pending |
| Pi | jaydubya818/Pi | pending |
| MissionControl | jaydubya818/MissionControl | pending |
| LLMwiki | jaydubya818/LLMwiki | pending |

---

## Shared Runtime: `lib/repo-runtime/`

Nine modules implement the full repo memory lifecycle:

**`registry.mjs`** — CRUD for `config/repos/registry.json`. Functions: `loadRegistry`, `saveRegistry`, `getRepo`, `upsertRepo`, `listRepos`, `markSynced`. Registry is the single source of truth for which repos exist and their sync state.

**`paths.mjs`** — All path computation and import-guard logic. Key functions: `repoWikiRoot`, `repoDocsRoot`, `repoCanonicalRoot`, `importedDocPath`, `isImportedDoc`, `assertNotImportedDoc`. The guard (`assertNotImportedDoc`) throws if an agent tries to write to a mirrored file — enforced at the runtime boundary, not just by convention.

**`metadata.mjs`** — Frontmatter for imported docs. `makeImportedFrontmatter` stamps every synced file with `imported: true`, `source_repo`, `source_path`, `synced_at`. `isImportedContent` detects this marker. Agents reading an imported file can identify it immediately.

**`sync.mjs`** — GitHub API integration. `syncRepo` fetches the repo file tree via the GitHub API, filters with `shouldInclude` (only `.md`, `.mjs`, `.ts`, `.json`; skips `node_modules`, `dist`, `.git`, etc.), writes files to `wiki/repos/<repo>/repo-docs/raw-imports/`, and calls `markSynced`. Requires a GitHub PAT via `token` param or `GITHUB_PAT` env var.

**`writeback.mjs`** — Agent task persistence. `appendRepoProgress` → `wiki/repos/<repo>/progress.md`. `writeRepoTaskLog` → `wiki/repos/<repo>/tasks/<agent>.md` with timestamped entries. Both are append-only.

**`bus.mjs`** — Repo-scoped bus channels (`discovery`, `escalation`, `standards`, `handoffs`). `publishRepoBusItem` generates a ULID, writes `wiki/repos/<repo>/bus/<channel>/<id>.md`. `listRepoBusItems` returns items with optional status filter. `transitionRepoBusItem` patches frontmatter status in place.

**`context-loader.mjs`** — `loadRepoContext` assembles a prioritized, token-budgeted context bundle. Priority order: canonical docs → progress.md → agent memory (hot, profile) → repo-docs → bus discovery. Respects `budgetBytes` (default 50k).

**`templates.mjs`** — Canonical document generators. Produces filled-in frontmatter + structured body for: `PRD`, `APP_FLOW`, `TECH_STACK`, `FRONTEND_GUIDELINES`, `BACKEND_STRUCTURE`, `IMPLEMENTATION_PLAN`, `CLAUDE.md` (repo-scoped), `home.md`, `progress.md`. All templates include the repo name, type, and status: draft.

**`index.mjs`** — Re-exports everything. Has `index.d.ts` for TypeScript consumers.

---

## Web API Routes: `web/src/app/api/repos/`

Eight Next.js 15 App Router routes (all `force-dynamic`):

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/repos` | GET, POST | List repos; add/update repo in registry |
| `/api/repos/[repo]` | GET | Get single repo record (404 if missing) |
| `/api/repos/[repo]/sync` | GET, POST | Sync status; trigger GitHub sync |
| `/api/repos/[repo]/search` | GET | Full-text search within `wiki/repos/<repo>/` |
| `/api/repos/[repo]/docs` | GET | List imported files from `repo-docs/` |
| `/api/repos/[repo]/bus/[channel]` | GET, POST | List / publish bus items |
| `/api/repos/[repo]/close-task` | POST | Agent task writeback (task log + progress) |
| `/api/repos/[repo]/context` | GET | Load repo context bundle for an agent |

All routes follow the same patterns as the existing agent routes: `params` as `Promise<{...}>`, `DEFAULT_KB_ROOT` from `@/lib/articles`, try/catch with `{ error }` at 400, identity resolution from `X-Identity-*` headers.

---

## Web UI Pages: `web/src/app/repos/`

**`/repos`** — Repo list page. Table view with status badges, last-synced timestamps, doc counts. Per-row Sync button (POST → `/api/repos/[repo]/sync`). Links to detail page.

**`/repos/[repo]`** — Repo detail page with 5 tabs:
- **Overview** — renders `home.md`
- **Canonical Docs** — lists canonical doc files with sizes
- **Bus** — discovery + escalation feed
- **Progress** — `progress.md` log
- **Search** — live search against `/api/repos/[repo]/search`

Both are client components using React hooks for tab state and data fetching.

---

## CLI Extensions: `cli/kb.js`

Fifteen new commands in four groups:

```bash
# Repo lifecycle
kb repo list
kb repo show <name>
kb repo sync <name> [--token <pat>]
kb repo sync-all [--token <pat>]
kb repo search <name> <query>
kb repo status <name>
kb repo docs <name> [--section <s>]
kb repo progress <name>
kb repo close-task <name> <agent> <entry>

# Bus (repo-scoped)
kb bus list <name> <channel>
kb bus publish <name> <channel> --from <id> --body <text>
kb bus transition <name> <channel> <id> <status>

# Rewrites and canonical docs
kb rewrite list <name>
kb canonical list <name>
kb canonical show <name> <doc>
```

All commands import `lib/repo-runtime/index.mjs` directly for read operations. Sync commands pass `{ token }` through to `syncRepo()`. Output is formatted as padded terminal tables — no external dependencies.

---

## MCP Tools: `mcp/server.js`

Twelve new tools added to the existing MCP server (now 23 total tools):

| Tool | Purpose |
|------|---------|
| `list_repos` | List tracked repos with optional status filter |
| `get_repo_home` | Read `wiki/repos/<repo>/home.md` |
| `sync_repo_markdown` | Fetch GitHub files → `repo-docs/raw-imports/` |
| `search_repo_docs` | Full-text search within repo namespace |
| `load_repo_context` | Token-budgeted context bundle for an agent |
| `append_repo_progress` | Append to `progress.md` |
| `write_repo_task_log` | Append agent task entry |
| `write_rewrite_artifact` | Create rewrite in `wiki/repos/<repo>/rewrites/<type>/` |
| `publish_repo_discovery` | Publish to `bus/discovery/` |
| `publish_repo_escalation` | Publish to `bus/escalation/` |
| `list_repo_bus_items` | List bus items with channel + status filter |
| `promote_repo_learning` | Transition bus item to `promoted` + copy to target |

---

## Tests: `tests/repos/repo-runtime.test.mjs`

29 tests, all passing (`node tests/repos/repo-runtime.test.mjs`):

| Group | Tests | Coverage |
|-------|-------|---------|
| Registry | 4 | loadRegistry, upsertRepo, listRepos filter, markSynced |
| Paths | 4 | repoWikiRoot, repoDocsRoot, importedDocPath, isImportedDoc |
| Metadata | 3 | makeImportedFrontmatter, parseImportedMeta, isImportedContent |
| Writeback | 3 | appendRepoProgress, writeRepoTaskLog, non-overwrite |
| Bus | 4 | publishRepoBusItem, listRepoBusItems, filter by status, transition |
| Path Guards | 3 | assertNotImportedDoc throws/passes, isImportedDoc false |
| Templates | 4 | generateCanonicalTemplate × 3, generateProgressPage, generateRepoCLAUDE, generateHomePage |
| Context Loader | 2 | empty repo returns `{ files:[], totalBytes:0 }`, no throw on missing dirs |

Uses Node's built-in `node:test` runner. Isolated temp directories per run.

---

## Design Decisions and Enhancements

### Separation of imported vs. operational docs
Mirrored GitHub files land in `wiki/repos/<repo>/repo-docs/raw-imports/` and are stamped `imported: true` in frontmatter. `assertNotImportedDoc` throws at runtime if an agent tries to write to one. This keeps the GitHub mirror read-only without any filesystem permission magic.

### Single vault, namespaced
Rejecting the "separate vault per repo" anti-pattern. All repos live under `wiki/repos/<repo>/` inside the one Agentic-KB vault. This means cross-repo searches, shared index, shared MCP server, and unified CLI — with no symlinks or mounted volumes.

### Repo-scoped bus channels
Each repo has its own `bus/` directory with four channels (`discovery`, `escalation`, `standards`, `handoffs`). This prevents cross-repo bus pollution while keeping the same state machine semantics as the global agent bus.

### Token-budgeted context loading
`loadRepoContext` implements the same proportional bucket allocation as the agent context loader, with a repo-specific priority order: canonical docs first (agents need the PRD/TECH_STACK), then progress, then memory, then imported docs, then bus items. Budget defaults to 50k bytes.

### Auth handled outside the runtime
GitHub PATs are not stored in `registry.json`. The sync function accepts a `token` param; the auth.example.json shows the intended pattern of reading from environment variables. The MCP tool checks `process.env.GITHUB_PAT` as a fallback. Secrets never land in the wiki.

---

## What Agents Can Now Do

An agent working on the `Pi` repo can:

1. Call `load_repo_context` → get PRD, TECH_STACK, progress, hot cache in one call
2. Call `write_repo_task_log` → append its work log to `wiki/repos/Pi/tasks/<agent>.md`
3. Call `publish_repo_discovery` → drop a finding in `wiki/repos/Pi/bus/discovery/`
4. Call `write_rewrite_artifact` → create a spec rewrite in `wiki/repos/Pi/rewrites/specs/`
5. Call `append_repo_progress` → mark a milestone in `progress.md`
6. Have a human call `promote_repo_learning` → elevate a bus item to a canonical location
7. Have an orchestrator call `sync_repo_markdown` → pull the latest from GitHub

All without touching the core wiki, without scribbling over imported mirror files, and without knowing anything about other repos in the vault.

---

## Files Created / Modified

**New files (all new):**
- `lib/repo-runtime/` — 9 `.mjs` modules + `index.d.ts` (~1,850 lines)
- `config/repos/registry.json` — 5 repo records
- `config/repos/auth.example.json` — PAT template
- `wiki/repos/` — 36 markdown files across 5 repos
- `web/src/app/api/repos/` — 8 route files (~525 lines)
- `web/src/app/repos/page.tsx` — repo list UI (~280 lines)
- `web/src/app/repos/[repo]/page.tsx` — repo detail UI (~505 lines)
- `tests/repos/repo-runtime.test.mjs` — 29 tests (~385 lines)

**Modified files:**
- `cli/kb.js` — +15 commands (~320 lines added)
- `mcp/server.js` — +12 MCP tools (~380 lines added)
- `wiki/log.md` — appended
- `wiki/index.md` — updated (via auto-reindex)

**Total new code:** ~4,245 lines across 26 files.

---

## Next Steps (Recommended)

1. **Activate remaining repos** — flip `Agentic-Pi-Harness`, `Pi`, `MissionControl`, `LLMwiki` to `active` in `registry.json` and run `kb repo sync-all` with a valid PAT
2. **Write agent contracts** — add `context_policy` blocks scoped to specific repos for the orchestrator and lead agents
3. **Real GitHub sync test** — run `kb repo sync Agentic-KB` to verify the sync pipeline against live data
4. **Canonical doc authoring** — fill in the PRD.md and TECH_STACK.md stubs for each repo
5. **Re-evaluate** — after 30 days of use, assess whether bus channel proliferation needs a cleanup policy
