import { Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "@/app/session/SessionContext";
import { routes } from "@/lib/routes";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ShellMountedProvider } from "@/components/layout/AppShell";

/**
 * AppLayout — authenticated shell for non-project pages.
 *
 * Layout: dark sidebar (left) + top bar + scrollable main area.
 * RequireAuth: redirects anonymous visitors to /sign-in?next=<path>.
 */
export function AppLayout() {
  const { status } = useSession();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div
        className="min-h-screen bg-[var(--product-surface)] flex items-center justify-center"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading session"
      >
        <span className="font-mono text-xs text-[#aaa99d] animate-pulse">
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
      <ShellMountedProvider>
        <div className="flex h-screen overflow-hidden bg-[var(--product-surface)] text-paper font-sans selection:bg-copper selection:text-paper">
          {/* Left sidebar */}
          <AppSidebar />

          {/* Right: topbar + content */}
          <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
            <TopBar />
            <main
              id="main-content"
              role="main"
              tabIndex={-1}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 focus-visible:outline-none"
            >
              <div className="mx-auto max-w-7xl">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </ShellMountedProvider>
    </ErrorBoundary>
  );
}
