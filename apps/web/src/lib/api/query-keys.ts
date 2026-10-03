export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  projects: {
    all: ["projects"] as const,
    detail: (id: string) => ["projects", id] as const,
    artifacts: (id: string) => ["projects", id, "artifacts"] as const,
    activity: (id: string) => ["projects", id, "activity"] as const,
    ask: (id: string) => ["projects", id, "ask"] as const,
    decisions: (id: string) => ["projects", id, "decisions"] as const,
    onboarding: (id: string) => ["projects", id, "onboarding"] as const,
    handoffs: (id: string) => ["projects", id, "handoffs"] as const,
    sync: (id: string) => ["projects", id, "sync"] as const,
  },
} as const;
