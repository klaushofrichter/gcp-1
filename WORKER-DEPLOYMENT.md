# Deploying MCP Server to Cloudflare Workers

This guide shows how to deploy your MCP server to Cloudflare Workers.

## 🏗️ Architecture Changes

The Cloudflare Worker version (`cloudflare-worker-mcp.js`) uses:
- ✅ Workers Request/Response API
- ✅ ES6 JSON imports (`import quotesData from './quotes.json'`)
- ✅ Durable Objects for session management
- ✅ Full MCP protocol compliance

## 📋 Prerequisites

1. **Cloudflare account** - [Sign up free](https://dash.cloudflare.com/sign-up)
2. **Wrangler CLI** - Install globally:
   ```bash
   npm install -g wrangler@latest
   ```

## 🚀 Deployment Steps

### 1. Authenticate with Cloudflare

```bash
wrangler login
```

### 2. Set up the Worker project

Create a new directory for your Worker:

```bash
mkdir quotes-mcp-worker
cd quotes-mcp-worker
```

Copy these files from your MCP project:
- `cloudflare-worker-mcp.js` → Main Worker code
- `quotes.json` → Data file (automatically bundled)
- `wrangler.toml` → Worker configuration
- `worker-package.json` → Rename to `package.json`

### 3. Install dependencies

```bash
npm install
```

### 4. Test locally

```bash
npm run dev
```

This starts the Worker locally at `http://localhost:8787`

### 5. Deploy to Cloudflare

```bash
npm run deploy
```

Your MCP server will be available at `https://quotes-mcp-server.your-account.workers.dev`

## 📁 File Handling in Workers

### JSON Data Import

The Worker imports `quotes.json` using ES6 module syntax:

```javascript
import quotesData from './quotes.json';
```

**Key points:**
- ✅ **Automatic bundling**: Wrangler automatically includes imported JSON files
- ✅ **Build-time inclusion**: Data is bundled into the Worker script during deployment
- ✅ **No runtime file system**: No need for fs/path modules
- ✅ **Type safety**: Direct JSON import with full TypeScript support

### Files Included in Deployment

When you run `npm run deploy`, Wrangler automatically bundles:
1. **Main script**: `cloudflare-worker-mcp.js`
2. **JSON data**: `quotes.json` (via import)
3. **Dependencies**: All npm packages used
4. **Configuration**: Settings from `wrangler.toml`

## 🔧 Configuration Options

### Environment Variables

In `wrangler.toml`, you can set:

```toml
[vars]
ENVIRONMENT = "production"
# Add custom variables here
```

### Deployment Environments

- **Development**: `npm run deploy:dev`
- **Staging**: `npm run deploy:staging`  
- **Production**: `npm run deploy`

## 🧪 Testing the Deployed Server

### 1. Health Check

```bash
curl https://quotes-mcp-server.your-account.workers.dev/health
```

### 2. API Information

```bash
curl https://quotes-mcp-server.your-account.workers.dev/
```

### 3. MCP Client Connection

Use the deployed URL in your MCP client configuration:

```json
{
  "mcpServers": {
    "quotes-server": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://quotes-mcp-server.your-account.workers.dev/mcp"
      ]
    }
  }
}
```

## 🔍 Monitoring & Debugging

### View logs

```bash
npm run tail
```

### Deploy with logs

```bash
wrangler deploy --tail
```

## ⚖️ Limitations & Differences

### Current Implementation vs Workers

| Feature | Current (Express) | Workers Version | Status |
|---------|------------------|-----------------|---------|
| MCP Protocol | ✅ Full support | ✅ Full support | ✅ |
| Resources | ✅ All 3 resources | ✅ All 3 resources | ✅ |
| Tools | ✅ Both tools | ✅ Both tools | ✅ |
| Session Management | ❌ In-memory | ✅ Durable Objects | ✅ |
| SSE Support | ✅ Full | ⚠️ Basic | 🔄 Partial |
| CORS | ✅ | ✅ | ✅ |

### Known Issues

1. **SSE Implementation**: Currently simplified - full Server-Sent Events implementation requires additional work
2. **Session Persistence**: Uses Durable Objects (superior to in-memory for production)
3. **Cold Start**: Workers have ~10ms cold start vs Express server always running

## 💰 Cost Considerations

Cloudflare Workers Free Tier:
- ✅ 100,000 requests/day
- ✅ 10ms CPU time per request
- ✅ 128MB memory
- ✅ 1MB script size

Your MCP server should easily fit within these limits.

## 🔗 Next Steps

1. **Custom Domain**: Add a custom domain in Cloudflare dashboard
2. **Authentication**: Add OAuth support using Cloudflare's OAuth provider
3. **Analytics**: Enable Workers Analytics for usage monitoring
4. **Scaling**: Workers automatically scale globally

## 🆚 Comparison Summary

**Current Express Server (`mcp-server-http.js`)**:
- ✅ Full MCP protocol support
- ✅ Complete SSE implementation
- ❌ Requires server infrastructure
- ❌ Single-region deployment
- ❌ Manual scaling

**Cloudflare Workers Version**:
- ✅ Full MCP protocol support  
- ✅ Global edge deployment
- ✅ Automatic scaling
- ✅ Serverless (pay-per-use)
- ✅ Built-in redundancy
- ⚠️ SSE implementation needs completion

**Recommendation**: Deploy to Workers for production use, especially if you need global availability and don't want to manage infrastructure. 
