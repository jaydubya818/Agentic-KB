#!/usr/bin/env bash
# scripts/daily-lint.sh — daily Agentic-KB wiki health check
#
# Replaces the ~40 lines of bash that used to live inline in the scheduled-task
# prose, where it was re-interpreted by the agent every morning and free to
# drift. The scheduled task should now be: run this script, relay its summary.
#
#   ./scripts/daily-lint.sh
#
# Guarantees:
#   - at least one commit is pushed on EVERY run (heartbeat), success or failure
#   - every artifact is PII-redacted and committed SEPARATELY, so a guard
#     rejection on one file cannot suppress the others
#   - only the artifacts listed below are ever staged, never other pending work
#
# Artifacts committed (one commit each, when changed):
#   wiki/lint-report.md          full report + triage (written by the API)
#   wiki/lint-trend.csv          one row per run — makes regressions visible
#                                without diffing commit messages
#   wiki/_meta/kb-health.md      human-readable scorecard + threshold status
#   wiki/_meta/lint-alerts.md    durable alert history (weekly rollup)
#
# Exit codes (the caller alerts on anything non-zero):
#   0  healthy
#   1  attention needed  (contradictions open, orphans grew by > ORPHAN_ALERT,
#                         or an absolute ceiling was breached)
#   2  degraded          (lint ran, AI analysis failed; counts still valid)
#   3  failed            (server unreachable or lint call failed entirely)
set -uo pipefail

REPO="${KB_REPO:-/Users/jaywest/Agentic-KB}"
PORT="${KB_PORT:-3002}"
BASE="http://localhost:${PORT}"
LOG="${REPO}/logs/kb-dev-server.log"
REPORT="wiki/lint-report.md"
TREND="wiki/lint-trend.csv"
HEALTH="wiki/_meta/kb-health.md"
ALERTDOC="wiki/_meta/lint-alerts.md"
ORPHAN_ALERT="${ORPHAN_ALERT:-5}"

# Absolute ceilings, added 2026-08-30. The growth-only alert above is blind to a
# large *steady* backlog: 75 orphans and 311 stale pages (38% of the vault) sat
# unchanged day over day and never once fired. These are deliberately set just
# above the current levels so they act as a ratchet against getting worse rather
# than as permanent noise — an alert that fires every single day is an alert
# nobody reads. Tighten them as the backlog is actually worked down.
ORPHAN_MAX="${ORPHAN_MAX:-80}"
STALE_PCT_MAX="${STALE_PCT_MAX:-40}"

# The 2026-08-13 run failed because a 180s client timeout cut off a server call
# that went on to finish in 4.4 minutes. Give it real headroom.
LINT_TIMEOUT="${LINT_TIMEOUT:-600}"
SERVER_TRIES="${SERVER_TRIES:-30}"
SERVER_WAIT="${SERVER_WAIT:-3}"

cd "$REPO" || { echo "FATAL: cannot cd to $REPO"; exit 3; }
mkdir -p "${REPO}/logs" "${REPO}/wiki/_meta"

# The daily commit is a heartbeat: it must happen even if this script dies on an
# unexpected error. The first version aborted on an unbound variable partway
# through and silently produced no commit at all, which is precisely the failure
# the heartbeat exists to make visible.
#
# 2026-08-30: this became a counter rather than a flag when the run started
# producing several independent artifacts. The heartbeat condition is now "did
# ANY content commit land", so the empty marker is written only when the run
# genuinely produced nothing.
COMMITS_MADE=0
MARKER_MSG="chore: daily wiki lint $(date +%F) — SKIPPED (script aborted)"

# A second writer pushed to main between runs on 2026-08-26 and the daily push
# died on a non-fast-forward, which would have silently broken the heartbeat for
# every run after it. Our commits are always small artifact-or-marker commits,
# so rebasing them onto whatever landed remotely is safe and mechanical. One
# retry, never a force-push: if the rebase itself conflicts, that needs a human.
push_main() {
  git push -q origin main 2>/dev/null && return 0
  echo "push rejected — rebasing onto origin/main and retrying"
  if ! git pull --rebase --autostash -q origin main 2>&1; then
    git rebase --abort 2>/dev/null || true   # also restores the autostash
    return 1
  fi
  git push -q origin main 2>/dev/null
}

# Single push path for the whole script. Every exit route — success, fail(), or
# an unexpected abort — lands here, so there is exactly one place where the
# heartbeat can be missed, and it is this function.
on_exit() {
  local rc=$?
  if [ "$COMMITS_MADE" -eq 0 ]; then
    echo "ALERT: no content commits this run (rc=${rc}) — writing marker"
    git commit -q --allow-empty -m "${MARKER_MSG} (rc=${rc})" 2>/dev/null \
      && COMMITS_MADE=1
  fi
  if [ -n "$(git log origin/main..HEAD --oneline 2>/dev/null)" ]; then
    if push_main; then
      echo "pushed ${COMMITS_MADE} commit(s), head: $(git log -1 --format=%h)"
      # Idempotent: self-skips unless a 'mirror' remote is configured.
      bash "${REPO}/scripts/mirror-push.sh" >/dev/null 2>&1 || true
    else
      alert "push failed even after rebase onto origin/main — resolve manually"
      echo "PUSH FAILED (not force-pushing; resolve manually)"
    fi
  fi
}
trap on_exit EXIT

