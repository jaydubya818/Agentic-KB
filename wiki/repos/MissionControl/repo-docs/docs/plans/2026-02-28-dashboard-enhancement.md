---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: "docs/plans/2026-02-28-dashboard-enhancement.md"
imported_at: "2026-04-25T16:02:21.278Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/docs/plans/2026-02-28-dashboard-enhancement.md"
---

# Dashboard Enhancement Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the OpenClaw Command Center / Mission Control dashboard with clearer cost context, fixed undefined metrics, better discoverability for agents and sessions, trend visualizations, and optional alerts and layout customization.

**Video-aligned enhancements (Open Claw “Mission Control” video):** Applied 2026-03 — Taskboard summary stats (This week, In progress, Total, Completion %), “+ New task” in Tasks header, Live Feed renamed to “Live Activity” with checkmarks for completed tasks, Calendar/Projects copy updated to emphasize proactive agents and project tracking. See APP_FLOW.md for taskboard and live-activity behavior.

**Architecture:** Three phases. Phase 1 focuses on clarity and UX quick wins (tooltips, copy, undefined fixes, clickable agents). Phase 2 adds time-series data and charts (tokens/cost over time, session drill-down). Phase 3 adds configurable alerts and optional drag-and-drop layout. Mission Control uses Convex for data; any Command Center–style view may use gateway/orchestration APIs. All new UI uses existing shadcn/ui + Tailwind + Recharts where applicable.

**Tech Stack:** React 18, TypeScript, Convex, Tailwind CSS v4, shadcn/ui, Recharts, Framer Motion. Optional: @dnd-kit for layout.

---

## Review Summary

**Strengths**
- Clear KPIs (tokens, cost, active count).
- Cost breakdown (cache read/write, API requests, pricing) is present.
- System vitals (CPU, memory, disk) and active sub-agents are visible.
- Quick actions (Health Check, Gateway Status, Clean Stale Sessions) and top sessions by tokens add usefulness.

**Gaps**
- “Estimated Monthly Savings” lacks baseline context (savings vs. what?).
- Some metrics show `undefined%` (e.g. CPU).
- AI usage (Claude/Codex) shows bars but not concrete input/output tokens or cost for the window.
- Active sub-agents: IDs truncated, no tooltip or drill-down.
- No trend graphs for tokens, cost, or system metrics.
- Top sessions by tokens are not clickable to open session/chat detail.
- No configurable alerts or customizable dashboard layout.

---

## Phase 1: Clarity and UX (Quick Wins)

### Task 1.1: Add savings baseline context

**Files:**
- Modify: `apps/mission-control-ui/src/DashboardOverview.tsx` (or the view that shows “EST. MONTHLY SAVINGS” / cost summary)
- Modify: `apps/mission-control-ui/src/components/ui/tooltip.tsx` (use existing; ensure exported)

**Steps:**
1. Locate the “Estimated Monthly Savings” (or equivalent) label and value in the dashboard.
2. Wrap the label and/or value in the Tooltip component; set content to a short sentence, e.g. “Savings vs. paying full window price without cache/optimizations.”
3. Optionally add a small `(?)` or info icon that triggers the same tooltip.
4. If the dashboard is in a different app (Command Center), add the same pattern there with the same copy.
5. Verify tooltip shows on hover/focus and is readable in dark theme.

**Acceptance:** User can hover over savings and see what the comparison baseline is.

---

### Task 1.2: Show concrete AI usage (tokens + cost per provider)

**Files:**
- Modify: `apps/mission-control-ui/src/DashboardOverview.tsx` or the component that renders “Claude (Anthropic)” / “Codex (OpenAI)” blocks
- Convex: Add or extend query in `convex/execution.ts` or `convex/agents.ts` to return per-provider aggregates (input tokens, output tokens, estimated cost) for the current window (e.g. 24h)

**Steps:**
1. Define or reuse a Convex query that aggregates by provider and time window (e.g. last 24h): `inputTokens`, `outputTokens`, `estimatedCostUsd`.
2. In the dashboard, for each provider card, display: “Input: Xk · Output: Yk · ~$Z” (or equivalent) in addition to any existing bars.
3. If no backend data exists yet, add a schema field or table for usage snapshots and an aggregation query; then wire the UI to it.
4. Ensure “0” or “—” is shown when there is no data.

