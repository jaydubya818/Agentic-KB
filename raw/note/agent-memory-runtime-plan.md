---
title: "Ultra Plan — Agent Memory Runtime for Agentic-KB"
type: note
tags: [agentic, multi-agent, memory, orchestration, context-management]
date: 2026-04-09
---

# Ultra Plan — Agent Memory Runtime for Agentic-KB

## Context

Agentic-KB today is a Karpathy-style compiled wiki with a Next.js web app (`web/`), a Node CLI (`cli/kb.js`), and an MCP server (`mcp/server.js`) sitting on top of a filesystem-backed `wiki/` tree. It already has namespace RBAC (`web/src/lib/rbac.ts`), hybrid graph+keyword search (`web/src/lib/graph-search.ts`), an append-only audit log (`web/src/lib/audit.ts`), frontmatter helpers (`web/src/lib/articles.ts`), and multi-vault support.

The user wants to extend — not replace — this into a **real operational agent memory runtime**: a layered brain where orchestrator / lead / worker agents each get bounded, scoped context, know exactly where to write task outputs, can publish discoveries and escalations to bus channels, and can promote learnings up the hierarchy. All wired through the existing web/CLI/MCP surfaces with tests.

Single master vault with strict namespaces is the default; per-agent vault isolation stays optional.

---

## Architecture Overview

```
wiki/system/             -- schemas, templates, routing, policies, bus/
wiki/agents/{tier}/{id}/ -- profile, hot, working, learned, task-log, rewrites/
wiki/domains/{domain}/   -- domain-shared knowledge
wiki/projects/{project}/ -- prd, specs, plan, decisions, test-strategy
wiki/archive/            -- archived bus items, retired rewrites, compacted hot snapshots

config/agents/*.yaml     -- machine-readable agent contracts (with context_policy)
config/identities.yaml   -- humans / agents / services / teams trust registry

lib/agent-runtime/       -- NEW shared runtime (plain Node ESM, zero framework deps)
  contracts.ts           -- load + validate YAML contracts + context_policy
  identity.ts            -- unified identity model: human | agent | service | team
  paths.ts               -- glob matching, forbidden-path guards, memory-class routing
  memory-classes.ts      -- profile|hot|working|learned|rewrite|bus class metadata + helpers
  context-loader.ts      -- tier+domain+project+subscription aware bundle builder
  state-machines.ts      -- bus / standards / rewrite status transitions (schema-backed)
  writeback.ts           -- transactional close-task; hot/working/learned/rewrite writers
  bus.ts                 -- publish + list + transition bus items
  promotion.ts           -- promote with provenance; canonical rewrite merge path
  retention.ts           -- hot compaction, bus TTL, archive moves (never delete)
  observability.ts       -- structured traces for load + guard decisions
  frontmatter.ts         -- gray-matter wrapper with memory-class + state fields
  audit.ts               -- thin wrapper over web/src/lib/audit.ts via shared jsonl writer
  index.ts               -- public exports

  Runtime is importable by:
    - web/  (via `import { ... } from '../../../lib/agent-runtime'` or tsconfig path alias)
    - cli/  (direct Node require — kb.js stays dependency-free by calling new API routes;
             but `kb agent close-task` can also shell directly into the runtime for offline mode)
    - mcp/  (direct import — MCP tools call the runtime without going through HTTP)

web/src/app/api/agents/  -- NEW API routes
  [id]/context/route.ts        GET  scoped context bundle
  [id]/close-task/route.ts     POST end-of-task writeback
  bus/[channel]/route.ts       GET/POST bus items
  promote/route.ts             POST promote a bus item
  list/route.ts                GET list all agents

web/src/app/agents/      -- NEW web pages
  page.tsx                     agent roster
  [id]/page.tsx                profile + scoped context preview + recent writes
  bus/[channel]/page.tsx       bus channel viewer

cli/kb.js                -- NEW subcommands: agent list/show/context/close-task, bus list, promote

mcp/server.js            -- NEW tools: load_agent_context, append_agent_memory,
                            write_rewrite_artifact, publish_discovery, publish_escalation,
                            promote_learning, list_agent_bus_items

tests/agents/            -- NEW test suite (node --test)
```

---

## Revisions from review feedback (applied)