http_code() { curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$1" 2>/dev/null || echo "000"; }

# --- alerting ---------------------------------------------------------------
# Deliberately zero-config and local. A daily job whose failures are only
# visible by reading the scheduler's transcript is a job that fails unnoticed —
# 2 of the 15 runs before 2026-08-20 were dead and nobody found out. macOS
# notifications need no credentials and cannot spam anyone but the user.
#
# 2026-08-30: notifications vanish if the Mac is asleep and logs/lint-alerts.log
# is gitignored, so the only durable record of a bad run lived on one machine.
# Alerts are now also rolled up into a tracked wiki page (see rollup_alerts).
alert() {
  local msg="$1"
  echo "ALERT: ${msg}"
  printf '%s\t%s\n' "$(date -Iseconds)" "$msg" >> "${REPO}/logs/lint-alerts.log"
  osascript -e "display notification \"${msg//\"/}\" with title \"KB daily lint\"" 2>/dev/null || true
}

# Cheapest possible probe: 1 output token. Catches an exhausted credit balance
# in ~1s instead of walking 826 pages and burning 30s to reach the same answer.
# Mirrors the check in scripts/morning-review-preflight.sh.
credits_exhausted() {
  local key body
  key="$(grep '^ANTHROPIC_API_KEY=' "${REPO}/web/.env.local" 2>/dev/null | cut -d= -f2- | tr -d '\r\n')"
  [ -n "$key" ] || return 1   # can't tell; let the real call decide
  body="$(curl -s --max-time 20 https://api.anthropic.com/v1/messages \
    -H "x-api-key: ${key}" -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d '{"model":"claude-haiku-4-5-20251001","max_tokens":1,"messages":[{"role":"user","content":"hi"}]}' 2>/dev/null)"
  printf '%s' "$body" | grep -qi 'credit balance is too low'
}

# --- commit helpers ---------------------------------------------------------
# One artifact per commit. Splitting these apart is not cosmetic: when the PII
# guard rejected the combined commit, the report AND the counts AND the
# heartbeat all died together. Now a rejected artifact is dropped on its own and
# the rest of the run still lands.
commit_file() {
  local path="$1" msg="$2"

  [ -f "${REPO}/${path}" ] || return 1

  # Pre-commit PII guard blocks any line referencing _private/. Cheaper to strip
  # it here than to have the hook reject the whole artifact.
  sed -i '' '/_private\//d' "${REPO}/${path}" 2>/dev/null || true

  git add -- "$path" 2>/dev/null || return 1
  if git diff --cached --quiet -- "$path"; then
    git reset -q HEAD -- "$path" 2>/dev/null || true
    return 1   # unchanged; not an error
  fi

  if git commit -q -m "$msg" -- "$path"; then
    COMMITS_MADE=$((COMMITS_MADE + 1))
    echo "commit: $(git log -1 --format=%h) ${msg}"
    return 0
  fi

  # Never --no-verify past the guard. Drop this one artifact, keep the run.
  git reset -q HEAD -- "$path" 2>/dev/null || true
  alert "pre-commit guard rejected ${path} — left uncommitted"
  return 1
}

fail() {
  echo "$1"
  echo "--- last 20 lines of ${LOG} ---"
  tail -20 "$LOG" 2>/dev/null || echo "(no server log)"
  MARKER_MSG="chore: daily wiki lint $(date +%F) — SKIPPED ($2)"
  exit 3   # trap writes the marker and pushes
}

# --- 1. ensure the dev server is up -----------------------------------------
if [ "$(http_code "${BASE}/api/pending-count")" != "200" ]; then
  echo "server down, starting..."
  ( cd "${REPO}/web" && nohup npm run dev > "$LOG" 2>&1 < /dev/null & disown ) || true

  # Tries/interval are env-overridable purely so this branch is testable: at the
  # hardcoded 30x3s the "server never came up" path took 90s to reach, which is
  # long enough that it was never actually exercised before shipping.
  up=""
  for _ in $(seq 1 "$SERVER_TRIES"); do
    sleep "$SERVER_WAIT"
    [ "$(http_code "${BASE}/api/pending-count")" = "200" ] && { up=1; break; }
  done
  [ -n "$up" ] || fail "server did not come up within $((SERVER_TRIES * SERVER_WAIT))s" "server unreachable on :${PORT}"
  echo "server up"
fi

# --- 2. run the lint --------------------------------------------------------
# Fail fast on an exhausted balance. The lint would still produce valid orphan
# and stale counts via the degraded path, so this is not a hard stop — but it
# turns a vague 502 buried in JSON into an unambiguous "top up your credits".
if credits_exhausted; then
  alert "Anthropic credits exhausted — contradiction/gap analysis will be skipped. Top up at console.anthropic.com"
fi

# 2026-08-30: a malformed or renamed line in web/.env.local yields an empty PIN,
# the API returns 401, and the script reported it as the generic "lint API
# error" — sending you to read server logs for a one-line config problem.
# Assert the precondition instead of diagnosing its symptom.
PIN="$(grep '^PRIVATE_PIN=' "${REPO}/web/.env.local" 2>/dev/null | cut -d= -f2- | tr -d '\r\n')"
[ -n "$PIN" ] || fail "PRIVATE_PIN missing or empty in web/.env.local — the lint call would 401" "PIN not configured"

RESP="$(curl -s --max-time "$LINT_TIMEOUT" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"pin\":\"${PIN}\"}" "${BASE}/api/lint" 2>/dev/null)"

