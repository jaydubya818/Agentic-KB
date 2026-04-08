---
id: 01KNNVX2RH7G856W44RV469275
title: "Architecture: overall-architecture/github-actions"
source: oh-my-mermaid
ingested: 2026-04-08T05:01:57Z
tags: [architecture, mermaid, autogen]
omm_perspective: "overall-architecture/github-actions"
---

# overall-architecture/github-actions

GitHub Actions workflow at .github/workflows/kb-ingest.yml. Fires on merged PRs, closed issues, and pushes that touch docs/ or ADR files. Posts to /api/ingest/webhook with the X-GitHub-Event header so the webhook adapter knows which shape to parse. Requires KB_WEBHOOK_URL + KB_WEBHOOK_SECRET repo secrets.

