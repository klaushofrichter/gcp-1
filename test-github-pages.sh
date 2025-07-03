#!/bin/bash

# Test script for GitHub Pages MCP server functionality
# This script validates the API key authentication works correctly

set -e  # Exit on any error

echo "🧪 Testing GitHub Pages MCP Server Functionality"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
PORT=3002
BASE_URL="http://127.0.0.1:${PORT}"
VALID_API_KEY="quotes-key-2024-live-long-prosper"
INVALID_API_KEY="invalid-test-key"

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        return 1
    fi
}

# Function to start server in GitHub Pages mode
start_github_server() {
    echo -e "${BLUE}🚀 Starting MCP server in GitHub Pages mode...${NC}"
    GITHUB_PAGES=true PORT=${PORT} node mcp-server-http.js &
    SERVER_PID=$!
    
    # Wait for server to start
    echo "⏳ Waiting for server to start..."
    sleep 3
    
    # Check if server is running
    if curl -s "${BASE_URL}/health" > /dev/null; then
        echo -e "${GREEN}✅ Server started successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Server failed to start${NC}"
        return 1
    fi
}

# Function to stop server
stop_server() {
    if [ ! -z "$SERVER_PID" ]; then
        echo -e "${YELLOW}🛑 Stopping server...${NC}"
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
    fi
}

# Cleanup function
cleanup() {
    stop_server
}

# Set trap for cleanup
trap cleanup EXIT

# Start the server
if ! start_github_server; then
    echo -e "${RED}❌ Failed to start server, exiting${NC}"
    exit 1
fi

echo ""
echo "🔍 Running API Key Authentication Tests..."
echo "=========================================="

# Test 1: Health check should show API key required
echo "Test 1: Health check shows API key required"
HEALTH_RESPONSE=$(curl -s "${BASE_URL}/health")
if echo "$HEALTH_RESPONSE" | jq -e '.apiKeyRequired == true and .environment == "GitHub Pages"' > /dev/null; then
    print_result 0 "Health check correctly shows API key required"
else
    print_result 1 "Health check doesn't show API key required"
fi

# Test 2: MCP request without API key should be rejected
echo ""
echo "Test 2: MCP request without API key gets rejected"
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/test_response "${BASE_URL}/mcp" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d '{"jsonrpc":"2.0","method":"initialize","id":1,"params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}}}')

HTTP_CODE=${RESPONSE: -3}
if [ "$HTTP_CODE" = "401" ]; then
    ERROR_MESSAGE=$(cat /tmp/test_response | jq -r '.error.message' 2>/dev/null || echo "")
    if [[ "$ERROR_MESSAGE" == *"Missing API key"* ]]; then
        print_result 0 "Request without API key correctly rejected"
    else
        print_result 1 "Wrong error message for missing API key"
    fi
else
    print_result 1 "Request without API key should return 401, got $HTTP_CODE"
fi

# Test 3: MCP request with invalid API key should be rejected
echo ""
echo "Test 3: MCP request with invalid API key gets rejected"
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/test_response "${BASE_URL}/mcp" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -H "X-API-Key: ${INVALID_API_KEY}" \
    -d '{"jsonrpc":"2.0","method":"initialize","id":1,"params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}}}')

HTTP_CODE=${RESPONSE: -3}
if [ "$HTTP_CODE" = "401" ]; then
    ERROR_MESSAGE=$(cat /tmp/test_response | jq -r '.error.message' 2>/dev/null || echo "")
    if [[ "$ERROR_MESSAGE" == *"Invalid API key"* ]]; then
        print_result 0 "Request with invalid API key correctly rejected"
    else
        print_result 1 "Wrong error message for invalid API key"
    fi
else
    print_result 1 "Request with invalid API key should return 401, got $HTTP_CODE"
fi

# Test 4: MCP request with valid API key should succeed
echo ""
echo "Test 4: MCP request with valid API key succeeds"
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/test_response "${BASE_URL}/mcp" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -H "X-API-Key: ${VALID_API_KEY}" \
    -d '{"jsonrpc":"2.0","method":"initialize","id":1,"params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}}}')

HTTP_CODE=${RESPONSE: -3}
if [ "$HTTP_CODE" = "200" ]; then
    # Check if response contains expected MCP initialize response
    if grep -q "protocolVersion" /tmp/test_response && grep -q "serverInfo" /tmp/test_response; then
        print_result 0 "Request with valid API key succeeded"
    else
        print_result 1 "Valid request succeeded but response format is incorrect"
    fi
else
    print_result 1 "Request with valid API key should return 200, got $HTTP_CODE"
fi

# Test 5: Root endpoint should show authentication info
echo ""
echo "Test 5: Root endpoint shows authentication information"
ROOT_RESPONSE=$(curl -s "${BASE_URL}/")
if echo "$ROOT_RESPONSE" | jq -e '.authentication.required == true and .authentication.method == "X-API-Key header"' > /dev/null; then
    print_result 0 "Root endpoint correctly shows authentication info"
else
    print_result 1 "Root endpoint doesn't show authentication info"
fi

echo ""
echo "🎉 GitHub Pages API Key Tests Completed!"
echo ""

# Cleanup temp files
rm -f /tmp/test_response

echo -e "${GREEN}✅ All GitHub Pages functionality tests passed!${NC}"
echo -e "${BLUE}📋 Summary:${NC}"
echo "  • API key authentication is properly enforced"
echo "  • Valid API keys allow access to MCP functionality"  
echo "  • Invalid/missing API keys are correctly rejected"
echo "  • Health and info endpoints show proper status"
echo ""
echo -e "${YELLOW}🚀 Ready for GitHub Pages deployment!${NC}" 