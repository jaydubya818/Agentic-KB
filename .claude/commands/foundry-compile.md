---
description: Turn sources into wiki concept pages — only when 2+ sources back a theme.
allowed-tools: Bash, Read, Edit, Write
---

# /foundry-compile

Compile new `raw/` content into wiki pages, gated by the 2-source rule.

## What it does

1. Run the 2-source gate: scan `wiki/summaries/` for themes with ≥2 supporting summaries. Themes with only 1 source go to `wiki/candidates.md` and are skipped this run.
2. Shell out to `kb compile` (existing two-step Analysis → Generation pipeline) — only for themes that passed the gate.
3. Auto-graduate: if any candidate from the previous run now has ≥2 sources, log graduation to `wiki/_meta/compile-log.md` and let it compile.
4. Append per-page decisions to `wiki/_meta/compile-log.md` (created, updated, candidate-promoted, candidate-deferred).

## How to run it

```bash
node scripts/compile-2source-gate.mjs --plan
# review the plan; then:
node scripts/compile-2source-gate.mjs --execute
```

`--plan` prints what would compile vs. defer without making any LLM calls. `--execute` runs the actual `kb compile`. Pass `--force` only if you intentionally want to compile a single-source theme (logged as a bypass to `wiki/log.md`).

## Output

```
Compile plan (2-source gate):
  PROMOTE  3 themes → wiki pages:
    - context-window-management (sources: karpathy-llm-wiki, jamees-foundry)
    - two-vault-pattern (sources: jamees-foundry, sofie-design-doc)
    - candidate-graduation (sources: lint-2026-04-19, compile-log-2026-04-20)
  DEFER    2 themes → wiki/candidates.md:
    - personal-knowledge-os (sources: jamees-foundry only)
    - granola-transcript-quality (sources: hermes-standup-04-21 only)
  GRADUATE 1 candidate from previous run:
    - inbox-zero-pattern (now backed by 2 sources)
```

## Refuse list

- Do NOT bypass the 2-source rule silently. Use `--force` and log it.
- Do NOT compile pages without citations. Every concept must cite its sources (CLAUDE.md Rule 9 + Foundry rule).
- Do NOT touch the personal vault.
- Do NOT remove `[UNVERIFIED]` markers added by the analysis step.

## Related

`/foundry-ingest` must run first.
`/foundry-lint` flags candidates ready for graduation.
