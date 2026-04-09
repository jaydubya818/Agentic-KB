---
title: LLMwiki — Repo Home
type: repo-home
repo_name: llmwiki
tags: [repo, llmwiki]
created: 2026-04-09
updated: 2026-04-09
status: active
---

# LLMwiki

## Purpose

LLMwiki is the LLM-powered wiki compilation system and knowledge management tooling layer. It provides the CLI tool (`npm run query`), web UI, MCP server, and compilation pipeline that power the [[agentic-kb/home|Agentic-KB]]. Users interact with the KB through LLMwiki's multiple interfaces, while the system handles indexing, caching, and search infrastructure.

## Current Status

- **CLI tool**: Operational (`npm run query "question"`)
- **Web UI**: React dashboard with search and browse
- **MCP Server**: Running on port 9001, serving queries to agents
- **Search**: Keyword-based (index); full-text search planned
- **Index**: Auto-generated, always in sync with wiki

## Canonical Docs

| Document | Status | Last Updated |
|----------|--------|--------------|
| [[canonical/PRD|Product Requirements]] | draft | 2026-04-09 |
| [[canonical/APP_FLOW|Application Flow]] | draft | 2026-04-09 |
| [[canonical/TECH_STACK|Tech Stack]] | current | 2026-04-09 |
| [[canonical/IMPLEMENTATION_PLAN|Implementation Plan]] | draft | 2026-04-09 |

## Interfaces

| Interface | Status | Users |
|-----------|--------|-------|
| CLI (`npm run query`) | ✅ Active | Jay West, developers |
| Web UI (`/llmwiki`) | ✅ Active | Researchers, team |
| MCP Server (port 9001) | ✅ Active | MissionControl, Pi harness agents |

## Recent Tasks

1. **CLI tool robustness** (2026-04-08): Added error handling, timeout logic
2. **Web UI polish** (2026-04-07): Improved search UI, added related pages sidebar
3. **MCP server integration** (2026-04-06): Validated agent queries work correctly
4. **Hot cache synchronization** (2026-04-05): Automated cache updates from wiki changes

## Related Repos

- [[agentic-kb/home|Agentic-KB]] — the knowledge base this tool accesses
- [[mission-control/home|MissionControl]] — uses MCP server for orchestration queries

## Sync Status

| Component | Status | Last Sync |
|-----------|--------|-----------|
| Index | synced | 2026-04-09 |
| Hot cache | synced | 2026-04-09 |
| CLI tool | current | 2026-04-09 |
| Web UI | current | 2026-04-08 |
| MCP server | current | 2026-04-09 |

**Next Sync**: 2026-04-16
