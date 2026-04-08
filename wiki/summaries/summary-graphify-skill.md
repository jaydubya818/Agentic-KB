---
id: 01KNNVX2RBJPFN9TC4SK1PFHNK
title: Graphify Skill
type: summary
source_file: raw/my-skills/graphify-skill.md
author: Jay West
date_ingested: 2026-04-04
tags: [agentic, claude-code, skill, knowledge-graph, graphrag, community-detection, parallel-extraction]
key_concepts: [knowledge-graph, community-detection, parallel-subagents, extraction-cache, honest-audit-trail, graphrag-json, obsidian-integration]
confidence: high
---

# Graphify Skill

## Key Purpose

Converts any folder of files (code, docs, papers, images) into a navigable knowledge graph with community detection. Produces three outputs: interactive HTML, GraphRAG-ready JSON, and a plain-language GRAPH_REPORT.md. Built around [[andrej-karpathy]]'s `/raw` folder workflow — drop anything in, get a structured graph showing what's connected.

Trigger: `/graphify`

## Design Decisions

### Three Things Claude Alone Cannot Do

The skill explicitly names what makes the graph valuable beyond what Claude can do in-context:
1. **Persistent graph** — `graphify-out/graph.json` survives across sessions. Ask questions weeks later without re-reading everything.
2. **Honest audit trail** — every edge tagged EXTRACTED, INFERRED, or AMBIGUOUS. You know what was found vs. invented.
3. **Cross-document surprise** — community detection finds connections between files you'd never think to ask about.

### Mandatory Parallel Subagent Extraction

Step 3 (semantic extraction) requires the Agent tool. Reading files one-by-one is explicitly forbidden: "MANDATORY: You MUST use the Agent tool here. Reading files yourself one-by-one is forbidden — it is 5–10x slower. If you do not use the Agent tool you are doing this wrong."

All subagent calls go in a single message for true parallelism. Chunk size: 20–25 files per agent. Each image gets its own chunk (vision needs separate context).

### Dual-Track Extraction

AST extraction (structural, deterministic, free) runs in parallel with semantic extraction (Claude-powered, costs tokens). Code files go through AST; docs/papers/images go through semantic subagents. Results merge in Part C. Parallelizing both tracks saves 5–15 seconds on large corpora.

### Extraction Cache

Before dispatching subagents, the skill checks which files already have cached extraction results. Only uncached files get processed. If all files are cached, the skill skips semantic extraction entirely and goes straight to graph construction.

This makes incremental updates (`--update` flag) fast — only changed files need reprocessing.

### Corpus Size Safety Check

If `total_words > 2,000,000` OR `total_files > 200`: show warning, list top 5 subdirectories by file count, ask which subfolder to run on. Prevents accidental multi-million-token extraction runs.

### Multiple Export Formats

Default: interactive HTML + JSON. Optional flags: `--svg`, `--graphml` (Gephi/yEd), `--neo4j` (Cypher file), `--neo4j-push bolt://...` (direct push). [[mcp-ecosystem]] server mode: `--mcp` starts a stdio server exposing the graph as an agent tool.

### Query Interface

Beyond building the graph, graphify supports:
- `query "<question>"` — BFS traversal for broad context
- `query "<question>" --dfs` — DFS to trace a specific path
- `path "NodeA" "NodeB"` — shortest path between two concepts
- `explain "ConceptName"` — plain-language explanation of a node

### Integration with Karpathy Pattern

"graphify is built around [[andrej-karpathy]]'s /raw folder workflow." The CLAUDE.md for this KB explicitly calls for running graphify after major ingestion runs, with output to `wiki/syntheses/knowledge-graph-{date}.html`.

## Prompt Patterns Observed

- **"Forbidden" pattern:** Reading files one-by-one is explicitly forbidden, not just discouraged. The prohibition is stronger than a recommendation.
- **Timing estimate before dispatch:** The skill pre-calculates agent count and estimated time before dispatching subagents. This sets user expectations and enables the user to cancel before a long run.
- **Concrete example of parallel calls:** Shows exact syntax for dispatching 3 agents in one message, making the parallel pattern explicit rather than assumed.
- **Installation detection:** The skill auto-detects Python interpreter and installs the graphify package if missing. Reduces setup friction.

## Related Concepts

- [[wiki/summaries/summary-karpathy-llm-wiki-gist]]
- [[wiki/summaries/summary-multi-agent-patterns-skill]]

## Sources

- `raw/my-skills/graphify-skill.md`
