import { devices, type PlaywrightTestConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env.test") });

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL;
// Currently playwright.config.ts can not use env variables from ~/env.js
// const baseUrl = env.PLAYWRIGHT_TEST_BASE_URL; //get error: ❌ Invalid environment variables:

const opts = {
  headless: !!process.env.CI || !!process.env.PLAYWRIGHT_HEADLESS,
  // collectCoverage: !!process.env.PLAYWRIGHT_HEADLESS
};

const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  globalSetup: "./e2e/setup/global.ts",
  use: {
    ...devices["Desktop Chrome"],
    storageState: "./e2e/setup/storage-state.json",
    baseURL: baseUrl,
    headless: opts.headless,
  },
};

export default config;
