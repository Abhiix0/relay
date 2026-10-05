import { http, HttpResponse } from "msw";
import { mockDecisions } from "../data/decision";
import type { Decision } from "@/lib/api/types";

const decisions = [...mockDecisions];

export const decisionHandlers = [
  http.get("/api/v1/projects/:id/decisions", ({ params }) => {
    return HttpResponse.json(decisions.filter((d) => d.projectId === params.id));
  }),

  http.post("/api/v1/projects/:id/decisions", async ({ request, params }) => {
    const body = (await request.json()) as Partial<Decision>;
    const newDecision: Decision = {
      id: `dec_${Date.now()}`,
      projectId: String(params.id),
      title: body.title ?? "Untitled Decision",
      summary: body.summary ?? "No summary provided.",
      rationale: body.rationale ?? "No rationale provided.",
      sources: body.sources ?? [],
      createdAt: new Date().toISOString(),
    };
    decisions.unshift(newDecision);
    return HttpResponse.json(newDecision, { status: 201 });
  }),
];
