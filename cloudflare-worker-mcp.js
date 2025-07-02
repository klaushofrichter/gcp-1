import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
// Import quotes data from JSON file - automatically bundled by Wrangler during deployment
import quotesData from './quotes.json';
import { registerMcpResources, registerMcpTools, getMcpServerMetadata } from './lib/mcp-resources.js';

// Durable Object for session management
export class MCPSessionManager {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (request.method === 'POST') {
      // Store session data
      const sessionData = await request.json();
      this.sessions.set(sessionId, sessionData);
      return new Response('Session stored', { status: 200 });
    } else if (request.method === 'GET') {
      // Retrieve session data
      const sessionData = this.sessions.get(sessionId);
      return new Response(JSON.stringify(sessionData || null), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (request.method === 'DELETE') {
      // Delete session
      this.sessions.delete(sessionId);
      return new Response('Session deleted', { status: 200 });
    }

    return new Response('Method not allowed', { status: 405 });
  }
}

// Create MCP server factory function using shared libraries
function createMcpServer() {
  const server = new McpServer({
    name: 'quotes-server-cloudflare',
    version: '1.0.0',
  });

  // Register all MCP resources and tools using shared functions
  registerMcpResources(server, quotesData, 'Cloudflare');
  registerMcpTools(server, quotesData, 'Cloudflare');

  return server;
}

// Main worker export
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    try {
      // CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, mcp-session-id',
      };

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Root endpoint - API info using shared metadata
      if (url.pathname === '/' && request.method === 'GET') {
        const apiInfo = getMcpServerMetadata(
          'Star Trek Quotes MCP Server (Cloudflare Workers)',
          'mcp-streamable-http',
          quotesData,
          { 
            description: 'MCP server providing Star Trek quotes via Streamable HTTP transport on Cloudflare Workers'
          }
        );
        
        return new Response(JSON.stringify(apiInfo, null, 2), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Health check endpoint using shared function structure
      if (url.pathname === '/health' && request.method === 'GET') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          quotesLoaded: quotesData.length,
          transport: 'mcp-http-cloudflare'
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // MCP endpoints
      if (url.pathname === '/mcp') {
        const sessionId = request.headers.get('mcp-session-id');

        if (request.method === 'POST') {
          let body;
          try {
            body = await request.json();
          } catch (error) {
            console.error('Failed to parse JSON body:', error);
            return new Response(JSON.stringify({
              error: 'Invalid JSON in request body',
              message: error.message
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }

          // Create transport for new session or reuse existing
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => crypto.randomUUID(),
            onsessioninitialized: (sessionId) => {
              console.log(`MCP session initialized: ${sessionId}`);
            },
            enableDnsRebindingProtection: false, // Disable for Workers
          });

          // Create and connect MCP server
          const mcpServer = createMcpServer();
          await mcpServer.connect(transport);

          // Create a request object that matches what the transport expects
          const mcpRequest = {
            method: 'POST',
            headers: request.headers,
            body
          };

          // Create a response handler
          const mcpResponse = {
            status: 200,
            headers: new Map(),
            body: null,
            json: (data) => {
              mcpResponse.body = JSON.stringify(data);
              mcpResponse.headers.set('Content-Type', 'application/json');
            },
            send: (data) => {
              mcpResponse.body = data;
            },
            setHeader: (name, value) => {
              mcpResponse.headers.set(name, value);
            }
          };

          // Handle the request through the transport
          try {
            await transport.handleRequest(mcpRequest, mcpResponse, body);
          } catch (transportError) {
            console.error('Transport error:', transportError);
            return new Response(JSON.stringify({
              error: 'MCP transport error',
              message: transportError.message
            }), {
              status: 500,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }

          // Convert response to Workers Response
          const responseHeaders = {};
          mcpResponse.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });

          return new Response(mcpResponse.body, {
            status: mcpResponse.status,
            headers: { ...responseHeaders, ...corsHeaders }
          });
        }

        // Handle GET requests for SSE
        if (request.method === 'GET') {
          // For now, return a simple response
          // Full SSE implementation would require more complex handling
          return new Response('SSE endpoint - implementation pending', {
            headers: { ...corsHeaders }
          });
        }

        // Handle DELETE requests for session termination
        if (request.method === 'DELETE') {
          return new Response('Session terminated', {
            headers: { ...corsHeaders }
          });
        }
      }

      // 404 for unknown endpoints
      return new Response(JSON.stringify({
        error: 'Endpoint not found',
        availableEndpoints: [
          'POST /mcp',
          'GET /mcp', 
          'DELETE /mcp',
          'GET /health',
          'GET /'
        ]
      }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Error handling request:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
}; 