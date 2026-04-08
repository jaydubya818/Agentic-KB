---
id: 01KNNVX2QWP84CV07MDHY2TR09
title: Rowboat
type: framework
vendor: Unknown / Jay West (deployed instance)
version: "unknown"
language: any
license: proprietary
github: ""
tags: [rowboat, multi-agent, orchestration, agentic]
last_checked: 2026-04-04
jay_experience: limited
---

## Overview

[[framework-rowboat]] is an agentic orchestration framework Jay runs locally at `~/.rowboat/`. It is a lighter footprint than [[framework-openclaw]] — its directory structure shows `agents/`, `config/`, `knowledge/`, `runs/`, and `fireflies_transcripts/`. The model config reveals it runs `claude-sonnet-4-5` via [[anthropic]], with configuration files for scheduling, [[mcp-ecosystem]] servers, OAuth, models, and security.

Rowboat appears to be a separate agent runtime with its own agent definitions, persistent run tracking, a knowledge base, and integration with Fireflies (an AI meeting transcription service). This last detail is significant: `fireflies_transcripts/` suggests Rowboat processes meeting transcripts as inputs to agent workflows.

**Note**: This page is based on filesystem observation only. All behavioral claims are [INFERRED]. Jay should update this page with direct knowledge.

---

## Core Concepts

### Agent Definitions
The `agents/` directory contains Rowboat's agent configurations. Unlike [[framework-claude-code]]'s `.md`-format agent definitions, these may use JSON or YAML given the config-heavy nature of Rowboat's other files. [INFERRED]

### Run Tracking
The `runs/` directory suggests Rowboat maintains a log of past agent runs with their inputs, outputs, and status. This is closer to a job queue model than a conversational model. [INFERRED]

### Knowledge Base
The `knowledge/` directory is a dedicated knowledge store for Rowboat's agents — separate from Jay's Agentic-KB and OpenClaw's knowledge directory. Purpose unknown; likely context injection for agent runs. [INFERRED]

### Fireflies Integration
`fireflies_transcripts/` indicates Rowboat ingests meeting transcripts from Fireflies.ai. This suggests a use case pattern: meetings happen → Fireflies transcribes → Rowboat processes transcripts through agent workflows → outputs (action items, summaries, follow-ups) are produced. This is a common agentic automation pattern for knowledge workers. [INFERRED]

### Configuration Layer
Rowboat's `config/` directory contains:
- `models.json` — model selection (confirmed: claude-sonnet-4-5 via Anthropic)
- `models.dev.json` — development model config
- `mcp.json` — MCP server registrations
- `agent-schedule.json` — scheduled agent runs
- `agent-schedule-state.json` — schedule execution state
- `granola.json` — unknown (Granola is a meeting notes app; may relate to transcript ingestion)
- `oauth.json` — OAuth credentials for external service integrations
- `prebuilt.json` — pre-built agent configurations
- `security.json` — security settings
- `note_creation.json` — automated note creation config

---

## Architecture (Inferred)

```
Rowboat (~/.rowboat/)
    │
    ├── Model: claude-sonnet-4-5 (Anthropic API)
    ├── Agents: agent definitions (agents/ directory)
    │
    ├── Inputs:
    │   ├── Fireflies meeting transcripts (fireflies_transcripts/)
    │   ├── Granola meeting notes (granola.json)
    │   └── Scheduled triggers (agent-schedule.json)
    │
    ├── Knowledge: context store (knowledge/)
    │
    ├── Runs: job tracking (runs/)
    │
    └── Integrations:
        ├── MCP servers (config/mcp.json)
        ├── OAuth providers (config/oauth.json)
        └── External scheduling
```

---

## Distinguishing Characteristics vs OpenClaw

| Dimension | Rowboat | OpenClaw |
|-----------|---------|---------|
| Primary input | Meeting transcripts / scheduled | Interactive + async |
| Delivery | Unknown | Telegram + terminal |
| Scale | Lighter footprint | Heavier (antfarm, swarm) |
| Personas | Unknown | Named identities (casey, coach, sofie) |
| Browser | Unknown | Yes (browser/ directory) |
| Model | claude-sonnet-4-5 | Likely same |

Hypothesis: Rowboat handles Jay's **asynchronous knowledge worker automation** (meetings → notes → action items → follow-ups) while OpenClaw handles **interactive multi-agent orchestration**. [INFERRED]

---

## Strengths (Inferred)

- **Meeting transcript pipeline**: automated ingestion of Fireflies/Granola transcripts into agent workflows — removes manual meeting follow-up work
- **Scheduled automation**: cron-like scheduling without manual invocation
- **Clean separation of concerns**: lighter than OpenClaw; focused use case
- **MCP extensibility**: full MCP host

---

## Weaknesses (Inferred)

- **Limited visibility**: least-documented system in Jay's stack
- **Single-domain focus**: appears specialized for meeting/knowledge-worker workflows; not a general orchestrator
- **Unknown debugging surface**: no evidence of observability tooling

---

## Minimal Working Example

N/A — insufficient internal knowledge. Jay should document an example Rowboat agent run.

---

## Integration Points

- **[[frameworks/framework-claude-api]]**: model config confirms Anthropic API usage
- **[[frameworks/framework-mcp]]**: MCP servers registered in `config/mcp.json`
- **[[entities/jay-west-agent-stack]]**: Rowboat is one component of Jay's stack
- **[[frameworks/framework-openclaw]]**: parallel runtime; different focus area

---

## Jay's Experience

Limited (inferred). Rowboat appears to be running and configured but is not Jay's primary development tool. Most likely used for meeting automation workflows rather than software development. The `fireflies_transcripts/` directory is the strongest signal about its primary use case.

---

## Version Notes

- No version number identified in filesystem
- Model config: `claude-sonnet-4-5` (note: not 4-6; may be slightly older than main stack)
- Active: contains `runs/` directory suggesting ongoing use

---

## Sources

- `~/.rowboat/` directory listing (direct observation)
- `~/.rowboat/config/models.json` (model configuration confirmed)
- [[entities/jay-west-agent-stack]]
- [[frameworks/framework-openclaw]]
