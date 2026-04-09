---
title: Agentic-KB — Repo Home
type: repo-home
repo_name: agentic-kb
tags: [repo, agentic-kb]
created: 2026-04-09
updated: 2026-04-09
status: active
---

# Agentic-KB

## Purpose

Agentic-KB is a persistent, compounding knowledge base for agentic AI engineering. It serves as Jay West's organizational brain and institutional memory for multi-agent architecture, orchestration patterns, frameworks, prompt engineering, safety, evaluation, production deployment, and validated personal patterns.

The system implements agentic patterns within itself—parallel agents for seeding, fan-out ingestion, and reflection-based linting. It powers the LLMwiki compilation system, MCP server for agent tooling, and CLI query interface.

## Current Status

- **Core wiki**: 47 concept, pattern, framework, and synthesis pages
- **Raw imports**: Papers, transcripts, framework docs, code examples, conversations ingested
- **Hot cache**: ≤500 words of most-frequently-used patterns maintained
- **Lint cycle**: Monthly health checks running; no critical issues
- **Sync**: All repos properly linked; bidirectional cross-references active

## Canonical Docs

| Document | Status | Last Updated |
|----------|--------|--------------|
| [[canonical/PRD|Product Requirements]] | stable | 2026-04-09 |
| [[canonical/APP_FLOW|Application Flow]] | stable | 2026-04-09 |
| [[canonical/TECH_STACK|Tech Stack]] | current | 2026-04-09 |
| [[canonical/IMPLEMENTATION_PLAN|Implementation Plan]] | active | 2026-04-09 |

## Imported Docs

### Raw Sources
- **Papers**: 8 academic papers on agentic systems, multiagent orchestration, safety
- **Transcripts**: 5 video/podcast transcripts (Karpathy, Andrej's language models, agentic architecture talks)
- **Framework Docs**: LangGraph, AutoGen, CrewAI, Claude Code, OpenClaw documentation snapshots
- **Code Examples**: Annotated pattern implementations (supervisor-worker, fan-out, reflection loops)
- **Conversations**: 12 notable Claude Code sessions with complex agentic problems

### Imported Pages
- **Concepts**: agent loop, context window, tool use, state management, orchestration, memory architectures
- **Patterns**: supervisor-worker, fan-out-worker, reflection loop, retrieval-augmented execution
- **Frameworks**: LangGraph, AutoGen, CrewAI, Claude Code, MCP, OpenClaw
- **Entities**: Anthropic, OpenAI, researchers (Karpathy, Ng, others), tools and companies

## Recent Tasks

1. **Lint pass** (2026-04-08): Identified 3 orphan pages, flagged 2 framework docs for update (>60 days)
2. **Hot cache refresh** (2026-04-07): Promoted supervisor-worker pattern, reflection loops, memory architectures
3. **Cross-linking** (2026-04-06): Ensured all concept pages link to relevant patterns and recipes
4. **Framework sync** (2026-04-05): Updated LangGraph and AutoGen pages with latest version notes

## Recent Discoveries

- **Memory architecture tension**: Trade-off between ephemeral context (speed) vs persistent memory (recall). Created synthesis page comparing approaches.
- **Safety in agentic loops**: New pattern emerging around human-in-the-loop checkpoints. Needs recipe validation.
- **Framework convergence**: LangGraph, AutoGen, and CrewAI converging on similar orchestration primitives. Opportunity for unified abstraction page.

## Related Repos

- [[agentic-pi-harness/home|Agentic-Pi-Harness]] — runs this KB's patterns on edge hardware
- [[mission-control/home|MissionControl]] — consumes this KB's orchestration patterns
- [[llmwiki/home|LLMwiki]] — CLI/web query interface backed by this KB

## Sync Status

| Component | Status | Last Sync |
|-----------|--------|-----------|
| Raw documents | synced | 2026-04-09 |
| Wiki pages | current | 2026-04-09 |
| Agent definitions | current | 2026-04-09 |
| Index | up-to-date | 2026-04-09 |
| Hot cache | fresh | 2026-04-07 |

All bidirectional links validated. No broken references detected.

**Next Sync**: 2026-04-16 (weekly)
