import { createBrowserRouter, RouterProvider } from "react-router";
import { AskPage } from "@/features/ask/AskPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { DecisionsPage } from "@/features/decisions/DecisionsPage";
import { ExplorerPage } from "@/features/explorer/ExplorerPage";
import { HandoffPage } from "@/features/handoff/HandoffPage";
import { LandingPage } from "@/features/landing/LandingPage";
import { OnboardingPage } from "@/features/onboarding/OnboardingPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { ProjectOverviewPage } from "@/features/projects/ProjectOverviewPage";
import { SearchPage } from "@/features/search/SearchPage";
import { ProjectSettingsPage } from "@/features/settings/ProjectSettingsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SignInPage } from "@/pages/SignInPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/sign-in",
    element: <SignInPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/app",
    element: <DashboardPage />,
  },
  {
    path: "/app/projects",
    lazy: async () => {
      const { ProjectsListPage } = await import("@/features/projects/ProjectsListPage");
      return { Component: ProjectsListPage };
    },
  },
  {
    path: "/projects",
    element: <DashboardPage />,
  },
  {
    path: "/app/projects/:id",
    element: <ProjectOverviewPage />,
  },
  {
    path: "/projects/:id",
    element: <ProjectOverviewPage />,
  },
  {
    path: "/app/projects/:id/ask",
    element: <AskPage />,
  },
  {
    path: "/app/projects/:id/explorer",
    element: <ExplorerPage />,
  },
  {
    path: "/app/projects/:id/onboarding",
    element: <OnboardingPage />,
  },
  {
    path: "/app/projects/:id/handoff",
    element: <HandoffPage />,
  },
  {
    path: "/app/projects/:id/decisions",
    element: <DecisionsPage />,
  },
  {
    path: "/app/projects/:id/search",
    element: <SearchPage />,
  },
  {
    path: "/app/projects/:id/settings",
    element: <ProjectSettingsPage />,
  },
  {
    path: "/projects/:id",
    element: <ProjectOverviewPage />,
  },
  {
    path: "/projects/:id/ask",
    element: <AskPage />,
  },
  {
    path: "/projects/:id/explorer",
    element: <ExplorerPage />,
  },
  {
    path: "/projects/:id/onboarding",
    element: <OnboardingPage />,
  },
  {
    path: "/projects/:id/handoff",
    element: <HandoffPage />,
  },
  {
    path: "/projects/:id/decisions",
    element: <DecisionsPage />,
  },
  {
    path: "/projects/:id/search",
    element: <SearchPage />,
  },
  {
    path: "/projects/:id/settings",
    element: <ProjectSettingsPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/design-system",
    lazy: async () => {
      const { DesignSystemPage } = await import("@/pages/DesignSystemPage");
      return { Component: DesignSystemPage };
    },
  },
  {
    path: "/404",
    element: <NotFoundPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
