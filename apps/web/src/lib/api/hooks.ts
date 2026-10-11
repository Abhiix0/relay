import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import { queryKeys } from "./query-keys";
import type {
  ActivityEvent,
  Artifact,
  ArtifactDetail,
  AskAnswer,
  Decision,
  GithubReposResponse,
  Handoff,
  OnboardingPlan,
  Project,
  SyncJob,
  User,
} from "./types";

/* ── Auth Hooks ─────────────────────────────────────────────── */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => api.get<User>("/auth/me"),
  });
}

/* ── Project Hooks ──────────────────────────────────────────── */
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => api.get<Project[]>("/projects"),
    refetchInterval: (query) =>
      query.state.data?.some((p) => p.syncStatus === "running") ? 2000 : false,
  });
}

export function useGithubRepos(q: string) {
  return useQuery({
    queryKey: ["github", "repos", q] as const,
    queryFn: () =>
      api.get<GithubReposResponse>(`/github/repos${q ? `?q=${encodeURIComponent(q)}` : ""}`),
    staleTime: 30_000,
  });
}

export function useProject(id?: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id || ""),
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: Boolean(id),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => api.post<undefined>("/auth/logout"),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { fullName: string; description?: string; language?: string }) =>
      api.post<Project>("/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<undefined>(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

/* ── Artifacts & Activity ────────────────────────────────────── */
export function useProjectArtifacts(id?: string, type?: string, query?: string) {
  return useQuery({
    queryKey: [...queryKeys.projects.artifacts(id || ""), { type, query }] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (query) params.set("q", query);
      const qs = params.toString();
      return api.get<Artifact[]>(`/projects/${id}/artifacts${qs ? `?${qs}` : ""}`);
    },
    enabled: Boolean(id),
  });
}

export function useArtifact(projectId?: string, artifactId?: string) {
  return useQuery({
    queryKey: [...queryKeys.projects.artifacts(projectId || ""), "detail", artifactId] as const,
    queryFn: () => api.get<ArtifactDetail>(`/projects/${projectId}/artifacts/${artifactId}`),
    enabled: Boolean(projectId && artifactId),
  });
}

export function useProjectActivity(id?: string) {
  return useQuery({
    queryKey: queryKeys.projects.activity(id || ""),
    queryFn: () => api.get<ActivityEvent[]>(`/projects/${id}/activity`),
    enabled: Boolean(id),
  });
}

/* ── Ask AI Agent ───────────────────────────────────────────── */
export function useAskHistory(id?: string) {
  return useQuery({
    queryKey: queryKeys.projects.ask(id || ""),
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
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.ask(id) });
      }
    },
  });
}

/* ── Architecture Decisions ─────────────────────────────────── */
export function useDecisions(id?: string) {
  return useQuery({
    queryKey: queryKeys.projects.decisions(id || ""),
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
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.decisions(id) });
      }
    },
  });
}

/* ── Onboarding Guide ───────────────────────────────────────── */
export function useOnboardingData(id?: string) {
  return useQuery({
    queryKey: [...queryKeys.projects.onboarding(id || ""), "data"] as const,
    queryFn: () => api.get<import("./types").OnboardingData>(`/projects/${id}/onboarding/data`),
    enabled: Boolean(id),
  });
}

export function useOnboarding(id?: string) {
  return useQuery({
    queryKey: queryKeys.projects.onboarding(id || ""),
    queryFn: () => api.get<OnboardingPlan>(`/projects/${id}/onboarding`),
    enabled: Boolean(id),
  });
}

export function useToggleOnboardingItem(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
      api.patch<OnboardingPlan>(`/projects/${id}/onboarding/items/${itemId}`, { completed }),
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.onboarding(id) });
      }
    },
  });
}

/* ── Handoff Briefings ──────────────────────────────────────── */
export function useHandoffs(id?: string) {
  return useQuery({
    queryKey: queryKeys.projects.handoffs(id || ""),
    queryFn: () => api.get<Handoff[]>(`/projects/${id}/handoffs`),
    enabled: Boolean(id),
  });
}

export function useHandoff(id?: string, version?: number) {
  return useQuery({
    queryKey: [...queryKeys.projects.handoffs(id || ""), version] as const,
    queryFn: () => {
      const url = version !== undefined 
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
    mutationFn: (regenerate: boolean = false) =>
      api.post<Handoff>(`/projects/${id}/handoffs/generate`, { regenerate }),
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.handoffs(id) });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.handoffs(id) });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.handoffs(id) });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.handoffs(id) });
      }
    },
  });
}

/* ── Sync Status ────────────────────────────────────────────── */
export function useSyncStatus(id?: string) {
  return useQuery({
    queryKey: queryKeys.projects.sync(id || ""),
    queryFn: () => api.get<SyncJob>(`/projects/${id}/sync`),
    enabled: Boolean(id),
  });
}

export function useTriggerSync(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<SyncJob>(`/projects/${id}/sync`),
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.sync(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      }
    },
  });
}

/* ── Repository Tree & Files ────────────────────────────────── */
export function useRepositoryTree(id?: string) {
  return useQuery({
    queryKey: [...queryKeys.projects.detail(id || ""), "repository", "tree"] as const,
    queryFn: () => api.get<import("./types").RepositoryTree>(`/projects/${id}/repository/tree`),
    enabled: Boolean(id),
  });
}

export function useFileContent(id?: string, filePath?: string) {
  return useQuery({
    queryKey: [...queryKeys.projects.detail(id || ""), "repository", "files", filePath] as const,
    queryFn: () => api.get<import("./types").FileContent>(`/projects/${id}/repository/files/${filePath?.split("/").map(encodeURIComponent).join("/")}`),
    enabled: Boolean(id && filePath),
  });
}

/* ── Global Search ──────────────────────────────────────────── */
export function useGlobalSearch(
  query: string,
  projectId?: string | null,
  language?: string | null
) {
  return useQuery({
    queryKey: ["search", query, projectId, language] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (projectId) params.set("projectId", projectId);
      if (language) params.set("language", language);
      const qs = params.toString();
      return api.get<import("./types").SearchResults>(`/search${qs ? `?${qs}` : ""}`);
    },
    enabled: Boolean(query),
  });
}
