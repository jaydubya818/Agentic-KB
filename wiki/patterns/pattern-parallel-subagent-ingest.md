---
id: 01KQ2XDQJJWYRF1DWSDP8EV5SV
title: "Parallel Subagent Ingest"
type: pattern
tags: [agents, orchestration, workflow, automation, knowledge-base]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: https://github.com/TristanH/wikiwise/blob/main/Sources/Wikiwise/Resources/scaffold/skills/import-readwise/SKILL.md
related: [pattern-import-readwise-skill, concepts/ingest-pipeline, concepts/multi-agent-systems]
---

# Parallel Subagent Ingest

A concurrency pattern in which one subagent is spawned per source document to run the full ingest workflow independently and in parallel. Used in Wikiwise to maximise throughput when processing multiple imported sources.

## When to Use

- You have a batch of 2+ raw sources that need to be processed through the same workflow
- Each source can be processed independently (no cross-source dependencies during ingest)
- You want to minimise total wall-clock time for ingestion
- The downstream workflow (e.g. INGEST) is self-contained per document

## Structure

```
Orchestrator
├── Batch sources (3–5 per batch)
├── For each source in batch:
│   └── Spawn subagent
│       └── Subagent runs full INGEST workflow on its single source
└── Collect results
```

1. **Orchestrator** receives the list of sources to ingest
2. **Batching** — sources are grouped into batches of 3–5 before subagents are launched (avoid one-at-a-time processing)
3. **Subagent spawn** — one subagent is created per source in the batch
4. **Independent execution** — each subagent runs the complete ingest workflow on its assigned source with no coordination required
5. **Results** — each subagent writes its output (wiki pages, summaries, etc.) independently

## Example

In the [import-readwise skill](./pattern-import-readwise-skill.md):

- Sources are fetched from Readwise and written to `raw/readwise/`
- Once a batch of 3–5 files is ready, the orchestrating agent spawns one subagent per file
- Each subagent reads its file, runs the INGEST workflow, and writes compiled wiki pages
- Subagents do not communicate with each other

## Trade-offs

| Pro | Con |
|---|---|
| Maximises throughput for independent sources | Higher concurrency overhead per batch |
| Simple subagent logic (each handles one source) | Orchestrator must manage spawning and result collection |
| Failures are isolated per source | May create duplicate KB entries if sources overlap |
| Scales linearly with source count | Batching adds a small delay before the first source is processed |

## Batching Protocol

Ingesting one source at a time is explicitly **prohibited** for efficiency reasons. Always batch 3–5 sources before launching subagents. This amortises subagent spin-up cost and reduces orchestration overhead.

> ⚠️ **Edge case**: The protocol does not specify behaviour when fewer than 3 sources are available. In practice, treat the 3–5 range as a soft efficiency target — if only 1–2 sources are present, proceed with those rather than waiting.

## Related Patterns

- [Import-Readwise Skill](./pattern-import-readwise-skill.md)
- [Ingest Pipeline](../concepts/ingest-pipeline.md)
- [Multi-Agent Systems](../concepts/multi-agent-systems.md)

## See Also

- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
- [Agent Loops](../concepts/agent-loops.md)
- [Ingest Pipeline](../concepts/ingest-pipeline.md)