1. **Shared runtime module** — core logic lives in `lib/agent-runtime/` (framework-agnostic Node ESM). Web API routes, CLI, and MCP all import the same module. No duplicated logic. TypeScript compiles through web's existing tsconfig; CLI/MCP import the compiled `.js` (or run via `tsx`/`ts-node` — decided at impl time based on repo's current pattern, default: plain `.mjs` in `lib/agent-runtime/` to avoid adding a build step for non-web surfaces).

2. **Memory-class model** — every agent file declares `memory_class: profile | hot | working | learned | rewrite | bus` in frontmatter. `memory-classes.ts` exposes `classFor(path)`, `defaultLocationFor(agentId, class)`, `retentionPolicyFor(class)`, `isAppendOnly(class)`. Templates in `wiki/system/templates/` ship with the right class preset. Writeback routes by class, not by filename.

3. **State machines** — `state-machines.ts` defines:
   - **bus**: `draft → open → acknowledged → in_progress → resolved | promoted | rejected | archived`
   - **standards**: `draft → proposed → approved → active → superseded → archived`
   - **rewrite**: `draft → submitted → under_review → approved → merged | rejected | withdrawn → archived`
   Schemas at `wiki/system/schemas/{bus,standards,rewrite}-states.schema.json`. All transitions go through `transition(item, toState, actor)` which validates legality, stamps frontmatter `status`, `status_history[]`, and writes an audit entry. Illegal transitions throw.

4. **context_policy in contracts** — replaces the raw `allowed_reads` globs as the primary loading driver. Example shape:
   ```yaml
   context_policy:
     tier: worker
     domain: engineering
     include:
       - class: profile, scope: self
       - class: hot, scope: self
       - class: learned, scope: [self, lead:planning-agent]
       - class: rewrite, scope: self, status: [approved, merged]
       - path: wiki/projects/{{project}}/specs.md
       - path: wiki/domains/{{domain}}/standards/**
     subscriptions:
       bus:
         - channel: standards, from_tier: [lead, orchestrator], status: active
         - channel: handoffs, to: self
     budget_bytes: 40960
     priority_order: [profile, hot, project, subscriptions, learned, standards]
   allowed_writes:   # still enforced as a hard guard on top of policy
     - ...
   forbidden_paths:
     - ...
   ```
   `context-loader.ts` evaluates tier + domain + project + subscriptions → resolves each include rule → ranks by `priority_order` → applies budget → emits a trace.

5. **Canonical merge path for rewrites** — `promotion.ts::mergeRewrite(rewriteId, {approver})`:
   - Requires rewrite in `approved` state
   - Reads canonical doc (e.g. `wiki/projects/{project}/prd.md`)
   - Writes new canonical content with frontmatter `merged_from: <rewrite-id>`, appends provenance block at bottom: `> Merged from [[rewrite-id]] by <approver> on <date>`
   - Snapshots previous canonical to `wiki/archive/merges/{project}/{doc}-{timestamp}.md`
   - Transitions rewrite to `merged`, writes `merged_to` and `merged_at`
   - Audit op `rewrite-merge` with full before/after hashes
   - Rejected merges leave canonical untouched

6. **Unified identity model** — `identity.ts` extends `web/src/lib/rbac.ts`:
   ```ts
   type IdentityKind = 'human' | 'agent' | 'service' | 'team'
   interface Identity {
     id: string
     kind: IdentityKind
     namespace: string
     acl: ACL
     tier?: AgentTier        // agents only
     contractId?: string     // agents only
     team?: string           // humans/agents
     source: 'header' | 'token' | 'agent-contract' | 'default'
   }
   ```
   `resolveIdentity(request)` now returns this unified shape. `rbac.ts::canRead/canWrite` stay as the single ACL gate; agent contracts layer on top. Humans and agents share the audit log with the same schema (`identity_kind` added).

7. **Retention & compaction (v1, not future work)** — `retention.ts`:
   - **Hot compaction**: on `closeTask`, if hot.md > 500 words OR task count since last compaction ≥ 10, enqueue compaction (reuses existing compile pipeline with a dedicated system prompt at `wiki/system/templates/hot-compaction-prompt.md`). Old hot snapshotted to `wiki/archive/hot-snapshots/{agent}/{timestamp}.md`.
   - **Bus TTL**: discovery items auto-archive after 30 days unless `promoted` / `in_progress` / pinned. Archive = move to `wiki/archive/bus/{channel}/{year}/{id}.md` and transition status to `archived`. Triggered by a new nightly lint hook.
   - **Task logs are append-only** — enforced by `memory-classes.ts::isAppendOnly('working') === true` and `writeback.ts` refusing non-append operations against working-class files. Rotation at 10k lines → snapshot + fresh log.
   - **Archive, never delete** — every retention action is a move into `wiki/archive/...` with audit entry. No `fs.unlink` in the runtime.

