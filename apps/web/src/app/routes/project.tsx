/**
 * Project-scoped route table — all paths live under /app/projects/:id.
 *
 * K owns the sections marked "K". T adds feature pages under the section
 * marked "T — add routes here". No other file needs changing.
 */
import type { RouteObject } from "react-router";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProjectLayout } from "@/app/layouts/ProjectLayout";

export const projectRoutes: RouteObject[] = [
  {
    path: "projects/:id",
    element: <ProjectLayout />,
    errorElement: <NotFoundPage />,
    children: [
      // ── K: overview (index) ──────────────────────────────────
      {
        index: true,
        lazy: async () => {
          const { ProjectOverviewPage } = await import(
            "@/features/projects/ProjectOverviewPage"
          );
          return { Component: ProjectOverviewPage };
        },
      },

      // ── K: repository explorer ───────────────────────────────
      {
        path: "files",
        lazy: async () => {
          const { RepositoryExplorerPage } = await import(
            "@/features/repository/RepositoryExplorerPage"
          );
          return { Component: RepositoryExplorerPage };
        },
      },
      {
        path: "files/*",
        lazy: async () => {
          const { RepositoryExplorerPage } = await import(
            "@/features/repository/RepositoryExplorerPage"
          );
          return { Component: RepositoryExplorerPage };
        },
      },

      // ── K: search ────────────────────────────────────────────
      {
        path: "search",
        lazy: async () => {
          const { SearchPage } = await import("@/features/search/SearchPage");
          return { Component: SearchPage };
        },
      },

      // ── K: project settings ──────────────────────────────────
      {
        path: "settings",
        lazy: async () => {
          const { ProjectSettingsPage } = await import(
            "@/features/settings/ProjectSettingsPage"
          );
          return { Component: ProjectSettingsPage };
        },
      },

      // ── T — add routes here ───────────────────────────────────
      // Keep this comment; T registers their pages below this line.

      {
        path: "ask",
        lazy: async () => {
          const { AskPage } = await import("@/features/ask/AskPage");
          return { Component: AskPage };
        },
      },
      {
        path: "onboarding",
        lazy: async () => {
          const { OnboardingPage } = await import(
            "@/features/onboarding/OnboardingPage"
          );
          return { Component: OnboardingPage };
        },
      },
      {
        path: "handoff",
        lazy: async () => {
          const { HandoffPage } = await import(
            "@/features/handoff/HandoffPage"
          );
          return { Component: HandoffPage };
        },
      },
      {
        path: "handoffs/:handoffId?",
        lazy: async () => {
          const { HandoffPage } = await import(
            "@/features/handoff/HandoffPage"
          );
          return { Component: HandoffPage };
        },
      },
      {
        path: "decisions",
        lazy: async () => {
          const { DecisionsPage } = await import(
            "@/features/decisions/DecisionsPage"
          );
          return { Component: DecisionsPage };
        },
      },

      // ── K: new feature stubs (issues, pulls, commits, releases, ci)
      // These render a coming-soon empty state until the screens are built.
      {
        path: "issues",
        lazy: async () => {
          const { ComingSoonPage } = await import("@/pages/ComingSoonPage");
          return { element: <ComingSoonPage feature="Issues" /> };
        },
      },
      {
        path: "pulls",
        lazy: async () => {
          const { ComingSoonPage } = await import("@/pages/ComingSoonPage");
          return { element: <ComingSoonPage feature="Pull Requests" /> };
        },
      },
      {
        path: "commits",
        lazy: async () => {
          const { ComingSoonPage } = await import("@/pages/ComingSoonPage");
          return { element: <ComingSoonPage feature="Commits" /> };
        },
      },
      {
        path: "releases",
        lazy: async () => {
          const { ComingSoonPage } = await import("@/pages/ComingSoonPage");
          return { element: <ComingSoonPage feature="Releases" /> };
        },
      },
      {
        path: "ci",
        lazy: async () => {
          const { ComingSoonPage } = await import("@/pages/ComingSoonPage");
          return { element: <ComingSoonPage feature="CI / CD" /> };
        },
      },
    ],
  },
];
