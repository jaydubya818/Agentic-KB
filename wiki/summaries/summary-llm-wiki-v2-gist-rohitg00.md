---
title: "LLM Wiki v2 — Rohitg00's gist (primary source)"
type: summary
source_file: raw/framework-docs/llm-wiki-v2-gist-rohitg00.md
source_url: https://gist.github.com/rohitg00/2067ab416f7bbe447c1977edaaa681e2
author: Rohit Ghumare (rohitg00)
date_published: 2026-04
date_ingested: 2026-05-16
tags: [memory, context-management, agentic, knowledge-graph, evaluation, rag-systems, llm-wiki, forgetting-curve, hybrid-search]
key_concepts:
  - confidence-scoring
  - supersession
  - forgetting-curve
  - consolidation-tiers
  - typed-knowledge-graph
  - reciprocal-rank-fusion
  - event-driven-hooks
  - crystallization
  - schema-as-product
confidence: high
reviewed: false
reviewed_date: ""
---

# Summary: LLM Wiki v2 (gist)

## Source

This is the **primary source** the 2026-04-12 ingest tried (and failed) to find. It's a public gist by Rohit Ghumare (`rohitg00`), forked from Karpathy's original llm-wiki.md, last active 2026-05-07, currently 1,158 stars / 167 forks. Resolves the contradiction flagged in `wiki/log.md` 2026-04-12 (Lint Pass — *"agentmemory primary source NOT FOUND"*). Companion repo: `github.com/rohitg00/agentmemory`.

> **Provenance:** `summaries/summary-llm-wiki-v2.md` (ingested 2026-04-12 from the social post only) made medium-confidence claims about this content. This summary supersedes it with the primary source; confidence upgraded from `medium` → `high`. Old summary preserved per Rule 4 (no silent overwrites); Jay flips `reviewed: true` on the v1 summary when he wants to mark it deprecated.

## Argument

The author's position is that Karpathy's original LLM Wiki gets the core insight right — **stop re-deriving, start compiling** — but treats wiki content as equally valid forever, which is what makes wikis rot at scale. v2 adds the machinery: confidence + supersession + retention decay + hybrid search + auto-ingest hooks. Agentmemory is the production implementation; it claims 95.2% on LongMemEval-S using BM25 + vector + knowledge-graph fusion via reciprocal rank fusion.

The strongest novel claims relative to the existing Agentic-KB wiki:

1. **Forgetting curves are a first-class operation.** Knowledge isn't deleted; it decays in priority unless reinforced (Ebbinghaus model). Architecture decisions decay slowly; transient bugs decay fast.
2. **Consolidation tiers** (working → episodic → semantic → procedural memory) define a promotion pipeline that the existing `promotion-rules.md` could be aligned to.
3. **Hybrid retrieval with RRF** is the named scaling answer beyond ~200 pages. Currently the only [[concepts/rag-systems]] page covers retrieval, but [[patterns/pattern-hybrid-search]] doesn't exist (flagged in 2026-05-16 graduation candidates — this second source unblocks it under Rule 14).
4. **Schema is the real product.** The CLAUDE.md / AGENTS.md file is what turns a generic LLM into a disciplined knowledge worker. Agentic-KB's own CLAUDE.md already does this.

## Evidence

- Forking lineage from karpathy/llm-wiki.md — verifiable on GitHub.
- Claimed 95.2% on LongMemEval-S benchmark via agentmemory (BM25 + vector + graph + RRF). Not independently verified in this ingest; benchmark methodology not provided in the gist (it's in the agentmemory repo, which is a follow-up ingest target).
- 1,158 stars / 167 forks on the gist suggest meaningful community traction.

## Counter-arguments & Gaps

The comments thread on the gist itself contains substantive criticism worth surfacing:

- **gnusupport (2026-04-14):** the blueprint is "a product vision dressed as an architecture document." Names specific undefined terms: confidence scoring (float? enum? who computes?), auto-crystallize (no extraction algorithm, no trigger), hybrid search (no fusion strategy or latency targets), no accuracy metrics, no provenance/access-control/versioning/backup story. *"Great direction, terrible blueprint. Don't build from this. Steal the ideas, not the plan."*
- **Mattia83it (2026-05-04):** three pushbacks worth taking seriously:
  1. **Forgetting curves applied to errors and superseded decisions are how you repeat the same mistake.** Old doesn't mean stale; supersession beats decay. Git is the natural audit trail.
  2. **Numeric confidence scores are false precision.** "Confirmed in an ADR, the related commit, and two source documents" carries more signal than "0.85".
  3. **Event-driven auto-ingest assumes reliable LLMs.** They aren't, especially local-model scale. Human-in-the-loop as a write gate is **quality control, not backwardness**. The Agentic-KB CLAUDE.md Rule 12 (`reviewed: false` default) aligns with this position.
- **ChristopherA (2026-04-18):** prefers explicitly authored named edges (`derived_from::[[Source]]`) over inferred graphs. Closer to Agentic-KB's current `[[wikilinks]]` + frontmatter `related:` / `depends_on:` discipline than to the v2 inference-heavy graph proposal.

**Direct implication for Agentic-KB:** the v2 gist's pro-decay, pro-numeric-confidence stance conflicts with the Mattia critique. Agentic-KB currently leans Mattia's way (Rule 12 human-review gate; Rule 4 contradiction logging without silent overwrite; no numeric confidence floats — just `high|medium|low`). Adopting v2 wholesale would be a philosophical shift; the right move is to take the structural pieces (hybrid search, typed entities, consolidation tiers) and leave the numeric-confidence and aggressive-decay parts as candidate patterns.

## Conclusion

This gist is the canonical primary source for the "LLM Wiki v2" pattern. It is now ingested and citable. Its structural recommendations (hybrid search via RRF, typed knowledge graph, consolidation tiers, schema-as-product) align with Agentic-KB's direction and unblock graduation of `pattern-hybrid-search` and `concepts/reciprocal-rank-fusion`. Its lifecycle recommendations (forgetting curves, numeric confidence) are contested by sophisticated counter-arguments in the gist's own comments, and Agentic-KB's existing Rule 12 / Rule 4 / Rule 14 already implement a more conservative version. Worth keeping as a comparison point, not a target architecture.

**Follow-ups:**
- Ingest the [agentmemory](https://github.com/rohitg00/agentmemory) repo README as a second source on the implementation (benchmark methodology, latency targets, fusion strategy).
- Graduate `pattern-hybrid-search` and `concepts/reciprocal-rank-fusion` now that this is a second source (per Rule 14).
- Open question for future synthesis: *"Does numeric confidence scoring add signal over evidence-chain provenance for an Agentic-KB-sized wiki (~250 pages)?"*

## Sources

- [[raw/framework-docs/llm-wiki-v2-gist-rohitg00]] — primary source (this ingest)
- [[summaries/summary-llm-wiki-v2]] — earlier secondary summary from the social post (now superseded)
- [[summaries/summary-karpathy-llm-wiki-gist]] — the original v1 pattern this forks from
- [[wiki/log.md]] entry 2026-05-16 — contradiction resolution
