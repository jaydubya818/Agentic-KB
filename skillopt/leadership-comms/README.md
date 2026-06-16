# SkillOpt Pilot: Leadership Comms Drafting

## Scope
This is a low-risk SkillOpt pilot for one narrow skill: rewriting Jay's rough Slack, email, and work-message drafts into clear, direct, professional, high-signal leadership communication.

## Safety Rules
- Proposal mode only.
- Do not auto-apply optimized skills.
- Do not modify active Hermes control files.
- Do not modify `SOUL.md`.
- Do not modify `AGENTS.md`.
- Do not modify `house-rules.md`.
- Do not modify cron jobs.
- Do not modify autonomy boundaries.
- Do not modify Night Shift safety rules.
- Do not modify Agentic-KB Night Shift automation.
- Stage every generated or optimized skill in `proposals/` for Jay's review.

## Files
- `baseline_skill.md` — initial Leadership Comms Drafting skill.
- `evals/eval_cases.md` — human-readable initial 20 eval cases.
- `evals/eval_cases.jsonl` — structured eval cases for future harness work.
- `proposals/` — staged optimized skills only.
- `results/` — score reports, comparison notes, and run artifacts.

## Acceptance Gate
Only recommend adoption if an optimized skill:
1. Improves at least 70% of eval cases versus `baseline_skill.md`.
2. Creates zero critical failures.
3. Preserves Jay's meaning.
4. Adds no unsupported facts.
5. Remains concise, direct, professional, and Jay-like.

Critical failures:
- changes Jay's meaning
- adds facts Jay did not provide
- sounds fake
- becomes too verbose
- softens necessary pushback too much
- sounds passive aggressive
- creates work-facing risk

## Manual SkillOpt Run Pattern
Do not run automatically. When Jay explicitly approves a run, use a separate working copy or scratch environment.

Suggested manual flow:

```bash
cd /Users/jaywest/Agentic-KB/skillopt/leadership-comms

# 1. Copy baseline into an isolated SkillOpt experiment workspace.
# 2. Build or point a custom SkillOpt benchmark/harness at evals/eval_cases.jsonl.
# 3. Run SkillOpt against only this narrow benchmark.
# 4. Write candidate outputs to proposals/, never over baseline_skill.md.
# 5. Score results into results/.
```

If using the SkillOpt repo directly:

```bash
# example only; requires a custom leadership-comms environment/harness first
python scripts/train.py --config configs/leadership-comms/default.yaml
python scripts/eval_only.py --config configs/leadership-comms/default.yaml --skill outputs/leadership-comms/<run_id>/skills/best_skill.md
```

## Required Proposal Naming
Use timestamped proposal files:

```text
proposals/YYYYMMDD-HHMMSS-candidate_skill.md
results/YYYYMMDD-HHMMSS-score_report.md
```

## Review Checklist Before Accepting Anything
- Did it improve at least 14 of 20 eval cases?
- Were there zero critical failures?
- Did it preserve Jay's intent in every case?
- Did it avoid adding unsupported facts?
- Did it make the ask, risk, or next step clearer?
- Did it keep necessary tension calm and controlled?
- Did it avoid corporate fluff and fake warmth?
- Did it avoid over-polishing into consultant voice?
- Did it stay concise?
- Would Jay send the outputs with minimal edits?
- Is the optimized skill still narrow to Leadership Comms Drafting?
- Does the proposal avoid changes to SOUL.md, AGENTS.md, cron, autonomy, or Night Shift rules?

## Adoption Rule
Even if the gate passes, adoption is manual. Jay or Hermes must explicitly approve copying any candidate into an active skill location.
