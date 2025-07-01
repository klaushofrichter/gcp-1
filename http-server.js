import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Load quotes data
let quotesData;
try {
  const quotesPath = path.join(__dirname, 'quotes.json');
  quotesData = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));
  console.log(`Loaded ${quotesData.length} quotes from quotes.json`);
} catch (error) {
  console.error('Error loading quotes.json:', error);
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Add request logging
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

// Get all quotes (equivalent to quotes://all resource)
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

// Get random quote (equivalent to quotes://random resource)
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

// Get quotes as formatted text (equivalent to quotes://text resource)
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

// Get quotes by character (equivalent to get-quote-by-character tool)
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

// Search quotes (bonus endpoint)
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

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(port, () => {
  console.log('🚀 Star Trek Quotes REST API Server');
  console.log(`🌐 Server running at: http://localhost:${port}`);
  console.log(`📊 Loaded ${quotesData.length} quotes`);
  console.log('🖖 Live long and prosper!');
  console.log('\n📝 Available endpoints:');
  console.log('  GET /                     - API information');
  console.log('  GET /quotes               - All quotes');
  console.log('  GET /quotes/random        - Random quote');
  console.log('  GET /quotes/text          - Formatted text');
  console.log('  GET /quotes/character/:name - Quotes by character');
  console.log('  GET /characters           - Available characters');
  console.log('  GET /search?q=term        - Search quotes');
  console.log('  GET /health               - Health check');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
}); 