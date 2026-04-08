---
title: Jay West — Agent Stack
type: entity
category: person
tags: [jay-west, claude-code, gsd, superpowers, bmad, gstack, agentic, personal-stack]
created: 2026-04-04
updated: 2026-04-07
---

## Overview

Jay West is an expert AI builder and multi-agent architect. This page documents his complete agentic engineering stack as of April 2026, derived from direct inspection of his system. Jay's stack is notable for its depth: 34 custom agents, 29+ skills, a structured hook system, multiple agent runtimes, an Obsidian vault with 34 canonical concepts, a TypeScript LLM Wiki harness, and four primary frameworks (GSD, Superpowers, BMAD, gstack) with a clear decision framework for when to use each.

---

## Primary Runtime: Claude Code

**Primary tool**: Claude Code CLI (Anthropic)
**Default model**: `claude-sonnet-4-6` (Sonnet-class)
**Model in settings**: `"model": "opusplan"` — likely a model plan alias; effective tier is Sonnet for most work, Opus for heavy reasoning

Claude Code is Jay's primary development environment — not just an assistant but an autonomous agent runtime with hooks, sub-agents, MCP servers, and skills. See [[frameworks/framework-claude-code]].

---

## Framework Stack

Jay uses four primary frameworks with a structured decision tree:

| Framework | Version | Use Case | Jay Experience |
|-----------|---------|----------|---------------|
| [[frameworks/framework-gsd\|GSD]] | 1.28.0 | Experimental MVPs, evolving requirements | Extensive |
| [[frameworks/framework-superpowers\|Superpowers]] | 5.0.6 | High-stakes features (auth, payments, agents) | Extensive |
| [[frameworks/framework-bmad\|BMAD]] | current | Spec-locked enterprise/client builds | Extensive |
| [[frameworks/framework-gstack\|gstack]] | current | Design-first sprints, browser QA, multi-role review | Active |


### Framework Selection Rules
```
Experimental MVP or shifting requirements → GSD
Auth / payments / costly mistakes → Superpowers
Locked spec / client deliverable → BMAD
Design-first / needs browser QA / multi-role review → gstack
Solo fix <3 files → Direct Claude (no framework)

Hybrid (recommended for large apps):
1. GSD: build the working MVP
2. Superpowers: harden auth/payments/agentic components
3. BMAD: add spec-locked modules
4. gstack: design → code handoff and browser-based QA throughout
```

---

## gstack Framework

**Author**: Garry Tan (YC President & CEO)
**Source**: https://github.com/garrytan/gstack
**Install**: `git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`

gstack transforms Claude Code into a **virtual engineering team** of 23 specialized AI agents, each playing a distinct professional role. Jay's existing gstack skill entry previously described it only as "headless browser QA" — that significantly understates it.

### Core Philosophy

> "A single builder with the right tooling can move faster than a traditional team."

gstack implements a deterministic sprint structure: **Think → Plan → Build → Review → Test → Ship → Reflect**. Each phase produces written artifacts (Markdown) that feed downstream roles. No conversation disappears — the process creates institutional memory.

### The Sprint Structure

| Phase | Commands | Role |
|-------|----------|------|
| **Think** | `/office-hours` | 6 forcing questions reframe the request before code begins |
| **Plan** | `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`, `/autoplan` | Multi-role challenge of scope, arch, design, and DX |
| **Build** | `/investigate`, `/pair-agent` | Implementation with freeze/guard safety tools |
| **Review** | `/review`, `/codex` | Staff-engineer-level analysis + cross-model (Claude + OpenAI Codex) |
| **Test** | `/qa`, `/qa-only`, `/browse` | Real Chromium browser opens, clicks flows, generates regression tests |
| **Ship** | `/ship`, `/land-and-deploy`, `/canary` | Syncs main, runs tests, opens PRs, verifies prod health |
| **Reflect** | `/retro` | Per-person metrics, shipping streaks, test health trends |


### The Virtual Team (23 Roles)

