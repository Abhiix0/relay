import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { queryKeys } from "../query-keys";
import type { AskAnswer } from "../types";

export function useAskHistory(id?: string) {
  return useQuery({
    queryKey: queryKeys.projects.ask(id ?? ""),
    queryFn: () => api.get<AskAnswer[]>(`/projects/${id}/ask`),
    enabled: Boolean(id),
  });
}

export function useAskQuestion(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (question: string) =>
      api.post<AskAnswer>(`/projects/${id}/ask`, { question }),
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.ask(id),
        });
      }
    },
  });
}
