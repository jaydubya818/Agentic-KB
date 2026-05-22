---
title: "Recipe: Production Deployment of an Agent System"
type: recipe
difficulty: advanced
time_estimate: 8-16h
prerequisites:
  - Docker and Docker Compose installed
  - Agent system functional locally (single-container or local process)
  - PostgreSQL or Supabase instance available
  - Vector store selected (ChromaDB for local, Weaviate or Qdrant for production)
  - Domain and SSL certificate (for HTTPS)
  - Prometheus + Grafana or equivalent observability stack
tested: false
tags: [deployment, agentic, observability, orchestration, multi-agent, state-management]
reviewed: false
reviewed_date: ""
---

# Recipe: Production Deployment of an Agent System

Deploy an agent system to production with FastAPI orchestrator, Redis async queue, PostgreSQL state, vector store, and Prometheus/Grafana observability. This is the infrastructure side — the eval gate that sits in front of this is [[recipes/recipe-agent-cicd]].

## Goal

A production-grade agent system with: (1) async request handling via a queue so slow agent runs don't block the API; (2) session state persistence so agents can be interrupted and resumed; (3) vector store for RAG retrieval with [[concepts/metadata-filtering]]; (4) observability so you know when the system is failing before users do.

## Prerequisites

- Working agent logic containerizable as a Python service
- `requirements.txt` or `pyproject.toml` with pinned dependencies
- Environment variables externalized (no hardcoded secrets — see [[rules/security.md]])
- Basic understanding of Docker Compose and Kubernetes concepts

## Service Topology

```
                                  ┌─────────────────┐
User / UI ──── HTTPS ────────────▶│  FastAPI (8000)  │
                                  │  Orchestrator   │
                                  └────────┬────────┘
                                           │ enqueue
                                  ┌────────▼────────┐
                                  │  Redis (6379)   │
                                  │  Queue + Cache  │
                                  └────────┬────────┘
                                           │ dequeue
                                  ┌────────▼────────┐
                                  │  Agent Worker   │
                                  │  (celery/arq)   │
                                  └────┬────────┬───┘
                                       │        │
                          ┌────────────▼─┐  ┌───▼──────────┐
                          │  PostgreSQL  │  │  Vector Store │
                          │  (state/mem) │  │  (Weaviate/   │
                          └─────────────┘  │   Qdrant)     │
                                           └───────────────┘
                                  ┌─────────────────┐
Agent Worker ─── metrics ────────▶│  Prometheus     │
                                  │  + Grafana      │
                                  └─────────────────┘
```

## Steps

### 1. Containerize the agent service

```dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY prompts/ ./prompts/

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Define the FastAPI orchestrator

```python
# src/api/main.py
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from src.auth import get_current_user, AuthenticatedUser
from src.queue import enqueue_agent_task, get_task_status
from src.models import AgentRequest, AgentResponse, TaskStatus
import time, uuid

app = FastAPI(title="Agent Orchestrator")

app.add_middleware(CORSMiddleware, allow_origins=["https://yourdomain.com"])

@app.post("/agent/run", response_model=AgentResponse)
async def run_agent(
    request: AgentRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        await enqueue_agent_task(task_id, request, user)
        return AgentResponse(task_id=task_id, status="queued")
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e), "code": "QUEUE_ERROR"})
    finally:
        duration_ms = (time.time() - start) * 1000
        # log: task_id, duration_ms, user.tenant_id, status

