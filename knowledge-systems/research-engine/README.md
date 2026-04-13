---
title: Local Research Engine
type: module
status: active
created: 2026-04-12
updated: 2026-04-12
owner: Jay West
---

# Local Research Engine

A provenance-aware, graph-structured research system built inside the Agentic-KB. Every research run compounds into the shared knowledge base. No separate vault, no forked attention — same links, same memory, same repo.

## What it does

Converts a research question into a structured artifact: executive summary, deep dive, entity map, verified data points, open questions, and a recommendation or next action. Every finding is tagged with source, date, confidence, scope, and related project.

## How to use

1. Start with `command-center.md` — it is the execution entry point
2. Fill in `templates/research-question-intake.md` before any research begins
3. Run the 6-lens analysis using files in `lenses/`
4. Apply `methodology/source-evaluation.md` to every source before using it
5. Capture findings in `knowledge/` — concepts, entities, data-points, relationships
6. Output artifacts using `templates/` — executive summary, deep dive, or decision memo
7. Log open questions in `knowledge/open-questions.md` — they feed back into future research and the weekly brief

## Structure

```
research-engine/
├── README.md               ← this file
├── command-center.md       ← execution entry point
├── methodology/            ← how to research
│   ├── research-frameworks.md
│   ├── source-evaluation.md
│   ├── synthesis-rules.md
│   ├── contradiction-protocol.md
│   ├── ontology-lite.md    ← node types + relationship types
│   └── provenance-rules.md ← every claim tracks its origin
├── lenses/                 ← 6 forced-perspective analysis angles
│   ├── technical.md
│   ├── economic.md
│   ├── historical.md
│   ├── geopolitical.md
│   ├── contrarian.md
│   └── first-principles.md
├── templates/              ← reusable output formats
│   ├── research-question-intake.md
│   ├── project-template.md
│   ├── source-template.md
│   ├── executive-summary-template.md
│   ├── deep-dive-template.md
│   └── decision-memo-template.md
├── knowledge/              ← accumulates across all projects
│   ├── concepts.md
│   ├── entities.md
│   ├── data-points.md
│   ├── relationships.md
│   └── open-questions.md
└── projects/               ← one folder per research topic
    └── <topic-name>/
```

## Integration with KB

- Findings promoted via [[wiki/CLAUDE.md]] INGEST workflow
- Open questions feed `wiki/personal/hermes-operating-context.md` weekly brief
- Entity relationships feed `wiki/patterns/pattern-typed-knowledge-graph.md`
- Source trust follows `wiki/system/policies/source-trust-policy.md`
