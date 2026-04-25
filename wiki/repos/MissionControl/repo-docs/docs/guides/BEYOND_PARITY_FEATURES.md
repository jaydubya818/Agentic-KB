---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: docs/guides/BEYOND_PARITY_FEATURES.md
imported_at: "2026-04-25T16:02:21.270Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/docs/guides/BEYOND_PARITY_FEATURES.md"
---

# Beyond-Parity Features — Design & Spec

Short design and spec for post-parity capabilities. Implementation is not in scope here; this document is the source for future work.

---

## 1. End-to-end mission simulation mode

**Goal:** Let operators dry-run a mission (task creation → planning → assignment → transitions) without writing to live agents or external systems.

**Design:**

- **Toggle:** Global or per-project "Simulation mode" in operator controls or project settings.
- **Behavior when on:**
  - Task transitions and assignments are computed and shown in the UI but not persisted (or persisted to a `simulationRuns` table with a simulation run ID).
  - Agent "work" is stubbed: no real tool calls, no spend, no heartbeat updates from live agents.
  - Activities and audit log entries are either not written or tagged with `simulationRunId` so they can be filtered or purged.
- **Output:** A timeline or report of "what would have happened" (tasks created, assigned, advanced, blocked) for review before turning simulation off and running for real.

**Acceptance criteria:**

- Operator can enable simulation, run a mission (e.g. create tasks, trigger planner, auto-assign), and see the projected flow without affecting live agent state or spend.
- Clear UI indicator when simulation is on; one-click to apply the same flow for real (optional) or to discard.

---

## 2. Role-based command scopes with action-level approvals

**Goal:** Restrict who can run which operator actions (e.g. Pause squad, Bulk approve, Emergency stop) and optionally require a second approval for high-impact actions.

**Design:**

- **Model:** Introduce `operatorRoles` and `operatorRoleAssignments` (or reuse governance roles). Map actions (e.g. `squad:pause`, `approvals:bulkApprove`, `squad:emergencyStop`) to required roles or to "approval required" (second operator or timeout).
- **UI:** Command Panel and Operator Controls show actions as enabled/disabled or "Request approval" based on current operator’s role and policy. Approval requests create a small workflow (e.g. pending approval record, notification, approve/deny).
- **Backend:** Convex mutations for operator actions check role or approval state before applying; optional audit log for "requested by X, approved by Y".

**Acceptance criteria:**

- Operators with a given role can only execute actions allowed for that role.
- Configurable list of actions that require a second approval; request/approve/deny flow is auditable.

---

## 3. Cross-project portfolio view

**Goal:** Executive-level view of risk, burn, throughput, and incidents across all projects.

**Design:**

- **Data:** Aggregate from existing tables: tasks (counts by status, completion rate), agents (status, spend), approvals (pending/escalated), alerts (open, severity), activities (volume).
- **API:** New Convex query (e.g. `portfolio:getSummary`) that returns per-project and global rollups, with optional time window (e.g. last 7 days).
- **UI:** A dedicated "Portfolio" or "Executive" view: project cards or a table with key metrics (tasks done, budget burn, open alerts, approval backlog), trend indicators, and drill-down to a single project.

**Acceptance criteria:**

- One view shows all projects with consistent metrics (risk, burn, throughput, incidents).
- Drill-down from portfolio to existing project-specific views without losing context.

---

## 4. Automated incident timeline generator

**Goal:** Produce a chronological "incident timeline" from activities, approvals, and task transitions for a given time range or trigger (e.g. an alert or a task that went to BLOCKED/FAILED).

**Design:**

- **Inputs:** Time range and optional filters (project, agent, task, alert ID). Optional trigger: "Generate timeline for this alert" or "for this task’s lifecycle."
- **Data sources:** `activities`, `approvals` (state changes and decisions), task transition events (from activities or a dedicated event log), and `alerts` (creation, status).
- **Output:** Ordered list of events (timestamp, type, actor, summary, link to task/approval/alert). Export as markdown or JSON for runbooks and post-mortems.
- **API:** Convex query or action `incidents:getTimeline` that unions and sorts events from the above sources.
- **UI:** "Timeline" tab or modal on an alert/task, or a standalone "Incident timeline" report with date picker and project filter; copy/export button.

**Acceptance criteria:**

- Given an alert or a time range, operator gets a single chronological timeline of relevant activities, approvals, and task transitions.
- Timeline is exportable (e.g. markdown) for sharing or runbooks.
