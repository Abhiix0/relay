import type {
  ActivityEvent,
  Artifact,
  AskAnswer,
  Decision,
  Handoff,
  OnboardingPlan,
  Project,
  SyncJob,
  User,
} from "@/lib/api/types";

export const mockUser: User = {
  id: "usr_relay_1",
  email: "alex.chen@relay.dev",
  name: "Alex Chen",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  githubLogin: "alexchen-dev",
  createdAt: "2026-01-10T09:00:00Z",
};

export const mockProjects: Project[] = [
  {
    id: "turborepo",
    name: "turbo",
    fullName: "vercel/turbo",
    description: "High-performance build system for JavaScript and TypeScript codebases written in Rust.",
    language: "Rust",
    owner: "vercel",
    syncStatus: "succeeded",
    lastSyncedAt: "2026-10-03T18:30:00Z",
    stats: {
      commits: 4280,
      pullRequests: 128,
      issues: 42,
      releases: 8,
      files: 3410,
    },
    health: {
      overall: 87,
      documentation: 72,
      activity: "high",
    },
    healthLabel: "98% Indexed · Healthy",
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-10-03T18:30:00Z",
  },
  {
    id: "prisma",
    name: "prisma",
    fullName: "prisma/prisma",
    description: "Next-generation ORM for Node.js & TypeScript with schema-driven migrations and type safety.",
    language: "TypeScript",
    owner: "prisma",
    syncStatus: "succeeded",
    lastSyncedAt: "2026-10-03T16:15:00Z",
    stats: {
      commits: 8912,
      pullRequests: 214,
      issues: 89,
      releases: 34,
      files: 5120,
    },
    health: {
      overall: 94,
      documentation: 88,
      activity: "high",
    },
    healthLabel: "94% Indexed · Healthy",
    createdAt: "2026-02-15T10:00:00Z",
    updatedAt: "2026-10-03T16:15:00Z",
  },
  {
    id: "calcom",
    name: "cal.com",
    fullName: "calcom/cal.com",
    description: "Scheduling infrastructure for everyone. Open source Calendly alternative built with Next.js.",
    language: "TypeScript",
    owner: "calcom",
    syncStatus: "running",
    lastSyncedAt: "2026-10-03T14:00:00Z",
    stats: {
      commits: 14200,
      pullRequests: 340,
      issues: 112,
      releases: 52,
      files: 8900,
    },
    health: {
      overall: 68,
      documentation: 55,
      activity: "medium",
    },
    healthLabel: "Indexing (68%)",
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-10-03T19:00:00Z",
  },
  {
    id: "excalidraw",
    name: "excalidraw",
    fullName: "excalidraw/excalidraw",
    description: "Virtual collaborative whiteboard for sketching hand-drawn like diagrams with end-to-end encryption.",
    language: "TypeScript",
    owner: "excalidraw",
    syncStatus: "queued",
    lastSyncedAt: null,
    stats: {
      commits: 6100,
      pullRequests: 95,
      issues: 31,
      releases: 18,
      files: 2840,
    },
    health: {
      overall: 0,
      documentation: 0,
      activity: "low",
    },
    healthLabel: "Sync Queued",
    createdAt: "2026-03-10T14:00:00Z",
    updatedAt: "2026-10-03T19:10:00Z",
  },
];

