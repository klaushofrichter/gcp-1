# API Key Configuration

The Cloudflare Workers MCP server now requires API key authentication for all requests.

## Setup

1. **Create a `.env` file** in the project root:
   ```bash
   # Create .env file with your API key
   echo "QUOTES_MCP_API_KEY=YOUR_API_KEY" > .env
   ```

2. **Valid API Keys**: 
   - Contact the system administrator for a valid API key
   - Keys are stored securely in Cloudflare KV store
   - Keys can be managed dynamically without code changes
   - Test scripts automatically load the key from `.env` file

**Important**: The `.env` file is git-ignored for security and contains your local API key for testing.

## Usage

### Environment Variable
```bash
export QUOTES_MCP_API_KEY="YOUR_API_KEY"
```

### Manual Testing
Include the `X-API-Key` header in all requests:
```bash
curl -X POST "https://quotes-mcp-server.klaushofrichter.workers.dev" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}'
```

### Test Scripts
The test scripts (`quick-test.sh`, `test-mcp-server.js`) automatically read from:
1. Local `.env` file containing `QUOTES_MCP_API_KEY` (preferred for local development)
2. Environment variable `QUOTES_MCP_API_KEY` (for CI/CD or manual override)

Both scripts use the `dotenv` package (Node.js) or source the `.env` file (bash) to load the API key.

## Dynamic Key Management

API keys are now stored in Cloudflare KV store for dynamic management:

### Adding a New API Key
```bash
# Get current keys
wrangler kv key get "valid_keys" --binding QUOTES_MCP_KEYS --remote

# Update with new key (add to existing array)
wrangler kv key put "valid_keys" \
  '["existing-key-1","existing-key-2","existing-key-3","your-new-key"]' \
  --binding QUOTES_MCP_KEYS --remote
```

### Removing an API Key
```bash
# Remove a key from the array and update
wrangler kv key put "valid_keys" \
  '["existing-key-1","existing-key-2"]' \
  --binding QUOTES_MCP_KEYS --remote
```

### Listing Current Keys
```bash
wrangler kv key get "valid_keys" --binding QUOTES_MCP_KEYS --remote
```

## KV Store Configuration
- **Namespace ID**: `3837df75d0c14cc6bac4dbf3b6eefaf8`
- **Namespace Name**: `QUOTES_MCP_KEYS`
- **Binding**: `QUOTES_MCP_KEYS` (in wrangler.toml)
- **Key Name**: `valid_keys` (stores JSON array of valid API keys)

## Security Notes
- API keys are stored securely in Cloudflare KV store
- Keys can be updated without redeploying the worker
- KV changes propagate globally within seconds
- Never commit API keys to version control
- Add `.env` to your `.gitignore` file 