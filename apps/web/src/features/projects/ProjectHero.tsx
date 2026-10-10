import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusPill } from "@/components/ui/status-pill";
import { useSyncStatus, useTriggerSync } from "@/lib/api/hooks";
import { queryKeys } from "@/lib/api/query-keys";
import type { Project } from "@/lib/api/types";

interface ProjectHeroProps {
  project: Project;
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const triggerSync = useTriggerSync(project.id);
  const { data: syncJob, refetch: refetchSyncStatus } = useSyncStatus(project.id);

  const queryClient = useQueryClient();
  const wasRunning = useRef(false);

  const isSyncing = project.syncStatus === "running" || syncJob?.status === "running";

  // Poll sync status when syncing
  useEffect(() => {
    if (!isSyncing) return;

    const interval = setInterval(() => {
      refetchSyncStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, [isSyncing, refetchSyncStatus]);

  // Refresh everything a finished sync may have changed.
  useEffect(() => {
    const running = syncJob?.status === "running";
    if (wasRunning.current && !running) {
      for (const queryKey of [
        queryKeys.projects.detail(project.id),
        queryKeys.projects.all,
        queryKeys.projects.artifacts(project.id),
        queryKeys.projects.activity(project.id),
      ]) {
        queryClient.invalidateQueries({ queryKey });
      }
    }
    wasRunning.current = running;
  }, [syncJob?.status, project.id, queryClient]);

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

  const formattedDate = project.lastSyncedAt
    ? new Date(project.lastSyncedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  return (
    <div className="border border-border bg-surface-accent p-6 rounded">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-copper">
              Repository Context
            </span>
            <span className="text-text-muted">·</span>
            <StatusPill status={getSyncStatus(project.syncStatus)}>
              {project.syncStatus}
            </StatusPill>
            <span className="text-[11px] font-mono text-text-muted">
              Last indexed: {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-text tracking-tight">
              {project.fullName}
            </h1>
            <a
              href={`https://github.com/${project.fullName}`}
              target="_blank"
              rel="noreferrer"
              className="text-text-muted hover:text-copper transition"
              aria-label="View on GitHub"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
            {project.description}
          </p>

          {/* Show sync progress */}
          {isSyncing && syncJob && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted font-mono">
                  Indexing progress...
                </span>
                <span className="text-copper font-mono font-semibold">
                  {syncJob.progress}%
                </span>
              </div>
              <Progress value={syncJob.progress} variant="copper" className="h-1.5" />
            </div>
          )}

          {syncJob?.status === "failed" && syncJob.error && (
            <p role="alert" className="text-xs text-error font-mono">
              {syncJob.error}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => triggerSync.mutate()}
            disabled={triggerSync.isPending || isSyncing}
            className="gap-2 border-border text-xs text-text bg-surface hover:bg-surface-accent font-mono"
          >
            {triggerSync.isPending || isSyncing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-copper" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 text-copper" />
                <span>Re-index Repository</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
