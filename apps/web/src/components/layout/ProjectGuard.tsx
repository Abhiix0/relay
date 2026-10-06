import { type ReactNode } from "react";
import { useParams } from "react-router";
import { ApiError } from "@/lib/api/client";
import { useProject } from "@/lib/api/hooks";
import { useShellMounted } from "./AppShell";
import { ErrorState } from "@/components/ui/error-state";
import { ProjectNotFound } from "@/components/ui/project-not-found";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectGuardProps {
  children: ReactNode;
  /** @deprecated No longer used — layout controls project nav */
  showProjectNav?: boolean;
}

/**
 * Legacy pass-through wrapper kept for backward compat.
 *
 * Inside the new ProjectLayout (shell mounted + project resolved) this is a
 * transparent no-op — children render directly.
 *
 * In standalone / test mode it resolves the project and shows states.
 */
export function ProjectGuard({ children }: ProjectGuardProps) {
  const shellMounted = useShellMounted();
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading, error } = useProject(
    shellMounted ? undefined : id
  );

  // Inside the new layout — just pass children through
  if (shellMounted) {
    return <>{children}</>;
  }

  if (!id) return <ProjectNotFound />;

  if (isLoading) {
    return (
      <div
        className="space-y-6 p-8"
        aria-live="polite"
        aria-busy="true"
      >
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
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

  return <>{children}</>;
}
