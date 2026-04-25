---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: docs/plans/MISSION_CONTROL_MATURITY_GAPS.md
imported_at: "2026-04-25T16:02:21.278Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/docs/plans/MISSION_CONTROL_MATURITY_GAPS.md"
---

# Mission Control — Maturity Level Gap Analysis

**Purpose:** Map the “Mission Control as operating system” maturity framework (L1–L4) to the current codebase and list what’s done vs. what still needs to be applied.

**Key insight (from the framework):** *Stop forcing agents into tools built for humans. Build a mission control around your actual workflow.*

---

## Level 1: Basic

| Requirement | Status | Where it lives / gap |
|-------------|--------|----------------------|
| **See all your agents and what they're working on in one place** | ✅ Done | Sidebar (agent list), **ATC Board** (Agents > ATC), **Office** (Comms > Office), **Agent Dashboard** (modal). Each shows current task and status. |
| **Spin up new sub-agents or pause them when you need to** | ✅ Done | **Create Agent** (Agents > Registry / modal), **Pause Squad** (Ops > Tasks header + Sidebar). `agents.pauseAll` / `resumeAll`. |
| **Track how much each agent is costing you in real time** | ✅ Done | **Agent Dashboard** (per-agent: Total Cost, Today’s Spend, $/run), **ATC Board** (session cost + tokens per agent), **Cost Analytics** modal, **Dashboard Overview** (total spend). Data is reactive via Convex. |
| **Step in and redirect an agent when something goes off track** | ⚠️ Partial | **Redirect** = change assignment, status, or add instruction. You can: transition task status (Task Drawer, Kanban drag), approve/deny, comment. **Gap:** No explicit “Reassign to…” or “Redirect” action in task drawer/ATC; reassign requires edit flow. |
| **Replaces "50 open Slack threads"** | ✅ Done | Single dashboard: tasks, approvals, live activity, one project/agent context. |

**L1 actions to apply**

- Add a clear **“Reassign”** (and optionally **“Redirect”**) action: from Task Drawer or ATC, reassign task to another agent and/or add a short “redirect” instruction (e.g. stored as a comment or a dedicated field).

---

## Level 2: Intermediate

| Requirement | Status | Where it lives / gap |
|-------------|--------|----------------------|
| **Every task gets assigned to a specific agent with a deadline** | ⚠️ Partial | **Assignees:** ✅ Create Task modal + Kanban assignee filters. **Deadline:** Schema has `tasks.dueAt` but **Create Task** does not expose it; **tasks.create** mutation does not accept `dueAt`. No due date on cards or in drawer. |
| **Live feed shows what your agents are completing throughout the day** | ✅ Done | **Live Activity** panel (right side on Tasks view) with completion checkmarks and “Completed: [task]” entries. |
| **Click into any task and see the full decision history** | ✅ Done | **Task Drawer > Timeline** tab: transitions, messages, runs, tool calls, approvals, activities. Unified chronological history. |
| **Agents run repeatable workflows without you prompting them** | ⚠️ Partial | **Schedules** (Agents > Schedules) for Convex cron-like jobs; **Calendar** for task-level scheduling (`scheduledFor`, recurrence). Heartbeat/coordinator can claim backlog tasks. **Gap:** No single “Autonomous runs” or “What’s running without you” summary on home/dashboard. |
| **OpenClaw as employee, not chatbot** | ✅ Supported | Assignments, deadlines (once added), schedules, approvals, and live activity all support “agent as employee” usage. |

**L2 actions to apply**

1. **Deadlines**
   - Add `dueAt` to `tasks.create` args and handler; persist when creating.
   - Add **Due date** to **Create Task** modal (and optional **Quick Edit** / task drawer edit).
   - Show due date on **Kanban cards** and in **Task Drawer**; optionally highlight overdue or due-soon.
2. **“What’s running without you”**
   - Add a small **Scheduled / Autonomous** summary on **Dashboard Overview** (or a dedicated widget): e.g. “3 cron jobs this week”, “Heartbeat: auto-claim backlog”, link to Schedules + Calendar.

---

## Level 3: Advanced

| Requirement | Status | Where it lives / gap |
|-------------|--------|----------------------|
| **Agents manage their own memory so nothing gets lost between sessions** | ✅ Done | **agentDocuments** (WORKING_MD, DAILY_NOTE, SESSION_MEMORY), **Memory** view (Knowledge > Memory) by day + long-term. |
| **Your entire content pipeline runs through the dashboard** | ✅ Done | **Content Pipeline** (Content > Pipeline), **ContentPipelineView** (drops, stages). |
| **Cron jobs are scheduled and visible so you know what's running and when** | ✅ Done | **Schedules** (Agents > Schedules) lists Convex scheduled jobs; **Calendar** shows task-level scheduled/recurring tasks. Copy updated to “confirm your agents are being proactive”. |
| **AI agents and real team members coordinated in the same system** | ✅ Done | **People** (Comms > People), **Org Chart** (Comms > Org Chart) with humans + agents, **Identities**, mission statement. |
| **Full operating system; agency runs on this** | ✅ In place | L3 features together (memory, content pipeline, cron visibility, human+agent org) support “full OS” use. |

**L3 actions to apply**

- No must-have gaps. Optional: make **Schedules** and **Calendar** more discoverable from **Home** (e.g. “Scheduled & cron” card with counts and links).

---

## Level 4: The system runs decisions you don’t make

| Theme | Status | Notes |
|-------|--------|------|
| **Decisions, not tasks** (e.g. revenue routing, escalation logic, priority calls) | 🔮 Roadmap | Beyond current scope. Would require: decision pipelines, routing rules, escalation logic, and possibly approval flows that are policy-driven rather than one-off. |
| **You become the architect, not the operator** | 🔮 Roadmap | Outcome of L4: system handles recurring decisions; you configure and monitor. |

**L4:** Not in current “what to apply” list; treat as post–Level 3 product direction.

---

## Summary: What to build next

*As of 2026-03, items 1–4 have been implemented (due dates, Reassign/Redirect, "What's running" widget, Schedules/Calendar on Home). Additionally: dashboard Squad Utilization guarded against undefined; Top runs by tokens have tooltip (full session id) + click to task; output validation pre-REVIEW (convex/lib/outputValidation.ts + tasks.transition + validateOutputForReview query); time-series and token/cost charts already present. Coordinator, model-router, context-router, agent-runtime packages exist in packages/.

| Priority | Item | Level | Effort |
|----------|------|-------|--------|
| 1 | **Task deadlines:** Add `dueAt` to create + UI (create modal, cards, drawer) | L2 | Small |
| 2 | **Reassign / Redirect:** Explicit “Reassign to…” (and optional redirect note) from task drawer or ATC | L1 | Small |
| 3 | **“What’s running without you”:** Dashboard widget for scheduled jobs + heartbeat/auto-claim | L2 | Small |
| 4 | **Schedules/Calendar discoverability:** Home or Overview link/card to Schedules + Calendar | L3 | Trivial |

---

## References

- **App flow:** `docs/APP_FLOW.md`
- **Backend:** `docs/BACKEND_STRUCTURE.md`
- **Dashboard enhancement plan:** `docs/plans/2026-02-28-dashboard-enhancement.md`
