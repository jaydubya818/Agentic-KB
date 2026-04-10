---
repo_name: "Agentic-KB"
repo_visibility: public
source_type: github
branch: main
commit_sha: 844c471f3d48aedc6dd2ad7d79c864b797176b33
source_path: ENTERPRISE_PLAN.md
imported_at: "2026-04-10T21:41:56.328Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Agentic-KB/main/ENTERPRISE_PLAN.md"
---

# Agentic-KB: Enterprise Scaling Ultra Plan

> Informed by Andrej Karpathy's **LLM Knowledge Bases** gist (April 4, 2026) and the emerging
> pattern of agent-native infrastructure. The core insight: *"Every business has a raw/ directory.
> Nobody's ever compiled it. That's the product."*

---

## The Karpathy Shift

Traditional RAG retrieves from raw sources at query time — rediscovering knowledge on every call.
Karpathy's LLM Wiki flips the model: the LLM *compiles* raw sources into a persistent, structured,
interlinked wiki that grows richer with every ingest. Cross-references are pre-built. Synthesis
already reflects everything ingested. Answers come from compiled understanding, not raw retrieval.

**Agentic-KB already has the foundation.** This plan scales it to enterprise: multi-team, multi-vault,
multi-agent, with the compiled-wiki pattern at its core.

---

## Current State (What's Built)

| Feature | Status |
|---|---|
| Multi-vault switcher with file counts | ✅ |
| Live reload via SSE (fs.watch) | ✅ |
| Private PIN access control | ✅ |
| MCP server (5 tools) | ✅ |
| CLI (`kb query`, `kb search`, `kb ingest`) | ✅ |
| Rich wiki index (tag cloud, recently modified) | ✅ |
| Open in Obsidian deep links | ✅ |
| Breadcrumb navigation | ✅ |
| Streaming AI query (`/api/query`) | ✅ |
| Raw doc ingest UI | ✅ |

---

## Priority Tiers

### P0 — Foundational Enterprise (Implement Now)

#### 1. LLM Auto-Compilation (`/api/compile`)
**The Karpathy killer feature.** Raw docs exist but aren't compiled into wiki structure.

- Reads files from `raw/` that haven't been compiled yet (tracks via `raw/.compiled-log.json`)
- Claude reads each raw doc, extracts key ideas, then:
  - Creates/updates the relevant wiki page(s)
  - Updates cross-references in 3–5 existing wiki pages
  - Appends to `wiki/log.md` with what changed and why
  - Marks source as compiled with a timestamp
- Supports `mode: 'full'` (recompile everything) or `mode: 'incremental'` (only new raw docs)
- **SSE streaming** so the UI shows progress in real-time
- Triggered manually from UI, via CLI (`kb compile`), via webhook, or on a cron schedule

#### 2. Wiki Lint (`/api/lint`)
Periodic health check — Claude scans the wiki and reports:
- **Contradictions**: claims in page A that conflict with page B
- **Stale pages**: pages that haven't been touched in 30+ days and reference rapidly-changing topics
- **Orphaned pages**: pages with no inbound links from other wiki pages
- **Knowledge gaps**: topics mentioned but lacking dedicated pages
- Outputs a `wiki/lint-report.md` with severity ratings and suggested fixes

#### 3. Audit Log (`/api/audit-log`)
Append-only JSONL log at `logs/audit.log` capturing every operation:
```json
{"ts":"2026-04-07T12:00:00Z","op":"query","user":"jay","vault":"Agentic-KB","q":"what is agent loop?","pin":false,"latency_ms":1240}
{"ts":"2026-04-07T12:01:00Z","op":"ingest","user":"agent/claude","vault":"Agentic-KB","file":"raw/karpathy-llm-wiki.md"}
{"ts":"2026-04-07T12:02:00Z","op":"compile","user":"cron","pages_updated":7,"pages_created":2}
```
- `GET /api/audit-log` returns last N entries (admin only)
- Foundation for analytics dashboard, compliance exports, and cost tracking

#### 4. Webhook Ingest (`/api/ingest/webhook`)
Allow external systems to push documents without UI interaction:
```bash
curl -X POST https://your-kb.company.com/api/ingest/webhook \
  -H "Authorization: Bearer $WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"title":"Q1 Retro Notes","content":"...","tags":["retro","q1"],"source":"notion"}'
```
Built-in adapters for: **GitHub** (issues, PRs, discussions), **Slack** (threads via `/kb ingest`),
**Notion** (page export), **Jira** (ticket descriptions), generic JSON.

