---
title: Tier Read-Leak Audit — 2026-04-26
type: report
date: 2026-04-26
findings: 0
---

# Tier Read-Leak Audit — 2026-04-26

Scanned 4 contracts.
Findings: **0**.

✓ No undeclared cross-tier reads. All workers stay in worker scope; all leads stay below orchestrator scope.

## Permitted Cross-Tier Reads (3)

Declared in each contract's `context_policy.permitted_cross_tier_reads`.

| Agent | Tier | Allowed Path | Class |
|-------|------|--------------|-------|
| gsd-executor | worker | `wiki/agents/leads/planning-agent/domain-standards.md` | learned |
| gsd-executor | worker | `wiki/agents/leads/planning-agent/gotchas.md` | learned |
| sofie | lead | `wiki/agents/orchestrators/architecture-agent/gotchas.md` | learned |
