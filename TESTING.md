# Testing Guide for Cloudflare Workers MCP Server

This guide covers all testing aspects for your Star Trek Quotes MCP server deployed on Cloudflare Workers.

## 🧪 Test Suite Overview

The test suite includes:

- **Unit Tests** - Test Worker logic and MCP functionality in isolation
- **Integration Tests** - Test the deployed Worker via HTTP requests
- **Coverage Reports** - Code coverage analysis
- **Performance Tests** - Response time and reliability testing
- **Durable Objects Tests** - Session management testing

## 📋 Test Files

| File | Purpose | Coverage |
|------|---------|----------|
| `cloudflare-worker-mcp.test.js` | Unit tests for Worker logic | MCP protocol, endpoints, error handling |
| `cloudflare-worker-integration.test.js` | Integration tests for deployed Worker | Live deployment, performance, reliability |
| `vitest.config.js` | Test configuration | Environment setup, coverage config |
| `run-tests.js` | Test runner script | Automated test execution |

## 🚀 Quick Start

### Prerequisites

1. **Deployed Worker** - Your MCP server must be deployed to Cloudflare Workers
2. **Dependencies installed** - Run `npm install` in your worker directory

### Run All Tests

```bash
npm run test:all
```

This runs unit tests, integration tests, and generates coverage reports.

## 📝 Test Commands

### Basic Test Commands

```bash
# Run all tests (unit + integration + coverage)
npm run test:all

# Run tests in watch mode (for development)
npm run test:watch

# Run single test run
npm run test
```

### Specific Test Types

```bash
# Unit tests only (no external dependencies)
npm run test:unit

# Integration tests only (requires deployed Worker)
npm run test:integration

# Coverage report
npm run test:coverage

# CI/CD format (generates JUnit XML)
npm run test:ci
```

### Advanced Test Runner

```bash
# Use the custom test runner
node run-tests.js [test-type]

# Examples
node run-tests.js unit
node run-tests.js integration
node run-tests.js coverage
node run-tests.js all

# Show help
node run-tests.js --help
```

## 🧩 Test Categories

### 1. Unit Tests (`cloudflare-worker-mcp.test.js`)

Tests the Worker logic without external dependencies:

- **Basic Worker Endpoints** (/, /health, CORS)
- **MCP Protocol Endpoints** (POST /mcp, GET /mcp, DELETE /mcp)
- **Error Handling** (malformed JSON, unsupported methods)
- **Response Headers** (CORS, Content-Type)
- **Data Integrity** (quotes data, API structure)
- **Performance** (response times, payload sizes)
- **Durable Objects** (session management)

```bash
npm run test:unit
```

Expected: ~15 test cases, all should pass

### 2. Integration Tests (`cloudflare-worker-integration.test.js`)

Tests the live deployed Worker:

- **Deployment Health** (accessibility, API info)
- **CORS and Headers** (preflight, cross-origin)
- **MCP Protocol Support** (initialization, SSE, termination)
- **Error Handling** (404s, malformed requests)
- **Performance** (response times, concurrency)
- **Global Availability** (edge locations, latency)
- **Data Integrity** (consistency, structure)

```bash
npm run test:integration
```

Expected: ~15 test cases, requires live deployment

### 3. Coverage Tests

Generates code coverage reports:

```bash
npm run test:coverage
```

**Coverage Report Locations:**
- **Text**: Console output
- **HTML**: `./coverage/index.html`
- **JSON**: `./coverage/coverage-final.json`

**Expected Coverage:**
- Lines: >90%
- Functions: >90%
- Branches: >80%

## 📊 Understanding Test Results

### Successful Test Run

```
✅ Basic Worker Endpoints
  ✅ should return API information on root endpoint
  ✅ should return health check information
  ✅ should handle CORS preflight requests
  ✅ should return 404 for unknown endpoints

🎉 All tests completed successfully!
📊 Check ./coverage/index.html for detailed coverage report
```

### Failed Test Examples

