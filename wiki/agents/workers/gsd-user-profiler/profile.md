---
id: 01KQ2Y3906ATC0Z4BS6SKDW7BX
title: GSD User Profiler
type: entity
tags: [agents, orchestration, workflow, automation, personal]
created: 2026-04-25
updated: 2026-04-25
visibility: private
confidence: high
related: [agents/workers/gsd-executor/profile.md, concepts/memory-systems.md, concepts/multi-agent-systems.md]
---

# GSD User Profiler

A worker agent that analyzes extracted session messages across 8 behavioral dimensions to produce a scored developer profile with confidence levels and evidence. Spawned by profile orchestration workflows (Phase 3) or by `write-profile` during standalone profiling.

## Role

The GSD User Profiler is a specialized analysis agent within the Get Shit Done (GSD) system. Its sole responsibility is to apply a rubric-driven heuristic framework to a sampled set of developer session messages and return structured JSON analysis. It does **not** invent dimensions, scoring rules, or patterns — the reference document (`get-shit-done/references/user-profiling.md`) is the single source of truth.

## Tools

- `Read` — used to load the rubric reference document and read input JSONL messages

## Input Format

Receives extracted session messages as JSONL content (output of `profile-sample`). Each message:

```json
{
  "sessionId": "string",
  "projectPath": "encoded-path-string",
  "projectName": "human-readable-project-name",
  "timestamp": "ISO-8601",
  "content": "message text (max 500 chars for profiling)"
}
```

**Key characteristics of input:**
- Pre-filtered to genuine user messages only (no system messages, tool results, or Claude responses)
- Truncated to 500 characters per message
- Project-proportionally sampled — no single project dominates
- Recency-weighted (recent sessions overrepresented)
- Typical size: 100–150 representative messages across all projects

## Process

### Step 1 — Load Rubric
Reads the user-profiling reference document to load:
- All 8 dimension definitions with rating spectrums
- Signal patterns and detection heuristics per dimension
- Confidence thresholds: **HIGH** ≥10 signals across 2+ projects, **MEDIUM** 5–9, **LOW** <5, **UNSCORED** = 0
- Evidence curation rules (combined Signal+Example format, up to 3 quotes per dimension, ~100 char quotes)
- Sensitive content exclusion patterns
- Recency weighting guidelines
- Output schema

### Step 2 — Read Messages
- Groups messages by project for cross-project consistency assessment
- Notes timestamps for recency weighting
- Flags log pastes, session context dumps, and large code blocks (deprioritized for evidence)
- Counts total genuine messages to determine threshold mode:
  - **Full**: >50 messages
  - **Hybrid**: 20–50 messages
  - **Insufficient**: <20 messages

### Step 3 — Analyze Dimensions
For each of the 8 dimensions:
1. Scans for signal patterns defined in the rubric
2. Counts evidence signals (recency-weighted: signals from last 30 days count ~3×)
3. Selects up to 3 representative evidence quotes using combined format:
   > **Signal:** [interpretation] / **Example:** "[~100 char quote]" — project: [name]
   - Prefer quotes from different projects
   - Prefer recent quotes when equivalent

## Output

Returns structured JSON analysis per the schema defined in the reference document, including per-dimension ratings, confidence levels, and curated evidence.

## Spawn Context

This agent is spawned by:
- **Profile orchestration workflow** (Phase 3)
- **`write-profile`** during standalone profiling

## See Also

- [GSD Executor](../gsd-executor/profile.md) — sibling worker agent in the GSD system
- [Multi-Agent Systems](../../../concepts/multi-agent-systems.md) — orchestration patterns relevant to spawning workflows
- [Memory Systems](../../../concepts/memory-systems.md) — context on how session history is stored and sampled
