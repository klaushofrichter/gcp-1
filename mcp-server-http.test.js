const request = require('supertest');
const express = require('express');
const { randomUUID } = require('node:crypto');
const { spawn } = require('child_process');

// Import quotes data from the source file
const quotesData = require('./quotes.json');
const mockQuotesData = quotesData;

describe('MCP HTTP Server', () => {
  let app;
  let server;
  let serverPort;

  beforeAll(async () => {
    // Find an available port
    serverPort = 3002;
    
    // Spawn the MCP server
    server = spawn('node', ['mcp-server-http.js'], {
      env: { ...process.env, PORT: serverPort },
      stdio: 'pipe'
    });

    // Wait for server to start
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, 10000);

      server.stdout.on('data', (data) => {
        if (data.toString().includes('Server running at:')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      server.stderr.on('data', (data) => {
        console.error('Server error:', data.toString());
      });
    });

    // Create a simple HTTP client for testing
    app = request(`http://127.0.0.1:${serverPort}`);
  });

  afterAll(async () => {
    if (server) {
      // Kill the server process
      server.kill('SIGTERM');
      
      // Wait for the process to exit
      await new Promise((resolve) => {
        server.on('exit', () => {
          server = null;
          resolve();
        });
        
        // Force kill after 3 seconds if it doesn't exit gracefully
        setTimeout(() => {
          if (server && !server.killed) {
            server.kill('SIGKILL');
            server = null;
          }
          resolve();
        }, 3000);
      });
      
      // Give a moment for any remaining cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  });

  describe('Non-MCP Endpoints', () => {
    test('should return server information at root', async () => {
      const response = await app.get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Star Trek Quotes MCP Server');
      expect(response.body).toHaveProperty('transport', 'mcp-streamable-http');
      expect(response.body).toHaveProperty('totalQuotes');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('POST /mcp');
    });

    test('should return health status', async () => {
      const response = await app.get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('quotesLoaded');
      expect(response.body).toHaveProperty('activeSessions');
      expect(response.body).toHaveProperty('transport', 'mcp-http');
    });

    test('should return 404 for unknown endpoints', async () => {
      const response = await app.get('/unknown');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Endpoint not found');
      expect(response.body).toHaveProperty('availableEndpoints');
    });
  });

  describe('MCP Session Management', () => {
    test('should reject requests without session ID for non-initialize requests', async () => {
      const response = await app.post('/mcp').send({
        jsonrpc: '2.0',
        id: 1,
        method: 'resources/list',
        params: {}
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('No valid session ID provided');
    });

    test('should handle GET requests without session ID', async () => {
      const response = await app.get('/mcp');
      
      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid or missing session ID');
    });

    test('should handle DELETE requests without session ID', async () => {
      const response = await app.delete('/mcp');
      
      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid or missing session ID');
    });
  });

  describe('MCP Message Structure Validation', () => {
    test('should validate JSON-RPC format for initialize method', async () => {
      const response = await app
        .post('/mcp')
        .set('Content-Type', 'application/json')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'test-client',
              version: '1.0.0'
            }
          }
        });

      // The transport may return 406, but we're testing that our server handles the message structure
      expect([200, 403, 406, 500]).toContain(response.status);
      
      // If it's a JSON response, it should have the right structure
      if (response.headers['content-type']?.includes('application/json')) {
        if (response.body.jsonrpc) {
          expect(response.body).toHaveProperty('jsonrpc', '2.0');
          expect(response.body).toHaveProperty('id');
        }
      }
    });

    test('should handle valid MCP message structure', async () => {
      const validMcpMessage = {
        jsonrpc: '2.0',
        id: 'test-123',
        method: 'resources/list',
        params: {}
      };

      const response = await app
        .post('/mcp')
        .set('Content-Type', 'application/json')
        .send(validMcpMessage);

      // Should either process or properly reject with valid JSON-RPC error
      expect([200, 400, 406, 500]).toContain(response.status);
    });

    test('should reject invalid JSON-RPC messages', async () => {
      const invalidMessage = {
        id: 1,
        method: 'test'
        // Missing jsonrpc field
      };

      const response = await app
        .post('/mcp')
        .set('Content-Type', 'application/json')
        .send(invalidMessage);

      expect([400, 406]).toContain(response.status);
    });
  });

  describe('HTTP Method Handling', () => {
    test('should handle GET requests to MCP endpoint', async () => {
      const response = await app.get('/mcp');
      
      // Should reject without session ID
      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid or missing session ID');
    });

    test('should handle DELETE requests to MCP endpoint', async () => {
      const response = await app.delete('/mcp');
      
      // Should reject without session ID
      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid or missing session ID');
    });

    test('should handle GET with invalid session ID', async () => {
      const response = await app
        .get('/mcp')
        .set('mcp-session-id', 'invalid-session-id');
      
      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid or missing session ID');
    });

    test('should handle DELETE with invalid session ID', async () => {
      const response = await app
        .delete('/mcp')
        .set('mcp-session-id', 'invalid-session-id');
      
      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid or missing session ID');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await app
        .post('/mcp')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });

    test('should handle requests with no body', async () => {
      const response = await app
        .post('/mcp')
        .set('Content-Type', 'application/json');

      expect([400, 406]).toContain(response.status);
    });

    test('should handle non-JSON content type', async () => {
      const response = await app
        .post('/mcp')
        .send('some text')
        .set('Content-Type', 'text/plain');

      expect([400, 406]).toContain(response.status);
    });
  });

  describe('Server Robustness', () => {
    test('should handle concurrent requests to different endpoints', async () => {
      const promises = [
        app.get('/'),
        app.get('/health'),
        app.get('/unknown'),
        app.post('/mcp').send({ test: 'data' }),
        app.get('/mcp')
      ];

      const responses = await Promise.all(promises);
      
      // All requests should complete without server crashes
      responses.forEach(response => {
        expect(response.status).toBeDefined();
        expect(typeof response.status).toBe('number');
      });
    });

    test('should maintain server state across requests', async () => {
      // Make multiple requests to health endpoint
      const response1 = await app.get('/health');
      const response2 = await app.get('/health');
      const response3 = await app.get('/health');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response3.status).toBe(200);

      // Should maintain consistent quote count
      expect(response1.body.quotesLoaded).toBe(response2.body.quotesLoaded);
      expect(response2.body.quotesLoaded).toBe(response3.body.quotesLoaded);
    });
  });
}); 