import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // CVA variants, Props types, and Radix re-exports in UI components are
  // intentional public API for design-system consumers.
  ignoreExportsUsedInFile: true,

  // Hooks / exports consumed only by T-owned (ignored) feature folders are
  // invisible to knip. Suppress export analysis for the handoff hooks file.
  ignoreIssues: {
    "apps/web/src/lib/api/hooks/handoff.ts": ["exports"],
  },

  workspaces: {
    ".": {
      entry: [],
      project: [],
    },
    "apps/web": {
      entry: [
        "src/app/router.tsx",
        "src/mocks/browser.ts",
      ],
      project: ["src/**/*.{ts,tsx}"],
      ignore: [
        // T-owned feature folders — exports consumed there are invisible to knip
        "src/features/handoff/**",
      ],
    },
  },
};

export default config;
