---
id: 01KNNVX2R6DTW56M9814E05E80
title: Jay's Framework Selection Philosophy
type: personal
category: decision
confidence: high
date: 2026-04-04
tags: [personal, gsd, superpowers, bmad, framework-selection, decision-tree]
---

# Jay's Framework Selection Philosophy

Sourced from `~/.claude/CLAUDE.md` — Jay's global instructions for all projects. The framework selection system is documented as the first major section, signaling its primacy.

## The Three-Framework System

Jay runs three AI development frameworks in parallel. They are not interchangeable — picking the wrong one is described as wasting hours.

| Signal | Framework | Why |
|--------|-----------|-----|
| Experimental MVP, requirements will shift | **GSD** | Step-by-step, no lock-in, fast iteration |
| Known spec, enterprise/client build, no surprises | **[[framework-bmad]]** | Pre-planned docs, sharded tasks, agents stay on rails |
| Edge cases are costly (agentic, payments, auth) | **[[framework-superpowers]]** | TDD-first, iron-law verification, no completion without evidence |
| Solo fix, refactor, or simple feature (<3 files) | **None** | Direct Claude is sufficient |

## Quick Decision Tree

```
Does the feature require experimentation to discover requirements?
├─ YES → GSD (/gsd:new-project)
└─ NO → Are requirements fully locked before any code is written?
         ├─ YES → BMAD (bmad-init skill)
         └─ NO (but you know the domain) → Can a wrong action NOT be easily undone?
                                            ├─ YES → Superpowers (TDD + verification)
                                            └─ NO → GSD or direct Claude
```

The key discriminators:
1. **Requirements stability** — shifting → GSD, locked → BMAD
2. **Reversibility of mistakes** — costly to undo → Superpowers
3. **Scope** — <3 files → direct Claude (no framework overhead)

## Recommended Hybrid Pattern

For large applications, Jay recommends layering frameworks:
1. Use **GSD** to build the working MVP
2. Onboard **Superpowers** for the stability layer (auth, payments, agents)
3. Use **BMAD** for any future spec-locked modules (e.g., a CRM add-on)

This avoids applying a heavyweight framework to early-stage exploration while ensuring high-stakes components get iron-law treatment.

## GSD Details

- Best for: MVPs, experimental builds, evolving requirements
- Core loop: `new-project → discuss-phase → plan-phase → execute-phase → verify-work → session-report`
- Key agents: gsd-planner, gsd-executor, gsd-verifier, gsd-debugger
- Philosophy: "Plan → Execute → Ship → Learn → Repeat"

GSD commands span from autonomous (`/gsd:autonomous`) to highly interactive (`/gsd:discuss-phase`). The spectrum of commands enables Jay to calibrate how much process overhead each project gets.

## Superpowers Details

- Best for: High-stakes features where edge cases are costly
- Iron Laws (non-negotiable):
  1. No production code without a failing test first
  2. No fixes without root cause investigation
  3. No completion claims without fresh verification evidence
  4. If a skill might apply (even 1% chance), invoke it
- Workflow: `Brainstorm → Design Doc → Plan → Subagent-Dev → Verification → Finish Branch`

Superpowers is described as having "two-stage review" (spec review + quality review) at each implementation step. This is significantly more process overhead than GSD's single-stage verification.

## BMAD Details

- Best for: Locked-in specs, enterprise builds, client projects with stable requirements
- Uses 12+ agent personas with pre-planning emphasis
- Key workflow: `bmad-init → product-brief → create-prd → validate-prd → shard tasks → implement wave by wave`
- Party Mode: Multiple BMAD agents (PM, Architect, UX, Dev) debate decisions simultaneously rather than sequentially

BMAD has the heaviest upfront investment in planning — the spec is fully validated before any implementation begins. This makes it unsuitable for exploratory work.

## Framework Boundaries in Practice

From the CLAUDE.md model assignment section — model choice reflects framework assumptions:
- `claude-sonnet-4-6`: default for most tasks (GSD execution, direct Claude)
- `claude-haiku-4-5`: leaf tasks, grep, simple Q&A (cost optimization within GSD)
- `claude-opus-4-6`: complex architecture, security audits (Superpowers/BMAD-level analysis)

The model tier selection mirrors the framework tier selection — more process (BMAD/Superpowers) correlates with more capable (and expensive) models for critical decisions.

## Related Concepts

- [[wiki/summaries/summary-gsd-framework-skills]]
- [[wiki/summaries/summary-superpowers-framework]]
- [[wiki/personal/personal-agent-design-observations]]
