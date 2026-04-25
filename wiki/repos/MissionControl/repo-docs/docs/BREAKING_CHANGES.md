---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: docs/BREAKING_CHANGES.md
imported_at: "2026-04-25T16:02:21.256Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/docs/BREAKING_CHANGES.md"
---

# Breaking Changes

**Version:** Simplification Release  
**Date:** 2026-02-22

## Overview

This document lists breaking changes introduced during the Mission Control simplification effort.

---

## Changes

### 1. Package Removal: `packages/voice` (DELETED)

**Impact:** HIGH

**Change:** The voice package has been completely removed.

**Migration:**
- If using voice features, implement directly in your application
- Use ElevenLabs API directly
- No direct replacement provided

**Files Removed:**
- `packages/voice/`

---

### 2. Script Renames

**Impact:** MEDIUM

**Change:** Package scripts renamed for consistency.

| Old | New |
|-----|-----|
| `pnpm run dev:orch` | `pnpm run dev:orchestration` |

**Migration:**
Update any CI/CD pipelines or documentation referencing the old script name.

---

### 3. Environment Variable Renames

**Impact:** MEDIUM

**Change:** Environment variables standardized.

| Old | New |
|-----|-----|
| `ORCH_PORT` | `ORCHESTRATION_PORT` |

**Migration:**
Update `.env.local` files:
```bash
# Old
ORCH_PORT=4100

# New
ORCHESTRATION_PORT=4100
```

---

### 4. Log Prefix Changes

**Impact:** LOW

**Change:** Log prefixes standardized.

| Old | New |
|-----|-----|
| `[orch]` | `[orchestration]` |

**Migration:**
Update any log parsing/filtering that relies on the old prefix.

---

## New Features (Non-Breaking)

### 1. `mc` CLI Command

**New:** Unified CLI for Mission Control.

```bash
mc doctor              # Health check
mc status              # System status
mc run <workflow>      # Start workflow
mc tasks [status]      # List tasks
mc claim               # Claim next task
```

### 2. Auto-Approval for LOW Risk

**New:** LOW risk approvals are now auto-approved.

**Behavior Change:**
- Previously: All approvals required human decision
- Now: LOW/GREEN risk approvals auto-approve

### 3. Structured Logging

**New:** JSON-formatted logs with standard fields.

```typescript
import { logger } from '@mission-control/shared';

logger.info('Task completed', {
  run_id: 'run_abc123',
  task_id: 'task_xyz789',
  agent_id: 'agent_001',
});
```

### 4. Retry Utilities

**New:** Exponential backoff and jitter for retries.

```typescript
import { withRetry } from '@mission-control/shared';

await withRetry(async () => {
  await convex.write(data);
}, { maxAttempts: 5 });
```

---

## Migration Checklist

- [ ] Update `.env.local` (ORCH_PORT → ORCHESTRATION_PORT)
- [ ] Update CI/CD scripts (dev:orch → dev:orchestration)
- [ ] Update log parsers ([orch] → [orchestration])
- [ ] Review voice usage (package removed)
- [ ] Test mc CLI commands
- [ ] Verify auto-approval behavior

---

## Compatibility

| Feature | Status |
|---------|--------|
| Task API | ✅ Compatible |
| Workflow API | ✅ Compatible |
| Agent API | ✅ Compatible |
| Convex Schema | ✅ Compatible |
| UI | ✅ Compatible |

---

## Questions?

See [docs/MISSION_CONTROL_RUNBOOK.md](MISSION_CONTROL_RUNBOOK.md) for troubleshooting.
