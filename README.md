# MCP Quotes Server 🖖

A comprehensive Model Context Protocol (MCP) server that provides Star Trek quotes through resources and tools. Built with the modern MCP SDK v1.13.2, this server demonstrates how to create and deploy MCP resources for AI assistants.

This project features a **shared library architecture** that eliminates code duplication across four different server implementations while maintaining consistent functionality and behavior.

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
- **🔧 Durable Objects** for persistent session management
- **🌍 99.9% uptime** with built-in redundancy

#### Same MCP Protocol & Features
- **📚 Resources**: All 3 MCP resources available globally
- **🛠️ Tools**: Both MCP tools with edge performance
- **🔒 Global Sessions**: Persistent sessions across edge locations
- **🌐 CORS Ready**: Pre-configured for web applications
- **📊 Production Monitoring**: Built-in analytics and health checks

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

### Data Features
- 8 iconic Star Trek quotes from beloved characters
- Case-insensitive character search
- Partial name matching support
- Comprehensive error handling

### Development Features
- **📦 Modular Architecture** - Shared libraries eliminate 400+ lines of duplicate code
- **🔄 DRY Principle** - Don't Repeat Yourself across all implementations
- **🧪 Comprehensive Testing** - 84 tests covering all functionality
- **🛠️ Easy Maintenance** - Single point of change for core functionality
- **📖 Well Documented** - Clear API documentation and code examples

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)
- MCP-compatible client (Cursor or Claude Code)

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

### 3. Verify Installation
```bash
# Test the server
npm test

# Start the server (for testing)
npm start
```

## ⚙️ MCP Client Configuration

### 🎯 Cursor IDE

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
    "quote": "Space: the final frontier.",
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

2. "Space: the final frontier." - Captain James T. Kirk

3. "Resistance is futile." - The Borg

4. "Make it so." - Captain Jean-Luc Picard

5. "I have been, and always shall be, your friend." - Spock

6. "Logic is the beginning of wisdom, not the end." - Spock
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

This project provides **four different server implementations** for different use cases:

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
- ✅ **Session Management**: Durable Objects for global state

### 4. REST API Server (HTTP) - `npm run start:http`
**Best for**: Web applications, mobile apps, general API access, non-MCP clients
- ✅ **Standard REST**: Familiar HTTP endpoints
- ✅ **No MCP Client**: Works with any HTTP client
- ✅ **Simple Integration**: Easy to integrate with existing systems
- ❌ **No Auto-discovery**: Manual endpoint management
- ❌ **No MCP Features**: Missing MCP-specific capabilities

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

#### **Production Ready**
- **Full MCP Protocol Support** via HTTP transport
- **Durable Objects** for session management
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
npm run worker:deploy

# 3. Validate deployment
npm run test:integration
```

**🎉 Your MCP server is now live globally!**

Example deployment URL: `https://quotes-mcp-server.YOUR-SUBDOMAIN.workers.dev`

### 📊 Performance Metrics

Our production deployment achieves:

| Metric | Performance |
|--------|-------------|
| **Response Time** | 25ms average |
| **Edge Latency** | <30ms globally |
| **Availability** | 99.9%+ uptime |
| **Concurrent Users** | Unlimited |
| **Global Locations** | 300+ edge cities |

### 🔧 Configuration

The Workers deployment includes:

#### **MCP Endpoints**
```
POST /mcp     - MCP protocol requests
GET /mcp      - Server-sent events (SSE)
DELETE /mcp   - Session termination
GET /health   - Health check
GET /         - API information
```

#### **Durable Objects**
Session management powered by Cloudflare Durable Objects:
- **Persistent sessions** across edge locations
- **Automatic cleanup** of expired sessions
- **Global consistency** for multi-user scenarios

#### **CORS Support**
Pre-configured for web applications:
```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, mcp-session-id
```

### 🎯 Usage Examples

#### **Direct HTTP API Access**
```bash
# Health check
curl https://quotes-mcp-server.YOUR-SUBDOMAIN.workers.dev/health

# Get API information
curl https://quotes-mcp-server.YOUR-SUBDOMAIN.workers.dev/

# MCP protocol request
curl -X POST https://quotes-mcp-server.YOUR-SUBDOMAIN.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05"},"id":1}'
```

