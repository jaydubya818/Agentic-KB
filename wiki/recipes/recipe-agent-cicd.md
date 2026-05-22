---
title: "Recipe: CI/CD Pipeline for Agent Systems"
type: recipe
difficulty: advanced
time_estimate: 4-8h
prerequisites:
  - Eval harness configured (DeepEval or Inspect AI)
  - Baseline metric snapshot captured against a known-good prompt version
  - Docker installed
  - Staging environment accessible
  - Git repository with branch protection enabled
tested: false
tags: [agentic, evaluation, deployment, observability, cicd, orchestration]
reviewed: false
reviewed_date: ""
---

# CI/CD Pipeline for Agent Systems

Treat prompts and policies like code: version them, test them, and block deploys on metric regression. An agent CI/CD pipeline is structurally identical to a software pipeline with one additional gate — the eval gate that runs after Docker build and before production.

## Goal

Build a CI/CD pipeline that enforces: (1) every prompt change goes through the same review gate as a code change; (2) metric regression on any named eval metric blocks merge; (3) canary deploys to staging run against a golden evaluation set before production promotion.

## Prerequisites

- Eval harness: [[frameworks/framework-deepeval]] (Python) or [[frameworks/framework-inspect-ai]] (Python) — pick one, commit to it
- Baseline metrics snapshot: a JSON file committing the current PlanQuality, ToolCalling, ArgumentCorrectness, and TaskAccuracy scores against your golden dataset. This is the regression baseline — without it, the eval gate has nothing to compare against.
- Docker: containerized agent service (orchestrator + tools)
- Staging environment: a deploy target that mirrors production configuration but uses a separate vector store and smaller dataset
- Git with branch protection: no direct pushes to `main`; PRs required

## Steps

### 1. Capture baseline metrics (one-time setup)

```bash
python scripts/eval/run_baseline.py \
  --dataset evals/golden-set.jsonl \
  --output evals/baseline-metrics.json

# baseline-metrics.json shape:
# {
#   "plan_quality": 0.87,
#   "tool_calling": 0.91,
#   "argument_correctness": 0.84,
#   "task_accuracy": 0.79,
#   "captured_at": "2026-05-16T00:00:00Z",
#   "prompt_sha": "abc123"
# }
```

Commit `evals/baseline-metrics.json` to the repo. This is the contract every PR is measured against.

### 2. Define the eval gate script

```python
# scripts/eval/eval_gate.py
import json, sys

REGRESSION_THRESHOLD = 0.05  # 5% drop triggers failure

with open("evals/baseline-metrics.json") as f:
    baseline = json.load(f)

with open("evals/current-metrics.json") as f:
    current = json.load(f)

failures = []
for metric, baseline_score in baseline.items():
    if metric in ("captured_at", "prompt_sha"):
        continue
    delta = current[metric] - baseline_score
    if delta < -REGRESSION_THRESHOLD:
        failures.append(
            f"{metric}: {baseline_score:.3f} → {current[metric]:.3f} "
            f"(Δ {delta:+.3f}, threshold {-REGRESSION_THRESHOLD:.3f})"
        )

if failures:
    print("EVAL GATE FAILED — metric regression detected:")
    for f in failures:
        print(f"  ✗ {f}")
    sys.exit(1)

print("EVAL GATE PASSED")
sys.exit(0)
```

### 3. Build the CI pipeline (GitHub Actions example)

```yaml
# .github/workflows/agent-ci.yml
name: Agent CI

on:
  pull_request:
    branches: [main]

jobs:
  lint-and-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Lint prompts
        run: python scripts/lint_prompts.py  # checks prompt files for required fields
      - name: Type check
        run: mypy src/

  unit-tests:
    runs-on: ubuntu-latest
    needs: lint-and-types
    steps:
      - uses: actions/checkout@v4
      - name: Run unit tests
        run: pytest tests/unit/ -x --timeout=60

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - name: Run integration tests (mocked tools)
        run: pytest tests/integration/ -x --timeout=120

  docker-build:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t agent-service:${{ github.sha }} .

  staging-deploy:
    runs-on: ubuntu-latest
    needs: docker-build
    steps:
      - name: Deploy to staging
        run: ./scripts/deploy.sh staging ${{ github.sha }}
      - name: Wait for health check
        run: ./scripts/wait_healthy.sh staging 60

  eval-gate:
    runs-on: ubuntu-latest
    needs: staging-deploy
    steps:
      - uses: actions/checkout@v4
      - name: Run canary eval against staging
        run: |
          python scripts/eval/run_eval.py \
            --env staging \
            --dataset evals/golden-set.jsonl \
            --output evals/current-metrics.json
      - name: Check metric regression
        run: python scripts/eval/eval_gate.py
```

### 4. Prompt change review gate

Add a PR template rule: any PR that modifies files under `prompts/` must include a `## Prompt Change` section documenting: (1) which prompt was changed, (2) what behavior change is intended, (3) eval results before/after (paste the `current-metrics.json` diff).

Enforce this with a PR template check:

```bash
# scripts/check_pr_template.py — runs in lint step
# Fails if files under prompts/ are modified but PR body lacks "## Prompt Change"
```

### 5. Production promotion

After eval gate passes and PR is merged, a separate deploy job triggers production promotion:

```yaml
# Triggered on push to main (after merge)
production-deploy:
  needs: [eval-gate]
  steps:
    - name: Promote staging image to production
      run: ./scripts/deploy.sh production ${{ github.sha }}
    - name: Update baseline metrics
      run: |
        cp evals/current-metrics.json evals/baseline-metrics.json
        git add evals/baseline-metrics.json
        git commit -m "chore(eval): update baseline after ${{ github.sha }}"
        git push
```

## Verification

A successful pipeline run produces:
- Green CI status on all 6 jobs (lint → types → unit → integration → docker → eval-gate)
- `evals/current-metrics.json` shows all metrics within 5% of baseline
- Staging deployment shows healthy `/health` endpoint
- Production deployment completes within 10 minutes of merge

Simulate a regression to verify the gate works: temporarily lower one metric score in `baseline-metrics.json` by 10% and confirm the eval gate job exits with code 1.

## Common Failures & Fixes

**No baseline snapshot → can't detect regression.** Fix: run `scripts/eval/run_baseline.py` immediately after setting up the pipeline — before the first PR is opened. Commit the result. A missing baseline means the gate silently passes everything.

**Testing prompts in isolation → misses interaction effects with retrieval.** Fix: the golden dataset must include realistic retrieval scenarios — queries that require multi-hop retrieval, edge-case chunk hits, empty retrieval results. Prompts that score well on isolated unit tests can still fail when combined with real retrieval latency or empty context.

**Eval suite runs on production traffic → cost blowup.** Fix: keep the golden set to 50-100 examples, not production volume. Sample production traces for the golden set; don't eval every production call. Run the eval gate only on PRs, not on every commit.

## Next Steps

- Add [[concepts/observability]] integration: export eval results to Prometheus as gauge metrics — `agent_plan_quality`, `agent_tool_calling_accuracy` — for dashboard tracking over time
- Add [[patterns/pattern-adversarial-plan-review]] as a pre-merge step for high-stakes prompt changes
- Extend the golden set monthly by promoting interesting production traces via the [[patterns/pattern-episodic-judgment-log]] pattern → JSONL → golden set

## Related Recipes

- [[recipes/recipe-agent-evaluation]] — building the eval harness that this pipeline consumes
- [[recipes/recipe-production-deployment]] — the production deployment topology this pipeline targets
