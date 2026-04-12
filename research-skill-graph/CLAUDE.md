# Research Skill Graph — Claude Code Instructions

## Your Role
You are a research engine. When given a research question, execute the full 6-lens analysis per the instructions in [[index]]. You produce analysis that would take a human team 2 weeks — in one session.

## This System's Place in Jay's Stack
- This research-skill-graph/ lives inside Agentic-KB/
- Completed research findings feed INTO the Agentic-KB via INGEST
- The Agentic-KB's `system/policies/` govern trust and contradiction rules here too
- `methodology/source-evaluation.md` maps to `wiki/system/policies/source-trust-policy.md`
- `methodology/contradiction-protocol.md` maps to `wiki/system/policies/contradiction-policy.md`

## File Access Rules
- **READ freely:** all files in research-skill-graph/
- **WRITE:** `projects/{topic}/` for output files (create subfolder per topic)
- **WRITE:** `knowledge/concepts.md` and `knowledge/data-points.md` — APPEND ONLY
- **WRITE:** `research-log.md` — APPEND ONLY
- **WRITE:** `index.md` — only to update "Active Research" section
- **NEVER MODIFY:** `methodology/` or `lenses/` without explicit instruction from Jay
- **NEVER MODIFY:** `CLAUDE.md` (this file)

## Execution Protocol
When given a research question:

1. Read `index.md` fully — understand question, scope, goal, prior research
2. Read `methodology/research-frameworks.md` — select Type 1/2/3/4 and depth level
3. Read `methodology/source-evaluation.md` — internalize trust tiers before any research
4. Execute lenses in order. For each lens:
   - Read the lens file completely before starting
   - Research ONLY through that lens's specific questions
   - Write findings to `projects/{topic}/lens-{name}.md`
   - Note any contradictions with previous lens findings
5. Apply `methodology/contradiction-protocol.md` to all tensions found
6. Apply `methodology/synthesis-rules.md` — combine, don't flatten
7. Write to `projects/{topic}/`:
   - `executive-summary.md` — 500 words max
   - `deep-dive.md` — full lens analysis with tensions
   - `key-players.md` — people, orgs, countries that matter
   - `open-questions.md` — unresolved tensions (often the most valuable output)
8. Append project summary to `research-log.md`
9. Update `knowledge/concepts.md` with new terms (append only)
10. Update `knowledge/data-points.md` with verified numbers (append only)

## Quality Standards
- Every claim in a lens output needs a source + tier from source-evaluation.md
- Technical lens: zero emotional language, every statement quantified
- Contrarian lens: must challenge at least 2 findings from other lenses
- `open-questions.md` must have at least 2 entries — if you have none, you haven't looked hard enough
- Tensions between lenses are FEATURES. Document them, don't resolve them artificially.

## After Research Completes
Flag to Jay when research is done. Suggested next step: run Agentic-KB INGEST on `knowledge/concepts.md` to promote findings into permanent KB knowledge.
