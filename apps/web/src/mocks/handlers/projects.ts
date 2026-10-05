import { http, HttpResponse } from "msw";
import { mockProjects } from "../data/project";
import type { Project } from "@/lib/api/types";

// Mutable in-memory copy
export const projects = [...mockProjects];

export const projectHandlers = [
  http.get("/api/v1/projects", () => {
    return HttpResponse.json(projects);
  }),

  http.get("/api/v1/projects/:id", ({ params }) => {
    const project = projects.find((p) => p.id === params.id);
    if (!project) {
      return HttpResponse.json(
        { message: "Project not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    return HttpResponse.json(project);
  }),

  http.post("/api/v1/projects", async ({ request }) => {
    const body = (await request.json()) as Partial<Project>;
    const fullName = body.fullName ?? "owner/repo";
    const name = fullName.split("/")[1] ?? fullName;
    const newProject: Project = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name,
      fullName,
      description: body.description ?? "Connected GitHub repository.",
      language: body.language ?? "TypeScript",
      owner: fullName.split("/")[0] ?? "user",
      syncStatus: "running",
      lastSyncedAt: new Date().toISOString(),
      stats: { commits: 120, pullRequests: 8, issues: 4, releases: 1, files: 240 },
      health: { overall: 0, documentation: 0, activity: "low" },
      healthLabel: "Indexing in progress",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.unshift(newProject);
    return HttpResponse.json(newProject, { status: 201 });
  }),

  http.delete("/api/v1/projects/:id", ({ params }) => {
    const idx = projects.findIndex((p) => p.id === params.id);
    if (idx !== -1) projects.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
