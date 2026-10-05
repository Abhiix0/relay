import type { AskAnswer } from "@/lib/api/types";

export const mockAskAnswers: AskAnswer[] = [
  {
    id: "ask_1",
    projectId: "turborepo",
    question: "How does Turborepo's hashing algorithm determine cache hits?",
    answer:
      "Turborepo computes a deterministic 128-bit hash per task execution. The key inputs are:\n\n1. **Task Definition Hash**: Extracted from `turbo.json`.\n2. **Package Git Tree Hash**: Hashes of matched files defined in `inputs`.\n3. **Resolved Dependency Hashes**: Hashes of all upstream dependencies in the workspace DAG.\n4. **Specified Environment Variables**: Exact values of explicitly declared env vars.",
    sources: [
      {
        id: "src_1",
        type: "file",
        path: "crates/turborepo-lib/src/engine/builder.rs",
        url: "https://github.com/vercel/turbo/blob/main/crates/turborepo-lib/src/engine/builder.rs",
        snippet:
          "let task_hash = hasher.compute_task_hash(&task_spec, &package_inputs, &env_map)?;",
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
        snippet:
          "Cache keys must remain bit-for-bit identical across Go and Rust implementations.",
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
      "The client connects to the background daemon via `packages/turbo/src/commands/run.ts`. It invokes `ensureDaemonRunning()` which checks for an active socket file.",
    sources: [
      {
        id: "src_4",
        type: "file",
        path: "packages/turbo/src/commands/run.ts",
        url: "https://github.com/vercel/turbo/blob/main/packages/turbo/src/commands/run.ts",
        snippet:
          "const daemonClient = await connectOrSpawnDaemon({ workspaceRoot, timeoutMs: 2500 });",
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
];
