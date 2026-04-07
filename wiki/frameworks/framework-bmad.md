---
title: BMAD Method
type: framework
vendor: Jay West (personal)
version: "current (2026)"
language: any
license: proprietary
github: ""
tags: [bmad, orchestration, enterprise, planning, multi-agent, spec-locked, claude-code]
last_checked: 2026-04-04
jay_experience: extensive
---

## Overview

BMAD (Breakthrough Method for Agentic Development) is Jay West's framework for spec-locked projects — enterprise builds, client deliverables, and modules with requirements that are fully known before any code is written. Where GSD embraces uncertainty with iterative phases, BMAD front-loads all ambiguity resolution into a rigorous pre-planning stage so that implementation can proceed with maximum confidence.

BMAD's core discipline: **no implementation starts until the spec is complete, validated, and sharded into agent-sized tasks**. This prevents mid-build spec changes from invalidating large chunks of work — the risk BMAD is designed to eliminate.

BMAD is implemented as skills in `~/.claude/skills/bmad/` organized into four groups: core utilities, analysis, planning, and solutioning. It also draws on 12+ agent personas that can be invoked in BMAD Party Mode.

---

## Core Concepts

### When to Use BMAD
| Signal | Use BMAD? |
|--------|-----------|
| Requirements fully locked before any code | Yes |
| Client/enterprise deliverable with approval gates | Yes |
| Requirements will shift mid-build | No (use GSD) |
| High-stakes features with edge case risk | No (use Superpowers) |
| Spec might change when you show it to stakeholders | No (use GSD first) |

**Critical anti-pattern**: using BMAD when you actually don't know the requirements. A wrong spec executed perfectly is a perfectly wrong product. If requirements aren't locked, use GSD to discover them first.

### Party Mode
BMAD Party Mode is the framework's most distinctive feature: multiple agent personas debate a decision simultaneously rather than sequentially. Invoke `bmad-party-mode` when you need multiple perspectives on an architecture choice, PRD section, or design decision.

Active personas in Party Mode (each responds in character):
- **PM (Product Manager)**: user needs, prioritization, scope risk
- **Architect**: technical feasibility, system design, scalability
- **UX Designer**: user experience, information architecture, accessibility
- **Developer**: implementation complexity, technical debt, maintainability
- **Business Analyst**: requirements completeness, acceptance criteria, edge cases
- **Security Reviewer**: threat model, data handling, compliance

Party Mode output is a structured debate — each persona raises concerns and objections before consensus is sought. This is adversarial by design.

### Document-First Approach
BMAD produces artifacts in sequence before any code is written:

1. **Product Brief** → market context, problem statement, user needs
2. **PRD (Product Requirements Document)** → functional requirements, acceptance criteria, user stories
3. **Architecture Document** → system design, data models, API contracts, infrastructure
4. **Implementation Epics + Stories** → work broken into epics, stories, and tasks

Each artifact gates the next. You don't write the PRD until the product brief is approved. You don't write architecture until the PRD is validated. This prevents premature technical decisions.

### Sharding
Large specs are split into agent-sized chunks via `bmad-shard-doc`. A 50-page PRD is unusable by a single agent in one context window. Sharding produces N smaller documents, each focused on a coherent slice, each consumable in a single agent context. Implementation proceeds shard by shard.

### Distillation
`bmad-distillator` compresses large documents (PRDs, architecture docs) into dense summaries for context efficiency. Used before feeding a large doc to an agent with limited context budget.

---

## Core Workflow

```
bmad-init
    → project scaffolding, KB setup, team structure

bmad-product-brief
    → market research, problem framing, user needs
    → output: PRODUCT-BRIEF.md

[optional] bmad-party-mode
    → multi-persona debate on key decisions

bmad-create-prd
    → functional requirements, acceptance criteria, user stories
    → output: PRD.md

bmad-validate-prd
    → adversarial review: completeness, consistency, ambiguity
    → edge case hunting (bmad-review-edge-case-hunter)
    → output: validated PRD + issues list

[optional] bmad-agent-architect
    → system design, data model, API contracts
    → output: ARCHITECTURE.md

bmad-create-epics-and-stories
    → break PRD into epics → stories → tasks
    → output: EPICS.md

bmad-shard-doc
    → split large docs for agent consumption
    → output: shards/PRD-part-1.md, etc.

implementation (wave by wave, shard by shard)
    → gsd-executor or direct implementation
    → [optional] Superpowers for high-stakes tasks
```

