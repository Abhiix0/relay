import { http, HttpResponse } from "msw";
import { mockArtifacts, mockActivityEvents } from "../data/artifact";

export const artifactHandlers = [
  http.get("/api/v1/projects/:id/artifacts", ({ request, params }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const query = url.searchParams.get("q")?.toLowerCase();

    let list = mockArtifacts.filter((a) => a.projectId === params.id);
    if (type && type !== "all") {
      list = list.filter((a) => a.type === type);
    }
    if (query) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          (a.summary?.toLowerCase().includes(query) ?? false) ||
          (a.path?.toLowerCase().includes(query) ?? false)
      );
    }
    return HttpResponse.json(list);
  }),

  http.get("/api/v1/projects/:id/activity", ({ params }) => {
    const events = mockActivityEvents.filter((e) => e.projectId === params.id);
    return HttpResponse.json(events);
  }),
];
