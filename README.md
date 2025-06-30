# MCP Quotes Server

A Model Context Protocol (MCP) server that serves Star Trek quotes from a JSON file.

## Features

This MCP server provides access to quotes through three different resources:

- **All Quotes** (`quotes://all`) - Returns the complete collection of quotes as JSON
- **Random Quote** (`quotes://random`) - Returns a single random quote as JSON  
- **All Quotes as Text** (`quotes://text`) - Returns all quotes formatted as readable text

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

### Running the Server

Start the MCP server:
```bash
npm start
```

Or directly with Node.js:
```bash
node server.js
```

### Available Resources

The server exposes three resources:

1. **quotes://all** - Complete JSON collection
2. **quotes://random** - Single random quote in JSON format
3. **quotes://text** - All quotes as formatted text

### Example Resource Content

**Random Quote (JSON format):**
```json
{
  "quote": "Live long and prosper.",
  "by": "Spock"
}
```

**Text Format:**
```
1. "Live long and prosper." - Spock

2. "Space: the final frontier." - Captain James T. Kirk

3. "Resistance is futile." - The Borg
```

## MCP Client Integration

To use this server with an MCP client, you'll need to configure the client to connect to this server. The server uses stdio transport and can be integrated into MCP-compatible applications.

## File Structure

- `server.js` - Main MCP server implementation
- `quotes.json` - Quote data source
- `package.json` - Node.js dependencies and scripts

## Dependencies

- `@modelcontextprotocol/sdk` v1.13.2 - MCP SDK for Node.js

## Modern API

This server uses the latest MCP SDK (v1.13.2) with the modern `McpServer` API, which provides a cleaner and more streamlined way to register resources without manual schema definitions.
