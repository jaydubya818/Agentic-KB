---
id: 01KNNVX2QWP84CV07MDHY2TR09
title: Rowboat
type: framework
vendor: Rowboat Labs
version: "unknown"
language: typescript
license: open-source
github: "https://github.com/rowboatlabs/rowboat"
tags: [rowboat, multi-agent, orchestration, agentic, memory, knowledge-graph, mcp]
last_checked: 2026-04-09
jay_experience: limited
---

## Overview

[[framework-rowboat]] is an open-source, local-first AI assistant that builds a persistent knowledge graph of work context — emails, calendar, meetings, documents — and uses that accumulated context to help execute tasks. Where the [[concepts/llm-wiki-pattern]] builds a flat wiki of markdown pages, [[framework-rowboat]] structures the same markdown foundation into an explicit entity-relationship graph: people, projects, decisions, and commitments are tracked as linked entities, not just mentioned in prose.

The key design claim: "For personal research, a flat wiki is enough. For work, you need explicit relationships between decisions and commitments tracked across sources." [[andrej-karpathy]] endorsed this framing.

Jay runs an instance at `~/.rowboat/`. The filesystem (agents/, config/, knowledge/, runs/, fireflies_transcripts/) aligns with the GitHub architecture. Prior page was built from filesystem inference only; this version integrates confirmed GitHub details.

**Still inferred from Jay's local instance**: agent definition format, run output schema, specific knowledge/ structure.

---

## Core Concepts

### Knowledge Graph (not flat wiki)
The fundamental architectural distinction from standard LLM wikis: [[framework-rowboat]] tracks **entities** (people, projects, decisions, commitments) as first-class nodes with explicit typed relationships between them. A flat wiki has pages that link to other pages. [[framework-rowboat]] has an entity graph where the relationship type and strength are stored alongside the link — "Alice owns decision X which blocks project Y" is a traversable relationship, not just a mention.

This is implemented as structured markdown notes with backlinks in an Obsidian-compatible vault, with Qdrant (vector DB) as an optional search layer.

### Live Notes
Notes that auto-update based on connected sources (email, calendar, meetings). A note about a person or project reflects current state, not just historical ingest. This is distinct from the immutable `raw/` + compiled `wiki/` model — [[framework-rowboat]]'s notes are mutable and source-driven.

### Decision & Commitment Tracking
Explicit capture of: prior decisions and open questions (for meeting prep), action items and owners (to prevent dropped tasks), relevant conversation threads per relationship. These are structured fields on entity nodes, not prose buried in summaries.

### Explicit Agent Actions with Human Review
[[framework-rowboat]] executes tasks (drafting, summarizing, generating artifacts) grounded in the accumulated knowledge graph. Actions require human review before execution — it's not fully autonomous.

### Configuration Layer (Jay's instance)
- `models.json` — model selection (claude-sonnet-4-5 via [[anthropic]])
- `mcp.json` — [[mcp-ecosystem]] server registrations
- `agent-schedule.json` / `agent-schedule-state.json` — scheduled agent runs
- `granola.json` — Granola meeting notes integration
- `oauth.json` — OAuth for external service integrations
- `note_creation.json` — automated note creation config
- `prebuilt.json` — pre-built agent configurations

---

## Architecture

**Stack**: TypeScript (96.7%), Docker/Python support. Model-agnostic — supports Ollama, LM Studio, or any hosted API (bring-your-own-key).

```
External sources (email, calendar, Fireflies, Granola, documents)
      ↓
MCP integration layer (config/mcp.json)
      ↓
Knowledge graph builder
      ├── Entity nodes: people, projects, decisions, commitments
      ├── Typed relationships with explicit strength
      └── Stored as: Obsidian-compatible markdown vault (knowledge/)
                     + optional Qdrant vector DB
      ↓
Agent layer (agents/)
      ├── Model: claude-sonnet-4-5 via Anthropic API (Jay's instance)
      ├── Scheduled runs (agent-schedule.json)
      └── Human-reviewed action execution
      ↓
Run tracking (runs/) + outputs
```

