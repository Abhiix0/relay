import type { Handoff } from "@/lib/api/types";

export const mockHandoffs: Handoff[] = [
  {
    id: "handoff_1_v3",
    projectId: "turborepo",
    title: "Lead Architect Handoff: Rust Core & Remote Cache Engine",
    summary:
      "Critical architectural invariants, daemon lifecycle, and operational gotchas for maintainers taking over Turborepo development.",
    version: 3,
    sections: [
      {
        id: "section_1",
        heading: "Project Overview",
        body: "Turborepo is a high-performance build system for JavaScript/TypeScript monorepos. The core engine is written in Rust for speed, with a TypeScript CLI wrapper.",
        sources: [
          {
            id: "h_src_readme",
            type: "readme",
            path: "README.md",
            url: "https://github.com/vercel/turbo/blob/main/README.md",
            snippet:
              "Turborepo is a high-performance build system for JavaScript and TypeScript codebases.",
          },
        ],
      },
      {
        id: "section_2",
        heading: "Core Architectural Invariant: Deterministic Hashing",
        body: "Never add an unstamped input into `compute_task_hash`. All file system reads must pass through the Git ignore filter.",
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
        id: "section_3",
        heading: "Authentication & Security Model",
        body: "Insufficient repository evidence to confidently document authentication implementation.",
        sources: [],
        insufficientEvidence: true,
      },
    ],
    createdAt: "2026-09-20T11:00:00Z",
    updatedAt: "2026-10-03T17:30:00Z",
  },
  {
    id: "handoff_1_v2",
    projectId: "turborepo",
    title: "Lead Architect Handoff: Rust Core & Remote Cache Engine",
    summary: "Architectural invariants and daemon lifecycle for maintainers.",
    version: 2,
    sections: [
      {
        id: "section_v2_1",
        heading: "Core Architectural Invariant: Deterministic Hashing",
        body: "Never add an unstamped input into `compute_task_hash`.",
        sources: [
          {
            id: "h_src_v2_1",
            type: "file",
            path: "crates/turborepo-lib/src/engine/builder.rs",
            url: "https://github.com/vercel/turbo/blob/main/crates/turborepo-lib/src/engine/builder.rs",
            snippet: "assert!(task_hash.is_deterministic(), 'Hash drift detected');",
          },
        ],
      },
    ],
    createdAt: "2026-09-20T11:00:00Z",
    updatedAt: "2026-09-25T14:00:00Z",
  },
  {
    id: "handoff_1_v1",
    projectId: "turborepo",
    title: "Turborepo Maintainer Handoff",
    summary: "Initial handoff documentation.",
    version: 1,
    sections: [
      {
        id: "section_v1_1",
        heading: "Core Architecture",
        body: "Turborepo uses Rust for the core engine and TypeScript for the CLI.",
        sources: [],
      },
    ],
    createdAt: "2026-09-20T11:00:00Z",
    updatedAt: "2026-09-20T11:00:00Z",
  },
];
