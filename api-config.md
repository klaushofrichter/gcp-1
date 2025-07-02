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
curl -X POST "https://quotes-mcp-server.YOUR-SUBDOMAIN.workers.dev" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}'
```

### Test Scripts
The test scripts (`quick-test.sh`, `test-mcp-server.js`) automatically read from:
1. Local `.env` file containing `QUOTES_MCP_API_KEY` (preferred for local development)
2. Environment variable `QUOTES_MCP_API_KEY` (for CI/CD or manual override)

Both scripts use the `dotenv` package (Node.js) or source the `.env` file (bash) to load the API key.

## Deploying API Keys to Cloudflare KV Store

### Initial Setup and Key Deployment

The Cloudflare Worker uses a KV store to manage valid API keys. Follow these steps to deploy your API keys:

#### 1. Create KV Namespace (if not already exists)
```bash
# Create the KV namespace (only needed once)
wrangler kv:namespace create "QUOTES_MCP_KEYS"

# Note the namespace ID returned (should be: YOUR_NAMESPACE_ID)
# Add it to wrangler.toml if not already configured
```

#### 2. Deploy Complete Set of Valid API Keys
Deploy all valid API keys as a JSON array to the KV store:

```bash
# Deploy the complete set of valid API keys
wrangler kv key put "valid_keys" \
  '["your-api-key-1","your-api-key-2","your-api-key-3","your-api-key-4"]' \
  --namespace-id YOUR_NAMESPACE_ID --remote
```

**🚨 Critical Requirement**: The API key in your `.env` file **MUST** be one of the keys in this array. For example, if your `.env` contains:
```bash
QUOTES_MCP_API_KEY=your-api-key-1
```

Then `your-api-key-1` **must** be included in the KV store array above.

#### 3. Verify Deployment
```bash
# Verify the keys were deployed correctly
wrangler kv key get "valid_keys" --namespace-id YOUR_NAMESPACE_ID --remote

# Should return:
# ["your-api-key-1","your-api-key-2","your-api-key-3","your-api-key-4"]
```

#### 4. Test the Deployment
```bash
# Test with a valid API key from your .env
npm run test:cloudflare-quick

# Or run comprehensive tests
npm run test:cloudflare
```

### Alternative Deployment Methods

#### Using Binding Name (Recommended)
If your `wrangler.toml` is properly configured with the KV binding:

```bash
# Using the binding name from wrangler.toml
wrangler kv key put "valid_keys" \
  '["your-api-key-1","your-api-key-2","your-api-key-3","your-api-key-4"]' \
  --binding QUOTES_MCP_KEYS --remote
```

#### Individual Key Upload
You can also upload keys one by one and build the array:

```bash
# Start with an array containing just one key
wrangler kv key put "valid_keys" '["your-api-key-1"]' --binding QUOTES_MCP_KEYS --remote

# Add more keys by updating the entire array
wrangler kv key put "valid_keys" \
  '["your-api-key-1","your-api-key-2"]' \
  --binding QUOTES_MCP_KEYS --remote

# Continue until all keys are added...
```

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
- **Namespace ID**: `YOUR_NAMESPACE_ID` (example in this repo: `3837df75d0c14cc6bac4dbf3b6eefaf8`)
- **Namespace Name**: `QUOTES_MCP_KEYS`
- **Binding**: `QUOTES_MCP_KEYS` (in wrangler.toml)
- **Key Name**: `valid_keys` (stores JSON array of valid API keys)

**Note**: The namespace ID in this repository's `wrangler.toml` is specific to this deployment. When you create your own deployment, you'll need to:
1. Create your own KV namespace: `wrangler kv:namespace create "QUOTES_MCP_KEYS"`
2. Update `wrangler.toml` with your new namespace ID
3. Deploy your API keys to your namespace

## Troubleshooting KV Store Deployment

### Common Issues and Solutions

#### 1. Authentication Errors During Testing
**Problem**: Tests fail with 401 errors even with correct KV setup
**Solution**: 
```bash
# Check if your .env key matches KV store keys
cat .env
wrangler kv key get "valid_keys" --binding QUOTES_MCP_KEYS --remote

# Make sure your .env key is in the KV array
```

#### 2. KV Namespace Not Found
**Problem**: `Error: Could not find namespace with id "xxx"`
**Solution**:
```bash
# List all KV namespaces to find the correct ID
wrangler kv:namespace list

# Use the correct namespace ID in your commands
```

#### 3. Worker Deployment Required
**Problem**: KV changes not taking effect
**Solution**:
```bash
# After updating KV store, redeploy the worker
npx wrangler deploy

# Test the changes
npm run test:cloudflare-quick
```

#### 4. JSON Format Errors
**Problem**: KV store rejects the API key array
**Solution**:
```bash
# Ensure proper JSON formatting (use double quotes)
wrangler kv key put "valid_keys" \
  '["key1","key2","key3"]' \
  --binding QUOTES_MCP_KEYS --remote

# NOT: ['key1','key2','key3'] (single quotes inside)
```

#### 5. Binding Configuration Issues
**Problem**: `Error: Unknown binding "QUOTES_MCP_KEYS"`
**Solution**: Check your `wrangler.toml` contains:
```toml
[[kv_namespaces]]
binding = "QUOTES_MCP_KEYS"
id = "YOUR_NAMESPACE_ID"
```

### Validation Commands

```bash
# Complete validation workflow
echo "1. Check KV binding configuration:"
cat wrangler.toml | grep -A2 "kv_namespaces"

echo "2. Check current KV store contents:"
wrangler kv key get "valid_keys" --binding QUOTES_MCP_KEYS --remote

echo "3. Check local .env file:"
cat .env

echo "4. Test API key authentication:"
npm run test:cloudflare-quick

echo "5. Check worker deployment status:"
npx wrangler whoami
```

## Security Notes
- API keys are stored securely in Cloudflare KV store
- Keys can be updated without redeploying the worker
- KV changes propagate globally within seconds
- Never commit API keys to version control
- Add `.env` to your `.gitignore` file 
- The KV store namespace ID is visible in `wrangler.toml` (public repository file) but requires account authentication to access
- Use strong, unique API keys (e.g., `my-app-key-2024-` prefix with meaningful suffixes)

## Quick Reference

### Essential Commands for API Key Management

```bash
# 1. Initial KV store setup (one-time)
wrangler kv key put "valid_keys" \
  '["your-api-key-1","your-api-key-2","your-api-key-3","your-api-key-4"]' \
  --binding QUOTES_MCP_KEYS --remote

# 2. Check current keys
wrangler kv key get "valid_keys" --binding QUOTES_MCP_KEYS --remote

# 3. Test configuration
npm run test:cloudflare-quick

# 4. Redeploy worker (if needed)
npx wrangler deploy
```

### File Locations
- **Local API Key**: `.env` file (git-ignored)
- **KV Store**: Cloudflare namespace `YOUR_NAMESPACE_ID`
- **Worker Config**: `wrangler.toml` (contains actual namespace ID - public)
- **Test Scripts**: `test-mcp-server.js`, `quick-test.sh`

### Required Environment
- **Wrangler CLI**: `npm install -g wrangler`
- **Authentication**: `wrangler login`
- **Node.js**: For test scripts and dotenv support 