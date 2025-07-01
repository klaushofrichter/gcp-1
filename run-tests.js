#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    log(`\n🚀 Running: ${command} ${args.join(' ')}`, 'cyan');
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        log(`✅ Command completed successfully`, 'green');
        resolve(code);
      } else {
        log(`❌ Command failed with code ${code}`, 'red');
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    process.on('error', (error) => {
      log(`❌ Command error: ${error.message}`, 'red');
      reject(error);
    });
  });
}

async function checkDeployment() {
  log('\n🔍 Checking deployment status...', 'yellow');
  
  try {
    const wranglerConfig = readFileSync('wrangler.toml', 'utf8');
    const nameMatch = wranglerConfig.match(/name\s*=\s*"([^"]+)"/);
    const workerName = nameMatch ? nameMatch[1] : 'quotes-mcp-server';
    
    const url = `https://${workerName}.klaushofrichter.workers.dev/health`;
    log(`Testing deployment at: ${url}`, 'blue');
    
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      log(`✅ Deployment is healthy - ${data.quotesLoaded} quotes loaded`, 'green');
      return true;
    } else {
      log(`❌ Deployment check failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Deployment check error: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  const testType = process.argv[2] || 'all';
  
  log(`\n🧪 MCP Server Test Suite`, 'bright');
  log(`=======================`, 'bright');
  log(`Test Type: ${testType}`, 'blue');
  
  try {
    switch (testType) {
      case 'unit':
        log('\n📋 Running Unit Tests...', 'yellow');
        await runCommand('npm', ['run', 'test:unit']);
        break;
        
      case 'integration':
        log('\n🌐 Running Integration Tests...', 'yellow');
        const deploymentOk = await checkDeployment();
        if (!deploymentOk) {
          log('⚠️  Warning: Deployment check failed, integration tests may fail', 'yellow');
        }
        await runCommand('npm', ['run', 'test:integration']);
        break;
        
      case 'coverage':
        log('\n📊 Running Tests with Coverage...', 'yellow');
        await runCommand('npm', ['run', 'test:coverage']);
        break;
        
      case 'ci':
        log('\n🤖 Running CI Tests...', 'yellow');
        await runCommand('npm', ['run', 'test:ci']);
        break;
        
      case 'all':
      default:
        log('\n📋 Running Unit Tests...', 'yellow');
        await runCommand('npm', ['run', 'test:unit']);
        
        log('\n🌐 Running Integration Tests...', 'yellow');
        const deploymentOk2 = await checkDeployment();
        if (deploymentOk2) {
          await runCommand('npm', ['run', 'test:integration']);
        } else {
          log('⚠️  Skipping integration tests - deployment not accessible', 'yellow');
        }
        
        log('\n📊 Generating Coverage Report...', 'yellow');
        await runCommand('npm', ['run', 'test:coverage']);
        break;
    }
    
    log('\n🎉 All tests completed successfully!', 'green');
    log('📊 Check ./coverage/index.html for detailed coverage report', 'blue');
    
  } catch (error) {
    log(`\n💥 Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

function showHelp() {
  log('\n🧪 MCP Server Test Runner', 'bright');
  log('========================', 'bright');
  log('\nUsage: node run-tests.js [test-type]', 'blue');
  log('\nTest Types:', 'yellow');
  log('  unit        - Run unit tests only', 'cyan');
  log('  integration - Run integration tests only', 'cyan');
  log('  coverage    - Run tests with coverage report', 'cyan');
  log('  ci          - Run tests for CI/CD pipeline', 'cyan');
  log('  all         - Run all tests (default)', 'cyan');
  log('\nExamples:', 'yellow');
  log('  node run-tests.js unit', 'dim');
  log('  node run-tests.js integration', 'dim');
  log('  npm run test:all', 'dim');
}

// Check if help was requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Check if required files exist
if (!existsSync('package.json')) {
  log('❌ package.json not found. Are you in the right directory?', 'red');
  process.exit(1);
}

// Run the tests
runTests().catch((error) => {
  log(`\n💥 Unexpected error: ${error.message}`, 'red');
  process.exit(1);
}); 