**Data portability**: all knowledge stored as plain markdown — inspect, edit, back up, or delete at any time. No proprietary embeddings.

---

## Flat Wiki vs Knowledge Graph

The post that prompted this update framed the distinction cleanly: "Persistent MD wikis are great for compiling research. For work, you need a knowledge graph that links decisions and commitments across sources."

| Dimension | Flat [[llm-wiki]] ([[andrej-karpathy]] pattern) | [[framework-rowboat]] Knowledge Graph |
|-----------|----------------------------------|------------------------|
| Structure | Markdown pages with prose links | Entity nodes with typed relationships |
| Relationship tracking | Implicit (mentioned in text) | Explicit (stored with type + strength) |
| Decision tracking | Buried in summary pages | First-class entity field |
| Commitment tracking | None by default | Action items + owners per entity |
| Source model | Immutable raw/ + compiled wiki/ | Mutable live notes auto-updated from sources |
| Best for | Research, knowledge compilation | Work context — meetings, projects, people |

Both store data as markdown and are Obsidian-compatible. The difference is schema and intent.

---

## Distinguishing Characteristics vs [[framework-openclaw]]

| Dimension | [[framework-rowboat]] | [[framework-openclaw]] |
|-----------|---------|---------|
| Primary input | Meeting transcripts / scheduled | Interactive + async |
| Delivery | Unknown | Telegram + terminal |
| Scale | Lighter footprint | Heavier (antfarm, swarm) |
| Personas | Unknown | Named identities (casey, coach, sofie) |
| Browser | Unknown | Yes (browser/ directory) |
| Model | claude-sonnet-4-5 | Likely same |

Hypothesis: [[framework-rowboat]] handles Jay's **asynchronous knowledge worker automation** (meetings → notes → action items → follow-ups) while [[framework-openclaw]] handles **interactive multi-agent orchestration**. [INFERRED]

---

## Strengths

- **Explicit relationship graph**: decisions and commitments are queryable entities, not text buried in summaries
- **Meeting transcript pipeline**: Fireflies/Granola → knowledge graph → action items/follow-ups; removes manual meeting follow-up
- **Local-first, open-source**: no cloud lock-in; plain markdown vault is portable and inspectable
- **Model-agnostic**: swap [[anthropic]] for Ollama or any [[openai]]-compatible API without architecture changes
- **Human-review gate**: agent actions require approval before execution — safer than fully autonomous
- **[[mcp-ecosystem]] extensibility**: full [[mcp-ecosystem]] host; Jay's instance has multiple [[mcp-ecosystem]] servers registered

---

## Weaknesses

- **Live notes mutable by design**: unlike the immutable `raw/` pattern, [[framework-rowboat]] updates notes in place — harder to audit what changed and when
- **Qdrant dependency for search at scale**: adds infrastructure complexity vs. pure filesystem search
- **TypeScript-only**: no Python SDK; harder to extend for Python-native data pipelines
- **Limited observability in Jay's instance**: no evidence of structured trace logging

---

## Minimal Working Example

N/A — insufficient internal knowledge. Jay should document an example [[framework-rowboat]] agent run.

---

## Integration Points

- **[[frameworks/framework-claude-api]]**: model config confirms [[anthropic]] API usage
- **[[frameworks/framework-mcp]]**: [[mcp-ecosystem]] servers registered in `config/mcp.json`
- **[[entities/jay-west-agent-stack]]**: [[framework-rowboat]] is one component of Jay's stack
- **[[frameworks/framework-openclaw]]**: parallel runtime; different focus area

---

## Jay's Experience

Limited (inferred). [[framework-rowboat]] appears to be running and configured but is not Jay's primary development tool. Most likely used for meeting automation workflows rather than software development. The `fireflies_transcripts/` directory is the strongest signal about its primary use case.

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
