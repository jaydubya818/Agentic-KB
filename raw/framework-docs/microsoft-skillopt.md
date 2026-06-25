---
title: "microsoft-skillopt — GitHub README"
source_url: "https://github.com/microsoft/SkillOpt"
captured: "2026-06-18T11:59:57.276789-07:00"
captured_by: "Hermes Agentic-KB Scout manual run"
word_count: 1597
status: unprocessed
---

# Source: https://github.com/microsoft/SkillOpt

## Apple Notes context
Apple Notes 2026-06-15: skill training/evaluation loop; evaluate for nightly skill improvement gates, not direct auto-mutation.

## README

# SkillOpt: Executive Strategy for Self-Evolving Agent Skills

*Train agent skills like you train neural networks — with epochs, (mini-)batchsize, learning rates, and validation gates — but without touching model weights.*

[![Project Page](https://img.shields.io/badge/Project%20Page-SkillOpt-8dbb3c)](https://microsoft.github.io/SkillOpt/) [![Paper](https://img.shields.io/badge/Paper-arXiv-b31b1b)](https://arxiv.org/abs/2605.23904) [![Project Video](https://img.shields.io/badge/Project%20Video-Watch%20Demo-ff0000)](https://youtu.be/JUBMDTCiM0M) [![PyPI](https://img.shields.io/badge/PyPI-skillopt-green.svg)](https://pypi.org/project/skillopt/) [![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 📖 **For installation, data preparation, training/eval commands, the full configuration reference, and framework internals, see the [Documentation & Reproduction Guide](https://microsoft.github.io/SkillOpt/docs/guideline.html)** (rendered on GitHub Pages).

---

## News 🔥🔥🔥
- **[2026-06-15]** 😴 **SkillOpt-Sleep (preview)** — a nightly offline self-evolution companion for local coding agents (Claude Code / Codex / Copilot): review past sessions, replay recurring tasks, and consolidate validated skills behind a held-out gate. See **[`docs/sleep/README.md`](docs/sleep/README.md)** for what it is, how to use it, and results.
- **[2026-06-03]** 🎉 **[gbrain](https://github.com/garrytan/gbrain), [gbrain-evals](https://github.com/garrytan/gbrain-evals/blob/main/docs/benchmarks/2026-06-03-skillopt.md), and [darwin-skill](https://github.com/alchaincyf/darwin-skill) have all integrated SkillOpt.**
- **[2026-06-02]** 🎉 **SkillOpt [v0.1.0](https://github.com/microsoft/SkillOpt/releases/tag/v0.1.0) is now available on [PyPI](https://pypi.org/project/skillopt/)!** Install with `pip install skillopt`. This initial release includes the full training loop (rollout → reflect → aggregate → select → update → evaluate), multi-backend support (OpenAI / Azure / Claude / Qwen / MiniMax), six built-in benchmarks, and WebUI dashboard.

---

## Overview

Modern agent skills are usually hand-crafted, generated one-shot by a strong
LLM, or evolved through loosely controlled self-revision — none of which
behaves like a deep-learning optimizer for the skill itself, and none of
which reliably improves over its starting point under feedback.

**SkillOpt treats the skill document as the trainable state of a frozen
agent**, and trains it with the discipline that makes weight-space
optimization reproducible. A separate optimizer model turns scored rollouts
into bounded add / delete / replace edits on a single skill document; a
candidate edit is accepted only when it strictly improves a held-out
validation score. A textual learning-rate budget, a rejected-edit buffer,
and an epoch-wise slow / meta update make skill training stable while
adding **zero inference-time model calls** at deployment.

The deployed artifact is a compact `best_skill.md` (typically 300–2,000
tokens) that runs against the unchanged target model. Across **six
benchmarks, seven target models, and three execution harnesses** (direct
chat, Codex CLI, Claude Code CLI), SkillOpt is best or tied-best on **all
52 evaluated (model, benchmark, harness) cells** and on GPT-5.5 lifts the
average no-skill accuracy by **+23.5 points in direct chat, +24.8 inside
the Codex agentic loop, and +19.1 inside Claude Code**. Optimized skill
artifacts transfer across model scales, between Codex and Claude Code
harnesses, and to nearby benchmarks without further optimization.

For the full method, ablations, and per-cell results see the [paper](https://arxiv.org/abs/2605.23904); for a visual walkthrough of the loop see the [project page](https://microsoft.github.io/SkillOpt/); for deeper API / backend / benchmark docs see [`docs/`](docs/).

## 🎬 Demo Video

https://github.com/user-attachments/assets/eb12d3bc-371c-467f-904d-91b61f339ed7

<p align="center">
  <a href="https://youtu.be/JUBMDTCiM0M"><b>▶ Watch the full demo on YouTube</b></a>
</p>

---

## Extensibility & WebUI

### Adding a new backend

A backend = a chat / exec target (e.g. `openai_chat`, `claude_chat`,
`qwen_chat`, `minimax_chat`, `codex_exec`, `claude_code_exec`). See
[`docs/guide/new-backend.md`](docs/guide/new-backend.md) for the full
contract; in short you add a `skillopt/model/<name>_backend.py` module,
register it in `skillopt/model/common.py` + `backend_config.py`, and wire
it through the router in `skillopt/model/__init__.py`. `qwen_backend.py`
and `minimax_backend.py` are good templates.

### Adding a new benchmark

A benchmark = a `skillopt/envs/<name>/` package with a `dataloader.py`, a
`rollout.py`, and an `initial.md` seed skill. See
[`docs/guide/new-benchmark.md`](docs/guide/new-benchmark.md) for the full
contract; the simplest reference is `skillopt/envs/searchqa/`.

### WebUI

Launch the monitoring dashboard (optional):

```bash
pip install -e ".[webui]"
python -m skillopt_webui.app
```

| Flag | Default | Description |
|---|---|---|
| `--port` | 7860 | Server port |
| `--host` | `0.0.0.0` | Bind address |
| `--share` | off | Create a public Gradio share link |

---

## Citation

```bibtex
@misc{yang2026skilloptexecutivestrategyselfevolving,
      title={SkillOpt: Executive Strategy for Self-Evolving Agent Skills}, 
      author={Yifan Yang and Ziyang Gong and Weiquan Huang and Qihao Yang and Ziwei Zhou and Zisu Huang and Yan Li and Xuemei Gao and Qi Dai and Bei Liu and Kai Qiu and Yuqing Yang and Dongdong Chen and Xue Yang and Chong Luo},
      year={2026},
      eprint={2605.23904},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://arxiv.org/abs/2605.23904}
}
```



---

## Extra: docs/sleep/README.md

# SkillOpt-Sleep 😴 — deployment-time companion (preview)

**SkillOpt-Sleep** applies SkillOpt's discipline to your *own daily usage*. It gives a
local coding agent a nightly **sleep cycle** that reviews your past sessions, replays
your recurring tasks on your own API budget, and consolidates what it learns into
**validated** long-term memory and skills — behind a held-out gate, staged for your
review. The agent gets better the more you use it, with **no weight training** and
**zero inference-time overhead**.

> **Preview.** This is an early preview we are actively iterating on; interfaces and
> defaults may change. The engine lives in the top-level [`skillopt_sleep/`](../../skillopt_sleep)
> package with **zero dependency** on the paper's `skillopt/` code (the validation gate
> is vendored).

## How it works

One "night":

```
harvest Claude Code / Codex transcripts → mine recurring tasks → replay offline
   → consolidate (reflect → bounded edit → GATE on real held-out tasks)
   → stage proposal → (you) adopt
```

It synthesizes **SkillOpt** (validation-gated bounded text edits), **Claude Dreams**
(offline consolidation; review-then-adopt), and the **agent-sleep** idea (short-term
experience → long-term competence).

## How to use it

One engine, thin per-agent shells (see [`plugins/`](../../plugins)):

| Platform | Folder | Install |
|---|---|---|
| **Claude Code** | [`plugins/claude-code`](../../plugins/claude-code) | `/plugin marketplace add ./plugins/claude-code` → `/skillopt-sleep` |
| **Codex** | [`plugins/codex`](../../plugins/codex) | `bash plugins/codex/install.sh` → `skillopt-sleep` skill |
| **Copilot** | [`plugins/copilot`](../../plugins/copilot) | register `plugins/copilot/mcp_server.py` as an MCP server |

Deterministic proof (no API key):
`python -m skillopt_sleep.experiments.run_experiment --persona researcher --assert-improves`.

### Opt-in: experience replay & dream rollouts

Two consolidation mechanisms, both default **off** (behavior is unchanged unless you
enable them). They strengthen the nightly update when your tasks have a clean
correctness signal; the validation gate still governs what ships.

| Config knob | Default | Effect |
|---|---|---|
| `dream_rollouts` | `1` | Run each task K times → learn from the good-vs-bad contrast (contrastive reflection). |
| `recall_k` | `0` | Associative recall — pull the K most-similar past tasks (from a persisted archive) into tonight's dream. |
| `dream_factor` | `0` | Add N lightweight synthetic variants of each task. |

## Results

> 📊 **More results & analysis — the gate-safety stress test, experience-replay
> scaling, and the dream-diversity ablation — are in
> [`docs/sleep/RESULTS.md`](RESULTS.md).** The highlights:

**Protocol (identical for every row below).** 5 nights × 10 new real "today" tasks
per night; the full held-out **test** split is scored before night 1 (baseline) and
after night 5 (after); optimizer = GPT-5.5; single seed (42); run through the exact
shipped engine (`skillopt_sleep.dream.dream_consolidate`). Numbers are absolute
held-out accuracy; **Δ** = `after − baseline` in percentage points.

**(a) End-to-end on real agents — [gbrain-evals](https://github.com/garrytan/gbrain-evals) `skillopt-v1`.**
Deficient seed skills go **0.00 → 1.00** on the held-out set with **both Claude Code
and Codex** as the target agent (all 4 seeds, including a real tool-use loop).

**(b) Experience replay scales the gain — SearchQA** (1,400-item held-out test,
SQuAD exact-match; target = GPT-5.5; **validation-gated**):

| Replay config (`dream_rollouts=5`) | Baseline → After | Δ (pts) |
|---|---|---|
| `recall_k=10` | 0.802 → 0.834 | +3.1 |
| `recall_k=20` | 0.803 → 0.848 | **+4.5** |
| full-history replay *(reference, not a shipping default)* | 0.796 → 0.851 | +5.6 |
| `recall_k=10`, `dream_rollouts=8` *(more dreaming, same recall)* | 0.798 → 0.835 | +3.7 |

The gain rises monotonically with how much relevant past experience is recalled. The
same SearchQA cell **without** the gate (`recall_k=10`) is 0.808 → 0.839 (+3.1).

**(c) Second benchmark — SpreadsheetBench** (280-item held-out test; the agent's
generated openpyxl code is executed and compared cell-by-cell to a golden workbook;
target = GPT-5.4-nano; gate-free + the output-contract guardrail): 0.279 → 0.314 (**+3.6**).

**(d) Honest scope.** These gains hold where tasks recur and have a checkable
correctness signal. On saturated or noisy benchmarks (e.g. a strong model already
near ceiling) the effect is **flat within run-to-run noise** — single-seed baseline
variance here is ±1–2 pts, so treat sub-~1.5 pt differences as noise. The validation
gate keeps the worst case bounded; keep it **on** by default.

## Learn more

Full reference (pipeline, the three plugins, the experience-replay knobs) is in the
**[Documentation & Reproduction Guide](https://microsoft.github.io/SkillOpt/docs/guideline.html#sleep)**.

