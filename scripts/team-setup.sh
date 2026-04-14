#!/usr/bin/env zsh
# =============================================================================
# Agentic KB + Brain — Team Setup Script
# =============================================================================
# Sets up the full Jay West agentic stack on a new Mac:
#   • Agentic-KB  (web server + kb CLI + MCP)
#   • LLM Wiki    (brain CLI + MCP)
#   • ~/.claude   (Hermes + 33 sub-agents + skills)
#   • Claude Desktop MCP config
#   • LaunchAgent (auto-starts Agentic-KB web server on login)
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/jaydubya818/Agentic-KB/main/scripts/team-setup.sh | zsh
#   — or —
#   zsh scripts/team-setup.sh
# =============================================================================

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo "${BLUE}[info]${RESET}  $*"; }
success() { echo "${GREEN}[ok]${RESET}    $*"; }
warn()    { echo "${YELLOW}[warn]${RESET}  $*"; }
error()   { echo "${RED}[error]${RESET} $*" >&2; }
header()  { echo "\n${BOLD}══ $* ══${RESET}"; }

# ── Config ───────────────────────────────────────────────────────────────────
AGENTIC_KB_REPO="https://github.com/jaydubya818/Agentic-KB.git"
LLMWIKI_REPO="https://github.com/jaydubya818/LLMwiki.git"
CLAUDE_CONFIG_REPO="https://github.com/jaydubya818/claude-config.git"  # set to your private repo

DEFAULT_KB_DIR="$HOME/Agentic-KB"
DEFAULT_WIKI_DIR="$HOME/My LLM Wiki"
DEFAULT_CLAUDE_DIR="$HOME/.claude"
CLAUDE_DESKTOP_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
LAUNCHAGENT_PLIST="$HOME/Library/LaunchAgents/com.$(whoami).agentic-kb-web.plist"

# ── Prerequisites ─────────────────────────────────────────────────────────────
header "Checking prerequisites"

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    error "Required tool not found: $1. Please install it first."
    [[ -n "${2:-}" ]] && info "Install: $2"
    exit 1
  fi
  success "$1 found"
}

check_cmd git
check_cmd node  "brew install node"
check_cmd npm   "brew install node"
check_cmd curl

NODE_VERSION=$(node -e "process.exit(parseInt(process.versions.node) < 18 ? 1 : 0)" 2>/dev/null && echo "ok" || echo "old")
if [[ "$NODE_VERSION" == "old" ]]; then
  error "Node.js 18+ required. Run: brew install node"
  exit 1
fi
success "Node $(node --version)"

# ── API Keys ──────────────────────────────────────────────────────────────────
header "API Keys"
info "You need two API keys. Both will be written to local .env files only — never committed."

# ANTHROPIC_API_KEY
if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  success "ANTHROPIC_API_KEY already set in environment"
else
  echo -n "  Enter your ANTHROPIC_API_KEY (sk-ant-...): "
  read -rs ANTHROPIC_API_KEY
  echo
  if [[ -z "$ANTHROPIC_API_KEY" ]]; then
    error "ANTHROPIC_API_KEY is required for kb query to work"
    exit 1
  fi
fi

# OPENAI_API_KEY
if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  success "OPENAI_API_KEY already set in environment"
else
  echo -n "  Enter your OPENAI_API_KEY (sk-proj-...): "
  read -rs OPENAI_API_KEY
  echo
  if [[ -z "$OPENAI_API_KEY" ]]; then
    warn "OPENAI_API_KEY not set — brain ask will use keyword search only (still works)"
  fi
fi

# Private pin for KB access
echo -n "  Set a PRIVATE_PIN for KB private-content access (4+ chars, default: changeme): "
read -r PRIVATE_PIN
PRIVATE_PIN="${PRIVATE_PIN:-changeme}"

# ── Directories ───────────────────────────────────────────────────────────────
header "Install locations"

echo -n "  Agentic-KB directory [$DEFAULT_KB_DIR]: "
read -r KB_DIR
KB_DIR="${KB_DIR:-$DEFAULT_KB_DIR}"

