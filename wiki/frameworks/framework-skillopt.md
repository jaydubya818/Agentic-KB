---
title: SkillOpt
type: framework
vendor: Microsoft
version: "0.1.0"
language: python
license: open-source
github: https://github.com/microsoft/SkillOpt
tags: [agentic, skills, evaluation, self-improvement, codex, claude-code]
last_checked: 2026-06-25
jay_experience: none
---

## Overview

SkillOpt is Microsoft's open-source framework for optimizing agent skill documents without changing model weights. It treats a skill file as trainable state: run task rollouts, score the results, ask an optimizer model for bounded text edits, and accept a candidate only if it improves held-out validation.

The source frames this as “train agent skills like neural networks” using epochs, batch size, learning rates, and validation gates, but the deployable artifact remains a compact `best_skill.md` loaded by the same target agent.

## Core Concepts

- **Skill as trainable state:** the model stays frozen; the skill text changes.
- **Optimizer model:** a separate model proposes add/delete/replace edits from scored rollouts.
- **Held-out validation gate:** a candidate edit ships only if it strictly improves validation score.
- **Textual learning-rate budget:** limits the size/scope of edits to stabilize optimization.
- **Rejected-edit buffer:** remembers failed edits so optimization does not thrash.
- **SkillOpt-Sleep:** nightly companion that mines real coding-agent sessions, replays recurring tasks offline, gates proposed improvements, and stages them for review.

## Architecture

```text
seed skill
  ↓
rollout on train tasks
  ↓
score / reflect on failures
  ↓
optimizer proposes bounded edits
  ↓
held-out validation gate
  ↓
accept as best_skill.md or reject
```

SkillOpt-Sleep adapts the loop for local agents:

```text
harvest Claude Code / Codex transcripts
  → mine recurring tasks
  → replay offline
  → consolidate through bounded edits
  → gate on held-out tasks
  → stage proposal
  → human adopts
```

## Strengths

- **Governed self-improvement:** aligns with Hermes' need to stage, verify, and review skill changes rather than blindly mutating procedural memory.
- **No inference-time overhead:** the deployed artifact is just a better skill document.
- **Harness-aware:** README explicitly reports direct chat, Codex CLI, and Claude Code CLI harnesses.
- **Portable optimization target:** optimized text can transfer across nearby tasks and harnesses when the skill describes durable procedure.
- **Useful mental model:** converts skill maintenance from ad hoc editing into eval-driven development.

## Weaknesses

- **Needs clean eval tasks:** weak fit for open-ended leadership/comms skills without checkable correctness signals.
- **Source-reported metrics:** performance claims need verification against the paper and a local benchmark before operational adoption.
- **Possible overfitting:** held-out gates reduce but do not eliminate benchmark overfitting, especially with small task sets.
- **Skill governance still required:** an automated optimizer can produce behaviorally risky instructions; human review remains necessary for high-impact skills.

## Minimal Working Example

```bash
# Install package reported by the source
pip install skillopt

# Reproduction details live in the project docs, not the captured README:
# https://microsoft.github.io/SkillOpt/docs/guideline.html
```

A Hermes-safe pilot should not start by auto-mutating live skills. It should:

```text
1. Select one low-risk skill with recurring, checkable tasks.
2. Build 10–30 held-out fixtures.
3. Run SkillOpt/SkillOpt-Sleep into a staging directory.
4. Diff proposed skill text against current SKILL.md.
5. Accept only if fixtures improve and human review passes.
```

## Integration Points

- **Hermes skills:** use as a proposed-patch generator, not a live writer.
- **[[recipes/recipe-agent-evaluation]]:** supplies the fixture/scoring discipline needed for the validation gate.
- **[[concepts/skills]]:** provides the skill anatomy being optimized.
- **Night Shift / Dojo workflows:** possible source of session transcripts and recurring task mining, with a staged proposal queue.

## Jay's Experience

N/A — not yet used.

## Version Notes

- 2026-06-02: README reports PyPI v0.1.0 with the full training loop, multi-backend support, six built-in benchmarks, and WebUI dashboard.
- 2026-06-15: SkillOpt-Sleep preview announced for local coding agents.

## Sources

- [[summaries/microsoft-skillopt]]
- Raw source: `raw/framework-docs/microsoft-skillopt.md`
- GitHub: https://github.com/microsoft/SkillOpt
