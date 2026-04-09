// Canonical doc templates for repos.

export const CANONICAL_DOCS = {
  prd: 'PRD.md',
  app_flow: 'APP_FLOW.md',
  tech_stack: 'TECH_STACK.md',
  frontend_guidelines: 'FRONTEND_GUIDELINES.md',
  backend_structure: 'BACKEND_STRUCTURE.md',
  implementation_plan: 'IMPLEMENTATION_PLAN.md',
  claude: 'CLAUDE.md',
  progress: 'progress.md',
}

export const PLATFORM_CANONICAL_DOCS = {
  runtime_model: 'RUNTIME_MODEL.md',
  operations: 'OPERATIONS.md',
  security_model: 'SECURITY_MODEL.md',
  evals: 'EVALS.md',
}

export function generateCanonicalTemplate(docType, repoName, repoMeta = {}) {
  const today = new Date().toISOString().slice(0, 10)

  switch (docType) {
    case 'prd':
      return `---
title: "${repoName} — Product Requirements Document"
doc_type: prd
repo: ${repoName}
created: ${today}
updated: ${today}
status: draft
---

# ${repoName} PRD

## Overview
**Problem**: (What problem does this solve?)

**Solution**: (How do we solve it?)

**Goals**: (Primary success metrics)

## User Personas
- Persona 1: ...
- Persona 2: ...

## Feature Set
### MVP Features
- Feature 1
- Feature 2

### Future Features
- Feature 3
- Feature 4

## Success Criteria
- Criterion 1
- Criterion 2

## Timeline
- Phase 1: ...
- Phase 2: ...

## Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Risk 1 | High | ... |

## Resources & Budget
- Team: ...
- Budget: ...
- Dependencies: ...
`

    case 'app_flow':
      return `---
title: "${repoName} — Application Flow"
doc_type: app_flow
repo: ${repoName}
created: ${today}
updated: ${today}
---

# Application Flow

## User Journeys

### Journey 1: Main Happy Path
1. User enters the application
2. ...
3. User completes task

### Journey 2: Error/Recovery Path
1. Error occurs
2. ...
3. User recovers

## State Diagram
\`\`\`
[Initial] -> [Loading] -> [Ready]
[Ready] -> [Active] -> [Complete]
[Active] -> [Error] -> [Ready]
\`\`\`

## Component Interactions
\`\`\`
Component A -> Component B -> Component C
\`\`\`
`

    case 'tech_stack':
      return `---
title: "${repoName} — Technology Stack"
doc_type: tech_stack
repo: ${repoName}
created: ${today}
updated: ${today}
---

# Technology Stack

## Frontend
- Framework: ...
- UI Library: ...
- State Management: ...
- Testing: ...

## Backend
- Runtime: ...
- API Framework: ...
- Database: ...
- Cache: ...

## DevOps
- Hosting: ...
- CI/CD: ...
- Monitoring: ...
- Logging: ...

## Third-party Services
- Service 1: ...
- Service 2: ...

## Justification
| Technology | Rationale | Alternatives Considered |
|-----------|-----------|-------------------------|
| ... | ... | ... |
`

    case 'frontend_guidelines':
      return `---
title: "${repoName} — Frontend Guidelines"
doc_type: frontend_guidelines
repo: ${repoName}
created: ${today}
updated: ${today}
---

# Frontend Guidelines

## Folder Structure
\`\`\`
src/
├── components/
│   ├── common/
│   ├── features/
│   └── layouts/
├── hooks/
├── utils/
├── styles/
└── pages/
\`\`\`

## Component Conventions
- Functional components with hooks
- Named exports
- PropTypes or TypeScript

## Styling
- Approach: CSS Modules / Tailwind / ...
- Naming conventions: ...
- Responsive breakpoints: ...

## State Management
- Provider: Redux / Context / ...
- Pattern: ...

## Testing
- Framework: Jest / Vitest / ...
- Coverage target: ...
- Testing pattern: ...
`

    case 'backend_structure':
      return `---
title: "${repoName} — Backend Structure"
doc_type: backend_structure
repo: ${repoName}
created: ${today}
updated: ${today}
---

# Backend Structure

## Service Architecture
\`\`\`
API Gateway
├── Auth Service
├── Core Service
├── Data Service
└── Integration Service
\`\`\`

## Folder Structure
\`\`\`
src/
├── routes/
├── controllers/
├── services/
├── models/
├── middleware/
├── utils/
└── tests/
\`\`\`

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/... | ... |
| POST | /api/... | ... |

## Database Schema
- Table 1: ...
- Table 2: ...

## Error Handling
- Convention: ...
- HTTP Status Codes: ...
`

    case 'implementation_plan':
      return `---
title: "${repoName} — Implementation Plan"
doc_type: implementation_plan
repo: ${repoName}
created: ${today}
updated: ${today}
status: draft
---

# Implementation Plan

## Phases

### Phase 1: Foundation (Week 1-2)
**Goals**: Setup and core infrastructure

**Tasks**:
- [ ] Task 1
- [ ] Task 2

**Deliverables**: ...

### Phase 2: Core Features (Week 3-4)
**Goals**: Build main feature set

**Tasks**:
- [ ] Task 1
- [ ] Task 2

**Deliverables**: ...

### Phase 3: Polish & Deploy (Week 5)
**Goals**: Quality assurance and launch

**Tasks**:
- [ ] Task 1
- [ ] Task 2

**Deliverables**: ...

## Dependencies & Blockers
- Dependency 1: ...
- Blocker 1: ...

## Team Assignments
| Task | Owner | Support |
|------|-------|---------|
| Task 1 | ... | ... |

## Success Metrics
- Metric 1: ...
- Metric 2: ...
`

    case 'claude':
      return `---
title: "${repoName} — Agent Instructions"
doc_type: claude
repo: ${repoName}
created: ${today}
updated: ${today}
---

# ${repoName} Agent Instructions

## Role & Context
This document defines how Claude agents operate within the ${repoName} repository.

## Agents & Responsibilities

### Lead Agent
- Role: Project oversight and coordination
- Scope: wiki/repos/${repoName}/
- Allowed writes:
  - wiki/repos/${repoName}/canonical/**
  - wiki/repos/${repoName}/progress.md
  - wiki/repos/${repoName}/agent-memory/lead/**

### Worker Agents
- Role: Implementation and research
- Scope: Feature-specific directories
- Allowed writes:
  - wiki/repos/${repoName}/agent-memory/worker/**
  - wiki/repos/${repoName}/tasks/**
  - wiki/repos/${repoName}/rewrites/**

## Key Workflows
- Close task: Commit progress, update progress.md
- Discovery: Publish to bus/discovery channel
- Escalation: Publish to bus/escalation for lead

## Source of Truth
- Canonical docs: wiki/repos/${repoName}/canonical/
- Progress: wiki/repos/${repoName}/progress.md
- Imported sources: wiki/repos/${repoName}/repo-docs/ (READ-ONLY)

## Constraints
- No direct writes to imported docs (repo-docs/)
- All writes require agent-contract validation
- Task logs are append-only
`

    case 'progress':
      return `---
title: "${repoName} — Progress Log"
doc_type: progress
repo: ${repoName}
created: ${today}
updated: ${today}
---

# ${repoName} Progress

## Current Status
- Phase: Planning
- Completion: 0%

## Recent Updates
(Will be populated by agent task logs)

## Milestones
- [ ] Phase 1: Foundation
- [ ] Phase 2: Core Features
- [ ] Phase 3: Launch

## Known Issues
(None yet)

## Next Steps
1. Finalize requirements
2. Set up development environment
3. Begin implementation
`

    case 'runtime_model':
      return `---
title: "Runtime Model — ${repoName}"
doc_type: runtime_model
repo: ${repoName}
created: ${today}
updated: ${today}
---

# Runtime Model

## Architecture Overview
(System design, key components, execution flow)

## Execution Model
(How the system runs, concurrency model, scheduling)

## Memory Model
(Memory layout, alignment, heap structure)

## Performance Characteristics
(Latency, throughput, resource usage)

## Scaling Strategy
(Horizontal/vertical scaling, bottlenecks)
`

    case 'operations':
      return `---
title: "Operations — ${repoName}"
doc_type: operations
repo: ${repoName}
created: ${today}
updated: ${today}
---

# Operations Guide

## Deployment
(How to deploy, rollback, disaster recovery)

## Monitoring & Alerts
(Metrics, dashboards, alert thresholds)

## Runbooks
(Common operational procedures)

## Troubleshooting
(Debug guide, log interpretation)

## SLAs & Targets
(Availability, latency targets)
`

    case 'security_model':
      return `---
title: "Security Model — ${repoName}"
doc_type: security_model
repo: ${repoName}
created: ${today}
updated: ${today}
---

# Security Model

## Authentication & Authorization
(Who can access what, how)

## Data Protection
(Encryption, storage, transmission)

## Threat Model
(Identified threats, mitigations)

## Compliance
(Standards, certifications)

## Security Audit Trail
(Logging, monitoring, incident response)
`

    case 'evals':
      return `---
title: "Evaluation Framework — ${repoName}"
doc_type: evals
repo: ${repoName}
created: ${today}
updated: ${today}
---

# Evaluation Framework

## Success Metrics
(What we measure, how we measure)

## Benchmarks
(Performance targets, comparison baselines)

## Test Suite
(Automated tests, coverage)

## Evaluation Schedule
(When we evaluate, who evaluates)

## Results & Analysis
(Past evaluation results, trends)
`

    default:
      return `---
title: "${repoName} — ${docType}"
doc_type: ${docType}
repo: ${repoName}
created: ${today}
updated: ${today}
---

# ${docType}

(Content placeholder)
`
  }
}