echo -n "  LLM Wiki directory [$DEFAULT_WIKI_DIR]: "
read -r WIKI_DIR
WIKI_DIR="${WIKI_DIR:-$DEFAULT_WIKI_DIR}"

echo -n "  Obsidian vault path (your personal vault, press Enter to create a new one): "
read -r OBSIDIAN_VAULT
if [[ -z "$OBSIDIAN_VAULT" ]]; then
  OBSIDIAN_VAULT="$HOME/Documents/Obsidian Vault"
  mkdir -p "$OBSIDIAN_VAULT"
  info "Created new vault at: $OBSIDIAN_VAULT"
fi

# ── Clone / update Agentic-KB ─────────────────────────────────────────────────
header "Agentic-KB"

if [[ -d "$KB_DIR/.git" ]]; then
  info "Agentic-KB already cloned, pulling latest..."
  git -C "$KB_DIR" pull --ff-only
else
  info "Cloning Agentic-KB..."
  git clone "$AGENTIC_KB_REPO" "$KB_DIR"
fi
success "Agentic-KB at $KB_DIR"

# Install web dependencies
info "Installing web server dependencies..."
npm install --prefix "$KB_DIR/web" --silent
success "Web dependencies installed"

# Install MCP dependencies
info "Installing MCP server dependencies..."
npm install --prefix "$KB_DIR/mcp" --silent
success "MCP dependencies installed"

# Write web .env.local
cat > "$KB_DIR/web/.env.local" <<EOF
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
PRIVATE_PIN=${PRIVATE_PIN}
EOF
success "Wrote $KB_DIR/web/.env.local"

# Build the web server
info "Building web server (this takes ~30s)..."
cd "$KB_DIR/web" && npm run build 2>&1 | tail -3
success "Web server built"

# ── Clone / update LLM Wiki ───────────────────────────────────────────────────
header "LLM Wiki (brain CLI)"

if [[ -d "$WIKI_DIR/.git" ]]; then
  info "LLM Wiki already cloned, pulling latest..."
  git -C "$WIKI_DIR" pull --ff-only
else
  info "Cloning LLM Wiki..."
  git clone "$LLMWIKI_REPO" "$WIKI_DIR"
fi
success "LLM Wiki at $WIKI_DIR"

# Install all packages
info "Installing brain CLI dependencies..."
for pkg in packages/core packages/cli packages/mcp; do
  npm install --prefix "$WIKI_DIR/$pkg" --silent 2>/dev/null || true
done

# Build packages
info "Building brain CLI..."
for pkg in packages/core packages/cli packages/mcp; do
  npm run build --prefix "$WIKI_DIR/$pkg" 2>/dev/null | tail -1 || true
done
success "Brain CLI built"

# Create symlink: wiki/ -> Obsidian vault
WIKI_LINK="$WIKI_DIR/wiki"
if [[ -L "$WIKI_LINK" ]]; then
  info "wiki/ symlink already exists"
elif [[ -d "$WIKI_LINK" ]]; then
  warn "wiki/ is a real directory, not a symlink — skipping"
else
  ln -s "$OBSIDIAN_VAULT" "$WIKI_LINK"
  success "Linked wiki/ -> $OBSIDIAN_VAULT"
fi

# Write .env
cat > "$WIKI_DIR/.env" <<EOF
OPENAI_API_KEY=${OPENAI_API_KEY}
SECOND_BRAIN_ROOT=${WIKI_DIR}
EOF
success "Wrote $WIKI_DIR/.env"

# ── Claude Code config (~/.claude) ────────────────────────────────────────────
header "Claude Code agents + skills"

if [[ -d "$DEFAULT_CLAUDE_DIR/.git" ]]; then
  info "~/.claude already a git repo, pulling..."
  git -C "$DEFAULT_CLAUDE_DIR" pull --ff-only 2>/dev/null || warn "Could not pull ~/.claude (may have local changes)"