@app.get("/agent/status/{task_id}", response_model=TaskStatus)
async def get_status(task_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    status = await get_task_status(task_id, user.tenant_id)
    if not status:
        raise HTTPException(status_code=404, detail={"error": "Task not found", "code": "NOT_FOUND"})
    return status

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": time.time()}
```

### 3. Docker Compose for local production simulation

```yaml
# docker-compose.yml
version: "3.9"

services:
  api:
    build: .
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - VECTOR_STORE_URL=${VECTOR_STORE_URL}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    depends_on: [redis, postgres]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  worker:
    build: .
    command: arq src.worker.WorkerSettings
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - VECTOR_STORE_URL=${VECTOR_STORE_URL}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    depends_on: [redis, postgres]
    deploy:
      replicas: 2  # scale workers independently

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: agentdb
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports: ["5432:5432"]

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    ports: ["9090:9090"]

  grafana:
    image: grafana/grafana:latest
    ports: ["3000:3000"]
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  postgres_data:
  grafana_data:
```

### 4. Instrument with Prometheus metrics

```python
# src/metrics.py
from prometheus_client import Counter, Histogram, Gauge

agent_requests_total = Counter(
    "agent_requests_total", 
    "Total agent requests", 
    ["tenant_id", "status"]
)
agent_latency_seconds = Histogram(
    "agent_latency_seconds",
    "Agent task duration",
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0]
)
agent_queue_depth = Gauge(
    "agent_queue_depth", 
    "Current queue depth"
)
# Expose via /metrics endpoint (add to FastAPI)
```

**SLO targets:**
- API P95 < 200ms (enqueue + response)
- Agent task P95 < 30s (varies by task complexity)
- Queue depth alert: > 100 tasks for > 5 minutes

### 5. State persistence schema

```sql
-- migrations/001_agent_state.sql
CREATE TABLE agent_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    task_id UUID NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'queued',  -- queued | running | completed | failed
    input JSONB NOT NULL,
    output JSONB,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_sessions_tenant ON agent_sessions(tenant_id);
CREATE INDEX idx_sessions_task ON agent_sessions(task_id);
CREATE INDEX idx_sessions_status ON agent_sessions(status) WHERE status IN ('queued', 'running');
```

### 6. Secret management

Use environment variables injected at runtime — never baked into the image:

```bash
# .env (gitignored)
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://user:pass@postgres:5432/agentdb
REDIS_URL=redis://redis:6379
POSTGRES_USER=agentuser
POSTGRES_PASSWORD=<generated>
GRAFANA_PASSWORD=<generated>
```

For Kubernetes: use Kubernetes Secrets or an external secrets manager (AWS Secrets Manager, HashiCorp Vault). Never use ConfigMaps for sensitive values.

### 7. Rollback procedure

```bash
# Tag each deploy with the git SHA
docker tag agent-service:latest agent-service:$(git rev-parse --short HEAD)

# Rollback: redeploy previous SHA
./scripts/deploy.sh production <previous-sha>

# Verify health
curl https://yourdomain.com/health
```

## Verification

A healthy production deployment shows:
- `/health` returns `{"status": "ok"}` within 100ms
- Prometheus scrapes `/metrics` successfully
- Grafana dashboard shows queue depth < 10, API P95 < 200ms
- A test agent task completes end-to-end within expected time budget
- PostgreSQL shows task record with `status: completed` after a test run

## Common Failures & Fixes

**Workers can't connect to Redis:** Check `REDIS_URL` env var. Redis service must be healthy before workers start (`depends_on` with health checks). Run `redis-cli ping` from inside the worker container.

**Queue depth grows unbounded:** Workers are processing slower than requests arrive. Scale worker replicas (Docker: `replicas: N`; Kubernetes: adjust HPA). Add queue depth alerting at depth > 50.

**Agent tasks timeout in worker:** The agent run is hitting a tool timeout or model API latency spike. Add per-tool timeout wrappers. Implement exponential backoff on model API calls. Set worker task timeout to 120s and return a `timeout` error status to the client.

## Next Steps

- Wire the [[recipes/recipe-agent-cicd]] pipeline to deploy to this infrastructure on merge
- Add [[concepts/observability]] tracing with OpenTelemetry for distributed trace correlation between API and worker
- Implement autoscaling: Kubernetes HPA on queue depth metric via KEDA

## Related Recipes

- [[recipes/recipe-agent-cicd]] — CI/CD pipeline that gates deploys to this system on metric regression
- [[recipes/recipe-agent-evaluation]] — eval harness that runs against staging before promotion to this production topology
- [[recipes/recipe-parallel-subagents]] — scaling pattern for high-throughput agent workloads on this infrastructure
