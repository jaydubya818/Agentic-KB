---
title: Tier Loading Policy
type: policy
---

# Tier Loading Policy

- **Worker**: own memory (profile, hot, working, learned) + direct lead standards + current project specs/plan. Budget 40KB.
- **Lead**: own memory + lead standards + project prd/specs/plan/decisions + open discoveries + self-addressed escalations. Budget 80KB.
- **Orchestrator**: own memory + system policies/routing + project prd/decisions + promoted lead standards + self-addressed escalations. Budget 160KB.

Every context load emits a `ContextLoadTrace` to `logs/agent-runtime.log`.
