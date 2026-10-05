import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import { queryKeys } from "../query-keys";
import type { User } from "../types";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => api.get<User>("/auth/me"),
  });
}
