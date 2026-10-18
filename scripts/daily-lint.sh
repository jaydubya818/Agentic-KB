#!/usr/bin/env bash
# scripts/daily-lint.sh — daily Agentic-KB wiki health check and self-maintenance
#
# The scheduled task is: run this script, relay its summary. All logic lives
# here so it is version-controlled and testable, not re-interpreted by an agent.
#
#   ./scripts/daily-lint.sh
#
# Pipeline:
#   1. measure (offline)      scripts/kb-quality.mjs      -> BEFORE
#   2. remediate (safe only)  scripts/kb-remediate.mjs    hubs, MoC placements, unambiguous link repair
#   3. validate               unit tests + hub link check + no-regression gate; roll back on failure
#   4. lint (authoritative)   POST /api/lint              contradictions, gaps, final orphan/stale counts
#   5. alert lifecycle        scripts/kb-alerts.mjs       NEW / REGRESSION / WORSENING notify;
#                                                         STANDING / BLOCKED stay on the dashboard
#   6. commit                 only when something meaningful changed
#
# Commits (history is NOT a heartbeat):
#   A commit lands only for a substantive change: remediation applied, a report
#   whose findings differ, a changed trend/alert state, or a new quality finding
#   set. A healthy unchanged day creates NO commit. Execution history is kept in
#   logs/lint-runs.jsonl (machine-local, one JSON line per run, success or failure).
#
# Safety, unchanged: PII lines are stripped from generated artifacts, the
# pre-commit guard is never bypassed (no --no-verify), pushes never force, and
# a rejected artifact is dropped on its own without losing the rest of the run.
#
# Exit codes:
#   0  healthy, or only STANDING/BLOCKED findings already reported
#   1  attention needed: a NEW, REGRESSION or WORSENING finding
#   2  degraded: lint ran, AI analysis failed (first time / newly regressed)
#   3  failed: server unreachable or lint call errored
set -uo pipefail

REPO="${KB_REPO:-/Users/jaywest/Agentic-KB}"
PORT="${KB_PORT:-3002}"
BASE="http://localhost:${PORT}"
LOG="${REPO}/logs/kb-dev-server.log"
RUNLOG="${REPO}/logs/lint-runs.jsonl"
REPORT="wiki/lint-report.md"
TREND="wiki/lint-trend.csv"
HEALTH="wiki/_meta/kb-health.md"
ALERTSTATE="wiki/_meta/alert-state.json"
ALERTDOC="wiki/_meta/lint-alerts.md"
QUALITY="wiki/_meta/kb-quality.md"
REMEDIATION="${REPO}/logs/last-remediation.json"

# Thresholds are consumed by scripts/kb-alerts.mjs. They are a ratchet against
# the backlog growing, and are never relaxed to silence a finding: a standing
# breach stays red on the dashboard until the number actually comes down.
export ORPHAN_ALERT="${ORPHAN_ALERT:-5}"
export ORPHAN_MAX="${ORPHAN_MAX:-80}"
export STALE_PCT_MAX="${STALE_PCT_MAX:-40}"
export KB_REPO="$REPO"

LINT_TIMEOUT="${LINT_TIMEOUT:-600}"
SERVER_TRIES="${SERVER_TRIES:-30}"
SERVER_WAIT="${SERVER_WAIT:-3}"
AUTO_REMEDIATE="${AUTO_REMEDIATE:-1}"

cd "$REPO" || { echo "FATAL: cannot cd to $REPO"; exit 3; }
mkdir -p "${REPO}/logs" "${REPO}/wiki/_meta"

COMMITS_MADE=0
RUN_STATUS="started"
DSTAMP="$(date +%F)"

record_run() {
  # One JSON line per run, success or failure: execution history without commits.
  printf '{"date":"%s","at":"%s","status":"%s","exit":%s,"commits":%s}\n' \
    "$DSTAMP" "$(date -Iseconds)" "$RUN_STATUS" "${1:-0}" "$COMMITS_MADE" >> "$RUNLOG" 2>/dev/null || true
}

# One rebase retry, never a force-push: a conflicting rebase needs a human.
push_main() {
  git push -q origin main 2>/dev/null && return 0
  echo "push rejected — rebasing onto origin/main and retrying"
  if ! git pull --rebase --autostash -q origin main 2>&1; then
    git rebase --abort 2>/dev/null || true
    return 1
  fi
  git push -q origin main 2>/dev/null
}

