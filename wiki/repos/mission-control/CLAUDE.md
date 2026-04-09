---
title: MissionControl — Agent Instructions
type: repo-claude
repo_name: mission-control
tags: [agents, mission-control]
created: 2026-04-09
updated: 2026-04-09
---

# MissionControl — Agent Instructions

Instructions for agents operating on the MissionControl orchestration system.

## Purpose

MissionControl coordinates multi-agent networks. Agents here focus on:

1. **Orchestration**: Task assignment, supervisor-worker patterns, load balancing
2. **Observability**: Health monitoring, metrics collection, dashboards
3. **Fault tolerance**: Failure detection, recovery, circuit breakers
4. **Integration**: Consume Agentic-KB patterns; coordinate Pi harness workers

## Key Integration Points

- **Agentic-KB**: Query via MCP for orchestration patterns
- **Agentic-Pi-Harness**: Send tasks to Pi workers, receive results
- **Dashboard**: Real-time display of agent health, task queues, metrics

## Standards

- **Patterns**: Supervisor-worker for task distribution
- **Metrics**: Latency (p50, p95, p99), success rate, queue depth
- **Health checks**: Periodic ping (5-second intervals)
- **Circuit breaker**: Stop sending tasks if failure rate >10%

## Success Criteria

1. Task success rate ≥ 99%
2. Task latency (median) < 500ms
3. Fleet uptime ≥ 99.5%
4. Support 20+ Pi workers in fleet
5. Dashboard reflects real-time system state
