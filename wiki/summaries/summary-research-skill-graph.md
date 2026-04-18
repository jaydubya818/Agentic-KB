---
title: "Local Research Engine — The Research Skill Graph System"
type: summary
source_file: raw/transcripts/research-skill-graph.md
source_url: https://medium.com (estimated)
author: Unknown practitioner (4 client deployments: media company, 2 consulting firms, 1 independent analyst)
date_published: 2026
date_ingested: 2026-04-12
tags: [agentic, memory, prompt-engineering, multi-agent, context-management, knowledge-graph, tool-use]
key_concepts:
  - research-skill-graph
  - six-lens-analysis
  - source-evaluation-tiers
  - synthesis-rules
  - compound-research-memory
confidence: high
---

# Summary: Local Research Engine — The Research Skill Graph System

## Source
Practitioner article documenting a research automation system deployed for 4 clients (one major media company, two consulting firms, one independent analyst). Combined 60% reduction in research costs. One client replaced 3 junior researchers with this system + one senior editor.

> "No fancy tools. No $500/mo subscriptions. No 47 open chrome tabs. Just a folder of .md files, one AI agent (Claude), and a system that takes one research question and produces a multi-angle analysis that would normally take a team 2 weeks."

---

## Core Concept: The Research Skill Graph

A folder of interconnected markdown files where each file is one "knowledge node." Files reference each other with `[[wikilinks]]`. When Claude is pointed at this folder with a research question, it:
1. Reads the methodology files (source evaluation, synthesis rules, contradiction protocol)
2. Applies the research question through 6 forced lenses in sequence
3. Documents contradictions between lenses (tensions = insights)
4. Synthesizes across lenses with calibrated confidence
5. Accumulates knowledge in `concepts.md` and `data-points.md` across all future research

**The difference:** a single prompt gives you a summary. A skill graph gives you a research department.

---

## The 6 Lenses

| Lens | Question | Voice |
|------|----------|-------|
| **Technical** | What do the numbers actually say? What mechanisms drive this? | Clinical, precise, no emotional language |
| **Economic** | Follow the money. Who pays, who profits, what incentives? | Incentive-driven, skeptical of stated motivations |
| **Historical** | What patterns repeat? What's been tried? What context is everyone forgetting? | Long-horizon, precedent-focused |
| **Geopolitical** | Zoom out to the global chessboard. Which countries, power dynamics? | Systemic, power-aware |
| **Contrarian** | What if the consensus is wrong? Who benefits from the current narrative? | Devil's advocate, challenge everything |
| **First Principles** | Forget everything. Rebuild from fundamental truths only. | Reductive, axiomatic |

Key insight: lenses are **designed to disagree** with each other. The tension between "Technical: crisis, the math is brutal" and "Contrarian: Japan has had low fertility for 50 years and hasn't collapsed" is where real insight lives.

---

## Folder Structure (20 files, 6 folders)

```
/research-skill-graph
├── index.md                    ← command center, execution instructions
├── research-log.md             ← cross-project memory, compound effect
├── methodology/
│   ├── research-frameworks.md  ← which approach for which question type
│   ├── source-evaluation.md    ← 5-tier trust system + red flags
│   ├── synthesis-rules.md      ← combine without flattening
│   └── contradiction-protocol.md ← surfaces tensions as features
├── lenses/
│   ├── technical.md
│   ├── economic.md
│   ├── historical.md
│   ├── geopolitical.md
│   ├── contrarian.md
│   └── first-principles.md
├── projects/                   ← one subfolder per research topic
├── sources/
│   └── source-template.md
└── knowledge/
    ├── concepts.md             ← accumulates across all projects
    └── data-points.md          ← verified numbers with attribution
```

---

## Source Evaluation Tiers (maps to KB's trust policy)

| Tier | Examples | Use For |
|------|----------|---------|
| **1 — Primary Data** | UN/World Bank datasets, peer-reviewed with methodology, financial filings | Hard claims, base assumptions |
| **2 — Expert Analysis** | Domain research institutions, authority books, investigative journalism | Causal claims, framework building |
| **3 — Informed Commentary** | Expert blogs, quality podcasts, think tanks (check funding) | Angle generation, hypothesis |
| **4 — General Media** | Major news, Wikipedia | Initial orientation only |
| **5 — Social/Anecdotal** | Twitter threads, Reddit, viral content | Signal detection only |

---

## The Compound Effect (why this beats ChatGPT research)

`knowledge/concepts.md` and `knowledge/data-points.md` accumulate across ALL projects. After 5 projects: 200+ verified data points, 50+ defined concepts. The 10th project starts from everything already learned.

`open-questions` from one research become the `index.md` of the next — automatic research roadmapping.

---

## Integration with This KB

| Research Skill Graph | This KB Equivalent |
|---|---|
| `source-evaluation.md` (5 tiers) | `system/policies/source-trust-policy.md` |
| `contradiction-protocol.md` | `system/policies/contradiction-policy.md` |
| `synthesis-rules.md` | CLAUDE.md QUERY workflow |
| `research-log.md` | `wiki/log.md` + `wiki/summaries/` |
| `knowledge/concepts.md` + `data-points.md` | `wiki/concepts/` + `wiki/patterns/` |
| 6 lenses | No equivalent — **genuine gap** |

The 6-lens methodology is the most novel contribution. This KB currently lacks a structured multi-angle analysis workflow. See [[recipes/recipe-local-research-engine]] for the implementation.

---

## New Pages Identified
- [[recipes/recipe-local-research-engine]] — Full setup guide + [[framework-claude-code]] integration
- The actual folder structure is scaffolded at `/Users/jaywest/Agentic-KB/research-skill-graph/`
