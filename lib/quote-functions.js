/**
 * Core Quote Functions Library
 * Shared functionality for all Star Trek quote server implementations
 */

/**
 * Search quotes by character name (case-insensitive, partial matching)
 * @param {Array} quotesData - Array of quote objects
 * @param {string} character - Character name to search for
 * @returns {Array} Array of matching quotes
 */
export function searchQuotesByCharacter(quotesData, character) {
  if (!character || character.trim() === '') {
    return [];
  }
  
  return quotesData.filter(quote => 
    quote.by.toLowerCase().includes(character.toLowerCase())
  );
}

/**
 * Get a random quote from the collection
 * @param {Array} quotesData - Array of quote objects
 * @returns {Object} Random quote object
 */
export function getRandomQuote(quotesData) {
  if (!quotesData || quotesData.length === 0) {
    return null;
  }
  
  return quotesData[Math.floor(Math.random() * quotesData.length)];
}

/**
 * Format a single quote as text
 * @param {Object} quote - Quote object with 'quote' and 'by' properties
 * @returns {string} Formatted quote text
 */
export function formatQuoteAsText(quote) {
  return `"${quote.quote}" - ${quote.by}`;
}

/**
 * Format all quotes as numbered text
 * @param {Array} quotesData - Array of quote objects
 * @returns {string} Formatted text with numbered quotes
 */
export function formatQuotesAsText(quotesData) {
  return quotesData
    .map((item, index) => `${index + 1}. "${item.quote}" - ${item.by}`)
    .join('\n\n');
}

/**
 * Get list of unique available characters
 * @param {Array} quotesData - Array of quote objects
 * @returns {Array} Sorted array of unique character names
 */
export function getAvailableCharacters(quotesData) {
  return [...new Set(quotesData.map(q => q.by))].sort();
}

/**
 * Search quotes by content or character (general search)
 * @param {Array} quotesData - Array of quote objects
 * @param {string} searchTerm - Term to search for
 * @returns {Array} Array of matching quotes
 */
export function searchQuotes(quotesData, searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }
  
  const term = searchTerm.toLowerCase();
  return quotesData.filter(quote => 
    quote.quote.toLowerCase().includes(term) ||
    quote.by.toLowerCase().includes(term)
  );
}

/**
 * Validate quote data structure
 * @param {Array} quotesData - Array of quote objects
 * @returns {boolean} True if data is valid
 */
export function validateQuoteData(quotesData) {
  if (!Array.isArray(quotesData)) {
    return false;
  }
  
  return quotesData.every(quote => 
    quote && 
    typeof quote.quote === 'string' && 
    typeof quote.by === 'string' &&
    quote.quote.length > 0 && 
    quote.by.length > 0
  );
}

/**
 * Get quote statistics
 * @param {Array} quotesData - Array of quote objects
 * @returns {Object} Statistics about the quote collection
 */
export function getQuoteStats(quotesData) {
  const characters = getAvailableCharacters(quotesData);
  const characterCounts = {};
  
  quotesData.forEach(quote => {
    characterCounts[quote.by] = (characterCounts[quote.by] || 0) + 1;
  });
  
  return {
    totalQuotes: quotesData.length,
    uniqueCharacters: characters.length,
    characters: characters,
    characterCounts: characterCounts,
    mostQuotedCharacter: Object.entries(characterCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null
  };
} 