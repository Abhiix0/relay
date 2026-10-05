import { createContext, useContext } from "react";
import { Outlet, useParams } from "react-router";
import { ApiError } from "@/lib/api/client";
import { useProject } from "@/lib/api/hooks";
import { ErrorState } from "@/components/ui/error-state";
import { ProjectNotFound } from "@/components/ui/project-not-found";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectNav } from "@/components/layout/ProjectNav";
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
 * Resolves the project once for the whole subtree and makes it available
 * via useProjectContext(). Renders ProjectNav above the outlet.
 *
 * AppLayout's AppShell (showProjectNav=false) already provides the
 * header/offline-banner/footer/main wrapper, so this layout only adds
 * the nav strip and the project context provider.
 */
export function ProjectLayout() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProject(id);

  if (!id) {
    return <ProjectNotFound />;
  }

  if (isLoading) {
    return (
      <>
        <ProjectNav />
        <div className="space-y-6" aria-live="polite" aria-busy="true">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </>
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
    <ProjectContext.Provider value={project}>
      <ProjectNav />
      <Outlet />
    </ProjectContext.Provider>
  );
}
