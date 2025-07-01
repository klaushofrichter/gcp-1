# MCP Quotes Server 🖖

A comprehensive Model Context Protocol (MCP) server that provides Star Trek quotes through resources and tools. Built with the modern MCP SDK v1.13.2, this server demonstrates how to create and deploy MCP resources for AI assistants.

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
- 6 iconic Star Trek quotes from beloved characters
- Case-insensitive character search
- Partial name matching support
- Comprehensive error handling

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
         "cwd": "/Users/klaushofrichter/Development/mcp-1",
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
          "args": ["/Users/klaushofrichter/Development/mcp-1/server.js"],
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

This project provides **three different server implementations** for different use cases:

### 1. MCP Server (stdio) - `npm start`
**Best for**: AI assistants like Claude, Cursor, and other MCP clients
- ✅ **Native MCP Protocol**: Full MCP specification compliance
- ✅ **Auto-discovery**: Resources and tools automatically discovered
- ✅ **Local Integration**: Perfect for desktop AI assistants
- ❌ **Local Only**: Cannot be accessed remotely

### 2. MCP Server (HTTP) - `npm run start:mcp-http`  
**Best for**: Remote MCP clients, web-based MCP integrations, distributed systems
- ✅ **Full MCP Protocol**: Complete MCP 2024-11-05 specification compliance
- ✅ **Remote Access**: HTTP transport allows network-based MCP clients
- ✅ **Session Management**: UUID-based sessions with automatic cleanup
- ✅ **Real-time**: Server-to-client notifications via Server-Sent Events (SSE)
- ✅ **Security**: DNS rebinding protection and host validation
- ✅ **Stateful**: Maintains session state across multiple requests
- ✅ **Production Ready**: Graceful shutdown and error handling

### 3. REST API Server (HTTP) - `npm run start:http`
**Best for**: Web applications, mobile apps, general API access
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

The project includes comprehensive test suites with **64 test cases** total across all three server implementations.

### Run Tests
```bash
# Run all tests (64 total)
npm test

# Run specific test suites
npm run test:mcp          # MCP server tests only (18 tests)
npm run test:http         # HTTP server tests only (28 tests)
npm run test:mcp-http     # MCP HTTP server tests only (18 tests)

# Development testing
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run with coverage reporting
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

## 🗂️ File Structure

```
mcp-quotes-server/
├── server.js              # MCP server (stdio transport)
├── mcp-server-http.js     # MCP server (HTTP transport)  
├── http-server.js         # REST API server implementation
├── quotes.json            # Star Trek quotes data
├── server.test.js         # MCP server test suite (18 tests)
├── http-server.test.js    # HTTP server test suite (28 tests)
├── mcp-server-http.test.js # MCP HTTP server test suite (18 tests)
├── package.json           # Dependencies and scripts
├── package-lock.json      # Locked dependency versions
└── README.md              # This documentation
```

## 🔧 Development

### Project Scripts
```bash
npm start              # Start the MCP server (stdio transport)
npm run start:mcp-http # Start the MCP server (HTTP transport)  
npm run start:http     # Start the REST API server (HTTP)
npm test               # Run test suite
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
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
