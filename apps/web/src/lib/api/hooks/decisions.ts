import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { queryKeys } from "../query-keys";
import type { Decision } from "../types";

export function useDecisions(id?: string) {
  return useQuery({
    queryKey: queryKeys.projects.decisions(id ?? ""),
    queryFn: () => api.get<Decision[]>(`/projects/${id}/decisions`),
    enabled: Boolean(id),
  });
}

export function useCreateDecision(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Decision>) =>
      api.post<Decision>(`/projects/${id}/decisions`, data),
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.decisions(id),
        });
      }
    },
  });
}