# Single exit path. Pushes only when there is something to push; a quiet day
# makes no commit and therefore no push.
on_exit() {
  local rc=$?
  record_run "$rc"
  if [ -n "$(git log origin/main..HEAD --oneline 2>/dev/null)" ]; then
    if push_main; then
      echo "pushed ${COMMITS_MADE} commit(s), head: $(git log -1 --format=%h)"
      bash "${REPO}/scripts/mirror-push.sh" >/dev/null 2>&1 || true
    else
      alert "push failed even after rebase onto origin/main — resolve manually"
      echo "PUSH FAILED (not force-pushing; resolve manually)"
    fi
  else
    echo "no commits this run (nothing meaningful changed)"
  fi
}
trap on_exit EXIT

http_code() { curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$1" 2>/dev/null || echo "000"; }

alert() {
  local msg="$1"
  echo "ALERT: ${msg}"
  printf '%s\t%s\n' "$(date -Iseconds)" "$msg" >> "${REPO}/logs/lint-alerts.log"
  osascript -e "display notification \"${msg//\"/}\" with title \"KB daily lint\"" 2>/dev/null || true
}

credits_exhausted() {
  local key body
  key="$(grep '^ANTHROPIC_API_KEY=' "${REPO}/web/.env.local" 2>/dev/null | cut -d= -f2- | tr -d '\r\n')"
  [ -n "$key" ] || return 1
  body="$(curl -s --max-time 20 https://api.anthropic.com/v1/messages \
    -H "x-api-key: ${key}" -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d '{"model":"claude-haiku-4-5-20251001","max_tokens":1,"messages":[{"role":"user","content":"hi"}]}' 2>/dev/null)"
  printf '%s' "$body" | grep -qi 'credit balance is too low'
}

# --- commit helpers ---------------------------------------------------------
# One concern per commit. Never --no-verify: a guard rejection drops that one
# artifact and the rest of the run still lands.
commit_file() {
  local path="$1" msg="$2"
  [ -f "${REPO}/${path}" ] || return 1
  sed -i '' '/_private\//d' "${REPO}/${path}" 2>/dev/null || true
  git add -- "$path" 2>/dev/null || return 1
  if git diff --cached --quiet -- "$path"; then
    git reset -q HEAD -- "$path" 2>/dev/null || true
    return 1
  fi
  if git commit -q -m "$msg" -- "$path"; then
    COMMITS_MADE=$((COMMITS_MADE + 1)); echo "commit: $(git log -1 --format=%h) ${msg}"; return 0
  fi
  git reset -q HEAD -- "$path" 2>/dev/null || true
  alert "pre-commit guard rejected ${path} — left uncommitted"
  return 1
}

commit_paths() {
  local msg="$1"; shift
  local existing=() p
  for p in "$@"; do [ -e "${REPO}/${p}" ] && existing+=("$p"); done
  [ "${#existing[@]}" -gt 0 ] || return 1
  git add -- "${existing[@]}" 2>/dev/null || return 1
  if git diff --cached --quiet -- "${existing[@]}"; then
    git reset -q HEAD -- "${existing[@]}" 2>/dev/null || true
    return 1
  fi
  if git commit -q -m "$msg" -- "${existing[@]}"; then
    COMMITS_MADE=$((COMMITS_MADE + 1)); echo "commit: $(git log -1 --format=%h) ${msg}"; return 0
  fi
  git reset -q HEAD -- "${existing[@]}" 2>/dev/null || true
  alert "pre-commit guard rejected remediation — left uncommitted"
  return 1
}

fail() {
  echo "$1"
  echo "--- last 20 lines of ${LOG} ---"
  tail -20 "$LOG" 2>/dev/null || echo "(no server log)"
  RUN_STATUS="failed: $2"
  exit 3
}

q() { node "${REPO}/scripts/kb-quality.mjs" --json 2>/dev/null || echo '{}'; }
qf() { echo "$1" | jq -r "${2} // ${3}" 2>/dev/null || echo "$3"; }

# --- 1. ensure the dev server is up (and running the current lint code) ------
# A long-lived `next dev` keeps the lib/ modules it first loaded. After
# lib/wiki-lint.mjs or the lint route change, it would keep reporting numbers
# from the OLD logic (observed 2026-10-11: 410 stale vs 219 under the new
# policy). Restart it when those files are newer than the process.
#
# On this machine :3002 is a launchd-managed PRODUCTION server (`next start`,
# com.jaywest.agentic-kb-web, KeepAlive) serving a prebuilt web/.next. It never
# hot-reloads, so lint code changes only take effect after a rebuild + restart.
server_pid() { lsof -ti "tcp:${PORT}" -sTCP:LISTEN 2>/dev/null | head -1; }
build_is_stale() {
  [ -f web/.next/BUILD_ID ] || return 1   # no production build: dev-server path
  local built newest
  built="$(stat -f %m web/.next/BUILD_ID 2>/dev/null)" || return 1
  newest="$(stat -f %m lib/wiki-lint.mjs lib/freshness-policy.mjs web/src/app/api/lint/route.ts 2>/dev/null | sort -n | tail -1)"
  [ -n "$newest" ] && [ "$newest" -gt "$built" ]
}
if build_is_stale; then
  echo "web build predates lint code changes — rebuilding"
  ( cd "${REPO}/web" && npm run build >> "${REPO}/logs/web-build.log" 2>&1 ) \
    || fail "web build failed (see logs/web-build.log)" "web build failed"
  if [ -n "$(server_pid)" ]; then
    kill "$(server_pid)" 2>/dev/null || true   # launchd KeepAlive restarts it on the new build
    for _ in $(seq 1 20); do
      sleep 3
      [ "$(http_code "${BASE}/api/pending-count")" = "200" ] && break
    done
  fi
fi

if [ "$(http_code "${BASE}/api/pending-count")" != "200" ]; then
  echo "server down, starting..."
  ( cd "${REPO}/web" && nohup npm run dev > "$LOG" 2>&1 < /dev/null & disown ) || true
  up=""
  for _ in $(seq 1 "$SERVER_TRIES"); do
    sleep "$SERVER_WAIT"
    [ "$(http_code "${BASE}/api/pending-count")" = "200" ] && { up=1; break; }
  done
  [ -n "$up" ] || fail "server did not come up within $((SERVER_TRIES * SERVER_WAIT))s" "server unreachable on :${PORT}"
  echo "server up"
fi

if credits_exhausted; then
  alert "Anthropic credits exhausted — contradiction/gap analysis will be skipped. Top up at console.anthropic.com"
fi

PIN="$(grep '^PRIVATE_PIN=' "${REPO}/web/.env.local" 2>/dev/null | cut -d= -f2- | tr -d '\r\n')"
[ -n "$PIN" ] || fail "PRIVATE_PIN missing or empty in web/.env.local — the lint call would 401" "PIN not configured"

# --- 2. measure BEFORE, remediate, validate ---------------------------------
PRE_Q="$(q)"
B_ORPH=$(qf "$PRE_Q" .orphans 0); B_STALE=$(qf "$PRE_Q" .stale 0); B_BROKEN=$(qf "$PRE_Q" .brokenLinks 0)
REMEDIATED_N=0
rm -f "$REMEDIATION"

if [ "$AUTO_REMEDIATE" = "1" ]; then
  # Quality report first so MoC placements pointing at it resolve.
  node scripts/kb-quality.mjs --write >/dev/null 2>&1 || true
  if node scripts/kb-remediate.mjs --apply > "$REMEDIATION" 2>/dev/null; then
    REMEDIATED_N=$(jq -r '((.modified|length) + (.created|length))' "$REMEDIATION" 2>/dev/null || echo 0)
  fi

  if [ "$REMEDIATED_N" -gt 0 ]; then
    POST_Q="$(q)"
    A_ORPH=$(qf "$POST_Q" .orphans 0); A_BROKEN=$(qf "$POST_Q" .brokenLinks 0)
    if node --test tests/agents/wiki-lint.test.mjs tests/agents/freshness-policy.test.mjs tests/alert-lifecycle.test.mjs >/dev/null 2>&1 \
       && node scripts/rebuild-orphan-hubs.mjs --check >/dev/null 2>&1 \
       && [ "$A_ORPH" -le "$B_ORPH" ] && [ "$A_BROKEN" -le "$B_BROKEN" ]; then
      echo "remediation validated: ${REMEDIATED_N} file(s) changed, orphans ${B_ORPH}->${A_ORPH}, broken links ${B_BROKEN}->${A_BROKEN}"
    else
      alert "remediation failed validation — rolling back ${REMEDIATED_N} file(s)"
      node scripts/kb-remediate.mjs --rollback "$REMEDIATION" >/dev/null 2>&1 || true
      REMEDIATED_N=0
    fi
  fi
fi

# --- 3. authoritative lint ---------------------------------------------------
RESP="$(curl -s --max-time "$LINT_TIMEOUT" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"pin\":\"${PIN}\"}" "${BASE}/api/lint" 2>/dev/null)"

