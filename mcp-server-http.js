#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load quotes data
let quotesData;
try {
  const quotesPath = path.join(__dirname, 'quotes.json');
  quotesData = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));
  console.log(`Loaded ${quotesData.length} quotes from quotes.json`);
} catch (error) {
  console.error('Error loading quotes.json:', error);
  process.exit(1);
}

// Create MCP server factory function
function createMcpServer() {
  const server = new McpServer({
    name: 'quotes-server-http',
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
      console.log('Random quote requested via HTTP MCP');
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
      console.log('Text format requested via HTTP MCP');
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
      console.log('Get quote by character tool called via HTTP MCP:', character);
      
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
        // This tool accepts a dummy parameter to comply with MCP tool interface
        dummy: z.string().optional().describe('Dummy parameter (not used)'),
      }
    },
    async () => {
      console.log('Random quote tool called via HTTP MCP');
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

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Map to store transports by session ID
const transports = {};

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Handle POST requests for client-to-server communication
app.post('/mcp', async (req, res) => {
  try {
    // Check for existing session ID
    const sessionId = req.headers['mcp-session-id'];
    let transport;

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId];
    } else if (!sessionId && req.body.method === 'initialize') {
      // New initialization request
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          // Store the transport by session ID
          transports[sessionId] = transport;
          console.log(`MCP session initialized: ${sessionId}`);
        },
        // DNS rebinding protection
        enableDnsRebindingProtection: true,
        allowedHosts: ['127.0.0.1', 'localhost'],
      });

      // Clean up transport when closed
      transport.onclose = () => {
        if (transport.sessionId) {
          console.log(`MCP session closed: ${transport.sessionId}`);
          delete transports[transport.sessionId];
        }
      };

      // Create and connect MCP server
      const mcpServer = createMcpServer();
      await mcpServer.connect(transport);
    } else {
      // Invalid request
      return res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
    }

    // Handle the request
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

// Handle GET requests for server-to-client notifications via SSE
app.get('/mcp', async (req, res) => {
  try {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !transports[sessionId]) {
      return res.status(400).send('Invalid or missing session ID');
    }
    
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('Error handling MCP GET request:', error);
    if (!res.headersSent) {
      res.status(500).send('Internal server error');
    }
  }
});

// Handle DELETE requests for session termination
app.delete('/mcp', async (req, res) => {
  try {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !transports[sessionId]) {
      return res.status(400).send('Invalid or missing session ID');
    }
    
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
    
    // Clean up the session
    delete transports[sessionId];
  } catch (error) {
    console.error('Error handling MCP DELETE request:', error);
    if (!res.headersSent) {
      res.status(500).send('Internal server error');
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    quotesLoaded: quotesData.length,
    activeSessions: Object.keys(transports).length,
    transport: 'mcp-http'
  });
});

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    name: 'Star Trek Quotes MCP Server',
    version: '1.0.0',
    description: 'MCP server providing Star Trek quotes via Streamable HTTP transport',
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
    totalQuotes: quotesData.length,
    activeSessions: Object.keys(transports).length
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'POST /mcp',
      'GET /mcp', 
      'DELETE /mcp',
      'GET /health',
      'GET /'
    ]
  });
});

// Start server
const port = process.env.PORT || 3001;
app.listen(port, '127.0.0.1', () => {
  console.log('🚀 Star Trek Quotes MCP Server (Streamable HTTP)');
  console.log(`🌐 Server running at: http://127.0.0.1:${port}`);
  console.log(`📊 Loaded ${quotesData.length} quotes`);
  console.log('🖖 Live long and prosper!');
  console.log('\n📝 MCP Endpoints:');
  console.log('  POST /mcp                 - MCP client requests');
  console.log('  GET /mcp                  - MCP notifications (SSE)');
  console.log('  DELETE /mcp               - Session termination');
  console.log('  GET /health               - Health check');
  console.log('  GET /                     - API information');
  console.log('\n🔧 MCP Resources:');
  console.log('  quotes://all              - All quotes as JSON');
  console.log('  quotes://random           - Random quote as JSON');
  console.log('  quotes://text             - All quotes as text');
  console.log('\n🛠️ MCP Tools:');
  console.log('  get-quote-by-character    - Search by character');
  console.log('  random-quote-tool         - Random quote generator');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  Object.values(transports).forEach(transport => {
    try {
      transport.close?.();
    } catch (err) {
      console.error('Error closing transport:', err);
    }
  });
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  Object.values(transports).forEach(transport => {
    try {
      transport.close?.();
    } catch (err) {
      console.error('Error closing transport:', err);
    }
  });
  process.exit(0);
}); 