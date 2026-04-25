---
id: 01KQ30KFQQRJFHNSE46PC6S64K
title: "MissionControl"
type: entity
tags: [agents, workflow, deployment, automation, orchestration]
created: 2026-04-21
updated: 2026-04-21
visibility: public
confidence: high
source: transcripts/obsidian-2026-04-21-2026-03-24.md
related: [entities/seller-fi, concepts/agent-resources-platform]
---

# MissionControl

MissionControl is a project owned by Sofie that serves as a central hub for agent orchestration and workflow management. As of early February 2026, it reached a deploy-ready state across UI, chat, and workflow integration.

## Status (as of Feb 2026)

- **UI**: All views verified ✅ (Feb 8, 2026)
- **Chat**: Enhanced with 7 features
- **Antfarm Workflow Integration**: Complete at v0.9.0 (Feb 9, 2026)

## Pending / Next Steps

| Action | Status |
|---|---|
| Telegram bot deployment | Ready |
| OpenClaw agent integration | Ready / Pending |
| Load testing | Ready / Pending |

## Integrations

- **Antfarm**: Workflow integration layer, completed at v0.9.0 on Feb 9, 2026. Antfarm provides the workflow execution backbone embedded within MissionControl.
- **Telegram**: Target deployment platform for a bot interface connected to MissionControl.
- **OpenClaw**: Agent integration target; listed as a pending ready action.

## Context

MissionControl is one of two projects (alongside [SellerFi](seller-fi.md)) flagged as in a "ready" state in Sofie's daily briefings, making it a primary candidate for active deployment push. Claude's daily `/today` briefings reference MissionControl's status as part of the Project Pulse summary.

## See Also

- [SellerFi](seller-fi.md)
- [Agent Resources Platform](../concepts/agent-resources-platform.md)
- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
- [Agent Loops](../concepts/agent-loops.md)
