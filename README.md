# MCP Quotes Server 🖖

A comprehensive Model Context Protocol (MCP) server that provides Star Trek quotes through resources and tools. Built with the modern MCP SDK v1.13.2, this server demonstrates how to create and deploy MCP resources for AI assistants.

This project features a **shared library architecture** that eliminates code duplication across multiple server implementations while maintaining consistent functionality and behavior.

The code was mostly created by Claude 4 / Cursor. 

## 🏗️ Architecture

### Shared Libraries (`lib/`)
The project uses a modular architecture with shared libraries to eliminate code duplication:

- **📋 `lib/quote-functions.js`** - Core business logic functions
  - Character search, random selection, text formatting
  - Data validation and statistics
- **🔧 `lib/mcp-resources.js`** - MCP protocol definitions  
  - Standard resource and tool registration
  - Server metadata generation
- **🌐 `lib/rest-api-helpers.js`** - REST API response handlers
  - Endpoint logic for all HTTP operations  
  - Consistent error handling
- **🧪 `lib/test-helpers.js`** - Testing utilities
  - Shared test data and validation functions
  - Common test patterns and assertions

### Benefits
- **🎯 Single source of truth** - Core logic defined once, used everywhere
- **🐛 Centralized bug fixes** - Fix once, fixes all implementations  
- **⚡ Faster development** - New features added across all servers simultaneously
- **🧪 Easier testing** - Shared utilities reduce test duplication
- **📏 Consistent behavior** - All implementations use identical logic

## 🚀 Features

### MCP Server (stdio transport)
#### Resources (3 available)
- **📚 All Quotes** (`quotes://all`) - Complete collection of quotes as JSON
- **🎲 Random Quote** (`quotes://random`) - Single random quote as JSON  
- **📝 Text Format** (`quotes://text`) - All quotes formatted as readable text

#### Tools (2 available)
- **🔍 Get Quote by Character** - Search quotes by Star Trek character name
- **🎯 Random Quote Tool** - Generate a random quote in text format

