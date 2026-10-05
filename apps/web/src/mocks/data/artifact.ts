import type { ActivityEvent, Artifact } from "@/lib/api/types";

export const mockArtifacts: Artifact[] = [
  {
    id: "art_1",
    projectId: "turborepo",
    type: "file",
    title: "crates/turborepo-lib/src/engine/builder.rs",
    path: "crates/turborepo-lib/src/engine/builder.rs",
    url: "https://github.com/vercel/turbo/blob/main/crates/turborepo-lib/src/engine/builder.rs",
    summary:
      "Engine construction logic that builds the directed acyclic graph (DAG) of task dependencies.",
    createdAt: "2026-09-28T10:00:00Z",
  },
  {
    id: "art_2",
    projectId: "turborepo",
    type: "file",
    title: "crates/turborepo-cache/src/http.rs",
    path: "crates/turborepo-cache/src/http.rs",
    url: "https://github.com/vercel/turbo/blob/main/crates/turborepo-cache/src/http.rs",
    summary:
      "HTTP/2 client for Vercel Remote Caching with gzip payload compression and bearer auth.",
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
    summary:
      "Migration of the Go-based turbo daemon to Rust for memory efficiency and zero-cost threading.",
    createdAt: "2026-08-15T09:00:00Z",
  },
  {
    id: "art_5",
    projectId: "turborepo",
    type: "pr",
    title: "PR #8492: Optimize package-graph traversal with Petgraph",
    path: "pull/8492",
    url: "https://github.com/vercel/turbo/pull/8492",
    summary:
      "Replaces naive cycle detection with Tarjan SCC algorithm in petgraph, reducing startup by 45ms.",
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
    description:
      "Question: 'How does Turborepo's hashing algorithm determine cache hits?' (3 sources cited)",
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
    description:
      "Updated version 3 of 'Lead Architect Handoff: Rust Core & Remote Cache Engine'",
    createdAt: "2026-10-03T17:30:00Z",
  },
];
