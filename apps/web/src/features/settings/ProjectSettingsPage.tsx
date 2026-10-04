import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AlertTriangle, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { ProjectGuard } from "@/components/layout/ProjectGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useDeleteProject, useProject, useSyncStatus, useTriggerSync } from "@/lib/api/hooks";

export function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [autoSync, setAutoSync] = useState(true);
  const [branch, setBranch] = useState("main");

  const { data: project } = useProject(id);
  const { data: syncJob } = useSyncStatus(id);
  const triggerSync = useTriggerSync(id);
  const deleteProject = useDeleteProject();

  const handleDisconnect = () => {
    if (!id) return;
    if (window.confirm(`Are you sure you want to disconnect ${project?.fullName || "this repo"}? All indexed AST graphs will be deleted.`)) {
      deleteProject.mutate(id, {
        onSuccess: () => navigate("/dashboard"),
      });
    }
  };

  return (
    <ProjectGuard>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="border-b border-border pb-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-copper">
            Configuration & Indexing
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-paper">
            Project Settings
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage repository hooks, indexing frequencies, and synchronization status for {project?.fullName || "this project"}.
          </p>
        </div>

        {/* Indexing & Sync Configuration */}
        <Card className="border-border bg-surface-accent">
          <CardHeader className="p-5 pb-3 border-b border-border/40">
            <CardTitle className="text-base font-serif text-paper">
              Indexing & Synchronization
            </CardTitle>
            <CardDescription className="text-xs text-text-muted">
              Configure AST parsing trigger on GitHub push events.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-paper">Automatic Webhook Sync</div>
                <div className="text-xs text-text-muted">
                  Re-index changed files automatically on push to target branch.
                </div>
              </div>
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/30">
              <Label htmlFor="branch" className="text-xs font-mono uppercase text-text-muted">
                Target Tracking Branch
              </Label>
              <Input
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="bg-surface border-border text-paper text-xs font-mono max-w-xs"
              />
            </div>

            {/* Current Sync Status */}
            <div className="rounded border border-border bg-surface p-4 space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-paper">
                  <RefreshCw className="h-3.5 w-3.5 text-copper" />
                  <span>Sync Status: {syncJob?.status || "Idle"}</span>
                </div>
                <span className="text-text-muted">{syncJob?.progress || 100}%</span>
              </div>
              <Progress value={syncJob?.progress || 100} className="h-1.5 bg-surface-accent" />
            </div>
          </CardContent>
          <CardFooter className="p-5 border-t border-border/40 flex justify-end">
            <Button
              size="sm"
              onClick={() => triggerSync.mutate()}
              disabled={triggerSync.isPending || syncJob?.status === "running"}
              className="bg-copper hover:bg-copper-dark text-paper text-xs gap-1.5 font-mono"
            >
              {triggerSync.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span>Trigger Manual Re-index</span>
            </Button>
          </CardFooter>
        </Card>

        {/* Danger Zone */}
        <Card className="border-error/40 bg-surface-accent">
          <CardHeader className="p-5 pb-3 border-b border-border/40">
            <div className="flex items-center gap-2 text-error">
              <AlertTriangle className="h-4 w-4" />
              <CardTitle className="text-base font-serif">Danger Zone</CardTitle>
            </div>
            <CardDescription className="text-xs text-text-muted">
              Disconnect repository from Relay and purge all grounded evidence cache.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-text-muted">
              This action cannot be undone. You will lose all historical Q&A sessions and handoffs.
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDisconnect}
              disabled={deleteProject.isPending}
              className="text-xs shrink-0 gap-1.5 font-mono"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Disconnect Repository</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProjectGuard>
  );
}
