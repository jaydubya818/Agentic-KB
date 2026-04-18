---
title: Autoresearch — Agent Evaluation Harnesses (2026-04-18)
type: report
topic: agent evaluation harnesses
rounds: 1
sources_ingested: 4
wiki_pages_created: 8
wiki_pages_updated: 2
date: 2026-04-18
---

# Autoresearch Report — Agent Evaluation Harnesses

**Topic**: agent evaluation harnesses
**Run date**: 2026-04-18
**Config**: `max_rounds=2, pages_per_round=4, allowlist=[], mode=wiki`
**Rounds completed**: 1 of 2 (Round 2 deferred — see termination note)

---

## Summary

The Agentic-KB had no dedicated framework pages for the four leading eval harnesses as of the run date. [[mocs/evaluation|Evaluation MoC]] referenced [[framework-langsmith]] only as a sub-bullet under [[framework-langgraph]]. Round 1 closed this gap end-to-end: four raw source captures, four summary pages, four framework pages, and one MoC reorg separating "eval-first frameworks" from "agent-stack frameworks with eval features."

The four harnesses cover non-overlapping quadrants:

1. [[framework-inspect-ai]] (UK AISI) — strongest agent + sandbox story in OSS; Agent Bridge wraps [[framework-claude-code]]/Codex CLI/Gemini CLI/[[framework-langchain]]/Pydantic AI agents inside the eval loop.
2. [[framework-deepeval]] (Confident AI) — Pytest-native with named agent metrics (`PlanQualityMetric`, `PlanAdherenceMetric`, `ArgumentCorrectnessMetric`, `ToolCallingMetric`); closest fit to [[concepts/trajectory-evaluation]].
3. [[framework-promptfoo]] ([[openai]], MIT) — declarative YAML, first-class red-team workflow, CI/CD-native; best fit for non-Python teams.
4. [[framework-langsmith]] (LangChain) — proprietary SaaS with unique trace-to-dataset workflow; deepest [[framework-langgraph]] integration; only platform fusing eval + observability.

---

## Recommended Selection Matrix

| Need | Framework | Why |
|------|-----------|-----|
| Evaluate a [[framework-claude-code]] agent end-to-end | [[framework-inspect-ai]] | Agent Bridge + sandbox + MCP native |
| Named agent metrics (plan quality, tool-call correctness) | [[framework-deepeval]] | Only cohort member with these shipped |
| Red-team / jailbreak testing | [[framework-promptfoo]] | Only cohort member with red-team first-class |
| CI/CD gating, non-Python team | [[framework-promptfoo]] | YAML config, GitHub Actions native |
| Production observability + eval in one platform | [[framework-langsmith]] | Only cohort member fusing both |
| Sandboxed execution for untrusted code-running agents | [[framework-inspect-ai]] | Docker/K8s/Modal/Proxmox defaults |
| Pytest-native integration for eng teams | [[framework-deepeval]] | Zero onboarding cost |
| Privacy-strict, fully local | [[framework-inspect-ai]], [[framework-deepeval]], [[framework-promptfoo]] | All local-first OSS |

---

## Ingested Sources (Round 1)

| Source | URL | raw/ path |
|--------|-----|-----------|
| Inspect AI docs | https://inspect.aisi.org.uk/ | `raw/framework-docs/inspect-ai.md` |
| promptfoo docs | https://www.promptfoo.dev/docs/intro/ | `raw/framework-docs/promptfoo.md` |
| DeepEval docs | https://deepeval.com/docs/getting-started | `raw/framework-docs/deepeval.md` |
| LangSmith eval docs | https://docs.langchain.com/langsmith/evaluation | `raw/framework-docs/langsmith.md` |

---

## Wiki Pages Produced

