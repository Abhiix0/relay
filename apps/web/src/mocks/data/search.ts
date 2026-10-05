import type { SearchResults } from "@/lib/api/types";

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
      fileName: "http.rs",
      lineNumber: 46,
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
