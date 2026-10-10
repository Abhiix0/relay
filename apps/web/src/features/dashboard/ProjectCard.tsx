import { Link } from "react-router";
import { FileCode2, GitBranch, GitCommit, GitPullRequest, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { useDeleteProject } from "@/lib/api/hooks";
import type { Project } from "@/lib/api/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const deleteProject = useDeleteProject();

  const getSyncStatus = (status: Project["syncStatus"]): "healthy" | "indexing" | "error" | "idle" => {
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Disconnect ${project.fullName}? Index data will be removed.`)) {
      deleteProject.mutate(project.id);
    }
  };

  return (
    <Card className="border-border bg-surface-accent transition hover:border-copper/60 hover:shadow-md flex flex-col justify-between group">
      <CardHeader className="space-y-2 p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-copper" />
            <Link
              to={`/app/projects/${project.id}`}
              className="font-mono text-sm font-semibold text-text hover:text-copper transition"
            >
              {project.fullName}
            </Link>
          </div>
          <StatusPill status={getSyncStatus(project.syncStatus)}>
            {project.syncStatus}
          </StatusPill>
        </div>
        <p className="line-clamp-2 text-xs text-text-muted leading-relaxed">
          {project.description}
        </p>
      </CardHeader>

      <CardContent className="px-5 py-2 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {project.language && (
            <Badge variant="default" className="border-border text-[10px] font-mono">
              {project.language}
            </Badge>
          )}
          <span className="text-[10px] font-mono text-text-muted">
            {project.healthLabel}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 border-t border-border/40 pt-3 text-center">
          <div className="flex flex-col items-center">
            <span className="flex items-center gap-1 text-[10px] font-mono text-text-muted">
              <GitCommit className="h-3 w-3" /> Commits
            </span>
            <span className="font-mono text-xs font-semibold text-text">
              {project.stats.commits.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="flex items-center gap-1 text-[10px] font-mono text-text-muted">
              <GitPullRequest className="h-3 w-3" /> PRs
            </span>
            <span className="font-mono text-xs font-semibold text-text">
              {project.stats.pullRequests.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="flex items-center gap-1 text-[10px] font-mono text-text-muted">
              <FileCode2 className="h-3 w-3" /> Files
            </span>
            <span className="font-mono text-xs font-semibold text-text">
              {project.stats.files.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/40 px-5 py-3 text-xs bg-surface/50">
        <div className="flex items-center gap-3">
          <Link
            to={`/app/projects/${project.id}/ask`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-copper hover:underline text-[11px] font-mono"
          >
            <Sparkles className="h-3 w-3" />
            <span>Ask AI</span>
          </Link>
          <Link
            to={`/app/projects/${project.id}/explorer`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-text-muted hover:text-text text-[11px] font-mono"
          >
            <FileCode2 className="h-3 w-3" />
            <span>Explorer</span>
          </Link>
        </div>

        <button
          onClick={handleDelete}
          className="text-text-muted hover:text-error transition p-1"
          title="Disconnect project"
          aria-label="Disconnect project"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </CardFooter>
    </Card>
  );
}