export function generateHomePage(repoRecord) {
  const today = new Date().toISOString().slice(0, 10)
  return `---
title: "${repoRecord.repo_name} — Home"
repo: ${repoRecord.repo_name}
type: page
created: ${today}
updated: ${today}
---

# ${repoRecord.repo_name}

**Owner**: ${repoRecord.owner}
**Repository**: [${repoRecord.repo_name}](${repoRecord.description || ''})
**Visibility**: ${repoRecord.visibility}
**Status**: ${repoRecord.status}

## Quick Links
- [Product Requirements](./canonical/PRD.md)
- [Implementation Plan](./canonical/IMPLEMENTATION_PLAN.md)
- [Progress](./progress.md)
- [Agent Instructions](./canonical/CLAUDE.md)

## Documentation
### Architecture & Design
- [Technology Stack](./canonical/TECH_STACK.md)
- [Application Flow](./canonical/APP_FLOW.md)
- [Frontend Guidelines](./canonical/FRONTEND_GUIDELINES.md)
- [Backend Structure](./canonical/BACKEND_STRUCTURE.md)

### Source Code
- [Repository](${repoRecord.description || '#'})
- [Imported Docs](./repo-docs/)

### Operations
- [Progress Log](./progress.md)
- [Task History](./tasks/)
- [Agent Memory](./agent-memory/)
- [Bus & Messages](./bus/)

## Recent Activity
(See progress.md for activity log)

## Team & Collaboration
- Lead: (TBD)
- Contributors: (TBD)

Last updated: ${today}
`
}

