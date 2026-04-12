---
title: Build a Local Research Engine (Claude Code + Obsidian + Skill Graph)
type: recipe
difficulty: intermediate
time_estimate: 1-2h (setup) + compounds over time
prerequisites:
  - Claude Code installed and configured
  - Obsidian installed (optional but recommended for graph view)
  - Agentic-KB already set up (this KB)
  - Familiarity with markdown and wikilinks
tested: false
tags: [agentic, prompt-engineering, memory, tool-use, context-management, knowledge-graph]
---

# Recipe: Build a Local Research Engine

## Goal
Build a folder-based research system where Claude applies 6 forced analytical lenses to any research question, accumulates knowledge across projects, and surfaces insights no single-prompt approach could find. Deployed at 4 companies with a reported 60% research cost reduction.

Key difference from "ask ChatGPT to research X": the skill graph gives Claude a methodology, evaluation criteria, and 6 forced perspectives — making it a research department, not a search engine.

---

## How It Fits with This KB

This system runs **alongside** the Agentic-KB, not inside it. Relationship:

```
Agentic-KB (wiki/)                    Research Skill Graph
─────────────────────────────         ──────────────────────────────
Long-term canonical knowledge    ←──  Findings get promoted here
Framework patterns & concepts         via the INGEST workflow
Persistent cross-domain KB

research-skill-graph/                 Per-project analysis
├── methodology/              ─────►  Applies source-trust-policy
├── lenses/                           Maps to contradiction-policy
├── knowledge/               ─────►  Feeds into wiki/concepts/
└── projects/                         Raw output for INGEST
```

When a research project completes, its `concepts.md` and `data-points.md` feed into the Agentic-KB via the INGEST workflow, turning one-time research into permanent KB knowledge.

---

## Steps

### Step 1 — Create the Folder Structure

Run in terminal from your Agentic-KB directory (or any folder you prefer):

```bash
mkdir -p research-skill-graph/{methodology,lenses,projects,sources,knowledge}
touch research-skill-graph/index.md
touch research-skill-graph/research-log.md
touch research-skill-graph/methodology/{research-frameworks,source-evaluation,synthesis-rules,contradiction-protocol}.md
touch research-skill-graph/lenses/{technical,economic,historical,geopolitical,contrarian,first-principles}.md
touch research-skill-graph/sources/source-template.md
touch research-skill-graph/knowledge/{concepts,data-points}.md
```

The scaffold already exists at `/Users/jaywest/Agentic-KB/research-skill-graph/` with all files pre-populated. Open in Obsidian to see the graph view.

---

### Step 2 — Key File Contents

All files are pre-populated. Here are the critical ones to understand:

**`index.md` — The Command Center**
Every research session starts here. Paste your question at the top, define scope and time horizon. The execution instructions at the bottom tell Claude exactly how to run all 6 lenses in sequence.

```markdown
Research Question: [PASTE YOUR QUESTION HERE]
Scope: [what's in, what's out]
Time Horizon: [how far back and forward]
Output Goal: [what decision does this research inform?]
```

**`methodology/source-evaluation.md` — 5-Tier Trust System**
Maps directly to this KB's `source-trust-policy.md`. Tier 1 = primary data (UN datasets, peer-reviewed with methodology). Tier 5 = social/anecdotal. Every claim must be traced to its tier before use.

**`methodology/contradiction-protocol.md` — Tensions as Features**
Contradictions between lenses are not bugs — they're where insights live. Protocol: check if disagreement is definitional, find the root cause, document both positions with conditions, escalate to `open-questions` if unresolvable. Maps to this KB's `contradiction-policy.md`.

---

### Step 3 — The 6 Lenses

Each lens file has: core questions, how to research through that angle, output format, voice constraints, and links to related methodology files.

| Lens | Core Question | Voice Constraint |
|------|--------------|-----------------|
| `technical.md` | What do the numbers say? | Clinical, no emotional language. "Declined 23%" not "collapsing" |
| `economic.md` | Who pays, who profits, what incentives? | Follow money before accepting any stated motivation |
| `historical.md` | What patterns repeat? What context is forgotten? | Long-horizon, cite precedents with dates |
| `geopolitical.md` | Which countries, which power dynamics? | Systemic, don't personalize |
| `contrarian.md` | What if consensus is wrong? Who benefits from the narrative? | Steelman the opposite view before dismissing it |
| `first-principles.md` | Forget everything. Rebuild from fundamental truths. | Axioms only, no assumptions |

**Critical rule:** each lens must *rethink* the question, not just add more information. Technical and contrarian should feel written by two researchers who disagree.

---

### Step 4 — Wire Claude Code to the Research Graph

**Method A: Claude Code direct (most powerful)**

Create a CLAUDE.md inside `research-skill-graph/` that tells Claude how to operate:

```markdown
# Research Skill Graph — Claude Code Instructions

## Your Role
You are a research engine. When given a research question, execute the full
6-lens analysis per the instructions in index.md.

## File Access
- READ: all files in this directory freely
- WRITE: projects/{topic}/ for output files
- WRITE: knowledge/concepts.md and knowledge/data-points.md (append only)
- WRITE: research-log.md (append only)
- NEVER modify: methodology/ or lenses/ without explicit instruction

## Execution
1. Read index.md completely (get question, scope, goal)
2. Read methodology/research-frameworks.md (pick the right approach)
3. Run each lens in order, writing findings to projects/{topic}/lens-{name}.md
4. Apply contradiction-protocol.md to any tensions found
5. Apply synthesis-rules.md to produce final outputs
6. Append to research-log.md and update knowledge/ files
```

Then run: `claude --project-path research-skill-graph/ "Research: [your question]"`

**Method B: Obsidian + Claude Code (recommended for Jay's setup)**

Open `research-skill-graph/` as an Obsidian vault. You get:
- Graph view showing how all nodes connect (index.md at center, 6 lenses radiating out)
- Click into any project to see lens findings visually
- Spot disconnected nodes (research gaps) and unexpected cross-project connections
- Open Claude Code in the same directory for direct file access

**Method C: Claude Project upload**
Zip the `methodology/` and `lenses/` folders, upload to a Claude project. Less powerful (no file writes) but works for one-off research.

---

### Step 5 — Run Your First Research

1. Open `research-skill-graph/index.md`
2. Paste your question, define scope and goal
3. Run via Claude Code: `claude "Follow the execution instructions in index.md. Research question is already set."`
4. Claude will create `projects/{your-topic}/` with output files:
   - `executive-summary.md` — 500 words, key findings
   - `deep-dive.md` — full lens-by-lens analysis
   - `key-players.md` — people, orgs, countries that matter
   - `open-questions.md` — what's still unknown (often the most valuable output)
5. Review output, then promote key findings to the Agentic-KB via INGEST

---

### Step 6 — Feed Back into the Agentic-KB

After completing a research project:

1. Copy novel concepts from `projects/{topic}/` into `knowledge/concepts.md`
2. Copy verified data points into `knowledge/data-points.md` (always with source + tier)
3. Run the Agentic-KB INGEST workflow on `knowledge/concepts.md`
4. This turns one-time research into permanent KB knowledge — the compound effect

Open questions from one project automatically become candidates for the next `index.md`.

---

## Verification

1. Run a test query: paste "Why did remote work adoption stall in 2024-2025?" into `index.md`. Execute via Claude Code. Confirm 6 separate lens files appear in `projects/remote-work-2024/`.

2. Check that `technical.md` findings use only Tier 1/2 sources and contain no emotional language.

3. Check that `contrarian.md` challenges at least one assumption from `technical.md`.

4. Verify `open-questions.md` exists and contains at least 2 unresolved tensions from the contradiction protocol.

---

## Common Failures & Fixes

**All lenses say the same thing:** The lenses aren't being applied distinctly. Add a constraint to each lens file: "You must start by disagreeing with the technical lens finding." The contrarian lens especially needs explicit permission to be adversarial.

**Research stays surface-level:** The agent is stopping at Tier 3-4 sources. Add to `source-evaluation.md`: "For any major claim, you must find a Tier 1 source or mark it UNVERIFIED."

**Knowledge doesn't compound:** The INGEST step is being skipped. Add it to `index.md` execution instructions as a mandatory final step.

**Graph view not working in Obsidian:** Ensure the `research-skill-graph/` folder is opened as its own vault, not as a subfolder inside another vault. Wikilinks only resolve within the same vault.

---

## The Compound Effect (Why This Gets Better Over Time)

After 3+ projects:
- `knowledge/data-points.md` has 100+ verified numbers your research no longer needs to re-find
- `knowledge/concepts.md` has 30+ defined terms Claude applies consistently
- `research-log.md` shows connections between projects that weren't visible at the time
- Open questions from past projects become the next project's starting point

Clean slate mode: upload only `methodology/` + `lenses/` to a fresh Claude project. Same methodology, no accumulated knowledge. Use when researching something completely unrelated.

---

## Next Steps
- Run 3 research projects to build up `knowledge/` base
- Ingest `knowledge/concepts.md` into the Agentic-KB after each project
- See [[recipes/recipe-kb-lifecycle-hooks]] for automating the ingest step
- See [[patterns/pattern-typed-knowledge-graph]] for adding graph relationships to research findings
- See [[concepts/knowledge-graphs]] for the theory behind why linked research nodes outperform flat notes

## Related Recipes
- [[recipes/recipe-llm-wiki-setup]] — The KB this feeds into
- [[recipes/recipe-kb-lifecycle-hooks]] — Automate the research → KB pipeline
- [[recipes/recipe-hybrid-search-llm-wiki]] — Search across accumulated research findings