8. **First-class observability** — `observability.ts` emits structured `ContextLoadTrace` and `GuardDecisionTrace`:
   ```ts
   interface ContextLoadTrace {
     agent_id, project, tier, budget_bytes,
     included: Array<{path, class, reason, bytes, priority}>
     excluded: Array<{path, reason}>   // 'forbidden' | 'budget' | 'policy-miss' | 'wrong-state'
     budget_used, budget_remaining, truncated: boolean
     duration_ms, policy_version
   }
   interface GuardDecisionTrace {
     agent_id, op, path, decision: 'allow' | 'deny'
     reason, matched_rule, timestamp
   }
   ```
   Traces are:
   - Returned inline from `loadAgentContext()` and `closeTask()` responses
   - Written to `logs/agent-runtime.log` (JSONL, same format as audit.log)
   - Rendered in the web UI `/agents/[id]` page as a "Last load" panel + "Recent guard decisions" timeline
   - Queryable via `kb agent trace <agent-id> [--last N]`

## Key Design Choices

1. **One master vault, namespaces enforce isolation.** Each agent contract declares `allowed_reads` / `allowed_writes` / `forbidden_paths` as glob patterns. The `paths.ts` guard is the single chokepoint every write flows through. This layers cleanly onto existing `rbac.ts` — agent identity becomes a new identity source alongside `header` / `token` / `default`.

2. **Contracts live in `config/agents/*.yaml`** (not inside wiki/), because they're runtime config, not knowledge. Loaded once at request time via `js-yaml` (already transitively available) or a tiny hand-rolled loader to avoid a new dep.

3. **Context bundles are built, not streamed.** `loadAgentContext(agentId, { project })` returns `{ files: [{path, content, tier}], budgetUsed, truncated }`. Worker tier only loads: own profile/hot/gotchas + declared lead standards + project specs. Leads add: promoted worker outputs + bus inbox. Orchestrators add: system policies + lead summaries. Budget is byte-capped per tier (defaults: worker 40KB, lead 80KB, orchestrator 160KB) with LRU eviction by `updated` frontmatter.

4. **Writeback is transactional.** `closeTask(agentId, {project, summary, discoveries, escalations, gotchas, rewrites})` runs all writes through `paths.ts` guard, appends audit entries, and fails atomically — any guard rejection aborts the whole close.

5. **Bus items are markdown files with frontmatter** at `wiki/system/bus/{channel}/{id}.md`. IDs are `{channel}-{YYYY-MM-DD}-{nnn}`. This keeps them inside the existing search/graph/lint pipeline for free.

6. **Promotion is a rewrite + backlink, never a move.** `promoteLearning(itemId, targetPath)` writes a new file at the target path with `promoted_from: <original-id>`, and updates the source with `status: promoted` and `promoted_to: <new-path>`. Full audit trail in `logs/audit.log` with new op `op:agent-promote`.

7. **Reuse, not reinvent.**
   - `articles.ts::parseArticle` for all reads
   - `rbac.ts::resolveIdentity` extended with an `agent` source
   - `audit.ts::appendAuditLog` for all writes (new ops: `agent-read`, `agent-write`, `agent-promote`, `bus-publish`)
   - `gray-matter` (already a dep) for frontmatter I/O
   - CLI pattern from `cli/kb.js` — each new command just hits a new `/api/agents/*` route
   - MCP tool pattern from `mcp/server.js` — new tools dispatch to same HTTP endpoints

---

## Recommended Enhancements (my suggestions on top of the brief)

1. **Budget-aware context loader with provenance.** Every file in a context bundle carries `{source_tier, priority, size}` so agents know what they're reading and why it was included. Prevents silent truncation.

2. **Hot memory compaction.** After N task closes (default 10), trigger a Claude-backed compaction of `hot.md` against `task-log.md` to keep hot under 500 words (mirrors the existing KB `hot.md` convention). Reuses the compile pipeline machinery.

3. **Escalation SLA.** Escalation bus items get a `sla_deadline` frontmatter field. A new lint check (`web/src/lib/agents/lint-escalations.ts`) flags breaches, piggybacking on the existing scheduled lint task.

