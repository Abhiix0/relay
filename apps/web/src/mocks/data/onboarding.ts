import type { OnboardingData, OnboardingPlan } from "@/lib/api/types";

export const mockOnboardingPlan: OnboardingPlan = {
  id: "plan_turbo_1",
  projectId: "turborepo",
  title: "Turborepo Contributor Kickoff: Rust Core & Node CLI",
  items: [
    {
      id: "item_1",
      title: "Clone repository & configure Rust toolchain (1.80+)",
      description:
        "Ensure cargo, rustfmt, and clippy are installed. Run `cargo check --workspace` to verify build targets.",
      completed: true,
      artifactIds: ["art_1"],
    },
    {
      id: "item_2",
      title: "Understand the Task Dependency DAG Builder",
      description:
        "Review `crates/turborepo-lib/src/engine/builder.rs`. Understand how package.json workspaces are transformed into Petgraph nodes.",
      completed: true,
      artifactIds: ["art_1", "art_5"],
    },
    {
      id: "item_3",
      title: "Inspect Cache Hashing and Remote Caching Protocol",
      description:
        "Trace how `compute_task_hash` hashes inputs and verifies against HTTP remote cache endpoints.",
      completed: true,
      artifactIds: ["art_2", "art_4"],
    },
    {
      id: "item_4",
      title: "Run the local Turbod daemon tests",
      description:
        "Execute `cargo test -p turborepo-daemon` and inspect the IPC socket lifecycle in `commit/9f8c12a`.",
      completed: false,
      artifactIds: ["art_6"],
    },
    {
      id: "item_5",
      title: "Debug a sample monorepo task execution",
      description:
        "Run `pnpm test:e2e` against fixture repos in `test/fixtures/basic_monorepo` with `--dry=json`.",
      completed: false,
      artifactIds: ["art_3"],
    },
    {
      id: "item_6",
      title: "Submit first pull request or review an open PR",
      description:
        "Pick an issue labeled `good first issue` or audit recent PR #8492 on Tarjan cycle optimization.",
      completed: false,
      artifactIds: ["art_5"],
    },
  ],
  createdAt: "2026-09-15T10:00:00Z",
  updatedAt: "2026-10-03T18:00:00Z",
};

export const mockOnboardingData: OnboardingData = {
  id: "onboarding_turbo_1",
  projectId: "turborepo",
  projectOverview: {
    name: "Turborepo",
    description:
      "High-performance build system for JavaScript and TypeScript codebases written in Rust.",
    repository: "vercel/turbo",
    primaryLanguage: "Rust",
    technologies: ["Rust", "TypeScript", "Node.js", "Cargo", "pnpm", "Go (legacy components)"],
  },
  architecture: {
    summary:
      "Turborepo is built as a hybrid Rust/Node.js application. The core engine is written in Rust for performance. The CLI wrapper is in TypeScript/Node.js.",
    mainModules: [
      {
        name: "Engine & DAG Builder",
        path: "crates/turborepo-lib/src/engine",
        description:
          "Constructs directed acyclic graph (DAG) of task dependencies from workspace configurations.",
      },
      {
        name: "Cache System",
        path: "crates/turborepo-cache/src",
        description:
          "Local and remote caching with deterministic hash computation. HTTP/2 client for Vercel Remote Cache.",
      },
      {
        name: "Daemon (Turbod)",
        path: "crates/turborepo-daemon/src",
        description:
          "Background daemon for persistent file watching and incremental builds.",
      },
      {
        name: "CLI Wrapper",
        path: "packages/turbo/src",
        description: "TypeScript CLI that discovers workspaces and invokes the Rust binary.",
      },
    ],
  },
  keyFiles: [
    {
      id: "key_readme",
      path: "README.md",
      description: "Project overview, installation instructions, and quick start guide.",
      category: "readme",
    },
    {
      id: "key_engine_builder",
      path: "crates/turborepo-lib/src/engine/builder.rs",
      description: "Core DAG builder — transforms workspace tasks into execution graph.",
      category: "entry",
    },
    {
      id: "key_cache_http",
      path: "crates/turborepo-cache/src/http.rs",
      description: "HTTP/2 remote cache client with authentication and compression.",
      category: "important",
    },
    {
      id: "key_cli_main",
      path: "packages/turbo/src/commands/run.ts",
      description: "Main CLI entry point for 'turbo run' command execution.",
      category: "entry",
    },
  ],
  gettingStarted: [
    { step: 1, title: "Read the README", description: "Familiarize yourself with project goals." },
    {
      step: 2,
      title: "Set up development environment",
      description: "Install Rust 1.80+, Node.js 18+, and pnpm.",
    },
    {
      step: 3,
      title: "Explore the engine architecture",
      description: "Review crates/turborepo-lib/src/engine/builder.rs.",
    },
    {
      step: 4,
      title: "Run tests",
      description: "Execute 'cargo test --workspace' and 'pnpm test'.",
    },
  ],
  progress: {
    repositoryConnected: true,
    repositoryIndexed: true,
    structureAnalyzed: true,
    handoffReady: true,
  },
};