| Role | Commands | Responsibility |
|------|----------|----------------|
| CEO | `/plan-ceo-review` | Challenges scope across 4 modes (Expand / Hold / Reduce); finds 10-star products hiding in requests |
| Designer | `/plan-design-review`, `/design-shotgun`, `/design-html`, `/design-consultation` | Catches AI slop; generates mockup variants; converts approved design to production HTML |
| Eng Manager | `/plan-eng-review`, `/retro` | Locks architecture, data flow, edge cases; tracks team metrics |
| Staff Engineer | `/review` | Finds bugs that pass CI but fail production |
| QA Lead | `/qa`, `/qa-only` | Opens real Chromium; tests actual user flows; generates regression tests |
| Security Officer | `/cso` | OWASP Top 10 + STRIDE threat modeling; zero-false-positive design |
| Release Engineer | `/ship`, `/land-and-deploy`, `/canary` | Merges PRs; verifies production health |

### Key Differentiators vs. Jay's Other Frameworks

| Dimension | GSD | Superpowers | BMAD | gstack |
|-----------|-----|-------------|------|--------|
| Design-first pipeline | ✗ | ✗ | ✗ | ✓ (`/design-shotgun → /design-html`) |
| Real browser QA | ✗ | ✗ | ✗ | ✓ (Chromium, real screenshots) |
| Cross-model review | ✗ | ✗ | ✗ | ✓ (Claude + OpenAI Codex `/codex`) |
| Multi-role challenge | ✗ | ✗ | ✓ (Party Mode) | ✓ (CEO/Eng/Design/DevEx) |
| Process artifacts | ✓ | ✓ | ✓ | ✓ (all Markdown, feeds downstream) |
| Safety model | Hooks/gates | Iron laws | Spec-lock | `/careful`, `/freeze`, `/guard` |
| Best for | Rapid iteration | High stakes | Locked specs | Design→code, QA, sprint retrospectives |

### Design-First Pipeline

The `/design-shotgun → /design-html` pipeline is unique to gstack:
- **`/design-shotgun`**: Generates 4–6 AI mockup variants via GPT Image; opens comparison board in browser; iterates with taste memory
- **`/design-html`**: Converts approved mockup to production-ready HTML (30KB, zero dependencies). Detects React/Svelte/Vue framework; uses Pretext computed layout; text reflows on resize

### Safety Tools

| Tool | Behavior |
|------|----------|
| `/careful` | Warns before destructive commands (`rm -rf`, `DROP TABLE`, force-push) |
| `/freeze` | Restricts edits to one directory during debugging |
| `/guard` | Combines `/careful` + `/freeze` for maximum production safety |
| `/investigate` | Auto-freezes to module being debugged; stops after 3 failed fix attempts |


### Multi-Agent & Multi-Runtime Support

gstack works across 8 AI coding agents (Claude Code, OpenAI Codex CLI, Cursor, Factory Droid, Slate, Kiro, OpenCode). Setup auto-detects installed agents. Jay's stack already uses gstack with **OpenClaw** via four conversational skills in ClawHub: `gstack-openclaw-office-hours`, `gstack-openclaw-ceo-review`, `gstack-openclaw-investigate`, `gstack-openclaw-retro`.

Parallel execution via Conductor: 10–15 simultaneous sprints, each in its own isolated workspace, coordinated through shared repositories.

---

## Agent Ecosystem (34 Agents)

All defined as `.md` files in `~/.claude/agents/`:

### GSD Agents (Primary Workforce)
| Agent | Role |
|-------|------|
| `gsd-planner` | Phase decomposition, wave planning |
| `gsd-executor` | Task execution workhorse |
| `gsd-verifier` | Post-execution spec verification |
| `gsd-debugger` | Structured root-cause debugging |
| `gsd-roadmapper` | Project roadmaps |
| `gsd-phase-researcher` | Phase-specific technology research |
| `gsd-project-researcher` | Broad project domain research |
| `gsd-advisor-researcher` | Research with advisory recommendations |
| `gsd-assumptions-analyzer` | Surface hidden assumptions |
| `gsd-research-synthesizer` | Multi-source research synthesis |
| `gsd-plan-checker` | Adversarial plan review |
| `gsd-integration-checker` | Post-execution integration verification |
| `gsd-nyquist-auditor` | Completeness auditing |
| `gsd-codebase-mapper` | Codebase structure orientation |
| `gsd-ui-auditor` | Full UI/UX audit |
| `gsd-ui-checker` | Quick UI issue detection |
| `gsd-ui-researcher` | UI patterns and component research |
| `gsd-user-profiler` | User persona creation and maintenance |


