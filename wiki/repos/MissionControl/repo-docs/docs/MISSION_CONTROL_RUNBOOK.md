---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: docs/MISSION_CONTROL_RUNBOOK.md
imported_at: "2026-04-25T16:02:21.261Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/docs/MISSION_CONTROL_RUNBOOK.md"
---

# Mission Control Runbook — Operations Guide

**Version:** 1.0  
**Date:** 2026-02-21  
**Architecture:** Convex backend (no Express), Hono orchestration server, React/Vite UI. See [Troubleshooting index](guides/TROUBLESHOOTING.md) for current-architecture-only commands.

---

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your Convex deployment

# 3. Run diagnostics
./scripts/mc-smoke.sh      # Fast health check
./scripts/mc-doctor.sh     # Deep diagnostics

# 4. Run E2E tests
./scripts/mc-seed-e2e.sh
# Copy RUN_ID from output
./scripts/mc-doctor.sh --e2e $RUN_ID
./scripts/mc-cleanup-e2e.sh $RUN_ID
```

---

## System Components

### UI (React + Vite)
- **Port:** 5173
- **Start:** `pnpm run dev:ui`
- **Health:** `curl http://localhost:5173`

### Convex Backend
- **Start:** `npx convex dev`
- **Health:** `curl $CONVEX_URL/health`
- **Dashboard:** `npx convex dashboard`

### Orchestration Server (Hono)
- **Port:** 4100 (ORCHESTRATION_PORT)
- **Start:** `pnpm run dev:orchestration`
- **Health:** `curl http://localhost:4100/health`
- **Docker:** From repo root, `docker build -f apps/orchestration-server/Dockerfile .` then run with `CONVEX_URL` and optional `GATEWAY_TOKEN`, `OPENAI_API_KEY`. Image exposes 4100 and includes HEALTHCHECK on `/health`.
- **Tier 2 classify:** `POST /classify` (auth required) — body `{ "input": "user request text" }`. Uses ContextRouter with optional OpenAI fallback when Tier 1 confidence is low. Set `OPENAI_API_KEY` for LLM classification.

**How to run (first time or after dependency changes):**
1. Set `CONVEX_URL` in `.env` at repo root or in `apps/orchestration-server` (required).
2. Build workspace packages in order:  
   `pnpm --filter @mission-control/shared build && pnpm --filter @mission-control/state-machine build && pnpm --filter @mission-control/policy-engine build && pnpm --filter @mission-control/memory build && pnpm --filter @mission-control/coordinator build && pnpm --filter @mission-control/agent-runtime build`
3. Start: `pnpm run dev:orchestration` (or `pnpm --filter @mission-control/orchestration-server dev`).  
   Alternatively run full build first: `pnpm run ci:prepare` then start.

### CLI (`mc`)
- **Location:** `scripts/mc`
- **Commands:**
  - `mc doctor` — Health check
  - `mc status` — System status
  - `mc run <workflow>` — Start workflow
  - `mc tasks [status]` — List tasks
  - `mc claim` — Claim next task

---

## Diagnostics

### Smoke Test (< 2 minutes)

```bash
./scripts/mc-smoke.sh
```

**Checks:**
- Environment variables
- Dependencies installed
- Workflow YAML validity
- Convex schema structure
- Package structure

**Exit codes:**
- 0 = All passed
- 1 = Failures found

### Doctor (Full Check)

```bash
./scripts/mc-doctor.sh
```

**Checks:**
- All smoke checks
- Convex connectivity
- Agent registry
- Task state machine
- Content drops
- Budget tracking
- Workflow engine
- Policy & governance

### E2E Validation

```bash
# Seed data
./scripts/mc-seed-e2e.sh

# Run validation
./scripts/mc-doctor.sh --e2e $RUN_ID

# Cleanup
./scripts/mc-cleanup-e2e.sh $RUN_ID
```

---

## Troubleshooting

**Canonical index:** [docs/guides/TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md) — diagnostics and common fixes for the current architecture.

### Issue: Dependencies Not Found

```bash
pnpm install
```

### Issue: Convex URL Not Configured

```bash
npx convex dev
# Copies deployment URL to .env.local
```

### Issue: TypeScript Errors

```bash
# Missing @types/node
pnpm add -D @types/node

# Or in specific package
cd packages/agent-runtime
pnpm add -D @types/node
```

### Issue: E2E Seed Fails

1. Check Convex URL: `echo $CONVEX_URL`
2. Verify deployment: `npx convex dashboard`
3. Check permissions