---

### P1 — Scale & Collaboration

#### 5. Semantic Search with Local Embeddings
Replace pure keyword search with vector similarity:
- On ingest/compile, generate embeddings for each wiki page (OpenAI `text-embedding-3-small` or local `nomic-embed-text`)
- Store in a local SQLite vector table (via `better-sqlite3` + cosine similarity)
- `/api/search` returns ranked results by semantic similarity, not just substring match
- Hybrid ranking: `0.7 * semantic_score + 0.3 * keyword_score`
- **Impact**: "what's our deployment strategy?" finds pages titled "release process" and "ship it checklist"

#### 6. Knowledge Graph Visualization
Every wiki page becomes a node; backlinks become edges:
- Parser runs on compile, extracts `[[WikiLinks]]` and markdown links between pages
- Stores graph in `wiki/.graph.json`
- `/wiki/graph` route renders interactive D3 force graph
- Highlights clusters (topic areas), orphaned nodes, heavily-referenced hubs
- Filters by vault, tag, date range

#### 7. Multi-User Auth (NextAuth.js)
Enable team-wide deployment with individual identities:
- GitHub OAuth or email magic link (no password DB)
- User identity stored in JWT cookie alongside vault selection
- Audit log gains per-user attribution
- Private content: PIN replaced by role-based access
- Team-level vaults: all members of `eng-team` see the `Engineering` vault

#### 8. RBAC (Role-Based Access Control)
Per-vault role assignments:
| Role | Can Read | Can Ingest | Can Compile | Can Admin |
|---|---|---|---|---|
| Viewer | ✅ public | ❌ | ❌ | ❌ |
| Contributor | ✅ all | ✅ | ❌ | ❌ |
| Editor | ✅ all | ✅ | ✅ | ❌ |
| Admin | ✅ all | ✅ | ✅ | ✅ |

Stored in `vaults.json` metadata, enforced in middleware.

#### 9. Slack Integration
- `/kb ask <question>` Slack slash command → streams answer into thread
- `/kb ingest` command → clips current Slack thread into `raw/` and triggers compile
- Daily digest bot: posts "What's new in the KB this week" to a configured channel
- Automatic ingestion of threads tagged with `:kb:` emoji

---

### P2 — Agent-Native APIs

#### 10. OpenAI-Compatible Chat Completion Endpoint
Make the KB queryable by **any** AI agent or tool without custom integration:
```http
POST /v1/chat/completions
Authorization: Bearer <api-key>
{
  "model": "agentic-kb",
  "messages": [{"role": "user", "content": "What's our auth architecture?"}]
}
```
- Wraps `/api/query` in OpenAI response format
- Works with LangChain, AutoGen, CrewAI, Cursor, and any OpenAI-compatible client
- Rate limited per API key

#### 11. Schema-Guided Compilation
Karpathy's third layer: a `wiki/schema.md` file that instructs the LLM *how* to maintain the wiki:
```markdown
# KB Schema
- All architecture decisions get an ADR page in `wiki/decisions/`
- Every person mentioned gets a stub in `wiki/people/` with their role and projects
- Code patterns get a `## Example` section with runnable snippets
- Contradictions are flagged inline with `> ⚠️ CONTRADICTION: ...`
```
The compile endpoint reads this schema and uses it as system context. The wiki evolves its own
conventions as usage patterns emerge.

#### 12. GitHub Actions Integration
```yaml
# .github/workflows/kb-compile.yml
on:
  push:
    paths: ['docs/**', 'ADRs/**']
  issues:
    types: [closed]
  pull_request:
    types: [closed]
jobs:
  compile:
    steps:
      - uses: actions/checkout@v4
      - run: |
          curl -X POST $KB_WEBHOOK_URL/api/ingest/webhook \
            -H "Authorization: Bearer $KB_WEBHOOK_SECRET" \
            -d "{\"source\":\"github\",\"event\":\"$GITHUB_EVENT_NAME\",\"ref\":\"$GITHUB_REF\"}"