```
❌ should return health check information
  Expected: 200
  Received: 500
  
💡 Possible causes:
  - Worker deployment failed
  - Configuration error
  - Network connectivity issue
```

### Performance Metrics

```
Health check response time: 45ms
Average response time over 3 requests: 52.33ms
Individual response times: 45, 67, 45ms
Request served by Cloudflare edge: 7d4-LAX
```

## 🔧 Test Configuration

### Vitest Configuration (`vitest.config.js`)

Key settings:
- **Environment**: `edge-runtime` (simulates Workers environment)
- **Timeout**: 30 seconds (for network requests)
- **Coverage**: V8 provider with HTML/JSON reports
- **Retry**: 2 attempts for flaky tests

### Environment Variables

Tests use these environment variables:
- `NODE_ENV=test`
- `VITEST=true`

## 🚨 Troubleshooting

### Common Issues

#### 1. Integration Tests Failing

**Problem**: Integration tests fail with network errors

**Solutions**:
```bash
# Check if Worker is deployed and accessible
curl https://quotes-mcp-server.klaushofrichter.workers.dev/health

# Verify wrangler.toml configuration
cat wrangler.toml

# Check Wrangler authentication
wrangler whoami
```

#### 2. Unit Tests Failing

**Problem**: Unit tests fail with import errors

**Solutions**:
```bash
# Install dependencies
npm install

# Check Node.js version (requires >=18)
node --version

# Verify test files exist
ls *.test.js
```

#### 3. Coverage Reports Not Generated

**Problem**: Coverage reports are empty or missing

**Solutions**:
```bash
# Install coverage dependencies
npm install @vitest/coverage-v8 --save-dev

# Run with explicit coverage
npx vitest run --coverage

# Check coverage directory
ls -la coverage/
```

#### 4. Worker Not Accessible

**Problem**: Worker URL returns 404 or connection errors

**Solutions**:
```bash
# Deploy the Worker first
wrangler deploy

# Check deployment status
wrangler tail

# Verify Worker name in wrangler.toml matches URL
```

### Debug Mode

Run tests with verbose output:

```bash
# Verbose unit tests
npx vitest run cloudflare-worker-mcp.test.js --reporter=verbose

# Debug integration tests
DEBUG=true npm run test:integration

# Check individual test
npx vitest run --grep "should return health check information"
```

## 📈 Performance Benchmarks

### Expected Performance

| Metric | Target | Acceptable | 
|--------|--------|------------|
| Health Check Response | <100ms | <500ms |
| API Info Response | <200ms | <1000ms |
| MCP Request Processing | <500ms | <2000ms |
| Concurrent Requests (5) | All succeed | >80% succeed |

### Performance Testing

```bash
# Run performance-focused tests
npm run test:integration -- --grep "Performance"

# Load testing with curl
for i in {1..10}; do
  curl -w "@curl-format.txt" -o /dev/null -s \
    https://quotes-mcp-server.klaushofrichter.workers.dev/health
done
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Test MCP Server
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run test:unit
      - run: wrangler deploy --env staging
      - run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Test Scripts for CI

```bash
# CI-friendly test run
npm run test:ci

# Validate entire deployment pipeline
npm run validate
```

## 📚 Additional Resources

- **Vitest Documentation**: https://vitest.dev/
- **Cloudflare Workers Testing**: https://developers.cloudflare.com/workers/testing/
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Coverage Reports**: Check `./coverage/index.html` after running tests

## 🎯 Test Checklist

Before deploying to production:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Code coverage >90%
- [ ] Performance benchmarks met
- [ ] Error handling tested
- [ ] CORS configuration verified
- [ ] MCP protocol compliance confirmed
- [ ] Durable Objects functionality tested

## 📞 Support

If tests fail unexpectedly:

1. Check the [troubleshooting section](#-troubleshooting)
2. Verify your Cloudflare Workers deployment
3. Ensure all dependencies are installed
4. Check network connectivity to the deployed Worker

Run `node run-tests.js --help` for additional test runner options. 