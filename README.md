# MCP Quotes Server 🖖

A comprehensive Model Context Protocol (MCP) server that provides Star Trek quotes through resources and tools. Built with the modern MCP SDK v1.13.2, this server demonstrates how to create and deploy MCP resources for AI assistants.

## 🚀 Features

### Resources (3 available)
- **📚 All Quotes** (`quotes://all`) - Complete collection of quotes as JSON
- **🎲 Random Quote** (`quotes://random`) - Single random quote as JSON  
- **📝 Text Format** (`quotes://text`) - All quotes formatted as readable text

### Tools (2 available)
- **🔍 Get Quote by Character** - Search quotes by Star Trek character name
- **🎯 Random Quote Tool** - Generate a random quote in text format

### Data Features
- 6 iconic Star Trek quotes from beloved characters
- Case-insensitive character search
- Partial name matching support
- Comprehensive error handling

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)
- MCP-compatible client (Cursor or Claude Desktop)

## 🛠️ Installation

### 1. Clone or Download
```bash
# If using git
git clone <repository-url>
cd mcp-quotes-server

# Or download and extract the files to a directory
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Installation
```bash
# Test the server
npm test

# Start the server (for testing)
npm start
```

## ⚙️ MCP Client Configuration

### 🎯 Cursor IDE

1. **Open Cursor Settings**
   - Press `Cmd/Ctrl + ,` to open settings
   - Search for "MCP" or navigate to Extensions → MCP

2. **Add MCP Server Configuration**
   Add this configuration to your Cursor MCP settings:

   ```json
   {
     "mcpServers": {
       "quotes-server": {
         "command": "npm",
         "args": ["start"],
         "cwd": "/Users/klaushofrichter/Development/mcp-1",
         "env": {}
       }
     }
   }
   ```

3. **Restart Cursor**
   - Restart Cursor IDE to load the MCP server
   - The quotes server will be available in your AI chat

### 🤖 Claude Desktop

1. **Locate Claude Desktop Config**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add Server Configuration**
   Edit or create the config file:

   ```json
   {
     "mcpServers": {
       "quotes-server": {
         "command": "npm",
         "args": ["start"],
         "cwd": "/Users/klaushofrichter/Development/mcp-1"
       }
     }
   }
   ```

   **Important**: Update the `cwd` path to match your actual installation directory.

3. **Restart Claude Desktop**
   - Completely quit and restart Claude Desktop
   - The server will be loaded automatically



## 📖 API Documentation

### Resources

#### 1. All Quotes (`quotes://all`)
Returns the complete collection of quotes as JSON.

**Response Format:**
```json
[
  {
    "quote": "Live long and prosper.",
    "by": "Spock"
  },
  {
    "quote": "Space: the final frontier.",
    "by": "Captain James T. Kirk"
  }
]
```

#### 2. Random Quote (`quotes://random`)
Returns a single random quote as JSON.

**Response Format:**
```json
{
  "quote": "Make it so.",
  "by": "Captain Jean-Luc Picard"
}
```

#### 3. Text Format (`quotes://text`)
Returns all quotes formatted as readable text.

**Response Format:**
```
1. "Live long and prosper." - Spock

2. "Space: the final frontier." - Captain James T. Kirk

3. "Resistance is futile." - The Borg

4. "Make it so." - Captain Jean-Luc Picard

5. "I have been, and always shall be, your friend." - Spock

6. "Logic is the beginning of wisdom, not the end." - Spock
```

### Tools

#### 1. Get Quote by Character
Search for quotes by a specific Star Trek character.

**Parameters:**
- `character` (string): Character name to search for

**Features:**
- Case-insensitive search
- Partial name matching
- Returns all matching quotes

**Examples:**
```
Input: "Spock" → Returns all 3 Spock quotes
Input: "spock" → Same result (case-insensitive)
Input: "Captain" → Returns quotes from both Kirk and Picard
Input: "Worf" → Returns "No quotes found" message
```

#### 2. Random Quote Tool
Generates a random quote in text format.

**Parameters:** None

**Response Format:**
```
"Live long and prosper." - Spock
```

## 🎮 Usage Examples

### Using Resources
Ask your AI assistant:
- *"Show me all available Star Trek quotes"* → Uses `quotes://all`
- *"Give me a random Star Trek quote"* → Uses `quotes://random`
- *"Show me the quotes in text format"* → Uses `quotes://text`

### Using Tools
Ask your AI assistant:
- *"Find quotes by Spock"* → Uses `get-quote-by-character` tool
- *"Show me Captain Picard quotes"* → Uses partial matching
- *"Get me a random Star Trek quote"* → Uses `random-quote-tool`

## 🧪 Testing

The project includes a comprehensive test suite with **18 test cases**.

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage reporting
npm run test:coverage
```

### Test Coverage
- ✅ **Resource Handlers** (5 tests) - Core resource functionality
- ✅ **Tool Handlers** (8 tests) - Tool functionality including edge cases
- ✅ **Edge Cases** (2 tests) - Empty data and single quote scenarios
- ✅ **Data Validation** (3 tests) - Data structure and content validation

### Test Results
```
✅ All quotes returned as valid JSON
✅ Random quote selection from valid dataset
✅ Text formatting with proper numbering
✅ Character search (Spock, Kirk, Picard)
✅ Case-insensitive character search
✅ Partial name matching
✅ Character not found handling
✅ Random quote tool functionality
✅ Randomness validation across multiple calls
✅ Empty quotes data handling
✅ Single quote data handling
✅ Data structure validation
✅ Unique quotes verification
✅ Character representation validation
```

## 🗂️ File Structure

```
mcp-quotes-server/
├── server.js              # Main MCP server implementation
├── quotes.json            # Star Trek quotes data
├── server.test.js         # Comprehensive test suite
├── package.json           # Dependencies and scripts
├── package-lock.json      # Locked dependency versions
└── README.md              # This documentation
```

## 🔧 Development

### Project Scripts
```bash
npm start          # Start the MCP server
npm test           # Run test suite
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Adding New Quotes
1. Edit `quotes.json`
2. Add new quote objects with `quote` and `by` properties
3. Run tests to ensure everything works: `npm test`

### Dependencies
- **@modelcontextprotocol/sdk**: ^1.13.2 - Modern MCP SDK
- **zod**: ^3.23.8 - Schema validation
- **jest**: ^29.7.0 - Testing framework (dev dependency)

## 🐛 Troubleshooting

### Server Won't Start
1. **Check Node.js version**: Ensure you have Node.js 16+
   ```bash
   node --version
   ```

2. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check file permissions**:
   ```bash
   chmod +x server.js
   ```

### MCP Client Can't Connect

1. **Verify configuration path**: Ensure the `cwd` path in your MCP client config matches your actual installation directory.

2. **Check server startup**: Test the server manually:
   ```bash
   cd /path/to/your/mcp-quotes-server
   npm start
   ```

3. **Restart your MCP client**: Completely quit and restart Claude Desktop or Cursor.

### Common Issues

| Issue | Solution |
|-------|----------|
| "Module not found" | Run `npm install` |
| "Permission denied" | Check file permissions |
| "Port already in use" | Kill existing processes |
| "Config not found" | Verify MCP client config file path |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🖖 About

This MCP server demonstrates how to:
- Create MCP resources and tools
- Handle JSON and text data formats
- Implement search functionality
- Build comprehensive test suites
- Configure MCP clients

Perfect for learning MCP development or as a foundation for more complex MCP servers!

---

**Live long and prosper!** 🖖
