#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
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
} catch (error) {
  console.error('Error loading quotes.json:', error);
  process.exit(1);
}

// Create MCP server using the modern API
const server = new McpServer({
  name: 'quotes-server',
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
    console.log('Random quote requested');
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
    console.log('Text format requested');
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

// Add a tool for getting quotes by character
server.registerTool(
  'get-quote-by-character',
  {
    title: 'Get Quote by Character',
    description: 'Get quotes from a specific Star Trek character',
    inputSchema: {
      character: z.string().describe('The name of the Star Trek character (e.g., "Spock", "Kirk", "Picard")')
    }
  },
  async ({ character }) => {
    const matchingQuotes = quotesData.filter(quote => 
      quote.by.toLowerCase().includes(character.toLowerCase())
    );
    
    if (matchingQuotes.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No quotes found for character "${character}". Available characters: ${quotesData.map(q => q.by).join(', ')}`
        }]
      };
    }
    
    const quotesText = matchingQuotes
      .map(quote => `"${quote.quote}" - ${quote.by}`)
      .join('\n\n');
    
    return {
      content: [{
        type: 'text',
        text: `Quotes from ${character}:\n\n${quotesText}`
      }]
    };
  }
);

// Add a tool for getting a random quote
server.registerTool(
  'random-quote-tool',
  {
    title: 'Random Quote Tool',
    description: 'Get a random Star Trek quote',
    inputSchema: {}
  },
  async () => {
    const randomQuote = quotesData[Math.floor(Math.random() * quotesData.length)];
    return {
      content: [{
        type: 'text',
        text: `"${randomQuote.quote}" - ${randomQuote.by}`
      }]
    };
  }
);

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