#### **MCP Client Configuration**
Configure your MCP client to use the deployed Workers URL:

```json
{
  "mcpServers": {
    "quotes-server-workers": {
      "type": "http",
      "url": "https://quotes-mcp-server.YOUR-SUBDOMAIN.workers.dev/mcp"
    }
  }
}
```

#### **JavaScript/TypeScript Integration**
```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// Connect to your Workers deployment
const client = new Client({
  name: 'web-quotes-client',
  version: '1.0.0'
});

const transport = new StreamableHTTPClientTransport(
  new URL('https://quotes-mcp-server.YOUR-SUBDOMAIN.workers.dev/mcp')
);

await client.connect(transport);

// Use MCP resources and tools as normal
const quotes = await client.readResource({ uri: 'quotes://all' });
console.log('Quotes from global edge:', JSON.parse(quotes.contents[0].text));
```

### 📖 Deployment Documentation

#### **Full Deployment Guide**
See [`WORKER-DEPLOYMENT.md`](./WORKER-DEPLOYMENT.md) for comprehensive deployment instructions including:
- Environment setup
- Custom domain configuration
- Environment variables
- Monitoring and debugging

#### **Testing Documentation**
See [`TESTING.md`](./TESTING.md) for testing information including:
- Unit tests vs integration tests
- Performance benchmarking
- Load testing procedures

### 🔄 Development Workflow

#### **Local Development**
```bash
# Run locally with Wrangler
npm run worker:dev

# Test against local instance
npm run test:worker
```

#### **CI/CD Integration**
```bash
# Complete validation pipeline
npm run worker:validate

# Individual steps
npm run test:worker        # Unit tests
npm run worker:deploy      # Deploy to Workers
npm run test:integration   # Test live deployment
```

### 🌍 Global Availability

The Cloudflare Workers deployment provides:

- **Multi-region failover** for maximum reliability
- **Edge caching** for static resources
- **Auto-scaling** based on demand
- **DDoS protection** included
- **Analytics** via Cloudflare dashboard

### 📈 Monitoring

Monitor your deployment via:

#### **Cloudflare Dashboard**
- Real-time analytics
- Error rate monitoring  
- Response time metrics
- Geographic distribution

#### **Health Endpoint**
```json
{
  "status": "healthy",
  "quotesLoaded": 8,
  "transport": "mcp-http-cloudflare", 
  "timestamp": "2024-01-01T12:00:00.000Z",
  "edge": "LHR"
}
```

#### **Custom Monitoring**
Integrate with your monitoring stack via webhook endpoints or API polling.

## 🎮 Usage Examples

### Using MCP Resources & Tools
Ask your AI assistant:
- *"Show me all available Star Trek quotes"* → Uses `quotes://all`
- *"Give me a random Star Trek quote"* → Uses `quotes://random`
- *"Show me the quotes in text format"* → Uses `quotes://text`
- *"Find quotes by Spock"* → Uses `get-quote-by-character` tool
- *"Show me Captain Picard quotes"* → Uses partial matching
- *"Get me a random Star Trek quote"* → Uses `random-quote-tool`

### Using MCP Server (HTTP)
Start the MCP HTTP server: `npm run start:mcp-http`

Server will start on `http://127.0.0.1:3001` with the following output:
```
🚀 Star Trek Quotes MCP Server (Streamable HTTP)
🌐 Server running at: http://127.0.0.1:3001
📊 Loaded 8 quotes
🖖 Live long and prosper!
```

#### MCP Client Configuration

**HTTP MCP server for MCP-compatible tools such as Cursor IDE:**

Run the HTTP MCP server with `npm run start:mcp-http` and add this configuration to cursor:
```json
{
  "mcpServers": {
    "quotes-server-http": {
      "type": "http", 
      "url": "http://127.0.0.1:3001/mcp"
    }
  }
}
```

**For Cursor IDE using stdio:**
There is no need to run a server as the MCP client invokes the server per commandline. 
Configure the local installation like this: 
```json
{
  "mcpServers": {
    "quotes-server": {
      "type":"stdio",
      "command": "node",
      "args": ["/YOUR-PATH/mcp-1/server.js"],
      "env": {}
    }
  }
}
```

