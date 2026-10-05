/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Landing page — ASG owns it, keep isolated
          if (id.includes("features/landing")) return "landing";

          // Design system showcase — dev only
          if (id.includes("pages/DesignSystemPage")) return "design-system";

          // Heavy vendor libs — split so entry chunk stays small
          if (id.includes("node_modules/react-dom")) return "react-dom";
          if (
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/@remix-run")
          )
            return "router";
          if (id.includes("node_modules/@tanstack/react-query"))
            return "query";
          if (id.includes("node_modules/@radix-ui")) return "radix";
          if (id.includes("node_modules/lucide-react")) return "lucide";
          if (id.includes("node_modules/zod")) return "zod";

          // Everything else in node_modules goes to vendor
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
