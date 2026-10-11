# Fleet Registry (shared by all GitHub-improving scheduled jobs)

Created 2026-10-11. Every job READS this before acting and APPENDS to `work-ledger.md`. Governance of existing jobs is unchanged; this file only adds coordination.

## Jobs, lanes, identities (PT unless noted)
| Job | Lane | Git identity (`jaydubya818+<name>@gmail.com`) | Time |
|---|---|---|---|
| nightly-ci-analysis | CI failures; `.github/workflows/**` Tier A only (<=20 lines) via PR | nightly-ci-analysis | 05:57 |
| notes-to-factory | Notes/KB ideas + Small/Medium backlog items | notes-to-factory | 08:20 |
| daily-repo-improvement | Rotating code review: docs/mechanical Tier A, Tier B PRs | daily-repo-improvement | 06:02 (13:02Z) |
| fleet-tests (Tier C) | Regression tests for untested modules, flaky-test reports, CI reliability | fleet-tests | 10:30 |
| fleet-security (Tier D) | Advisories, secret scan, dependency-vuln fixes (patch/minor only, PR) | fleet-security | 12:30 |
| fleet-dx (Tier E) + report | README/CONTRIBUTING/scripts/lint config, DX; daily engineering report | fleet-dx | 15:30 |
| Managed Agent "daily-repo-improvement" (platform.claude.com) | 16-repo subset (below). No distinct git identity observed on any of the 16 repos since 2026-09-18 -> treated as inactive/unverified | unknown | unknown |
| Codex / interactive sessions | Feature work on `codex/*`, `claude/*` branches (authored as Jay/Codex; NOT fleet jobs) | n/a | ad hoc |

Managed Agent 16 repos: Agentic-KB, ai-software-factory-mastery, relay, MyEveBot, AI-FDE-Agent, skillz, MissionControl, factory-pilot, hermes-harness-missioncontrol, Agentic-Pi-Harness, agentic_hr, MissionControlEnterprise, LLMwiki, governed-claude-subagents, Agent_Management_System, multi-agent-observability.

## Dedup protocol (mandatory before any change)
1. `gh pr list --repo jaydubya818/<repo> --state all --limit 100` and `gh issue list ... --state all`: skip if an open/closed PR or issue covers the same task. Closed-unmerged = rejected, never re-propose.
2. Grep `work-ledger.md` for `<repo>` + task slug; skip if claimed in last 14 days.
3. Branch naming: `<job>/YYYY-MM-DD-<slug>`. Claim by appending a `CLAIM` line to work-ledger.md (commit+push that path only) BEFORE editing.
4. Check `git log origin/<default> --since=3.days` for same files touched by another identity.

## Never (all jobs)
Auth/secrets/billing/migrations; `.github/workflows/**` except nightly-ci-analysis Tier A; merging PRs on MissionControl, MissionControlEnterprise, SellerFi, relay or any protected branch; force-push; `--no-verify`; empty/whitespace commits; dependency majors; deploys. A failing-then-passing test is required for any behavior change. Agent commits must use the job identity above, never the personal (non-plus-addressed) identity.

## Repo modes
- PR-only: MissionControl, MissionControlEnterprise, SellerFi, relay (required checks), any repo with branch protection/ruleset.
- Direct-to-default allowed ONLY for docs/mechanical Tier A in unprotected repos with green baseline (daily-repo-improvement only).
- Default branch `master`: twinz, soar.
