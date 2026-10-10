import { createBrowserRouter, Navigate, Route, RouterProvider, Routes, useParams } from "react-router";
import { AskPage } from "@/features/ask/AskPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { DecisionsPage } from "@/features/decisions/DecisionsPage";
import { ExplorerPage } from "@/features/explorer/ExplorerPage";
import { HandoffPage } from "@/features/handoff/HandoffPage";
import { LandingPage } from "@/features/landing/LandingPage";
import { OnboardingPage } from "@/features/onboarding/OnboardingPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { ProjectOverviewPage } from "@/features/projects/ProjectOverviewPage";
import { ProjectsListPage } from "@/features/projects/ProjectsListPage";
import { RepositoryExplorerPage } from "@/features/repository/RepositoryExplorerPage";
import { SearchPage } from "@/features/search/SearchPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SignInPage } from "@/pages/SignInPage";

function ProjectRedirect({ suffix = "" }: { suffix?: string }) {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/app/projects/${id}${suffix}`} replace />;
}

export const routes = [
  // Public marketing & auth routes
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/sign-in",
    element: <SignInPage />,
  },

  // Canonical authenticated app routes (/app/...)
  {
    path: "/app",
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    path: "/app/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/app/search",
    element: <SearchPage />,
  },
  {
    path: "/app/profile",
    element: <ProfilePage />,
  },
  {
    path: "/app/projects",
    element: <ProjectsListPage />,
  },
  {
    path: "/app/projects/:id",
    element: <ProjectOverviewPage />,
  },
  {
    path: "/app/projects/:id/files",
    element: <RepositoryExplorerPage />,
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

  // Legacy route redirects
  {
    path: "/dashboard",
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    path: "/projects",
    element: <Navigate to="/app/projects" replace />,
  },
  {
    path: "/profile",
    element: <Navigate to="/app/profile" replace />,
  },
  {
    path: "/search",
    element: <Navigate to="/app/search" replace />,
  },
  {
    path: "/projects/:id",
    element: <ProjectRedirect />,
  },
  {
    path: "/projects/:id/files",
    element: <ProjectRedirect suffix="/files" />,
  },
  {
    path: "/projects/:id/ask",
    element: <ProjectRedirect suffix="/ask" />,
  },
  {
    path: "/projects/:id/explorer",
    element: <ProjectRedirect suffix="/explorer" />,
  },
  {
    path: "/projects/:id/onboarding",
    element: <ProjectRedirect suffix="/onboarding" />,
  },
  {
    path: "/projects/:id/handoff",
    element: <ProjectRedirect suffix="/handoff" />,
  },
  {
    path: "/projects/:id/decisions",
    element: <ProjectRedirect suffix="/decisions" />,
  },
  {
    path: "/projects/:id/search",
    element: <ProjectRedirect suffix="/search" />,
  },

  // 404 & fallback routes
  {
    path: "/404",
    element: <NotFoundPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

export function AppRoutes() {
  return (
    <Routes>
      {routes.map((route, i) => (
        <Route key={route.path || i} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
}

const router = createBrowserRouter(routes);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
