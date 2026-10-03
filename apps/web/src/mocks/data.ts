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
    insufficientEvidence: false,
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
    insufficientEvidence: false,
    createdAt: "2026-10-03T17:45:00Z",
  },
  {
    id: "ask_3",
    projectId: "turborepo",
    question: "How does the authentication system work?",
    answer:
      "I couldn't find enough information in the indexed repository to answer this confidently. The repository focuses on build system functionality rather than user authentication.",
    sources: [],
    confidence: "insufficient",
    insufficientEvidence: true,
    createdAt: "2026-10-03T18:20:00Z",
  },
  {
    id: "ask_4",
    projectId: "turborepo",
    question: "How are workspace package dependencies resolved in the DAG?",
    answer:
      "The engine builder constructs a directed acyclic graph (DAG) using the Petgraph library. It reads workspace package definitions and task configurations from turbo.json, then:\n\n1. Adds each task as a node in the graph\n2. Establishes dependency edges between tasks based on `dependsOn` declarations\n3. Validates the graph for cycles using Tarjan's strongly connected components algorithm\n4. Returns a TaskGraph ready for parallel execution\n\nIf cycles are detected, the builder returns a CyclicDependency error to prevent infinite loops.",
    sources: [
      {
        id: "src_6",
        type: "file",
        path: "crates/turborepo-lib/src/engine/builder.rs",
        url: "https://github.com/vercel/turbo/blob/main/crates/turborepo-lib/src/engine/builder.rs",
        snippet: "pub fn build_execution_graph(&self) -> Result<TaskGraph, EngineError> {\n    // Detect cycles using Tarjan's SCC algorithm\n    if self.has_cycles() {\n        return Err(EngineError::CyclicDependency);\n    }\n    Ok(TaskGraph { graph: self.graph.clone() })\n}",
      },
    ],
    confidence: "high",
    insufficientEvidence: false,
    createdAt: "2026-10-03T18:45:00Z",
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

import type {
  FileContent,
  RepositoryTree,
  SearchResults,
} from "@/lib/api/types";

/* ── Repository Tree Mock Data ──────────────────────────────── */
export const mockRepositoryTree: RepositoryTree = {
  projectId: "turborepo",
  repository: "vercel/turbo",
  tree: [
    {
      id: "root-crates",
      name: "crates",
      path: "crates",
      type: "folder",
      children: [
        {
          id: "crates-turborepo-lib",
          name: "turborepo-lib",
          path: "crates/turborepo-lib",
          type: "folder",
          children: [
            {
              id: "crates-turborepo-lib-src",
              name: "src",
              path: "crates/turborepo-lib/src",
              type: "folder",
              children: [
                {
                  id: "file-engine-builder",
                  name: "builder.rs",
                  path: "crates/turborepo-lib/src/engine/builder.rs",
                  type: "file",
                  language: "rust",
                  size: 15420,
                },
                {
                  id: "file-engine-mod",
                  name: "mod.rs",
                  path: "crates/turborepo-lib/src/engine/mod.rs",
                  type: "file",
                  language: "rust",
                  size: 2890,
                },
              ],
            },
            {
              id: "file-lib-rs",
              name: "lib.rs",
              path: "crates/turborepo-lib/src/lib.rs",
              type: "file",
              language: "rust",
              size: 4120,
            },
          ],
        },
        {
          id: "crates-turborepo-cache",
          name: "turborepo-cache",
          path: "crates/turborepo-cache",
          type: "folder",
          children: [
            {
              id: "crates-turborepo-cache-src",
              name: "src",
              path: "crates/turborepo-cache/src",
              type: "folder",
              children: [
                {
                  id: "file-http-rs",
                  name: "http.rs",
                  path: "crates/turborepo-cache/src/http.rs",
                  type: "file",
                  language: "rust",
                  size: 8720,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "root-packages",
      name: "packages",
      path: "packages",
      type: "folder",
      children: [
        {
          id: "packages-turbo",
          name: "turbo",
          path: "packages/turbo",
          type: "folder",
          children: [
            {
              id: "packages-turbo-src",
              name: "src",
              path: "packages/turbo/src",
              type: "folder",
              children: [
                {
                  id: "packages-turbo-src-commands",
                  name: "commands",
                  path: "packages/turbo/src/commands",
                  type: "folder",
                  children: [
                    {
                      id: "file-run-ts",
                      name: "run.ts",
                      path: "packages/turbo/src/commands/run.ts",
                      type: "file",
                      language: "typescript",
                      size: 6420,
                    },
                  ],
                },
              ],
            },
            {
              id: "file-package-json",
              name: "package.json",
              path: "packages/turbo/package.json",
              type: "file",
              language: "json",
              size: 1240,
            },
          ],
        },
      ],
    },
    {
      id: "root-docs",
      name: "docs",
      path: "docs",
      type: "folder",
      children: [
        {
          id: "docs-decisions",
          name: "decisions",
          path: "docs/decisions",
          type: "folder",
          children: [
            {
              id: "file-001-rust-core",
              name: "001-rust-core.md",
              path: "docs/decisions/001-rust-core.md",
              type: "file",
              language: "markdown",
              size: 3420,
            },
            {
              id: "file-002-remote-cache",
              name: "002-remote-cache.md",
              path: "docs/decisions/002-remote-cache.md",
              type: "file",
              language: "markdown",
              size: 2810,
            },
          ],
        },
      ],
    },
    {
      id: "root-readme",
      name: "README.md",
      path: "README.md",
      type: "file",
      language: "markdown",
      size: 8940,
    },
    {
      id: "root-cargo-toml",
      name: "Cargo.toml",
      path: "Cargo.toml",
      type: "file",
      language: "toml",
      size: 1580,
    },
    {
      id: "root-gitignore",
      name: ".gitignore",
      path: ".gitignore",
      type: "file",
      language: null,
      size: 420,
    },
  ],
};

/* ── File Content Mock Data ─────────────────────────────────── */
export const mockFileContents: Record<string, FileContent> = {
  "crates/turborepo-lib/src/engine/builder.rs": {
    projectId: "turborepo",
    path: "crates/turborepo-lib/src/engine/builder.rs",
    name: "builder.rs",
    language: "rust",
    size: 15420,
    content: `use std::collections::{HashMap, HashSet};
use petgraph::graph::{DiGraph, NodeIndex};
use crate::engine::{Engine, Task, TaskGraph};

/// Builds the execution graph (DAG) from workspace package definitions
/// and task configurations specified in turbo.json.
pub struct EngineBuilder {
    graph: DiGraph<Task, ()>,
    task_map: HashMap<String, NodeIndex>,
}

impl EngineBuilder {
    pub fn new() -> Self {
        Self {
            graph: DiGraph::new(),
            task_map: HashMap::new(),
        }
    }

    /// Adds a task node to the execution graph
    pub fn add_task(&mut self, task: Task) -> NodeIndex {
        let node = self.graph.add_node(task.clone());
        self.task_map.insert(task.id.clone(), node);
        node
    }

    /// Establishes a dependency edge between two tasks
    pub fn add_dependency(&mut self, from: &str, to: &str) {
        if let (Some(&from_node), Some(&to_node)) = 
            (self.task_map.get(from), self.task_map.get(to)) {
            self.graph.add_edge(from_node, to_node, ());
        }
    }

    /// Builds and validates the execution graph
    pub fn build_execution_graph(&self) -> Result<TaskGraph, EngineError> {
        // Detect cycles using Tarjan's SCC algorithm
        if self.has_cycles() {
            return Err(EngineError::CyclicDependency);
        }

        Ok(TaskGraph {
            graph: self.graph.clone(),
            task_map: self.task_map.clone(),
        })
    }

    fn has_cycles(&self) -> bool {
        use petgraph::algo::tarjan_scc;
        let sccs = tarjan_scc(&self.graph);
        sccs.iter().any(|scc| scc.len() > 1)
    }
}

#[derive(Debug)]
pub enum EngineError {
    CyclicDependency,
    InvalidTask,
}`,
  },
  "crates/turborepo-cache/src/http.rs": {
    projectId: "turborepo",
    path: "crates/turborepo-cache/src/http.rs",
    name: "http.rs",
    language: "rust",
    size: 8720,
    content: `use reqwest::{Client, StatusCode};
use std::time::Duration;

/// HTTP/2 client for Vercel Remote Caching
/// Handles multiplexed artifact upload and download with gzip compression
pub struct RemoteCacheClient {
    client: Client,
    base_url: String,
    token: String,
}

impl RemoteCacheClient {
    pub fn new(base_url: String, token: String) -> Result<Self, CacheError> {
        let client = Client::builder()
            .http2_prior_knowledge()
            .pool_max_idle_per_host(32)
            .timeout(Duration::from_secs(30))
            .build()?;

        Ok(Self {
            client,
            base_url,
            token,
        })
    }

    /// Fetches an artifact by hash from the remote cache
    pub async fn fetch_artifact(&self, hash: &str) -> Result<Option<ArtifactStream>, CacheError> {
        let url = format!("{}/v8/artifacts/{}", self.base_url, hash);
        
        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .send()
            .await?;

        match response.status() {
            StatusCode::OK => {
                let stream = response.bytes_stream();
                Ok(Some(ArtifactStream::new(stream)))
            }
            StatusCode::NOT_FOUND => Ok(None),
            _ => Err(CacheError::RequestFailed(response.status())),
        }
    }

    /// Uploads an artifact to the remote cache
    pub async fn put_artifact(&self, hash: &str, data: Vec<u8>) -> Result<(), CacheError> {
        let url = format!("{}/v8/artifacts/{}", self.base_url, hash);
        
        let response = self.client
            .put(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .header("Content-Type", "application/octet-stream")
            .body(data)
            .send()
            .await?;

        if response.status().is_success() {
            Ok(())
        } else {
            Err(CacheError::UploadFailed(response.status()))
        }
    }
}

#[derive(Debug)]
pub enum CacheError {
    RequestFailed(StatusCode),
    UploadFailed(StatusCode),
    NetworkError,
}`,
  },
  "packages/turbo/src/commands/run.ts": {
    projectId: "turborepo",
    path: "packages/turbo/src/commands/run.ts",
    name: "run.ts",
    language: "typescript",
    size: 6420,
    content: `import { connectOrSpawnDaemon } from '../daemon/client';
import { TaskExecutor } from '../engine/executor';

/**
 * Node CLI entrypoint for \`turbo run <tasks>\`
 * Executes daemon communication and task orchestration
 */
export async function runCommand(tasks: string[], options: RunOptions): Promise<void> {
  const { workspaceRoot, timeoutMs = 2500 } = options;

  console.log(\`Turborepo \${require('../../package.json').version}\`);
  console.log(\`Running tasks: \${tasks.join(', ')}\`);

  // Connect to or spawn the background daemon
  const daemonClient = await connectOrSpawnDaemon({
    workspaceRoot,
    timeoutMs,
  });

  try {
    // Request the execution graph from the daemon
    const graph = await daemonClient.getExecutionGraph(tasks);

    // Execute tasks according to the DAG
    const executor = new TaskExecutor({
      graph,
      parallel: options.parallel ?? true,
      cache: options.cache ?? true,
    });

    const result = await executor.execute();

    if (result.failed.length > 0) {
      console.error(\`\nTasks failed:\`);
      result.failed.forEach((task) => {
        console.error(\`  - \${task}\`);
      });
      process.exit(1);
    }

    console.log(\`\n✓ All tasks completed successfully\`);
  } finally {
    await daemonClient.close();
  }
}

interface RunOptions {
  workspaceRoot: string;
  timeoutMs?: number;
  parallel?: boolean;
  cache?: boolean;
}`,
  },
  "README.md": {
    projectId: "turborepo",
    path: "README.md",
    name: "README.md",
    language: "markdown",
    size: 8940,
    content: `# Turborepo

Turborepo is a high-performance build system for JavaScript and TypeScript codebases.

## Features

- **Incremental builds** - Never do the same work twice
- **Remote caching** - Share cache artifacts across your team and CI
- **Parallel execution** - Run tasks in parallel with maximum efficiency
- **Task pipelines** - Define relationships between tasks
- **Monorepo support** - First-class support for monorepos

## Quick Start

\`\`\`bash
npm install turbo --global
turbo run build test lint
\`\`\`

## Documentation

Visit [turbo.build/repo](https://turbo.build/repo) for complete documentation.

## Architecture

Turborepo consists of:

1. **Rust Core** - High-performance task execution engine
2. **Node CLI** - Developer-friendly command-line interface
3. **Daemon** - Background process for incremental builds
4. **Remote Cache** - Distributed artifact storage

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.`,
  },
  "Cargo.toml": {
    projectId: "turborepo",
    path: "Cargo.toml",
    name: "Cargo.toml",
    language: "toml",
    size: 1580,
    content: `[workspace]
members = [
  "crates/turborepo-lib",
  "crates/turborepo-cache",
  "crates/turborepo-daemon",
]

[workspace.package]
version = "1.11.0"
edition = "2021"
rust-version = "1.76"

[workspace.dependencies]
petgraph = "0.6"
reqwest = { version = "0.11", features = ["http2", "stream"] }
tokio = { version = "1.35", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }`,
  },
  ".gitignore": {
    projectId: "turborepo",
    path: ".gitignore",
    name: ".gitignore",
    language: null,
    size: 420,
    content: `# Dependencies
node_modules/
target/

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`,
  },
};

/* ── Search Results Mock Data ───────────────────────────────── */
export const mockSearchResults: SearchResults = {
  query: "authentication",
  projectId: "turborepo",
  language: null,
  results: [
    {
      id: "search-1",
      projectId: "turborepo",
      type: "file",
      filePath: "crates/turborepo-cache/src/http.rs",
      fileName: "http.rs",
      lineNumber: 25,
      snippet: '.header("Authorization", format!("Bearer {}", self.token))',
      matchedText: "Authorization",
      language: "rust",
    },
    {
      id: "search-2",
      projectId: "turborepo",
      type: "file",
      filePath: "crates/turborepo-cache/src/http.rs",
      lineNumber: 46,
      fileName: "http.rs",
      snippet: '.header("Authorization", format!("Bearer {}", self.token))',
      matchedText: "Authorization",
      language: "rust",
    },
    {
      id: "search-3",
      projectId: "turborepo",
      type: "decision",
      filePath: "docs/decisions/002-remote-cache.md",
      fileName: "002-remote-cache.md",
      lineNumber: 18,
      snippet: "Authentication is handled via bearer tokens with HMAC signatures",
      matchedText: "Authentication",
      language: "markdown",
    },
  ],
  totalCount: 3,
};
