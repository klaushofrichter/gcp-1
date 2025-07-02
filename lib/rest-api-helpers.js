/**
 * REST API Helpers Library
 * Shared functionality for REST API endpoints across HTTP server implementations
 */

import { 
  getRandomQuote, 
  formatQuotesAsText, 
  searchQuotesByCharacter, 
  searchQuotes,
  getAvailableCharacters 
} from './quote-functions.js';

/**
 * Get API information response
 * @param {Array} quotesData - Array of quote objects
 * @param {Object} serverInfo - Server-specific information
 * @returns {Object} API information object
 */
export function getApiInfo(quotesData, serverInfo = {}) {
  const defaultInfo = {
    name: 'Star Trek Quotes API',
    version: '1.0.0',
    description: 'REST API for Star Trek quotes',
    endpoints: {
      'GET /': 'API information',
      'GET /quotes': 'Get all quotes',
      'GET /quotes/random': 'Get a random quote',
      'GET /quotes/text': 'Get all quotes as formatted text',
      'GET /quotes/character/:name': 'Get quotes by character name',
      'GET /characters': 'Get available characters',
      'GET /search?q=term': 'Search quotes by content or character',
      'GET /health': 'Health check'
    }
  };

  return {
    ...defaultInfo,
    ...serverInfo,
    totalQuotes: quotesData.length,
    endpoints: { ...defaultInfo.endpoints, ...serverInfo.endpoints }
  };
}

/**
 * Get health check response
 * @param {Array} quotesData - Array of quote objects
 * @param {Object} additionalInfo - Additional health information
 * @returns {Object} Health check object
 */
export function getHealthCheck(quotesData, additionalInfo = {}) {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    quotesLoaded: quotesData.length,
    ...additionalInfo
  };
}

/**
 * Handle get all quotes request
 * @param {Array} quotesData - Array of quote objects
 * @returns {Object} Success response with all quotes
 */
export function handleGetAllQuotes(quotesData) {
  return {
    success: true,
    data: quotesData,
    total: quotesData.length
  };
}

/**
 * Handle get random quote request
 * @param {Array} quotesData - Array of quote objects
 * @returns {Object} Success response with random quote or error
 */
export function handleGetRandomQuote(quotesData) {
  if (quotesData.length === 0) {
    return {
      success: false,
      error: 'No quotes available',
      status: 404
    };
  }
  
  const randomQuote = getRandomQuote(quotesData);
  return {
    success: true,
    data: randomQuote
  };
}

/**
 * Handle get quotes as text request
 * @param {Array} quotesData - Array of quote objects
 * @returns {string} Formatted text content
 */
export function handleGetQuotesText(quotesData) {
  return formatQuotesAsText(quotesData);
}

/**
 * Handle get quotes by character request
 * @param {Array} quotesData - Array of quote objects
 * @param {string} character - Character name to search for
 * @returns {Object} Success response with matching quotes or error
 */
export function handleGetQuotesByCharacter(quotesData, character) {
  if (!character || character.trim() === '') {
    return {
      success: false,
      error: 'Character name is required',
      status: 400
    };
  }
  
  const matchingQuotes = searchQuotesByCharacter(quotesData, character);
  
  if (matchingQuotes.length === 0) {
    const availableCharacters = getAvailableCharacters(quotesData);
    return {
      success: false,
      error: `No quotes found for character "${character}"`,
      availableCharacters: availableCharacters,
      suggestion: 'Try searching for: Spock, Kirk, Picard, or Borg',
      status: 404
    };
  }
  
  return {
    success: true,
    character: character,
    data: matchingQuotes,
    total: matchingQuotes.length
  };
}

/**
 * Handle get available characters request
 * @param {Array} quotesData - Array of quote objects
 * @returns {Object} Success response with character list
 */
export function handleGetCharacters(quotesData) {
  const characters = getAvailableCharacters(quotesData);
  return {
    success: true,
    data: characters,
    total: characters.length
  };
}

/**
 * Handle search quotes request
 * @param {Array} quotesData - Array of quote objects
 * @param {string} query - Search query
 * @returns {Object} Success response with search results or error
 */
export function handleSearchQuotes(quotesData, query) {
  if (!query || query.trim() === '') {
    return {
      success: false,
      error: 'Search query parameter "q" is required',
      example: '/search?q=logic',
      status: 400
    };
  }
  
  const matchingQuotes = searchQuotes(quotesData, query);
  
  return {
    success: true,
    query: query,
    data: matchingQuotes,
    total: matchingQuotes.length
  };
}

/**
 * Handle 404 not found response
 * @param {Array} availableEndpoints - List of available endpoints
 * @returns {Object} Error response for unknown endpoints
 */
export function handle404NotFound(availableEndpoints = []) {
  const defaultEndpoints = [
    'GET /',
    'GET /quotes',
    'GET /quotes/random',
    'GET /quotes/text',
    'GET /quotes/character/:name',
    'GET /characters',
    'GET /search?q=term',
    'GET /health'
  ];
  
  return {
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: availableEndpoints.length > 0 ? availableEndpoints : defaultEndpoints,
    status: 404
  };
}

/**
 * Handle generic error response
 * @param {string} message - Error message
 * @param {Error} error - Original error object
 * @param {number} status - HTTP status code
 * @returns {Object} Error response
 */
export function handleError(message, error, status = 500) {
  return {
    success: false,
    error: message,
    message: error?.message || 'An unexpected error occurred',
    status: status
  };
} 