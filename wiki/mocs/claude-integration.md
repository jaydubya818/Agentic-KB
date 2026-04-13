---
title: Claude Integration
type: moc
category: structure
tags: [claude-code, claude-api, mcp, hermes, context-loading, session-memory, skills]
created: 2026-04-13
updated: 2026-04-13
---

# Claude Integration

How the Agentic-KB wires into Claude Code, Cowork, and the Claude API. Covers the Hermes orchestrator identity, CLAUDE.md configuration, MCP tool stack, skill library, context loading strategy, and session memory system.

---

## CLAUDE.md Configuration

`CLAUDE.md` (vault root) is the primary configuration file for every Claude agent that opens this vault. It defines:

- **Vault schema** — folder structure, file naming, frontmatter by page type, required sections
- **Workflows** — INGEST, QUERY, LINT, HOT CACHE, BACKFILL, EXPLORE, BRIEF, OUTPUTS
- **Linking conventions** — 2-click rule, wiki link format, no-orphan policy
- **Tagging taxonomy** — domain, framework, pattern category, confidence tags
- **Writing style** — voice, length guidelines, anti-patterns
- **Hermes mode trigger** — on every Cowork session start, read `wiki/hot.md` + `wiki/personal/hermes-operating-context.md`, then operate as Hermes

The full agent SOUL lives in `~/.claude/agents/hermes.md` (on Jay's Mac). CLAUDE.md is the KB-side contract; hermes.md is the agent-side identity.

See: [[personal/hermes-operating-context]] · [[hot]]

---

## Claude Code / Desktop Setup

Framework reference: [[frameworks/framework-claude-code]]

Key configuration touchpoints:
- `~/.claude/agents/hermes.md` — Hermes orchestrator definition (model: claude-sonnet-4-6)
- `~/.claude/agents/` — 34 specialized agents (see [[entities/jay-west-agent-stack]])
- `~/.claude/skills/` — 29+ skills (see [[mocs/automation]] for skill inventory)
- `CLAUDE.md` files per repo — project-specific agent configuration
- Claude Code hooks — pre/post tool call, session start/stop (see [[recipes/recipe-claude-code-hooks]])

In Cowork (desktop app), Claude reads `CLAUDE.md` from the mounted workspace on session start. The Hermes auto-load protocol fires immediately.

---

## MCP Tools & Skills

MCP (Model Context Protocol) is the primary tool interface for Claude agents. Current connected MCPs in Jay's stack:

| MCP | Purpose |
|-----|---------|
| `mcp__agentic-kb__*` | Query and write this KB |
| `mcp__obsidian__*` | Read/write main Obsidian vault |
| `mcp__computer-use__*` | Desktop control |
| `mcp__Desktop_Commander__*` | File system + process management |
| `mcp__Claude_in_Chrome__*` | Browser automation |
| `mcp__hermes__*` | Hermes agent bus |
| `mcp__scheduled-tasks__*` | Task scheduling |

Framework reference: [[frameworks/framework-mcp]] · [[entities/mcp-ecosystem]]

Skills are modular prompt packages that extend Claude's capabilities without new MCP servers. They live in `~/.claude/skills/` and are invoked via the Skill tool. See [[mocs/automation]] for the full skill inventory.

---

## .claude/commands Folder

Custom slash commands (`~/.claude/commands/`) are markdown files that trigger reusable workflows. They are distinct from skills — commands are simpler, script-like invocations; skills are structured prompt packages with their own SKILL.md definitions.

See [[prompt-library/custom-slash-commands]] for documented commands in Jay's stack.

---

## Context Loading Strategies

The problem: Claude has a finite context window and cannot load the entire KB each session. The solution is tiered context loading:

**Tier 1 — Always loaded (session start)**
- `wiki/hot.md` — ≤500 words of highest-frequency context
- `wiki/personal/hermes-operating-context.md` — priority stack, routing defaults, open blockers

**Tier 2 — Domain loaded (query-triggered)**
- Relevant MoC page for the query domain
- 3-5 concept/pattern/framework pages most relevant to the request

**Tier 3 — Deep load (explicit ingest/research)**
- Full source files from `raw/`
- Full research project workspace from `knowledge-systems/research-engine/`

Patterns:
- [[patterns/pattern-hot-cache]] — hot.md maintenance rules
- [[patterns/pattern-tiered-agent-memory]] — the three-tier architecture
- [[patterns/pattern-layered-injection-hierarchy]] — where context gets injected

---

## Session Memory System

Memory across Claude sessions is maintained through files, not in-context state:

| File | Purpose | Update Trigger |
|------|---------|----------------|
| `wiki/hot.md` | High-frequency context cache (≤500 words) | Pattern referenced 3+ times |
| `wiki/personal/hermes-operating-context.md` | Full operating context, priority stack, blockers | Manual or Hermes-initiated |
| `wiki/log.md` | Append-only operation audit trail | Every wiki write |
| `wiki/recently-added.md` | Chronological feed of new pages | Every INGEST |
| `knowledge-systems/research-engine/knowledge/open-questions.md` | Persistent open research questions | Research sessions |

The pattern: anything important enough to need next session gets written to disk before the session ends. Context window = working memory. Files = long-term memory.

See: [[patterns/pattern-external-memory]] · [[patterns/pattern-rolling-summary]]

---

## Related

- [[personal/hermes-operating-context]] — Full operating context
- [[hot]] — Hot cache
- [[mocs/automation|Automation MoC]] — Skills and hooks
- [[frameworks/framework-claude-code]] — Claude Code reference
- [[frameworks/framework-mcp]] — MCP reference
- [[mocs/advanced-techniques|Advanced Techniques]] — Vault-as-context engineering