```
Every merged PR, closed issue, or doc change auto-ingests into the KB.

#### 13. MCP Tool: `compile_wiki`
Add to the MCP server so AI agents can trigger compilation:
```json
{
  "name": "compile_wiki",
  "description": "Process raw documents and compile them into structured wiki pages",
  "inputSchema": {
    "type": "object",
    "properties": {
      "mode": {"enum": ["incremental", "full"]},
      "vault": {"type": "string"},
      "pin": {"type": "string"}
    }
  }
}
```

---

### P3 — Enterprise Infrastructure

#### 14. Docker Deployment
```yaml
# docker-compose.yml
services:
  web:
    image: agentic-kb
    environment:
      - ANTHROPIC_API_KEY
      - PRIVATE_PIN
      - WEBHOOK_SECRET
    volumes:
      - ./vaults:/vaults
      - ./logs:/app/logs
    ports: ["3000:3000"]
  watcher:
    image: agentic-kb-watcher
    command: node scripts/vault-watcher.js
    volumes:
      - ./vaults:/vaults
```

#### 15. Knowledge Freshness Scoring
Each wiki page gets a freshness score based on:
- Days since last update (`mtime`)
- Staleness of cited raw sources (did sources get new versions?)
- Query frequency (heavily-queried but never updated = stale)
- Displayed as a badge in the wiki index: `🟢 Fresh` / `🟡 Aging` / `🔴 Stale`

#### 16. Cost & Usage Analytics Dashboard
`/admin/analytics` shows:
- Queries per day / week (with token costs)
- Most-queried topics → reveals knowledge gaps
- Compilation cost per ingest run
- Cache hit rate (queries answered from compiled wiki vs needing LLM)
- Per-user usage attribution

#### 17. SSO / SAML Integration
For enterprises with existing identity providers:
- Okta, Azure AD, Google Workspace via SAML 2.0 / OIDC
- Auto-provision users on first login
- Group membership maps to vault access roles
- Session management via encrypted JWT

---

## Architecture Target State

```
┌─────────────────────────────────────────────────────────────────┐
│                      ENTERPRISE AGENTIC-KB                       │
├──────────────┬──────────────────┬─────────────────────────────-─┤
│  INGEST      │   COMPILE        │   QUERY                        │
│              │                  │                                 │
│  Raw docs    │  LLM reads raw   │  Agents/humans ask questions    │
│  Webhooks    │  Builds wiki     │  against compiled wiki          │
│  GitHub      │  Updates cross-  │  Semantic + keyword search      │
│  Slack       │  references      │  OpenAI-compat API              │
│  Notion      │  Logs changes    │  MCP tools                      │
│  Manual UI   │  Schema-guided   │  CLI                            │
├──────────────┴──────────────────┴─────────────────────────────-─┤
│                     STORAGE LAYER                                 │
│  raw/          wiki/          logs/          embeddings/          │
│  (immutable)   (compiled)     (audit JSONL)  (SQLite vectors)     │
├──────────────────────────────────────────────────────────────────┤
│                     SECURITY LAYER                                │
│  RBAC • PIN/Auth • Webhook secrets • Audit log • Rate limiting    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

| Sprint | Features | Value |
|---|---|---|
| **Now** (this session) | Auto-compile, wiki lint, audit log, webhook ingest | Core Karpathy pattern |
| **Week 1** | Semantic search, schema.md support, `kb compile` CLI cmd | 10x query quality |
| **Week 2** | NextAuth (GitHub OAuth), RBAC, knowledge graph | Team deployment ready |
| **Week 3** | Slack integration, GitHub Actions, OpenAI-compat API | Agent-native |
| **Month 2** | Docker, SSO, analytics dashboard, freshness scores | Enterprise-ready |

---

## Quick Wins Already Possible

Without any new code, your KB already supports the Karpathy pattern if you treat it as:
1. **Dump raw docs** into `raw/` (via CLI, web UI, or Obsidian Web Clipper)
2. **Ask Claude** (via MCP or query UI) to "read the new files in raw/ and update the relevant wiki pages"
3. **Let the wiki grow** — each compile pass makes subsequent answers richer

The P0 features (`/api/compile`, `/api/lint`) just automate and formalize this existing workflow.

---

*Generated: April 7, 2026 | Based on Karpathy's LLM Wiki gist (Apr 4, 2026)*
