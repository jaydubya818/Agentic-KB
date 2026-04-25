---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: UNIFIED_SCHEMA_MAPPING.md
imported_at: "2026-04-25T16:02:21.252Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/UNIFIED_SCHEMA_MAPPING.md"
---

# Unified Schema Mapping: ARM + Mission Control (v0.2)

## Summary

ARM (26 tables) + MC (35 tables) → **Combined: 55 tables** (after dedup + merge).

ARM owns: registry, governance, audit, identity, deployments.
MC owns: execution, coordination, communication, runtime, ops telemetry.

**v0.2 changes (from ChatGPT review):**
1. Added `opEvents` table — high-volume ops telemetry separated from governance `changeRecords`
2. Added `deployments` table — promotion/rollback bridge between approved versions and running instances
3. Moved `agentIdentities` ownership from MC to ARM (identity governance = system of record)

---

## Decision Key

| Symbol | Meaning |
|--------|---------|
| ✅ ARM | ARM's table wins — MC equivalent is retired |
| ✅ MC  | MC's table wins — no ARM equivalent exists |
| 🔀 MERGE | Both have a version — merge into one, pick the better model |
| 🗑️ RETIRE | Table is superseded and dropped |
| 🆕 NEW | New table created for the combined system |

---

## Domain 1: MULTI-TENANCY & IDENTITY (ARM wins)

| Combined Table | Source | Notes |
|---|---|---|
| `tenants` | ✅ ARM | Top-level isolation boundary. MC `projects` become children. |
| `projects` | ✅ MC (refactored) | Child of `tenants`. Add `tenantId` FK. Keeps: name, slug, description, githubRepo, swarmConfig, policyDefaults. Required on `agentInstances` and `tasks`. |
| `environments` | ✅ ARM | dev/staging/prod per tenant. MC didn't have this. |
| `operators` | ✅ ARM | Auth identity, email, GDPR fields. Replaces MC `orgMembers` for RBAC. |
| `orgMembers` | ✅ MC (refactored) | "Team directory" — human contacts, titles, org chart. Loses RBAC fields (move to ARM roles). Add `tenantId`. |
| `providers` | ✅ ARM | Federation-ready. MC didn't have this. |

**Retired:**
- MC `agents` → replaced by ARM `agentTemplates` + `agentVersions` + `agentInstances`

---

## Domain 2: AGENT REGISTRY & IDENTITY (ARM wins)

| Combined Table | Source | Notes |
|---|---|---|
| `agentTemplates` | ✅ ARM | Agent blueprint. MC agent persona YAML fields (name, emoji, role, allowedTaskTypes, allowedTools) become template metadata. |
| `agentVersions` | ✅ ARM | Immutable genome + SHA-256 hash. MC has no equivalent. |
| `agentInstances` | ✅ ARM | Runtime binding. **Replaces MC `agents` table entirely.** MC's agentId references become instanceId references. Add required: `projectId` (execution scope). |
| `agentIdentities` | ✅ ARM (v0.2 change) | **Moved from MC to ARM ownership.** OpenClaw IDENTITY/SOUL/TOOLS governance is system-of-record behavior — identity changes affect governance posture, approval expectations, and compliance reporting. Links to `agentTemplates` via `templateId`. Fields: tenantId, templateId, identityContent, soulContent, toolsContent, complianceStatus, lastScanAt. |

**Field migration from MC `agents` → ARM model:**

