---
id: 01KNNVX2RGNB42SG1GY6H06VQ9
title: "Architecture: ingest-flow"
source: oh-my-mermaid
ingested: 2026-04-08T05:01:57Z
tags: [architecture, mermaid, autogen]
omm_perspective: "ingest-flow"
---

# ingest-flow

Ingest is how new content enters the vault. Four entry points converge on raw/: direct UI upload (/api/ingest), CLI commands (kb ingest-youtube, kb ingest-twitter), webhooks (/api/ingest/webhook with namespace RBAC), and GitHub Actions on merged PRs / closed issues / pushed docs. All writes are audited. Nothing is compiled until an explicit compile run — ingest and compile are decoupled so you can stage content before it becomes wiki.

## Diagram

```mermaid
flowchart TB
    subgraph Sources
        UI[Web UI upload]
        YT[YouTube URL]
        TW[Twitter archive.zip]
        GH[GitHub webhook<br/>PRs, issues, docs]
        SLACK[Slack webhook]
        CUSTOM[Custom API client]
    end

    subgraph Entry["Entry points"]
        INGEST[/api/ingest/]
        CLIYT[kb ingest-youtube]
        CLITW[kb ingest-twitter]
        WH[/api/ingest/webhook<br/>RBAC: namespace token/]
    end

    UI --> INGEST
    YT --> CLIYT
    TW --> CLITW
    GH --> WH
    SLACK --> WH
    CUSTOM --> WH

    INGEST --> RAW_UP[raw/uploads/]
    CLIYT --> RAW_TR[raw/transcripts/]
    CLITW --> RAW_TW[raw/twitter/]
    WH --> RAW_WH[raw/webhooks/&lt;ns&gt;/]

    RAW_UP & RAW_TR & RAW_TW & RAW_WH --> AUDIT[(audit.log<br/>op: ingest/webhook)]
    RAW_UP & RAW_TR & RAW_TW & RAW_WH -.staged for.-> COMPILE[[compile run]]
```

