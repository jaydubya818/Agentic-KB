---
title: Tool Use MoC
type: moc
tags: [tool-use, mcp, agentic, moc]
created: 2026-04-10
updated: 2026-04-10
---

# Tool Use — Map of Content
> Navigation hub for tool design, [[mcp-ecosystem]] integration, permissions, and verification patterns.

---

## Core Concepts

- [[concepts/tool-use]] — How agents select, call, and handle results from tools; function calling, [[mcp-ecosystem]], native tools
- [[concepts/permission-modes]] — Tool and action permissions for agents; [[framework-claude-code]] permission tiers, allow/deny lists
- [[concepts/human-in-the-loop]] — Approval gates for destructive or irreversible tool calls
- [[concepts/guardrails]] — Hard and soft constraints on which tools agents can invoke
- [[concepts/agent-failure-modes]] — Tool-related failure modes: hallucinated calls, silent failures, retries

---

## Patterns

- [[patterns/pattern-two-step-ingest]] — Pattern for separating tool-calling (analysis) from generation; reduces hallucinated tool use

---

## Frameworks & Protocols

- [[frameworks/framework-mcp]] — [[mcp-ecosystem]]: the standard for exposing tools to LLMs; JSON-RPC, tool schemas, server lifecycle
- [[frameworks/framework-claude-code]] — [[framework-claude-code]] native tools: Bash, Read, Write, Edit, Glob, Grep, Agent; permission system
- [[frameworks/framework-claude-api]] — Claude API tool_use blocks; streaming, parallel tool calls, tool_result handling
- [[frameworks/framework-gsd]] — GSD tool conventions: atomic commits, TDD-first, verification before completion
- [[frameworks/framework-markitdown]] — Tool for converting files to markdown; integrates into raw/ ingest pipeline

---

## [[mcp-ecosystem]] Ecosystem

- [[entities/mcp-ecosystem]] — [[mcp-ecosystem]] server catalog: Figma, Context7, Exa, Firecrawl, Oh My Mermaid, custom servers

---

## Recipes

- [[recipes/recipe-mcp-server]] — Write and register a custom [[mcp-ecosystem]] server in TypeScript
- [[recipes/recipe-build-tool-agent]] — Build a Claude agent with custom tools from scratch
- [[recipes/recipe-claude-code-hooks]] — [[framework-claude-code]] hooks for automation around tool calls

---

## System Policies

- [[system/policies/tier-loading-policy]] — Which memory tiers load per agent tier; RBAC for tool access
- [[system/policies/promotion-rules]] — Governance for promoting tool-discovered knowledge

---

## Key Summaries

- [[summaries/siagian-agentic-engineer-roadmap-2026]] — Tool section: agent-friendly tool design, allowlist+sandbox, error handling, versioning, observability signals

## Related Concepts

- [[concepts/sandboxed-execution]] — Running tool calls in sandboxed environments
- [[concepts/observability]] — Tracing and logging tool call sequences
