---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: docs/COSTS.md
imported_at: "2026-04-25T16:02:21.257Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/docs/COSTS.md"
---

# Mission Control — Costs & Billing

Track spending across AI providers, infrastructure, and tools. **Review regularly** and update this doc with current numbers to catch spikes and approaching limits.

---

## Manual authentication required

**Status:** All billing dashboards require manual authentication — no access possible via automated checks.

Review the dashboards below and update the **Current spending** section with numbers. Check for unexpected spikes or approaching limits.

### Dashboard URLs (manual review)

| Provider | Billing / usage URL |
|----------|---------------------|
| **Anthropic** | https://console.anthropic.com/settings/billing |
| **OpenAI** | https://platform.openai.com/usage |
| **ElevenLabs** | https://elevenlabs.io/subscription |
| **Twilio** | https://console.twilio.com/billing |
| **Cursor** | (Cursor Settings → Account / Billing in app or cursor.com) |
| **GitHub** | https://github.com/settings/billing |
| **Vercel** | https://vercel.com/dashboard/billing |
| **Perplexity** | (Perplexity account / subscription — check app or web) |
| **OpenRouter** | https://openrouter.ai/credits |
| **Google / Gemini** | https://console.cloud.google.com/billing (Vertex AI / Gemini usage) |
| **Convex** | https://dashboard.convex.dev (Billing) |

**Action:** Please review today and update the **Current spending** section below with current spending across all services. Check for any unexpected spikes or approaching limits.

---

## Current spending

*(Update after each manual review.)*

| Service | Last checked | Amount / notes |
|---------|--------------|----------------|
| Anthropic | — | — |
| OpenAI | — | — |
| ElevenLabs | — | — |
| Twilio | — | — |
| Cursor | — | — |
| GitHub | — | — |
| Vercel | — | — |
| Perplexity | — | — |
| OpenRouter | — | — |
| Google / Gemini | — | — |
| Convex | — | *(dashboard.convex.dev → Billing)* |

---

## Internal cost tracking

Mission Control tracks **run-level costs** (agents, tasks, budgets) in-app. See:

- **UI:** Cost analytics / Costs dashboard
- **API:** `GET /api/costs/daily`, `GET /api/costs/agent/:id`, etc. (see [Runbook](MISSION_CONTROL_RUNBOOK.md))
- **Convex:** `quotaTracking`, `runs.costUsd`, budget alerts

This doc is for **external provider billing** (manual dashboards above), not in-app cost attribution.
