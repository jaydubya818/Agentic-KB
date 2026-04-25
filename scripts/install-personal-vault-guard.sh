#!/usr/bin/env bash
# install-personal-vault-guard.sh
#
# One-time installer for a git pre-commit hook that enforces Rule 13:
# the agent compile-vault (this repo) must never write to the personal
# write-vault. Concretely, this hook rejects any staged change whose path
# resolves outside the repo root or into a path containing "Obsidian Vault".
#
# Usage:
#   bash scripts/install-personal-vault-guard.sh
#
# Then test with:
#   git commit --allow-empty -m "smoke"   # should pass
#
# To bypass intentionally (rare; e.g. ingesting a clipping you copied in):
#   git commit --no-verify
#
# Idempotent: re-running overwrites the hook with the latest version.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${REPO_ROOT}" ]]; then
  echo "error: not inside a git repo" >&2
  exit 1
fi

HOOK_PATH="${REPO_ROOT}/.git/hooks/pre-commit"
mkdir -p "$(dirname "${HOOK_PATH}")"

cat > "${HOOK_PATH}" <<'HOOK'
#!/usr/bin/env bash
# pre-commit: enforce Foundry Rule 13 (one-way rule)
# Reject any staged path that points into the personal Obsidian vault.
set -euo pipefail

bad=()
while IFS= read -r path; do
  # Reject if the path itself contains "Obsidian Vault" (case-insensitive)
  if printf '%s\n' "$path" | grep -qiE 'obsidian[ _-]?vault'; then
    bad+=("$path")
    continue
  fi
  # Reject symlinks that resolve outside the repo
  if [[ -L "$path" ]]; then
    target="$(readlink "$path" || true)"
    if printf '%s\n' "$target" | grep -qiE 'obsidian[ _-]?vault'; then
      bad+=("$path -> $target")
    fi
  fi
done < <(git diff --cached --name-only --diff-filter=ACMRT)

if (( ${#bad[@]} > 0 )); then
  echo "✗ pre-commit: Rule 13 violation — personal vault is read-only." >&2
  printf '  - %s\n' "${bad[@]}" >&2
  echo "  Bypass with --no-verify if you really intended this." >&2
  exit 1
fi
exit 0
HOOK

chmod +x "${HOOK_PATH}"
echo "✓ Installed pre-commit guard at ${HOOK_PATH}"
echo "  Test:   git commit --allow-empty -m 'smoke'"
echo "  Bypass: git commit --no-verify"
