---
id: 01KNNVX2QNR2RS6XJ1XA7ARBMH
title: Anthropic
type: entity
category: company
tags: [anthropic, claude, claude-api, claude-code, mcp, constitutional-ai, safety]
created: 2026-04-04
updated: 2026-04-04
---

## Overview

[[anthropic]] is an AI safety company founded in 2021 by former [[openai]] researchers Dario Amodei (CEO), Daniela Amodei (President), and others. Its primary product is the Claude family of language models. Anthropic's strategic differentiation from OpenAI is an explicit safety-first research mandate — Constitutional AI, the Responsible Scaling Policy, and interpretability research are central to its identity, not marketing.

Anthropic is the vendor behind Jay's primary toolchain: [[frameworks/framework-claude-api]], [[frameworks/framework-claude-code]], and [[frameworks/framework-mcp]].

---

## Claude Model Family (April 2026)

| Model | Tier | Best For | Context | Cost |
|-------|------|----------|---------|------|
| `claude-opus-4-6` | Flagship | Complex reasoning, architecture, security audits, extended thinking | 200K | High |
| `claude-sonnet-4-6` | Standard | Production default, best cost/quality balance, orchestration | 200K | Medium |
| `claude-haiku-4-5-20251001` | Fast/cheap | Leaf tasks, classification, boilerplate, grep analysis | 200K | Low |

**Jay's model selection rule**: Opus for architecture + security review, Sonnet for everything else in the orchestration layer, Haiku for leaf tasks in sub-agent pipelines.

### Model Naming Convention
`claude-{family}-{version}-{date}` — date-versioned models are stable snapshots. Undated aliases (e.g., `claude-sonnet-4-6`) point to the latest stable version within that tier and may change. Use dated versions in production for reproducibility.

### Extended Thinking (Opus 4.6)
Unique to Opus: explicit reasoning traces via `thinking` content blocks. Set `thinking: { type: "enabled", budget_tokens: N }` in the request. Model emits `thinking` blocks before response. Best for: multi-step math, architecture decisions, security analysis, complex code reasoning. Cap budget at 10,000 tokens for most tasks; diminishing returns above that.

---

## Products and APIs

### Claude API
Direct REST + SDK access to Claude models. See [[frameworks/framework-claude-api]] for full coverage. Key capabilities:
- Tool use (function calling) with JSON Schema definitions
- Streaming (SSE + text deltas)
- Batch API (async, 50% cost reduction, 24h SLA)
- Prompt caching (ephemeral cache on system prompts, ~90% cost reduction on long system prompts)
- 200K context window across all tiers

### [[framework-claude-code]]
Anthropic's official CLI for Claude — an agentic coding assistant and multi-agent runtime. See [[frameworks/framework-claude-code]] for full coverage. Key capabilities: Agent tool for sub-agent spawning, hooks system, [[mcp-ecosystem]] hosting, skills/slash commands, CLAUDE.md instruction layer.

### [[mcp-ecosystem]] (MCP)
Open protocol published by Anthropic for standardizing agent-to-tool connectivity. See [[frameworks/framework-mcp]]. MCP enables any MCP-compatible host to use tools from any MCP server without custom integration per-pair.

### Claude.ai
Consumer and Teams web interface. Includes MCP integration (Figma MCP for design-to-code, Google Drive, etc.). Not directly part of Jay's developer workflow but relevant for design collaboration (Figma MCP via claude.ai).

---

## Safety Research

### Constitutional AI (CAI)
Anthropic's technique for training AI systems to be helpful, harmless, and honest using a set of constitutional principles. The model critiques and revises its own outputs against the constitution. Published as a research paper; the principles inform Claude's base behavior.

### Responsible Scaling Policy (RSP)
A pre-commitment framework: Anthropic defines AI Safety Levels (ASL-1 through ASL-4+) and commits to specific safety measures required before deploying models at each level. RSP is Anthropic's answer to "how do you prevent your own models from causing catastrophic harm?"

### Interpretability Research
Anthropic's team (led by Chris Olah) works on mechanistic interpretability — understanding what's happening inside neural networks. Key work: circuits research, features as superposition, monosemanticity. This is basic science, not product — but it informs safety decisions.

---

## Key People

| Person | Role | Notable Work |
|--------|------|-------------|
| Dario Amodei | CEO & Co-founder | Former VP Research at OpenAI; published GPT-2, GPT-3 |
| Daniela Amodei | President & Co-founder | Operations, policy, go-to-market |
| Amanda Askell | Researcher | Claude's character and values; RLHF research |
| Chris Olah | Interpretability Researcher | Circuits (transformer internals), feature visualization, monosemanticity |
| Jared Kaplan | Researcher | Scaling laws (Kaplan et al.) — foundational work on LLM scaling |
| Tom Brown | Researcher | GPT-3 lead at OpenAI; now at Anthropic |

---

## Competitive Position (April 2026)

| Dimension | Anthropic | OpenAI |
|-----------|-----------|--------|
| Flagship model | claude-opus-4-6 | GPT-4o / o4 |
| Safety emphasis | Constitutional AI, RSP | Safety board (complicated history) |
| Extended reasoning | Extended thinking (Opus) | o3/o4 reasoning models |
| Coding assistant | Claude Code (CLI) | Codex / GPT in IDEs |
| Tool protocol | MCP (open standard) | Function calling (proprietary format) |
| Context window | 200K | 128K (GPT-4o) / 200K (some) |
| Developer experience | Claude Code + MCP | Assistants API + function calling |

Anthropic's primary advantages: larger effective context window, extended thinking, Constitutional AI safety properties, and Claude Code as a first-class agentic development environment. OpenAI's advantages: larger ecosystem, more third-party integrations, DALL-E/Whisper/Realtime API for multimodal.

---

## Integration Points

- **[[frameworks/framework-claude-api]]**: the core API Jay builds on
- **[[frameworks/framework-claude-code]]**: Jay's primary development environment
- **[[frameworks/framework-mcp]]**: Anthropic-published open protocol
- **[[entities/model-landscape]]**: full model comparison including Anthropic, OpenAI, Google
- **[[entities/openai]]**: primary competitor; complementary in some areas (multimodal)

---

## Sources

- Anthropic website and API documentation (knowledge cutoff — verify current)
- Jay's `~/.claude/CLAUDE.md` (model selection heuristics)
- Jay's `~/.claude/settings.json` (actual model config)
- [[entities/model-landscape]]