elif [[ -n "$CLAUDE_CONFIG_REPO" ]] && [[ "$CLAUDE_CONFIG_REPO" != *"jaydubya818"* ]]; then
  info "Cloning Claude config..."
  git clone "$CLAUDE_CONFIG_REPO" "$DEFAULT_CLAUDE_DIR"
  success "Claude agents + skills installed"
else
  warn "CLAUDE_CONFIG_REPO not set to a valid repo — skipping agent/skill install"
  warn "Set CLAUDE_CONFIG_REPO at the top of this script to your private ~/.claude repo"
fi

# ── Vault CLAUDE.md ────────────────────────────────────────────────────────────
header "Obsidian vault setup"

VAULT_CLAUDE_MD="$OBSIDIAN_VAULT/CLAUDE.md"
if [[ -f "$VAULT_CLAUDE_MD" ]]; then
  info "CLAUDE.md already exists in vault"
else
  cat > "$VAULT_CLAUDE_MD" <<EOF
---
# Claude Context — $(whoami)'s Obsidian Vault
## Owner
$(whoami) — update this with your name and role

## Vault Access
- REST API: http://127.0.0.1:27124
- Vault path: ${OBSIDIAN_VAULT}

## Folder Structure
Update this to match your vault's actual folders.

## Active Context Files
On session start, Hermes reads:
1. This file (CLAUDE.md)
2. personal/hermes-operating-context.md (if it exists)
3. hot.md (if it exists)
EOF
  success "Created $VAULT_CLAUDE_MD (edit it to describe your vault)"
fi

# Create personal/ directory
mkdir -p "$OBSIDIAN_VAULT/personal"
if [[ ! -f "$OBSIDIAN_VAULT/personal/hermes-operating-context.md" ]]; then
  cat > "$OBSIDIAN_VAULT/personal/hermes-operating-context.md" <<'EOF'
---
title: Hermes Operating Context
type: personal
category: pattern
---
# Hermes Operating Context

## Priority Stack
<!-- UPDATE ME: What is your #1 objective right now? -->
P1: [YOUR PRIMARY FOCUS]
P2: [SECONDARY FOCUS]
P3: [BACKGROUND / RESEARCH]

## Open Blockers
<!-- Things currently blocking your P1 -->
- [ ] None yet

## Work Lanes
<!-- The domains Hermes routes work to -->
- Engineering
- Research
- Personal
EOF
  success "Created personal/hermes-operating-context.md (fill in your priorities)"
fi

if [[ ! -f "$OBSIDIAN_VAULT/hot.md" ]]; then
  cat > "$OBSIDIAN_VAULT/hot.md" <<'EOF'
# Hot Cache
<!-- ≤500 words. Frequently-used patterns, updated weekly. -->
<!-- Hermes reads this on every session start. -->
EOF
  success "Created hot.md"
fi

# ── LaunchAgent ────────────────────────────────────────────────────────────────
header "LaunchAgent (web server auto-start)"

NODE_PATH=$(command -v node)
NEXT_BIN="$KB_DIR/web/node_modules/.bin/next"

mkdir -p "$HOME/Library/LaunchAgents"
cat > "$LAUNCHAGENT_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.$(whoami).agentic-kb-web</string>
    <key>ProgramArguments</key>
    <array>
        <string>${NODE_PATH}</string>
        <string>${NEXT_BIN}</string>
        <string>start</string>
        <string>--port</string>
        <string>3002</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${KB_DIR}/web</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>ANTHROPIC_API_KEY</key>
        <string>${ANTHROPIC_API_KEY}</string>
        <key>PRIVATE_PIN</key>
        <string>${PRIVATE_PIN}</string>
        <key>NODE_ENV</key>
        <string>production</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${KB_DIR}/logs/web-server.log</string>
    <key>StandardErrorPath</key>
    <string>${KB_DIR}/logs/web-server-error.log</string>
    <key>ThrottleInterval</key>
    <integer>10</integer>
</dict>
</plist>
EOF

mkdir -p "$KB_DIR/logs"
launchctl load "$LAUNCHAGENT_PLIST" 2>/dev/null || true
success "LaunchAgent installed and loaded"