export const mockArtifacts: Artifact[] = [
  {
    id: "art_1",
    projectId: "turborepo",
    type: "file",
    title: "crates/turborepo-lib/src/engine/builder.rs",
    path: "crates/turborepo-lib/src/engine/builder.rs",
    url: "https://github.com/vercel/turbo/blob/main/crates/turborepo-lib/src/engine/builder.rs",
    summary: "Engine construction logic that builds the directed acyclic graph (DAG) of task dependencies.",
    createdAt: "2026-09-28T10:00:00Z",
  },
  {
    id: "art_2",
    projectId: "turborepo",
    type: "file",
    title: "crates/turborepo-cache/src/http.rs",
    path: "crates/turborepo-cache/src/http.rs",
    url: "https://github.com/vercel/turbo/blob/main/crates/turborepo-cache/src/http.rs",
    summary: "HTTP/2 client for Vercel Remote Caching with gzip payload compression and bearer auth.",
    createdAt: "2026-09-29T14:30:00Z",
  },
  {
    id: "art_3",
    projectId: "turborepo",
    type: "file",
    title: "packages/turbo/src/commands/run.ts",
    path: "packages/turbo/src/commands/run.ts",
    url: "https://github.com/vercel/turbo/blob/main/packages/turbo/src/commands/run.ts",
    summary: "Node CLI entrypoint for `turbo run <tasks>` executing daemon communication.",
    createdAt: "2026-09-30T11:00:00Z",
  },
  {
    id: "art_4",
    projectId: "turborepo",
    type: "decision",
    title: "ADR-001: Rust Core Migration",
    path: "docs/decisions/001-rust-core.md",
    url: "https://github.com/vercel/turbo/blob/main/docs/decisions/001-rust-core.md",
    summary: "Migration of the Go-based turbo daemon to Rust for memory efficiency and zero-cost threading.",
    createdAt: "2026-08-15T09:00:00Z",
  },
  {
    id: "art_5",
    projectId: "turborepo",
    type: "pr",
    title: "PR #8492: Optimize package-graph traversal with Petgraph",
    path: "pull/8492",
    url: "https://github.com/vercel/turbo/pull/8492",
    summary: "Replaces naive cycle detection with Tarjan SCC algorithm in petgraph, reducing startup by 45ms.",
    createdAt: "2026-10-01T15:20:00Z",
  },
  {
    id: "art_6",
    projectId: "turborepo",
    type: "commit",
    title: "feat(daemon): Add named pipe IPC on Windows and unix socket on POSIX",
    path: "commit/9f8c12a",
    url: "https://github.com/vercel/turbo/commit/9f8c12a",
    summary: "Cross-platform daemon IPC transport layer with automatic socket file unlinking.",
    createdAt: "2026-10-02T18:45:00Z",
  },
];

export const mockAskAnswers: AskAnswer[] = [
  {
    id: "ask_1",
    projectId: "turborepo",
    question: "How does Turborepo's hashing algorithm determine cache hits?",
    answer:
      "Turborepo computes a deterministic 128-bit hash per task execution. The key inputs are:\n\n1. **Task Definition Hash**: Extracted from `turbo.json` (`inputs`, `outputs`, `dependsOn`, `env`).\n2. **Package Git Tree Hash**: Hashes of matched files defined in `inputs` using git-compatible blob hashing.\n3. **Resolved Dependency Hashes**: Hashes of all upstream dependencies in the workspace DAG.\n4. **Specified Environment Variables**: Exact values of explicitly declared env vars.\n\nWhen `turbo run` starts, it queries the local cache (`node_modules/.cache/turbo`) or the Remote Cache endpoint via HTTP PUT/GET. If the hash matches, artifacts are unpacked directly without executing the build command.",
    sources: [
      {
        id: "src_1",
        type: "file",
        path: "crates/turborepo-lib/src/engine/builder.rs",
        url: "https://github.com/vercel/turbo/blob/main/crates/turborepo-lib/src/engine/builder.rs",
        snippet: "let task_hash = hasher.compute_task_hash(&task_spec, &package_inputs, &env_map)?;",
      },
      {
        id: "src_2",
        type: "file",
        path: "crates/turborepo-cache/src/http.rs",
        url: "https://github.com/vercel/turbo/blob/main/crates/turborepo-cache/src/http.rs",
        snippet: "pub async fn fetch_artifact(&self, hash: &str) -> Result<Option<ArtifactStream>> {",
      },
      {
        id: "src_3",
        type: "decision",
        path: "docs/decisions/001-rust-core.md",
        url: "https://github.com/vercel/turbo/blob/main/docs/decisions/001-rust-core.md",
        snippet: "Cache keys must remain bit-for-bit identical across Go and Rust implementations.",
      },
    ],
    confidence: "high",
    createdAt: "2026-10-03T17:10:00Z",
  },
  {
    id: "ask_2",
    projectId: "turborepo",
    question: "Where is the daemon RPC client initialized in the CLI?",
    answer:
      "The client connects to the background daemon via `packages/turbo/src/commands/run.ts`. It invokes `ensureDaemonRunning()` which checks for an active socket file (`/tmp/turbo-<hash>.sock` or `\\\\.\\pipe\\turbo-<hash>`). If the daemon is dead or absent, it spawns `turbod` with detached process flags.",
    sources: [
      {
        id: "src_4",
        type: "file",
        path: "packages/turbo/src/commands/run.ts",
        url: "https://github.com/vercel/turbo/blob/main/packages/turbo/src/commands/run.ts",
        snippet: "const daemonClient = await connectOrSpawnDaemon({ workspaceRoot, timeoutMs: 2500 });",
      },
      {
        id: "src_5",
        type: "commit",
        path: "commit/9f8c12a",
        url: "https://github.com/vercel/turbo/commit/9f8c12a",
        snippet: "Cross-platform daemon IPC transport layer with automatic socket file unlinking.",
      },
    ],
    confidence: "high",
    createdAt: "2026-10-03T17:45:00Z",
  },
];