| MC `agents` field | Where it goes |
|---|---|
| `name`, `emoji`, `role` | `agentTemplates` metadata |
| `status` (ACTIVE/PAUSED/etc) | `agentInstances.state` (ARM's richer state machine) |
| `allowedTaskTypes`, `allowedTools` | `policyEnvelopes` (ARM governance) |
| `budgetDaily`, `budgetPerRun` | `policyEnvelopes.costLimits` |
| `spendToday`, `spendResetAt` | `agentInstances.metadata` (runtime budget tracking) |
| `canSpawn`, `maxSubAgents` | `policyEnvelopes` spawn constraints |
| `currentTaskId` | `agentInstances.metadata` (runtime state) |
| `lastHeartbeatAt` | `agentInstances.heartbeatAt` |
| `parentAgentId` | `agentInstances.metadata.parentInstanceId` |
| `workspacePath` | `agentTemplates.metadata` or `agentIdentities` |
| `soulVersionHash` | `agentVersions.genomeHash` (subsumes) |

---

## Domain 3: GOVERNANCE, POLICY & DEPLOYMENTS (ARM wins)

| Combined Table | Source | Notes |
|---|---|---|
| `policyEnvelopes` | ✅ ARM | Autonomy tiers 0-5, tool whitelist, cost limits. Supports attachment at tenant, project, or template/version level (inheritance: version > project > tenant). Replaces MC `policies`. |
| `approvalRecords` | ✅ ARM (enriched) | ARM model + MC fields: `rollbackPlan`, `justification`, `escalationLevel`, `escalatedAt`, `requiredDecisionCount`. |
| `deployments` | 🆕 NEW (v0.2) | **Promotion/rollback bridge.** Fields: tenantId, templateId, environmentId, targetVersionId, previousVersionId, rolloutPolicy (object), status (PENDING\|ACTIVE\|ROLLING_BACK\|RETIRED), createdBy, approvedBy, activatedAt. This is the governance object between "version approved" and "instances running." Rollback = create new deployment pointing to previousVersionId. |
| `roles` | ✅ ARM | RBAC role definitions with permissions array. |
| `roleAssignments` | ✅ ARM | Operator-to-role mappings. |
| `permissions` | ✅ ARM | Permission registry (resource + action). |

**Retired:**
- MC `policies` → replaced by ARM `policyEnvelopes`
- MC `approvals` → replaced by ARM `approvalRecords`

---

## Domain 4: AUDIT & OBSERVABILITY (ARM governance + MC telemetry)

**Key design decision (v0.2): Split governance audit from ops telemetry.**

| Combined Table | Source | Notes |
|---|---|---|
| `changeRecords` | ✅ ARM | **Governance audit spine.** Low-volume, high-signal events: state transitions, approvals, promotions, emergency controls, integrity events. Queried by compliance dashboards, export-ready. |
| `opEvents` | 🆕 NEW (v0.2) | **High-volume ops telemetry.** Tool calls, run steps, workflow step events, heartbeats, cost ticks. Fields: tenantId, type, instanceId, versionId, projectId, payload (any), changeRecordId (optional — set when an op event triggers a governance event), timestamp. Indexed for time-range queries. Retention policy: 30 days default, configurable per tenant. |
| `auditLogs` | ✅ ARM | Security-level audit (severity: INFO/WARNING/ERROR). RBAC, auth events, permission changes. |

**How they relate:**
- `changeRecords` = "what changed in the system of record" (governance)
- `opEvents` = "what happened during execution" (telemetry)
- Link: `opEvents.changeRecordId` → when an op event causes a governance event (e.g., budget_exceeded op event triggers BUDGET_EXCEEDED changeRecord)

**Retired:**
- MC `activities` → split into `changeRecords` (governance) + `opEvents` (telemetry)
- MC `taskTransitions` → `changeRecords` type `TASK_TRANSITIONED`
- MC `taskEvents` → `opEvents`

**`changeRecords.type` enum (governance events only):**

```typescript
// Registry events
| 'TENANT_BOOTSTRAPPED' | 'PROJECT_CREATED' | 'ENVIRONMENT_CREATED'
| 'OPERATOR_CREATED' | 'PROVIDER_CREATED'
| 'TEMPLATE_CREATED' | 'TEMPLATE_UPDATED'
| 'VERSION_CREATED' | 'VERSION_TRANSITIONED'
| 'VERSION_INTEGRITY_VERIFIED' | 'VERSION_INTEGRITY_FAILED'
| 'INSTANCE_CREATED' | 'INSTANCE_TRANSITIONED'
| 'IDENTITY_UPDATED'

// Deployment events
| 'DEPLOYMENT_CREATED' | 'DEPLOYMENT_ACTIVATED' | 'DEPLOYMENT_ROLLED_BACK'

// Governance events
| 'POLICY_ATTACHED' | 'POLICY_EVALUATED'
| 'APPROVAL_REQUESTED' | 'APPROVAL_DECIDED'

// Task lifecycle events (governance-level only)
| 'TASK_CREATED' | 'TASK_TRANSITIONED' | 'TASK_ASSIGNED'
| 'WORKFLOW_STARTED' | 'WORKFLOW_COMPLETED'

// Emergency events
| 'BUDGET_EXCEEDED' | 'LOOP_DETECTED'
| 'EMERGENCY_PAUSE' | 'EMERGENCY_QUARANTINE'
```

**`opEvents.type` enum (high-volume telemetry):**

```typescript
| 'RUN_STARTED' | 'RUN_STEP' | 'RUN_COMPLETED' | 'RUN_FAILED'
| 'TOOL_CALL_STARTED' | 'TOOL_CALL_COMPLETED' | 'TOOL_CALL_BLOCKED'
| 'WORKFLOW_STEP_STARTED' | 'WORKFLOW_STEP_COMPLETED' | 'WORKFLOW_STEP_FAILED'
| 'HEARTBEAT' | 'COST_TICK'
| 'MESSAGE_SENT' | 'DECISION_MADE'
```

---

## Domain 5: TASK EXECUTION (MC wins)

| Combined Table | Source | Notes |
|---|---|---|
| `tasks` | ✅ MC | Core work unit. Add `tenantId`, `projectId` (required). Change `assigneeIds` from agentId → instanceId refs. |
| `messages` | ✅ MC | Task thread comms. Add `tenantId`. Update author refs to instanceId. |
| `runs` | ✅ MC | Execution turns with cost tracking. Add `tenantId`. Change `agentId` → `instanceId`, add `versionId` for lineage. |
| `toolCalls` | ✅ MC | Tool invocations with risk classification. Add `tenantId`. MC's `riskLevel` integrates with ARM's policy evaluation. |
| `executionRequests` | ✅ MC | Multi-executor routing. Add `tenantId`. |
| `taskDependencies` | ✅ MC | DAG support. Add `tenantId`. |
| `reviews` | ✅ MC | Peer review system. Add `tenantId`. |

---

## Domain 6: AGENT INTELLIGENCE (MC wins)

| Combined Table | Source | Notes |
|---|---|---|
| `agentPerformance` | ✅ MC | Learning metrics. Change `agentId` → `instanceId` + `versionId`. Add `tenantId`. |
| `agentPatterns` | ✅ MC | Discovered patterns. Same FK migration. Add `tenantId`. |
| `agentDocuments` | ✅ MC | Session memory, working notes. Change `agentId` → `instanceId`. Add `tenantId`. |

---

## Domain 7: COMMUNICATION (MC wins)

| Combined Table | Source | Notes |
|---|---|---|
| `telegraphThreads` | ✅ MC | Async agent messaging. Add `tenantId`. |
| `telegraphMessages` | ✅ MC | Thread messages. Add `tenantId`. |
| `meetings` | ✅ MC | Meeting orchestration. Add `tenantId`. |
| `voiceArtifacts` | ✅ MC | TTS audio/transcripts. Add `tenantId`. |

---

## Domain 8: WORKFLOW ORCHESTRATION (MC wins)

| Combined Table | Source | Notes |
|---|---|---|
| `workflows` | ✅ MC | Workflow definitions (YAML-driven). Add `tenantId`. |
| `workflowRuns` | ✅ MC | Execution state with step tracking. Add `tenantId`. |

---

## Domain 9: EVALUATION (ARM wins)

| Combined Table | Source | Notes |
|---|---|---|
| `evaluationSuites` | ✅ ARM | Test suite definitions. |
| `evaluationRuns` | ✅ ARM | Test execution records. MC telemetry feeds these. |
| `evaluationMetrics` | ✅ ARM | Time-series analytics. |
| `customScoringFunctions` | ✅ ARM | Extensible scoring. |

---

## Domain 10: NOTIFICATIONS (ARM wins)

| Combined Table | Source | Notes |
|---|---|---|
| `notificationEvents` | ✅ ARM | Event-driven. Replaces MC's simpler model. |
| `notifications` | 🔀 MERGE | ARM structure wins. MC's `type` taxonomy preserved as event types. |
| `notificationPreferences` | ✅ ARM | Per-operator settings. |

---

## Domain 11: PLATFORM (ARM wins, MC contributes)

| Combined Table | Source | Notes |
|---|---|---|
| `featureFlags` | ✅ ARM | Feature flag management. |
| `experiments` | ✅ ARM | A/B testing. |
| `experimentAssignments` | ✅ ARM | Variant assignments. |
| `experimentEvents` | ✅ ARM | Event tracking. |
| `alerts` | ✅ MC | Operational alerts. Add `tenantId`. |
| `operatorControls` | ✅ MC | Emergency mode. Add `tenantId`. |
| `savedViews` | ✅ MC | Saved filters. Add `tenantId`. |
| `watchSubscriptions` | ✅ MC | Entity watchlists. Add `tenantId`. |
| `webhooks` | ✅ MC | Event webhooks. Add `tenantId`. |
| `webhookDeliveries` | ✅ MC | Delivery tracking. Add `tenantId`. |
| `threadSubscriptions` | ✅ MC | Thread subscriptions. Add `tenantId`. |
| `orgAssignments` | ✅ MC | Per-project role hierarchy. Add `tenantId`. |
| `captures` | ✅ MC | Visual artifacts. Add `tenantId`. |

---

## FINAL TABLE COUNT (v0.2)

| Domain | Tables | Owner |
|---|---|---|
| Multi-tenancy & Identity | 6 | ARM (4) + MC (2) |
| Agent Registry & Identity | 4 | ARM |
| Governance, Policy & Deployments | 6 | ARM (5) + NEW (1) |
| Audit & Observability | 3 | ARM (2) + NEW (1) |
| Task Execution | 7 | MC |
| Agent Intelligence | 3 | MC |
| Communication | 4 | MC |
| Workflow Orchestration | 2 | MC |
| Evaluation | 4 | ARM |
| Notifications | 3 | ARM |
| Platform | 13 | ARM (4) + MC (9) |
| **TOTAL** | **55** | |

**v0.1 → v0.2 delta:** +2 tables (`opEvents`, `deployments`), moved `agentIdentities` ownership ARM→ARM

**Retired tables (not in combined):** MC `agents`, MC `policies`, MC `approvals`, MC `activities`, MC `taskTransitions`, MC `taskEvents`, MC `notifications` (merged) = **7 retired**

---

## KEY INTEGRATION POINTS

### 1. The Join: `agentInstances` ↔ `tasks`

```
tasks.assigneeIds → agentInstances._id[]
runs.instanceId → agentInstances._id
runs.versionId → agentVersions._id
toolCalls.instanceId → agentInstances._id
agentInstances.versionId → agentVersions._id (immutable genome)
agentVersions.templateId → agentTemplates._id (blueprint)
```

Every task execution is traceable to an exact immutable version.

### 2. Deployment Flow (NEW v0.2)

```
agentVersions.transition(CANDIDATE → APPROVED) →
  deployments.create(templateId, environmentId, targetVersionId) →
    operator approves deployment →
      deployments.activate() →
        agentInstances.create() bound to deployment
```

Rollback:
```
deployments.create(templateId, env, previousVersionId) →
  old deployment.status → RETIRED
  new instances spawned from previous version
```

### 3. Policy Evaluation Flow

```
MC wants to execute tool →
  ARM policyEnvelopes.evaluate(instanceId, toolName, riskLevel) →
    ALLOW: proceed, write opEvent
    NEEDS_APPROVAL: ARM approvalRecords.create() → operator decides
    DENY: block + changeRecord + opEvent
```

Policy inheritance: version policy > project policy > tenant policy.

### 4. Telemetry → Evaluation Pipeline

```
MC runs complete →
  opEvents written (RUN_COMPLETED, TOOL_CALL_COMPLETED, COST_TICK) →
    ARM evaluationRuns consume opEvents as evidence →
      ARM promotion gates: TESTING → CANDIDATE requires evalStatus=PASS
```

### 5. Emergency Controls

```
MC operatorControls.PAUSE →
  ARM agentInstances.transition(ACTIVE → PAUSED) →
    changeRecord: EMERGENCY_PAUSE
    All tasks for paused instances → BLOCKED
    opEvent: HEARTBEAT stops
```

---

## DIRECTORY STRUCTURE (Combined Monorepo)

```
convex/
├── schema.ts                    # Unified 55-table schema
│
├── registry/                    # ARM domain
│   ├── tenants.ts
│   ├── environments.ts
│   ├── operators.ts
│   ├── providers.ts
│   ├── agentTemplates.ts
│   ├── agentVersions.ts
│   ├── agentInstances.ts
│   └── agentIdentities.ts
│
├── governance/                  # ARM domain
│   ├── policyEnvelopes.ts
│   ├── approvalRecords.ts
│   ├── deployments.ts           # NEW v0.2
│   ├── roles.ts
│   ├── roleAssignments.ts
│   ├── permissions.ts
│   └── changeRecords.ts
│
├── operations/                  # MC domain
│   ├── tasks.ts
│   ├── messages.ts
│   ├── runs.ts
│   ├── toolCalls.ts
│   ├── executionRequests.ts
│   ├── taskDependencies.ts
│   ├── reviews.ts
│   ├── opEvents.ts              # NEW v0.2
│   ├── workflows.ts
│   └── workflowRuns.ts
│
├── intelligence/                # MC domain
│   ├── agentPerformance.ts
│   ├── agentPatterns.ts
│   └── agentDocuments.ts
│
├── comms/                       # MC domain
│   ├── telegraphThreads.ts
│   ├── telegraphMessages.ts
│   ├── meetings.ts
│   └── voiceArtifacts.ts
│
├── evaluation/                  # ARM domain
│   ├── evaluationSuites.ts
│   ├── evaluationRuns.ts
│   ├── evaluationMetrics.ts
│   └── customScoringFunctions.ts
│
├── platform/                    # Shared
│   ├── alerts.ts
│   ├── notifications.ts
│   ├── operatorControls.ts
│   ├── webhooks.ts
│   ├── featureFlags.ts
│   └── savedViews.ts
│
└── lib/                         # Shared utilities
    ├── getActiveTenant.ts
    ├── genomeHash.ts
    ├── policyEvaluator.ts
    ├── riskClassifier.ts
    ├── errorTypes.ts
    └── cache.ts
```

---

## MIGRATION ORDER

1. **Foundation** — Unified schema.ts with all 55 tables deployed to Convex.
2. **Registry bridge** — MC agent creation goes through ARM template→version→instance pipeline. Compat query: `getAgentByLegacyId()` returns agentInstance wrapper.
3. **Deployment bridge** — Version promotion creates deployments. Instances bind to deployments.
4. **Policy bridge** — MC tool execution calls ARM policy evaluator. Policy inheritance wired.
5. **Audit bridge** — MC governance events write `changeRecords`. MC telemetry writes `opEvents`. Cross-reference via `changeRecordId`.
6. **Telemetry bridge** — MC run results feed ARM evaluation pipeline via `opEvents`.
7. **UI merge** — Single React app with ARM sidebar + MC operational views.
