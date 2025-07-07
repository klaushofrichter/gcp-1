#!/usr/bin/env node

// Local Proxy Server for Quotes MCP Server
// Automatically adds API key from .env file to requests before forwarding to remote server

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PROXY_PORT || 3003;
const REMOTE_MCP_URL = process.env.REMOTE_MCP_URL || 'https://quotes-mcp-server.klaushofrichter.workers.dev';
const API_KEY = process.env.QUOTES_MCP_API_KEY;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text());

// Validation
if (!API_KEY) {
  console.error('❌ Error: QUOTES_MCP_API_KEY not found in .env file');
  console.error('Please ensure your .env file contains: QUOTES_MCP_API_KEY=your_api_key');
  process.exit(1);
}

// Health check endpoint (handle locally, don't proxy)
app.get('/proxy/health', (req, res) => {
  res.json({
    status: 'healthy',
    proxy: {
      port: PORT,
      remote_url: REMOTE_MCP_URL,
      api_key_configured: !!API_KEY,
      uptime: process.uptime()
    }
  });
});

// Proxy all other requests to the remote MCP server
app.all('*', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Log the incoming request
    console.log(`📨 ${req.method} ${req.path} - Proxying to remote MCP server`);
    
    // Prepare headers for the remote request
    const headers = {
      ...req.headers,
      'X-API-Key': API_KEY,  // Add API key automatically
      'host': undefined,     // Remove host header to avoid conflicts
    };
    
    // Remove any undefined headers
    Object.keys(headers).forEach(key => {
      if (headers[key] === undefined) {
        delete headers[key];
      }
    });
    
    // Make request to remote server
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // If body is already a string (from express.text()), use it directly
      // Otherwise, stringify the parsed JSON object
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }
    
    const response = await fetch(`${REMOTE_MCP_URL}${req.path}`, {
      method: req.method,
      headers: headers,
      body: body,
    });
    
    // Get response data
    const responseData = await response.text();
    const duration = Date.now() - startTime;
    
    // Log the response
    console.log(`📤 ${response.status} ${response.statusText} - ${duration}ms`);
    
    // Forward response status and headers
    res.status(response.status);
    
    // Copy relevant response headers
    ['content-type', 'cache-control', 'access-control-allow-origin', 'access-control-allow-methods', 'access-control-allow-headers'].forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        res.set(header, value);
      }
    });
    
    // Send response
    res.send(responseData);
    
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: `Proxy error: ${error.message}`
      }
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 MCP Proxy Server Started');
  console.log('================================');
  console.log(`📍 Local URL:  http://localhost:${PORT}`);
  console.log(`🌐 Remote URL: ${REMOTE_MCP_URL}`);
  console.log(`🔑 API Key:    ${API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log('================================');
  console.log('💡 Usage:');
  console.log(`   curl -X POST "http://localhost:${PORT}" \\`);
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"jsonrpc":"2.0","method":"tools/list","id":1}\'');
  console.log('');
  console.log(`🏥 Health: http://localhost:${PORT}/proxy/health`);
  console.log('📖 No API key required for local requests!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down proxy server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down proxy server...');
  process.exit(0);
}); 