---

## Skills Catalog

### Core (`~/.claude/skills/bmad/core/`)
| Skill | Purpose |
|-------|---------|
| `bmad-init` | Initialize BMAD on a project — KB, team, scaffold |
| `bmad-brainstorming` | Structured ideation with named ideation methods |
| `bmad-party-mode` | Multi-persona simultaneous debate |
| `bmad-advanced-elicitation` | Deep requirements extraction techniques |
| `bmad-review-adversarial-general` | Adversarial review pass — challenge everything |
| `bmad-review-edge-case-hunter` | Systematic edge case discovery |
| `bmad-distillator` | Compress large docs for context efficiency |
| `bmad-shard-doc` | Split large specs into agent-sized chunks |
| `bmad-help` | BMAD documentation and guidance |
| `bmad-index-docs` | Index and cross-reference BMAD documents |

### Analysis (`~/.claude/skills/bmad/analysis/`)
| Skill | Purpose |
|-------|---------|
| `bmad-product-brief` | Full product brief with market + domain research |
| `bmad-agent-analyst` | Business analyst persona — requirements, acceptance criteria |
| `bmad-document-project` | Document an existing codebase for BMAD onboarding |
| `bmad-domain-research` | Deep dive into a specific domain |
| `bmad-market-research` | Competitive analysis and market landscape |
| `bmad-technical-research` | Technology evaluation and selection |

### Planning (`~/.claude/skills/bmad/planning/`)
| Skill | Purpose |
|-------|---------|
| `bmad-create-prd` | Generate full PRD from product brief |
| `bmad-agent-pm` | Product manager persona — roadmap, prioritization |
| `bmad-agent-ux-designer` | UX design persona — flows, wireframes, IA |
| `bmad-validate-prd` | Validate PRD for completeness and consistency |
| `bmad-edit-prd` | Structured PRD editing with change tracking |
| `bmad-generate-project-context` | Generate compact project context for agents |
| `bmad-check-implementation-readiness` | Are we ready to build? Readiness checklist |

### Solutioning (`~/.claude/skills/bmad/solutioning/`)
| Skill | Purpose |
|-------|---------|
| `bmad-agent-architect` | Architecture design — systems, data models, APIs |
| `bmad-create-architecture` | Generate architecture document |
| `bmad-create-epics-and-stories` | Break PRD into implementation units |

---

## Architecture

```
BMAD Framework
    │
    ├── Skills (document production pipeline)
    │   ├── analysis/    ← research and problem definition
    │   ├── planning/    ← PRD and architecture
    │   ├── solutioning/ ← epics, stories, tasks
    │   └── core/        ← utilities (party-mode, sharding, distillation)
    │
    ├── Agent Personas (activated via party-mode or individually)
    │   ├── bmad-agent-pm (Product Manager)
    │   ├── bmad-agent-ux-designer (UX Designer)
    │   ├── bmad-agent-analyst (Business Analyst)
    │   ├── bmad-agent-architect (Architect)
    │   └── [implicit personas in party-mode: dev, security, etc.]
    │
    └── Output Artifacts (gated pipeline)
        PRODUCT-BRIEF.md → PRD.md → ARCHITECTURE.md → EPICS.md → shards/ → implementation
```

---

## Strengths

- **Zero rework from spec changes**: implementation only starts when spec is locked; no mid-build pivots
- **Party Mode surfaces blind spots**: a PM and an Architect and a UX designer disagreeing in the same prompt catches more problems than sequential review
- **Adversarial edge case hunting**: `bmad-review-edge-case-hunter` systematically finds missing behaviors before they're missing in production
- **Shard-and-conquer**: large specs don't overwhelm any single agent context
- **Client-ready artifacts**: PRODUCT-BRIEF, PRD, ARCHITECTURE are deliverable documents, not just internal notes
- **Implementation readiness check**: explicit gate before code starts — prevents premature implementation
- **Composable with Superpowers**: BMAD plans the module, Superpowers implements it with TDD

