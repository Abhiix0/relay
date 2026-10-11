import { useState } from "react";
import { Link } from "react-router";
import { Archive, Loader2, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { FilterChip } from "@/components/ui/filter-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { ConnectRepoModal } from "@/features/dashboard/ConnectRepoModal";
import { useDeleteProject, useProjects } from "@/lib/api/hooks";
import type { Project } from "@/lib/api/types";

export function ProjectsListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const { data: projects = [], isLoading, error, refetch } = useProjects();
  const deleteProject = useDeleteProject();

  const statusFilters = ["all", "succeeded", "running", "queued", "failed"];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.fullName.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.syncStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getSyncStatus = (
    status: Project["syncStatus"]
  ): "healthy" | "indexing" | "error" | "idle" => {
    switch (status) {
      case "succeeded":
        return "healthy";
      case "running":
        return "indexing";
      case "failed":
        return "error";
      default:
        return "idle";
    }
  };

  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProject.mutate(projectToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setProjectToDelete(null);
        },
      });
    }
  };

  if (error) {
    return (
      <AppShell showProjectNav={false}>
        <ErrorState
          title="Failed to load projects"
          description="Could not retrieve the project list. Please try again."
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-copper mb-1">
              All Repositories
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-paper">
              Connected Projects
            </h1>
            <p className="text-xs text-text-muted mt-1 max-w-xl">
              Manage and monitor all GitHub repositories connected to Relay.
            </p>
          </div>
          <ConnectRepoModal />
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded border border-border bg-surface-accent pl-9 pr-3 py-1.5 text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-copper font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {statusFilters.map((filter) => (
              <FilterChip
                key={filter}
                active={statusFilter === filter}
                onClick={() => setStatusFilter(filter)}
              >
                {filter === "all"
                  ? "All"
                  : filter === "succeeded"
                    ? "Healthy"
                    : filter === "running"
                      ? "Indexing"
                      : filter === "queued"
                        ? "Queued"
                        : "Failed"}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Projects List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 rounded border border-border bg-surface-accent p-6 space-y-4"
              >
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="border-border bg-surface-accent transition hover:border-copper/60 hover:shadow-lg group"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/app/projects/${project.id}`}
                          className="font-mono text-sm font-semibold text-text hover:text-copper transition"
                        >
                          {project.fullName}
                        </Link>
                        <StatusPill status={getSyncStatus(project.syncStatus)}>
                          {project.syncStatus === "succeeded"
                            ? "healthy"
                            : project.syncStatus}
                        </StatusPill>
                        {project.language && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                            {project.language}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-5 py-3">
                  <div className="flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-text-muted">Commits:</span>
                      <span className="font-semibold text-paper">
                        {project.stats.commits.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-text-muted">PRs:</span>
                      <span className="font-semibold text-paper">
                        {project.stats.pullRequests.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-text-muted">Issues:</span>
                      <span className="font-semibold text-paper">
                        {project.stats.issues.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-text-muted">Files:</span>
                      <span className="font-semibold text-paper">
                        {project.stats.files.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t border-border/40 px-5 py-3 bg-charcoal/40">
                  <span className="text-[10px] font-mono text-text-muted">
                    {project.lastSyncedAt
                      ? `Last synced: ${new Date(project.lastSyncedAt).toLocaleDateString()}`
                      : "Never synced"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Archive functionality can be added later
                      }}
                      className="text-text-muted hover:text-paper transition p-1"
                      title="Archive project"
                      aria-label="Archive project"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(project, e)}
                      className="text-text-muted hover:text-error transition p-1"
                      title="Delete project"
                      aria-label="Delete project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No projects found"
            description={
              search || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Connect a GitHub repository to get started with Relay."
            }
            action={<ConnectRepoModal />}
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-charcoal border-border text-paper">
          <DialogHeader>
            <DialogTitle className="text-lg font-serif">
              Delete Project
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              This will permanently remove the project and all indexed data. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {projectToDelete && (
            <div className="py-4">
              <div className="rounded border border-border bg-surface-accent p-4">
                <p className="font-mono text-sm text-paper font-semibold">
                  {projectToDelete.fullName}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {projectToDelete.description}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
              disabled={deleteProject.isPending}
              className="border-border text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleteProject.isPending}
              className="bg-error hover:bg-error/80 text-paper text-xs"
            >
              {deleteProject.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
