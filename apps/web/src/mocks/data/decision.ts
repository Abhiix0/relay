import type { Decision } from "@/lib/api/types";

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
    summary:
      "Standardizing cache transport over HTTP/2 with chunked streaming and HMAC signatures.",
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