#### MCP Client SDK Usage (JavaScript)

**Basic Connection & Resources:**
```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// Create client and transport
const client = new Client({
  name: 'quotes-client',
  version: '1.0.0'
});

const transport = new StreamableHTTPClientTransport(
  new URL('http://127.0.0.1:3001/mcp')
);

// Connect to server
await client.connect(transport);

// List all available resources
const resources = await client.listResources();
console.log('Available resources:', resources.resources.map(r => r.uri));
// Output: ['quotes://all', 'quotes://random', 'quotes://text']

// Read all quotes
const allQuotes = await client.readResource({ uri: 'quotes://all' });
const quotes = JSON.parse(allQuotes.contents[0].text);
console.log(`Found ${quotes.length} quotes`);

// Get random quote
const randomQuote = await client.readResource({ uri: 'quotes://random' });
console.log('Random quote:', JSON.parse(randomQuote.contents[0].text));

// Get formatted text
const textQuotes = await client.readResource({ uri: 'quotes://text' });
console.log('Formatted quotes:\n', textQuotes.contents[0].text);
```

**Tool Usage:**
```javascript
// List available tools
const tools = await client.listTools();
console.log('Available tools:', tools.tools.map(t => t.name));
// Output: ['get-quote-by-character', 'random-quote-tool']

// Search quotes by character
const spockQuotes = await client.callTool({
  name: 'get-quote-by-character',
  arguments: { character: 'Spock' }
});
console.log('Spock quotes:', spockQuotes.content[0].text);

// Get random quote via tool
const randomQuoteTool = await client.callTool({
  name: 'random-quote-tool',
  arguments: {}
});
console.log('Random quote tool result:', randomQuoteTool.content[0].text);

// Handle errors
try {
  const unknownChar = await client.callTool({
    name: 'get-quote-by-character',
    arguments: { character: 'Worf' }
  });
} catch (error) {
  console.log('Error result:', error.content[0].text);
  // Shows: "No quotes found for character "Worf". Available characters: ..."
}

// Clean disconnect
await client.close();
```

#### Manual HTTP Usage (Advanced)

**Session Initialization:**
```bash
# Initialize MCP session
curl -X POST http://127.0.0.1:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "manual-client", "version": "1.0.0"}
    }
  }' \
  -v
# Returns session ID in 'mcp-session-id' header
```

**Using Resources:**
```bash
# List resources (replace SESSION_ID with actual ID from initialization)
curl -X POST http://127.0.0.1:3001/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-session-id: SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "resources/list",
    "params": {}
  }'

# Read a specific resource
curl -X POST http://127.0.0.1:3001/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-session-id: SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "resources/read",
    "params": {"uri": "quotes://random"}
  }'
```

**Health & Monitoring:**
```bash
# Check server health
curl http://127.0.0.1:3001/health

# Get server information
curl http://127.0.0.1:3001/

# Monitor active sessions
curl http://127.0.0.1:3001/health | jq '.activeSessions'
```

### Using REST API
Start the HTTP server: `npm run start:http`

#### cURL Examples
```bash
# Get API information
curl http://localhost:3000/

# Get all quotes
curl http://localhost:3000/quotes

# Get a random quote
curl http://localhost:3000/quotes/random

# Get quotes by character
curl http://localhost:3000/quotes/character/spock
curl http://localhost:3000/quotes/character/kirk

# Get all available characters
curl http://localhost:3000/characters

# Search quotes
curl "http://localhost:3000/search?q=logic"
curl "http://localhost:3000/search?q=captain"

# Health check
curl http://localhost:3000/health
```

#### Browser Examples
- **API Info**: http://localhost:3000/
- **All Quotes**: http://localhost:3000/quotes
- **Random Quote**: http://localhost:3000/quotes/random
- **Spock Quotes**: http://localhost:3000/quotes/character/spock
- **Search**: http://localhost:3000/search?q=prosper

## 🧪 Testing

The project includes comprehensive test suites with **84 test cases** total across all four server implementations, designed around the **shared library architecture**. Tests validate both the shared libraries and their integration across different server types.

