---
title: Application Flow — MissionControl
type: canonical
repo_name: mission-control
doc_type: app_flow
tags: [canonical, mission-control]
status: draft
created: 2026-04-09
updated: 2026-04-09
---

# MissionControl — Application Flow

## Task Execution Flow

```
User submits task:
  {
    "task": "Analyze image from camera",
    "priority": "high",
    "timeout": 30
  }

MissionControl:
  1. Enqueue task
  2. Find best Pi worker (least loaded, healthy)
  3. Send task to Pi worker
  4. Monitor execution (health checks, timeouts)
  5. Collect result
  6. Update dashboard
  7. Return to user

Result:
  {
    "status": "success",
    "result": "Image contains...",
    "latency_ms": 850,
    "worker_id": "pi-1-kitchen"
  }
```

## Supervisor-Worker Pattern

```
Supervisor (Cloud or Local):
  - Receives tasks
  - Maintains worker registry
  - Assigns work based on load
  - Monitors health

Worker (Pi):
  - Registers with supervisor
  - Receives task assignment
  - Executes locally
  - Reports result + health
  - Handles disconnection gracefully
```

## Health Check Cycle

```
Every 5 seconds:
  Supervisor pings all workers
  
Worker response:
  {
    "healthy": true,
    "cpu_usage": 45,
    "memory_usage_mb": 1200,
    "queue_depth": 0,
    "uptime_seconds": 3600
  }

Supervisor action:
  - Update health status
  - Mark unhealthy if no response (2 pings)
  - Remove from rotation if unhealthy
  - Alert dashboard
```

## Load Balancing

```
Task arrives:
  1. Check all workers for capacity
  2. Score by:
     - Current load (CPU, memory)
     - Queue depth
     - Response time (recent average)
  3. Assign to least-loaded worker
  4. If all overloaded: Queue locally, retry
```

See canonical/TECH_STACK.md and IMPLEMENTATION_PLAN.md for details.
