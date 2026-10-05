import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // CVA variants, Props types, and Radix re-exports in UI components are
  // intentional public API for design-system consumers.
  // Same-file usage (e.g. ButtonProps referenced inside button.tsx) counts as used.
  ignoreExportsUsedInFile: true,

  // hooks.ts exports used only by T-owned (ignored) feature folders look unused
  // to knip. Suppress export analysis for that file.
  ignoreIssues: {
    "apps/web/src/lib/api/hooks.ts": ["exports"],
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
