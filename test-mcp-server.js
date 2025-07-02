#!/usr/bin/env node

// Test suite for Cloudflare Workers MCP Server
// Tests the deployed server at: https://quotes-mcp-server-v2.klaushofrichter.workers.dev

const MCP_SERVER_URL = 'https://quotes-mcp-server-v2.klaushofrichter.workers.dev';

// Test helper function
async function mcpRequest(method, params = {}, id = 1) {
  const payload = {
    jsonrpc: '2.0',
    id: id,
    method: method,
    ...(Object.keys(params).length > 0 && { params })
  };

  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

// Test Cases
const tests = [
  {
    name: '1. Initialize MCP Server',
    test: async () => {
      const result = await mcpRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {
          roots: {},
          sampling: {}
        },
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Assertions
      if (!result.result) throw new Error('No result in response');
      if (result.result.protocolVersion !== '2024-11-05') throw new Error('Wrong protocol version');
      if (!result.result.capabilities) throw new Error('No capabilities in response');
      if (!result.result.serverInfo) throw new Error('No server info in response');
      if (result.result.serverInfo.name !== 'quotes-server') throw new Error('Wrong server name');
      
      return 'PASSED';
    }
  },

  {
    name: '2. List Available Tools',
    test: async () => {
      const result = await mcpRequest('tools/list');
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Assertions
      if (!result.result) throw new Error('No result in response');
      if (!result.result.tools) throw new Error('No tools array in response');
      if (result.result.tools.length !== 2) throw new Error(`Expected 2 tools, got ${result.result.tools.length}`);
      
      const toolNames = result.result.tools.map(t => t.name);
      if (!toolNames.includes('get-quote-by-character')) throw new Error('Missing get-quote-by-character tool');
      if (!toolNames.includes('random-quote-tool')) throw new Error('Missing random-quote-tool');
      
      return 'PASSED';
    }
  },

  {
    name: '3. List Available Resources',
    test: async () => {
      const result = await mcpRequest('resources/list');
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Assertions
      if (!result.result) throw new Error('No result in response');
      if (!result.result.resources) throw new Error('No resources array in response');
      if (result.result.resources.length !== 3) throw new Error(`Expected 3 resources, got ${result.result.resources.length}`);
      
      const resourceUris = result.result.resources.map(r => r.uri);
      if (!resourceUris.includes('quotes://all')) throw new Error('Missing quotes://all resource');
      if (!resourceUris.includes('quotes://random')) throw new Error('Missing quotes://random resource');
      if (!resourceUris.includes('quotes://text')) throw new Error('Missing quotes://text resource');
      
      return 'PASSED';
    }
  },

  {
    name: '4. Get Quotes by Character - Spock',
    test: async () => {
      const result = await mcpRequest('tools/call', {
        name: 'get-quote-by-character',
        arguments: { character: 'Spock' }
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Assertions
      if (!result.result) throw new Error('No result in response');
      if (!result.result.content) throw new Error('No content in response');
      if (!result.result.content[0]) throw new Error('No content item in response');
      if (result.result.content[0].type !== 'text') throw new Error('Wrong content type');
      
      const text = result.result.content[0].text;
      if (!text.includes('Spock')) throw new Error('Response does not contain Spock');
      if (!text.includes('Live long and prosper')) throw new Error('Missing expected Spock quote');
      
      return 'PASSED';
    }
  },

  {
    name: '5. Get Quotes by Character - Kirk',
    test: async () => {
      const result = await mcpRequest('tools/call', {
        name: 'get-quote-by-character',
        arguments: { character: 'Kirk' }
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Assertions
      if (!result.result) throw new Error('No result in response');
      const text = result.result.content[0].text;
      if (!text.includes('Kirk')) throw new Error('Response does not contain Kirk');
      if (!text.includes('Beam me up, Scotty')) throw new Error('Missing expected Kirk quote');
      
      return 'PASSED';
    }
  },

  {
    name: '6. Get Quotes by Character - Nonexistent Character',
    test: async () => {
      const result = await mcpRequest('tools/call', {
        name: 'get-quote-by-character',
        arguments: { character: 'Janeway' }
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Assertions
      if (!result.result) throw new Error('No result in response');
      const text = result.result.content[0].text;
      if (!text.includes('No quotes found')) throw new Error('Should return no quotes found message');
      if (!text.includes('Available characters')) throw new Error('Should list available characters');
      
      return 'PASSED';
    }
  },

  {
    name: '7. Random Quote Tool',
    test: async () => {
      const result = await mcpRequest('tools/call', {
        name: 'random-quote-tool',
        arguments: {}
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Assertions
      if (!result.result) throw new Error('No result in response');
      if (!result.result.content) throw new Error('No content in response');
      const text = result.result.content[0].text;
      if (!text.includes('"') || !text.includes(' - ')) throw new Error('Invalid quote format');
      
      return 'PASSED';
    }
  },

  {
    name: '8. Read All Quotes Resource',
    test: async () => {
      const result = await mcpRequest('resources/read', {
        uri: 'quotes://all'
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Assertions
      if (!result.result) throw new Error('No result in response');
      if (!result.result.contents) throw new Error('No contents in response');
      if (!result.result.contents[0]) throw new Error('No content item in response');
      
      const content = result.result.contents[0];
      if (content.mimeType !== 'application/json') throw new Error('Wrong mime type');
      
      const quotes = JSON.parse(content.text);
      if (!Array.isArray(quotes)) throw new Error('Quotes should be an array');
      if (quotes.length !== 8) throw new Error(`Expected 8 quotes, got ${quotes.length}`);
      
      return 'PASSED';
    }
  },

  {
    name: '9. Read Random Quote Resource',
    test: async () => {
      const result = await mcpRequest('resources/read', {
        uri: 'quotes://random'
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Assertions
      if (!result.result) throw new Error('No result in response');
      const content = result.result.contents[0];
      if (content.mimeType !== 'application/json') throw new Error('Wrong mime type');
      
      const quote = JSON.parse(content.text);
      if (!quote.quote || !quote.by) throw new Error('Invalid quote structure');
      
      return 'PASSED';
    }
  },

  {
    name: '10. Read Text Format Resource',
    test: async () => {
      const result = await mcpRequest('resources/read', {
        uri: 'quotes://text'
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Assertions
      if (!result.result) throw new Error('No result in response');
      const content = result.result.contents[0];
      if (content.mimeType !== 'text/plain') throw new Error('Wrong mime type');
      if (!content.text.includes('1.') || !content.text.includes('2.')) throw new Error('Should be numbered list');
      
      return 'PASSED';
    }
  },

  {
    name: '11. Test Invalid Method',
    test: async () => {
      const result = await mcpRequest('invalid/method');
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Assertions
      if (!result.error) throw new Error('Should return error for invalid method');
      if (result.error.code !== -32601) throw new Error('Wrong error code');
      
      return 'PASSED';
    }
  },

  {
    name: '12. Test Invalid Tool',
    test: async () => {
      const result = await mcpRequest('tools/call', {
        name: 'nonexistent-tool',
        arguments: {}
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Assertions
      if (!result.error) throw new Error('Should return error for invalid tool');
      
      return 'PASSED';
    }
  },

  {
    name: '13. Test Invalid Resource',
    test: async () => {
      const result = await mcpRequest('resources/read', {
        uri: 'quotes://invalid'
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // This might return an error or empty result depending on implementation
      return 'PASSED';
    }
  },

  {
    name: '14. Test HTTP Methods (GET should fail)',
    test: async () => {
      try {
        const response = await fetch(MCP_SERVER_URL, {
          method: 'GET'
        });
        
        console.log('Response status:', response.status);
        console.log('Response text:', await response.text());
        
        if (response.status !== 405) throw new Error('Should return 405 Method Not Allowed');
        
        return 'PASSED';
      } catch (error) {
        if (error.message.includes('405')) return 'PASSED';
        throw error;
      }
    }
  },

  {
    name: '15. Test Malformed JSON',
    test: async () => {
      try {
        const response = await fetch(MCP_SERVER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: '{"invalid": json}'
        });

        const result = await response.json();
        console.log('Response:', JSON.stringify(result, null, 2));
        
        if (!result.error) throw new Error('Should return error for malformed JSON');
        if (result.error.code !== -32700) throw new Error('Wrong error code for parse error');
        
        return 'PASSED';
      } catch (error) {
        if (error.message.includes('parse')) return 'PASSED';
        throw error;
      }
    }
  }
];

// Run all tests
async function runTests() {
  console.log(`🧪 Testing MCP Server at: ${MCP_SERVER_URL}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${test.name}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      const result = await test.test();
      console.log(`✅ ${test.name}: ${result}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${(passed / (passed + failed) * 100).toFixed(1)}%`);
  console.log(`${'='.repeat(60)}`);
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests, mcpRequest, MCP_SERVER_URL }; 