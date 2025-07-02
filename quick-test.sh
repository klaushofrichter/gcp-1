#!/bin/bash

# Quick Test Script for MCP Server
# Tests the Cloudflare Workers deployment

SERVER_URL="https://quotes-mcp-server.klaushofrichter.workers.dev"

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Get API key from environment variable (loaded from .env file)
API_KEY="${QUOTES_MCP_API_KEY}"

if [ -z "$API_KEY" ]; then
  echo "❌ Error: QUOTES_MCP_API_KEY not found"
  echo "Please create a .env file with: QUOTES_MCP_API_KEY=your_api_key"
  exit 1
fi

echo "🧪 Quick MCP Server Test"
echo "========================"
echo "Testing: $SERVER_URL"
echo ""

# Test 1: List tools
echo "1️⃣  Testing tools/list..."
TOOLS=$(curl -s -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}')

if command -v jq &> /dev/null; then
  echo "Available tools:"
  echo "$TOOLS" | jq -r '.result.tools[].name' | sed 's/^/   - /'
else
  echo "Tools response: $TOOLS"
fi
echo ""

# Test 2: Get Spock quotes
echo "2️⃣  Getting Spock quotes..."
SPOCK_RESPONSE=$(curl -s -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "get-quote-by-character", "arguments": {"character": "Spock"}}}')

if command -v jq &> /dev/null; then
  SPOCK_TEXT=$(echo "$SPOCK_RESPONSE" | jq -r '.result.content[0].text' 2>/dev/null)
  if [ "$SPOCK_TEXT" != "null" ] && [ -n "$SPOCK_TEXT" ]; then
    echo "$SPOCK_TEXT"
  else
    echo "❌ Failed to get Spock quotes"
    echo "Response: $SPOCK_RESPONSE"
  fi
else
  echo "Spock response: $SPOCK_RESPONSE"
fi
echo ""

# Test 3: Random quote
echo "3️⃣  Getting random quote..."
RANDOM_RESPONSE=$(curl -s -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "random-quote-tool", "arguments": {}}}')

if command -v jq &> /dev/null; then
  RANDOM_TEXT=$(echo "$RANDOM_RESPONSE" | jq -r '.result.content[0].text' 2>/dev/null)
  if [ "$RANDOM_TEXT" != "null" ] && [ -n "$RANDOM_TEXT" ]; then
    echo "Random quote: $RANDOM_TEXT"
  else
    echo "❌ Failed to get random quote"
    echo "Response: $RANDOM_RESPONSE"
  fi
else
  echo "Random response: $RANDOM_RESPONSE"
fi
echo ""

# Test 4: List resources
echo "4️⃣  Testing resources/list..."
RESOURCES=$(curl -s -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"jsonrpc": "2.0", "id": 4, "method": "resources/list"}')

if command -v jq &> /dev/null; then
  echo "Available resources:"
  echo "$RESOURCES" | jq -r '.result.resources[].uri' | sed 's/^/   - /'
else
  echo "Resources response: $RESOURCES"
fi
echo ""

# Test 5: Error handling
echo "5️⃣  Testing error handling (invalid method)..."
ERROR_RESPONSE=$(curl -s -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"jsonrpc": "2.0", "id": 5, "method": "invalid/method"}')

if command -v jq &> /dev/null; then
  ERROR_CODE=$(echo "$ERROR_RESPONSE" | jq -r '.error.code' 2>/dev/null)
  if [ "$ERROR_CODE" = "-32601" ]; then
    echo "✅ Error handling works correctly (code: $ERROR_CODE)"
  else
    echo "❌ Unexpected error response"
    echo "Response: $ERROR_RESPONSE"
  fi
else
  echo "Error response: $ERROR_RESPONSE"
fi
echo ""

echo "✅ Tests completed!"
echo ""
echo "💡 Install jq for better output formatting: brew install jq"
echo "📖 See manual-tests.md for comprehensive test cases" 