echo "$RESP" | jq -e '.ok == true' >/dev/null 2>&1 \
  || fail "lint call failed: ${RESP:0:400}" "lint API error"

# --- 3. summarise -----------------------------------------------------------
# One jq call per field. A single @sh template is denser but nests shell quotes
# inside a jq string literal, which is how the first version of this script
# silently produced a compile error and skipped the heartbeat commit entirely.
jqf() { echo "$RESP" | jq -r "${1} // ${2}" 2>/dev/null || echo "$2"; }

PAGES=$(jqf '.pagesScanned' 0)
CONTRA=$(jqf '.contradictions' 0)
ORPHANS=$(jqf '.orphans' 0)
STALE=$(jqf '.stalePages' 0)
GAPS=$(jqf '.gaps' 0)
ODELTA=$(jqf '.orphanDelta' 0)
EXAMINED=$(jqf '.analysisWindow.examined' 0)
CURSOR=$(jqf '.analysisWindow.cursor' 0)
DEGRADED=$(jqf '.degraded' false)
REASON=$(echo "$RESP" | jq -r '.degradedReason // ""' 2>/dev/null | tr -d '\n' | cut -c1-200)

STALE_PCT=0
[ "$PAGES" -gt 0 ] 2>/dev/null && STALE_PCT=$(( STALE * 100 / PAGES ))
COVER_PCT=0
[ "$PAGES" -gt 0 ] 2>/dev/null && COVER_PCT=$(( EXAMINED * 100 / PAGES ))

echo "pages=${PAGES} contradictions=${CONTRA} orphans=${ORPHANS} (Δ${ODELTA}) stale=${STALE} (${STALE_PCT}%) gaps=${GAPS}"
echo "analysis window: ${EXAMINED}/${PAGES} pages (${COVER_PCT}%), cursor at ${CURSOR}"

status=0
if [ "$DEGRADED" = "true" ]; then
  alert "degraded run — ${REASON}"
  status=2
else
  [ "$CONTRA" -gt 0 ] && { alert "${CONTRA} open contradiction(s) in the wiki"; status=1; }
  [ "$ODELTA" -gt "$ORPHAN_ALERT" ] && { alert "orphans grew by ${ODELTA} since the last run"; status=1; }
  [ "$ORPHANS" -gt "$ORPHAN_MAX" ] && { alert "orphans at ${ORPHANS}, over the ${ORPHAN_MAX} ceiling"; status=1; }
  [ "$STALE_PCT" -gt "$STALE_PCT_MAX" ] && { alert "stale pages at ${STALE_PCT}% of the vault, over the ${STALE_PCT_MAX}% ceiling"; status=1; }
fi

# --- 4. trend history -------------------------------------------------------
# One row per run. Each daily snapshot previously existed only as a commit
# message, so answering "when did stale start climbing?" meant reading git log
# by eye. Re-running on the same day replaces that day's row rather than
# appending a duplicate, so the file stays one-row-per-day and idempotent.
write_trend() {
  local today; today="$(date +%F)"
  local hdr="date,pages,contradictions,orphans,orphan_delta,stale,stale_pct,gaps,examined,cursor,degraded"
  local row="${today},${PAGES},${CONTRA},${ORPHANS},${ODELTA},${STALE},${STALE_PCT},${GAPS},${EXAMINED},${CURSOR},${DEGRADED}"

  if [ -f "${REPO}/${TREND}" ]; then
    grep -v "^${today}," "${REPO}/${TREND}" > "${REPO}/${TREND}.tmp" 2>/dev/null || true
    mv "${REPO}/${TREND}.tmp" "${REPO}/${TREND}"
  else
    echo "$hdr" > "${REPO}/${TREND}"
  fi
  echo "$row" >> "${REPO}/${TREND}"
}
write_trend

