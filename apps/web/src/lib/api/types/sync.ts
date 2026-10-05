import type { Project } from "./project";

export interface SyncJob {
  id: string;
  projectId: string;
  status: Project["syncStatus"];
  progress: number;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
}