**New (8):**
- [[frameworks/framework-inspect-ai]]
- [[frameworks/framework-promptfoo]]
- [[frameworks/framework-deepeval]]
- [[frameworks/framework-langsmith]]
- [[summaries/inspect-ai-framework-docs]]
- [[summaries/promptfoo-framework-docs]]
- [[summaries/deepeval-framework-docs]]
- [[summaries/langsmith-framework-docs]]

**Updated (2):**
- [[mocs/evaluation]] — split Frameworks into "Eval-First" and "Agent-Stack with eval features"; added 4 new summary links
- [[wiki/index]] — frameworks count 12 → 16; added 4 new rows

**Maintenance files touched:**
- `wiki/log.md` — full round log
- `wiki/recently-added.md` — 2026-04-18 section prepended
- `autolink-report.md` — 66 replacements across 23 files (includes new pages)

---

## Termination Note (Round 2 Deferred)

Saturation criteria from `/autoresearch` SKILL.md is `new_concepts == 0`. Round 1 introduced four new concept vectors (`agent sandbox pattern`, `trace-to-dataset workflow`, `red-team-as-eval`, `named agent metrics`), so technically Round 2 is in-bounds.

However, Round 2 was deferred deliberately. Round 1 already maps the eval-framework landscape at the framework-page level. Further depth is better pursued via targeted concept-page additions rather than another breadth pass. Specifically, the following are queued as explicit next work:

1. **New**: `concepts/agent-metrics` — framework-agnostic doc pulling DeepEval's named metrics into a taxonomy.
2. **New**: `concepts/red-team` — backed by promptfoo's adversarial-testing workflow.
3. **Augment**: `concepts/trajectory-evaluation` — reference DeepEval's `PlanAdherenceMetric` + LangSmith's trace-to-dataset.
4. **Augment**: `recipes/recipe-agent-evaluation` — swap placeholder framework references for the four new pages.

This is an explicit deferral, not saturation. Round 2 can be invoked later with a narrower topic (e.g. `/autoresearch "DeepEval agent metrics deep dive"`) if warranted.

---

## Lint Outcome (Post-Ingest)

Ran `scripts/lint.py` after autolink sweep:

```
orphans: 2            (both pre-existing or self-reference; not from this run)
stale_frameworks: 0
untested_recipes: 0
unreviewed_old: 0
review_drift: 0
missing_counter: 26   (unchanged; Rule 11 only applies to concept/synthesis pages)
low_confidence: 1
unresolved_links: 71  (7 new; see "Known Gaps" below)
```

No new orphans. All four new framework pages linked from [[mocs/evaluation]] and [[wiki/index]]. All four new summaries linked from their corresponding framework pages and from the MoC.

---

## Known Gaps / Follow-ups for Jay

- **`[[framework-langchain]]` is a dangling link** — referenced from 5 new pages but has no dedicated framework page. Only [[framework-langgraph]] exists. Consider creating `framework-langchain.md` or updating references to point to the LangGraph page.
- **`[[UK AISI]]` is a dangling entity link** — not in `scripts/entity-map.json`. Add as entity or remove.
- **`[[raw/framework-docs/*]]` back-references** — lint flags these as unresolved because the link-resolver doesn't scan `raw/` for file existence. Cosmetic; can add `raw/` to resolver scope or suppress.
- **LangSmith confidence is `medium`** — the fetched docs page was navigational; a Round 2 deeper pull would let this reach `high`.
- **None of the four frameworks have been piloted by Jay** — `jay_experience: none` on all. Top pilot candidate: [[framework-inspect-ai]] + [[framework-deepeval]] combined, for the [[recipes/recipe-agent-evaluation]] recipe.

---

## Reviewed Flag Status

All 8 new pages created with `reviewed: false` per Rule 12. Jay to flip to `true` and stamp `reviewed_date` after human review.

---

## Source Stubs

- [[raw/framework-docs/inspect-ai]]
- [[raw/framework-docs/promptfoo]]
- [[raw/framework-docs/deepeval]]
- [[raw/framework-docs/langsmith]]
