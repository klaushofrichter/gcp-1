/**
 * MCP Resources and Tools Library
 * Shared MCP resource and tool definitions for Star Trek quote servers
 */

import { z } from 'zod';
import { 
  getRandomQuote, 
  formatQuotesAsText, 
  searchQuotesByCharacter, 
  formatQuoteAsText,
  getAvailableCharacters 
} from './quote-functions.js';

/**
 * Register all MCP resources for a given server
 * @param {McpServer} server - MCP server instance
 * @param {Array} quotesData - Array of quote objects
 * @param {string} serverType - Type identifier for logging (e.g., 'HTTP', 'Cloudflare')
 */
export function registerMcpResources(server, quotesData, serverType = '') {
  const logPrefix = serverType ? `${serverType} MCP` : 'MCP';
  
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
      console.log(`Random quote requested via ${logPrefix}`);
      const randomQuote = getRandomQuote(quotesData);
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
      console.log(`Text format requested via ${logPrefix}`);
      const textContent = formatQuotesAsText(quotesData);
      
      return {
        contents: [{
          uri: 'quotes://text',
          mimeType: 'text/plain',
          text: textContent,
        }]
      };
    }
  );
}

/**
 * Register all MCP tools for a given server
 * @param {McpServer} server - MCP server instance
 * @param {Array} quotesData - Array of quote objects
 * @param {string} serverType - Type identifier for logging (e.g., 'HTTP', 'Cloudflare')
 * @param {string} quoteSuffix - Optional suffix to append to quote responses
 */
export function registerMcpTools(server, quotesData, serverType = '', quoteSuffix = '') {
  const logPrefix = serverType ? `${serverType} MCP` : 'MCP';
  
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
      console.log(`Get quote by character tool called via ${logPrefix}:`, character);
      
      if (!character || character.trim() === '') {
        return {
          content: [{
            type: 'text',
            text: 'Please provide a character name to search for.'
          }],
          isError: true
        };
      }

      const matchingQuotes = searchQuotesByCharacter(quotesData, character);

      if (matchingQuotes.length === 0) {
        const availableCharacters = getAvailableCharacters(quotesData);
        return {
          content: [{
            type: 'text',
            text: `No quotes found for character "${character}". Available characters: ${availableCharacters.join(', ')}`
          }],
          isError: true
        };
      }

      const result = matchingQuotes
        .map(quote => formatQuoteAsText(quote, quoteSuffix))
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
      console.log(`Random quote tool called via ${logPrefix}`);
      const randomQuote = getRandomQuote(quotesData);
      
      return {
        content: [{
          type: 'text',
          text: formatQuoteAsText(randomQuote, quoteSuffix)
        }]
      };
    }
  );
}

/**
 * Get standard MCP server metadata
 * @param {string} serverName - Name of the server implementation
 * @param {string} transport - Transport type (e.g., 'mcp-streamable-http')
 * @param {Array} quotesData - Array of quote objects
 * @param {Object} additionalInfo - Additional server-specific information
 * @returns {Object} Server metadata object
 */
export function getMcpServerMetadata(serverName, transport, quotesData, additionalInfo = {}) {
  return {
    name: serverName,
    version: '1.0.0',
    description: 'MCP server providing Star Trek quotes via various transports',
    transport: transport,
    endpoints: {
      'POST /mcp': 'MCP client requests and initialization',
      'GET /mcp': 'MCP server-to-client notifications (SSE)',
      'DELETE /mcp': 'MCP session termination',
      'GET /health': 'Health check',
      'GET /': 'API information',
      ...additionalInfo.endpoints
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
    ...additionalInfo
  };
} 