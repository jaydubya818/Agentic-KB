---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: docs/LEAD_AGENT_SYSTEM_PLAN.md
imported_at: "2026-04-25T16:02:21.260Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/docs/LEAD_AGENT_SYSTEM_PLAN.md"
---

# Lead Agent System Implementation Plan

## Overview
Transform Mission Control from task-focused to revenue-focused agent orchestration using profitfounder's hierarchy: Jordan (Revenue Controller) → Casey (Retention Specialist) → Alex (Acquisition Specialist).

## Current Architecture Analysis
- Mission Control uses task-based metrics (completion, status transitions)
- Agents track spend and budget but not revenue impact
- Dashboard shows task metrics, not revenue KPIs
- No lead agent hierarchy - all agents are peers

## Revenue-Focused Transformation

### 1. Schema Updates
- Add revenue tracking tables for lead agent metrics
- Extend agent roles to support REVENUE_CONTROLLER, RETENTION_SPECIALIST, ACQUISITION_SPECIALIST
- Add revenue impact fields to tasks and content drops
- Create lead agent hierarchy relationships

### 2. Agent Hierarchy Implementation
```
Jordan (Revenue Controller)
├── Casey (Retention Specialist)
│   ├── Customer success tasks
│   ├── Retention campaigns
│   └── Revenue protection
└── Alex (Acquisition Specialist)
    ├── Lead generation
    ├── New customer acquisition
    └── Revenue growth
```

### 3. Revenue Metrics Dashboard
- Replace task completion metrics with revenue KPIs
- Show lead agent hierarchy and performance
- Track revenue impact per agent and task type
- Display revenue attribution and ROI

### 4. Task Orchestration Updates
- Route tasks based on revenue impact potential
- Prioritize revenue-generating activities
- Automatic escalation to lead agents for revenue decisions
- Revenue-based approval workflows

## Implementation Steps

### Phase 1: Schema Foundation
1. Update Convex schema with revenue tables
2. Add lead agent role types
3. Create revenue tracking relationships

### Phase 2: Lead Agent Registration
1. Register Jordan, Casey, Alex with proper hierarchy
2. Set up org assignments for lead agent roles
3. Configure revenue-focused task types

### Phase 3: Revenue Dashboard
1. Create new revenue-focused dashboard components
2. Replace task metrics with revenue KPIs
3. Add lead agent hierarchy visualization

### Phase 4: Task Routing & Orchestration
1. Update task assignment logic for revenue focus
2. Implement revenue-based prioritization
3. Add lead agent escalation workflows

### Phase 5: Revenue Tracking Integration
1. Track revenue impact in content drops
2. Update approval workflows for revenue decisions
3. Implement revenue attribution for agent performance

## Revenue KPIs to Track
- Total revenue generated
- Revenue per agent
- Customer acquisition cost (CAC)
- Customer lifetime value (CLV)
- Revenue retention rate
- Lead-to-customer conversion rate
- Revenue growth rate

## Success Metrics
- Revenue increase from agent-orchestrated activities
- Lead agent hierarchy adoption rate
- Revenue attribution accuracy
- Revenue-focused task completion rate