import { Activity, CheckCircle, FileText, HelpCircle, Layers, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectActivity } from "@/lib/api/hooks";
import type { ActivityEvent } from "@/lib/api/types";

interface ProjectActivityTimelineProps {
  projectId: string;
}

export function ProjectActivityTimeline({ projectId }: ProjectActivityTimelineProps) {
  const { data: activities = [] } = useProjectActivity(projectId);

  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "sync":
        return <RefreshCw className="h-3.5 w-3.5 text-sun" />;
      case "ask":
        return <HelpCircle className="h-3.5 w-3.5 text-copper" />;
      case "decision":
        return <Layers className="h-3.5 w-3.5 text-moss" />;
      case "onboarding":
        return <CheckCircle className="h-3.5 w-3.5 text-blue" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-text-muted" />;
    }
  };

  return (
    <Card className="border-border bg-surface-accent">
      <CardHeader className="p-5 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-copper" />
          <CardTitle className="text-base font-serif text-paper">
            Recent Codebase Events & Audit
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {activities.length === 0 ? (
          <p className="text-xs text-text-muted">No recent activity recorded.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="mt-0.5 rounded border border-border p-1 bg-surface">
                  {getEventIcon(act.type)}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-paper">{act.title}</span>
                    <span className="text-[10px] font-mono text-text-muted">
                      {new Date(act.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-text-muted text-[11px] leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
