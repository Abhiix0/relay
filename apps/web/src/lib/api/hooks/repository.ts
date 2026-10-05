import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import { queryKeys } from "../query-keys";
import type { FileContent, RepositoryTree } from "../types";

export function useRepositoryTree(id?: string) {
  return useQuery({
    queryKey: queryKeys.projects.repository.tree(id ?? ""),
    queryFn: () =>
      api.get<RepositoryTree>(`/projects/${id}/repository/tree`),
    enabled: Boolean(id),
  });
}

export function useFileContent(id?: string, filePath?: string) {
  return useQuery({
    queryKey: queryKeys.projects.repository.file(id ?? "", filePath ?? ""),
    queryFn: () =>
      api.get<FileContent>(
        `/projects/${id}/repository/files/${filePath}`
      ),
    enabled: Boolean(id && filePath),
  });
}
