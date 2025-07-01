import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
// Import quotes data from JSON file - automatically bundled by Wrangler during deployment
import quotesData from './quotes.json';

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

// Create MCP server factory function
function createMcpServer() {
  const server = new McpServer({
    name: 'quotes-server-cloudflare',
    version: '1.0.0',
  });

  // Register the "all quotes" resource
  server.registerResource(
    'all-quotes',
    'quotes://all',
    {
      title: 'All Quotes',
      description: 'Complete collection of quotes from quotes.json',
      mimeType: 'application/json',
    },
    async () => ({
      contents: [{
        uri: 'quotes://all',
        mimeType: 'application/json',
        text: JSON.stringify(quotesData, null, 2),
      }]
    })
  );

  // Register the "random quote" resource
  server.registerResource(
    'random-quote',
    'quotes://random',
    {
      title: 'Random Quote',
      description: 'A single random quote from the collection',
      mimeType: 'application/json',
    },
    async () => {
      console.log('Random quote requested via Cloudflare MCP');
      const randomQuote = quotesData[Math.floor(Math.random() * quotesData.length)];
      return {
        contents: [{
          uri: 'quotes://random',
          mimeType: 'application/json',
          text: JSON.stringify(randomQuote, null, 2),
        }]
      };
    }
  );

  // Register the "text format" resource
  server.registerResource(
    'quotes-text',
    'quotes://text',
    {
      title: 'All Quotes as Text',
      description: 'All quotes formatted as readable text',
      mimeType: 'text/plain',
    },
    async () => {
      console.log('Text format requested via Cloudflare MCP');
      const textContent = quotesData
        .map((item, index) => `${index + 1}. "${item.quote}" - ${item.by}`)
        .join('\n\n');
      
      return {
        contents: [{
          uri: 'quotes://text',
          mimeType: 'text/plain',
          text: textContent,
        }]
      };
    }
  );

  // Register the "get quote by character" tool
  server.registerTool(
    'get-quote-by-character',
    {
      title: 'Get Quote by Character',
      description: 'Search quotes by Star Trek character name (case-insensitive, partial matching)',
      inputSchema: {
        character: z.string().describe('Character name to search for'),
      }
    },
    async ({ character }) => {
      console.log('Get quote by character tool called via Cloudflare MCP:', character);
      
      if (!character || character.trim() === '') {
        return {
          content: [{
            type: 'text',
            text: 'Please provide a character name to search for.'
          }],
          isError: true
        };
      }

      const matchingQuotes = quotesData.filter(quote => 
        quote.by.toLowerCase().includes(character.toLowerCase())
      );

      if (matchingQuotes.length === 0) {
        const availableCharacters = [...new Set(quotesData.map(q => q.by))];
        return {
          content: [{
            type: 'text',
            text: `No quotes found for character "${character}". Available characters: ${availableCharacters.join(', ')}`
          }],
          isError: true
        };
      }

      const result = matchingQuotes
        .map(quote => `"${quote.quote}" - ${quote.by}`)
        .join('\n\n');

      return {
        content: [{
          type: 'text',
          text: `Found ${matchingQuotes.length} quote(s) for "${character}":\n\n${result}`
        }]
      };
    }
  );

  // Register the "random quote tool"
  server.registerTool(
    'random-quote-tool',
    {
      title: 'Random Quote Tool',
      description: 'Get a random Star Trek quote in text format',
      inputSchema: {
        dummy: z.string().optional().describe('Dummy parameter (not used)'),
      }
    },
    async () => {
      console.log('Random quote tool called via Cloudflare MCP');
      const randomQuote = quotesData[Math.floor(Math.random() * quotesData.length)];
      
      return {
        content: [{
          type: 'text',
          text: `"${randomQuote.quote}" - ${randomQuote.by}`
        }]
      };
    }
  );

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

      // Root endpoint - API info
      if (url.pathname === '/' && request.method === 'GET') {
        return new Response(JSON.stringify({
          name: 'Star Trek Quotes MCP Server (Cloudflare Workers)',
          version: '1.0.0',
          description: 'MCP server providing Star Trek quotes via Streamable HTTP transport on Cloudflare Workers',
          transport: 'mcp-streamable-http',
          endpoints: {
            'POST /mcp': 'MCP client requests and initialization',
            'GET /mcp': 'MCP server-to-client notifications (SSE)',
            'DELETE /mcp': 'MCP session termination',
            'GET /health': 'Health check',
            'GET /': 'API information'
          },
          resources: [
            'quotes://all - All quotes as JSON',
            'quotes://random - Random quote as JSON', 
            'quotes://text - All quotes as formatted text'
          ],
          tools: [
            'get-quote-by-character - Search quotes by character name',
            'random-quote-tool - Get random quote in text format'
          ],
          totalQuotes: quotesData.length
        }, null, 2), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Health check endpoint
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