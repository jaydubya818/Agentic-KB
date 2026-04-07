---
title: Jay West — Agent Stack
type: entity
category: person
tags: [jay-west, claude-code, gsd, superpowers, bmad, agentic, personal-stack]
created: 2026-04-04
updated: 2026-04-04
---

## Overview

Jay West is an expert AI builder and multi-agent architect. This page documents his complete agentic engineering stack as of April 2026, derived from direct inspection of his system. Jay's stack is notable for its depth: 34 custom agents, 29+ skills, a structured hook system, multiple agent runtimes, an Obsidian vault with 34 canonical concepts, a TypeScript LLM Wiki harness, and three primary frameworks (GSD, Superpowers, BMAD) with a clear decision framework for when to use each.

---

## Primary Runtime: Claude Code

**Primary tool**: Claude Code CLI (Anthropic)
**Default model**: `claude-sonnet-4-6` (Sonnet-class)
**Model in settings**: `"model": "opusplan"` — likely a model plan alias; effective tier is Sonnet for most work, Opus for heavy reasoning

Claude Code is Jay's primary development environment — not just an assistant but an autonomous agent runtime with hooks, sub-agents, MCP servers, and skills. See [[frameworks/framework-claude-code]].

---

## Framework Stack

Jay uses three primary frameworks with a structured decision tree:

| Framework | Version | Use Case | Jay Experience |
|-----------|---------|----------|---------------|
| [[frameworks/framework-gsd\|GSD]] | 1.28.0 | Experimental MVPs, evolving requirements | Extensive |
| [[frameworks/framework-superpowers\|Superpowers]] | 5.0.6 | High-stakes features (auth, payments, agents) | Extensive |
| [[frameworks/framework-bmad\|BMAD]] | current | Spec-locked enterprise/client builds | Extensive |

### Framework Selection Rules
```
Experimental MVP or shifting requirements → GSD
Auth / payments / costly mistakes → Superpowers
Locked spec / client deliverable → BMAD
Solo fix <3 files → Direct Claude (no framework)

Hybrid (recommended for large apps):
1. GSD: build the working MVP
2. Superpowers: harden auth/payments/agentic components
3. BMAD: add spec-locked modules
```

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

### Specialist Skills
| Skill | Purpose |
|-------|---------|
| `graphify` | Generate knowledge graph visualization from wiki index |
| `ralph` | Unknown — personal skill |
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
| `gstack` | Headless browser QA (via OpenClaw) |
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
4. **Three-framework decision tree**: GSD/Superpowers/BMAD for different contexts prevents framework lock-in
5. **Hooks over prompt instructions**: `exit 2` hooks enforce invariants more reliably than prompt discipline alone
6. **Model tiering**: Opus for architecture, Sonnet for orchestration, Haiku for leaf tasks — cost control without quality sacrifice

---

## Integration Points

- **[[frameworks/framework-claude-code]]**: Primary runtime
- **[[frameworks/framework-gsd]]**: Default development framework
- **[[frameworks/framework-superpowers]]**: High-stakes feature framework
- **[[frameworks/framework-bmad]]**: Enterprise/client framework
- **[[frameworks/framework-openclaw]]**: Secondary runtime (multi-agent, Telegram)
- **[[frameworks/framework-rowboat]]**: Meeting automation runtime
- **[[entities/anthropic]]**: Primary model vendor
- **[[entities/andrej-karpathy]]**: Inspiration for KB architecture pattern
- **[[entities/mcp-ecosystem]]**: MCP servers integrated into Claude Code

---

## Sources

- `~/.claude/settings.json` (direct inspection)
- `~/.claude/CLAUDE.md` (global instructions)
- `~/.claude/agents/` (34 agent definitions)
- `~/.claude/skills/` (skill directory)
- `~/.claude/hooks/` (hook implementations)
- `~/.openclaw/` (OpenClaw structure)
- `~/.rowboat/` (Rowboat structure)
