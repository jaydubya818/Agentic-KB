---
title: Tech Stack — MissionControl
type: canonical
repo_name: mission-control
doc_type: tech_stack
tags: [canonical, mission-control]
status: current
created: 2026-04-09
updated: 2026-04-09
---

# MissionControl — Tech Stack

## Core Stack

- **Language**: Python 3.10+
- **Web Framework**: FastAPI (async, lightweight)
- **Message Queue**: Redis (task queue, pub/sub)
- **Metrics**: Prometheus (collection), Grafana (visualization)
- **Logging**: ELK stack (Elasticsearch, Logstash, Kibana)

## Architecture

### Supervisor (Cloud)
```
FastAPI app:
  - /tasks/submit (receive task)
  - /workers/register (worker registration)
  - /workers/health (health check endpoint)
  - /metrics (prometheus metrics)

Redis:
  - Task queue (FIFO for balance)
  - Worker registry
  - Health status cache
```

### Worker (Pi)
```
Python client:
  - Register with supervisor
  - Poll for tasks
  - Execute locally
  - Report health + result
  - Handle disconnection
```

### Dashboard
```
React app:
  - Real-time agent status
  - Task queue visualization
  - Latency graphs (p50, p95, p99)
  - Resource usage (CPU, memory per worker)
  - Alert log
```

## Deployment

```
Docker Compose:
  - supervisor service (FastAPI)
  - redis service
  - prometheus service
  - grafana service
  - elk stack (optional)

Network:
  - Supervisor on port 5000
  - Dashboard on port 3000
  - Prometheus on port 9090
```

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Task latency (p50) | <500ms | 850ms |
| Task success rate | 99%+ | 94% |
| Agent uptime | 99.5% | 98.5% |
| Dashboard refresh | <1s | <500ms |

## Scaling

- Supports 20+ Pi workers initially
- Redis can handle 10k+ tasks/second
- Horizontal scaling: Multiple supervisor instances (with etcd leader election)
