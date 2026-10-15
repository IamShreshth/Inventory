import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Integration suites share one PostgreSQL database and clean up their own fixtures.
    fileParallelism: false,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'tests/**',
        'migrations/**',
        '*.config.js',
      ],
    },
    testTimeout: 10000,
  },
});
