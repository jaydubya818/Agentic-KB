---
title: obsidian-wiki
type: framework
vendor: Ar9av / obsidian-wiki contributors
version: rolling
language: any
license: open-source
github: https://github.com/Ar9av/obsidian-wiki
tags: [llm-wiki, obsidian, memory, skills, agentic, hermes]
last_checked: 2026-06-25
jay_experience: limited
---

## Overview

obsidian-wiki is an installable implementation of the [[patterns/llm-wiki-pattern|LLM Wiki pattern]] for Obsidian-backed agent memory. It packages wiki setup, ingest, query, history-mining, cross-linking, linting, graph export, and daily maintenance into agent skills that can be installed across many AI coding agents.

The project is relevant to Agentic-KB because it solves the same broad problem — durable, source-grounded markdown memory — but with a more general multi-agent skill distribution model.

## Core Concepts

- **Agent-owned wiki:** the AI agent reads raw sources and writes interlinked markdown pages.
- **Four-stage ingest:** ingest → pull information → merge → schema evolution.
- **Manifest/delta tracking:** `.manifest.json` records processed sources and produced pages.
- **Multi-agent history ingest:** mines histories from Claude, Codex, Hermes, OpenClaw, Pi, Copilot, and others.
- **Cross-agent targeted search:** topic-first extraction from a specific agent's session history.
- **Provenance tagging:** page claims can be marked extracted, inferred, or ambiguous.
- **Tiered retrieval:** query reads cheap metadata first, then page bodies only when needed.
- **Optional QMD semantic search:** lex/vector search over wiki or source collections, degrading to grep/glob when absent.

## Architecture

```text
raw source / history / transcript
  → wiki-ingest skill
  → extract concepts, claims, relationships, questions
  → merge into existing wiki or create new page
  → update manifest, index, links, graph, status
```

## Strengths

- **Packaged operational surface:** skills cover setup, ingest, query, status, rebuild, lint, export, cross-linking, taxonomy, daily update, and history ingest.
- **Cross-agent portability:** README lists setup conventions for Claude Code, Cursor, Windsurf, Codex, Gemini, Hermes, OpenClaw, Pi, and others.
- **Delta tracking:** avoids full re-ingest when sources have not changed.
- **Provenance awareness:** explicitly distinguishes extracted vs inferred vs ambiguous knowledge.
- **Query cost control:** tiered retrieval keeps page-body loading demand-driven.

## Weaknesses

- **High setup blast radius:** default setup writes or symlinks skills into global agent directories. That is unsafe for Jay's primary environment without a pilot.
- **Schema mismatch risk:** Agentic-KB already has a native schema, Night Shift state, and raw immutability rules. Installing another taxonomy could create competing conventions.
- **License not verified in captured README:** the repo is public, but the captured source did not include explicit license text.
- **Auto-removal conflict:** the README's `_raw/` promotion behavior removes promoted raw files; Agentic-KB scheduled jobs must never delete or move raw originals.

## Minimal Working Example

```bash
pip install obsidian-wiki
obsidian-wiki setup --vault /path/to/your/digital/brain
obsidian-wiki list
obsidian-wiki info
```

For Agentic-KB, use the safe-pilot pattern instead: disposable local vault, local-only install, no global agent config mutation, and compare generated artifacts before adopting any convention.

## Integration Points

- **Agentic-KB Night Shift:** manifest/delta/provenance ideas map to `.night-shift/state/`, source summaries, and claim confidence.
- **[[patterns/llm-wiki-pattern]]:** obsidian-wiki is a packaged implementation and extension.
- **[[concepts/memory-systems]]:** provides a durable compiled memory layer across agents.
- **Hermes skills:** compatible in principle, but global symlink setup must be avoided unless explicitly approved.

## Jay's Experience

Limited — this has been reviewed as a candidate/pilot source, not adopted into Agentic-KB.

## Version Notes

- Captured README reports pip install, skills CLI install, git clone setup, many agent integrations, QMD semantic search, graph export, and browser capture extension.

## Sources

- [[summaries/ar9av-obsidian-wiki]]
- Raw source: `raw/framework-docs/ar9av-obsidian-wiki.md`
- GitHub: https://github.com/Ar9av/obsidian-wiki
