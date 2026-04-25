#!/usr/bin/env bash
# Push the current branch (and main) to a configured mirror remote.
# Set up once:
#   git remote add mirror <url>            # e.g. gitlab, codeberg, self-hosted
#
# Then run after every meaningful commit, or hook into vault-backup script.
#
# Idempotent: skips if `mirror` remote not configured.

set -euo pipefail
cd "$(dirname "$0")/.."

if ! git remote get-url mirror >/dev/null 2>&1; then
  echo "[mirror] no 'mirror' remote configured. Skipping."
  echo "[mirror] to enable: git remote add mirror <url>"
  exit 0
fi

CURRENT=$(git rev-parse --abbrev-ref HEAD)

echo "[mirror] pushing $CURRENT to mirror..."
git push mirror "$CURRENT" 2>&1 | tail -3 || echo "[mirror] $CURRENT push failed (continuing)"

echo "[mirror] pushing main to mirror..."
git push mirror main 2>&1 | tail -3 || echo "[mirror] main push failed (continuing)"

echo "[mirror] done"