4. **Rewrite diffs, not overwrites.** PRD/spec/plan rewrites land in `agents/{id}/rewrites/{type}/{project}-{timestamp}.md` as full rewrites AND a sibling `.diff.md` against the canonical project doc. Leads review and merge; workers never mutate project docs directly.

5. **Contract hot-reload + dry-run.** `kb agent show <id> --dry-run <task.json>` simulates a `close-task` call and returns which writes would succeed/fail. Makes authoring contracts safe.

6. **Audit lens in the web UI.** `/agents/[id]` page has a "recent writes" timeline driven by `logs/audit.log` filtered by agent identity. Free observability.

7. **Sample end-to-end walkthrough script** (`scripts/agents-demo.sh`) that exercises the full flow: load context → do task → close task → publish discovery → promote → verify. Doubles as smoke test.

8. **Contract schema file** at `wiki/system/schemas/agent-contract.schema.json` with JSON Schema validation, so contracts fail loudly at load time.

9. **Tier-aware MCP tool gating.** The MCP `load_agent_context` tool takes an `agent_id` and resolves all downstream writes through that agent's contract, so a worker-tier MCP session literally cannot write outside its sandbox even if the LLM tries.

10. **Bus channel TTLs.** Discovery items auto-archive after 30 days unless `promoted` or pinned; keeps the bus from becoming a graveyard.

---

## File-by-File Plan

### New files

**Contracts & schemas**
- `config/agents/architecture-agent.yaml` — orchestrator sample
- `config/agents/planning-agent.yaml` — lead sample
- `config/agents/gsd-executor.yaml` — worker sample
- `wiki/system/schemas/agent-contract.schema.json`
- `wiki/system/schemas/bus-item.schema.json`
- `wiki/system/policies/tier-loading-policy.md`
- `wiki/system/routing/writeback-routes.md`
- `wiki/system/templates/{profile,hot,task-log,gotchas,discovery,escalation,standard,handoff}.md`

**Agent memory tree (seed)**
- `wiki/agents/orchestrators/architecture-agent/{profile,hot,working-memory,decisions,routing-rules,standards-authored}.md`
- `wiki/agents/leads/planning-agent/{profile,hot,sprint-state,domain-standards,promoted-learnings}.md` + `rewrites/{prds,specs,plans}/.gitkeep`
- `wiki/agents/workers/gsd-executor/{profile,hot,task-log,gotchas,scratch}.md` + `rewrites/{prds,specs,test-plans}/.gitkeep`
- `wiki/domains/{platform,api,qa,product,security}/.gitkeep`
- `wiki/projects/example-project/{prd,specs,implementation-plan,decisions,test-strategy,release-notes}.md`
- `wiki/system/bus/{discovery,escalation,standards,handoffs}/.gitkeep`

**Shared runtime module** (`lib/agent-runtime/`, plain `.mjs` ESM — importable by web/cli/mcp)
- `contracts.mjs` — `loadContract(id)`, `listContracts()`, `validateContract()`, resolves `context_policy`
- `identity.mjs` — unified identity model (human|agent|service|team)
- `paths.mjs` — glob matching, forbidden-path guards, memory-class path routing
- `memory-classes.mjs` — class metadata (profile|hot|working|learned|rewrite|bus), retention policy per class, append-only flag
- `state-machines.mjs` — bus / standards / rewrite transition tables + `transition()`
- `context-loader.mjs` — tier+domain+project+subscription bundle builder; emits `ContextLoadTrace`
- `writeback.mjs` — transactional `closeTask()`, `appendTaskLog()`, `updateHotMemory()`, `writeRewrite()`, `updateLearned()`
- `bus.mjs` — `publishBusItem()`, `listBusItems()`, `readBusItem()`, `transitionBusItem()`
- `promotion.mjs` — `promoteLearning()`, `mergeRewrite()` (canonical merge path)
- `retention.mjs` — `compactHotMemory()`, `archiveBusItem()`, `rotateTaskLog()`, `archiveMove()`
- `observability.mjs` — `ContextLoadTrace`, `GuardDecisionTrace`, JSONL writer to `logs/agent-runtime.log`
- `frontmatter.mjs` — gray-matter wrapper with memory-class + state fields
- `audit.mjs` — shared JSONL appender (compatible with existing `logs/audit.log` schema + new fields)
- `ids.mjs` — deterministic bus/rewrite/snapshot ID generation
- `types.d.ts` — TypeScript ambient declarations for web consumers
- `index.mjs` — public exports

