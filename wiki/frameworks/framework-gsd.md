---
title: GSD — Get Shit Done
type: framework
vendor: Jay West (personal)
version: "1.28.0"
language: any
license: proprietary
github: ""
tags: [gsd, orchestration, multi-agent, claude-code, jay-west, agentic, wave-execution]
last_checked: 2026-04-04
jay_experience: extensive
---

## Overview

GSD (Get Shit Done) is Jay West's custom agentic development framework built on top of Claude Code. It is not a library or SDK — it is a structured workflow methodology implemented through skills (slash commands), agent definitions, hooks, and CLAUDE.md discipline. GSD provides a repeatable process for experimental MVPs and evolving projects where requirements will shift mid-build.

The core insight: most AI coding frameworks fail because they assume stable requirements. GSD embraces uncertainty — it builds in explicit discussion phases, adversarial plan verification, and wave-based execution that can pivot between phases without losing progress.

**Version 1.28.0** adds: `gsd-advisor-researcher`, `gsd-assumptions-analyzer`, `gsd-ui-auditor`, `gsd-ui-checker`, `gsd-ui-researcher`, `gsd-user-profiler` agents.

---

## Core Concepts

### When to Use GSD
| Signal | Use GSD? |
|--------|----------|
| Requirements will shift during build | Yes |
| Experimental MVP — discovering what works | Yes |
| Spec is fully locked before any code | No (use BMAD) |
| Auth/payments/edge cases are costly | No (use Superpowers) |
| Solo fix, <3 files | No (direct Claude) |

### Framework Decision Tree
```
Does the feature require experimentation?
├─ YES → GSD
└─ NO → Requirements fully locked before coding?
         ├─ YES → BMAD
         └─ NO → Can mistakes NOT be easily undone?
                  ├─ YES → Superpowers
                  └─ NO → GSD or direct Claude
```

### Phase Structure
GSD organizes work into numbered phases. Each phase has:
1. **Research** (optional): `gsd:discuss-phase N` — clarify requirements before planning
2. **Plan**: `gsd:plan-phase N` — produce an adversarially verified implementation plan
3. **Execute**: `gsd:execute-phase N` — wave-based sub-agent execution
4. **Verify**: `gsd:verify-work` — Playwright E2E + verifier agent

Phases are atomic — you can stop after any phase and the project is in a stable state.

### Wave-Based Execution
Within `gsd:execute-phase`, work is divided into waves of atomic tasks. Each wave:
- Tasks within a wave are independent (can run in parallel via fan-out)
- Wave N+1 doesn't start until wave N is verified
- Each task is dispatched to a specialized sub-agent

This is the fan-out pattern at the phase level. See [[patterns/pattern-fan-out-worker]].

### Adversarial Plan Verification
Built into `gsd:plan-phase` — before execution starts, the plan is reviewed by a second perspective (gsd-plan-checker agent) that looks for:
- Hidden assumptions
- Missing error cases
- Scope creep
- Dependencies that could block a wave
- Testability gaps

This catches plan failures before they become code failures.

---

## Commands

| Command | Purpose |
|---------|---------|
| `/gsd:new-project` | Initialize a new project with full planning: scope, research, roadmap approval |
| `/gsd:discuss-phase N` | Clarify requirements before planning phase N (optional but recommended) |
| `/gsd:plan-phase N` | Plan phase N with adversarial verification |
| `/gsd:execute-phase N` | Execute phase N with wave-based sub-agent parallelism |
| `/gsd:verify-work` | Playwright E2E + verifier agent — confirm implementation matches goals |
| `/gsd:quick` | Fast single-task execution with minimal overhead |
| `/gsd:fast` | Skip discussion phase, go straight to planning |
| `/gsd:do` | Direct task execution, no planning overhead |
| `/gsd:review` | Review completed work against original spec |
| `/gsd:debug` | Structured debugging session with gsd-debugger |
| `/gsd:autonomous` | Full autonomous mode — no human checkpoints |
| `/gsd:session-report` | End-of-session summary, commit message, PROGRESS.md update |
| `/gsd:stats` | Project statistics (phases, tasks, coverage) |
| `/gsd:thread` | Create a focused work thread on a subtopic |
| `/gsd:workstreams` | Manage parallel workstreams |
| `/gsd:ui-phase` | UI-specific phase execution with gsd-ui-auditor |
| `/gsd:ui-review` | UI review and accessibility/design audit |
| `/gsd:pr-branch` | Create PR branch from current work |
| `/gsd:ship` | **Restricted — not for production repos without explicit approval** |

---

## Agent Ecosystem (18+ agents)

