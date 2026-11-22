import { defineConfig, devices } from "@playwright/test";

const python = process.env.TDM_E2E_PYTHON ?? "python";
export default defineConfig({
  testDir: "./tests/integration",
  timeout: 45_000,
  workers: 1,
  fullyParallel: false,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4174", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
  webServer: [
    {
      command: `"${python}" -m tests.e2e_server`,
      cwd: "../toquedemulher-backend",
      url: "http://127.0.0.1:8008/health",
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 4174 --strictPort",
      url: "http://127.0.0.1:4174",
      env: { VITE_API_URL: "http://127.0.0.1:8008", VITE_API_PREFIX: "/api/v1", VITE_GOOGLE_CLIENT_ID: "" },
      reuseExistingServer: false,
    },
  ],
});
