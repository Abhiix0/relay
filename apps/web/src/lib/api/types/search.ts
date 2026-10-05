import type { ArtifactType } from "./artifact";

export interface SearchResultItem {
  id: string;
  projectId: string;
  type: ArtifactType;
  filePath: string;
  fileName: string;
  lineNumber: number | null;
  snippet: string;
  matchedText?: string;
  language: string | null;
}

export interface SearchResults {
  query: string;
  projectId: string | null;
  language: string | null;
  results: SearchResultItem[];
  totalCount: number;
}
