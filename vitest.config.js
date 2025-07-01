import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'edge-runtime',
    
    // Test files
    include: [
      '**/*.test.js',
      '**/*.test.ts'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.wrangler/**'
    ],
    
    // Test timeout
    testTimeout: 30000, // 30 seconds for integration tests
    
    // Global setup
    globals: true,
    
    // Reporter configuration
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json'
    },
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/**',
        'test/**',
        '**/*.test.js',
        '**/*.config.js',
        'wrangler.toml',
        'dist/**',
        '.wrangler/**'
      ]
    },
    
    // Environment variables for tests
    env: {
      NODE_ENV: 'test',
      VITEST: 'true'
    },
    
    // Test sequencing
    sequence: {
      concurrent: true,
      shuffle: false
    },
    
    // Retry configuration
    retry: 2, // Retry failed tests up to 2 times
    
    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    
    // Test setup files
    setupFiles: []
  },
  
  // Resolve configuration for imports
  resolve: {
    alias: {
      '@': '.'
    }
  },
  
  // Define configuration for different test types
  esbuild: {
    target: 'es2022'
  }
}); 