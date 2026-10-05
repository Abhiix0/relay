import { http, HttpResponse } from "msw";
import { mockSearchResults } from "../data/search";
import type { SearchResults } from "@/lib/api/types";

export const searchHandlers = [
  http.get("/api/v1/search", ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";
    const projectId = url.searchParams.get("projectId");
    const language = url.searchParams.get("language");

    let results = mockSearchResults.results;

    if (projectId && projectId !== "all") {
      results = results.filter((r) => r.projectId === projectId);
    }
    if (language && language !== "all") {
      results = results.filter((r) => r.language === language);
    }
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (r) =>
          r.snippet.toLowerCase().includes(q) ||
          r.filePath.toLowerCase().includes(q) ||
          (r.matchedText?.toLowerCase().includes(q) ?? false)
      );
    }

    const response: SearchResults = {
      query,
      projectId: projectId ?? null,
      language: language ?? null,
      results,
      totalCount: results.length,
    };
    return HttpResponse.json(response);
  }),
];
