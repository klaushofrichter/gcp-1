import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  getApiInfo,
  getHealthCheck,
  handleGetAllQuotes,
  handleGetRandomQuote,
  handleGetQuotesText,
  handleGetQuotesByCharacter,
  handleGetCharacters,
  handleSearchQuotes,
  handle404NotFound,
  handleError
} from './lib/rest-api-helpers.js';

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

// Root endpoint - API info using shared helper
app.get('/', (req, res) => {
  try {
    const apiInfo = getApiInfo(quotesData);
    res.json(apiInfo);
  } catch (error) {
    const errorResponse = handleError('Failed to get API information', error);
    res.status(errorResponse.status).json(errorResponse);
  }
});

// Health check endpoint using shared helper
app.get('/health', (req, res) => {
  try {
    const healthInfo = getHealthCheck(quotesData);
    res.json(healthInfo);
  } catch (error) {
    const errorResponse = handleError('Health check failed', error);
    res.status(errorResponse.status).json(errorResponse);
  }
});

// Get all quotes using shared helper
app.get('/quotes', (req, res) => {
  try {
    const result = handleGetAllQuotes(quotesData);
    res.json(result);
  } catch (error) {
    const errorResponse = handleError('Failed to retrieve quotes', error);
    res.status(errorResponse.status).json(errorResponse);
  }
});

// Get random quote using shared helper
app.get('/quotes/random', (req, res) => {
  try {
    const result = handleGetRandomQuote(quotesData);
    if (result.status) {
      return res.status(result.status).json(result);
    }
    res.json(result);
  } catch (error) {
    const errorResponse = handleError('Failed to get random quote', error);
    res.status(errorResponse.status).json(errorResponse);
  }
});

// Get quotes as formatted text using shared helper
app.get('/quotes/text', (req, res) => {
  try {
    const textContent = handleGetQuotesText(quotesData);
    res.setHeader('Content-Type', 'text/plain');
    res.send(textContent);
  } catch (error) {
    const errorResponse = handleError('Failed to format quotes as text', error);
    res.status(errorResponse.status).json(errorResponse);
  }
});

// Get quotes by character using shared helper
app.get('/quotes/character/:name', (req, res) => {
  try {
    const result = handleGetQuotesByCharacter(quotesData, req.params.name);
    if (result.status) {
      return res.status(result.status).json(result);
    }
    res.json(result);
  } catch (error) {
    const errorResponse = handleError('Failed to search quotes by character', error);
    res.status(errorResponse.status).json(errorResponse);
  }
});

// Get available characters using shared helper
app.get('/characters', (req, res) => {
  try {
    const result = handleGetCharacters(quotesData);
    res.json(result);
  } catch (error) {
    const errorResponse = handleError('Failed to get characters', error);
    res.status(errorResponse.status).json(errorResponse);
  }
});

// Search quotes using shared helper
app.get('/search', (req, res) => {
  try {
    const result = handleSearchQuotes(quotesData, req.query.q);
    if (result.status) {
      return res.status(result.status).json(result);
    }
    res.json(result);
  } catch (error) {
    const errorResponse = handleError('Search failed', error);
    res.status(errorResponse.status).json(errorResponse);
  }
});

// 404 handler using shared helper
app.use('*', (req, res) => {
  const result = handle404NotFound();
  res.status(result.status).json(result);
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