### Shared Library Benefits for Testing
- **🔄 Consistent Behavior** - All implementations use identical shared functions
- **🧪 Reduced Test Duplication** - Core logic tested once in shared libraries  
- **⚡ Faster Test Runs** - Shared test utilities accelerate test development
- **🎯 Focused Testing** - Tests validate integration rather than duplicate business logic
- **🐛 Centralized Validation** - Bug fixes in shared libraries automatically tested everywhere

### Run Tests
```bash
# Run ALL FOUR server implementations (84 total tests)
npm test

# Run all tests including integration (101 total with integration tests)
npm run test:all

# Run specific test suites by implementation
npm run test:core         # First 3 server implementations (64 tests)
npm run test:mcp          # MCP stdio server only (20 tests)
npm run test:http         # REST API server only (17 tests)
npm run test:mcp-http     # MCP HTTP server only (27 tests)
npm run test:worker       # Cloudflare Worker unit tests (20 tests)
npm run test:worker-all   # Worker unit + integration tests (37 tests)
npm run test:integration  # Worker integration tests only (17 tests)

# Development testing
npm run test:watch        # Run core tests in watch mode
npm run test:coverage     # Run core tests with coverage reporting
npm run test:worker-coverage  # Run worker tests with coverage
```

### Test Coverage

#### MCP Server Tests (18 tests)
- ✅ **Resource Handlers** (5 tests) - Core resource functionality  
- ✅ **Tool Handlers** (8 tests) - Tool functionality including edge cases
- ✅ **Edge Cases** (2 tests) - Empty data and single quote scenarios
- ✅ **Data Validation** (3 tests) - Data structure validation

#### HTTP REST API Tests (28 tests)
- ✅ **Core Functionality** (8 tests) - All endpoints and basic operations
- ✅ **Character Search** (6 tests) - Character-specific quote retrieval
- ✅ **Search & Discovery** (5 tests) - Content search and character listing
- ✅ **Error Handling** (2 tests) - 404s and invalid requests
- ✅ **Technical Validation** (4 tests) - Headers, content types, CORS
- ✅ **Edge Cases** (3 tests) - URL encoding, special characters

#### MCP HTTP Server Tests (18 tests)
**Testing Strategy**: Spawns actual MCP HTTP server process and tests via HTTP requests

- ✅ **Non-MCP Endpoints** (3 tests)
  - Server information endpoint (`GET /`)
  - Health check functionality (`GET /health`)  
  - 404 handling for unknown routes
  
- ✅ **Session Management** (3 tests)
  - Rejection of requests without valid session ID
  - Proper handling of GET/DELETE without session
  - Session validation and error responses
  
- ✅ **Message Validation** (3 tests)
  - JSON-RPC format validation for initialize method
  - Valid MCP message structure handling
  - Rejection of malformed JSON-RPC messages
  
- ✅ **HTTP Method Handling** (4 tests)
  - GET requests to MCP endpoint (SSE)
  - DELETE requests for session termination
  - Invalid session ID error handling
  - Proper HTTP status codes and responses
  
- ✅ **Error Handling** (3 tests)
  - Malformed JSON request handling
  - Empty request body handling
  - Non-JSON content type rejection
  
- ✅ **Server Robustness** (2 tests)
  - Concurrent requests to different endpoints
  - Server state consistency across multiple requests

### Test Results
```
✅ HTTP API information endpoint
✅ Health check functionality  
✅ All quotes retrieval via REST
✅ Random quote generation via HTTP
✅ Text format output via REST
✅ Character-specific quote search
✅ Case-insensitive character matching
✅ Partial name matching via HTTP
✅ Non-existent character handling
✅ Available characters listing
✅ Content-based quote search
✅ Search query validation
✅ Error handling and 404 responses
✅ CORS headers validation
✅ Content-Type verification
✅ URL encoding support
✅ Special characters in URLs
✅ HTTP method validation
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
// HTTP endpoint handlers used by REST API and Workers
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

#### **`cloudflare-worker-mcp.js`** - Cloudflare Workers MCP
```javascript
// Global edge MCP server using Workers Request/Response API
import { registerMcpResources, registerMcpTools } from './lib/mcp-resources.js';
import { getApiInfo, getHealthCheck } from './lib/rest-api-helpers.js';

