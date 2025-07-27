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
    const url = new URL(request.url);
    
    // Log all incoming requests for debugging
    console.log(`${request.method} ${url.pathname} - User-Agent: ${request.headers.get('user-agent')}`);

    // Handle OPTIONS requests for CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-API-Key'
        }
      });
    }

    // Handle discovery endpoints (GET and POST to /register and /.well-known/mcp)
    if ((url.pathname === '/register' || url.pathname === '/.well-known/mcp') && (request.method === 'POST' || request.method === 'GET')) {
      const registerResponse = {
        name: 'quotes-server-cloudflare',
        version: '1.0.0',
        description: 'MCP server running on Cloudflare Workers',
        transport: 'mcp-http',
        endpoints: {
          'POST /': 'MCP protocol requests',
          'POST /mcp': 'MCP protocol requests (alternative path)'
        }
      };
      
      return new Response(JSON.stringify(registerResponse), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // For MCP protocol requests, allow POST to root or /mcp path  
    if ((url.pathname !== '/' && url.pathname !== '/mcp') || request.method !== 'POST') {
      console.log(`404 - Unsupported path or method: ${request.method} ${url.pathname}`);
      return new Response(JSON.stringify({
        error: 'Not found',
        message: `Unsupported path or method: ${request.method} ${url.pathname}`,
        supportedEndpoints: {
          'POST /': 'MCP requests',
          'POST /register': 'Client discovery',
          'OPTIONS /*': 'CORS preflight'
        }
      }), { 
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
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
                .map(quote => formatQuoteAsText(quote, '(served by cloudflare)'))
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
                  text: formatQuoteAsText(randomQuote, '(served by cloudflare)')
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