# ── Claude Desktop MCP config ─────────────────────────────────────────────────
header "Claude Desktop MCP config"

MCP_CONFIG_DIR="$(dirname "$CLAUDE_DESKTOP_CONFIG")"
mkdir -p "$MCP_CONFIG_DIR"

if [[ ! -f "$CLAUDE_DESKTOP_CONFIG" ]]; then
  echo '{"mcpServers": {}, "preferences": {}}' > "$CLAUDE_DESKTOP_CONFIG"
fi

# Inject MCP entries using node (avoids jq dependency)
node - <<JSEOF
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('${CLAUDE_DESKTOP_CONFIG}', 'utf8'));
config.mcpServers = config.mcpServers || {};

config.mcpServers['agentic-kb'] = {
  command: 'node',
  args: ['${KB_DIR}/mcp/server.js'],
  env: { KB_API_URL: 'http://localhost:3002', PRIVATE_PIN: '${PRIVATE_PIN}' }
};

config.mcpServers['second-brain'] = {
  command: 'node',
  args: ['${WIKI_DIR}/packages/mcp/dist/index.js'],
  env: { SECOND_BRAIN_ROOT: '${WIKI_DIR}', OPENAI_API_KEY: '${OPENAI_API_KEY}' }
};

config.mcpServers['obsidian'] = {
  command: 'npx',
  args: ['mcp-remote', 'http://localhost:22360/sse']
};

fs.writeFileSync('${CLAUDE_DESKTOP_CONFIG}', JSON.stringify(config, null, 2));
console.log('MCP config updated');
JSEOF
success "Claude Desktop MCP config updated"

# ── Add CLI aliases ────────────────────────────────────────────────────────────
header "Shell aliases"

ZSHRC="$HOME/.zshrc"
ALIAS_BLOCK="# Agentic KB aliases
alias kb='node ${KB_DIR}/cli/kb.js'
alias brain='node ${WIKI_DIR}/packages/cli/dist/index.js -r \"${WIKI_DIR}\"'"

if grep -q "Agentic KB aliases" "$ZSHRC" 2>/dev/null; then
  info "Aliases already in ~/.zshrc"
else
  echo "\n${ALIAS_BLOCK}" >> "$ZSHRC"
  success "Added kb and brain aliases to ~/.zshrc"
fi

# ── Verify ────────────────────────────────────────────────────────────────────
header "Verification"

sleep 2

# Check web server
if curl -s --max-time 3 "http://localhost:3002/api/search" \
     -X POST -H "Content-Type: application/json" \
     -d '{"query":"test"}' | grep -q "results\|hits\|\[\]" 2>/dev/null; then
  success "Web server responding on :3002"
else
  warn "Web server not yet responding — try: launchctl start com.$(whoami).agentic-kb-web"
fi

# Check brain CLI
if node "${WIKI_DIR}/packages/cli/dist/index.js" --help &>/dev/null; then
  success "brain CLI works"
else
  warn "brain CLI check failed — check $WIKI_DIR/packages/cli build"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "${GREEN}${BOLD}════════════════════════════════════════${RESET}"
echo "${GREEN}${BOLD}  Setup complete!${RESET}"
echo "${GREEN}${BOLD}════════════════════════════════════════${RESET}"
echo ""
echo "  ${BOLD}Next steps:${RESET}"
echo "  1. Restart Claude Desktop to pick up new MCP servers"
echo "  2. Open Obsidian and point it to: ${OBSIDIAN_VAULT}"
echo "  3. Edit ${OBSIDIAN_VAULT}/personal/hermes-operating-context.md"
echo "     — fill in your P1/P2/P3 priority stack"
echo "  4. Reload your shell:  source ~/.zshrc"
echo "  5. Test:  kb query 'What is the fan-out worker pattern?'"
echo ""
echo "  ${BOLD}Logs:${RESET}  ${KB_DIR}/logs/web-server.log"
echo "  ${BOLD}KB UI:${RESET} http://localhost:3002"
echo ""
