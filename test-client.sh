#!/bin/bash
set -e

echo "$0: ============================================="
echo "$0: Testing the Quotes MCP with Claude and Gemini"
echo "$0: ============================================="
echo "$0: "
echo "$0: Claude:"
echo "$0: This script may depend on permissions in .claude/settings.local.json."
echo "$0: To create that setting, run the claude commands interactively first".
echo "$0: "

# servers we use
SERVERS="stdio http cloudflare"

# full Claude cleanup
for SERVER in ${SERVERS}; do
  claude mcp remove quotes-${SERVER} > /dev/null 2>&1 || true
done

# gemini settings backup
[ ! -d .gemini ] && mkdir .gemini
[ -f .gemini/settings.json ] && cp .gemini/settings.json /tmp/settings.$$.json

# go through the mcp servers
for SERVER in ${SERVERS}; do

  # map servers to parameters
  unset PORT
  unset NPMSTART
  case "${SERVER}" in

    "stdio")
      CLAUDEJSON='{"type":"stdio", "command": "node", "args": [ "${PWD}/server.js"],"description":"Local MCP server using stdio transport for Star Trek quotes" }'
      GEMINIJSON='{"type":"stdio","command":"node","args":["'
      GEMINIJSON+="${PWD}/server.js"
      GEMINIJSON+='"],"env":{}}'
    ;;

    "http")
      PORT=3001
      NPMSTART="mcp-http"
      CLAUDEJSON='{"type":"http", "url": "http://localhost:3001","description":"Local http MCP server for Star Trek Quotes" }'
      GEMINIJSON='{"httpUrl":"http://localhost:3001/mcp"}'
    ;;

    "cloudflare")
      PORT=3003
      NPMSTART="proxy"
      CLAUDEJSON='{"type":"http", "url": "http://localhost:3003","description":"Remote http MCP server for Star Trek Quotes via local proxy" }'
      GEMINIJSON='{"httpUrl":"http://localhost:3003/mcp"}'
    ;;

    *)
      echo "$0: bad server ${SERVER}"
      exit 1
      ;;

  esac

  # remove server when needed
  [ ! -z "${PORT}" ] && ./kill-port.sh ${PORT} > /dev/null 2>&1

  # launch server when needed
  [ ! -z "${NPMSTART}" ] && npm run start:${NPMSTART} > /dev/null 2>&1 &

  # set up claude
  #claude mcp add-json quotes-${SERVER} "${CLAUDEJSON}" > /dev/null 2>&1 &
  claude mcp add-json quotes-${SERVER} "${CLAUDEJSON}" 
  claude mcp list

  # set up gemini
  echo -n '{"mcpServers":{"quotes-' > .gemini/settings.json
  echo -n "${SERVER}" >> .gemini/settings.json
  echo -n '": ' >> .gemini/settings.json
  echo "${GEMINIJSON}}}" >> .gemini/settings.json
  cat .gemini/settings.json | jq

  # go through prompts
  for PROMPT in "give me a random quote"; do

    # run claude with the prompt against the server
    echo "$0:"
    echo "$0: server ${SERVER} with claude for '${PROMPT}'"
    RESPONSE=$( claude --allowedTools "mcp__quotes-${SERVER}__random-quote-tool","mcp__quotes-${SERVER}__get-quote-by-character" -p "${PROMPT}" )
    printf "$0: Claude response from ${SERVER} is '${RESPONSE}'\n"

    # run gemini with the prompt against the server
    echo "$0:"
    echo "$0: server ${SERVER} with gemini for '${PROMPT}'"
    gemini --yolo --prompt "${PROMPT}"

  done

  # remove the server from claude
  claude mcp remove quotes-${SERVER} > /dev/null 2>&1 || true

  # terminate the server
  [ ! -z "${PORT}" ] && ./kill-port.sh ${PORT} > /dev/null 2>&1

done

# full Claude cleanup
for SERVER in ${SERVERS}; do
  claude mcp remove quotes-${SERVER} > /dev/null 2>&1 || true
done

# reset claude config
./claude-config.sh > /dev/null 2>&1

# reset Gemini setting
[ -f /tmp/settings.$$.json ] && cp /tmp/settings.$$.json .gemini/settings.json && rm /tmp/settings.$$.json

# farewell
echo "$0: done... tests passed"
