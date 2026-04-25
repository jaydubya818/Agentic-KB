---
id: 01KQ2XW32MTCGKX1A81MG38HP3
title: "GSD Research Synthesizer Agent"
type: entity
tags: [agents, orchestration, research, workflow, automation]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [agents/workers/gsd-executor/profile.md, concepts/multi-agent-systems.md]
---

# GSD Research Synthesizer Agent

## Overview

The `gsd-research-synthesizer` is a **worker agent** spawned by the `/gsd:new-project` orchestrator after four parallel researcher agents (STACK, FEATURES, ARCHITECTURE, PITFALLS) have completed their work. Its sole responsibility is to read those four research outputs and synthesize them into a single, opinionated `SUMMARY.md` that downstream agents — specifically the `gsd-roadmapper` — can act on.

**Color:** Purple  
**Tools:** Read, Write, Bash

---

## Role in the Pipeline

```
/gsd:new-project orchestrator
        │
        ├── researcher: STACK.md
        ├── researcher: FEATURES.md
        ├── researcher: ARCHITECTURE.md
        └── researcher: PITFALLS.md
                │
                ▼
   gsd-research-synthesizer  ◄── (this agent)
                │
                ▼
          SUMMARY.md
                │
                ▼
       gsd-roadmapper agent
```

Researcher agents **write** their files but do not commit. The synthesizer **commits everything** — all four research files plus `SUMMARY.md`.

---

## Execution Flow

### Step 1 — Read Research Files
Loads all four research files from `.planning/research/`:
- `STACK.md` — Recommended technologies, versions, rationale
- `FEATURES.md` — Table stakes, differentiators, anti-features
- `ARCHITECTURE.md` — Patterns, component boundaries, data flow
- `PITFALLS.md` — Critical/moderate/minor pitfalls, phase warnings

> **Critical:** If the prompt contains a `<files_to_read>` block, every file listed there must be read via the `Read` tool before any other action.

### Step 2 — Executive Summary
Writes 2–3 paragraphs answering:
- What type of product is this and how do experts build it?
- What is the recommended approach?
- What are the key risks and mitigations?

### Step 3 — Key Findings
Extracts the most important points from each research file in structured form.

### Step 4 — Roadmap Implications *(most important section)*
- Suggests phase structure based on dependencies and architecture
- For each phase: rationale, deliverables, relevant features, pitfalls to avoid
- Flags which phases likely need deeper `/gsd:research-phase` work vs. well-documented patterns

### Step 5 — Confidence Assessment
Assesses confidence levels per area and identifies research gaps to flag for validation.

---

## Output: SUMMARY.md

The `SUMMARY.md` is consumed by the `gsd-roadmapper` agent. Each section maps to a roadmapper need:

| SUMMARY.md Section | How Roadmapper Uses It |
|---|---|
| Executive Summary | Quick understanding of domain |
| Key Findings | Technology and feature decisions |
| Implications for Roadmap | Phase structure suggestions |
| Research Flags | Which phases need deeper research |
| Gaps to Address | What to flag for validation |

> **Be opinionated.** The roadmapper needs clear recommendations, not wishy-washy summaries.

---

## Design Notes

- This agent is a **fan-in** node — it collapses parallel workstreams into a single artifact.
- It owns the **commit step** for all research outputs, giving it a natural checkpoint for quality review.
- The mandatory `<files_to_read>` protocol ensures the agent never synthesizes from memory or stale context.

---

## See Also

- [Multi-Agent Systems](../../concepts/multi-agent-systems.md)
- [GSD Executor Agent](../gsd-executor/profile.md)
- [Agent Loops](../../concepts/agent-loops.md)
- [Context Management](../../concepts/context-management.md)
