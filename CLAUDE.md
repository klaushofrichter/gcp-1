# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Testing
```bash
# Run all tests (79 tests across all implementations)
npm test

# Run specific test suites
npm run test:core          # Local server implementations (64 tests)
npm run test:mcp           # MCP stdio server (20 tests)
npm run test:http          # REST API server (17 tests)  
npm run test:mcp-http      # MCP HTTP server (27 tests)
npm run test:cloudflare    # Cloudflare Workers (15 tests) - requires .env
npm run test:local         # All local tests without Cloudflare

# Development testing
npm run test:watch         # Watch mode for core tests
npm run test:coverage      # Coverage reporting
```

### Running Servers
```bash
# MCP Servers
npm start                  # MCP stdio server (for local clients like Cursor)
npm run start:mcp-http     # MCP HTTP server (for remote clients)
npm run start:sse          # MCP SSE server

# Other servers
npm run start:http         # REST API server
npm run start:proxy        # Proxy server (for API key authentication)

# Cloudflare Workers
npm run worker:dev         # Local development with Wrangler
npm run worker:deploy      # Deploy to Cloudflare Workers
```

### Linting and Validation
```bash
npm run lint               # ESLint code checking
```

## Architecture Overview

This is an MCP (Model Context Protocol) quotes server with a **shared library architecture** that eliminates code duplication across multiple server implementations.

### Core Architecture Components

#### Shared Libraries (`lib/`)
- **`lib/quote-functions.js`** - Core business logic (search, format, validate)
- **`lib/mcp-resources.js`** - MCP protocol definitions (resources, tools, metadata)  
- **`lib/rest-api-helpers.js`** - REST API response handlers
- **`lib/test-helpers.js`** - Testing utilities and shared test data

#### Server Implementations
- **`server.js`** - MCP stdio server (44 lines, local clients)
- **`mcp-server-http.js`** - MCP HTTP server (244 lines, remote clients)
- **`http-server.js`** - REST API server (187 lines, web apps)
- **`worker.js`** - Cloudflare Workers MCP server (269 lines, global edge)
- **`proxy-server.js`** - Local proxy for API key authentication

### Key Benefits of This Architecture
- **DRY Principle**: Single source of truth for all business logic
- **Consistent Behavior**: All servers use identical shared functions
- **Centralized Bug Fixes**: Fix once, fixes everywhere
- **90%+ Bundle Size Reduction**: Cloudflare Workers optimized from 531KB to 9.18KB

## Data and Configuration

### Primary Data Source
- **`quotes.json`** - Single source of truth containing 8 Star Trek quotes
- All servers import/use this same data file

### MCP Resources Available
- `quotes://all` - Complete quote collection as JSON
- `quotes://random` - Single random quote as JSON  
- `quotes://text` - All quotes formatted as readable text

### MCP Tools Available
- `get-quote-by-character` - Search quotes by Star Trek character name
- `random-quote-tool` - Generate random quote in text format

## Environment Configuration

### Required for Cloudflare/Proxy Testing
```bash
# Copy example and configure
cp .env.example .env

# Required variables:
QUOTES_MCP_API_KEY=your_api_key_here
REMOTE_MCP_URL=your_worker_url_here
```

## Testing Strategy

The project has 79 comprehensive tests designed around the shared library architecture:
- **Core Tests (64)**: Test shared libraries and local implementations
- **Cloudflare Tests (15)**: Test edge deployment and API key authentication
- **Integration Tests**: Validate transport-specific functionality

When adding new features:
1. Add core logic to appropriate `lib/` file
2. Add tests for the shared function
3. Test integration across all server types

## Development Workflow

### Adding New Quotes
1. Edit `quotes.json` with new quote objects (`quote` and `by` properties)
2. Run `npm test` to ensure all servers work correctly
3. Deploy to Cloudflare if needed: `npm run worker:deploy`

### Adding New Features
1. Add core logic to appropriate shared library in `lib/`
2. Update server implementations as thin wrappers
3. Add tests covering the shared functionality
4. Test across all server implementations

### Common Development Tasks

#### Working with MCP Protocol
- All MCP functionality is centralized in `lib/mcp-resources.js`
- Resources and tools are defined once, used by both stdio and HTTP MCP servers
- Session management is handled in `mcp-server-http.js` for HTTP transport

#### REST API Development  
- All endpoint logic is in `lib/rest-api-helpers.js`
- HTTP server (`http-server.js`) is a thin wrapper around these handlers
- Consistent error handling and response formatting

#### Cloudflare Workers Optimization
- Uses direct imports from `quotes.json` and `lib/quote-functions.js`
- No duplication of data or logic
- Optimized bundle size for edge performance

## Project Structure Key Points

- **`lib/`** directory contains all shared business logic
- Server files are thin wrappers providing different transports
- **`quotes.json`** is the single source of truth for data
- Tests validate both shared libraries and integration points
- Configuration supports local development and production deployment

## Important Notes for Development

- Always run tests after changes: `npm test`
- Shared libraries eliminate the need to modify multiple files for the same feature
- API key authentication is required for Cloudflare deployment
- Local proxy server solves API key limitations in MCP clients like Cursor