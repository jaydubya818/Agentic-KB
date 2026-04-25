---
title: GSD Executor Gotchas
memory_class: learned
agent_id: gsd-executor
---

# Gotchas


## 2026-04-09T07:40:09.805Z
forbidden_paths should gate writes only, not reads. Reads use context_policy.


## 2026-04-25T16:04:03.065Z
Pi bootstrap assumes literal agent id 'pi', skips required kb agent start-task before close-task, assumes directory-based node test discovery, npm workspace root config, bare root tsconfig, and running lint API server; none of those assumptions hold in this repo/session.
