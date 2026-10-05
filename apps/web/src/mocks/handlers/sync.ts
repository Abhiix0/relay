import { http, HttpResponse } from "msw";
import { mockSyncJob } from "../data/sync";
import type { SyncJob } from "@/lib/api/types";
import { projects } from "./projects";

let currentSyncJob: SyncJob = { ...mockSyncJob };

export const syncHandlers = [
  http.get("/api/v1/projects/:id/sync", () => {
    return HttpResponse.json(currentSyncJob);
  }),

  http.post("/api/v1/projects/:id/sync", ({ params }) => {
    const projectId = String(params.id);
    currentSyncJob = {
      id: `sync_${Date.now()}`,
      projectId,
      status: "queued",
      progress: 0,
      error: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
    };

    setTimeout(() => { currentSyncJob.status = "running"; currentSyncJob.progress = 25; }, 500);
    setTimeout(() => { currentSyncJob.progress = 50; }, 1500);
    setTimeout(() => { currentSyncJob.progress = 75; }, 2500);
    setTimeout(() => {
      currentSyncJob.status = "succeeded";
      currentSyncJob.progress = 100;
      currentSyncJob.completedAt = new Date().toISOString();
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        project.syncStatus = "succeeded";
        project.lastSyncedAt = new Date().toISOString();
        if (project.health) {
          project.health.overall = Math.min(100, project.health.overall + 10);
          project.health.documentation = Math.min(100, project.health.documentation + 5);
        }
      }
    }, 3500);

    return HttpResponse.json(currentSyncJob);
  }),
];
