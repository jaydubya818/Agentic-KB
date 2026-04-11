---
title: Memory MoC
type: moc
tags: [memory, context-management, agentic, moc]
created: 2026-04-10
updated: 2026-04-10
---

# Memory — Map of Content
> Navigation hub for all memory-related pages: systems, patterns, architectures, and recipes.

---

## Core Concepts

- [[concepts/memory-systems]] — Persistence and retrieval across sessions; in-context, file-wiki, vector DB, knowledge graph
- [[concepts/context-management]] — Managing the finite context window; tiered loading, primacy-recency curve, budget packing
- [[concepts/llm-wiki-pattern]] — Karpathy-style LLM-maintained wiki as the memory substrate
- [[concepts/llm-wiki]] — The LLM wiki as compounding knowledge base vs stateless RAG
- [[concepts/rlm-pipeline]] — 10-stage Recursive Layered Memory retrieval (stages 4–9 live as of Apr 2026)
- [[concepts/vault-architecture]] — Jay's 3-tier vault: raw (immutable) / wiki (LLM-owned) / schema (co-evolving)
- [[concepts/rag-systems]] — RAG architecture: chunking, hybrid retrieval, re-ranking, grounded generation, metadata filtering, evaluation metrics
- [[concepts/state-persistence]] — How agents maintain state across task boundaries

---

## Patterns

- [[patterns/pattern-compounding-loop]] — The core memory flywheel: ingest → wiki → query → save; ×1.25 verified boost
- [[patterns/pattern-episodic-judgment-log]] — Human judgment as append-only JSONL; distinct from semantic memory
- [[patterns/pattern-two-step-ingest]] — Two-call ingest pipeline: analysis → generation with intermediate knowledge graph

---

## System: Memory Classes (V2)

The Agentic-KB agent runtime implements 8 typed memory classes with freshness and trust scoring:

| Class | Lifetime | Half-life | Use |
|-------|----------|-----------|-----|
| `profile` | permanent | exempt | Agent identity, capabilities |
| `canonical` | permanent | 180 days | Verified, promoted knowledge |
| `hot` | permanent | exempt | ≤500-word fast-access cache |
| `learned` | long-term | 60 days | Promoted session discoveries |
| `personal` | long-term | 90 days | Jay's validated patterns |
| `session` | session | 7 days | Working context for current task |
| `working` | task | 1 day | Active task state |
| `bus` | transient | — | Inter-agent message passing |

See [[system/policies/freshness-policy]] and [[system/policies/source-trust-policy]] for scoring details.

---

## Frameworks & Tools

- [[frameworks/framework-claude-code]] — Claude Code memory: CLAUDE.md, project files, agent profiles
- [[frameworks/framework-mcp]] — MCP server exposing KB as queryable agent memory
- [[frameworks/framework-markitdown]] — File-to-markdown conversion for raw/ ingest pipeline

---

## Recipes

- [[recipes/recipe-llm-wiki-setup]] — Set up a Karpathy-style LLM knowledge base from scratch
- [[recipes/recipe-codebase-memory]] — Wire KB as persistent codebase memory for Claude Code sessions
- [[recipes/recipe-context-compression]] — Rolling summary compression for long agentic sessions

---

## Evaluations

- [[evaluations/eval-memory-approaches]] — In-context vs file-wiki vs vector DB vs knowledge graph; file-wiki wins for Jay's use case

---

## Policies (V2 Runtime)

- [[system/policies/promotion-rules]] — When and how discoveries get promoted (learned → canonical)
- [[system/policies/freshness-policy]] — Exponential decay formula; stale thresholds by class
- [[system/policies/source-trust-policy]] — Trust scoring: class weight × confidence multiplier × verification bonus
- [[system/policies/contradiction-policy]] — Contradiction detection, statuses, review routing

---

## Key Summaries

- [[summaries/siagian-agentic-engineer-roadmap-2026]] — Memory section: summaries vs embeddings vs structured KV; checkpointing; context budgeting; failure modes; user corrections

- [[summaries/summary-karpathy-llm-wiki-gist]] — Karpathy's minimal pattern: immutable raw, LLM-owned wiki, co-evolving schema
- [[summaries/summary-karpathy-llm-wiki-video]] — Three-layer architecture; INGEST/QUERY/LINT operations
- [[summaries/summary-nate-herk-llm-wiki]] — 95% token reduction vs RAG; hot cache pattern
- [[summaries/agentic-kb-rlm-pipeline]] — RLM pipeline stages and implementation status
- [[summaries/vault-3tier-architecture]] — Jay's production vault: tier-scoped memory and inter-tier bus
