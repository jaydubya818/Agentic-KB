---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: "docs/plans/UI-GAPS-AND-ENHANCEMENTS.md"
imported_at: "2026-04-25T16:02:21.278Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/docs/plans/UI-GAPS-AND-ENHANCEMENTS.md"
---

# UI Gaps, Enhancements, and Suggestions

> Close OpenClaw Studio parity gaps and add UI improvements across Mission Control.

**Reference:** [OpenClaw Studio](https://github.com/grp06/openclaw-studio) — Gateway, agents, chat, approvals, cron jobs, agent creation with permissions/sandbox.

---

## 1. Gaps to close (OpenClaw Studio parity)

| Gap | Status | Implementation |
|-----|--------|----------------|
| **Unified agent creation with tool policy** | In progress | CreateAgentModal extended with **Allowed tools** (allowlist); backend already supports `allowedTools`. |
| **Exec approval visibility in create flow** | In progress | Add short “Exec approvals” note in Create Agent: RED-risk tool calls require human approval; link to Approvals. |
| **Create agent from Registry** | In progress | “Create agent” button in Agent Registry opens same modal (not only from Org chart). |
| **Sandbox / isolation (future)** | Documented | No schema field yet; document in modal as “Sandbox: configured per executor (see runbook).” |

---

## 2. UI enhancements (from dashboard plan + suggestions)

| Enhancement | Source | Status |
|-------------|--------|--------|
| Savings baseline tooltip | Dashboard plan 1.1 | Pending |
| Concrete AI usage (tokens + cost per provider) | Dashboard plan 1.2 | Pending |
| Fix undefined CPU/metrics | Dashboard plan 1.3 | Pending |
| Active sub-agents: tooltip + click to detail | Dashboard plan 1.4 | Pending |
| Time-series tokens/cost + charts | Dashboard plan 2.x | Pending |
| Top sessions clickable to chat | Dashboard plan 2.4 | Pending |
| Alert rules UI (cost threshold) | Dashboard plan 3.2 | AlertRulesModal exists; verify linked from dashboard |
| **Connect Gateway when not configured** | Suggestion | In progress — Home quick action card |
| **Command palette: Cost Analytics, Create agent, Connect Gateway** | Suggestion | In progress |
| **Provider billing** (vendor links in Cost Analytics) | Done | Card with grouped links; see CostAnalytics.tsx |
| **Keyboard shortcut for Cost Analytics** | Suggestion | Add to KeyboardShortcuts if missing |

---

## 3. Additional suggestions (backlog)

- **Empty states:** Every major view (Agents, Tasks, Chat, Schedules) has a clear empty state with one primary CTA (e.g. “Create your first agent”, “Connect Gateway to chat”).
- **Onboarding strip:** Optional dismissible strip on first load: “Connect Gateway → Create agent → Run a task” with links.
- **Live Agent Chat discoverability:** Link from Home or Agents section when Gateway is configured: “Chat with agents”.
- **Schedules discoverability:** Link “Configure jobs” from Home or Ops when no schedules exist.
- **Consistent page headers:** All secondary views use `PageHeader` (title, description, primary action).
- **Dark/light consistency:** All new components use semantic tokens (text-foreground, bg-card, etc.); no hardcoded gray/white.

---

## 4. Implementation checklist (this pass)

- [x] Plan document (this file)
- [x] CreateAgentModal: add Allowed tools (presets + comma list), Exec approval note
- [x] CreateAgentModal: extract to shared component; use from OrgView and ModalLayer (Registry / Command Palette)
- [x] Agent Registry: “Create agent” button → open CreateAgentModal
- [x] Home: “Connect Gateway” card when gateway not configured
- [x] Command palette: Cost Analytics, Create agent, Connect Gateway

---

## 5. Sanity checks (pre-“done”)

- **allowedTools end-to-end:** `agents.register` accepts `allowedTools` (optional array of strings); schema `agents.allowedTools` is persisted on insert and patch. Not client-only — no “backend persistence required.”
- **Modal error behavior:** OrgView create rethrows so modal stays open. Global create (ModalLayer): on failure we now `onToast(message, true)` and rethrow so `CreateAgentModal`’s catch keeps the modal open; user sees an error toast and can fix and retry.

---

## 6. Files touched

| File | Change |
|------|--------|
| `docs/plans/UI-GAPS-AND-ENHANCEMENTS.md` | This plan |
| `apps/mission-control-ui/src/CreateAgentModal.tsx` | New shared component (extracted from OrgView) with tool policy + exec note |
| `apps/mission-control-ui/src/OrgView.tsx` | Use shared CreateAgentModal; pass parentAgentId when adding sub-agent |
| `apps/mission-control-ui/src/AgentRegistryView.tsx` | Add “Create agent” button; open CreateAgentModal |
| `apps/mission-control-ui/src/DashboardOverview.tsx` or Home view | “Connect Gateway” card when not configured |
| `apps/mission-control-ui/src/CommandPalette.tsx` | Add Cost Analytics, Create agent, Connect Gateway |
| `apps/mission-control-ui/src/ModalLayer.tsx` | Optional: add createAgent modal state so Command Palette can open it |
