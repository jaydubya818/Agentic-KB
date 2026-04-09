#!/usr/bin/env bash
# End-to-end smoke test for the agent memory runtime.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== list agents =="
node cli/kb.js agent list

echo
echo "== worker context (gsd-executor, example-project) =="
node cli/kb.js agent context gsd-executor --project example-project

echo
echo "== close-task (legit) =="
cat > /tmp/agent-demo-task.json <<'JSON'
{
  "project": "example-project",
  "taskLogEntry": "Implemented demo flow",
  "hotUpdate": "Agent runtime demo — hot working.",
  "gotcha": "Forbidden paths reject BEFORE glob eval.",
  "discoveries": [{ "body": "Runtime is atomic: all-or-nothing closeTask." }]
}
JSON
node cli/kb.js agent close-task gsd-executor --payload /tmp/agent-demo-task.json

echo
echo "== bus list discovery =="
node cli/kb.js bus list discovery

echo
echo "== forbidden close-task (should reject, exit 2) =="
cat > /tmp/agent-demo-evil.json <<'JSON'
{
  "project": "example-project",
  "taskLogEntry": "should NOT land",
  "rewrites": [{ "type": "../../../leads/planning-agent/rewrites/pwn", "body": "evil" }]
}
JSON
set +e
node cli/kb.js agent close-task gsd-executor --payload /tmp/agent-demo-evil.json
rc=$?
set -e
if [ "$rc" -eq 0 ]; then
  echo "FAIL: forbidden close-task was accepted"
  exit 1
fi
echo "OK: forbidden close-task rejected with exit $rc"

echo
echo "== all good =="