### Issue: Workflow YAML Invalid

```bash
# Validate single file
python3 -c "import yaml; yaml.safe_load(open('workflows/feature-dev.yaml'))"
```

---

## E2E Testing

### Full Cycle

```bash
# 1. Create seed
./scripts/mc-seed-e2e.sh
# RUN_ID=E2E_1708544400_a1b2c3d4

# 2. Validate
./scripts/mc-doctor.sh --e2e E2E_1708544400_a1b2c3d4

# 3. Cleanup
./scripts/mc-cleanup-e2e.sh E2E_1708544400_a1b2c3d4
```

### What Gets Created

| Object | Count | Prefix |
|--------|-------|--------|
| Agents | 2 | e2e_scout_, e2e_executor_ |
| Tasks | 3 | E2E inbox, content, budget |
| Content Drops | 2 | e2e-drop: |
| Budget Entries | 2 | +1.00, -0.25 |
| Workflow Run | 1 | feature-dev toy |

### Validation Checks

- ✅ Both agents retrievable
- ✅ Inbox task completes lifecycle (INBOX → DONE)
- ✅ Content drops retrievable with metadata
- ✅ Budget total = +0.75
- ✅ Workflow run exists

---

## CI/CD

### GitHub Actions

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - run: pnpm install
      - run: ./scripts/mc-smoke.sh
      - run: pnpm run typecheck
      - run: pnpm run lint
```

### Local CI Simulation

```bash
pnpm install
pnpm run ci:prepare
pnpm run ci:typecheck
pnpm run ci:test
```

---

## Workflow Reference

### Built-in Workflows

| Workflow | Agents | Purpose |
|----------|--------|---------|
| feature-dev | 7 | Plan → Setup → Implement → Verify → Test → PR → Review |
| bug-fix | 6 | Triage → Investigate → Setup → Fix → Verify → PR |
| security-audit | 7 | Scan → Prioritize → Setup → Fix → Verify → Test → PR |
| code-review | 4 | Intake → Review → Verify → Approve |

### Running Workflows

```bash
# Via Convex CLI
npx convex run api.workflows.run --arg '{
  "workflowId": "feature-dev",
  "input": "Add user authentication",
  "projectId": "my-project"
}'
```

---

## Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| CONVEX_URL | ✅ | — | Convex backend URL |
| VITE_CONVEX_URL | ✅ | — | Convex URL for UI |
| API_SECRET | ✅ | — | API authentication |
| API_PORT | ❌ | 3000 | Orchestration port |
| HEARTBEAT_INTERVAL_MS | ❌ | 30000 | Tick interval |
| LOG_LEVEL | ❌ | info | Logging verbosity |

---

## Costs & billing

External provider billing (Anthropic, OpenAI, Cursor, GitHub, Vercel, Perplexity, OpenRouter, etc.) requires **manual** sign-in to each dashboard. See **[docs/COSTS.md](COSTS.md)** for:

- All billing dashboard URLs
- Status: no automated checks; manual review only
- Current spending table to update after each review
- Action: review regularly for spikes and approaching limits

---

## Files Reference

| File | Purpose |
|------|---------|
| `docs/COSTS.md` | Billing dashboards (manual auth), current spending checklist |
| `docs/BOOT_CONTRACT.md` | System startup guide |
| `docs/E2E_TEST_PLAN.md` | E2E testing specification |
| `docs/INTEGRATION_REPORT.md` | Audit results |
| `scripts/mc-smoke.sh` | Fast health check |
| `scripts/mc-doctor.sh` | Deep diagnostics |
| `scripts/mc-seed-e2e.sh` | E2E seed creation |
| `scripts/mc-cleanup-e2e.sh` | E2E cleanup |
| `convex/e2e.ts` | E2E Convex mutations |

---

## Troubleshooting

### Typecheck Errors
```bash
# Regenerate Convex types
npx convex dev

# Check specific package
cd packages/shared && pnpm run build
```

### UI Not Loading
- Check Vite is running: `pnpm run dev:ui`
- Verify CONVEX_URL in .env.local
- Check browser console for errors

### Agent Not Claiming Tasks
- Check agent status is ACTIVE
- Verify heartbeat is running
- Check logs: `mc status`

### Workflow Stuck
- Check workflow run status in UI
- Review logs for errors
- Manually advance if needed via Convex dashboard

---

## Support

- **Docs:** `docs/`
- **Tests:** `convex/__tests__/`
- **Scripts:** `scripts/`
- **Repo:** https://github.com/jaydubya818/MissionControl
