import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@web-types": fileURLToPath(new URL("../web/src/lib/api", import.meta.url)),
    },
  },
  test: { globalSetup: ["./src/test/globalSetup.ts"], environment: "node", env: { NODE_ENV: "test" }, hookTimeout: 600_000, testTimeout: 30_000 },
});