echo "$RESP" | jq -e '.ok == true' >/dev/null 2>&1 \
  || fail "lint call failed: ${RESP:0:400}" "lint API error"

jqf() { echo "$RESP" | jq -r "${1} // ${2}" 2>/dev/null || echo "$2"; }
PAGES=$(jqf '.pagesScanned' 0);  CONTRA=$(jqf '.contradictions' 0); ORPHANS=$(jqf '.orphans' 0)
STALE=$(jqf '.stalePages' 0);    GAPS=$(jqf '.gaps' 0);             ODELTA=$(jqf '.orphanDelta' 0)
EXAMINED=$(jqf '.analysisWindow.examined' 0); CURSOR=$(jqf '.analysisWindow.cursor' 0)
DEGRADED=$(jqf '.degraded' false);  VERIFIED=$(jqf '.verifiedPages' 0)
REASON=$(echo "$RESP" | jq -r '.degradedReason // ""' 2>/dev/null | tr -d '\n' | cut -c1-200)

STALE_PCT=0;  [ "$PAGES" -gt 0 ] 2>/dev/null && STALE_PCT=$(( STALE * 100 / PAGES ))
COVER_PCT=0;  [ "$PAGES" -gt 0 ] 2>/dev/null && COVER_PCT=$(( EXAMINED * 100 / PAGES ))

