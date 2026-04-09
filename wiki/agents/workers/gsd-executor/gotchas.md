---
title: GSD Executor Gotchas
memory_class: learned
agent_id: gsd-executor
---

# Gotchas


## 2026-04-09T07:40:09.805Z
forbidden_paths should gate writes only, not reads. Reads use context_policy.