GSD ships with a full agent ecosystem, all defined as `.md` files in `~/.claude/agents/`:

### Orchestration Agents
| Agent | Role |
|-------|------|
| `gsd-planner` | Decomposes phases into atomic tasks; produces wave plans |
| `gsd-executor` | Executes individual tasks; the workhorse of execute-phase |
| `gsd-verifier` | Verifies implementation against spec; runs checks, reports gaps |
| `gsd-debugger` | Structured debugging with root cause analysis discipline |
| `gsd-roadmapper` | Creates and maintains project roadmaps |

### Research & Analysis Agents
| Agent | Role |
|-------|------|
| `gsd-phase-researcher` | Researches technologies and patterns needed for a phase |
| `gsd-project-researcher` | Broad project domain research at project init |
| `gsd-advisor-researcher` | Research with advisory framing — returns recommendations, not just facts |
| `gsd-assumptions-analyzer` | Surfaces hidden assumptions in plans and requirements |
| `gsd-research-synthesizer` | Synthesizes findings from multiple research agents |

### Quality & Review Agents
| Agent | Role |
|-------|------|
| `gsd-plan-checker` | Adversarial plan review — finds gaps before execution |
| `gsd-integration-checker` | Verifies integrations between modules after execution |
| `gsd-nyquist-auditor` | Audits for completeness — are all required behaviors covered? |
| `gsd-codebase-mapper` | Maps the codebase structure for orientation in large repos |

### UI Agents (added in v1.28.0)
| Agent | Role |
|-------|------|
| `gsd-ui-auditor` | Full UI/UX audit — visual design, accessibility, interaction patterns |
| `gsd-ui-checker` | Quick UI check — flag obvious problems without full audit |
| `gsd-ui-researcher` | Research UI patterns, component libraries, design trends |
| `gsd-user-profiler` | Create and maintain user personas for UI decisions |

### Specialist Reviewers (shared with Superpowers/BMAD)
| Agent | Role |
|-------|------|
| `architect` | System design, ADRs, architectural decisions |
| `code-reviewer` | Code quality, conventions, readability |
| `security-reviewer` | Vulnerability assessment, threat modeling |
| `db-reviewer` | Query optimization, schema design |
| `perf-analyzer` | Profiling, bottleneck identification |
| `superpowers-code-reviewer` | Superpowers-aware review (iron law compliance) |

---

## Architecture

```
GSD Framework
    │
    ├── Skills (slash commands)
    │   └── ~/.claude/skills/gsd-*/  [not found as named dir — likely inline]
    │
    ├── Agents (sub-agent definitions)
    │   └── ~/.claude/agents/gsd-*.md
    │
    ├── Hooks (workflow enforcement)
    │   ├── gsd-workflow-guard.js     ← enforces phase gates (PreToolUse/Write)
    │   ├── gsd-context-monitor.js    ← monitors context usage
    │   ├── gsd-prompt-guard.js       ← prevents writes in wrong state
    │   ├── gsd-check-update.js       ← checks for GSD version updates
    │   └── gsd-statusline.js         ← updates terminal status line
    │
    └── CLAUDE.md (global) ← decision tree, agent catalog, command reference
```

### Execution Flow (Standard Feature)
```
/gsd:new-project
    → scope document
    → research (gsd-project-researcher)
    → roadmap (gsd-roadmapper)
    → Jay approves roadmap

/gsd:discuss-phase 1  (optional)
    → clarify requirements with Jay
    → surface assumptions (gsd-assumptions-analyzer)

/gsd:plan-phase 1
    → gsd-planner decomposes into atomic tasks
    → gsd-plan-checker adversarial review
    → wave plan produced

/gsd:execute-phase 1
    → wave 1: N parallel gsd-executor agents
    → verify wave 1 (gsd-verifier)
    → wave 2: N parallel gsd-executor agents
    → ...
    → phase complete

/gsd:verify-work
    → Playwright E2E tests
    → gsd-verifier spec check
    → gsd-nyquist-auditor completeness check

/gsd:session-report
    → summary, commit message, PROGRESS.md update
```

---

## Strengths

- **Built for uncertainty**: explicit discuss → plan → execute loop means requirements can be clarified before code, not after
- **Adversarial verification**: plans are challenged before execution — catches "we forgot error handling" at plan time, not at 2am
- **Parallel execution**: wave-based fan-out gets real speedup on tasks that don't depend on each other
- **Rich specialist agent ecosystem**: right agent for the right job; UI work goes to gsd-ui-auditor, not a generic verifier
- **Hooks for workflow enforcement**: GSD workflow guards prevent agents from going off-rails
- **Jay's most-validated framework**: 1.28.0 versions of agents reflect dozens of real project iterations
- **Zero new dependencies**: runs entirely within Claude Code; no Python environment, no npm installs