FINAL_Q="$(q)"
BROKEN=$(qf "$FINAL_Q" .brokenLinks 0); PGAPS=$(qf "$FINAL_Q" .projectGaps 0)

echo "pages=${PAGES} contradictions=${CONTRA} orphans=${ORPHANS} (Δ${ODELTA}) stale=${STALE} (${STALE_PCT}%) gaps=${GAPS} broken_links=${BROKEN} project_gaps=${PGAPS} verified=${VERIFIED}"
echo "BEFORE -> AFTER: orphans ${B_ORPH}->${ORPHANS}, stale ${B_STALE}->${STALE}, broken links ${B_BROKEN}->${BROKEN} (${REMEDIATED_N} file(s) remediated)"
echo "analysis window: ${EXAMINED}/${PAGES} pages (${COVER_PCT}%), cursor at ${CURSOR}"

# --- 4. alert lifecycle ------------------------------------------------------
METRICS="$(jq -nc \
  --arg today "$DSTAMP" --arg reason "$REASON" --argjson degraded "$DEGRADED" \
  --argjson pages "$PAGES" --argjson contradictions "$CONTRA" --argjson orphans "$ORPHANS" \
  --argjson orphanDelta "$ODELTA" --argjson stale "$STALE" --argjson stalePct "$STALE_PCT" \
  --argjson gaps "$GAPS" --argjson examined "$EXAMINED" --argjson brokenLinks "$BROKEN" \
  --argjson projectGaps "$PGAPS" --argjson verified "$VERIFIED" \
  --argjson bo "$B_ORPH" --argjson bs "$B_STALE" --argjson bb "$B_BROKEN" \
  '{today:$today,reason:$reason,degraded:$degraded,pages:$pages,contradictions:$contradictions,orphans:$orphans,
    orphanDelta:$orphanDelta,stale:$stale,stalePct:$stalePct,gaps:$gaps,examined:$examined,brokenLinks:$brokenLinks,
    projectGaps:$projectGaps,verified:$verified,before:{orphans:$bo,stale:$bs,brokenLinks:$bb}}')"
LC="$(node scripts/kb-alerts.mjs "$METRICS" 2>/dev/null || echo '{}')"

status=0
NONDEG=$(echo "$LC" | jq '[.actionable[]? | select(.key != "degraded")] | length' 2>/dev/null || echo 0)
DEGACT=$(echo "$LC" | jq '[.actionable[]? | select(.key == "degraded")] | length' 2>/dev/null || echo 0)
echo "$LC" | jq -r '.actionable[]? | "\(.status) \(.label): \(.value) (threshold \(.threshold), was \(.previous // "n/a"))"' 2>/dev/null \
  | while IFS= read -r line; do alert "$line"; done
