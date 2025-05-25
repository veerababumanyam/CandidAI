const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 10000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],
  use: {
    headless: false,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        args: [
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--allow-running-insecure-content',
          '--disable-extensions-except=.',
          '--load-extension=.'
        ]
      },
    }
  ],

  webServer: {
    command: 'npx http-server . -p 3000 -c-1',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
}); 