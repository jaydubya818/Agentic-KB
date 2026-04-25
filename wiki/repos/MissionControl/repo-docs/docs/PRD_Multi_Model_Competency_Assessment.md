---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: docs/PRD_Multi_Model_Competency_Assessment.md
imported_at: "2026-04-25T16:02:21.262Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/docs/PRD_Multi_Model_Competency_Assessment.md"
---

# PRD: Multi-Model Competency Assessment for Mission Control Agents

## 1) Overview

Mission Control needs a repeatable, evidence-based hiring and promotion system for AI agents where "candidates" can be different models (e.g., Opus 4.6, Codex 5.3, Kimi K 2.5 local) or different agent configurations (system prompt, tools, policies, memory packs).

This PRD defines a **Competency Assessment System (CAS)** that runs standardized assessment suites (like Support Triage) across multiple candidates, grades outputs deterministically, compares results, and produces hire/no-hire and autonomy recommendations (L1 → L2 → L3).

## 2) Problem Statement

Without a standardized process:

- Teams argue about which model/config is best.
- Results are anecdotal ("it felt good").
- Candidates can produce confident nonsense and slip through.
- There's no consistent measure of policy discipline, tool reliability, and artifact quality.
- No clean path to increase autonomy based on proven performance.

## 3) Goals

**Primary Goals**

1. Evaluate multiple candidates (different models/configs) on the same role-specific suite.
2. Produce deterministic scoring + hard gates (policy redlines, hallucinated evidence, schema violations).
3. Output a decision packet: ranked candidates + rationale + recommended autonomy (start L1).
4. Make it easy to add new roles/suites (Support Triage today, others tomorrow).
5. Track cost/latency per candidate and incorporate into scoring.

**Success Metrics**

- 0 fabricated tool outputs in passing candidates (gate).
- ≥80% "escalation packet acceptance" by humans in pilot.
- Reduce time-to-hire decision by 50% (vs manual debate).
- Ability to run N candidates × M cases with consistent results (reproducible).

## 4) Non-Goals

- Not a full ATS replacement for humans (yet).
- Not doing production execution; assessments run in sandbox/simulated environments.
- Not training or fine-tuning models (evaluation + selection only).

## 5) Users & Personas

**Primary:** CTO/Owner (best candidate + risk + autonomy), Supervisor/Orchestrator (control plane obedience), Hiring Manager (useful artifacts, minimal back-and-forth).

**Secondary:** Engineers / Support / On-call (fewer interruptions, higher signal).

## 6) Key Use Cases

1. Compare models: Run Support Triage suite on Opus 4.6 vs Codex 5.3 vs Kimi K 2.5.
2. Compare configurations: Same model, different prompts/tools/memory.
3. Promotion gating: Candidate passes 20 cycles → qualifies for L2.
4. Regression testing: Ensure best candidate stays best after changes.
5. Role portability: Reuse platform for Release Captain, QA Gatekeeper, etc.

## 7) Product Scope

**In scope:** Candidate registry (manifest, versions, adapters), test suite management (JSONL + rubrics + schemas), runner (execute candidate per case), deterministic grader, comparison dashboard + report, decision packet (JSON + markdown), cost/latency capture, autonomy recommendation (L1/L2/L3 gates).

**Out of scope (Phase 1):** Real-time human panel interviews in-tool; automatic memory pack generation.

## 8) Functional Requirements (summary)

- **FR-1/2** Candidate manifest (provider, base_model, system_prompt, tooling, redlines, adapter) + versioning.
- **FR-3/4** Suite = cases.jsonl + rubric.yaml + schemas; role-to-suite mapping.
- **FR-5/6/7** Runner: `run_case(candidate, case)` → artifacts + tool_trace + timing + cost/tokens; parallelism/budget; tool trace capture.
- **FR-8/9/10** Grader: schema, headings, question count, hallucination, redlines; score categories 1–5; gates; per-case explainability.
- **FR-11/12** Comparison view (rank, gate count, cost, latency, “why A beat B”); decision packet (decision_record.json, assessment_summary.md).
- **FR-13** Autonomy recommendation: L1→L2→L3 readiness from pass streaks, accuracy, hallucination=0, policy threshold.

## 9) Non-Functional Requirements

Reproducibility, auditability, security (secrets isolated, sandbox, no prod writes), scalability (50+ candidates × 100+ cases), extensibility (adapter plug-ins).

## 10) System Design

**Components:** Candidate Registry, Suite Registry, Runner, Artifact Store, Grader, Comparator, Report Generator, Dashboard (Phase 2).

**Data flow:** Select suite + candidates → Runner → Run JSONL → Grader → Comparator → Decision packet.

## 11) Data Models

- **Run output row:** case_id, triage_report, escalation_packet_md, customer_update_draft_md (optional), tool_trace, timing_ms, cost_usd, tokens.
- **Grade output row:** case_id, scores (policy_discipline, tool_reliability, triage_competence, communication_collaboration, cost_latency_efficiency), overall_weighted, gate_fail, failures.

## 12) UI Requirements (Phase 2)

Run setup, leaderboard, case drilldown, decision packet export.

## 13) APIs / CLI

**CLI (Phase 1):**

- `mc assess run --suite support_triage --candidates candidates/*.json --out runs/`
- `mc assess grade --suite support_triage --run runs/<candidate>.jsonl`
- `mc assess compare --suite support_triage --runs runs/*.graded.json`
- `mc assess report --suite support_triage --runs runs/*.graded.json --out decision_packet/`

## 14) Security & Policy

L1 behavior enforced; hard block redlines (prod db, mass messaging, public announcements, prod deploys); store tool outputs by reference.

## 15) Rollout Plan

**Phase 1 (MVP):** CLI, candidate manifests, suite runner, grader, comparator, Support Triage suite, decision packet.

**Phase 2:** Dashboard UI, panel simulation, scheduling/regression.

**Phase 3:** Autonomy promotions in policy engine, onboarding delta recommendations.

## 16) Acceptance Criteria

- Run 3+ candidates through Support Triage suite; produce run JSONL, graded JSON, leaderboard, decision packet.
- Grader catches hallucinated refs, redlines, schema violations; candidate that hallucinates fails automatically.

## 17) Open Questions

- Execution pattern per provider (direct API vs OpenClaw worker).
- Panel interviews: simulated prompts in suite vs separate workflow.
- Local models: HTTP server vs CLI vs containerized runtime.
