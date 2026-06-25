---
title: "AI Engineering from Scratch"
type: summary
source_file: raw/framework-docs/rohitg00-ai-engineering-from-scratch.md
source_url: https://github.com/rohitg00/ai-engineering-from-scratch
author: Rohit Ghumare
date_published: ""
date_ingested: 2026-06-25
tags: [ai-engineering, agents, mcp, rag, curriculum, skills]
key_concepts: [artifact-based-learning, agent-workbench, mcp, rag-evaluation, production-agents]
confidence: medium
---

# AI Engineering from Scratch

## Source

- Raw source: `raw/framework-docs/rohitg00-ai-engineering-from-scratch.md`
- URL: https://github.com/rohitg00/ai-engineering-from-scratch
- Captured context: Jay flagged this as an artifact-based AI engineering curriculum and asked to mine only agent/MCP/RAG production lessons relevant to his setup.

## TL;DR

This is a large open-source curriculum organized around building artifacts: prompts, skills, agents, MCP servers, eval harnesses, RAG systems, and production infrastructure. For Agentic-KB, the high-signal parts are not the full 503-lesson curriculum; they are the Phase 13 tool/MCP lessons, Phase 14 agent engineering/workbench lessons, Phase 16 multi-agent lessons, Phase 17 production lessons, and capstone tracks around agent harnesses, RAG, eval, and safety.

## Key Points

- **Artifact-first structure:** each lesson ends with something reusable: prompt, skill, agent, or MCP server.
- **Relevant phases:**
  - Phase 13: Tools & Protocols — tool interfaces, function calling, structured output, MCP fundamentals/server/client/transports/security/gateways.
  - Phase 14: Agent Engineering — agent loop, ReWOO/plan-and-execute, Reflexion, memory, skill libraries, frameworks, observability, failure modes, verification gates, handoffs, workbench.
  - Phase 16: Multi-Agent & Swarms — supervisor/orchestrator-worker, shared memory/blackboard, communication protocols, handoffs, evaluation, failure modes.
  - Phase 17: Infrastructure & Production — inference economics, observability, gateways, deployment, SRE, security, compliance, FinOps.
  - Phase 19: Capstone Projects — terminal-native coding agent, production RAG chatbot, multi-agent software team, MCP server with registry/governance, safety gate.
- **Agent workbench pack:** the README describes scaffolding a reusable Agent Workbench pack with `AGENTS.md`, schemas, init/verify/handoff scripts, task board, and agent state.
- **Skill install model:** repo ships hundreds of generated skills/prompts installable through `npx skills add` or a Python installer.
- **Quality tooling:** `build_catalog.py`, `lesson_run.py`, and `audit_lessons.py` provide examples of catalog/build/smoke-test discipline for large skill/curriculum sets.

## KB Decision

- Summary created.
- No broad framework page created; this is a curriculum/source corpus, not a narrow framework.
- Candidate future updates: if Jay wants to build or harden an agent workbench, capture the specific Phase 14 workbench lessons instead of ingesting the whole repo README as canonical guidance.

## Jay-Relevant Takeaway

The useful signal is the artifact discipline: every learning unit should ship a reusable operational object. That maps well to Agentic-KB and Mission Control work: specs, skills, tools, eval fixtures, and governance contracts should be tangible artifacts, not just narrative docs.

## Caveats

- README is a catalog, not detailed source material for each lesson. Do not treat lesson claims as understood until the actual lesson docs are ingested.
- Skill/prompt counts and page-view stats are source-reported.

## Sources

- `raw/framework-docs/rohitg00-ai-engineering-from-scratch.md`