### Architecture & Planning Agents (Numbered series)
| Agent | Role |
|-------|------|
| `01-architecture-agent` | System design and ADRs |
| `02-plan-review-agent` | Plan adversarial review |
| `03-planning-agent` | Task planning |
| `04-task-breakdown-agent` | Task decomposition |
| `05-context-manager-agent` | Context window management |
| `06-code-generation-agent` | Code generation specialist |
| `07-task-validation-agent` | Task output validation |
| `08-runtime-preparation-agent` | Environment prep before execution |

### Specialist Reviewers
| Agent | Role |
|-------|------|
| `architect` | System design, ADRs |
| `code-reviewer` | Code quality review |
| `security-reviewer` | Vulnerability and threat assessment |
| `db-reviewer` | Database query and schema optimization |
| `perf-analyzer` | Performance profiling and bottleneck identification |
| `superpowers-code-reviewer` | Superpowers iron-law-aware code review |

---

## Skills (29+ Slash Commands)

All in `~/.claude/skills/`:

### GSD Skills
GSD commands are embedded in CLAUDE.md and agents, not as separate SKILL.md directories (the `/gsd:*` namespace). See [[frameworks/framework-gsd]] for full command reference.

### Superpowers Skills (`~/.claude/skills/superpowers/`)
| Skill | Purpose |
|-------|---------|
| `brainstorming` | Structured ideation before any feature work |
| `test-driven-development` | Red → Green → Refactor cycle |
| `systematic-debugging` | Root cause first, fix second |
| `writing-plans` | Design doc production |
| `subagent-driven-development` | Fan-out per task with two-stage review |
| `dispatching-parallel-agents` | Parallel agent dispatch for independent tasks |
| `verification-before-completion` | Fresh evidence before claiming done |
| `finishing-a-development-branch` | Cleanup, changelog, PR prep |
| `using-git-worktrees` | Sandboxed isolation for risky changes |
| `requesting-code-review` | Structured review request |
| `receiving-code-review` | Structured review response |
| `using-superpowers` | Meta-skill: when to invoke others |

### BMAD Skills (`~/.claude/skills/bmad/`)
See [[frameworks/framework-bmad]] for full catalog. Organized into core, analysis, planning, solutioning.


### gstack Skills (`~/.claude/skills/gstack/`)
| Skill | Purpose |
|-------|---------|
| `/office-hours` | 6 forcing questions before any code; produces design doc for downstream roles |
| `/plan-ceo-review` | CEO-mode scope challenge across 4 modes (Expand/Selective/Hold/Reduce) |
| `/plan-eng-review` | Locks architecture, data flow, diagrams, edge cases |
| `/plan-design-review` | Rates design dimensions 0–10; flags AI-generated slop |
| `/plan-devex-review` | Developer experience forcing questions |
| `/autoplan` | Orchestrates all plan reviews automatically |
| `/design-consultation` | Design direction session |
| `/design-shotgun` | 4–6 AI mockup variants via GPT Image; comparison board; taste memory iteration |
| `/design-html` | Converts approved mockup to production HTML; detects React/Svelte/Vue |
| `/review` | Staff-engineer-level code analysis; auto-fixes obvious issues |
| `/codex` | Independent code review via OpenAI Codex CLI (cross-model analysis) |
| `/qa` | Real Chromium browser; clicks flows; finds bugs; generates regression tests |
| `/qa-only` | QA pass without auto-fix |
| `/browse` | ~100ms latency Chromium browsing with real screenshots |
| `/open-gstack-browser` | GStack Browser with anti-bot stealth + sidebar agent |
| `/ship` | Syncs main, runs tests, audits coverage, opens PRs |
| `/land-and-deploy` | Full deploy pipeline |
| `/canary` | Canary deploy with production health verification |
| `/cso` | OWASP Top 10 + STRIDE security audit; 8/10+ confidence gate; zero noise |
| `/retro` | Per-person metrics, shipping streaks, test health; `/retro global` spans all AI tools |
| `/careful` | Warns before destructive commands |
| `/freeze` / `/unfreeze` | Restrict edits to one directory during debugging |
| `/guard` | Combines `/careful` + `/freeze` |
| `/investigate` | Auto-freezes module; stops after 3 failed fixes |
| `/benchmark` | Performance benchmarking |
| `/document-release` | Release documentation generation |
| `/learn` | Framework self-documentation |
| `/gstack-upgrade` | Self-updating framework |

