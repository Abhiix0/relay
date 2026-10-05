import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { queryKeys } from "../query-keys";
import type { OnboardingData, OnboardingPlan } from "../types";

export function useOnboardingData(id?: string) {
  return useQuery({
    queryKey: [
      ...queryKeys.projects.onboarding(id ?? ""),
      "data",
    ] as const,
    queryFn: () =>
      api.get<OnboardingData>(`/projects/${id}/onboarding/data`),
    enabled: Boolean(id),
  });
}

export function useOnboarding(id?: string) {
  return useQuery({
    queryKey: queryKeys.projects.onboarding(id ?? ""),
    queryFn: () =>
      api.get<OnboardingPlan>(`/projects/${id}/onboarding`),
    enabled: Boolean(id),
  });
}

export function useToggleOnboardingItem(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      completed,
    }: {
      itemId: string;
      completed: boolean;
    }) =>
      api.patch<OnboardingPlan>(
        `/projects/${id}/onboarding/items/${itemId}`,
        { completed }
      ),
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.onboarding(id),
        });
      }
    },
  });
}
