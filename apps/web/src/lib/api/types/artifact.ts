export type ArtifactType =
  | "file"
  | "issue"
  | "pr"
  | "commit"
  | "readme"
  | "decision";

export interface Artifact {
  id: string;
  projectId: string;
  type: ArtifactType;
  title: string;
  path: string | null;
  url: string | null;
  summary: string | null;
  createdAt: string;
}

export interface Source {
  id: string;
  type: ArtifactType;
  path: string | null;
  url: string | null;
  snippet: string;
}

export interface ActivityEvent {
  id: string;
  projectId: string;
  type: "sync" | "ask" | "decision" | "onboarding" | "handoff";
  title: string;
  description: string;
  createdAt: string;
}
