import { type ReactNode } from "react";
import { useParams } from "react-router";
import { AppShell } from "./AppShell";
import { ProjectNotFound } from "../ui/project-not-found";
import { ErrorState } from "../ui/error-state";
import { Skeleton } from "../ui/skeleton";
import { useProject } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";

interface ProjectGuardProps {
  children: ReactNode;
  showProjectNav?: boolean;
}

/**
 * Wrapper component that ensures a project exists before rendering children.
 * Shows appropriate loading, error, or not-found states.
 */
export function ProjectGuard({ children, showProjectNav = true }: ProjectGuardProps) {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProject(id);

  // Handle missing project ID in URL
  if (!id) {
    return (
      <AppShell showProjectNav={false}>
        <ProjectNotFound />
      </AppShell>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <AppShell showProjectNav={showProjectNav}>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppShell>
    );
  }

  // Handle 404 project not found
  if (error instanceof ApiError && error.status === 404) {
    return (
      <AppShell showProjectNav={false}>
        <ProjectNotFound projectId={id} />
      </AppShell>
    );
  }

  // Handle other errors
  if (error) {
    return (
      <AppShell showProjectNav={false}>
        <ErrorState
          title="Failed to load project"
          description="We couldn't load the project data. Please try again."
        />
      </AppShell>
    );
  }

  // Handle missing project (shouldn't happen if API is working correctly)
  if (!project) {
    return (
      <AppShell showProjectNav={false}>
        <ProjectNotFound projectId={id} />
      </AppShell>
    );
  }

  // Project loaded successfully, render children
  return (
    <AppShell showProjectNav={showProjectNav}>
      {children}
    </AppShell>
  );
}