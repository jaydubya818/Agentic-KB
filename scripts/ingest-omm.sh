#!/usr/bin/env bash
# ingest-omm.sh — Ingest oh-my-mermaid scan output into raw/architecture/
#
# Prereqs: oh-my-mermaid installed (`npm i -g oh-my-mermaid`) and
#          `/omm-scan` has been run in this repo via Claude Code,
#          producing an `.omm/` directory.
#
# Usage:   ./scripts/ingest-omm.sh [path-to-omm-root]
#          defaults to <repo-root>/.omm

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OMM_DIR="${1:-$REPO_ROOT/.omm}"
DEST_DIR="$REPO_ROOT/raw/architecture"

if [[ ! -d "$OMM_DIR" ]]; then
  echo "ERROR: $OMM_DIR not found. Run '/omm-scan' in Claude Code first." >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
TODAY=$(date +%Y-%m-%d)
COUNT=0

find "$OMM_DIR" -name "*.md" -type f | while read -r md; do
  rel="${md#$OMM_DIR/}"
  slug=$(echo "$rel" | tr '/' '-' | sed 's/\.md$//' | tr '[:upper:]' '[:lower:]')
  dest="$DEST_DIR/$TODAY-omm-$slug.md"

  {
    echo "---"
    echo "title: \"Architecture: $(basename "$rel" .md)\""
    echo "source: oh-my-mermaid"
    echo "ingested: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "tags: [architecture, mermaid, autogen]"
    echo "omm_perspective: \"$rel\""
    echo "---"
    echo ""
    cat "$md"
  } > "$dest"
  COUNT=$((COUNT + 1))
  echo "  → $dest"
done

echo ""
echo "Ingested $COUNT perspectives into raw/architecture/"
echo "Next: hit 'Compile New' in the web UI (http://localhost:3002) to compile into wiki pages."