### MCP Server (HTTP transport)
#### MCP Endpoints
- **🌐 POST /mcp** - MCP client requests and initialization
- **📡 GET /mcp** - MCP server-to-client notifications (SSE)
- **🔚 DELETE /mcp** - MCP session termination
- **💚 GET /health** - Health check and session info
- **📋 GET /** - API information

#### Same MCP Features via HTTP
- **📚 Resources**: Same 3 resources accessible via HTTP MCP protocol
- **🛠️ Tools**: Same 2 tools callable via HTTP MCP protocol
- **🔒 Session Management**: Stateful sessions with proper cleanup
- **⚡ Real-time**: Server-to-client notifications via SSE

### Cloudflare Workers (Global HTTP MCP)
#### Global Edge Network
- **⚡ Sub-30ms response times** from 300+ global locations
- **♾️ Unlimited scaling** with automatic load balancing
- **🌍 99.9% uptime** with built-in redundancy

#### DRY Implementation
- **📦 Imports quotes.json** - Single source of truth for data
- **🔧 Reuses shared functions** - All utility functions from `lib/quote-functions.js`
- **⚡ Optimized bundle** - 9.18 KiB (vs 531 KiB before DRY refactoring)
- **🧹 Clean codebase** - No duplicated logic or hardcoded data

#### Same MCP Protocol & Features
- **📚 Resources**: All 3 MCP resources available globally
- **🛠️ Tools**: Both MCP tools with edge performance
- **🌐 CORS Ready**: Pre-configured for web applications
- **📊 Production Monitoring**: Built-in health checks

### REST API Server (HTTP endpoints)
#### Available Endpoints
- **🌐 GET /** - API information and available endpoints
- **📚 GET /quotes** - All quotes as JSON
- **🎲 GET /quotes/random** - Random quote as JSON
- **📝 GET /quotes/text** - All quotes as formatted text  
- **🔍 GET /quotes/character/:name** - Search quotes by character
- **👥 GET /characters** - List all available characters
- **🔎 GET /search?q=term** - Search quotes by content or character
- **💚 GET /health** - Server health check

### Local Proxy Server (API Key Bridge)
#### Connects MCP Clients to Remote Servers
- **🔑 API Key Problem Solver** - MCP clients like Cursor don't support API keys
- **🌍 Remote Server Access** - Connect local clients to global Cloudflare deployment
- **🔄 Transparent Proxy** - Forwards all MCP requests with automatic authentication
- **📊 Request Monitoring** - Real-time logging of all proxied requests and responses
- **⚡ Zero Client Changes** - Existing MCP clients work without modification

### Data Features
- 8 iconic Star Trek quotes from beloved characters
- Case-insensitive character search
- Partial name matching support
- Comprehensive error handling

### Development Features
- **📦 Modular Architecture** - Shared libraries eliminate 400+ lines of duplicate code
- **🔄 DRY Principle** - Don't Repeat Yourself across all implementations
- **🧪 Comprehensive Testing** - 79 tests covering all functionality
- **🛠️ Easy Maintenance** - Single point of change for core functionality
- **📖 Well Documented** - Clear API documentation and code examples

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)
- MCP-compatible client (Cursor or Claude Code)

## ⚡ Quick Start for Cursor Users

**Want to connect Cursor to the production MCP server?** Use the proxy server:

```bash
# 1. Set up API key (one-time)
cp .env.example .env
# Edit .env: QUOTES_MCP_API_KEY=your_actual_api_key

# 2. Start proxy (keep running while using Cursor)
npm run start:proxy

# 3. Test it works
curl -X POST "http://localhost:3001" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# 4. Configure Cursor to use the proxy (see MCP Client Configuration section)
```

**Result**: Cursor now accesses the global, production-grade MCP server without knowing about API keys! 🎉

## 🛠️ Installation

### 1. Clone or Download
```bash
# If using git
git clone <repository-url>
cd mcp-quotes-server

# Or download and extract the files to a directory
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables (for Testing)
For running tests and accessing the Cloudflare deployment, you'll need to configure API keys:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and replace YOUR_API_KEY with a valid API key
# The file should contain:
# QUOTES_MCP_API_KEY=your_actual_api_key_here
```

**Important Notes:**
- The `.env` file is used by test scripts (`test-mcp-server.js`, `quick-test.sh`)
- This is only needed if you want to test the **Cloudflare Workers deployment**
- Local MCP servers (`npm start`, `npm run start:mcp-http`) do **not** require API keys
- The `.env` file is automatically loaded using the `dotenv` package
- Contact the administrator for valid API keys for the Cloudflare deployment

### 4. Verify Installation
```bash
# Test the server
npm test

# Start the server (for testing)
npm start
```

## ⚙️ MCP Client Configuration

### 🎯 Cursor IDE

#### **Option 1: Local MCP Server (Recommended for Development)**

1. **Open Cursor Settings**
   - Press `Cmd/Ctrl + ,` to open settings
   - Search for "MCP" or navigate to Extensions → MCP

2. **Add MCP Server Configuration**
   Add this configuration to your Cursor MCP settings:

   ```json
   {
     "mcpServers": {
       "quotes-server": {
         "command": "npm",
         "args": ["start"],
         "cwd": "/YOUR_PATH/mcp-1",
         "env": {}
       }
     }
   }
   ```

3. **Restart Cursor**
   - Restart Cursor IDE to load the MCP server
   - The quotes server will be available in your AI chat

#### **Option 2: Remote Server via Proxy (Recommended for Production)**

**🎯 Perfect for connecting Cursor to the remote Cloudflare deployment!**

**Why use the proxy?** Cursor (and most MCP clients) don't know about API keys, but the remote Cloudflare server requires authentication. The proxy solves this by automatically adding the API key to all requests.

1. **Set up environment** (one-time setup):
   ```bash
   # Copy and configure API key
   cp .env.example .env
   # Edit .env and add your API key:
   # QUOTES_MCP_API_KEY=your_actual_api_key
   ```

2. **Start the proxy server** (keep running):
   ```bash
   npm run start:proxy
   ```
   The proxy runs on `http://localhost:3001` and forwards to the remote server.

3. **Test the connection** manually:
   ```bash
   # With proxy running, test that it works (no API key needed)
   curl -X POST "http://localhost:3001" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
   ```

4. **Configure your MCP client** to connect to the proxy:
   - **For HTTP-capable MCP clients**: Point to `http://localhost:3001`
   - **For stdio-only clients like Cursor**: Use the local HTTP MCP server on a different port that forwards to the proxy (requires custom configuration)

   **Note**: MCP client configuration for HTTP proxies varies by client. The proxy provides a standard HTTP JSON-RPC endpoint that any HTTP-capable MCP client can use.

5. **Restart Cursor**
   - Now Cursor connects to the global Cloudflare deployment **transparently**
   - ✅ **No API key management needed in Cursor**
   - ✅ **Sub-30ms response times globally**  
   - ✅ **Always up-to-date with latest deployment**
   - ✅ **Production-grade reliability and scaling**

### 🤖 Claude Code

1. **Install Claude Code CLI**
   - Install "claude code" by following the [instructions](https://docs.anthropic.com/en/docs/claude-code/setup). 

2. **Configure MCP Server**
   - Create a MCP server configuration in a `.mcp.json` file:

    ```json
    {
      "mcpServers": {
        "quotes-server": {
          "type": "stdio",
          "command": "node", 
          "args": ["/YOUR-PATH/mcp-1/server.js"],
          "env": {}
        }
      }
    }
    ```

  **Important**: Update the `args` path to match your actual installation directory.

3. **Run Claude**
   - Launch claude code with the command line `claude`. You can check the MCP server
     availability with the command `/mcp'. Use the server by asking for example:
     `give me a quote by picard`. 


## 📖 API Documentation

### Resources

#### 1. All Quotes (`quotes://all`)
Returns the complete collection of quotes as JSON.

**Response Format:**
```json
[
  {
    "quote": "Live long and prosper.",
    "by": "Spock"
  },
  {
    "quote": "Beam me up, Scotty.",
    "by": "Captain James T. Kirk"
  }
]
```

#### 2. Random Quote (`quotes://random`)
Returns a single random quote as JSON.

**Response Format:**
```json
{
  "quote": "Make it so.",
  "by": "Captain Jean-Luc Picard"
}
```

#### 3. Text Format (`quotes://text`)
Returns all quotes formatted as readable text.

**Response Format:**
```
1. "Live long and prosper." - Spock

2. "Beam me up, Scotty." - Captain James T. Kirk

3. "Resistance is futile." - The Borg

4. "Make it so." - Captain Jean-Luc Picard

5. "I have been, and always shall be, your friend." - Spock

6. "Logic is the beginning of wisdom, not the end." - Spock

7. "It was … fun." - Captain James T. Kirk

8. "I don't believe in the no-win scenario." - Captain James T. Kirk
```

### Tools

#### 1. Get Quote by Character
Search for quotes by a specific Star Trek character.

**Parameters:**
- `character` (string): Character name to search for

**Features:**
- Case-insensitive search
- Partial name matching
- Returns all matching quotes

**Examples:**
```
Input: "Spock" → Returns all 3 Spock quotes
Input: "spock" → Same result (case-insensitive)
Input: "Captain" → Returns quotes from both Kirk and Picard
Input: "Worf" → Returns "No quotes found" message
```

#### 2. Random Quote Tool
Generates a random quote in text format.

**Parameters:** None

**Response Format:**
```
"Live long and prosper." - Spock
```

## 🎯 Server Types & When to Use Each

This project provides **five different server implementations** for different use cases:

### 1. MCP Server (stdio) - `npm start`
**Best for**: Local AI assistants like Claude, Cursor, and other desktop MCP clients
- ✅ **Native MCP Protocol**: Full MCP specification compliance
- ✅ **Auto-discovery**: Resources and tools automatically discovered
- ✅ **Local Integration**: Perfect for desktop AI assistants
- ❌ **Local Only**: Cannot be accessed remotely

### 2. MCP Server (HTTP) - `npm run start:mcp-http`  
**Best for**: Remote MCP clients, web-based MCP integrations, local development
- ✅ **Full MCP Protocol**: Complete MCP 2024-11-05 specification compliance
- ✅ **Remote Access**: HTTP transport allows network-based MCP clients
- ✅ **Session Management**: UUID-based sessions with automatic cleanup
- ✅ **Real-time**: Server-to-client notifications via Server-Sent Events (SSE)
- ✅ **Security**: DNS rebinding protection and host validation
- ✅ **Stateful**: Maintains session state across multiple requests
- ✅ **Production Ready**: Graceful shutdown and error handling
- ❌ **Single Server**: Runs on one machine

### 3. Cloudflare Workers (HTTP MCP) - `npm run worker:deploy`
**Best for**: Production deployments, global scale, web applications, high availability
- ✅ **Global Edge Network**: 300+ locations worldwide
- ✅ **Ultra-Fast**: Sub-30ms response times globally
- ✅ **Auto-Scaling**: Handles unlimited concurrent users
- ✅ **Full MCP Protocol**: Complete HTTP MCP transport support
- ✅ **99.9% Uptime**: Built-in redundancy and failover
- ✅ **Cost Effective**: Free tier + pay-per-use scaling
- ✅ **Zero Infrastructure**: No servers to manage
- ✅ **DRY Implementation**: Optimized bundle size with shared functions

### 4. REST API Server (HTTP) - `npm run start:http`
**Best for**: Web applications, mobile apps, general API access, non-MCP clients
- ✅ **Standard REST**: Familiar HTTP endpoints
- ✅ **No MCP Client**: Works with any HTTP client
- ✅ **Simple Integration**: Easy to integrate with existing systems
- ❌ **No Auto-discovery**: Manual endpoint management
- ❌ **No MCP Features**: Missing MCP-specific capabilities

### 5. Local Proxy Server - `npm run start:proxy`
**Best for**: Connecting MCP clients (like Cursor) to remote servers that require API keys
- ✅ **Solves API Key Problem**: MCP clients don't know about API keys, proxy handles authentication automatically
- ✅ **Connect Cursor to Remote Server**: Perfect for accessing the global Cloudflare deployment from Cursor
- ✅ **Transparent Proxy**: Forwards all requests to remote MCP server unchanged
- ✅ **No Client Modification**: Existing MCP clients work without changes
- ✅ **Full MCP Protocol**: Complete passthrough of all MCP functionality
- ✅ **Request Logging**: Shows all proxied requests and response times
- ❌ **Requires Remote Server**: Needs the Cloudflare deployment to be available
- ❌ **Local Only**: Proxy itself runs locally on port 3001



## 🔗 Local Proxy Server Deep Dive

The Local Proxy Server (`proxy-server.js`) solves a critical problem: **MCP clients like Cursor don't understand API keys**, but production MCP servers (like our Cloudflare deployment) require authentication.

### 🎯 Purpose & Benefits

#### **🔑 Solves the API Key Problem**
- **MCP Client Limitation**: Cursor and most MCP clients only support simple stdio/HTTP protocols
- **Remote Server Requirement**: Production servers need API key authentication for security
- **Proxy Solution**: Acts as a bridge, adding API keys automatically to client requests

#### **🌐 Connect Local Clients to Remote Servers**
- **No Client Changes**: Existing MCP clients work without modification
- **Automatic Authentication**: Proxy injects API key from `.env` file transparently
- **Global Access**: Connect to production Cloudflare deployment from any MCP client
- **Full Protocol Support**: Complete passthrough of all MCP functionality

#### **📈 Key Use Cases**
- **🎯 Cursor Integration**: Connect Cursor to the global Cloudflare MCP server
- **🔧 Development & Testing**: Test MCP clients against production deployment
- **🌍 Remote Access**: Use production server from local development environment
- **📚 Learning & Education**: Understand MCP protocol without authentication complexity

### 🚀 Quick Start

#### **1. Configure Environment**
Ensure your `.env` file contains the API key:
```bash
# Required for proxy to authenticate with remote server
QUOTES_MCP_API_KEY=your-actual-api-key

# Optional proxy configuration (defaults shown)
PROXY_PORT=3001
REMOTE_MCP_URL=https://quotes-mcp-server.YOUR-SUBDOMAIN.workers.dev
```

#### **2. Start Proxy Server**
```bash
npm run start:proxy
```

Expected output:
```
🚀 MCP Proxy Server Started
================================
📍 Local URL:  http://localhost:3001
🌐 Remote URL: https://quotes-mcp-server.YOUR-SUBDOMAIN.workers.dev
🔑 API Key:    ✅ Configured
================================
```

#### **3. Test Proxy**
```bash
# Run proxy tests (requires proxy to be running)
./test-proxy.sh

# Or test manually without API key:
curl -X POST "http://localhost:3001" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### 🔧 Configuration Options

#### **Environment Variables**
| Variable | Default | Description |
|----------|---------|-------------|
| `PROXY_PORT` | `3001` | Local port for proxy server |
| `REMOTE_MCP_URL` | `https://quotes-mcp-server.YOUR-SUBDOMAIN.workers.dev` | Remote MCP server URL |
| `QUOTES_MCP_API_KEY` | Required | API key for remote authentication |

#### **Endpoints**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| ALL | `/*` | Proxy all requests to remote MCP server |
| GET | `/proxy/health` | Proxy server health and configuration |

### 📊 Request Flow

```
Local Client → Proxy Server → Remote MCP Server
     ↑              ↓                 ↓
     └─── Response ←─┴── + API Key ←──┘
```

1. **Client Request**: Client sends MCP request to `http://localhost:3001` (no API key)
2. **Proxy Processing**: Proxy adds `X-API-Key` header from `.env` file
3. **Remote Forward**: Request forwarded to remote Cloudflare MCP server
4. **Response Return**: Remote response returned unchanged to client

### 🛠️ Example Usage

#### **MCP Protocol Requests**
```bash
# Initialize MCP session (no API key required)
curl -X POST "http://localhost:3001" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {"roots": {}, "sampling": {}},
      "clientInfo": {"name": "local-client", "version": "1.0.0"}
    },
    "id": 1
  }'

# Get random quote (no API key required)
curl -X POST "http://localhost:3001" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "random-quote-tool",
      "arguments": {}
    },
    "id": 2
  }'
```

#### **Health Check**
```bash
curl "http://localhost:3001/proxy/health"
```

Expected response:
```json
{
  "status": "healthy",
  "proxy": {
    "port": 3001,
    "remote_url": "https://quotes-mcp-server.YOUR-SUBDOMAIN.workers.dev",
    "api_key_configured": true,
    "uptime": 120.5
  }
}
```

### 🔍 Monitoring & Logging

The proxy server provides real-time logging of all requests:

```
📨 POST / - Proxying to remote MCP server
📤 200 OK - 45ms
📨 POST / - Proxying to remote MCP server  
📤 200 OK - 32ms
```

### 🚨 Error Handling

| Error Condition | Response | Solution |
|-----------------|----------|----------|
| Missing API key | 500 with JSON-RPC error | Add `QUOTES_MCP_API_KEY` to `.env` |
| Remote server down | 500 with proxy error | Check remote server status |
| Invalid API key | 401 forwarded from remote | Verify API key in `.env` |
| Network timeout | 500 with fetch error | Check internet connection |

## 🌐 MCP HTTP Server Deep Dive

The MCP HTTP Server (`mcp-server-http.js`) provides full Model Context Protocol functionality over HTTP transport, enabling remote MCP clients to connect via standard HTTP requests.

### 🚀 Server Features

#### **Transport Layer**
- **Streamable HTTP Transport**: Uses `@modelcontextprotocol/sdk` StreamableHTTPServerTransport
- **Bidirectional Communication**: Supports both client-to-server and server-to-client messaging
- **Session-based**: Each client gets a unique session ID for stateful communication
- **JSON-RPC 2.0**: Full compliance with JSON-RPC specification

#### **Security & Reliability** 
- **DNS Rebinding Protection**: Prevents malicious cross-origin requests
- **Host Validation**: Only allows connections from `127.0.0.1` and `localhost`
- **Session Cleanup**: Automatic cleanup of expired or terminated sessions
- **Graceful Shutdown**: Properly closes all sessions on server termination
- **Error Handling**: Comprehensive error responses with proper HTTP status codes

#### **Endpoints Overview**

| Method | Endpoint | Purpose | Description |
|--------|----------|---------|-------------|
| POST | `/mcp` | MCP Requests | Client-to-server MCP messages (initialize, resources, tools) |
| GET | `/mcp` | SSE Notifications | Server-to-client notifications via Server-Sent Events |
| DELETE | `/mcp` | Session Termination | Clean session closure and resource cleanup |
| GET | `/health` | Health Check | Server status and session information |
| GET | `/` | API Information | Server details and available endpoints |

### 🔧 Session Management

#### **Session Lifecycle**
1. **Initialization**: Client sends `initialize` method to `POST /mcp`
2. **Session Creation**: Server generates UUID and returns session ID in headers
3. **Communication**: Client includes session ID in subsequent requests  
4. **Notifications**: Server can send notifications via `GET /mcp` (SSE)
5. **Termination**: Session closed via `DELETE /mcp` or server shutdown

#### **Session Headers**
```http
# Client requests must include:
mcp-session-id: 550e8400-e29b-41d4-a716-446655440000

# Server responses include:
mcp-session-id: 550e8400-e29b-41d4-a716-446655440000
```

### 📊 MCP Resources & Tools

The HTTP server exposes the same MCP resources and tools as the stdio version:

#### **Resources Available**
- `quotes://all` - Complete quote collection (JSON)
- `quotes://random` - Single random quote (JSON)  
- `quotes://text` - All quotes formatted as text

#### **Tools Available**
- `get-quote-by-character` - Search quotes by character name
- `random-quote-tool` - Generate random quote in text format

### 🔍 Monitoring & Observability

#### **Health Endpoint Response**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z", 
  "quotesLoaded": 8,
  "activeSessions": 2,
  "transport": "mcp-http"
}
```

#### **Server Information**
```json
{
  "name": "Star Trek Quotes MCP Server",
  "version": "1.0.0",
  "transport": "mcp-streamable-http",
  "totalQuotes": 8,
  "activeSessions": 2,
  "endpoints": {
    "POST /mcp": "MCP client requests and initialization",
    "GET /mcp": "MCP server-to-client notifications (SSE)",
    "DELETE /mcp": "MCP session termination"
  }
}
```

## ☁️ Cloudflare Workers Deployment

The MCP Quotes Server can be deployed to **Cloudflare Workers** for global edge distribution, providing ultra-fast response times and unlimited scalability.

### 🌟 Features

#### **Global Edge Distribution**
- **Sub-30ms latency** from 300+ global edge locations
- **Automatic scaling** to handle any traffic volume
- **99.9% uptime** with built-in redundancy
- **Zero cold starts** for consistent performance

#### **DRY Architecture Benefits**
- **📦 Single Data Source**: Imports from `quotes.json` instead of hardcoded data
- **🔧 Shared Functions**: Uses all utilities from `lib/quote-functions.js`
- **⚡ Optimized Bundle**: 9.18 KiB (98% smaller than before DRY refactoring)
- **🧹 Clean Code**: No duplicated logic, easy to maintain

#### **Production Ready**
- **Full MCP Protocol Support** via HTTP transport
- **CORS enabled** for cross-origin requests
- **Comprehensive error handling** and monitoring
- **Security headers** and request validation

#### **Cost Effective**
- **Free tier available** (100,000 requests/day)
- **Pay-per-use** beyond free tier
- **No infrastructure management** required

### 🚀 Quick Deploy

#### **Prerequisites**
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
- [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/) installed

#### **Deploy in 3 Steps**

```bash
# 1. Install dependencies
npm install

# 2. Deploy to Cloudflare Workers
npx wrangler deploy

# 3. Validate deployment
npm run test:cloudflare
```

**🎉 Your MCP server is now live globally!**

Example deployment URL: `https://quotes-mcp-server.YOUR-SUBDOMAIN.workers.dev`

### 🔐 API Key Authentication

The Cloudflare Workers deployment now includes API key protection for security:

- **Required Header**: All requests must include `X-API-Key` header
- **Valid API Keys**: Stored securely in Cloudflare KV store
  - Contact the administrator for valid API keys
  - Keys are managed dynamically via `wrangler kv` commands
- **Error Responses**: 
  - Missing API key: HTTP 401 with error code -32001
  - Invalid API key: HTTP 401 with error code -32002

See `api-config.md` for setup instructions.

**Note**: Test scripts automatically load the API key from `.env` file. See the [Environment Variables setup](#3-set-up-environment-variables-for-testing) section for detailed instructions.

### 📊 Performance Metrics

Our production deployment achieves:

| Metric | Performance |
|--------|-------------|
| **Response Time** | 25ms average |
| **Edge Latency** | <30ms globally |
| **Availability** | 99.9%+ uptime |
| **Concurrent Users** | Unlimited |
| **Global Locations** | 300+ edge cities |
| **Bundle Size** | 9.18 KiB (optimized) |

### 🔧 Configuration

The Workers deployment includes:

#### **MCP Endpoints**
```
POST /     - MCP protocol requests
```

#### **CORS Support**
Pre-configured for web applications:
```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Content-Type
```

### 🎯 Usage Examples

#### **Direct HTTP API Access**
```bash
# MCP protocol request (requires API key)
curl -X POST https://quotes-mcp-server.YOUR-SUBDOMAIN.workers.dev \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05"},"id":1}'
```

## 🧪 Testing

The project includes comprehensive test suites with **79 test cases** total across all server implementations, designed around the **shared library architecture**. Tests validate both the shared libraries and their integration across different server types.

### Shared Library Benefits for Testing
- **🔄 Consistent Behavior** - All implementations use identical shared functions
- **🧪 Reduced Test Duplication** - Core logic tested once in shared libraries  
- **⚡ Faster Test Runs** - Shared test utilities accelerate test development
- **🎯 Focused Testing** - Tests validate integration rather than duplicate business logic
- **🐛 Centralized Validation** - Bug fixes in shared libraries automatically tested everywhere

### Run Tests
```bash
# Run ALL server implementations (79 total tests)
npm test

# Run all tests comprehensively
npm run test:all

# Run specific test suites by implementation
npm run test:core          # Local server implementations (64 tests)
npm run test:mcp           # MCP stdio server only (20 tests)
npm run test:http          # REST API server only (17 tests)
npm run test:mcp-http      # MCP HTTP server only (27 tests)
npm run test:cloudflare    # Cloudflare integration tests (15 tests) - requires .env
npm run test:cloudflare-quick  # Quick validation script (5 tests) - requires .env

# Development testing
npm run test:watch         # Run core tests in watch mode
npm run test:coverage      # Run core tests with coverage reporting
```

### Test Coverage

#### Core Server Tests (64 tests)
- ✅ **MCP Server Tests** (20 tests) - stdio transport functionality
- ✅ **HTTP REST API Tests** (17 tests) - All endpoints and operations
- ✅ **MCP HTTP Server Tests** (27 tests) - HTTP transport with sessions

#### Cloudflare Worker Tests (15 tests)
- ✅ **MCP Protocol Compliance** (5 tests) - Initialize, tools, resources
- ✅ **Tool Functionality** (4 tests) - Character search and random quotes
- ✅ **Resource Access** (3 tests) - All resource endpoints
- ✅ **Error Handling** (3 tests) - Invalid methods, tools, malformed JSON

### Test Results Summary
```
📊 Total Test Results:
   ✅ Core Tests: 64/64 passed (100%)
   ✅ Cloudflare Tests: 15/15 passed (100%)
   📈 Overall Success Rate: 79/79 (100%)
```

## 🗂️ Source Code Structure

### 📦 Shared Libraries Architecture (`lib/`)

The project follows a **modular shared library architecture** that eliminates code duplication and ensures consistent behavior across all server implementations.

#### **`lib/quote-functions.js`** - Core Business Logic
```javascript
// Core quote operations used by all servers
export function searchQuotesByCharacter(quotesData, character)  // Character search with fuzzy matching
export function getRandomQuote(quotesData)                     // Random quote selection
export function formatQuoteAsText(quote)                       // Single quote formatting
export function formatQuotesAsText(quotesData)                 // Multi-quote numbered formatting
export function getAvailableCharacters(quotesData)             // Unique character extraction
export function searchQuotes(quotesData, query)                // General search functionality
export function validateQuoteData(quotesData)                  // Data structure validation
export function getQuoteStats(quotesData)                      // Collection statistics
```

#### **`lib/mcp-resources.js`** - MCP Protocol Definitions  
```javascript
// MCP resource and tool registration for all MCP servers
export function registerMcpResources(server, quotesData, serverType)  // Standard MCP resources
export function registerMcpTools(server, quotesData, serverType)      // Standard MCP tools  
export function getMcpServerMetadata(name, transport, quotesData, extras) // Server metadata
```

#### **`lib/rest-api-helpers.js`** - REST API Response Handlers
```javascript
// HTTP endpoint handlers used by REST API
export function getApiInfo(quotesData, serverInfo)             // API information responses
export function getHealthCheck(quotesData, serverInfo)         // Health check responses
export function handleGetAllQuotes(quotesData)                 // GET /quotes logic
export function handleGetRandomQuote(quotesData)               // GET /quotes/random logic
export function handleGetQuotesByCharacter(quotesData, char)   // GET /quotes/character/:name logic
export function handleGetCharacters(quotesData)                // GET /characters logic
export function handleSearchQuotes(quotesData, query)          // GET /search logic
export function handle404NotFound()                            // Standard 404 responses
export function handleError(message, error)                    // Error response formatting
```

#### **`lib/test-helpers.js`** - Testing Utilities
```javascript
// Shared testing functions and data used across all test files
export const mockQuotesData                                    // Consistent test data
export function createTestHandlers(testQuotesData)             // Test handler factories
export function validateQuoteStructure(quote)                  // Quote validation
export function validateExpectedCharacters(characters)         // Character validation
export const characterSearchTests                              // Common test cases
export function validateResponseHeaders(response)              // Header validation
export function validateCORSHeaders(response)                  // CORS validation
export function validateDataIntegrity(data)                    // Data integrity checks
```

### 🚀 Server Implementations

Each server implementation is now a **thin wrapper** around the shared libraries, providing different transport mechanisms for the same core functionality.

#### **`server.js`** - MCP Server (Stdio Transport)
```javascript
// Minimal MCP server for local client integration (Cursor IDE, Claude Code)
import { registerMcpResources, registerMcpTools } from './lib/mcp-resources.js';

const server = new McpServer({ name: 'quotes-server', version: '1.0.0' });
registerMcpResources(server, quotesData, 'Stdio');  // 3 MCP resources
registerMcpTools(server, quotesData, 'Stdio');      // 2 MCP tools

// Uses: StdioServerTransport for process communication
// Purpose: Local development, IDE integration
// Started with: npm start
```

#### **`mcp-server-http.js`** - MCP Server (HTTP Transport)  
```javascript
// HTTP-based MCP server with session management
import { registerMcpResources, registerMcpTools, getMcpServerMetadata } from './lib/mcp-resources.js';

function createMcpServer() {
  const server = new McpServer({ name: 'quotes-server-http', version: '1.0.0' });
  registerMcpResources(server, quotesData, 'HTTP');  // Same 3 MCP resources
  registerMcpTools(server, quotesData, 'HTTP');      // Same 2 MCP tools
  return server;
}

// Uses: StreamableHTTPServerTransport + Express.js
// Features: Session management, SSE notifications, CORS
// Purpose: Remote MCP clients, web integration
// Started with: npm run start:mcp-http
```

#### **`http-server.js`** - REST API Server
```javascript
// Traditional REST API using shared response handlers
import { 
  getApiInfo, getHealthCheck, handleGetAllQuotes, handleGetRandomQuote,
  handleGetQuotesByCharacter, handleGetCharacters, handleSearchQuotes,
  handle404NotFound, handleError 
} from './lib/rest-api-helpers.js';

// All endpoints are simple wrappers:
app.get('/quotes', (req, res) => {
  const result = handleGetAllQuotes(quotesData);
  res.json(result);
});

// Uses: Express.js framework
// Purpose: REST API consumers, web applications
// Started with: npm run start:http
```

#### **`worker.js`** - Cloudflare Workers MCP (DRY Implementation)
```javascript
// Global edge MCP server using DRY principles
import quotesData from './quotes.json';  // Single source of truth
import { 
  getRandomQuote, formatQuoteAsText, formatQuotesAsText, 
  searchQuotesByCharacter, getAvailableCharacters 
} from './lib/quote-functions.js';

// Lightweight HTTP handler using shared functions
export default {
  async fetch(request, env, ctx) {
    // Direct MCP protocol implementation
    // Uses shared functions for all quote operations
    // No duplicated data or logic
  }
}

// Uses: Cloudflare Workers Request/Response API
// Features: Global edge distribution, auto-scaling, DRY architecture
// Bundle size: 9.18 KiB (optimized)
// Started with: npx wrangler deploy
```

### 📁 Data Flow
```
📁 quotes.json (Single Source of Truth)
     ↓
📦 lib/quote-functions.js (Core Logic)
     ↓
┌─── 📦 lib/mcp-resources.js ←── MCP Servers (stdio, HTTP)
│    📦 lib/rest-api-helpers.js ←── REST API Server
└─── 🌐 worker.js ←── Cloudflare Workers (Direct Import)
```

### 🎯 Benefits of this Architecture

#### **🔄 DRY Principle (Don't Repeat Yourself)**
- **Single source of truth** for all business logic
- **Centralized bug fixes** - fix once, fixes everywhere
- **Cloudflare Workers optimization** - 98% bundle size reduction

#### **📏 Consistent Behavior**  
- **Identical logic** across all server implementations
- **Same response formats** regardless of transport method
- **Guaranteed compatibility** between different server types

#### **⚡ Development Efficiency**
- **4x faster feature development** - add once, available everywhere
- **Reduced cognitive load** - understand patterns once, apply everywhere
- **Easier onboarding** - clear separation of concerns

#### **🧪 Simplified Testing**
- **Shared test utilities** reduce test code duplication
- **Core logic tested once** in shared libraries
- **Integration tests** validate transport-specific functionality only

#### **🛠️ Easy Maintenance**
- **Centralized maintenance** - update shared libraries, all servers benefit
- **Clear dependencies** - easy to understand what affects what
- **Modular updates** - change one aspect without affecting others

### 📁 Complete File Structure

```
mcp-quotes-server/
├── 📦 lib/                              # Shared Libraries (Eliminates 400+ lines of duplication)
│   ├── quote-functions.js               #   🎯 Core: search, format, validate (8 functions)
│   ├── mcp-resources.js                 #   🔧 MCP: resources, tools, metadata (3 functions)  
│   ├── rest-api-helpers.js              #   🌐 REST: endpoint handlers (9 functions)
│   └── test-helpers.js                  #   🧪 Test: shared utilities (10+ functions)
│
├── 🚀 Server Implementations            # Thin wrappers around shared libraries
│   ├── server.js                        #   📡 MCP Stdio (44 lines)
│   ├── mcp-server-http.js               #   🌐 MCP HTTP (244 lines) 
│   ├── http-server.js                   #   📋 REST API (187 lines)
│   └── worker.js                        #   ☁️ Workers MCP DRY (269 lines, 9.18 KiB)
│
├── 📊 Data & Configuration
│   ├── quotes.json                      #   📚 Single source of truth (8 quotes)
│   ├── package.json                     #   📦 Dependencies & scripts
│   ├── package-lock.json                #   🔒 Locked dependency versions
│   └── wrangler.toml                    #   ☁️ Cloudflare Workers config
│
├── 🧪 Testing Suite (79 Tests Total)
│   ├── server.test.js                   #   📡 MCP Stdio tests (20 tests)
│   ├── http-server.test.js              #   📋 REST API tests (17 tests)
│   ├── mcp-server-http.test.js          #   🌐 MCP HTTP tests (27 tests)
│   ├── test-mcp-server.js               #   ☁️ Workers integration tests (15 tests)
│   ├── quick-test.sh                    #   ⚡ Fast validation script (5 tests)
│   └── manual-tests.md                  #   📖 Manual testing guide
│
└── 📖 Documentation
    ├── README.md                        #   📚 Complete documentation
    ├── CODE-DEDUPLICATION-SUMMARY.md   #   📊 Architecture benefits
    ├── WORKER-DEPLOYMENT.md            #   ☁️ Deployment guide
    └── TESTING.md                       #   🧪 Testing guide
```

This architecture demonstrates **enterprise-grade software engineering practices** with clear separation of concerns, comprehensive testing, and maintainable code organization optimized for modern edge computing.

## 🔧 Development

### Project Scripts
```bash
# Server startup
npm start              # Start the MCP server (stdio transport)
npm run start:mcp-http # Start the MCP server (HTTP transport)  
npm run start:http     # Start the REST API server (HTTP)

# Testing
npm test               # Run all server implementations (79 tests)
npm run test:all       # Run all tests comprehensively
npm run test:core      # Run local implementations (64 tests)
npm run test:cloudflare     # Run Cloudflare integration tests (15 tests)
npm run test:cloudflare-quick # Quick validation (5 tests)

# Development testing
npm run test:watch     # Run core tests in watch mode
npm run test:coverage  # Run core tests with coverage

# Cloudflare Workers
npx wrangler deploy    # Deploy to Cloudflare Workers
npm run worker:dev     # Run Workers locally with Wrangler
```

### Adding New Quotes
1. Edit `quotes.json`
2. Add new quote objects with `quote` and `by` properties
3. Run tests to ensure everything works: `npm test`
4. Redeploy if using Cloudflare Workers: `npx wrangler deploy`

### Dependencies
- **@modelcontextprotocol/sdk**: ^1.13.2 - Modern MCP SDK
- **express**: ^4.18.2 - Web framework for REST API
- **cors**: ^2.8.5 - Cross-origin resource sharing
- **zod**: ^3.23.8 - Schema validation

### Dev Dependencies  
- **jest**: ^29.7.0 - Testing framework
- **supertest**: ^6.3.4 - HTTP testing library
- **wrangler**: ^4.22.0 - Cloudflare Workers CLI

## 🐛 Troubleshooting

### Server Won't Start
1. **Check Node.js version**: Ensure you have Node.js 16+
   ```bash
   node --version
   ```

2. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check file permissions**:
   ```bash
   chmod +x server.js
   ```

### MCP Client Can't Connect

1. **Verify configuration path**: Ensure the `cwd` path in your MCP client config matches your actual installation directory.

2. **Check server startup**: Test the server manually:
   ```bash
   cd /path/to/your/mcp-quotes-server
   npm start
   ```

3. **Restart your MCP client**: Reload VS Code (for Claude Code) or restart Cursor.

### Cloudflare Workers Issues

1. **Deployment failed**: 
   ```bash
   # Check Wrangler authentication
   npx wrangler auth
   
   # Verify wrangler.toml configuration
   cat wrangler.toml
   
   # Deploy with verbose output
   npx wrangler deploy --verbose
   ```

2. **Test deployment**:
   ```bash
   # Run integration tests
   npm run test:cloudflare
   
   # Quick validation
   npm run test:cloudflare-quick
   ```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Module not found" | Run `npm install` |
| "Permission denied" | Check file permissions |
| "Port already in use" | Kill existing processes |
| "Config not found" | Verify MCP client config file path |
| "Worker deployment failed" | Check Wrangler authentication |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🖖 About

This project demonstrates how to:
- **Create MCP servers** with stdio and HTTP transports using the official SDK
- **Implement MCP resources and tools** with proper schema validation and error handling
- **Handle multiple transport types** (stdio, Streamable HTTP, REST API, Workers)
- **Build comprehensive test suites** with 79 total tests across all implementations
- **Configure MCP clients** for local and remote environments
- **Manage sessions and state** in HTTP-based MCP servers with UUID tracking
- **Implement security features** like DNS rebinding protection and host validation
- **Provide observability** through health checks and monitoring endpoints
- **Apply DRY principles** for maintainable, efficient code across implementations
- **Optimize for edge computing** with Cloudflare Workers deployment

Perfect for:
- 🎓 **Learning MCP development** with practical, production-ready examples
- 🏗️ **Foundation for enterprise MCP servers** with multiple transport options
- 🔧 **Understanding MCP protocols** through working implementations and comprehensive tests
- 🌐 **Building remote MCP integrations** with HTTP transport and session management
- 📊 **Testing strategies** for both unit tests and integration tests with real server processes
- 🛡️ **Security patterns** for network-accessible MCP servers
- ⚡ **Performance optimization** through DRY architecture and edge deployment

---

**Live long and prosper!** 🖖