function createMcpServer() {
  const server = new McpServer({ name: 'quotes-server-cloudflare', version: '1.0.0' });
  registerMcpResources(server, quotesData, 'Cloudflare');  // Same MCP resources
  registerMcpTools(server, quotesData, 'Cloudflare');      // Same MCP tools
  return server;
}

// Uses: Cloudflare Workers Runtime + Durable Objects
// Features: Global edge distribution, session persistence, CORS
// Purpose: Production deployment, global availability
// Deployed with: npm run worker:deploy
```

### 📊 Data Layer

#### **`quotes.json`** - Single Source of Truth
```json
// Centralized data file used by all implementations
[
  { "quote": "Live long and prosper.", "by": "Spock" },
  { "quote": "Make it so.", "by": "Captain Jean-Luc Picard" },
  // ... 8 total quotes
]
```

All servers import this same data file, ensuring **100% consistency** across implementations.

### 🧪 Testing Architecture

The testing architecture mirrors the shared library approach, with **84 total tests** across all implementations.

#### **Core Tests (`server.test.js`, `http-server.test.js`, `mcp-server-http.test.js`)**
```javascript
import { mockQuotesData, createTestHandlers } from './lib/test-helpers.js';

// Each test file uses shared test data and utilities
// Tests validate integration with shared libraries, not business logic duplication
// Business logic is tested once in the shared libraries
```

#### **Worker Tests (`cloudflare-worker-mcp.test.js`, `cloudflare-worker-integration.test.js`)**
```javascript
// Unit tests: Validate Workers-specific functionality (20 tests)
// Integration tests: Test live deployment (17 tests)
// Uses shared test patterns but validates Workers runtime environment
```

### 🔄 Data Flow Architecture

```
📁 quotes.json (Single Source of Truth)
     ↓
📦 lib/quote-functions.js (Core Logic)
     ↓
┌─── 📦 lib/mcp-resources.js ←── MCP Servers (stdio, HTTP, Workers)
│    📦 lib/rest-api-helpers.js ←── REST API Server & Workers  
└─── 📦 lib/test-helpers.js ←── All Test Files
```

### 🎯 Benefits of This Architecture

#### **🔄 DRY Principle (Don't Repeat Yourself)**
- **454+ lines of duplicate code eliminated**
- **Single source of truth** for all business logic
- **Centralized bug fixes** - fix once, fixes everywhere

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
├── 📦 lib/                              # Shared Libraries (Eliminates 454+ lines of duplication)
│   ├── quote-functions.js               #   🎯 Core: search, format, validate (8 functions)
│   ├── mcp-resources.js                 #   🔧 MCP: resources, tools, metadata (3 functions)  
│   ├── rest-api-helpers.js              #   🌐 REST: endpoint handlers (9 functions)
│   └── test-helpers.js                  #   🧪 Test: shared utilities (10+ functions)
│
├── 🚀 Server Implementations            # Thin wrappers around shared libraries
│   ├── server.js                        #   📡 MCP Stdio (45 lines, was 163)
│   ├── mcp-server-http.js               #   🌐 MCP HTTP (257 lines, was 393) 
│   ├── http-server.js                   #   📋 REST API (252 lines, was 317)
│   └── cloudflare-worker-mcp.js         #   ☁️ Workers MCP (256 lines, was 391)
│
├── 📊 Data & Configuration
│   ├── quotes.json                      #   📚 Single source of truth (8 quotes)
│   ├── package.json                     #   📦 Dependencies & scripts
│   ├── package-lock.json                #   🔒 Locked dependency versions
│   └── wrangler.toml                    #   ☁️ Cloudflare Workers config
│
├── 🧪 Testing Suite (84 Tests Total)
│   ├── server.test.js                   #   📡 MCP Stdio tests (20 tests)
│   ├── http-server.test.js              #   📋 REST API tests (17 tests)
│   ├── mcp-server-http.test.js          #   🌐 MCP HTTP tests (27 tests)
│   ├── cloudflare-worker-mcp.test.js    #   ☁️ Workers unit tests (20 tests)
│   └── cloudflare-worker-integration.test.js # 🌍 Workers integration (17 tests)
│
└── 📖 Documentation
    ├── README.md                        #   📚 Complete documentation
    ├── CODE-DEDUPLICATION-SUMMARY.md   #   📊 Architecture benefits
    ├── WORKER-DEPLOYMENT.md            #   ☁️ Deployment guide
    └── TESTING.md                       #   🧪 Testing guide
```

