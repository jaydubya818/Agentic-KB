---
title: "Ar9av Obsidian Wiki"
type: summary
source_file: raw/framework-docs/ar9av-obsidian-wiki.md
source_url: https://github.com/Ar9av/obsidian-wiki
author: Ar9av / obsidian-wiki contributors
date_published: ""
date_ingested: 2026-06-25
tags: [llm-wiki, obsidian, agentic, memory, skills, framework]
key_concepts: [llm-wiki-pattern, delta-tracking, provenance, multi-agent-ingest, tiered-retrieval]
confidence: medium
---

# Ar9av Obsidian Wiki

## Source

- Raw source: `raw/framework-docs/ar9av-obsidian-wiki.md`
- URL: https://github.com/Ar9av/obsidian-wiki
- Captured context: Jay flagged this as Obsidian-backed persistent AI memory to compare against Agentic-KB's existing schema and safe pilot approach.

## TL;DR

[[frameworks/framework-obsidian-wiki|obsidian-wiki]] packages the [[patterns/llm-wiki-pattern|LLM Wiki pattern]] into installable agent skills across Claude Code, Cursor, Codex, Gemini, Hermes, OpenClaw, Pi, and others. It adds delta tracking, multi-agent history ingest, provenance tagging, cross-linking, graph export, tiered retrieval, and optional semantic search.

## Key Points

- **Setup model:** `pip install obsidian-wiki` plus `obsidian-wiki setup --vault /path/to/vault` writes config and installs/symlinks bundled wiki skills into multiple agent skill directories.
- **Four-stage ingest:** ingest source material, pull concepts/entities/claims/relationships/questions, merge into existing wiki pages, and evolve schema as needed.
- **Delta tracking:** a `.manifest.json` tracks every source ingested, timestamps, and produced pages so future ingest can process only changed/new material.
- **Multi-agent history ingest:** dedicated skills mine histories from Claude, Codex, Hermes, OpenClaw, Pi, Copilot, etc.
- **Cross-agent targeted search:** commands such as `/wiki-codex "rust ownership"` query a specific agent's raw history and ingest relevant slices.
- **Provenance:** claims can be tagged as extracted, inferred, or ambiguous; a provenance block summarizes the mix per page.
- **Tiered retrieval:** query reads titles/tags/summaries before full page bodies to keep cost flatter as the vault grows.
- **Optional QMD semantic search:** lexical/vector pass over wiki/source collections when configured; degrades to grep/glob otherwise.
- **Graph tooling:** colorization, graph export to JSON/GraphML/Cypher/HTML, and structure insights.

## Extracted KB Updates

- Created [[frameworks/framework-obsidian-wiki]].
- Updated [[patterns/llm-wiki-pattern]] with obsidian-wiki as a packaged implementation that extends the base pattern with manifest/delta/provenance/agent-history features.

## Jay-Relevant Takeaway

Do not install this directly into Jay's primary vault or global agent config from an unattended job. The right move is a local-only safe pilot against a disposable vault, then compare its manifest/provenance/tiered-query ideas against Agentic-KB's Night Shift architecture.

## Caveats

- The README includes broad multi-agent setup behavior that writes/symlinks skills into global agent directories. That is high blast radius for Jay's environment.
- License details were not visible in the captured README; treat commercial/legal usage as unverified until checked.

## Sources

- `raw/framework-docs/ar9av-obsidian-wiki.md`
