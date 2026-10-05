import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import { queryKeys } from "../query-keys";
import type { SearchResults } from "../types";

export function useGlobalSearch(
  query: string,
  projectId?: string | null,
  language?: string | null
) {
  return useQuery({
    queryKey: queryKeys.search.results(query, projectId, language),
    queryFn: () => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (projectId) params.set("projectId", projectId);
      if (language) params.set("language", language);
      const qs = params.toString();
      return api.get<SearchResults>(`/search${qs ? `?${qs}` : ""}`);
    },
    enabled: Boolean(query),
  });
}
