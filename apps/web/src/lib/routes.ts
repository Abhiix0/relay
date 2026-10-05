/**
 * Typed route path builders.
 *
 * Use these everywhere instead of hardcoding strings.
 * T can import and extend project() with their own sub-paths.
 *
 * @example
 *   navigate(routes.project("turborepo").ask())
 *   <Link to={routes.app.search()}>Search</Link>
 */

// ── Public ────────────────────────────────────────────────────────

export const routes = {
  landing: () => "/" as const,
  signIn: (next?: string) =>
    next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in",

  // ── App (authenticated) ────────────────────────────────────────
  app: {
    root: () => "/app" as const,
    search: () => "/app/search" as const,
    settings: (tab?: string) =>
      tab ? `/app/settings/${tab}` : "/app/settings",
    profile: () => "/app/profile" as const,
    projects: () => "/app/projects" as const,
  },

  // ── Project ───────────────────────────────────────────────────
  project: (id: string) => ({
    root: () => `/app/projects/${id}` as const,
    files: (filePath?: string) =>
      filePath
        ? `/app/projects/${id}/files/${filePath}`
        : `/app/projects/${id}/files`,
    ask: () => `/app/projects/${id}/ask` as const,
    onboarding: () => `/app/projects/${id}/onboarding` as const,
    handoff: (handoffId?: string) =>
      handoffId
        ? `/app/projects/${id}/handoffs/${handoffId}`
        : `/app/projects/${id}/handoff`,
    decisions: () => `/app/projects/${id}/decisions` as const,
    search: () => `/app/projects/${id}/search` as const,
    settings: () => `/app/projects/${id}/settings` as const,
    // New screens (K2+ scope — T registers these in project routes)
    issues: () => `/app/projects/${id}/issues` as const,
    pulls: () => `/app/projects/${id}/pulls` as const,
    commits: () => `/app/projects/${id}/commits` as const,
    releases: () => `/app/projects/${id}/releases` as const,
    ci: () => `/app/projects/${id}/ci` as const,
  }),

  // ── Dev only ──────────────────────────────────────────────────
  designSystem: () => "/design-system" as const,

  // ── Legacy redirects (kept for reference in redirect table) ───
  _legacy: {
    dashboard: () => "/dashboard" as const,
    profile: () => "/profile" as const,
    projectsRoot: () => "/projects" as const,
    projectDetail: (id: string) => `/projects/${id}` as const,
    projectSubpath: (id: string, sub: string) => `/projects/${id}/${sub}` as const,
    appProjectExplorer: (id: string) => `/app/projects/${id}/explorer` as const,
  },
} as const;
