---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: SKILL.md
imported_at: "2026-04-25T16:02:21.252Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/SKILL.md"
---

# Mission Control — Agent Integration Skill

This skill teaches agents how to interact with Mission Control, the orchestration and observability control plane. All interactions use **Convex** mutations and queries — there is no REST API.

## Architecture

- **Database:** Convex (serverless, real-time)
- **Functions:** Convex queries (read-only), mutations (writes), actions (external APIs)
- **Real-time:** All data changes are automatically pushed to connected clients

## 1. Register Yourself

Before doing anything, register with Mission Control. If you're already registered, this updates your heartbeat.

```
Mutation: api.agents.register
Args:
  name: string          — Your unique agent name (e.g., "Coder")
  emoji: string         — Your emoji identifier (e.g., "💻")
  role: string          — One of: "INTERN", "SPECIALIST", "LEAD", "CEO"
  workspacePath: string — Your workspace directory
  projectId?: Id        — Project you belong to (optional)
  allowedTaskTypes?: string[] — Task types you handle:
    "CONTENT", "SOCIAL", "EMAIL_MARKETING", "CUSTOMER_RESEARCH",
    "SEO_RESEARCH", "ENGINEERING", "DOCS", "OPS"
  budgetDaily?: number  — Daily spend limit in USD
  budgetPerRun?: number — Per-run spend limit in USD
  canSpawn?: boolean    — Whether you can create sub-agents
  maxSubAgents?: number — Max sub-agents you can spawn

Returns: { agent: Agent, created: boolean }
```

## 2. Send Heartbeats

Call this regularly (every 30-60 seconds) to stay alive. Agents that miss heartbeats for 2 minutes get quarantined.

```
Mutation: api.agents.heartbeat
Args:
  agentId: Id<"agents">
  currentTaskId?: Id<"tasks">         — Task you're currently working on
  spendSinceLastHeartbeat?: number    — USD spent since last heartbeat
  soulVersionHash?: string            — Your current soul/config hash
  status?: string                     — Your status if changed
  errorMessage?: string               — Report errors (3 in a row = quarantine warning)

Returns:
  success: boolean
  budgetRemaining: number
  budgetExceeded: boolean
  pendingTasks: Task[]       — Tasks assigned to you
  claimableTasks: Task[]     — INBOX tasks matching your types
  pendingApprovals: Approval[]
  pendingNotifications: Notification[]
```

## 3. Claim and Work on Tasks

### Find available tasks

```
Query: api.tasks.listByStatus
Args: { status: "INBOX", projectId?: Id }
— Filter results by your allowedTaskTypes
```

### Assign yourself to a task

```
Mutation: api.tasks.assign
Args:
  taskId: Id<"tasks">
  assigneeIds: [yourAgentId]
```

### Transition task through states

```
Mutation: api.tasks.transition
Args:
  taskId: Id<"tasks">
  toStatus: string    — Target status
  actorType: "AGENT"
  actorAgentId: Id<"agents">
  idempotencyKey: string   — Unique key to prevent duplicates
  reason?: string
```

**State machine flow:**
INBOX → ASSIGNED → IN_PROGRESS → REVIEW → DONE

Other states: NEEDS_APPROVAL, BLOCKED, FAILED, CANCELED

### Create a new task

```
Mutation: api.tasks.create
Args:
  title: string
  type: "CONTENT" | "SOCIAL" | "EMAIL_MARKETING" | "CUSTOMER_RESEARCH" |
        "SEO_RESEARCH" | "ENGINEERING" | "DOCS" | "OPS"
  priority: 1 (critical) | 2 (high) | 3 (normal) | 4 (low)
  description?: string
  projectId?: Id<"projects">
  creatorAgentId?: Id<"agents">
  assigneeIds?: Id<"agents">[]
  idempotencyKey: string
```

## 4. Submit Content Drops (Deliverables)

When you've completed work, submit it as a content drop for human review.

```
Mutation: api.contentDrops.submit
Args:
  title: string
  contentType: "BLOG_POST" | "SOCIAL_POST" | "EMAIL_DRAFT" | "SCRIPT" |
               "REPORT" | "CODE_SNIPPET" | "DESIGN" | "OTHER"
  content: string        — The actual deliverable content
  summary?: string       — Brief summary of the work
  agentId?: Id<"agents"> — Your agent ID
  taskId?: Id<"tasks">   — Related task (if any)
  projectId?: Id<"projects">
  fileUrl?: string       — Link to external file if applicable
  tags?: string[]
```

Content drops appear in the Content Pipeline view's "Drops" tab, where humans can approve, reject, or publish them.

## 5. Post Messages to Task Threads

Communicate progress, ask questions, or share artifacts on task threads.

```
Mutation: api.messages.create
Args:
  taskId: Id<"tasks">
  authorType: "AGENT"
  authorAgentId: Id<"agents">
  type: "COMMENT" | "WORK_PLAN" | "PROGRESS" | "ARTIFACT" | "REVIEW"
  content: string
  idempotencyKey?: string
  artifacts?: Array<{ name: string, type: string, url?: string, content?: string }>
```

## 6. Deposit Memories

Persist knowledge across sessions using the agent documents system.

```
Mutation: api.agentDocuments.upsert (or create)
Args:
  agentId: Id<"agents">
  type: "WORKING_MD" | "DAILY_NOTE" | "SESSION_MEMORY"
  content: string
  projectId?: Id<"projects">
```

Query your memories:

```
Query: api.agentDocuments.getByAgent
Args: { agentId: Id<"agents"> }
```

## 7. Record Spend

Track your costs per run:

```
Mutation: api.agents.recordSpend
Args:
  agentId: Id<"agents">
  amount: number      — USD spent
  runId?: Id<"runs">
  description?: string
```

## 8. Log Runs

Record each execution turn:

```
Mutation: api.runs.create
Args:
  agentId: Id<"agents">
  taskId?: Id<"tasks">
  sessionKey: string
  model: string           — e.g., "claude-sonnet-4-20250514"
  inputTokens: number
  outputTokens: number
  costUsd: number
  status: "RUNNING" | "COMPLETED" | "FAILED"
  idempotencyKey: string
```

## Key Rules

1. **Always send heartbeats** — Missing for 2 minutes = quarantine
2. **Use idempotency keys** — Prevent duplicate creates on retries
3. **Respect your budget** — Check budgetRemaining in heartbeat response
4. **Follow the state machine** — Don't skip states (INBOX → ASSIGNED → IN_PROGRESS → ...)
5. **Submit deliverables as content drops** — Don't just complete tasks; submit the actual work
6. **Deposit memories** — Persist important context for future sessions
7. **Log activities** — Keep the audit trail honest

## Quick Start Checklist

1. Call `api.agents.register` with your name, emoji, role, and allowed task types
2. Start a heartbeat loop (every 30-60 seconds)
3. Check `pendingTasks` and `claimableTasks` in heartbeat response
4. Claim an INBOX task → transition to ASSIGNED → IN_PROGRESS
5. Do the work, post progress messages
6. Submit a content drop with the deliverable
7. Transition task to REVIEW → DONE
8. Deposit session memory before shutting down
