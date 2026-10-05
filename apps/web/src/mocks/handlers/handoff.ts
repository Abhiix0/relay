import { http, HttpResponse } from "msw";
import { mockHandoffs } from "../data/handoff";
import type { Handoff } from "@/lib/api/types";

const handoffs = [...mockHandoffs];

export const handoffHandlers = [
  http.get("/api/v1/projects/:id/handoffs", ({ params, request }) => {
    const url = new URL(request.url);
    const version = url.searchParams.get("version");
    const projectHandoffs = handoffs.filter((h) => h.projectId === params.id);

    if (version !== null) {
      const found = projectHandoffs.find((h) => h.version === Number(version));
      return found
        ? HttpResponse.json(found)
        : HttpResponse.json({ message: "Version not found", code: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json(projectHandoffs);
  }),

  http.get("/api/v1/projects/:id/handoffs/current", ({ params }) => {
    const projectHandoffs = handoffs.filter((h) => h.projectId === params.id);
    const current = [...projectHandoffs].sort((a, b) => b.version - a.version)[0];
    if (!current) {
      return HttpResponse.json(
        { message: "No handoff found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    return HttpResponse.json(current);
  }),

  http.post("/api/v1/projects/:id/handoffs/generate", async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const body = (await request.json()) as { regenerate?: boolean };
    const projectHandoffs = handoffs.filter((h) => h.projectId === params.id);
    const latestVersion =
      projectHandoffs.length > 0
        ? Math.max(...projectHandoffs.map((h) => h.version))
        : 0;

    const current = projectHandoffs.find((h) => h.version === latestVersion);
    if (current) {
      if (body.regenerate) current.updatedAt = new Date().toISOString();
      return HttpResponse.json(current);
    }
    const fallback = handoffs[0];
    return HttpResponse.json(fallback);
  }),

  http.patch("/api/v1/projects/:id/handoffs/current", async ({ request, params }) => {
    const body = (await request.json()) as Partial<Handoff>;
    const projectHandoffs = handoffs.filter((h) => h.projectId === params.id);
    const current = [...projectHandoffs].sort((a, b) => b.version - a.version)[0];
    if (!current) {
      return HttpResponse.json(
        { message: "No handoff found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    Object.assign(current, body, { updatedAt: new Date().toISOString() });
    return HttpResponse.json(current);
  }),

  http.post("/api/v1/projects/:id/handoffs/versions", async ({ params }) => {
    const projectHandoffs = handoffs.filter((h) => h.projectId === params.id);
    const current = [...projectHandoffs].sort((a, b) => b.version - a.version)[0];
    if (!current) {
      return HttpResponse.json(
        { message: "No current handoff to version", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    const newVersion: Handoff = {
      ...current,
      id: `${current.id.split("_v")[0]}_v${current.version + 1}`,
      version: current.version + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handoffs.unshift(newVersion);
    return HttpResponse.json(newVersion, { status: 201 });
  }),

  http.post("/api/v1/projects/:id/handoffs", async ({ request, params }) => {
    const body = (await request.json()) as Partial<Handoff>;
    const newHandoff: Handoff = {
      id: `handoff_${Date.now()}`,
      projectId: String(params.id),
      title: body.title ?? "Architecture & System Handoff",
      summary: body.summary ?? "Summary of recent architectural evolution.",
      version: 1,
      sections: body.sections ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handoffs.unshift(newHandoff);
    return HttpResponse.json(newHandoff, { status: 201 });
  }),
];