### Specialist Skills
| Skill | Purpose |
|-------|---------|
| `graphify` | Generate knowledge graph visualization from wiki index |
| `ralph` | Personal skill |
| `prd` / `prd-creator` | PRD creation (standalone, non-BMAD) |
| `react-best-practices` | React component patterns |
| `web-design-guidelines` | UI design system conventions |
| `vitest-best-practices` | Testing with Vitest |
| `skill-creator` | Meta-skill for creating new skills |
| `context-compression` | Rolling summary compression for long sessions |
| `context-degradation` | Handling context quality degradation |
| `context-fundamentals` | Context management foundations |
| `context-optimization` | Context window efficiency |
| `memory-systems` | Agentic memory pattern selection |
| `multi-agent-patterns` | Multi-agent architecture patterns |
| `evaluation` / `advanced-evaluation` | Agent evaluation harness |
| `e2e-tester` | Playwright E2E testing |
| `frontend-testing` / `frontend-code-review` | Frontend quality |
| `component-refactoring` | Component-level refactor patterns |
| `hosted-agents` | Deploying agents to hosted environments |
| `bdi-mental-states` | BDI agent architecture patterns |
| `filesystem-context` | Filesystem-based context management |
| `project-development` | General project development patterns |
| `mysql` / `postgres` | Database-specific patterns |
| `vercel-react-best-practices` | Vercel-specific React deployment |


---

## Hook System (15 Hook Files)

All in `~/.claude/hooks/`:

| Hook | Event | Purpose |
|------|-------|---------|
| `file-read-guard.sh` | PreToolUse/Read | Warn (exit 2) when reading files >2000 lines |
| `gsd-prompt-guard.js` | PreToolUse/Write\|Edit | Enforce GSD workflow gates |
| `gsd-workflow-guard.js` | PreToolUse | GSD phase transition enforcement |
| `gsd-context-monitor.js` | (continuous) | Monitor context usage, trigger compact |
| `gsd-check-update.js` | Session start | Check for GSD framework updates |
| `gsd-statusline.js` | (continuous) | Update terminal status line with GSD state |
| `pre-tool-memory.py/.sh` | PreToolUse | Memory operations before tool calls |
| `pre-tool-use.js` | PreToolUse | General pre-tool validation |
| `auto-format.sh` | PostToolUse/Write\|Edit | Auto-format files after edits |
| `stop-validation.sh` | Stop | End-of-session verification gate |
| `play-sound.js` | Notification | Play sound on agent notifications |
| `prompt-injection-defender/` | PostToolUse/Read\|Bash\|WebFetch\|Grep\|Task | Scan outputs for prompt injection patterns |
| Multi-Agent-Observability hooks | All events | Forward all events to observability stack |

The `send_event.py` from Multi-Agent-Observability fires on PreToolUse, PostToolUse, Notification, Stop, and SubagentStop — providing full telemetry for all Claude Code sessions.

---

## Parallel Runtimes

Beyond Claude Code, Jay runs:

| Runtime | Location | Purpose |
|---------|----------|---------|
| [[frameworks/framework-openclaw\|OpenClaw]] | `~/.openclaw/` | Multi-agent orchestration, named assistants (casey/coach/sofie), Telegram delivery, antfarm swarm |
| [[frameworks/framework-rowboat\|Rowboat]] | `~/.rowboat/` | Meeting transcript automation, scheduled agent runs |

