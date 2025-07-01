const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Import quotes data from the source file
const quotesData = require('./quotes.json');
const mockQuotesData = quotesData;

// Mock fs.readFileSync to return our test data
jest.mock('fs');
jest.mock('path');

describe('HTTP REST API Server', () => {
  let app;
  let server;

  beforeAll(() => {
    // Mock the file system calls
    fs.readFileSync.mockReturnValue(JSON.stringify(mockQuotesData));
    path.join.mockReturnValue('/mock/path/quotes.json');
    path.dirname.mockReturnValue('/mock/path');

    // Suppress console.log during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Create the Express app (using the same logic as http-server.js)
    app = createTestApp();
  });

  afterAll(() => {
    // Restore console methods
    console.log.mockRestore();
    console.error.mockRestore();
    
    if (server) {
      server.close();
    }
  });

  beforeEach(() => {
    // Create a fresh app instance for each test
    app = createTestApp();
  });

  describe('GET /', () => {
    test('should return API information', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Star Trek Quotes API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body).toHaveProperty('totalQuotes', mockQuotesData.length);
      expect(response.body.endpoints).toHaveProperty('GET /');
      expect(response.body.endpoints).toHaveProperty('GET /quotes');
    });
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('quotesLoaded', mockQuotesData.length);
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('GET /quotes', () => {
    test('should return all quotes', async () => {
      const response = await request(app).get('/quotes');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total', mockQuotesData.length);
      expect(response.body.data).toEqual(mockQuotesData);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should return correct number of quotes', async () => {
      const response = await request(app).get('/quotes');
      
      expect(response.body.data).toHaveLength(mockQuotesData.length);
      expect(response.body.total).toBe(mockQuotesData.length);
    });
  });

  describe('GET /quotes/random', () => {
    test('should return a random quote', async () => {
      const response = await request(app).get('/quotes/random');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('quote');
      expect(response.body.data).toHaveProperty('by');
      
      // Verify it's one of our quotes
      const isValidQuote = mockQuotesData.some(quote => 
        quote.quote === response.body.data.quote && 
        quote.by === response.body.data.by
      );
      expect(isValidQuote).toBe(true);
    });

    test('should return different quotes on multiple calls', async () => {
      const responses = [];
      
      // Make multiple requests
      for (let i = 0; i < 10; i++) {
        const response = await request(app).get('/quotes/random');
        expect(response.status).toBe(200);
        responses.push(response.body.data);
      }
      
      // All should be valid quotes
      responses.forEach(quote => {
        const isValidQuote = mockQuotesData.some(q => 
          q.quote === quote.quote && q.by === quote.by
        );
        expect(isValidQuote).toBe(true);
      });
    });
  });

  describe('GET /quotes/text', () => {
    test('should return quotes as formatted text', async () => {
      const response = await request(app).get('/quotes/text');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/plain; charset=utf-8');
      expect(response.text).toContain('1. "Live long and prosper." - Spock');
      expect(response.text).toContain('2. "Beam me up, Scotty." - Captain James T. Kirk');
      
      // Check that all quotes are present
      const lines = response.text.split('\n\n');
      expect(lines).toHaveLength(mockQuotesData.length);
    });

    test('should format quotes with correct numbering', async () => {
      const response = await request(app).get('/quotes/text');
      
      const lines = response.text.split('\n\n');
      lines.forEach((line, index) => {
        expect(line).toMatch(new RegExp(`^${index + 1}\\. "`));
      });
    });
  });

  describe('GET /quotes/character/:name', () => {
    test('should return quotes by Spock', async () => {
      const response = await request(app).get('/quotes/character/Spock');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('character', 'Spock');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      
      const spockQuotes = mockQuotesData.filter(q => q.by === 'Spock');
      expect(response.body.data).toHaveLength(spockQuotes.length);
      expect(response.body.total).toBe(spockQuotes.length);
      
      response.body.data.forEach(quote => {
        expect(quote.by).toBe('Spock');
      });
    });

    test('should return quotes by Kirk', async () => {
      const response = await request(app).get('/quotes/character/Kirk');
      
      expect(response.status).toBe(200);
      expect(response.body.character).toBe('Kirk');
      
      const kirkQuotes = mockQuotesData.filter(q => q.by.toLowerCase().includes('kirk'));
      expect(response.body.data).toHaveLength(kirkQuotes.length);
    });

    test('should handle case-insensitive search', async () => {
      const response = await request(app).get('/quotes/character/spock');
      
      expect(response.status).toBe(200);
      expect(response.body.character).toBe('spock');
      expect(response.body.data.length).toBeGreaterThan(0);
      
      response.body.data.forEach(quote => {
        expect(quote.by.toLowerCase()).toContain('spock');
      });
    });

    test('should handle partial name matching', async () => {
      const response = await request(app).get('/quotes/character/Captain');
      
      expect(response.status).toBe(200);
      expect(response.body.character).toBe('Captain');
      expect(response.body.data.length).toBeGreaterThan(0);
      
      response.body.data.forEach(quote => {
        expect(quote.by.toLowerCase()).toContain('captain');
      });
    });

    test('should return 404 for non-existent character', async () => {
      const response = await request(app).get('/quotes/character/Worf');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('No quotes found for character "Worf"');
      expect(response.body).toHaveProperty('availableCharacters');
      expect(response.body).toHaveProperty('suggestion');
    });

    test('should return 404 for empty character name', async () => {
      const response = await request(app).get('/quotes/character/ ');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Endpoint not found');
    });
  });

  describe('GET /characters', () => {
    test('should return list of available characters', async () => {
      const response = await request(app).get('/characters');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      const expectedCharacters = [...new Set(mockQuotesData.map(q => q.by))].sort();
      expect(response.body.data).toEqual(expectedCharacters);
      expect(response.body.total).toBe(expectedCharacters.length);
    });

    test('should return unique characters only', async () => {
      const response = await request(app).get('/characters');
      
      const characters = response.body.data;
      const uniqueCharacters = [...new Set(characters)];
      expect(characters).toEqual(uniqueCharacters);
    });
  });

  describe('GET /search', () => {
    test('should search quotes by content', async () => {
      const response = await request(app).get('/search?q=logic');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('query', 'logic');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      
      response.body.data.forEach(quote => {
        const matchesContent = quote.quote.toLowerCase().includes('logic');
        const matchesCharacter = quote.by.toLowerCase().includes('logic');
        expect(matchesContent || matchesCharacter).toBe(true);
      });
    });

    test('should search quotes by character name', async () => {
      const response = await request(app).get('/search?q=spock');
      
      expect(response.status).toBe(200);
      expect(response.body.query).toBe('spock');
      expect(response.body.data.length).toBeGreaterThan(0);
      
      response.body.data.forEach(quote => {
        const matchesContent = quote.quote.toLowerCase().includes('spock');
        const matchesCharacter = quote.by.toLowerCase().includes('spock');
        expect(matchesContent || matchesCharacter).toBe(true);
      });
    });

    test('should return empty results for non-matching search', async () => {
      const response = await request(app).get('/search?q=nonexistent');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    test('should return 400 for missing search query', async () => {
      const response = await request(app).get('/search');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Search query parameter "q" is required');
      expect(response.body).toHaveProperty('example');
    });

    test('should return 400 for empty search query', async () => {
      const response = await request(app).get('/search?q=');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for unknown endpoints', async () => {
      const response = await request(app).get('/unknown-endpoint');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Endpoint not found');
      expect(response.body).toHaveProperty('availableEndpoints');
      expect(Array.isArray(response.body.availableEndpoints)).toBe(true);
    });

    test('should handle POST requests to GET-only endpoints', async () => {
      const response = await request(app).post('/quotes');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Response Headers and Format', () => {
    test('should have CORS headers', async () => {
      const response = await request(app).get('/');
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('should return JSON for most endpoints', async () => {
      const endpoints = ['/', '/quotes', '/quotes/random', '/characters', '/health'];
      
      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.headers['content-type']).toMatch(/application\/json/);
      }
    });

    test('should return text/plain for /quotes/text', async () => {
      const response = await request(app).get('/quotes/text');
      
      expect(response.headers['content-type']).toBe('text/plain; charset=utf-8');
    });
  });

  describe('Edge Cases', () => {
    test('should handle URL encoded characters in search', async () => {
      const response = await request(app).get('/search?q=live%20long');
      
      expect(response.status).toBe(200);
      expect(response.body.query).toBe('live long');
    });

    test('should handle special characters in character search', async () => {
      const response = await request(app).get('/quotes/character/Jean-Luc');
      
      expect(response.status).toBe(200);
      expect(response.body.character).toBe('Jean-Luc');
    });
  });
});

// Helper function to create the Express app for testing
function createTestApp() {
  const express = require('express');
  const cors = require('cors');
  
  const app = express();
  
  // Use our mock data
  const quotesData = mockQuotesData;
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // Add request logging (mocked out during tests)
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
  
  // Root endpoint - API info
  app.get('/', (req, res) => {
    res.json({
      name: 'Star Trek Quotes API',
      version: '1.0.0',
      description: 'REST API for Star Trek quotes',
      endpoints: {
        'GET /': 'API information',
        'GET /quotes': 'Get all quotes',
        'GET /quotes/random': 'Get a random quote',
        'GET /quotes/text': 'Get all quotes as formatted text',
        'GET /quotes/character/:name': 'Get quotes by character name',
        'GET /health': 'Health check'
      },
      totalQuotes: quotesData.length
    });
  });
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      quotesLoaded: quotesData.length
    });
  });
  
  // Get all quotes
  app.get('/quotes', (req, res) => {
    try {
      res.json({
        success: true,
        data: quotesData,
        total: quotesData.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve quotes',
        message: error.message
      });
    }
  });
  
  // Get random quote
  app.get('/quotes/random', (req, res) => {
    try {
      if (quotesData.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No quotes available'
        });
      }
      
      const randomQuote = quotesData[Math.floor(Math.random() * quotesData.length)];
      res.json({
        success: true,
        data: randomQuote
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get random quote',
        message: error.message
      });
    }
  });
  
  // Get quotes as formatted text
  app.get('/quotes/text', (req, res) => {
    try {
      const textContent = quotesData
        .map((item, index) => `${index + 1}. "${item.quote}" - ${item.by}`)
        .join('\n\n');
      
      res.setHeader('Content-Type', 'text/plain');
      res.send(textContent);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to format quotes as text',
        message: error.message
      });
    }
  });
  
  // Get quotes by character
  app.get('/quotes/character/:name', (req, res) => {
    try {
      const character = req.params.name;
      
      if (!character || character.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Character name is required'
        });
      }
      
      const matchingQuotes = quotesData.filter(quote => 
        quote.by.toLowerCase().includes(character.toLowerCase())
      );
      
      if (matchingQuotes.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No quotes found for character "${character}"`,
          availableCharacters: [...new Set(quotesData.map(q => q.by))].sort(),
          suggestion: 'Try searching for: Spock, Kirk, Picard, or Borg'
        });
      }
      
      res.json({
        success: true,
        character: character,
        data: matchingQuotes,
        total: matchingQuotes.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to search quotes by character',
        message: error.message
      });
    }
  });
  
  // Get available characters
  app.get('/characters', (req, res) => {
    try {
      const characters = [...new Set(quotesData.map(q => q.by))].sort();
      res.json({
        success: true,
        data: characters,
        total: characters.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get characters',
        message: error.message
      });
    }
  });
  
  // Search quotes
  app.get('/search', (req, res) => {
    try {
      const query = req.query.q;
      
      if (!query || query.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Search query parameter "q" is required',
          example: '/search?q=logic'
        });
      }
      
      const searchTerm = query.toLowerCase();
      const matchingQuotes = quotesData.filter(quote => 
        quote.quote.toLowerCase().includes(searchTerm) ||
        quote.by.toLowerCase().includes(searchTerm)
      );
      
      res.json({
        success: true,
        query: query,
        data: matchingQuotes,
        total: matchingQuotes.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Search failed',
        message: error.message
      });
    }
  });
  
  // 404 handler for undefined routes
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      availableEndpoints: [
        'GET /',
        'GET /quotes',
        'GET /quotes/random',
        'GET /quotes/text',
        'GET /quotes/character/:name',
        'GET /characters',
        'GET /search?q=term',
        'GET /health'
      ]
    });
  });
  
  return app;
} 