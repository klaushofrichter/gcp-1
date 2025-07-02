#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerMcpResources, registerMcpTools, getMcpServerMetadata } from './lib/mcp-resources.js';

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

// Create MCP server factory function using shared libraries
function createMcpServer() {
  const server = new McpServer({
    name: 'quotes-server-http',
    version: '1.0.0',
  });

  // Register all MCP resources and tools using shared functions
  registerMcpResources(server, quotesData, 'HTTP');
  registerMcpTools(server, quotesData, 'HTTP');

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

// Root endpoint - API info using shared metadata
app.get('/', (req, res) => {
  const apiInfo = getMcpServerMetadata(
    'Star Trek Quotes MCP Server',
    'mcp-streamable-http',
    quotesData,
    { 
      description: 'MCP server providing Star Trek quotes via Streamable HTTP transport',
      activeSessions: Object.keys(transports).length
    }
  );
  
  res.json(apiInfo);
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