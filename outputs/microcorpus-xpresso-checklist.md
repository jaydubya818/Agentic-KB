---
title: Xpresso Micro-Corpus — Dogfood Seeding Checklist
type: corpus-checklist
date: 2026-04-18
purpose: 10-file synthetic Xpresso corpus for personal dogfood run before pitching pilot
target_size: 10 files, ~15-25k words total
---

# Xpresso Micro-Corpus — Dogfood Seeding Checklist

> Goal: enough realistic Xpresso content for `kb compile` to produce a usable wiki **without** touching real Workday source. Lets you run the full pilot loop solo on your laptop, demo the workflow, and stress-test hallucination rates before any sensitive data is involved.

## Sourcing rules

- **Use only public Xpresso material** — Workday public docs, public GitHub, conference talks, Workday Rising recordings, public blog posts. No internal Confluence, no production code.
- **When public material is thin, write synthetic content** — short fictional examples that follow Xpresso's syntax surface but solve made-up problems. Mark these clearly: `synthetic: true` in frontmatter.
- **Skip anything you wouldn't want in a public GitHub gist.**

## Target distribution (10 files)

| # | Type | Lands in | Suggested topic |
|---|---|---|---|
| 1 | Spec excerpt | `raw/framework-docs/` | Xpresso type system overview |
| 2 | Spec excerpt | `raw/framework-docs/` | Xpresso module / namespace model |
| 3 | Spec excerpt | `raw/framework-docs/` | Xpresso runtime + lifecycle |
| 4 | Code example | `raw/code-examples/` | "Hello world" Xpresso module, annotated |
| 5 | Code example | `raw/code-examples/` | A small data-transform pipeline |
| 6 | Code example | `raw/code-examples/` | Using a deferred binding (the demo error context) |
| 7 | ADR | `raw/articles/` | "Why we chose deferred binding over X" |
| 8 | ADR | `raw/articles/` | "Naming conventions for Xpresso modules" |
| 9 | Anti-pattern | `raw/articles/` | "Three Xpresso patterns that look right but fail at runtime" |
| 10 | Recipe | `raw/articles/` | "How to debug a deferred-binding error" (links #6, #7) |

## Frontmatter template (paste into every file)

```yaml
---
title: <one-line title>
source_url: <if public; else omit>
synthetic: true | false        # false ONLY if pulled verbatim from public source
date_published: <YYYY-MM-DD or unknown>
date_ingested: 2026-04-18
tags: [xpresso, dogfood, <type-tag>]
confidence: medium             # we are dogfooding; never start at high
---
```

## Per-file size guide

- Spec excerpts: 800–1500 words each
- Code examples: 50–150 lines of Xpresso + 200–400 words of annotation
- ADRs: 400–800 words
- Anti-pattern: 600–900 words with 3 named patterns
- Recipe: 300–600 words, numbered steps

Total: ~15–25k words → ~150–250 compiled wiki pages after `kb compile` cross-references kick in.

## Build sequence

1. Create the 10 raw files in the folders above. Do **all 10 at once** so cross-references compile in a single pass.
2. Run `kb compile`. Watch SSE output for the analysis-then-generation pass on each doc.
3. Run `kb reindex` if section counts look stale.
4. Run `kb lint`. **Expect** orphans on first pass — that's a feature; it tells you which docs aren't connecting yet.
5. Skim each compiled wiki page in `wiki/concepts/`, `wiki/patterns/`, `wiki/recipes/`. **Mark `[UNVERIFIED]` on any claim you can't trace back to a source file.**

## Hallucination spot-check protocol

Pick 5 generated wiki pages at random. For each:

1. Read the page top-to-bottom.
2. For every factual claim about Xpresso syntax or behavior, find the source line in `raw/`.
3. Score:
   - **Grounded** — claim traces to a raw source.
   - **Inferred** — claim is reasonable extension; flag with `[UNVERIFIED]`.
   - **Hallucinated** — claim is wrong or fabricated.

**Pass bar:** ≥ 80% grounded, ≤ 5% hallucinated across the 5 pages. Below that, the corpus is too thin or the prompt needs tightening before pilot.

## Demo queries to test post-compile

Use these for the screencast and as a smoke test before any pitch:

1. `kb query "what is deferred binding in Xpresso?"`
2. `kb query "show me a simple Xpresso data transform"`
3. `kb query "what are the most common Xpresso anti-patterns?"`
4. `kb query "how do I debug a deferred binding error?"` *(should pull recipe + ADR + anti-pattern → cross-referenced answer)*
5. `kb query "what's the Xpresso module naming convention?"`

If query #4 surfaces a multi-source synthesis with citations, the cross-link wiring works. If it returns one page, the corpus needs more cross-references.

## When to throw it away

This corpus is **for dogfooding only**. Before pilot:

- Delete the 10 synthetic files from `raw/`.
- Delete generated `wiki/` content from this corpus.
- Reset `raw/.compiled-log.json` so the real Xpresso corpus compiles clean.
- Re-seed with vetted internal docs in Phase 2 of the pilot plan.

## Time budget

- Sourcing + writing 10 files: 3–4 hours (faster if you can paste public material).
- Compile + lint + spot-check: 30 minutes.
- **Total: half a day.** If it takes longer, you're polishing the corpus instead of testing the system. Stop and ship.
