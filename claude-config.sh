#!/bin/zsh
set -e 

claude mcp remove quotes-stdio || true
claude mcp add-json quotes-stdio '{"type":"stdio", "command": "node", "args": [ "${PWD}/server.js"],"description":"Local MCP server using stdio transport for Star Trek quotes" }'

claude mcp remove quotes-http || true
claude mcp add-json quotes-http '{"type":"http", "url": "http://localhost:3001","description":"Local http MCP server for Star Trek Quotes" }'

claude mcp remove quotes-cloudflare || true
claude mcp add-json quotes-cloudflare '{"type":"http", "url": "http://localhost:3003","description":"Remote http MCP server for Star Trek Quotes via local proxy" }'

claude mcp remove quotes-sse || true
claude mcp add-json quotes-sse '{"type":"http", "url": "http://localhost:3456","description":"Local SSE MCP server for Star Trek Quotes via local proxy" }'
