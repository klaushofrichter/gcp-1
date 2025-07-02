# Manual Test Cases for Cloudflare MCP Server

**Server URL:** `https://quotes-mcp-server.klaushofrichter.workers.dev`

## Prerequisites
- `curl` command line tool
- `jq` for pretty JSON formatting (optional but recommended)

Install jq: `brew install jq` (macOS) or `sudo apt install jq` (Ubuntu)

---

## Test Cases

### 1. 🔧 Initialize MCP Server
```bash
curl -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {"roots": {}, "sampling": {}},
      "clientInfo": {"name": "test-client", "version": "1.0.0"}
    }
  }' | jq '.'
```

**Expected:** Protocol version, capabilities, and server info

---

### 2. 🛠️ List Available Tools
```bash
curl -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }' | jq '.'
```

**Expected:** Array with 2 tools: `get-quote-by-character` and `random-quote-tool`

---

### 3. 📚 List Available Resources
```bash
curl -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "resources/list"
  }' | jq '.'
```

**Expected:** Array with 3 resources: `quotes://all`, `quotes://random`, `quotes://text`

---

### 4. 🖖 Get Spock Quotes (Tool)
```bash
curl -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "get-quote-by-character",
      "arguments": {"character": "Spock"}
    }
  }' | jq '.'
```

**Expected:** 3 Spock quotes including "Live long and prosper"

---

### 5. 🚀 Get Kirk Quotes (Tool)
```bash
curl -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "get-quote-by-character",
      "arguments": {"character": "Kirk"}
    }
  }' | jq '.'
```

**Expected:** Kirk quote: "Space: the final frontier"

---

### 6. 👤 Get Nonexistent Character Quotes
```bash
curl -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 6,
    "method": "tools/call",
    "params": {
      "name": "get-quote-by-character",
      "arguments": {"character": "Janeway"}
    }
  }' | jq '.'
```

**Expected:** "No quotes found" message with available characters

---

### 7. 🎲 Random Quote Tool
```bash
curl -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 7,
    "method": "tools/call",
    "params": {
      "name": "random-quote-tool",
      "arguments": {}
    }
  }' | jq '.'
```

**Expected:** Single random quote in text format

---

### 8. 📖 Read All Quotes Resource
```bash
curl -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 8,
    "method": "resources/read",
    "params": {"uri": "quotes://all"}
  }' | jq '.'
```

**Expected:** JSON array with all 6 quotes

---

### 9. 🎯 Read Random Quote Resource
```bash
curl -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 9,
    "method": "resources/read",
    "params": {"uri": "quotes://random"}
  }' | jq '.'
```

**Expected:** Single random quote as JSON object

---

### 10. 📝 Read Text Format Resource
```bash
curl -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 10,
    "method": "resources/read",
    "params": {"uri": "quotes://text"}
  }' | jq '.'
```

**Expected:** Numbered list of all quotes as plain text

---

## Error Test Cases

### 11. ❌ Invalid Method
```bash
curl -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 11,
    "method": "invalid/method"
  }' | jq '.'
```

**Expected:** Error with code -32601

---

### 12. ❌ Invalid Tool
```bash
curl -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 12,
    "method": "tools/call",
    "params": {
      "name": "nonexistent-tool",
      "arguments": {}
    }
  }' | jq '.'
```

**Expected:** Error indicating unknown tool

---

### 13. ❌ HTTP GET (Should Fail)
```bash
curl -X GET "https://quotes-mcp-server.klaushofrichter.workers.dev"
```

**Expected:** 405 Method Not Allowed

---

### 14. ❌ Malformed JSON
```bash
curl -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{"invalid": json}'
```

**Expected:** Parse error with code -32700

---

## Quick Test Script

Save this as `quick-test.sh`:

```bash
#!/bin/bash
echo "🧪 Quick MCP Server Test"
echo "========================"

# Test 1: List tools
echo "1. Testing tools/list..."
curl -s -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | jq '.result.tools[].name'

# Test 2: Get Spock quote
echo -e "\n2. Getting Spock quotes..."
curl -s -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "get-quote-by-character", "arguments": {"character": "Spock"}}}' | jq -r '.result.content[0].text'

# Test 3: Random quote
echo -e "\n3. Getting random quote..."
curl -s -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "random-quote-tool", "arguments": {}}}' | jq -r '.result.content[0].text'

echo -e "\n✅ Tests completed!"
```

Run with: `chmod +x quick-test.sh && ./quick-test.sh`

---

## Performance Test

```bash
# Test response time
time curl -s -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' > /dev/null
```

---

## Automation with loops

```bash
# Test random quotes 5 times
for i in {1..5}; do
  echo "Random quote $i:"
  curl -s -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc": "2.0", "id": '$i', "method": "tools/call", "params": {"name": "random-quote-tool", "arguments": {}}}' | jq -r '.result.content[0].text'
  echo
done
``` 