#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerMcpResources, registerMcpTools } from './lib/mcp-resources.js';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load quotes data
let quotesData;
try {
  const quotesPath = path.join(__dirname, 'quotes.json');
  quotesData = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));
} catch (error) {
  console.error('Error loading quotes.json:', error);
  process.exit(1);
}

// Create MCP server using shared libraries
const server = new McpServer({
  name: 'quotes-server',
  version: '1.0.0',
});

// Register all MCP resources and tools using shared functions
registerMcpResources(server, quotesData, 'Stdio');
registerMcpTools(server, quotesData, 'Stdio');

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Quotes Server is running...');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
}); 