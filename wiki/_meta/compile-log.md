---
title: Compile Log
type: meta
purpose: Append-only audit of every /foundry-compile run — what promoted, what deferred, what graduated
---

# Compile Log

Append-only. The 2-source gate writes one entry per `/foundry-compile --execute` run.

Each entry shows:
- **promote**: themes that compiled to wiki pages (with `(forced: N)` if any single-source bypasses)
- **defer**: themes added to `wiki/candidates.md` waiting for a second source
- **graduate**: themes that were candidates last run and now compiled