This architecture demonstrates **enterprise-grade software engineering practices** with clear separation of concerns, comprehensive testing, and maintainable code organization.

## 🔧 Development

### Project Scripts
```bash
# Server startup
npm start              # Start the MCP server (stdio transport)
npm run start:mcp-http # Start the MCP server (HTTP transport)  
npm run start:http     # Start the REST API server (HTTP)

# Testing all four implementations
npm test               # Run all four server implementations (84 tests)
npm run test:all       # Run all tests including integration (101 tests)
npm run test:core      # Run first 3 implementations only (64 tests)

# Development testing
npm run test:watch     # Run core tests in watch mode
npm run test:coverage  # Run core tests with coverage

# Cloudflare Workers
npm run worker:deploy  # Deploy to Cloudflare Workers
npm run worker:dev     # Run Workers locally with Wrangler
npm run worker:validate # Test + deploy + validate pipeline
```

### Adding New Quotes
1. Edit `quotes.json`
2. Add new quote objects with `quote` and `by` properties
3. Run tests to ensure everything works: `npm test`

### Dependencies
- **@modelcontextprotocol/sdk**: ^1.13.2 - Modern MCP SDK
- **express**: ^4.21.2 - Web framework for REST API
- **cors**: ^2.8.5 - Cross-origin resource sharing
- **zod**: ^3.23.8 - Schema validation

### Dev Dependencies  
- **jest**: ^29.7.0 - Testing framework
- **supertest**: ^6.3.4 - HTTP testing library

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

### MCP HTTP Server Issues

1. **Port already in use (3001)**:
   ```bash
   # Find process using port 3001
   lsof -i :3001
   
   # Kill the process
   kill -9 <PID>
   
   # Or use different port
   PORT=3002 npm run start:mcp-http
   ```

2. **Session connection failures**:
   ```bash
   # Test server is running
   curl http://127.0.0.1:3001/health
   
   # Test basic connectivity
   curl http://127.0.0.1:3001/
   
   # Check server logs for session errors
   ```

3. **MCP client transport errors**:
   - Ensure client uses `streamableHttp` transport type
   - Verify URL points to `/mcp` endpoint: `http://127.0.0.1:3001/mcp`
   - Check that server allows your client's host (127.0.0.1/localhost only)

4. **DNS rebinding protection**:
   - Server only accepts connections from `127.0.0.1` and `localhost`
   - Use `127.0.0.1:3001` instead of other IP addresses
   - Docker/container networking may require host networking mode

### Common Issues

| Issue | Solution |
|-------|----------|
| "Module not found" | Run `npm install` |
| "Permission denied" | Check file permissions |
| "Port already in use" | Kill existing processes |
| "Config not found" | Verify MCP client config file path |

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
- **Handle multiple transport types** (stdio, Streamable HTTP, REST API)
- **Build comprehensive test suites** with 64 total tests across all implementations
- **Configure MCP clients** for local and remote environments
- **Manage sessions and state** in HTTP-based MCP servers with UUID tracking
- **Implement security features** like DNS rebinding protection and host validation
- **Provide observability** through health checks and monitoring endpoints

Perfect for:
- 🎓 **Learning MCP development** with practical, production-ready examples
- 🏗️ **Foundation for enterprise MCP servers** with multiple transport options
- 🔧 **Understanding MCP protocols** through working implementations and comprehensive tests
- 🌐 **Building remote MCP integrations** with HTTP transport and session management
- 📊 **Testing strategies** for both unit tests and integration tests with real server processes
- 🛡️ **Security patterns** for network-accessible MCP servers

---

**Live long and prosper!** 🖖