# --- 5. health scorecard ----------------------------------------------------
# Deliberately numbers-only, with the page-level triage left in lint-report.md.
# Keeping vault page paths out of this file keeps its PII-guard surface at zero,
# which matters because it is regenerated unattended every single day.
write_health() {
  local badge="🟢 healthy"
  [ "$status" -eq 1 ] && badge="🟡 attention"
  [ "$status" -eq 2 ] && badge="🟠 degraded"

  {
    echo "# KB Health"
    echo ""
    echo "> Generated by \`scripts/daily-lint.sh\` on $(date +'%F %H:%M') — **${badge}**"
    echo ""
    echo "| Metric | Value | Ceiling | Status |"
    echo "|---|---|---|---|"
    echo "| Pages | ${PAGES} | — | — |"
    echo "| Contradictions | ${CONTRA} | 0 | $([ "$CONTRA" -gt 0 ] && echo '🔴 over' || echo '🟢 ok') |"
    echo "| Orphans | ${ORPHANS} (Δ${ODELTA}) | ${ORPHAN_MAX} | $([ "$ORPHANS" -gt "$ORPHAN_MAX" ] && echo '🔴 over' || echo '🟢 ok') |"
    echo "| Stale | ${STALE} (${STALE_PCT}%) | ${STALE_PCT_MAX}% | $([ "$STALE_PCT" -gt "$STALE_PCT_MAX" ] && echo '🔴 over' || echo '🟢 ok') |"
    echo "| Gaps | ${GAPS} | — | — |"
    echo ""
    echo "**Analysis coverage:** ${EXAMINED}/${PAGES} pages (${COVER_PCT}%) this run, cursor at ${CURSOR}."
    echo "The window rotates each run, so contradiction and gap findings reflect a"
    echo "rolling sample rather than a full-vault sweep — a \`0\` here means \"none in"
    echo "this window\", not \"none in the vault\"."
    echo ""
    [ "$DEGRADED" = "true" ] && { echo "> ⚠️ Degraded run: \`${REASON}\`"; echo "> Contradiction and gap counts are stale carry-over from the last good run."; echo ""; }
    echo "See [lint-report.md](../lint-report.md) for page-level triage,"
    echo "[lint-trend.csv](../lint-trend.csv) for the full history, and"
    # Not decoration: this page is generated into the vault, so without an
    # inbound link it lands in the very orphan count this file reports on.
    echo "[lint-alerts.md](./lint-alerts.md) for the alert log."
  } > "${REPO}/${HEALTH}"
}
write_health

# --- 6. durable alert history ----------------------------------------------
# logs/lint-alerts.log is gitignored and machine-local, so every alert this job
# has ever raised was invisible from anywhere but this Mac. Roll the recent
# window into a tracked page. Weekly (Mondays) plus any day that raised an
# alert — daily would churn a file whose content rarely changes.
rollup_alerts() {
  [ -f "${REPO}/logs/lint-alerts.log" ] || return 0
  {
    echo "# Lint Alert History"
    echo ""
    echo "> Rolled up from \`logs/lint-alerts.log\` (gitignored, machine-local) on $(date +'%F %H:%M')."
    echo "> Most recent 40 alerts, newest last."
    echo ""
    echo '```'
    tail -40 "${REPO}/logs/lint-alerts.log"
    echo '```'
  } > "${REPO}/${ALERTDOC}"
}
if [ "$(date +%u)" = "1" ] || [ "$status" -ne 0 ]; then
  rollup_alerts
fi

# --- 7. commit --------------------------------------------------------------
# Separate commits, most-substantive first. The trap pushes them as one batch.
DSTAMP="$(date +%F)"
if [ "$DEGRADED" = "true" ]; then
  commit_file "$REPORT" "chore(lint): wiki report ${DSTAMP} — DEGRADED, ${PAGES} pages, ${ORPHANS} orphans, ${STALE} stale"
else
  commit_file "$REPORT" "chore(lint): wiki report ${DSTAMP} — ${PAGES} pages, ${CONTRA} contradictions, ${ORPHANS} orphans, ${STALE} stale"
fi
commit_file "$TREND"  "chore(lint): trend row ${DSTAMP} — orphans ${ORPHANS} (Δ${ODELTA}), stale ${STALE_PCT}%"
commit_file "$HEALTH" "docs(kb-health): scorecard ${DSTAMP} — status ${status}, coverage ${COVER_PCT}%"
commit_file "$ALERTDOC" "docs(lint): refresh alert history ${DSTAMP}"

MARKER_MSG="chore: daily wiki lint ${DSTAMP} — SKIPPED (all artifacts unchanged)"

exit $status
