import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useParams,
} from "react-router";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PublicLayout } from "./layouts/PublicLayout";
import { appRoutes } from "./routes/app";
import { LEGACY_REDIRECTS } from "./redirects";

/* ── Legacy redirect helper ──────────────────────────────────── */

/**
 * Replaces :param tokens in a template string with live URL params.
 * e.g. template="/app/projects/:id/files", params={id:"abc"} → "/app/projects/abc/files"
 */
function DynamicRedirect({ template }: { template: string }) {
  const params = useParams();
  const resolved = template.replace(
    /:(\w+)/g,
    (_, key) => (params as Record<string, string>)[key] ?? key
  );
  return <Navigate to={resolved} replace />;
}

const hasDynamicSegment = (path: string) => path.includes(":");

const redirectRoutes = LEGACY_REDIRECTS.map(({ from, to }) =>
  hasDynamicSegment(from)
    ? { path: from, element: <DynamicRedirect template={to} /> }
    : { path: from, element: <Navigate to={to} replace /> }
);

/* ── Router ──────────────────────────────────────────────────── */

const router = createBrowserRouter([
  // ── Public layout (/, /sign-in) ───────────────────────────────
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { LandingPage } = await import("@/features/landing/LandingPage");
          return { Component: LandingPage };
        },
      },
      {
        path: "sign-in",
        lazy: async () => {
          const { SignInPage } = await import("@/pages/SignInPage");
          return { Component: SignInPage };
        },
      },
    ],
  },

  // ── Authenticated app routes (/app/*) ─────────────────────────
  ...appRoutes,

  // ── Legacy redirects ──────────────────────────────────────────
  ...redirectRoutes,

  // ── Dev-only design system ────────────────────────────────────
  {
    path: "/design-system",
    lazy: async () => {
      const { DesignSystemPage } = await import("@/pages/DesignSystemPage");
      return { Component: DesignSystemPage };
    },
  },

  // ── 404 ───────────────────────────────────────────────────────
  { path: "/404", element: <NotFoundPage /> },
  { path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
