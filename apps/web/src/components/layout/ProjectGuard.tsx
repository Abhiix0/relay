import { type ReactNode } from "react";
import { useParams } from "react-router";
import { ApiError } from "@/lib/api/client";
import { useProject } from "@/lib/api/hooks";
import { useShellMounted } from "./AppShell";
import { AppShell } from "./AppShell";
import { ErrorState } from "@/components/ui/error-state";
import { ProjectNotFound } from "@/components/ui/project-not-found";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectGuardProps {
  children: ReactNode;
  showProjectNav?: boolean;
}

/**
 * Legacy pass-through wrapper.
 *
 * When rendered inside the new ProjectLayout (shell already mounted + project
 * already resolved), this component is a transparent no-op — children render
 * directly without an extra fetch or extra shell.
 *
 * When rendered standalone (e.g. in tests or old routes), it resolves the
 * project itself and shows appropriate loading/error states.
 */
export function ProjectGuard({
  children,
  showProjectNav = true,
}: ProjectGuardProps) {
  const shellMounted = useShellMounted();
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProject(
    // Skip the fetch when the layout already resolved it
    shellMounted ? undefined : id
  );

  // Inside the new layout — just render children
  if (shellMounted) {
    return <>{children}</>;
  }

  // Standalone mode — handle all states
  if (!id) {
    return (
      <AppShell showProjectNav={false}>
        <ProjectNotFound />
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell showProjectNav={showProjectNav}>
        <div className="space-y-6" aria-live="polite" aria-busy="true">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppShell>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <AppShell showProjectNav={false}>
        <ProjectNotFound projectId={id} />
      </AppShell>
    );
  }

  if (error || !project) {
    return (
      <AppShell showProjectNav={false}>
        <ErrorState
          title="Failed to load project"
          description="We couldn't load the project data. Please try again."
        />
      </AppShell>
    );
  }

  return (
    <AppShell showProjectNav={showProjectNav}>{children}</AppShell>
  );
}
