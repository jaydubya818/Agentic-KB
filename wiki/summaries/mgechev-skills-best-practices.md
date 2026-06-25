---
title: "Best Practices for Creating Agent Skills"
type: summary
source_file: raw/framework-docs/mgechev-skills-best-practices.md
source_url: https://github.com/mgechev/skills-best-practices
author: Minko Gechev
date_published: ""
date_ingested: 2026-06-25
tags: [agentic, skills, context-management, evaluation]
key_concepts: [skills, progressive-disclosure, skill-evaluation, deterministic-scripts]
confidence: medium
---

# Best Practices for Creating Agent Skills

## Source

- Raw source: `raw/framework-docs/mgechev-skills-best-practices.md`
- URL: https://github.com/mgechev/skills-best-practices
- Captured context: Jay flagged this from Apple Notes as skill structure and validation guidance to compare against Hermes skill-authoring practice.

## TL;DR

This source reframes [[concepts/skills|Skills]] as token-budgeted agent instructions, not human docs: keep `SKILL.md` lean, move dense details into one-level-deep `references/`, `scripts/`, and `assets/`, optimize frontmatter descriptions for routing, and validate skills with discovery/logic/edge-case tests.

## Key Points

- **Skill directory shape:** required `SKILL.md`; optional `scripts/`, `references/`, and `assets/`. The source recommends keeping `SKILL.md` under 500 lines and using linked support files for progressive disclosure.
- **Discoverability lives in frontmatter:** the `name` and `description` are the only fields an agent sees before deciding whether to load the skill. Descriptions should include positive and negative triggers.
- **Progressive disclosure:** bulky context should stay out of the main skill body and be loaded just-in-time through explicit relative paths.
- **Avoid human-doc bloat:** the source explicitly discourages README/CHANGELOG/INSTALLATION_GUIDE files inside skills when they do not help the agent execute.
- **Procedural instructions beat prose:** chronological steps, concrete templates, and domain-specific terminology reduce agent guessing.
- **Deterministic scripts:** fragile or repetitive parsing/querying should be handled by small CLIs in `scripts/`, with descriptive stdout/stderr for self-correction.
- **Validation loop:** the source proposes discovery validation, logic simulation, edge-case testing, and architecture refinement as a skill QA workflow.

## Extracted KB Updates

- Updated [[concepts/skills]] with this source's skill quality gates: routing metadata, progressive disclosure, deterministic scripts, and validation.
- Related to [[concepts/tool-design]] because skill metadata behaves like a tool-selection prompt.
- Related to [[recipes/recipe-agent-evaluation]] because skills need regression tests just like agents.

## Jay-Relevant Takeaway

Hermes skill maintenance should stay biased toward small `SKILL.md` files plus support files and scripts. The most important test is not “does the skill read well to a human?” but “does an agent trigger it correctly, follow it without guessing, and avoid false positives?”

## Caveats

- The source is practitioner guidance, not a benchmark paper. Confidence is `medium` until paired with empirical eval results such as SkillOpt or SkillsBench.
- Some conventions differ slightly from Hermes' skill manager, but the operational principles transfer cleanly.

## Sources

- `raw/framework-docs/mgechev-skills-best-practices.md`