---

## Knowledge Infrastructure

### Obsidian Vault
**Location**: `/Users/jaywest/Documents/Obsidian Vault/`
**Contents**: 34 canonical agentic concepts (manually curated)
**Features**: autolinker script, entity-map.json, bidirectional linking
**Role**: Jay's primary curated knowledge base; the Agentic-KB is complementary (agent-maintained, richer in framework details)

### Agentic-KB (This KB)
**Location**: `/Users/jaywest/Agentic-KB/`
**Contents**: 10 framework pages, 8 entity pages, 8 recipe pages, 2 evaluation pages (and growing)
**Role**: LLM-maintained (agents write and maintain it), optimized for agent context injection
**Schema**: CLAUDE.md defines the full schema, workflows, and linking conventions

### My LLM Wiki Harness
**Location**: `/Users/jaywest/My LLM Wiki/`
**Structure**:
- `packages/cli` — Terminal CLI for querying the KB
- `packages/mcp` — MCP server exposing the KB as tools (`search_wiki`, `read_wiki_page`)
- `packages/core` — Shared ingestion/query logic
**Runtime**: TypeScript (check for `bun.lockb` or `package-lock.json`)
**Query**: `cd /Users/jaywest/My\ LLM\ Wiki && npm run query "your question"`


---

## Active Projects (Known)

| Project | Domain | Framework |
|---------|--------|-----------|
| SellerFi | Fintech (seller financing) | BMAD (client) |
| MissionControl | Internal ops platform | GSD |
| Twinz | Unknown (possibly digital twin) | Unknown |
| AMS/ARM | Asset management system | BMAD |
| clawd | Claude-based tool/assistant (possibly OpenClaw parent) | Unknown |
| conductor | Orchestration layer or API gateway | Unknown |

---

## Key Architectural Decisions

1. **TypeScript-first**: Jay's stack is TypeScript everywhere; Python frameworks (LangGraph, AutoGen, CrewAI) are non-primary
2. **Claude Code as primary runtime**: the CLI + filesystem model beats IDE integrations for complex agentic work
3. **File-based wiki over vector DB**: transparent, version-controllable, no retrieval errors (Karpathy pattern)
4. **Four-framework decision tree**: GSD/Superpowers/BMAD/gstack for different contexts prevents framework lock-in
5. **Hooks over prompt instructions**: `exit 2` hooks enforce invariants more reliably than prompt discipline alone
6. **Model tiering**: Opus for architecture, Sonnet for orchestration, Haiku for leaf tasks — cost control without quality sacrifice
7. **Written artifacts as institutional memory**: all frameworks produce Markdown that feeds downstream roles; gstack enforces this most strictly

---

## Integration Points

- **[[frameworks/framework-claude-code]]**: Primary runtime
- **[[frameworks/framework-gsd]]**: Default development framework
- **[[frameworks/framework-superpowers]]**: High-stakes feature framework
- **[[frameworks/framework-bmad]]**: Enterprise/client framework
- **[[frameworks/framework-gstack]]**: Design-first sprint framework (Garry Tan / YC)
- **[[frameworks/framework-openclaw]]**: Secondary runtime (multi-agent, Telegram)
- **[[frameworks/framework-rowboat]]**: Meeting automation runtime
- **[[entities/anthropic]]**: Primary model vendor
- **[[entities/andrej-karpathy]]**: Inspiration for KB architecture pattern
- **[[entities/mcp-ecosystem]]**: MCP servers integrated into Claude Code
- **[[entities/garry-tan]]**: gstack author (YC President & CEO)

---

## Sources

- `~/.claude/settings.json` (direct inspection)
- `~/.claude/CLAUDE.md` (global instructions)
- `~/.claude/agents/` (34 agent definitions)
- `~/.claude/skills/` (skill directory)
- `~/.claude/hooks/` (hook implementations)
- `~/.openclaw/` (OpenClaw structure)
- `~/.rowboat/` (Rowboat structure)
- https://github.com/garrytan/gstack (gstack framework, inspected 2026-04-07)
