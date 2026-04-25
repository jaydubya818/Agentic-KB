---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: CLAUDE.md
imported_at: "2026-04-25T16:02:21.246Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/CLAUDE.md"
---

# CLAUDE.md — MissionControl

> **Frameworks:** GSD for new features/modules · Superpowers `superpowers:test-driven-development` for orchestration logic (agent errors are not recoverable) · See `~/.claude/CLAUDE.md` for full guide

---

## Project Overview

**MissionControl** is a Turbo monorepo orchestration platform managing AI agent workflows.

- **Monorepo:** Turbo + pnpm workspaces
- **Apps:** `mission-control-ui` (dashboard), `orchestration-server` (agent routing), `workflow-executor` (task runner)
- **Backend:** Convex (real-time DB + functions)
- **Task Management:** TaskmasterAI
- **Language:** TypeScript (strict)

---

## Architecture Rules

- Each app in `apps/` is independently deployable — do not create cross-app imports
- Shared code lives in `packages/` — create a package before sharing logic
- Orchestration server owns agent routing — UI never calls agents directly
- Convex functions are the single source of truth for state

---

## Critical: Orchestration Safety

The orchestration-server routes agent tasks. Errors here cascade.

- **Always use Superpowers TDD** when modifying `apps/orchestration-server/src/`
- Run `superpowers:verification-before-completion` before any PR on orchestration code
- Agent dispatch changes require integration tests — `pnpm test:integration`

---

## Dev Commands

```bash
pnpm dev              # start all apps
pnpm dev:ui           # UI only
pnpm dev:orchestration # orchestration server only
pnpm test             # unit tests
pnpm test:integration # integration tests
pnpm build            # full build
```

---

## Framework Usage by Layer

| Layer | Framework | Command |
|-------|-----------|---------|
| New UI features | GSD | `/gsd:execute-phase` |
| New agent routes | GSD + Superpowers | `/gsd:plan-phase` then TDD |
| Orchestration logic | Superpowers | `superpowers:test-driven-development` |
| Bug investigation | Superpowers | `superpowers:systematic-debugging` |
| PRs | Superpowers | `superpowers:verification-before-completion` |
