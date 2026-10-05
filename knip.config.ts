import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // CVA variants, Props types, and Radix re-exports in UI components are
  // intentional public API for design-system consumers.
  ignoreExportsUsedInFile: true,

  // Suppress exports that are consumed by ignored folders or reserved for K3+.
  ignoreIssues: {
    // useCreateHandoff — consumed by T's handoff/NewHandoffModal.tsx (ignored)
    "apps/web/src/lib/api/hooks/handoff.ts": ["exports"],
    // useProjectContext — public API for K3 project pages (not yet written)
    "apps/web/src/app/layouts/ProjectLayout.tsx": ["exports"],
    // useProjectArtifacts — reserved for K3 explorer rebuild; not yet routed
    "apps/web/src/lib/api/hooks/artifacts.ts": ["exports"],
    // lib/session.ts exports — consumed by T's SignInCard and future pages
    "apps/web/src/lib/session.ts": ["exports"],
    // lib/routes.ts _legacy sub-object — documents old paths, not called at runtime
    "apps/web/src/lib/routes.ts": ["exports"],
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
