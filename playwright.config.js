import { defineConfig } from '@playwright/test';

const port = parseInt(process.env.PORT || '5173');

export default defineConfig({
  testDir: 'tests/gui',
  timeout: 15000,
  use: {
    baseURL: `http://localhost:${port}`,
    headless: true,
    contextOptions: {
      serviceWorkers: 'block',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  // Starts the vite dev server automatically; stops it when the suite finishes.
  // PORT is resolved to a free port by the Makefile before this config loads.
  webServer: {
    command: `npx vite --host 0.0.0.0 --port ${port}`,
    port,
    reuseExistingServer: false,
    timeout: 10000,
  },
  reporter: [['list']],
});