export const mockDecisions: Decision[] = [
  {
    id: "dec_1",
    projectId: "turborepo",
    title: "ADR-001: Rust Core Migration",
    summary: "Porting the execution engine, DAG builder, and cache hashing from Go to Rust.",
    rationale:
      "The original Go implementation suffered from garbage collection pauses during large dependency graph builds (>10,000 packages) and lacked direct FFI integration into Node. Rust allows native N-API bindings and deterministic latency.",
    sources: [
      {
        id: "src_dec_1",
        type: "decision",
        path: "docs/decisions/001-rust-core.md",
        url: "https://github.com/vercel/turbo/blob/main/docs/decisions/001-rust-core.md",
        snippet: "Decision: Rewrite core graph orchestration in Rust. Maintain TS CLI wrapper.",
      },
    ],
    createdAt: "2026-08-15T09:00:00Z",
  },
  {
    id: "dec_2",
    projectId: "turborepo",
    title: "ADR-002: Remote Caching Protocol via HTTP/2 and SHA256",
    summary: "Standardizing cache transport over HTTP/2 with chunked streaming and HMAC signatures.",
    rationale:
      "Avoids multi-roundtrip handshakes when fetching tens of small intermediate build artifacts. Uses HTTP/2 multiplexing over a single persistent TLS connection.",
    sources: [
      {
        id: "src_dec_2",
        type: "file",
        path: "crates/turborepo-cache/src/http.rs",
        url: "https://github.com/vercel/turbo/blob/main/crates/turborepo-cache/src/http.rs",
        snippet: "http2_prior_knowledge(true).pool_max_idle_per_host(32)",
      },
    ],
    createdAt: "2026-09-02T14:00:00Z",
  },
];

export const mockOnboardingPlan: OnboardingPlan = {
  id: "plan_turbo_1",
  projectId: "turborepo",
  title: "Turborepo Contributor Kickoff: Rust Core & Node CLI",
  items: [
    {
      id: "item_1",
      title: "Clone repository & configure Rust toolchain (1.80+)",
      description: "Ensure cargo, rustfmt, and clippy are installed. Run `cargo check --workspace` to verify build targets.",
      completed: true,
      artifactIds: ["art_1"],
    },
    {
      id: "item_2",
      title: "Understand the Task Dependency DAG Builder",
      description: "Review `crates/turborepo-lib/src/engine/builder.rs`. Understand how package.json workspaces are transformed into Petgraph nodes.",
      completed: true,
      artifactIds: ["art_1", "art_5"],
    },
    {
      id: "item_3",
      title: "Inspect Cache Hashing and Remote Caching Protocol",
      description: "Trace how `compute_task_hash` hashes inputs and verifies against HTTP remote cache endpoints.",
      completed: true,
      artifactIds: ["art_2", "art_4"],
    },
    {
      id: "item_4",
      title: "Run the local Turbod daemon tests",
      description: "Execute `cargo test -p turborepo-daemon` and inspect the IPC socket lifecycle in `commit/9f8c12a`.",
      completed: false,
      artifactIds: ["art_6"],
    },
    {
      id: "item_5",
      title: "Debug a sample monorepo task execution",
      description: "Run `pnpm test:e2e` against fixture repos in `test/fixtures/basic_monorepo` with `--dry=json`.",
      completed: false,
      artifactIds: ["art_3"],
    },
    {
      id: "item_6",
      title: "Submit first pull request or review an open PR",
      description: "Pick an issue labeled `good first issue` or audit recent PR #8492 on Tarjan cycle optimization.",
      completed: false,
      artifactIds: ["art_5"],
    },
  ],
  createdAt: "2026-09-15T10:00:00Z",
  updatedAt: "2026-10-03T18:00:00Z",
};