**API routes**
- `web/src/app/api/agents/list/route.ts`
- `web/src/app/api/agents/[id]/route.ts`
- `web/src/app/api/agents/[id]/context/route.ts`
- `web/src/app/api/agents/[id]/close-task/route.ts`
- `web/src/app/api/agents/bus/[channel]/route.ts`
- `web/src/app/api/agents/bus/[channel]/[id]/route.ts`
- `web/src/app/api/agents/promote/route.ts`

**Web pages**
- `web/src/app/agents/page.tsx` — roster
- `web/src/app/agents/[id]/page.tsx` — profile + scoped-context preview + audit timeline
- `web/src/app/agents/bus/[channel]/page.tsx` — bus viewer
- `web/src/components/AgentContextPreview.tsx`
- `web/src/components/BusItemCard.tsx`

**Tests** (`node --test`, no new deps)
- `tests/agents/paths.test.mjs` — glob + forbidden-path rules
- `tests/agents/context-loader.test.mjs` — tier budgets, scoped reads
- `tests/agents/writeback.test.mjs` — atomic close-task, rejection on forbidden write
- `tests/agents/bus.test.mjs` — publish + list + read
- `tests/agents/promotion.test.mjs` — promote with traceability
- `tests/agents/cli.test.mjs` — CLI command smoke tests
- `tests/agents/fixtures/` — throwaway vault

**Scripts**
- `scripts/agents-demo.sh` — end-to-end walkthrough

### Modified files

- `cli/kb.js` — register `agent`, `bus`, `promote` subcommands (extend existing dispatch on ~line 22)
- `mcp/server.js` — register 7 new tools in `ListToolsRequestSchema` handler (~line 122) and dispatch in `CallToolRequestSchema` handler (~line 217)
- `web/src/lib/audit.ts` — add new op types: `agent-read`, `agent-write`, `agent-promote`, `bus-publish`
- `web/src/lib/rbac.ts` — add optional `agent` identity source so existing ACL pipeline can gate agent-sourced writes
- `web/src/lib/articles.ts` — add `listFilesUnder(globPattern)` helper if not already present
- `README.md` — short new "Agent Memory Runtime" section with quickstart
- `CLAUDE.md` — append AGENT MEMORY workflow section

---

## Verification Plan

```bash
# 1. Unit tests
node --test tests/agents/

# 2. Start server
cd web && PORT=3002 npm run dev

# 3. End-to-end demo
./scripts/agents-demo.sh
# expects:
#   - kb agent list            → 3 agents
#   - kb agent show gsd-executor
#   - kb agent context gsd-executor --project example-project
#       → prints scoped bundle, ≤ worker budget, no orchestrator files
#   - kb agent close-task gsd-executor --project example-project --payload demo-task.json
#       → writes task-log, hot, gotchas, rewrite, discovery bus item
#   - kb bus list discovery    → shows new item
#   - kb promote disc-<id>     → creates promoted artifact, marks source promoted

# 4. Forbidden-write guard
kb agent close-task gsd-executor --project example-project --payload forbidden.json
# → exits non-zero, nothing written, audit log shows rejection

# 5. MCP smoke
node mcp/server.js  # then from Claude Desktop:
#   load_agent_context({agent_id: "gsd-executor", project: "example-project"})
#   publish_discovery({...})
#   promote_learning({item_id: "disc-..."})

# 6. Web UI
open http://localhost:3002/agents
open http://localhost:3002/agents/gsd-executor
open http://localhost:3002/agents/bus/discovery
```

Success criteria:
- All tests green
- Worker context bundle excludes orchestrator paths (asserted)
- Forbidden writes are rejected atomically with audit entry
- Promotion creates backlinked artifact; source marked `promoted`
- Web pages render scoped context preview and audit timeline
- CLI + MCP both exercise the same underlying runtime module

---

## TODOs / Follow-ups (explicitly out of scope for this pass)

- Vector embeddings for context retrieval (current loader is rule-based)
- Per-agent rate limiting
- Agent-to-agent direct message protocol beyond bus channels
- UI for editing agent contracts (manual YAML for now)
- Real integration with GSD/Superpowers/BMAD slash commands (hook points exist; wiring is next milestone)
