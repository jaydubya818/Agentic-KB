---
title: Workday Xpresso Pilot — Agentic KB + Personal Brain Rollout
type: plan
date: 2026-04-18
status: draft
tags: [rollout, workday, xpresso, pilot, agentic-kb, llm-wiki]
---

# Xpresso Pilot — Agentic KB + Personal Brain Rollout

## Goal
Every Xpresso developer on the pilot team gets (a) a queryable **shared team KB** of Xpresso patterns, idioms, and internal docs, and (b) a **personal second brain** for their own task context — both wired into Claude Code via MCP. Trust and secrecy posture must be appropriate for proprietary Workday code.

## Deliverable stack per developer

```
~/workday/xpresso-kb/            ← shared team KB (forked Agentic-KB)
  web/                           ← internal-hosted Next.js :3002 (shared instance)
  mcp/server.js                  ← local MCP binary pointing at hosted instance
~/workday/brain/                 ← personal LLM Wiki (per dev, local-only)
  brains/master/                 ← durable personal decisions
  brains/agents/xpresso/         ← task-scoped brain
~/.claude/
  agents/, skills/               ← Hermes + Xpresso-specific sub-agents
  mcp-settings.json              ← both MCP servers registered
```

## Phased plan

### Phase 0 — Preflight (week -2 to 0)
Legal, security, and infra clearance before a single dev touches the repo.

- **Fork + license review.** Confirm licenses on `Agentic-KB` and `LLMwiki`. Fork into a Workday-owned internal org (GitHub Enterprise or Bitbucket). Strip any Jay-personal content (`wiki/personal/`, Obsidian vault paths, Sofie agent config).
- **InfoSec review.** Threat model: proprietary Xpresso code leaving the laptop. Document LLM data flow, retention, and egress boundary.
- **LLM gateway.** Identify Workday's approved internal LLM endpoint (expected: Anthropic/OpenAI proxy behind SSO, no training on prompts). Confirm models available — both `claude-sonnet-4-6` class (for Agentic-KB compile/query) and an OpenAI-compatible chat endpoint (for `brain ask`).
- **Hosting target for shared KB.** Pick one: internal K8s namespace, ECS/Fargate, or an OpsTools VM. Requires: HTTPS terminator, SSO, audit log retention.
- **Pilot team selection.** 5–8 Xpresso devs + 1 platform lead + 1 tech writer/seeder. Small enough to iterate; large enough to expose rough edges.

**Exit criteria:** Security approval signed, internal fork exists, LLM gateway URL + API key issued, hosting VM/namespace provisioned.

### Phase 1 — Harden the forks (week 1–2)
Two parallel workstreams. Estimate ~1.5 eng weeks combined if you have someone who knows both codebases; ~3 if not.

**Agentic-KB hardening**
- Swap Anthropic SDK calls in `web/src/app/api/compile/route.ts` and `web/src/app/api/query/route.ts` to use Workday's gateway (`ANTHROPIC_BASE_URL` env + internal auth header).
- Replace PIN with SSO (OIDC). The RBAC layer (`web/src/lib/rbac.ts`, `namespaces.example.json`) already does namespace ACLs — wire the OIDC group claim to namespace.
- Enforce audit log retention to comply with Workday policy (likely ≥90 days, centralized). Point `logs/audit.log` at the internal log bus.
- Strip the public webhook ingest or gate it behind an internal token + IP allowlist.
- Containerize: one Dockerfile for the Next.js app, one for the MCP server. Health endpoint, readiness probe, non-root user.

**LLMwiki hardening**
- Set `OPENAI_BASE_URL` + `OPENAI_MODEL` to the internal gateway in the default `.env` scaffold that `brain init` writes.
- Default to **heuristic-only** mode (no LLM calls) unless the dev explicitly opts in — zero-egress baseline.
- Disable HeyGen video path in the corp build (remove from CLI help; leave code as dead path).
- Update `brain doctor` to warn if `OPENAI_BASE_URL` points outside `*.workday.com`.

**Exit criteria:** Both forks build clean on a corp laptop, call only internal endpoints, and pass a basic network-egress test (`blocks api.openai.com / api.anthropic.com`).

### Phase 2 — Seed the corpus (week 2–3)
A KB is only as useful as what's in `raw/`. Run a seeding sprint in parallel with Phase 1.

**Seed corpus checklist for Xpresso team KB**
- Xpresso language spec (all current versions, as markdown — use `markitdown` on PDFs/Confluence exports).
- Compiler/runtime architecture docs.
- Standard-library reference.
- 20–40 canonical code examples annotated with intent + tradeoffs → `raw/code-examples/`.
- ADRs / design decisions → `raw/architecture/`.
- Top 10 known anti-patterns and their fixes.
- Onboarding runbook + common-task recipes.
- Recent internal tech talks / transcripts → `raw/transcripts/`.

