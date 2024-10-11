import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Add any Vitest-specific configurations here
    environment: "node",
    exclude: ["./e2e/**", "node_modules"],
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
});
