import type { FileContent, RepositoryTree } from "@/lib/api/types";

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
              id: "file-engine-builder",
              name: "builder.rs",
              path: "crates/turborepo-lib/src/engine/builder.rs",
              type: "file",
              language: "rust",
              size: 15420,
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
    {
      id: "root-packages",
      name: "packages",
      path: "packages",
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
    {
      id: "root-readme",
      name: "README.md",
      path: "README.md",
      type: "file",
      language: "markdown",
      size: 8940,
    },
  ],
};

export const mockFileContents: Record<string, FileContent> = {
  "crates/turborepo-lib/src/engine/builder.rs": {
    projectId: "turborepo",
    path: "crates/turborepo-lib/src/engine/builder.rs",
    name: "builder.rs",
    language: "rust",
    size: 15420,
    content: `pub struct EngineBuilder {
    graph: DiGraph<Task, ()>,
}

impl EngineBuilder {
    pub fn build_execution_graph(&self) -> Result<TaskGraph, EngineError> {
        if self.has_cycles() {
            return Err(EngineError::CyclicDependency);
        }
        Ok(TaskGraph { graph: self.graph.clone() })
    }
}`,
  },
  "crates/turborepo-cache/src/http.rs": {
    projectId: "turborepo",
    path: "crates/turborepo-cache/src/http.rs",
    name: "http.rs",
    language: "rust",
    size: 8720,
    content: `pub async fn fetch_artifact(&self, hash: &str) -> Result<Option<ArtifactStream>, CacheError> {
    let url = format!("{}/v8/artifacts/{}", self.base_url, hash);
    let response = self.client.get(&url)
        .header("Authorization", format!("Bearer {}", self.token))
        .send().await?;
    match response.status() {
        StatusCode::OK => Ok(Some(ArtifactStream::new(response.bytes_stream()))),
        StatusCode::NOT_FOUND => Ok(None),
        _ => Err(CacheError::RequestFailed(response.status())),
    }
}`,
  },
  "README.md": {
    projectId: "turborepo",
    path: "README.md",
    name: "README.md",
    language: "markdown",
    size: 8940,
    content: `# Turborepo\n\nHigh-performance build system for JavaScript and TypeScript codebases.`,
  },
};
