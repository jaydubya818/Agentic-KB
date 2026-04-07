import { NextResponse } from 'next/server'

const PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.jaywest.agentic-kb-ingest</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/curl</string>
    <string>-s</string>
    <string>-X</string>
    <string>POST</string>
    <string>http://localhost:3002/api/process/run-all</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>2</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>/tmp/agentic-kb-ingest.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/agentic-kb-ingest-error.log</string>
</dict>
</plist>`

const INSTALL_SCRIPT = `#!/bin/bash
set -e
PLIST_PATH="$HOME/Library/LaunchAgents/com.jaywest.agentic-kb-ingest.plist"
cat > "$PLIST_PATH" << 'PLIST'
${PLIST}
PLIST
launchctl load "$PLIST_PATH"
echo "✓ Nightly ingest installed - runs at 2:00 AM"
echo "  Plist: $PLIST_PATH"
echo "  Log:   /tmp/agentic-kb-ingest.log"`

export async function GET(): Promise<NextResponse> {
  return new NextResponse(INSTALL_SCRIPT, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
