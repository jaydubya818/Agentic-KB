---
title: Visualization
type: moc
category: structure
tags: [obsidian, graph-view, canvas, knowledge-maps, dashboards, visualization]
created: 2026-04-13
updated: 2026-04-13
---

# Visualization

Making the knowledge network visible. Covers graph view optimization for the Agentic-KB, Canvas workspace patterns for research and architecture, knowledge maps, and progress dashboards.

---

## Graph View Optimization

The Obsidian graph view is a direct audit tool for KB health — not just aesthetics. A well-configured graph reveals orphan pages, hub nodes, and weak domain clusters instantly.

**Recommended settings for Agentic-KB:**

| Setting | Value | Reason |
|---------|-------|--------|
| Filter: Files | `path:wiki/` | Exclude raw/ — too noisy |
| Filter: Attachments | Off | No binary assets in this vault |
| Color group 1 | `type:concept` → Blue | Concepts are foundational |
| Color group 2 | `type:pattern` → Green | Patterns are actionable |
| Color group 3 | `type:framework` → Orange | Frameworks are tools |
| Color group 4 | `type:synthesis` → Purple | Syntheses are conclusions |
| Node size | Link count | High-inbound nodes are hubs |
| Center force | 0.3 | Moderate clustering |
| Link strength | 0.5 | Balanced edge weight |

**Reading the graph:**
- **Isolated nodes** = orphan pages → run LINT
- **Hub nodes** (large, many connections) = high-value pages → candidates for hot.md
- **Clusters** = domain coherence → gaps between clusters = synthesis opportunities
- **Long thin chains** = linear dependency structures → often a sign of over-linking one path

See [[summaries/agentic-kb-obsidian-graph]] for the formal graph analysis of this vault.

---

## Canvas Workspaces

Obsidian Canvas creates free-form visual workspaces using native cards. Primary use cases in the Agentic-KB:

**Research Canvas**
Layout: Sources (left) → Lens Analysis (center) → Synthesis (right) → Findings (far right)
Each card is a linked note. The canvas itself is the visual index for the research project.
Template: [[knowledge-systems/research-engine/templates/project-template|Project Template]]

**Architecture Decision Canvas**
Layout: Problem (top) → Options (middle row) → Tradeoffs table (right) → Decision record (bottom)
Link each option card to its `wiki/frameworks/` page or `wiki/concepts/` page.
Template: [[patterns/pattern-architecture-decision-record]]

**Priority Stack Canvas**
Layout: Daily Focus Rule (top) → Active commitments (center) → Blockers (red cards, right)
Updated weekly from [[personal/hermes-operating-context]]. Gives a visual read of current priorities.

**Session Planning Canvas**
Created at the start of a long work session. Cards: context loaded, goals, constraints, output targets.
Archived at session end with completion notes.

---

## Knowledge Maps

Knowledge maps are curated visual overviews of a domain — distinct from the auto-generated graph view. They are hand-crafted (or LLM-crafted) to show the most important relationships, not all relationships.

**wiki/home.md** — the primary knowledge map. SVG concept map with 4 domains (Orchestration, Memory, Tool Use, Evaluation), stats bar, and dark theme. Updated when major new domains are added.

**MoC pages as text knowledge maps** — each MoC page is a curated map of its domain. The graph view shows all links; the MoC page shows the *important* links with context.

**Graphify output** — `wiki/syntheses/knowledge-graph-{date}.html` — interactive D3.js force graph generated from `wiki/index.md`. Invoke after major ingestion runs. See [[summaries/summary-graphify-skill]].

**Oh My Mermaid** — Mermaid diagram generation for architecture flows, agent topologies, and pipeline diagrams embedded in wiki pages. See [[summaries/agentic-kb-oh-my-mermaid]].

---

## Progress Dashboards

Dashboard pages aggregate status across the KB using Dataview queries. Key dashboards:

**[[stats|KB Stats]]** — auto-generated: page counts by type, link density, freshness metrics, orphan count.

**Lint report** — `wiki/syntheses/lint-{date}.md` — point-in-time health snapshot. Current: [[syntheses/lint-2026-04-12]].

**Research Engine Dashboard** — [[knowledge-systems/research-engine/command-center|Command Center]] — active projects, lens completion status, open questions count.

**Recently Added** — [[recently-added]] — chronological feed of all new pages since last reset.

**Proposed: Agent Activity Dashboard**
A Dataview query across all `wiki/agents/{agent}/task-log.md` files to show which agents have been active, what they worked on, and their last activity. Would surface underused agents and hot spots.

```dataview
TABLE file.mtime as "Last Active", length(file.lists) as "Log Entries"
FROM "wiki/agents"
WHERE contains(file.name, "task-log")
SORT file.mtime DESC
```

---

## Related

- [[mocs/core-plugins|Core Plugins]] — Graph view plugins (Graph Analysis, Juggl)
- [[mocs/maintenance|Maintenance & Optimization]] — Reading the graph for health signals
- [[home]] — Primary knowledge map
- [[stats]] — Live KB stats
- [[summaries/agentic-kb-obsidian-graph]] — Graph analysis notes