---

## Weaknesses

- **Front-heavy**: most of BMAD's value comes before a single line of code; if the client doesn't value the artifacts, the overhead feels excessive
- **Requirements drift is fatal**: if requirements change after PRD lock, BMAD's artifacts become technical debt (wrong documents that feel official)
- **Party Mode is expensive**: 6 personas responding in one context burns tokens quickly; not suitable for every decision
- **Overkill for small features**: a 3-file bugfix doesn't need a PRD
- **Not for exploration**: discovering requirements is GSD's job; BMAD assumes they're already known

---

## Minimal Working Example

```
# Initialize BMAD on a new client project
/bmad-init
> Project: Customer Portal for SellerFi
> Team: solo developer + Jay
> Stack: Next.js, Prisma, Postgres

# Product brief
/bmad-product-brief
> Domain: fintech B2B portals
> Output: PRODUCT-BRIEF.md (market context, user needs, success metrics)

# Party Mode on critical architectural decision
/bmad-party-mode
> Decision: Should we use a monolith or microservices for the portal?
> PM: [speaks], Architect: [speaks], Dev: [speaks], UX: [speaks]
> Consensus emerges: modular monolith with clear service boundaries

# Create PRD
/bmad-create-prd
> Based on PRODUCT-BRIEF.md
> Output: PRD.md (functional requirements, acceptance criteria, 40+ user stories)

# Validate PRD
/bmad-validate-prd
> Adversarial review + edge case hunt
> Output: issues list, updated PRD.md

# Shard for implementation
/bmad-shard-doc PRD.md
> Output: shards/PRD-part-1.md (auth + onboarding)
>         shards/PRD-part-2.md (dashboard + data views)
>         shards/PRD-part-3.md (admin + reporting)

# Implement shard by shard
# [Use GSD for standard features, Superpowers for auth/payments shards]
```

---

## Integration Points

- **[[frameworks/framework-gsd]]**: GSD for exploration → BMAD for locked-spec execution; or BMAD for planning, GSD-executor for implementation
- **[[frameworks/framework-superpowers]]**: BMAD plans the spec; Superpowers implements high-stakes slices with TDD
- **[[frameworks/framework-claude-code]]**: BMAD skills run inside Claude Code; party-mode uses the Agent tool for multi-persona spawning
- **[[entities/jay-west-agent-stack]]**: BMAD is Jay's enterprise/client framework
- Obsidian: BMAD artifacts (PRD, architecture) are stored as markdown and can be cross-referenced from the Agentic-KB

---

## Jay's Experience

Jay uses BMAD for client projects (SellerFi, AMS/ARM) where the client has a stable spec and deliverables need to look professional. Key validated findings:

1. **Party Mode ROI on architecture decisions is extremely high**: a 45-minute party mode session on a data model caught a normalization mistake that would have required a painful migration later
2. **`bmad-review-edge-case-hunter` consistently finds 3-5 missing behaviors**: bugs that would have been production incidents discovered in a document review
3. **Clients value the artifacts**: PRODUCT-BRIEF and PRD give clients something to sign off on, reducing scope creep disputes
4. **The document gate discipline is hard to maintain**: pressure to "just start coding" while the PRD is being refined is real; the implementation-readiness check helps
5. **BMAD + GSD hybrid**: Jay often uses GSD for the MVP prototype to discover unknowns, then locks the spec with BMAD for the production build

---

## Version Notes

- Current version: unversioned public release; Jay tracks his fork internally
- Skill directory structure: `~/.claude/skills/bmad/{core,analysis,planning,solutioning}/`
- Party Mode is core capability — not a plugin
- `bmad-generate-project-context` added for compact context injection into sub-agents

---

## Sources

- Jay's `~/.claude/CLAUDE.md` (BMAD section)
- Jay's `~/.claude/skills/bmad/` (skill directory structure)
- [[entities/jay-west-agent-stack]]
- [[frameworks/framework-gsd]]
- [[frameworks/framework-superpowers]]
