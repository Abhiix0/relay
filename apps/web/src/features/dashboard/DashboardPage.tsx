import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser, useProjects } from "@/lib/api/hooks";
import { ConnectRepoModal } from "./ConnectRepoModal";
import { DashboardStats } from "./DashboardStats";
import { ProjectCard } from "./ProjectCard";

export function DashboardPage() {
  const [search, setSearch] = useState("");
  const { data: user } = useCurrentUser();
  const { data: projects = [], isLoading, error, refetch } = useProjects();

  // Get recent projects (max 6 for dashboard)
  const recentProjects = projects
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 6);

  const filteredProjects = search
    ? recentProjects.filter(
        (project) =>
          project.fullName.toLowerCase().includes(search.toLowerCase()) ||
          project.description.toLowerCase().includes(search.toLowerCase())
      )
    : recentProjects;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (error) {
    return (
      <AppShell showProjectNav={false}>
        <ErrorState
          title="Failed to load dashboard"
          description="Could not retrieve your projects. Please try again."
        >
          <Button
            variant="primary"
            size="sm"
            onClick={() => refetch()}
            className="bg-copper text-paper"
          >
            Retry
          </Button>
        </ErrorState>
      </AppShell>
    );
  }

  return (
    <AppShell showProjectNav={false}>
      <div className="space-y-8">
        {/* Greeting Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-copper mb-1">
              Dashboard
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-paper">
              {getGreeting()}, {user?.name?.split(" ")[0] || "Developer"}
            </h1>
            <p className="text-xs text-text-muted mt-1 max-w-xl">
              Your connected repositories and recent activity at a glance.
            </p>
          </div>
          <ConnectRepoModal />
        </div>

        {/* Dashboard Stats */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <DashboardStats projects={projects} />
        )}

        {/* Search Bar */}
        {projects.length > 0 && (
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your repositories..."
              className="w-full rounded border border-border bg-surface-accent pl-9 pr-3 py-2 text-xs text-paper placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-copper font-mono"
            />
          </div>
        )}

        {/* Recent Projects Section */}
        {isLoading ? (
          <div>
            <div className="mb-4">
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-48 rounded border border-border bg-surface-accent p-6 space-y-4"
                >
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif text-paper">Recent Projects</h2>
              {projects.length > 6 && (
                <Link to="/app/projects">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2 text-xs border-border text-copper hover:text-copper-dark"
                  >
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        ) : projects.length > 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">
              No projects match your search.
            </p>
          </div>
        ) : (
          <EmptyState
            title="No repositories connected"
            description="Connect your first GitHub repository to start using Relay's AI-powered codebase intelligence."
            action={<ConnectRepoModal />}
          />
        )}
      </div>
    </AppShell>
  );
}