echo "$LC" | jq -r '.remediated[]? | "REMEDIATED: \(.label) is now \(.value)"' 2>/dev/null
echo "$LC" | jq -r '.standing[]? | "\(.status): \(.label) = \(.value) (threshold \(.threshold), open \(.standingDays)d) — no new alert"' 2>/dev/null
[ "$NONDEG" -gt 0 ] && status=1
[ "$status" -eq 0 ] && [ "$DEGACT" -gt 0 ] && status=2
RUN_STATUS="exit-${status}"

# --- 5. artifacts: write only what differs ----------------------------------
# lint-report.md is rewritten by the API every run with a fresh timestamp. If
# nothing but that timestamp differs from HEAD, restore it: a new timestamp is
# not new information.
if [ -f "$REPORT" ] && git cat-file -e "HEAD:${REPORT}" 2>/dev/null; then
  if diff -q <(git show "HEAD:${REPORT}" | grep -v '^> Generated:') <(grep -v '^> Generated:' "$REPORT") >/dev/null 2>&1; then
    git checkout -q -- "$REPORT" 2>/dev/null || true
  fi
fi

# Trend: one row per CHANGE, not per day (run history is in lint-runs.jsonl).
write_trend() {
  local hdr="date,pages,contradictions,orphans,orphan_delta,stale,stale_pct,gaps,examined,cursor,degraded"
  local row="${DSTAMP},${PAGES},${CONTRA},${ORPHANS},${ODELTA},${STALE},${STALE_PCT},${GAPS},${EXAMINED},${CURSOR},${DEGRADED}"
  [ -f "${REPO}/${TREND}" ] || echo "$hdr" > "${REPO}/${TREND}"
  local last old new
  last="$(tail -1 "${REPO}/${TREND}")"
  old="$(echo "$last" | awk -F, '{print $2","$3","$4","$6","$7","$8","$11}')"
  new="${PAGES},${CONTRA},${ORPHANS},${STALE},${STALE_PCT},${GAPS},${DEGRADED}"
  [ "$old" = "$new" ] && return 0
  grep -v "^${DSTAMP}," "${REPO}/${TREND}" > "${REPO}/${TREND}.tmp" 2>/dev/null || true
  mv "${REPO}/${TREND}.tmp" "${REPO}/${TREND}"
  echo "$row" >> "${REPO}/${TREND}"
}
write_trend

# Alert log rollup only on a day that actually raised something.
if [ "$NONDEG" -gt 0 ] || [ "$DEGACT" -gt 0 ]; then
  {
    echo "# Lint Alert History"
    echo ""
    echo "> Rolled up from \`logs/lint-alerts.log\` (gitignored, machine-local). Most recent 40 alerts, newest last."
    echo ""
    echo '```'
    tail -40 "${REPO}/logs/lint-alerts.log"
    echo '```'
  } > "${REPO}/${ALERTDOC}"
fi

# --- 6. commit (meaningful changes only) ------------------------------------
if [ "$REMEDIATED_N" -gt 0 ]; then
  REM_FILES=$(jq -r '(.modified + .created)[]' "$REMEDIATION" 2>/dev/null)
  # shellcheck disable=SC2086
  commit_paths "docs(kb): connect ${REMEDIATED_N} page(s) into navigation, rebuild CI/escalation hubs (orphans ${B_ORPH}->${ORPHANS}, broken links ${B_BROKEN}->${BROKEN})" $REM_FILES
fi
commit_file "$QUALITY" "docs(kb-quality): knowledge-quality findings ${DSTAMP} — ${BROKEN} broken links, ${PGAPS} project gaps"
if [ "$DEGRADED" = "true" ]; then
  commit_file "$REPORT" "chore(lint): wiki report ${DSTAMP} — DEGRADED, ${PAGES} pages, ${ORPHANS} orphans, ${STALE} stale"
else
  commit_file "$REPORT" "chore(lint): wiki report ${DSTAMP} — ${PAGES} pages, ${CONTRA} contradictions, ${ORPHANS} orphans, ${STALE} stale"
fi
commit_file "$TREND" "chore(lint): trend ${DSTAMP} — orphans ${ORPHANS} (Δ${ODELTA}), stale ${STALE_PCT}%"
commit_paths "docs(kb-health): dashboard ${DSTAMP} — alert state changed" "$HEALTH" "$ALERTSTATE"
commit_file "$ALERTDOC" "docs(lint): refresh alert history ${DSTAMP}"

exit $status
