---
title: "SkillOpt — Executive Strategy for Self-Evolving Agent Skills"
type: summary
source_file: raw/framework-docs/microsoft-skillopt.md
source_url: https://github.com/microsoft/SkillOpt
author: Microsoft Research / SkillOpt authors
date_published: 2026-06-02
date_ingested: 2026-06-25
tags: [agentic, skills, evaluation, self-improvement, framework]
key_concepts: [skill-optimization, validation-gated-edits, offline-agent-sleep, agent-evaluation]
confidence: medium
---

# SkillOpt — Executive Strategy for Self-Evolving Agent Skills

## Source

- Raw source: `raw/framework-docs/microsoft-skillopt.md`
- URL: https://github.com/microsoft/SkillOpt
- Captured context: Jay flagged this as a skill training/evaluation loop to evaluate for nightly skill improvement gates, not direct auto-mutation.

## TL;DR

[[frameworks/framework-skillopt|SkillOpt]] treats a skill document as trainable state for a frozen agent: generate candidate bounded edits from scored rollouts, accept edits only when they improve held-out validation, and deploy a compact `best_skill.md` with zero inference-time overhead.

## Key Points

- **Train the skill, not the model:** the target model stays fixed; a separate optimizer model proposes add/delete/replace edits to the skill text.
- **Validation gate:** candidate edits are accepted only if they strictly improve a held-out score. This is the key safety idea for Hermes: self-improvement should stage proposals behind a gate, not mutate live skills directly.
- **Training loop:** rollout → reflect → aggregate → select → update → evaluate.
- **Textual optimization controls:** the README describes a learning-rate budget, rejected-edit buffer, and epoch-wise slow/meta update to stabilize textual skill optimization.
- **Reported benchmark scope:** the README claims best or tied-best results across six benchmarks, seven target models, and three harnesses: direct chat, Codex CLI, and Claude Code CLI. Treat this as source-reported until independently verified.
- **SkillOpt-Sleep preview:** nightly loop for local coding agents: harvest transcripts, mine recurring tasks, replay offline, consolidate through bounded edits, gate on held-out tasks, stage proposal, human adopts.
- **Applicability:** strongest fit where recurring tasks have a checkable correctness signal. The README explicitly says gains can be flat on saturated/noisy benchmarks.

## Extracted KB Updates

- Created [[frameworks/framework-skillopt]].
- Updated [[concepts/skills]] to distinguish hand-authored skill quality gates from validation-gated skill optimization.
- Related to [[recipes/recipe-agent-evaluation]] because the validation gate requires task fixtures and repeatable scoring.

## Jay-Relevant Takeaway

SkillOpt is useful as a governance pattern for Hermes skills: nightly jobs can mine failures and propose skill patches, but live skill mutation should require held-out eval improvement plus human review for high-impact skills. That maps directly to Jay's “validated patterns become skills; skills that aren't maintained become liabilities” operating rule.

## Caveats

- The source is the project README and source-reported claims; benchmark details should be verified against the linked paper before treating performance numbers as canonical.
- Direct auto-mutation of Hermes skills would be too risky without a rollback baseline and approval gate.

## Sources

- `raw/framework-docs/microsoft-skillopt.md`
