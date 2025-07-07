#!/bin/zsh
set -e 

claude mcp remove quotes-stdio
claude mcp add-json quotes-stdio '{"type":"stdio", "command": "node", "args": [ "/Users/klaushofrichter/Development/mcp-1/server.js"],"description":"Local MCP server using stdio transport for Star Trek quotes" }'

claude mcp remove quotes-http
claude mcp add-json quotes-http '{"type":"http", "url": "http://localhost:3001","description":"Local http MCP server for Star Trek Quotes" }'

claude mcp remove quotes-cloudflare
claude mcp add-json quotes-cloudflare '{"type":"http", "url": "http://localhost:3003","description":"Remote http MCP server for Star Trek Quotes via local proxy" }'

claude mcp remove quotes-sse
claude mcp add-json quotes-sse '{"type":"http", "url": "http://localhost:3456","description":"Local SSE MCP server for Star Trek Quotes via local proxy" }'
