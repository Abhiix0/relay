import type { SyncJob } from "@/lib/api/types";

export const mockSyncJob: SyncJob = {
  id: "sync_job_latest",
  projectId: "turborepo",
  status: "succeeded",
  progress: 100,
  error: null,
  startedAt: "2026-10-03T18:28:10Z",
  completedAt: "2026-10-03T18:30:00Z",
};