**Acceptance:** Each LLM card shows numeric tokens and estimated cost for the selected window.

---

### Task 1.3: Fix undefined CPU (or other) metrics — applied

**Files:**
- Modify: Component that renders System Vitals / CPU (e.g. `apps/mission-control-ui/src/*Vitals*` or the file that renders “user” / “sys” and the third bar)
- If data comes from gateway/orchestration: `apps/orchestration-server/src/*` or Convex action that fetches vitals

**Steps:**
1. Find the source of the CPU breakdown (user, sys, and the value that renders “undefined%”).
2. Ensure every value passed to the chart/label is a number or a fallback string (e.g. `value ?? 0` or `value != null ? `${value}%` : '—'`).
3. Guard the third metric (e.g. “idle” or “other”) the same way.
4. Run the dashboard and confirm no “undefined” appears in System Vitals.

**Acceptance:** All CPU (and related) percentages render as numbers or “—”.

---

### Task 1.4: Active sub-agents: tooltip + click to detail — applied

**Files:**
- Modify: Component that lists “Active Sub-agents” (e.g. `apps/mission-control-ui/src/AgentDashboard.tsx` or the Command Center view that lists `agent:main:subagent:...`)
- Use: `apps/mission-control-ui/src/components/ui/tooltip.tsx`, `apps/mission-control-ui/src/AgentDetailFlyout.tsx` or equivalent (e.g. `ModalLayer.tsx` / `sheet.tsx`)

**Steps:**
1. For each sub-agent row, wrap the truncated ID in a Tooltip that shows the full ID on hover.
2. Make each row clickable (e.g. `onClick` or link) to open an agent/session detail view (e.g. AgentDetailFlyout or a session transcript).
3. If the list is gateway-backed and IDs are not Convex agent IDs, open a session detail (e.g. ChatView with session id) or a read-only flyout that shows session id, tokens, duration.
4. Ensure keyboard and screen-reader access (focusable, aria-label).

**Acceptance:** Full ID visible on hover; click opens detail flyout or session view.

---

## Phase 2: Data Visualization and Drill-Down

### Task 2.1: Time-series query for tokens and cost

**Files:**
- Create or extend: `convex/execution.ts` or `convex/qcMetrics.ts` (or gateway-backed API) to return time-bucketed series
- Schema: `convex/schema.ts` — add or reuse a table for usage snapshots (e.g. by hour/day) if not present

**Steps:**
1. Define a query that returns buckets (e.g. last 24h by hour, or 7d by day): `{ period: string, inputTokens, outputTokens, costUsd }[]`.
2. If data is from gateway, add an action that calls the gateway and shapes the response into the same bucket format; expose via Convex action + query or internal mutation that stores snapshots.
3. Document the query in `docs/BACKEND_STRUCTURE.md`.

**Acceptance:** One Convex query (or action) returns time-series data for tokens and cost.

---

### Task 2.2: Charts for token and cost trends

**Files:**
- Modify: `apps/mission-control-ui/src/DashboardOverview.tsx` or dedicated cost/token view
- Use: `apps/mission-control-ui/src/components/NeonChartTheme.tsx`, Recharts (e.g. `LineChart`, `AreaChart`)

**Steps:**
1. Use the time-series query from Task 2.1; add a time-range selector (24h / 7d / 30d) if desired.
2. Add a chart (e.g. line or area) for “Total tokens” or “Input / Output” over time; use `NeonChartContainer` and `NeonChartTheme` styles.
3. Add a second chart (or second series) for “Estimated cost” over time.
4. Ensure empty state shows “No data” and axes are labeled.

**Acceptance:** Dashboard shows at least one trend chart for tokens and one for cost.

---

### Task 2.3: System vitals history (optional)

**Files:**
- Backend: orchestration or Convex action that stores or fetches CPU/memory/disk history
- Modify: Component that renders System Vitals (e.g. add a small sparkline or mini chart)

**Steps:**
1. If vitals are pushed from gateway/orchestration, define a small history (e.g. last 24 points) and an endpoint or Convex table.
2. In the vitals section, add a compact trend (e.g. CPU % and memory % over last 24h) using the same chart theme.
3. If backend work is out of scope, skip and document as “Phase 2 follow-up.”

