---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: docs/ARCHITECTURE.md
imported_at: "2026-04-25T16:02:21.255Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/docs/ARCHITECTURE.md"
---

# Mission Control Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER / AGENT                            │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
│   React UI   │    │   mc CLI        │    │  Telegram    │
│  (Port 5173) │    │   (scripts/mc)  │    │   Bot        │
└──────┬───────┘    └────────┬────────┘    └──────┬───────┘
       │                      │                    │
       └──────────────────────┼────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Hono Orchestration Server                  │
│                       (Port 4100)                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Coordinator │  │ Agent Runtime│  │  Memory Manager  │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
└─────────┼────────────────┼───────────────────┼─────────────┘
          │                │                   │
          └────────────────┴───────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     CONVEX BACKEND                            │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │  Tasks   │ │  Agents  │ │Workflows │ │  Approvals     │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │  Runs    │ │Activities│ │ Budget   │ │ Content Drops  │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Task Creation Flow
```
User/UI/Agent → Convex:tasks.create → Database → Real-time Update → UI
```

### 2. Workflow Execution Flow
```
User → mc run workflow → Convex:workflowRuns.create
                                    ↓
                           Orchestration Server (tick)
                                    ↓
                           Agent claims task
                                    ↓
                           Agent executes → Updates state
                                    ↓
                           Approval (if HIGH risk)
                                    ↓
                           Task completion
```

### 3. Agent Heartbeat Flow
```
Orchestration Server → tick() → Convex:agents.list
                                        ↓
                           Check stale agents
                                        ↓
                           Update statuses
                                        ↓
                           Queue new tasks
```

## Package Structure

```
packages/
├── shared/           # Types, constants, logger, retry utils
├── state-machine/    # Task state transitions
├── policy-engine/    # Risk classification, approvals
├── coordinator/      # Task routing, delegation
├── agent-runtime/    # Agent lifecycle management
├── memory/           # Context persistence
├── workflow-engine/  # YAML workflow execution
└── telegram-bot/     # Telegram integration

apps/
├── mission-control-ui/      # React frontend
└── orchestration-server/    # Hono backend
```

## Key Design Decisions

1. **Convex as Source of Truth**
   - All state stored in Convex
   - Real-time subscriptions to UI
   - Atomic transactions for consistency

2. **Filesystem-based Coordination**
   - Agents communicate via shared files
   - No direct agent-to-agent messaging
   - Prevents circular dependencies

3. **Workflow-driven Execution**
   - YAML-defined workflows
   - Deterministic step execution
   - Automatic retry with backoff

4. **Risk-based Approvals**
   - LOW risk: Auto-approved
   - HIGH risk: Requires human approval
   - RED risk: Dual control required

## Scaling Considerations

- **Horizontal:** Multiple orchestration server instances
- **Database:** Convex handles sharding
- **Agents:** Stateless, can run anywhere
- **Workflows:** Parallel step execution possible
