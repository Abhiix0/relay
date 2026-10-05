/**
 * Authenticated app route table — top-level /app/* pages.
 * Project sub-routes live in project.tsx.
 */
import type { RouteObject } from "react-router";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AppLayout } from "@/app/layouts/AppLayout";
import { projectRoutes } from "./project";

export const appRoutes: RouteObject[] = [
  {
    path: "app",
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      // /app → dashboard
      {
        index: true,
        lazy: async () => {
          const { DashboardPage } = await import(
            "@/features/dashboard/DashboardPage"
          );
          return { Component: DashboardPage };
        },
      },

      // /app/projects (list)
      {
        path: "projects",
        lazy: async () => {
          const { ProjectsListPage } = await import(
            "@/features/projects/ProjectsListPage"
          );
          return { Component: ProjectsListPage };
        },
      },

      // /app/projects/:id/* — own sub-layout
      ...projectRoutes,

      // /app/search
      {
        path: "search",
        lazy: async () => {
          const { SearchPage } = await import("@/features/search/SearchPage");
          return { Component: SearchPage };
        },
      },

      // /app/settings/:tab?
      {
        path: "settings/:tab?",
        lazy: async () => {
          const { SettingsPage } = await import(
            "@/features/settings/SettingsPage"
          );
          return { Component: SettingsPage };
        },
      },

      // /app/profile
      {
        path: "profile",
        lazy: async () => {
          const { ProfilePage } = await import(
            "@/features/profile/ProfilePage"
          );
          return { Component: ProfilePage };
        },
      },
    ],
  },
];
