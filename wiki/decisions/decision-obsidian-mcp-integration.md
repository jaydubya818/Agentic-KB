---
title: "Obsidian + Claude Code MCP Integration — Evaluation & Decision"
type: decision
date: 2026-05-16
status: decided
reviewed: false
reviewed_date: ""
tags: [mcp, obsidian, claude-code, infrastructure]
---

# Obsidian + Claude Code MCP Integration

## Context

Multiple viral threads (CyrilXBT "How I Turned My Obsidian Vault Into a Full Business Operating System", Shruti "Obsidian self-improving second brain", Noah Vincent "Obsidian for Beginners 2026") describe connecting Claude Code to an Obsidian vault via MCP for real-time file read/write — enabling automated briefings, self-improving knowledge systems, and vault-as-operating-system workflows.

**Current state (verified 2026-05-16):**
- `mcpServers: {}` in both `~/.claude/settings.json` and `settings.local.json` — no Obsidian or filesystem MCP configured
- Hermes agent definition references `mcp__obsidian__*` tools aspirationally — these tools do NOT exist in the session
- Desktop Commander MCP IS available (deferred tools list) — provides file read/write/search to the vault without a dedicated Obsidian MCP
- Morning-review pipeline accesses the vault via direct Python file I/O, not MCP

## What a Dedicated Obsidian MCP Adds

Desktop Commander covers: read file, write file, search files (basic), list directories.

A dedicated Obsidian MCP (e.g., `obsidian-local-rest-api` plugin) adds:
- **Semantic/full-text search** across the vault via Obsidian's own search index
- **Backlink graph traversal** — find all notes that link to a given note
- **Currently open file** — read whatever is active in Obsidian right now
- **Tag-based queries** — fetch all notes with a given tag
- **Dataview-style queries** — if Obsidian Dataview plugin is installed

## Decision

**Not urgent. Desktop Commander is sufficient for current workflows.**

Morning-review already accesses the vault via direct file I/O. The foundry-capture pipeline writes to `raw/clippings/` via file operations. INGEST reads source files directly. None of these need Obsidian's search index — they operate on known file paths.

**The one gap:** Semantic search across the vault from within a Claude Code session. Hermes referencing `mcp__obsidian__*` is aspirational and dead code right now — those tool calls would fail silently.

**Action items:**

1. **Fix Hermes agent definition** — remove or comment out `mcp__obsidian__*` references until a real Obsidian MCP is configured. Replace with Desktop Commander equivalents for now.

2. **Evaluate when it becomes useful:** If Hermes needs to answer questions that require searching across the vault (not just reading known paths), add the Obsidian Local REST API MCP. Steps:
   - Install Obsidian plugin: "Local REST API" (community plugin)
   - Add to `~/.claude/settings.json` mcpServers:
     ```json
     "obsidian": {
       "command": "npx",
       "args": ["-y", "obsidian-mcp", "--vault", "/Users/jaywest/Documents/Obsidian Vault"]
     }
     ```
   - Test with: `mcp__obsidian__search_vault` for a known topic

3. **Do NOT auto-enable.** The CyrilXBT "business operating system" pattern is compelling but Jay already has a working pipeline. Adding MCP before Phase 2 of morning-review is live would add complexity without payoff.

## Risk

Low. Desktop Commander is available and functional. The only risk is Hermes giving wrong answers if it tries to call `mcp__obsidian__*` tools — fix the agent definition to avoid this.

## Sources

- Daily note 2026-05-11 — CyrilXBT, Shruti, Noah Vincent viral threads
- Verified: `~/.claude/settings.json` and `settings.local.json` — both `mcpServers: {}`
- `~/.claude/agents/hermes.md` — aspirational Obsidian MCP references
