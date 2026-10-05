/**
 * Legacy URL redirect table.
 * Exported as a plain array so it can be imported in tests without
 * triggering createBrowserRouter (which requires `document`).
 */
export const LEGACY_REDIRECTS: Array<{ from: string; to: string }> = [
  { from: "/dashboard",                         to: "/app" },
  { from: "/projects",                          to: "/app/projects" },
  { from: "/profile",                           to: "/app/profile" },
  { from: "/app/projects/:id/explorer",         to: "/app/projects/:id/files" },
  { from: "/projects/:id",                      to: "/app/projects/:id" },
  { from: "/projects/:id/ask",                  to: "/app/projects/:id/ask" },
  { from: "/projects/:id/files",                to: "/app/projects/:id/files" },
  { from: "/projects/:id/onboarding",           to: "/app/projects/:id/onboarding" },
  { from: "/projects/:id/handoff",              to: "/app/projects/:id/handoff" },
  { from: "/projects/:id/decisions",            to: "/app/projects/:id/decisions" },
  { from: "/projects/:id/search",               to: "/app/projects/:id/search" },
  { from: "/projects/:id/settings",             to: "/app/projects/:id/settings" },
  { from: "/projects/:id/explorer",             to: "/app/projects/:id/files" },
];
