import { defineConfig, devices } from "@playwright/test";

// Local smoke test. Assumes the app is running on localhost:3000 with a seeded
// Supabase. Run: npm run dev (in one shell), then npm run e2e.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
