---
title: MissionControl — Repo Home
type: repo-home
repo_name: mission-control
tags: [repo, mission-control]
created: 2026-04-09
updated: 2026-04-09
status: active
---

# MissionControl

## Purpose

MissionControl is a multi-agent orchestration and mission planning interface. It coordinates distributed agent networks (cloud supervisors, Pi edge workers), manages task assignment and execution, monitors agent health, and provides centralized dashboards for observability. It consumes orchestration patterns from [[agentic-kb/home|Agentic-KB]] and coordinates deployment via [[agentic-pi-harness/home|Agentic-Pi-Harness]].

## Current Status

- **Supervisor agents**: Implemented [[pattern-supervisor-worker]] pattern for task distribution
- **Fleet management**: Tracks 5+ Pi devices, load balancing by resource availability
- **Dashboard**: Real-time agent health, task queue, latency metrics
- **Integration**: [[mcp-ecosystem]] server for pattern queries; bidirectional with Pi harness

## Canonical Docs

| Document | Status | Last Updated |
|----------|--------|--------------|
| [[canonical/PRD|Product Requirements]] | draft | 2026-04-09 |
| [[canonical/APP_FLOW|Application Flow]] | draft | 2026-04-09 |
| [[canonical/TECH_STACK|Tech Stack]] | current | 2026-04-09 |
| [[canonical/IMPLEMENTATION_PLAN|Implementation Plan]] | draft | 2026-04-09 |

## Recent Tasks

1. **[[pattern-supervisor-worker]] pattern validation** (2026-04-08): Tested task distribution across Pi fleet
2. **Health monitoring** (2026-04-07): Added periodic health checks for all connected agents
3. **Dashboard updates** (2026-04-06): Real-time metrics display (latency, queue depth, success rate)
4. **Load balancing** (2026-04-05): Implemented round-robin task assignment with capacity awareness

## Related Repos

- [[agentic-kb/home|Agentic-KB]] — source of orchestration patterns
- [[agentic-pi-harness/home|Agentic-Pi-Harness]] — worker agents this coordinates
- [[pi/home|Pi]] — infrastructure foundation

## Sync Status

| Component | Status | Last Sync |
|-----------|--------|-----------|
| Pattern library | current | 2026-04-09 |
| Agent definitions | current | 2026-04-09 |
| Dashboard | current | 2026-04-08 |

**Next Sync**: 2026-04-16
