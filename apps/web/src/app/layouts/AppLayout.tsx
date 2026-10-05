import { Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "@/app/session/SessionContext";
import { routes } from "@/lib/routes";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { AppShell } from "@/components/layout/AppShell";

/**
 * RequireAuth: redirects anonymous visitors to /sign-in?next=<path>.
 *
 * Renders a shell (no project nav) for top-level authenticated pages:
 * dashboard, search, settings, profile, projects list.
 *
 * Project pages use ProjectLayout which renders its own shell with project nav.
 */
export function AppLayout() {
  const { status } = useSession();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div
        className="min-h-screen bg-surface flex items-center justify-center"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading session"
      >
        <span className="font-mono text-xs text-text-muted animate-pulse">
          Loading…
        </span>
      </div>
    );
  }

  if (status === "anonymous") {
    return (
      <Navigate
        to={routes.signIn(location.pathname + location.search)}
        replace
      />
    );
  }

  return (
    <ErrorBoundary>
      <AppShell showProjectNav={false}>
        <Outlet />
      </AppShell>
    </ErrorBoundary>
  );
}
