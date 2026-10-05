import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import { queryKeys } from "../query-keys";
import type { ActivityEvent, Artifact } from "../types";

export function useProjectArtifacts(
  id?: string,
  type?: string,
  query?: string
) {
  return useQuery({
    queryKey: [
      ...queryKeys.projects.artifacts(id ?? ""),
      { type, query },
    ] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (query) params.set("q", query);
      const qs = params.toString();
      return api.get<Artifact[]>(
        `/projects/${id}/artifacts${qs ? `?${qs}` : ""}`
      );
    },
    enabled: Boolean(id),
  });
}

export function useProjectActivity(id?: string) {
  return useQuery({
    queryKey: queryKeys.projects.activity(id ?? ""),
    queryFn: () =>
      api.get<ActivityEvent[]>(`/projects/${id}/activity`),
    enabled: Boolean(id),
  });
}
