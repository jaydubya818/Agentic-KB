---
title: Research Engine — Command Center
type: command-center
updated: 2026-04-12
---

# Research Engine — Command Center

> Start here. Every research run follows this protocol.

---

## Pre-flight (required before any research starts)

Fill in `templates/research-question-intake.md`:
- What is the exact research question?
- Why does this matter now?
- What decision will this inform?
- What is the scope and time horizon?
- What is the desired output format?

Do not begin research until this is complete. Without a defined question, Claude sprints in six directions at once.

---

## Execution Protocol

**Step 1 — Framework selection**
Read `methodology/research-frameworks.md`. Classify the research type:
- Type 1: Verification (is X true?)
- Type 2: Causal (why did X happen?)
- Type 3: Scenario (what if X?)
- Type 4: Decision (should we do X?)

**Step 2 — Source evaluation**
For every source used, apply `methodology/source-evaluation.md`. Assign tier (1–5). Do not use Tier 4–5 sources for factual claims.

**Step 3 — 6-lens analysis**
Run each lens in sequence. Not all lenses apply to every question — skip with explicit justification.
- `lenses/technical.md`
- `lenses/economic.md`
- `lenses/historical.md`
- `lenses/geopolitical.md`
- `lenses/contrarian.md`
- `lenses/first-principles.md`

**Step 4 — Contradiction protocol**
Apply `methodology/contradiction-protocol.md` when lenses disagree. Contradictions are features, not failures.

**Step 5 — Knowledge capture**
Write findings to `knowledge/` using provenance rules from `methodology/provenance-rules.md`:
- New concepts → `knowledge/concepts.md`
- New entities → `knowledge/entities.md`
- Verified numbers → `knowledge/data-points.md`
- Discovered connections → `knowledge/relationships.md`
- Unresolved questions → `knowledge/open-questions.md`

**Step 6 — Synthesis and output**
Apply `methodology/synthesis-rules.md`. Produce artifacts using `templates/`:
- Quick answer → executive-summary-template.md
- Full analysis → deep-dive-template.md
- Decision support → decision-memo-template.md

---

## Active Projects

| Project | Status | Last updated |
|---------|--------|--------------|
| *(none yet — create folders in projects/)* | — | — |

---

## Knowledge Accumulation Stats

Track as the system grows:
- Concepts captured: 0
- Entities mapped: 0
- Data points verified: 0
- Relationships typed: 0
- Open questions: 0
- Projects completed: 0