**Acceptance:** Optional: System Vitals section includes a trend for CPU/memory.

---

### Task 2.4: Top sessions clickable to session/chat view

**Files:**
- Modify: Component that renders “Top Sessions by Tokens” (e.g. in DashboardOverview or Command Center)
- Use: `apps/mission-control-ui/src/ChatView.tsx` or session route; ensure navigation accepts session id

**Steps:**
1. For each “Top Sessions” row, add an `onClick` (or link) that navigates to the session/chat view with that session id (e.g. `onNavigate?.('chat', { sessionId })` or router push).
2. Add a small visual cue (e.g. chevron, “Open”) so it’s clear the row is clickable.
3. If session id is not available in the list payload, extend the backend to return it.
4. Optional: add a tiny inline bar (e.g. width by token share) next to each row for relative consumption.

**Acceptance:** Clicking a top session opens the corresponding session/chat view.

---

## Phase 3: Alerts and Layout (Optional)

### Task 3.1: Alert rules schema and cron

**Files:**
- Modify: `convex/schema.ts` — add `alertRules` table (e.g. `userId`, `projectId`, `type`, `threshold`, `params`, `enabled`)
- Modify: `convex/crons.ts` — add a cron that evaluates rules and creates notifications
- Modify: `apps/mission-control-ui/src/NotificationsModal.tsx` — ensure new alert notifications appear

**Steps:**
1. Define `alertRules` with validator; support at least one type (e.g. `daily_cost_exceeded`) and threshold.
2. In the cron, query recent cost (or tokens) and compare to rules; insert into notifications (or existing activities) when threshold is exceeded.
3. Document in `docs/BACKEND_STRUCTURE.md`. Do not add UI for creating rules yet if out of scope.

**Acceptance:** A cron runs and can create a notification when a simple rule (e.g. cost > X) is met.

---

### Task 3.2: Alert configuration UI

**Files:**
- Create or modify: `apps/mission-control-ui/src/AgentSettingsPanel.tsx` or new `AlertsView.tsx`
- Modify: `convex/schema.ts` (already in 3.1), add mutation for create/update/delete rule

**Steps:**
1. Add a form to create/edit/delete alert rules (e.g. “Notify if daily API cost > $X”).
2. Use Convex mutations to persist rules; list rules in the same view.
3. Link from Settings or dashboard “Quick Actions” to this view.

**Acceptance:** User can create and see at least one type of cost alert rule.

---

### Task 3.3: Customizable dashboard layout (optional)

**Files:**
- Modify: Main dashboard layout component (e.g. `DashboardOverview.tsx` or Command Center container)
- Use: `@dnd-kit` (already in project); Convex `userSettings` or similar to persist layout

**Steps:**
1. Define a list of widget ids (e.g. “systemVitals”, “aiUsage”, “activeSubagents”, “costBreakdown”).
2. Use @dnd-kit to make sections reorderable; persist order (and optionally visibility) to Convex (e.g. `userSettings.dashboardLayout`).
3. Load saved layout on mount; apply order when rendering sections.
4. If scope is tight, document as “Phase 3 follow-up” and skip implementation.

**Acceptance:** User can reorder (and optionally hide) main dashboard sections; layout persists.

**Note:** Phase 3.3 (customizable dashboard layout) deferred: use localStorage key `mc.dashboard_layout` or a future `userSettings` table + @dnd-kit for reorderable sections when prioritised.

---

## Technical Notes

- **Convex:** New queries/mutations use `v.` validators; multi-project rules use `projectId` where applicable; avoid new `any` types.
- **UI:** All new components use shadcn/ui and Tailwind; follow `docs/FRONTEND_GUIDELINES.md` and CSS variables for colors.
- **Docs:** Update `docs/BACKEND_STRUCTURE.md` for new Convex functions and tables; update `docs/APP_FLOW.md` or equivalent if new views are added.

---

## Execution Handoff

Plan saved to `docs/plans/2026-02-28-dashboard-enhancement.md`.

**Two execution options:**

1. **Subagent-driven (this session)** — Implement task-by-task with a fresh subagent per task and review between tasks.
2. **Parallel session** — Open a new session with executing-plans and run through the plan with checkpoints.

Which approach do you prefer?
