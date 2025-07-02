/**
 * Test Helpers Library
 * Shared functionality for testing Star Trek quote server implementations
 */

import quotesData from '../quotes.json' assert { type: 'json' };

/**
 * Mock quotes data for testing (using actual quotes data)
 */
export const mockQuotesData = quotesData;

/**
 * Create test handlers for MCP resource functions
 */
export function createTestHandlers(testQuotesData = mockQuotesData) {
  return {
    getAllQuotesHandler: () => ({
      contents: [{
        uri: 'quotes://all',
        mimeType: 'application/json',
        text: JSON.stringify(testQuotesData, null, 2),
      }]
    }),

    getRandomQuoteHandler: () => {
      const randomQuote = testQuotesData[Math.floor(Math.random() * testQuotesData.length)];
      return {
        contents: [{
          uri: 'quotes://random',
          mimeType: 'application/json',
          text: JSON.stringify(randomQuote, null, 2),
        }]
      };
    },

    getQuotesTextHandler: () => {
      const textContent = testQuotesData
        .map((item, index) => `${index + 1}. "${item.quote}" - ${item.by}`)
        .join('\n\n');
      
      return {
        contents: [{
          uri: 'quotes://text',
          mimeType: 'text/plain',
          text: textContent,
        }]
      };
    },

    getQuoteByCharacterHandler: ({ character }) => {
      const matchingQuotes = testQuotesData.filter(quote => 
        quote.by.toLowerCase().includes(character.toLowerCase())
      );
      
      if (matchingQuotes.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `No quotes found for character "${character}". Available characters: ${testQuotesData.map(q => q.by).join(', ')}`
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
    },

    getRandomQuoteToolHandler: () => {
      const randomQuote = testQuotesData[Math.floor(Math.random() * testQuotesData.length)];
      return {
        content: [{
          type: 'text',
          text: `"${randomQuote.quote}" - ${randomQuote.by}`
        }]
      };
    }
  };
}

/**
 * Common test expectations for quote data validation
 */
export function validateQuoteStructure(quote) {
  expect(quote).toHaveProperty('quote');
  expect(quote).toHaveProperty('by');
  expect(typeof quote.quote).toBe('string');
  expect(typeof quote.by).toBe('string');
  expect(quote.quote.length).toBeGreaterThan(0);
  expect(quote.by.length).toBeGreaterThan(0);
}

/**
 * Validate that quotes array contains expected characters
 */
export function validateExpectedCharacters(quotesData) {
  const characters = quotesData.map(q => q.by);
  expect(characters).toContain('Spock');
  expect(characters).toContain('Captain James T. Kirk');
  expect(characters).toContain('The Borg');
  expect(characters).toContain('Captain Jean-Luc Picard');
  
  // Should have multiple quotes from Spock
  const spockQuotes = quotesData.filter(q => q.by === 'Spock');
  expect(spockQuotes.length).toBeGreaterThanOrEqual(2);
}

/**
 * Test that a quote is from our known dataset
 */
export function validateKnownQuote(text, quotesData = mockQuotesData) {
  const isKnownQuote = quotesData.some(quote => 
    text.includes(quote.quote) && text.includes(quote.by)
  );
  expect(isKnownQuote).toBe(true);
}

/**
 * Test randomness by checking for variety in multiple calls
 */
export function testRandomness(handlerFunction, iterations = 15, quotesData = mockQuotesData) {
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    const result = handlerFunction();
    results.push(result);
  }
  
  // All results should be valid
  results.forEach(result => {
    expect(result).toBeDefined();
  });
  
  return results;
}

/**
 * Common character search test cases
 */
export const characterSearchTests = [
  {
    character: 'Spock',
    expectedQuotes: ['Live long and prosper.', 'I have been, and always shall be, your friend.', 'Logic is the beginning of wisdom, not the end.']
  },
  {
    character: 'Kirk',
    expectedQuotes: ['Beam me up, Scotty.']
  },
  {
    character: 'Picard',
    expectedQuotes: ['Make it so.']
  },
  {
    character: 'Captain',
    expectedQuotes: ['Beam me up, Scotty.', 'Make it so.'] // Partial matching
  },
  {
    character: 'spock', // Case insensitive
    expectedQuotes: ['Live long and prosper.']
  },
  {
    character: 'Worf', // Not found
    expectedQuotes: []
  }
];

/**
 * Common response header tests
 */
export function validateResponseHeaders(response, expectedContentType = 'application/json') {
  expect(response.headers).toBeDefined();
  
  if (expectedContentType) {
    const contentType = response.headers['content-type'] || response.headers.get?.('content-type');
    if (expectedContentType === 'application/json') {
      expect(contentType).toMatch(/application\/json/);
    } else {
      expect(contentType).toBe(expectedContentType);
    }
  }
}

/**
 * Common CORS header validation
 */
export function validateCORSHeaders(response) {
  const getCORSHeader = (name) => {
    // Handle both Express response.headers and fetch Response.headers
    return response.headers[name.toLowerCase()] || 
           response.headers.get?.(name) ||
           response.headers[name];
  };
  
  expect(getCORSHeader('Access-Control-Allow-Origin')).toBeDefined();
}

/**
 * Test data integrity checks
 */
export function validateDataIntegrity(quotesData = mockQuotesData) {
  // Should have the expected number of quotes
  expect(quotesData).toHaveLength(8);
  
  // All quotes should have required properties
  quotesData.forEach((quote, index) => {
    validateQuoteStructure(quote);
  });
  
  // Should have unique quotes
  const quotes = quotesData.map(q => q.quote);
  const uniqueQuotes = new Set(quotes);
  expect(uniqueQuotes.size).toBe(quotes.length);
  
  // Should have expected characters
  validateExpectedCharacters(quotesData);
}

/**
 * Common server health check validation
 */
export function validateHealthCheck(healthData, expectedQuoteCount = 8) {
  expect(healthData).toHaveProperty('status', 'healthy');
  expect(healthData).toHaveProperty('timestamp');
  expect(healthData).toHaveProperty('quotesLoaded', expectedQuoteCount);
  expect(new Date(healthData.timestamp)).toBeInstanceOf(Date);
}

/**
 * Common API info validation
 */
export function validateApiInfo(apiData, expectedQuoteCount = 8) {
  expect(apiData).toHaveProperty('name');
  expect(apiData).toHaveProperty('version');
  expect(apiData).toHaveProperty('totalQuotes', expectedQuoteCount);
  expect(apiData).toHaveProperty('endpoints');
  expect(typeof apiData.endpoints).toBe('object');
} 