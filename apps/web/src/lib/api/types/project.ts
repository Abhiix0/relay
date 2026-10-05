export interface Project {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string | null;
  owner: string;
  syncStatus: "queued" | "running" | "succeeded" | "failed";
  lastSyncedAt: string | null;
  stats: {
    commits: number;
    pullRequests: number;
    issues: number;
    releases: number;
    files: number;
  };
  health?: {
    overall: number;
    documentation: number;
    activity: "high" | "medium" | "low";
  };
  healthLabel: string;
  createdAt: string;
  updatedAt: string;
}
