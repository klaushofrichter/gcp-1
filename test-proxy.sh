#!/bin/bash

# Test script for the MCP Proxy Server
# This script tests that the proxy correctly forwards requests to the remote server

echo "🧪 Testing MCP Proxy Server"
echo "============================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file with QUOTES_MCP_API_KEY"
    exit 1
fi

# Load environment variables
source .env 2>/dev/null || echo "⚠️  Could not source .env file"

if [ -z "$QUOTES_MCP_API_KEY" ]; then
    echo "❌ Error: QUOTES_MCP_API_KEY not set in .env file"
    exit 1
fi

PROXY_URL="http://localhost:3001"

# Check if proxy is running
echo "1️⃣  Checking if proxy server is running..."
if ! curl -s "${PROXY_URL}/proxy/health" > /dev/null; then
    echo "❌ Proxy server not running on port 3001"
    echo "💡 Start with: npm run start:proxy"
    exit 1
fi

echo "✅ Proxy server is running"

# Test 1: Health check
echo -e "\n2️⃣  Testing proxy health check..."
curl -s "${PROXY_URL}/proxy/health" | jq '.' 2>/dev/null || curl -s "${PROXY_URL}/proxy/health"

# Test 2: MCP Initialize (no API key required)
echo -e "\n3️⃣  Testing MCP initialize (no API key)..."
INIT_RESPONSE=$(curl -s -X POST "${PROXY_URL}" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"roots":{},"sampling":{}},"clientInfo":{"name":"proxy-test","version":"1.0.0"}}}')

# Validate the initialize response
if echo "$INIT_RESPONSE" | jq -e '.result.serverInfo.name' > /dev/null 2>&1; then
    SERVER_NAME=$(echo "$INIT_RESPONSE" | jq -r '.result.serverInfo.name')
    echo "✅ MCP server initialized: $SERVER_NAME"
else
    echo "❌ MCP initialization failed!"
    echo "Response: $INIT_RESPONSE"
    exit 1
fi

# Test 3: List tools (no API key required)
echo -e "\n4️⃣  Testing tools/list (no API key)..."
TOOLS_RESPONSE=$(curl -s -X POST "${PROXY_URL}" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}')

# Validate the tools response
if echo "$TOOLS_RESPONSE" | jq -e '.result.tools' > /dev/null 2>&1; then
    TOOL_COUNT=$(echo "$TOOLS_RESPONSE" | jq '.result.tools | length')
    echo "✅ Found $TOOL_COUNT tools:"
    echo "$TOOLS_RESPONSE" | jq -r '.result.tools[].name' | sed 's/^/   - /'
else
    echo "❌ Tools request failed!"
    echo "Response: $TOOLS_RESPONSE"
    exit 1
fi

# Test 4: Get random quote (no API key required)
echo -e "\n5️⃣  Testing random quote tool (no API key)..."
QUOTE_RESPONSE=$(curl -s -X POST "${PROXY_URL}" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"random-quote-tool","arguments":{}}}')

# Validate the quote response
if echo "$QUOTE_RESPONSE" | jq -e '.result.content[0].text' > /dev/null 2>&1; then
    QUOTE=$(echo "$QUOTE_RESPONSE" | jq -r '.result.content[0].text')
    echo "✅ Random quote: $QUOTE"
else
    echo "❌ Quote request failed!"
    echo "Response: $QUOTE_RESPONSE"
    exit 1
fi

echo -e "\n✅ Proxy tests completed!"
echo "💡 The proxy automatically adds your API key to all requests"
echo "📖 Use http://localhost:3001 for local development without API keys" 