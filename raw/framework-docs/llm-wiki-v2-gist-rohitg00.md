---
source_url: https://gist.github.com/rohitg00/2067ab416f7bbe447c1977edaaa681e2
source_raw_url: https://gist.github.com/rohitg00/2067ab416f7bbe447c1977edaaa681e2/raw/b5a4f5c2187f522472801163338641aa25ea288b/llm-wiki.md
author: Rohit Ghumare (rohitg00)
forked_from: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
date_published: 2026-04 (last active 2026-05-07)
date_ingested: 2026-05-16
stars: 1158
forks: 167
type: framework-doc
license: gist (public)
---

# LLM Wiki v2

A pattern for building personal knowledge bases using LLMs. Extended with lessons from building [agentmemory](https://github.com/rohitg00/agentmemory), a persistent memory engine for AI coding agents.

This builds on Andrej Karpathy's original LLM Wiki idea file. Everything in the original still applies. This document adds what we learned running the pattern in production: what breaks at scale, what's missing, and what separates a wiki that stays useful from one that rots.

## What the original gets right

The core insight is correct: **stop re-deriving, start compiling.** RAG retrieves and forgets. A wiki accumulates and compounds. The three-layer architecture (raw sources, wiki, schema) works. The operations (ingest, query, lint) cover the basics.

## The missing layer: memory lifecycle

The original treats all wiki content as equally valid forever. In practice, knowledge has a lifecycle.

**Confidence scoring.** Every fact in the wiki should carry a confidence score: how many sources support it, how recently it was confirmed, whether anything contradicts it. Confidence decays with time and strengthens with reinforcement.

**Supersession.** When new information contradicts or updates an existing claim, the new one should explicitly supersede it. Linked, timestamped, old version preserved but marked stale. Version control for knowledge.

**Forgetting.** Implement a retention curve: facts that haven't been accessed or reinforced in months should gradually fade. Ebbinghaus's forgetting curve works well — retention decays exponentially with time, but each reinforcement resets the curve. Architecture decisions decay slowly. Transient bugs decay fast.

**Consolidation tiers.** Working memory (recent observations) → Episodic memory (session summaries) → Semantic memory (cross-session facts) → Procedural memory (workflows and patterns). Each tier is more compressed, more confident, and longer-lived.

## Beyond flat pages: the knowledge graph

**Entity extraction** — extract structured entities (people, projects, libraries, concepts, files, decisions) with types, attributes, and relationships when ingesting a source.

**Typed relationships** — "uses," "depends on," "contradicts," "caused," "fixed," "supersedes" carry different semantic weight. "A caused B, confirmed by 3 sources, confidence 0.9" beats "A relates to B."

**Graph traversal for queries** — walk outward through "depends on" and "uses" edges to find downstream impact. Catches connections keyword search misses.

The graph augments wiki pages, doesn't replace them. Pages are for reading. The graph is for navigation and discovery.

## Search that scales

A flat `index.md` breaks around 100–500 documents. Hybrid search combines:
- **BM25** (keyword matching)
- **Vector search** (semantic similarity)
- **Graph traversal** (entity-aware)

Fuse with reciprocal rank fusion. In agentmemory all three run together — 95.2% on LongMemEval-S.

## Automation: event-driven hooks

- **On new source**: auto-ingest, extract entities, update graph, update index
- **On session start**: load relevant context from the wiki based on recent activity
- **On session end**: compress the session into observations, file insights
- **On query**: check if the answer is worth filing back (quality score > threshold)
- **On memory write**: check for contradictions, trigger supersession
- **On schedule**: periodic lint, consolidation, retention decay

Human stays in the loop for curation. Bookkeeping is automated.

## Quality and self-correction

- **Score everything** — every LLM-written page gets a quality score.
- **Self-healing** — lint auto-fixes orphans, stale claims, broken cross-references.
- **Contradiction resolution** — LLM proposes which claim is more likely correct based on source recency, authority, and supporting observations. Human can override.

## Multi-agent and collaboration

- **Mesh sync** — parallel agents merge observations into shared wiki; last-write-wins; timestamp-based resolution for conflicts.
- **Shared vs. private** — scoping for personal vs. team knowledge.
- **Work coordination** — lightweight: who's working on what, what's blocked.

## Privacy and governance

- **Filter on ingest** — strip API keys, tokens, PII automatically.
- **Audit trail** — every op logged with timestamp + diff + reason.
- **Bulk operations with governance** — audited, reversible.

## Crystallization

Take a completed chain of work and automatically distill it into a structured digest. What was the question? What did we find? What entities were involved? What lessons emerged? Becomes a first-class wiki page; lessons get extracted as standalone facts.

## Output formats beyond markdown

Comparison tables, timelines, dependency graphs, slide decks, JSON/CSV exports, briefs. The wiki is the store; output depends on the audience.

## The schema is the real product

The schema document (CLAUDE.md, AGENTS.md) is the most important file. It encodes:
- What entity/relationship types exist in your domain
- How to ingest different source kinds
- When to create vs. update pages
- Quality standards
- Contradiction handling
- Consolidation schedule
- Private vs. shared

You and the LLM co-evolve this over time. After a few dozen sources and lint passes, you have a schema that reflects how your domain actually works. Transferable to others working similar domains.

## Implementation spectrum (modular, not all-or-nothing)

1. **Minimal viable wiki** — raw + pages + index.md + schema. Start here.
2. **Add lifecycle** — confidence scoring, supersession, retention decay.
3. **Add structure** — entity extraction, typed relationships, knowledge graph.
4. **Add automation** — hooks for auto-ingest, auto-lint, context injection.
5. **Add scale** — hybrid search, consolidation tiers, quality scoring.
6. **Add collaboration** — mesh sync, shared/private scoping, work coordination.

## Why this matters

Karpathy's original: the bottleneck is bookkeeping, and LLMs eliminate that bottleneck. What v2 adds is the machinery that keeps the wiki healthy as it scales. Lifecycle so knowledge doesn't rot. Structure so connections aren't lost. Automation so humans stay focused on thinking. Quality controls so the wiki earns trust over time.

The Memex is finally buildable. Not because we have better documents or better search, but because we have librarians that actually do the work.

---

## Notable comments / counter-arguments

**gnusupport (2026-04-14)** — critique that the blueprint is "a product vision dressed as an architecture document." Specific gaps named: confidence scoring undefined (float? enum? who computes?); auto-crystallize has no extraction algorithm or trigger condition; hybrid search has no fusion strategy or latency targets; no accuracy metrics (NDCG, MRR); no provenance/access-control/versioning/backup; LLMs treated as reliable when they'll silently corrupt the graph. *"Great direction, terrible blueprint. Don't build from this. Steal the ideas, not the plan."*

**Mattia83it (2026-05-04)** — tension between "schema is the real product" and the elaborate lifecycle apparatus pulling opposite directions. Three concrete pushbacks: (1) Forgetting curves applied to errors and superseded decisions are how you repeat the same mistake — old doesn't mean stale; the right primitive is **explicit supersession, not decay**. (2) Numeric confidence scores are false precision; the real signal is the chain of links a claim carries — "Confirmed in an ADR, the related commit, and two source documents" beats "0.85". (3) Event-driven auto-ingest assumes reliable LLMs; they aren't, especially local-model scale. **Human-in-the-loop as a write gate is quality control, not backwardness.**

**ChristopherA (2026-04-18)** — interested in explicitly authored named edges (e.g., `derived_from::[[Source]]`) rather than inferred graphs. Two conventions: `[[wikilinks]]` for connections + named edges for what the connection means. No database needed.

**Related work surfaced in comments:**
- agentmemory (the engine behind this gist): https://github.com/rohitg00/agentmemory
- iii-engine (foundation for agentmemory): https://github.com/iii-hq/iii
- Memex (Flutter productization with P.A.R.A.): https://github.com/memex-lab/memex
- ctx (Karpathy-style wiki for Claude Code skill/agent recommendation): https://github.com/stevesolun/ctx
- quicky-wiki (entity + graph + BM25 + vector fork): https://github.com/silentrob/quicky-wiki
- Gbrain (similar design philosophy): https://github.com/garrytan/gbrain

---

*Source: gist.github.com/rohitg00/2067ab416f7bbe447c1977edaaa681e2 — fetched 2026-05-16. Original gist is a fork of karpathy/llm-wiki.md.*
