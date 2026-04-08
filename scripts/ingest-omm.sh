#!/usr/bin/env bash
# ingest-omm.sh — Ingest oh-my-mermaid scan output into raw/architecture/
#
# Bundles each perspective's description + diagram + other fields into a
# single frontmattered markdown file per element.
#
# Usage:   ./scripts/ingest-omm.sh [path-to-omm-root]
#          defaults to <repo-root>/.omm

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OMM_DIR="${1:-$REPO_ROOT/.omm}"
DEST_DIR="$REPO_ROOT/raw/architecture"

if [[ ! -d "$OMM_DIR" ]]; then
  echo "ERROR: $OMM_DIR not found. Run 'omm init' or /omm-scan first." >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
TODAY=$(date +%Y-%m-%d)
COUNT=0

# Find all element directories (dirs containing any of description.md / diagram.mmd)
ELEMENTS=$(find "$OMM_DIR" -type d \( -name node_modules -prune -o -print \) \
  | while read -r dir; do
      if [[ -f "$dir/description.md" || -f "$dir/diagram.mmd" ]]; then
        echo "$dir"
      fi
    done)

while IFS= read -r elem; do
  [[ -z "$elem" ]] && continue
  rel="${elem#$OMM_DIR/}"
  rel="${rel#/}"
  [[ -z "$rel" ]] && continue
  slug=$(echo "$rel" | tr '/' '-' | tr '[:upper:]' '[:lower:]')
  dest="$DEST_DIR/$TODAY-omm-$slug.md"

  {
    echo "---"
    echo "title: \"Architecture: $rel\""
    echo "source: oh-my-mermaid"
    echo "ingested: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "tags: [architecture, mermaid, autogen]"
    echo "omm_perspective: \"$rel\""
    echo "---"
    echo ""
    echo "# $rel"
    echo ""
    if [[ -f "$elem/description.md" ]]; then
      cat "$elem/description.md"
      echo ""
    fi
    if [[ -f "$elem/diagram.mmd" ]]; then
      echo "## Diagram"
      echo ""
      echo '```mermaid'
      cat "$elem/diagram.mmd"
      echo '```'
      echo ""
    fi
    for field in context constraint concern todo note; do
      if [[ -f "$elem/$field.md" ]]; then
        echo "## ${field^}"
        echo ""
        cat "$elem/$field.md"
        echo ""
      fi
    done
  } > "$dest"

  COUNT=$((COUNT + 1))
  echo "  → $dest"
done <<< "$ELEMENTS"

echo ""
echo "Ingested $COUNT perspectives into raw/architecture/"
echo "Next: hit 'Compile New' in the web UI (http://localhost:3002) to compile into wiki pages."
