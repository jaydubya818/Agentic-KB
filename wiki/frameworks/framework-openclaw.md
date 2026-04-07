---
title: OpenClaw
type: framework
vendor: Unknown / Jay West (deployed instance)
version: "2026.3.24"
language: any
license: proprietary
github: ""
tags: [openclaw, agentic, multi-agent, claude-api, orchestration, personal-assistant]
last_checked: 2026-04-04
jay_experience: moderate
---

## Overview

OpenClaw is an agentic system Jay runs locally at `~/.openclaw/`. Based on the directory structure, it is a multi-agent orchestration platform with persistent workspaces, a browser automation layer, subagent support, a skill system, scheduling/cron capabilities, identity management, and a Telegram delivery channel. It appears to be either a heavily customized Claude Code variant, a third-party agentic runtime, or Jay's own orchestration layer built on the Anthropic API.

Key indicator: the config version `2026.3.24` and the `clawdbot.json` file suggest this is a running assistant service (possibly "Clawd" — one of Jay's projects listed in his stack). The `workspace-*` directories (main, casey, coach, sofie, minion-1, minion-2) suggest multiple persistent agent identities or workspaces, each with their own context and state.

**Note**: This page is based on filesystem observation. Internals are inferred, not verified from source code. Mark any behavioral claims as [INFERRED].

---

## Core Concepts

### Workspaces
OpenClaw maintains named workspaces:
- `workspace-main` — primary workspace
- `workspace-casey` — appears to be a named assistant persona
- `workspace-coach` — coaching-focused assistant
- `workspace-sofie` — another named persona
- `workspace-minion-1`, `workspace-minion-2` — worker/sub-agent instances
- `workspace-antfarm-medic` — specialized agent (antfarm = multi-agent swarm?)

Each workspace likely maintains its own conversation history, memory, and tool configuration. [INFERRED]

### Antfarm
The `antfarm/` directory and `antfarm.db` (SQLite) suggest a swarm orchestration layer — possibly managing a pool of worker agents ("ants") with a coordinator. `antfarm.db` is the persistent state store. The `workspace-antfarm-medic` suggests a health-monitoring agent for the swarm. [INFERRED]

### Identity System
The `identity/` directory suggests OpenClaw can operate as multiple distinct identities — different system prompts, personas, or roles for different use cases. [INFERRED]

### Delivery Channels
The `telegram/` directory and `telegram-tokens.env` confirm OpenClaw delivers output via Telegram bot. This enables asynchronous agent results pushed to Jay's phone, not just terminal output. The `delivery-queue/` suggests batched/queued delivery. [INFERRED]

### Browser Automation
The `browser/` directory and BROWSER.md (at top level, suggesting shared docs) indicate integrated browser control — likely Playwright or a similar headless browser for web-based tasks. The `gstack` skill (`~/.openclaw/skills/`) is referenced as a headless browser QA tool. [INFERRED]

### Skills
OpenClaw has its own skill system separate from Claude Code's `~/.claude/skills/`. Known skills in `~/.openclaw/skills/`:
- `gstack` — headless browser automation/QA
- `agent-standup` — agent status reporting
- `antfarm-workflows` — antfarm orchestration patterns
- `brainstorming` — structured ideation (parallel to Superpowers brainstorming)
- `computer-use` — computer use API integration
- `dispatching-parallel-agents`
- `docclaw` — document processing
- `executing-plans`
- `finishing-a-development-branch`
- `gemini-api-dev` — Gemini API development patterns
- `gws-admin-reports` — Google Workspace admin reporting
- And more

### Model Configuration
From `~/.rowboat/config/models.json` (related system): `claude-sonnet-4-5` with Anthropic flavor. OpenClaw's `openclaw.json` uses the same Anthropic API stack.

### MCP Servers
The `mcp-servers/` directory indicates OpenClaw registers and manages MCP servers, making it a full MCP host in addition to whatever native tools it provides.

### Cron / Scheduling
The `cron/` directory suggests OpenClaw can run scheduled agent tasks — recurring standup reports, periodic checks, automated workflows on a timer.

---

## Architecture (Inferred)

```
OpenClaw Runtime (~/.openclaw/)
    │
    ├── Core config: openclaw.json (model, gateway, plugins, agents, commands)
    ├── Identity layer (multiple personas/assistants)
    ├── Workspace management (named persistent contexts)
    │
    ├── Agent layer:
    │   ├── Named subagents (subagents/ directory)
    │   ├── Antfarm swarm (antfarm/ + antfarm.db)
    │   └── Minion workers (workspace-minion-*)
    │
    ├── Tool layer:
    │   ├── Skills system (skills/ directory)
    │   ├── Browser automation (browser/)
    │   ├── MCP servers (mcp-servers/)
    │   └── Computer use API
    │
    ├── Delivery:
    │   ├── Terminal/Claude Code
    │   ├── Telegram bot (telegram/ + telegram-tokens.env)
    │   └── Delivery queue (async batched output)
    │
    └── Persistence:
        ├── Per-workspace memory (memory/)
        ├── Antfarm state (antfarm.db)
        ├── Sessions log (sessions/)
        └── Knowledge base (knowledge/)
```

---

## Strengths (Inferred)

- **Multi-channel delivery**: results available in terminal AND Telegram — async notification for long-running tasks
- **Named workspaces with persistent memory**: each assistant identity has its own context, not sharing a flat global memory
- **Antfarm swarm**: appears to support genuine multi-agent swarm patterns with persistence
- **Scheduling**: cron-based recurring agent tasks without manual invocation
- **Computer use integration**: can interact with GUIs, not just terminal/web APIs
- **MCP host**: inherits MCP ecosystem extensibility

---

## Weaknesses (Inferred)

- **Black box for this KB**: internals not accessible from source; this page is inference
- **Separate skill ecosystem**: Jay maintains two separate skill systems (Claude Code + OpenClaw); duplication risk
- **Config JSON fragility**: multiple `.bak` files and `.broken` files suggest the config has been corrupted and restored multiple times
- **Telegram dependency for async**: if Telegram bot is down, async delivery fails

---

## Minimal Working Example

N/A — insufficient internal knowledge to provide a verified working example. Jay would need to document the actual API/invocation pattern.

---

## Integration Points

- **[[frameworks/framework-claude-code]]**: appears to be a parallel runtime to Claude Code, not built on top of it; may use the same underlying Anthropic API
- **[[frameworks/framework-claude-api]]**: model config points to Anthropic API directly
- **[[frameworks/framework-mcp]]**: MCP servers registered; full MCP host
- **[[entities/jay-west-agent-stack]]**: OpenClaw is a distinct component of Jay's stack alongside Claude Code
- **gstack skill**: headless browser QA tool — potentially usable for Playwright-equivalent testing from OpenClaw context

---

## Jay's Experience

Moderate (inferred from file structure and multiple config backup files, indicating active use and iteration). Jay appears to use OpenClaw for:
- Persistent named assistants (casey, coach, sofie) — likely for different life/work domains
- Swarm/antfarm multi-agent workflows
- Scheduled/recurring agent tasks
- Telegram-delivered async results

The multiple `.broken` config files suggest OpenClaw has complex state management that occasionally fails — a cost of rich configuration.

---

## Version Notes

- `lastTouchedVersion: "2026.3.24"` — active as of early April 2026
- `lastTouchedAt: "2026-04-03T13:24:34.634Z"` — touched the day before this KB was created

---

## Sources

- `~/.openclaw/` directory listing (direct observation)
- `~/.openclaw/openclaw.json` (config structure)
- Jay's `~/.claude/CLAUDE.md` (mentions openclaw in stack)
- [[entities/jay-west-agent-stack]]