---

## Weaknesses

- **Jay-specific**: GSD is tuned for Jay's workflow, stack, and preferences. Agents reference Jay by name. Not portable to other teams without customization.
- **Not spec-locked**: if requirements ARE locked and stable, BMAD's pre-planning is more efficient
- **High-stakes work**: for auth/payments/edge-cases-are-costly work, GSD lacks Superpowers' TDD iron laws
- **No external observability**: GSD execution is visible in Claude Code sessions but not in an external dashboard (Jay uses hooks + Multi-Agent-Observability for this)
- **Phase gate discipline required**: skipping `gsd:verify-work` breaks the quality guarantee

---

## Minimal Working Example

```
# Starting a new project
/gsd:new-project
> What are we building?
"A webhook receiver that validates Stripe signatures, logs events to Postgres, and retries failed handlers"

# GSD runs: scope → research → roadmap → approval
# Output: PROJECT.md, ROADMAP.md, phase 1 task list

# Plan and execute phase 1
/gsd:plan-phase 1
# Output: wave plan with 4 waves, 12 atomic tasks

/gsd:execute-phase 1
# Spawns parallel sub-agents per wave
# Wave 1: 3 agents → DB schema, webhook handler skeleton, Stripe SDK setup
# Wave 2: 2 agents → signature validation, event parsing
# Wave 3: 1 agent → retry logic
# Wave 4: 1 agent → integration tests

# Verify
/gsd:verify-work
# Playwright runs, gsd-verifier checks spec compliance

# Ship
/gsd:session-report
```

---

## GSD vs Superpowers vs BMAD

| Dimension | GSD | Superpowers | BMAD |
|-----------|-----|-------------|------|
| Best for | Experimental MVPs | High-stakes features | Locked specs |
| Requirements | Evolving | Known but risky | Fully locked |
| TDD | Optional | Iron law | Optional |
| Plan verification | Adversarial | Design doc review | PRD validation |
| Agent specialization | 18+ specialized | Reviewer pair | 12+ personas |
| When to use | Default for new builds | Auth, payments, agents | Enterprise/client |

### Hybrid Pattern (recommended for large apps)
1. GSD: build the working MVP
2. Superpowers: layer on stability for auth, payments, agentic components
3. BMAD: add spec-locked modules (CRM integration, reporting layer)

---

## Integration Points

- **[[frameworks/framework-claude-code]]**: GSD is built entirely on Claude Code; skills become slash commands, agents use the Agent tool
- **[[frameworks/framework-superpowers]]**: Superpowers is used for high-stakes layers on top of GSD MVPs
- **[[frameworks/framework-bmad]]**: BMAD for spec-locked modules added to GSD-built apps
- **[[entities/jay-west-agent-stack]]**: GSD is Jay's default framework
- **[[patterns/pattern-fan-out-worker]]**: GSD's wave execution is this pattern at scale

---

## Jay's Experience

GSD is Jay's primary framework — 1.28.0 represents extensive iteration. Key validated lessons:

1. **The discuss phase saves hours**: 20 minutes of `/gsd:discuss-phase` before planning prevents a 4-hour mid-phase pivot
2. **Adversarial plan review is worth it**: gsd-plan-checker catches on average 2-3 gaps per plan that would have become debugging sessions
3. **Wave size matters**: waves with >5 tasks become hard to verify; keep waves tight
4. **gsd-nyquist-auditor is underused**: run it after every phase; it consistently finds behaviors that were specified but not implemented
5. **`/gsd:autonomous` is powerful but risky**: use only when the plan is well-verified; autonomous mode won't pause to ask clarifying questions

---

## Version Notes

- **1.28.0**: Added UI agent suite (gsd-ui-auditor, gsd-ui-checker, gsd-ui-researcher, gsd-user-profiler) and research advisory agents (gsd-advisor-researcher, gsd-assumptions-analyzer)
- **1.x**: Wave-based execution model established; adversarial plan verification added
- Internal framework — no public changelog; version tracked in CLAUDE.md

---

## Sources

- Jay's `~/.claude/CLAUDE.md` (framework specification)
- Jay's `~/.claude/agents/gsd-*.md` (agent definitions)
- Jay's `~/.claude/hooks/gsd-*.js` (hook implementations)
- [[entities/jay-west-agent-stack]]
- [[frameworks/framework-claude-code]]
