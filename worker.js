// Cloudflare Workers MCP Server
// Import quotes data from JSON file - automatically bundled by Wrangler during deployment
import quotesData from './quotes.json';
import { 
  getRandomQuote, 
  formatQuoteAsText, 
  formatQuotesAsText, 
  searchQuotesByCharacter, 
  getAvailableCharacters 
} from './lib/quote-functions.js';

// Validate API Key using KV store
async function validateApiKey(request, env) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return {
      valid: false,
      error: {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32001,
          message: 'Missing API key. Please include X-API-Key header.'
        }
      }
    };
  }
  
  try {
    // Get valid API keys from KV store
    const validKeysJson = await env.QUOTES_MCP_KEYS.get('valid_keys');
    if (!validKeysJson) {
      console.error('No valid_keys found in KV store');
      return {
        valid: false,
        error: {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32003,
            message: 'API key validation unavailable. Please try again later.'
          }
        }
      };
    }
    
    const validKeys = JSON.parse(validKeysJson);
    if (!Array.isArray(validKeys) || !validKeys.includes(apiKey)) {
      return {
        valid: false,
        error: {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32002,
            message: 'Invalid API key. Access denied.'
          }
        }
      };
    }
    
    return { valid: true };
    
  } catch (error) {
    console.error('Error validating API key:', error);
    return {
      valid: false,
      error: {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32003,
          message: 'API key validation unavailable. Please try again later.'
        }
      }
    };
  }
}

// HTTP handler for Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Validate API Key first
    const apiValidation = await validateApiKey(request, env);
    if (!apiValidation.valid) {
      return new Response(JSON.stringify(apiValidation.error), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, X-API-Key'
        }
      });
    }

    try {
      const body = await request.text();
      const jsonRequest = JSON.parse(body);
      
      // Handle MCP request
      let response;
      
      switch (jsonRequest.method) {
        case 'initialize':
          response = {
            jsonrpc: '2.0',
            id: jsonRequest.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                resources: { listChanged: true },
                tools: { listChanged: true }
              },
              serverInfo: {
                name: 'quotes-server',
                version: '1.0.0'
              }
            }
          };
          break;
          
        case 'resources/list':
          response = {
            jsonrpc: '2.0',
            id: jsonRequest.id,
            result: {
              resources: [
                {
                  uri: 'quotes://all',
                  name: 'all-quotes',
                  title: 'All Quotes',
                  description: 'Complete collection of quotes',
                  mimeType: 'application/json'
                },
                {
                  uri: 'quotes://random',
                  name: 'random-quote',
                  title: 'Random Quote',
                  description: 'A single random quote',
                  mimeType: 'application/json'
                },
                {
                  uri: 'quotes://text',
                  name: 'quotes-text',
                  title: 'All Quotes as Text',
                  description: 'All quotes formatted as text',
                  mimeType: 'text/plain'
                }
              ]
            }
          };
          break;
          
        case 'resources/read':
          const uri = jsonRequest.params.uri;
          
          switch (uri) {
            case 'quotes://all':
              response = {
                jsonrpc: '2.0',
                id: jsonRequest.id,
                result: {
                  contents: [{
                    uri: uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(quotesData, null, 2)
                  }]
                }
              };
              break;
              
            case 'quotes://random':
              const randomQuote = getRandomQuote(quotesData);
              response = {
                jsonrpc: '2.0',
                id: jsonRequest.id,
                result: {
                  contents: [{
                    uri: uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(randomQuote, null, 2)
                  }]
                }
              };
              break;
              
            case 'quotes://text':
              const textContent = formatQuotesAsText(quotesData);
              response = {
                jsonrpc: '2.0',
                id: jsonRequest.id,
                result: {
                  contents: [{
                    uri: uri,
                    mimeType: 'text/plain',
                    text: textContent
                  }]
                }
              };
              break;
              
            default:
              response = {
                jsonrpc: '2.0',
                id: jsonRequest.id,
                error: {
                  code: -32602,
                  message: `Unknown resource URI: ${uri}`
                }
              };
          }
          break;
          
        case 'tools/list':
          response = {
            jsonrpc: '2.0',
            id: jsonRequest.id,
            result: {
              tools: [
                {
                  name: 'get-quote-by-character',
                  title: 'Get Quote by Character',
                  description: 'Get quotes from a specific Star Trek character',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      character: {
                        type: 'string',
                        description: 'The name of the Star Trek character'
                      }
                    },
                    required: ['character']
                  }
                },
                {
                  name: 'random-quote-tool',
                  title: 'Random Quote Tool',
                  description: 'Get a random Star Trek quote',
                  inputSchema: {
                    type: 'object',
                    properties: {}
                  }
                }
              ]
            }
          };
          break;
          
        case 'tools/call':
          const toolName = jsonRequest.params.name;
          const args = jsonRequest.params.arguments || {};
          
          if (toolName === 'get-quote-by-character') {
            const character = args.character;
            const matchingQuotes = searchQuotesByCharacter(quotesData, character);
            
            if (matchingQuotes.length === 0) {
              const availableCharacters = getAvailableCharacters(quotesData);
              response = {
                jsonrpc: '2.0',
                id: jsonRequest.id,
                result: {
                  content: [{
                    type: 'text',
                    text: `No quotes found for character "${character}". Available characters: ${availableCharacters.join(', ')}`
                  }]
                }
              };
            } else {
              const quotesText = matchingQuotes
                .map(quote => formatQuoteAsText(quote))
                .join('\n\n');
              
              response = {
                jsonrpc: '2.0',
                id: jsonRequest.id,
                result: {
                  content: [{
                    type: 'text',
                    text: `Quotes from ${character}:\n\n${quotesText}`
                  }]
                }
              };
            }
          } else if (toolName === 'random-quote-tool') {
            const randomQuote = getRandomQuote(quotesData);
            response = {
              jsonrpc: '2.0',
              id: jsonRequest.id,
              result: {
                content: [{
                  type: 'text',
                  text: formatQuoteAsText(randomQuote)
                }]
              }
            };
          } else {
            response = {
              jsonrpc: '2.0',
              id: jsonRequest.id,
              error: {
                code: -32601,
                message: `Unknown tool: ${toolName}`
              }
            };
          }
          break;
          
        default:
          response = {
            jsonrpc: '2.0',
            id: jsonRequest.id,
            error: {
              code: -32601,
              message: `Unknown method: ${jsonRequest.method}`
            }
          };
      }
      
      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, X-API-Key'
        }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error: ' + error.message
        }
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
}; 