Run `kb compile` after each batch. Spot-check compiled wiki pages against source for hallucinations; log any into `wiki/log.md` with `[UNVERIFIED]` tags.

**Exit criteria:** ≥150 compiled wiki pages, ≥5 recipe pages tagged `tested: true`, lint pass with zero contradictions severity=high.

### Phase 3 — Pilot onboarding (week 3–4)
- Adapt `scripts/team-setup.sh` to the internal forks and gateway URLs. One-liner install on each dev's laptop.
- Dry-run with 2 devs first. Fix surface issues (shell quirks, env leakage, Claude Desktop MCP registration).
- Roll to the remaining 5–6 devs in a 90-minute live onboarding. Agenda: query the shared KB, init their personal brain, add one file, run `brain diff → approve`, register both MCP servers.
- Each dev creates `brains/agents/xpresso/` for task-scoped notes.

**Exit criteria:** All pilot devs complete 3 sample workflows end-to-end (query shared, capture personal, promote a note to master).

### Phase 4 — Measure + iterate (week 4–8)
Run the pilot for 4 weeks with weekly check-ins.

**Success metrics**
- **Usage:** ≥3 `kb query` or `brain ask` calls per dev per week.
- **Quality:** ≥70% of surveyed answers rated "usable as-is" or "usable with edits." Unrated/bad answers opened as contradiction issues in `wiki/log.md`.
- **Contribution:** ≥2 merged raw/ additions per dev over 4 weeks (patterns, recipes, gotchas).
- **Lint health:** weekly lint report shows declining orphan-page count and stable contradiction count.
- **Time-to-answer:** median time from question → usable answer < 30 seconds (measured via audit log latency).

**Iteration loop**
Weekly: run `kb lint`, review `logs/audit.log` for failed queries, interview 2 devs, patch the top pain. Promote week-N lessons into `wiki/personal/` or `patterns/`.

**Exit criteria for pilot → wider rollout:** metrics hit for 2 consecutive weeks, no P0 security issues, hosting SLO ≥ 99% uptime.

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Proprietary code egresses to public LLM | Phase 1 egress test + corp firewall block of public endpoints |
| Hallucinated Xpresso syntax in compiled wiki | Mandatory `[UNVERIFIED]` tagging; `reviewed: false` default; seed with canonical docs first |
| Low adoption because overhead > value | Pilot-small-first; 90-minute onboarding; measure usage weekly and kill if < threshold |
| Shared KB becomes stale | Scheduled lint (already built into Agentic-KB); on-call "KB steward" rotates weekly in the pilot team |
| Personal brain secrets leak via git push | `brain` is local-only by default; add a `.gitignore` template that excludes brains from corp remotes; document in TEAM-SETUP |
| Dev confusion between shared and personal | Two distinct CLI names (`kb` vs `brain`); onboarding slide makes the distinction the first thing taught |

## Open questions to resolve in Phase 0

1. Which internal LLM gateway, which models, and what are the rate limits per dev?
2. Hosting target for the shared KB — what's the fastest approved path?
3. Does Workday policy allow the shared KB to store code snippets verbatim, or only paraphrased summaries?
4. Who is the executive sponsor for the pilot, and what would make them approve a wider rollout?
5. How do we handle Xpresso language changes between versions — do we version the wiki, or rebuild?

## Rough cost / effort estimate

- **Eng effort to harden both forks:** 2–3 weeks (1 eng, assuming familiarity with Next.js + TS).
- **Seed corpus sprint:** 1 week (2 people: 1 writer, 1 SME reviewer).
- **Onboarding + pilot run:** 4 calendar weeks, ~10% of each pilot dev's time.
- **LLM gateway usage:** low — compile is one-time per doc; queries are cheap. Estimate $50–$150/dev/month at current token prices, well below any Workday-internal budget.

## Not in scope for pilot
- Wider team rollout (gate on pilot metrics).
- Multi-team federation / cross-KB search.
- Video pipeline (HeyGen).
- Sofie-style "Chief of Staff" agent (personal brain is enough for pilot).
- Mobile / non-Mac support.

## Sources
- `/mnt/Agentic-KB/TEAM-SETUP.md` — existing dual-install pattern
- `/mnt/Agentic-KB/ENTERPRISE_PLAN.md` — P0-P3 enterprise roadmap
- `/mnt/Agentic-KB/README.md` — current state, 112/112 tests passing
- `/mnt/My LLM Wiki/README.md` — `brain` CLI surface, governance model
- GitHub: [jaydubya818/Agentic-KB](https://github.com/jaydubya818/Agentic-KB), [jaydubya818/LLMwiki](https://github.com/jaydubya818/LLMwiki)
