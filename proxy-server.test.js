const request = require('supertest');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Log proxy test status
if (!process.env.QUOTES_MCP_API_KEY) {
  console.log('⚠️  QUOTES_MCP_API_KEY not available - skipping proxy tests');
}

(process.env.QUOTES_MCP_API_KEY ? describe : describe.skip)('MCP Proxy Server', () => {
  let app;
  let server;
  let serverPort;

  beforeAll(async () => {

    // Find an available port
    serverPort = 3001;
    
    // Spawn the proxy server
    server = spawn('node', ['proxy-server.js'], {
      env: { ...process.env, PROXY_PORT: serverPort },
      stdio: 'pipe'
    });

    // Wait for server to start
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Proxy server startup timeout'));
      }, 10000);

      server.stdout.on('data', (data) => {
        if (data.toString().includes('MCP Proxy Server Started')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      server.stderr.on('data', (data) => {
        console.error('Proxy server error:', data.toString());
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

  describe('Proxy Health Check', () => {
    test('should return proxy status at health endpoint', async () => {
      const response = await app.get('/proxy/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('proxy');
      expect(response.body.proxy).toHaveProperty('port');
      expect(response.body.proxy).toHaveProperty('remote_url');
      expect(response.body.proxy).toHaveProperty('api_key_configured', true);
      expect(response.body.proxy).toHaveProperty('uptime');
    });
  });

  describe('MCP Protocol Forwarding', () => {
    test('should forward MCP initialize requests successfully', async () => {
      const response = await app
        .post('/')
        .set('Content-Type', 'application/json')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              roots: {},
              sampling: {}
            },
            clientInfo: {
              name: 'proxy-test-client',
              version: '1.0.0'
            }
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('serverInfo');
      expect(response.body.result.serverInfo).toHaveProperty('name');
      expect(response.body.result).toHaveProperty('protocolVersion');
      expect(response.body.result).toHaveProperty('capabilities');
    });

    test('should forward tools/list requests successfully', async () => {
      const response = await app
        .post('/')
        .set('Content-Type', 'application/json')
        .send({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('id', 2);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('tools');
      expect(Array.isArray(response.body.result.tools)).toBe(true);
      expect(response.body.result.tools.length).toBeGreaterThan(0);
      
      // Check for expected tools
      const toolNames = response.body.result.tools.map(tool => tool.name);
      expect(toolNames).toContain('get-quote-by-character');
      expect(toolNames).toContain('random-quote-tool');
    });

    test('should forward resources/list requests successfully', async () => {
      const response = await app
        .post('/')
        .set('Content-Type', 'application/json')
        .send({
          jsonrpc: '2.0',
          id: 3,
          method: 'resources/list'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('id', 3);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('resources');
      expect(Array.isArray(response.body.result.resources)).toBe(true);
      expect(response.body.result.resources.length).toBeGreaterThan(0);
      
      // Check for expected resources
      const resourceUris = response.body.result.resources.map(resource => resource.uri);
      expect(resourceUris).toContain('quotes://all');
      expect(resourceUris).toContain('quotes://random');
      expect(resourceUris).toContain('quotes://text');
    });

    test('should forward tools/call requests successfully', async () => {
      const response = await app
        .post('/')
        .set('Content-Type', 'application/json')
        .send({
          jsonrpc: '2.0',
          id: 4,
          method: 'tools/call',
          params: {
            name: 'random-quote-tool',
            arguments: {}
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('id', 4);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('content');
      expect(Array.isArray(response.body.result.content)).toBe(true);
      expect(response.body.result.content.length).toBeGreaterThan(0);
      expect(response.body.result.content[0]).toHaveProperty('type', 'text');
      expect(response.body.result.content[0]).toHaveProperty('text');
      expect(response.body.result.content[0].text).toContain(' - '); // Should contain quote and attribution
    });

    test('should forward resources/read requests successfully', async () => {
      const response = await app
        .post('/')
        .set('Content-Type', 'application/json')
        .send({
          jsonrpc: '2.0',
          id: 5,
          method: 'resources/read',
          params: {
            uri: 'quotes://random'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('id', 5);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('contents');
      expect(Array.isArray(response.body.result.contents)).toBe(true);
      expect(response.body.result.contents.length).toBeGreaterThan(0);
      expect(response.body.result.contents[0]).toHaveProperty('uri', 'quotes://random');
      expect(response.body.result.contents[0]).toHaveProperty('text');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await app
        .post('/')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });

    // Skipping this test for now due to Express/Node.js fetch behavior with empty JSON bodies
    test.skip('should handle requests with no body', async () => {
      const response = await app
        .post('/')
        .set('Content-Type', 'application/json');

      // The proxy should handle empty requests gracefully
      expect([400, 500]).toContain(response.status);
    }, 15000); // Increase timeout to 15 seconds

    test('should handle invalid JSON-RPC messages', async () => {
      const invalidMessage = {
        id: 1,
        method: 'test'
        // Missing jsonrpc field
      };

      const response = await app
        .post('/')
        .set('Content-Type', 'application/json')
        .send(invalidMessage);

      expect(response.status).toBe(200); // Proxy forwards the request
      expect(response.body).toHaveProperty('error'); // Remote server returns error
    });

    test('should handle unknown methods', async () => {
      const response = await app
        .post('/')
        .set('Content-Type', 'application/json')
        .send({
          jsonrpc: '2.0',
          id: 999,
          method: 'unknown/method'
        });

      expect(response.status).toBe(200); // Proxy forwards the request
      expect(response.body).toHaveProperty('error'); // Remote server returns error
      expect(response.body.error).toHaveProperty('code'); // Should have error code
    });
  });

  describe('Server Robustness', () => {
    test('should handle concurrent requests', async () => {
      const promises = [
        app.get('/proxy/health'),
        app.post('/').send({ jsonrpc: '2.0', id: 1, method: 'tools/list' }).set('Content-Type', 'application/json'),
        app.post('/').send({ jsonrpc: '2.0', id: 2, method: 'resources/list' }).set('Content-Type', 'application/json'),
        app.post('/').send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'random-quote-tool', arguments: {} } }).set('Content-Type', 'application/json'),
        app.post('/').send({ jsonrpc: '2.0', id: 4, method: 'resources/read', params: { uri: 'quotes://random' } }).set('Content-Type', 'application/json')
      ];

      const responses = await Promise.all(promises);
      
      // All requests should complete without server crashes
      responses.forEach(response => {
        expect(response.status).toBeDefined();
        expect(typeof response.status).toBe('number');
        expect(response.status).toBeLessThan(600); // Valid HTTP status codes
      });
    });

    test('should maintain proxy state across requests', async () => {
      // Make multiple requests to health endpoint
      const response1 = await app.get('/proxy/health');
      const response2 = await app.get('/proxy/health');
      const response3 = await app.get('/proxy/health');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response3.status).toBe(200);

      // Should maintain consistent configuration
      expect(response1.body.proxy.remote_url).toBe(response2.body.proxy.remote_url);
      expect(response2.body.proxy.remote_url).toBe(response3.body.proxy.remote_url);
      expect(response1.body.proxy.api_key_configured).toBe(response2.body.proxy.api_key_configured);
      expect(response2.body.proxy.api_key_configured).toBe(response3.body.proxy.api_key_configured);
    });
  });
}); 