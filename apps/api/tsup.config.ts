import { fileURLToPath } from "node:url";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  target: "node22",
  clean: true,
  esbuildOptions(options) {
    options.alias = {
      "@web-types": fileURLToPath(new URL("../web/src/lib/api", import.meta.url)),
    };
  },
});