export function generateProgressPage(repoName) {
  const today = new Date().toISOString().slice(0, 10)
  return `---
title: "${repoName} — Progress"
repo: ${repoName}
type: progress
created: ${today}
updated: ${today}
---

# ${repoName} Progress Log

## Project Status
- **Phase**: Planning
- **Completion**: 0%
- **Last Updated**: ${today}

## Milestones
- [ ] Phase 1: Foundation & Setup
- [ ] Phase 2: Core Implementation
- [ ] Phase 3: Testing & Refinement
- [ ] Phase 4: Launch

## Known Blockers
(None at this time)

## Recent Updates
(Populated by agent commits)

## Next Actions
1. Establish team and roles
2. Finalize requirements
3. Begin development

---

*This page is maintained by agents. Manual updates will be preserved.*
`
}

export function generateRepoCLAUDE(repoName, repoMeta = {}) {
  const today = new Date().toISOString().slice(0, 10)
  return `---
title: "${repoName} — Agent Instructions"
doc_type: claude
repo: ${repoName}
created: ${today}
updated: ${today}
---

# ${repoName} Agent Instructions

## Context
You are an agent working on the **${repoName}** repository.

All work is tracked in: \`wiki/repos/${repoName}/\`

## Key Locations
- **Canonical docs**: \`wiki/repos/${repoName}/canonical/\` (READ-ONLY or lead-only)
- **Progress log**: \`wiki/repos/${repoName}/progress.md\`
- **Source code mirror**: \`wiki/repos/${repoName}/repo-docs/\` (READ-ONLY, synced from GitHub)
- **Your memory**: \`wiki/repos/${repoName}/agent-memory/<tier>/<agent-id>/\`
- **Task logs**: \`wiki/repos/${repoName}/tasks/\`
- **Rewrites**: \`wiki/repos/${repoName}/rewrites/\`
- **Bus channels**: \`wiki/repos/${repoName}/bus/\`

## Agent Roles

### Lead Agent
- Oversee project progress
- Maintain canonical docs (\`canonical/*.md\`)
- Review and promote discoveries/escalations
- Update progress.md
- Authority over major decisions

### Worker Agents
- Implement features
- Research problems
- Publish discoveries to bus/discovery
- Log tasks and findings
- Request escalation for blockers

## Workflows

### Closing a Task
When you finish a task:

\`\`\`javascript
const result = await closeRepoTask(kbRoot, '${repoName}', {
  taskLogEntry: '## Task: Feature X\\n- Implemented Y\\n- Tested Z\\n',
  hotUpdate: '...',  // Update hot memory if needed
  rewrites: [
    { type: 'spec', project: '${repoName}', body: '...' }
  ],
  discoveries: [
    { to: null, body: '... found that ...', promote_candidate: false }
  ],
  escalations: [
    { to: 'lead-agent', body: '... blocker: ...' }
  ]
})
\`\`\`

### Publishing a Discovery
\`\`\`javascript
publishRepoBusItem(kbRoot, '${repoName}', {
  channel: 'discovery',
  from: 'worker-agent',
  type: 'discovery',
  priority: 'medium',
  body: '...'
})
\`\`\`

### Escalating an Issue
\`\`\`javascript
publishRepoBusItem(kbRoot, '${repoName}', {
  channel: 'escalation',
  from: 'worker-agent',
  to: 'lead-agent',
  priority: 'high',
  body: 'Blocker: ...'
})
\`\`\`

## Constraints
- ✅ Write to \`agent-memory/<tier>/<agent-id>/\`
- ✅ Write to \`tasks/\` with detailed logs
- ✅ Write to \`rewrites/\` with drafts for review
- ✅ Publish to bus channels
- ❌ Do NOT write directly to \`repo-docs/\` (it's synced from GitHub)
- ❌ Do NOT write to \`canonical/\` unless you're the lead agent
- ❌ Do NOT delete or archive anything without approval

## Memory Classes
- **profile**: Your identity and role
- **hot**: Current focus, quick facts (auto-compacted >500 words)
- **working**: Task logs (append-only)
- **learned**: Gotchas and patterns
- **rewrite**: Draft specifications for review
- **bus**: Messages from other agents

## Asking for Help
Post to \`bus/escalation\` with:
- Clear description of the blocker
- Relevant context (links to docs, code, etc.)
- What you've tried so far
- What you need from the lead

## Success
You've succeeded when:
- ✅ Feature/task is complete and logged
- ✅ Canonical docs reflect current state
- ✅ Discoveries are published to the team
- ✅ Blockers are escalated with full context

---

*Generated ${today}. Update this CLAUDE.md as project norms evolve.*
`
}