export const mockHandoffs: Handoff[] = [
  {
    id: "handoff_1",
    projectId: "turborepo",
    title: "Lead Architect Handoff: Rust Core & Remote Cache Engine",
    summary: "Critical architectural invariants, daemon lifecycle, and operational gotchas for maintainers.",
    version: 3,
    sections: [
      {
        heading: "1. Core Architectural Invariant: Deterministic Hashing",
        body: "Never add an unstamped input into `compute_task_hash`. All file system reads must pass through the Git ignore filter. If a file is modified without git tracking, it will produce cache drift.",
        sources: [
          {
            id: "h_src_1",
            type: "file",
            path: "crates/turborepo-lib/src/engine/builder.rs",
            url: "https://github.com/vercel/turbo/blob/main/crates/turborepo-lib/src/engine/builder.rs",
            snippet: "assert!(task_hash.is_deterministic(), 'Hash drift detected');",
          },
        ],
      },
      {
        heading: "2. Daemon Socket Management & Deadlock Prevention",
        body: "The Turbod daemon runs as an unprivileged background daemon. On POSIX it writes a lockfile with PID validation; on Windows it registers a named pipe. If the daemon crashes unexpectedly, the client automatically falls back to standalone execution.",
        sources: [
          {
            id: "h_src_2",
            type: "commit",
            path: "commit/9f8c12a",
            url: "https://github.com/vercel/turbo/commit/9f8c12a",
            snippet: "Named pipe reconnect with exponential backoff and orphan cleanup.",
          },
        ],
      },
      {
        heading: "3. Known Tech Debt: Petgraph Memory Allocation",
        body: "During monorepos with >20,000 internal edges, cloning `GraphMap` causes transient heap spikes. PR #8492 mitigated this, but future work should transition to index-backed flat vectors.",
        sources: [
          {
            id: "h_src_3",
            type: "pr",
            path: "pull/8492",
            url: "https://github.com/vercel/turbo/pull/8492",
            snippet: "Tarjan SCC algorithm reduces stack depth in circular graph checks.",
          },
        ],
      },
    ],
    createdAt: "2026-09-20T11:00:00Z",
    updatedAt: "2026-10-03T17:30:00Z",
  },
];

export const mockSyncJob: SyncJob = {
  id: "sync_job_latest",
  projectId: "turborepo",
  status: "succeeded",
  progress: 100,
  error: null,
  startedAt: "2026-10-03T18:28:10Z",
  completedAt: "2026-10-03T18:30:00Z",
};

export const mockActivityEvents: ActivityEvent[] = [
  {
    id: "act_1",
    projectId: "turborepo",
    type: "sync",
    title: "Repository Index Synchronized",
    description: "Indexed 3,410 files and 4,280 commits in 1m 50s.",
    createdAt: "2026-10-03T18:30:00Z",
  },
  {
    id: "act_2",
    projectId: "turborepo",
    type: "ask",
    title: "AI Question Answered",
    description: "Question: 'How does Turborepo's hashing algorithm determine cache hits?' (3 sources cited)",
    createdAt: "2026-10-03T17:10:00Z",
  },
  {
    id: "act_3",
    projectId: "turborepo",
    type: "decision",
    title: "Architecture Decision Recorded",
    description: "ADR-002: Remote Caching Protocol via HTTP/2 and SHA256",
    createdAt: "2026-09-02T14:00:00Z",
  },
  {
    id: "act_4",
    projectId: "turborepo",
    type: "onboarding",
    title: "Onboarding Step Completed",
    description: "Completed 'Inspect Cache Hashing and Remote Caching Protocol'",
    createdAt: "2026-09-28T16:20:00Z",
  },
  {
    id: "act_5",
    projectId: "turborepo",
    type: "handoff",
    title: "Handoff Briefing Updated",
    description: "Updated version 3 of 'Lead Architect Handoff: Rust Core & Remote Cache Engine'",
    createdAt: "2026-10-03T17:30:00Z",
  },
];
