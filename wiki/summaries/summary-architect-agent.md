---
id: 01KNNVX2RBB1EDXPBET2QCT1B2
title: Architect Agent
type: summary
source_file: raw/my-agents/architect.md
author: Jay West
date_ingested: 2026-04-04
tags: [agentic, claude-code, agent-definition, architecture, adr, system-design]
key_concepts: [adr-format, trade-off-analysis, 18-month-horizon, boring-technology, observability-first]
confidence: high
---

# Architect Agent

## Key Purpose

System design expert for decisions with long-lasting structural impact. Produces Architecture Decision Records (ADRs), technology evaluations, and migration plans. Invoked when a decision "will have long-lasting structural impact" — not for everyday implementation choices.

## Tools Granted

None specified in frontmatter (inherits caller context). `model: claude-opus-4-6` — the only agent in Jay's setup explicitly assigned to Opus. This signals that architecture decisions are the one domain where the highest-capability model is worth the cost.

## Design Decisions

### ADR-First Output

The architect always produces formal Architecture Decision Records in a defined format:
- Context (what situation prompted this)
- Decision (what was decided)
- Rationale (why this over alternatives)
- Alternatives Considered (with rejection reasons)
- Consequences (positive, negative, neutral)
- Implementation Notes

This structured output persists across sessions, giving future agents and humans the full reasoning trail, not just the conclusion.

### 18-Month Horizon Rule

"Design for the scale you need in 18 months, not 10 years." Explicit rejection of over-engineering. Pairs with "boring technology over cutting-edge unless there's a clear reason" — the architect is conservative by design.

### Multi-Option Mandate

The architect always presents multiple options before recommending one. No recommendation comes without:
1. Alternatives table (with rejection reasons)
2. Risk assessment for the recommended approach
3. Flag on whether the decision needs team vs. unilateral sign-off

### Observability as Non-Negotiable

"Observability is not optional — logging, tracing, and metrics must be built in." Listed as a design principle, not an afterthought. The architect flags its absence as a structural risk.

### Migration Planning First

"Data migrations are the hardest part — plan them first." Migrations get explicit attention before any other implementation concern because they're the highest-risk, hardest-to-reverse part of system changes.

## Prompt Patterns Observed

- **Minimal prompt, maximum expertise:** The architect's definition is ~60 lines — far shorter than the GSD agents. Less process, more persona. The expertise is baked into the model (Opus) rather than spelled out.
- **Mermaid/ASCII diagram mandate:** "Use diagrams (ASCII or Mermaid) to illustrate system boundaries" — visual output is built into the role.
- **Trade-off framing:** "You think in trade-offs, not absolutes" — set in the opening persona line. This prevents the architect from giving single-option answers.
- **Explicit scope of autonomy:** "Flag decisions that should involve the team vs. those you can make unilaterally" — the architect knows its own decision boundaries.

## Related Concepts

- [[wiki/summaries/summary-code-reviewer-agent]]
- [[wiki/summaries/summary-security-reviewer-agent]]

## Sources

- `raw/my-agents/architect.md`
