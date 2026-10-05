import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { queryKeys } from "../query-keys";
import type { Handoff } from "../types";

export function useHandoffs(id?: string) {
  return useQuery({
    queryKey: queryKeys.projects.handoffs(id ?? ""),
    queryFn: () => api.get<Handoff[]>(`/projects/${id}/handoffs`),
    enabled: Boolean(id),
  });
}

export function useHandoff(id?: string, version?: number) {
  return useQuery({
    queryKey: [
      ...queryKeys.projects.handoffs(id ?? ""),
      version,
    ] as const,
    queryFn: () => {
      const url =
        version !== undefined
          ? `/projects/${id}/handoffs?version=${version}`
          : `/projects/${id}/handoffs/current`;
      return api.get<Handoff>(url);
    },
    enabled: Boolean(id),
  });
}

export function useGenerateHandoff(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (regenerate: boolean) =>
      api.post<Handoff>(`/projects/${id}/handoffs/generate`, { regenerate }),
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.handoffs(id),
        });
      }
    },
  });
}

export function useUpdateHandoff(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Handoff>) =>
      api.patch<Handoff>(`/projects/${id}/handoffs/current`, data),
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.handoffs(id),
        });
      }
    },
  });
}

export function useCreateHandoffVersion(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (description?: string) =>
      api.post<Handoff>(`/projects/${id}/handoffs/versions`, { description }),
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.handoffs(id),
        });
      }
    },
  });
}

export function useCreateHandoff(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Handoff>) =>
      api.post<Handoff>(`/projects/${id}/handoffs`, data),
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.handoffs(id),
        });
      }
    },
  });
}
