---
title: Personal Context Graph
type: personal
category: pattern
confidence: medium
date: 2026-05-11
tags: [agentic, memory, context-management, agent-architecture, pattern]
reviewed: false
reviewed_date: ""
---

# Personal Context Graph

## TL;DR

A structured, typed graph of Jay's career, projects, reading, relationships, therapy themes, meetings, and founder network — consumed by agents (Hermes, Pi, Cowork) so they can reason from real personal context instead of flat documents.

## Why

From Garry Tan's *Meta-Meta-Prompting* essay (2026-05-10): sub-agents that compose with deep, structured personal context produce qualitatively different output than sub-agents handed a stack of unstructured markdown files. His "book that read me back" use case (a Pema Chödrön reflection mirrored against personal history) only works because the model can pull from a rich, queryable personal graph — career history, current projects, reading log, therapy themes, relationships — not because the model is bigger.

Today our agents have flat `CLAUDE.md` files and ad-hoc memory directories. They can't answer questions like "which of my current projects most resembles this idea?" without re-reading every project page each time.

## What this directory holds

- `schema.md` — canonical entity types and field shapes
- `seed.example.json` — placeholder skeleton showing the structure (safe to commit)
- `seed.json` — **gitignored**; populated locally with real personal data
- `README.md` — this file

## Entity types (v0)

`career` · `projects` · `reading` · `relationships` · `therapy_themes` · `meetings` · `founder_network`

See `schema.md` for full field definitions.

## How agents consume it

This is a v0 scaffold. The consumption layer is intentionally NOT yet built — landing the schema first lets us iterate on the shape before committing to a runtime API. Planned consumers:

- **Hermes** (`Agentic-Pi-Harness/src/hermes/`) — loads graph at session start, exposes `context.lookup(entity_type, query)` to sub-agents.
- **Pi** runtime — same consumer interface as Hermes; called via the contract layer in `PI_HERMES_CONTRACT_V2.md`.
- **Agentic-KB** wiki queries — `kb query` checks the personal graph for resolved entity references before falling back to vector search over the wiki.

## Status

v0 — schema + seed scaffolding only. No code consumes the graph yet. Once Jay populates `seed.json` and reviews the schema, we'll wire the Hermes/Pi consumer in a follow-up PR.

## Related

- `[[wiki/concepts/agent-failure-modes]]`
- `[[wiki/personal/hermes-operating-context]]`
- `[[wiki/personal/personal-agent-design-observations]]`
- Source: Garry Tan, *Meta-Meta-Prompting: The Secret to Making AI Agents Work* (https://x.com/garrytan/status/2053127519872614419)

## Rule 13 note

This directory lives in the **Agentic-KB** (the agent compile-vault, public on GitHub). The personal write-vault at `/Users/jaywest/Documents/Obsidian Vault/` remains read-only as per the one-way rule. If real personal data lives in `seed.json`, that file MUST be gitignored — only `seed.example.json` is committable.
