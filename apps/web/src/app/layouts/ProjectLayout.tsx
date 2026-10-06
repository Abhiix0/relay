import { createContext, useContext } from "react";
import { Outlet, useParams } from "react-router";
import { ApiError } from "@/lib/api/client";
import { useProject } from "@/lib/api/hooks";
import { ErrorState } from "@/components/ui/error-state";
import { ProjectNotFound } from "@/components/ui/project-not-found";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectSidebar } from "@/components/layout/ProjectSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ShellMountedProvider } from "@/components/layout/AppShell";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import type { Project } from "@/lib/api/types";

/* ── Project context ─────────────────────────────────────────── */

const ProjectContext = createContext<Project | null>(null);

/** Access the resolved project anywhere inside a project route. */
export function useProjectContext(): Project {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error(
      "useProjectContext must be used inside a project route (ProjectLayout)"
    );
  }
  return ctx;
}

/* ── Layout ──────────────────────────────────────────────────── */

/**
 * ProjectLayout — authenticated shell for project-scoped pages.
 *
 * Resolves the project once, exposes it via useProjectContext(), and
 * renders the board-matching dark left sidebar + top bar.
 *
 * AppLayout is the *parent* in the route tree, but ProjectLayout renders
 * its own complete shell (wrapping Outlet) rather than adding to
 * AppLayout's shell. AppLayout's Outlet renders this component, so
 * ShellMountedContext is already true — ProjectLayout replaces the
 * inner content entirely without double-mounting headers.
 */
export function ProjectLayout() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProject(id);

  if (!id) {
    return <ProjectNotFound />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopBar projectMode />
        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 focus-visible:outline-none"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="mx-auto max-w-7xl space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return <ProjectNotFound projectId={id} />;
  }

  if (error || !project) {
    return (
      <ErrorState
        title="Failed to load project"
        description="We couldn't load the project data. Please try again."
      />
    );
  }

  return (
    <ErrorBoundary>
      <ShellMountedProvider>
        <ProjectContext.Provider value={project}>
          {/* Full-page layout replacing AppLayout's shell for project routes */}
          <div className="flex h-screen overflow-hidden bg-[var(--product-surface)] text-paper font-sans selection:bg-copper selection:text-paper">
            {/* Project-scoped sidebar */}
            <ProjectSidebar project={project} />

            {/* Right: topbar + content */}
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
              <TopBar projectMode />
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
        </ProjectContext.Provider>
      </ShellMountedProvider>
    </ErrorBoundary>
  );
}
