---
title: Tier Read-Leak Audit — 2026-04-25
type: report
date: 2026-04-25
findings: 3
---

# Tier Read-Leak Audit — 2026-04-25

Scanned 4 contracts.
Findings: **3**.

## Leaks

| Agent | Tier | Leaked Path | Class | Rule |
|-------|------|-------------|-------|------|
| gsd-executor | worker | `wiki/agents/leads/planning-agent/domain-standards.md` | learned | `^wiki\/agents\/leads\/` |
| gsd-executor | worker | `wiki/agents/leads/planning-agent/gotchas.md` | learned | `^wiki\/agents\/leads\/` |
| sofie | lead | `wiki/agents/orchestrators/architecture-agent/gotchas.md` | learned | `^wiki\/agents\/orchestrators\/` |
