#!/bin/bash
# Forward AskUserQuestion hook events to Electric Agent studio.
# Blocks until the user answers in the web UI.
BODY="$(cat)"
RESPONSE=$(curl -s -X POST "http://host.docker.internal:4400/api/sessions/b65a4e9c-08c6-4b09-93d7-c5e1b6b694b4/hook-event" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer d9551ccb7348324e9640c27ef846cedc19a9dc2404edc514fc365d293766af11" \
  -d "${BODY}" \
  --max-time 360 \
  --connect-timeout 5 \
  2>/dev/null)
if echo "${RESPONSE}" | grep -q '"hookSpecificOutput"'; then
  echo "${RESPONSE}"
fi
exit 0