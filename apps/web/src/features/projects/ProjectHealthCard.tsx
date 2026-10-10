import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Project } from "@/lib/api/types";

interface ProjectHealthCardProps {
  project: Project;
}

export function ProjectHealthCard({ project }: ProjectHealthCardProps) {
  const health = project.health || {
    overall: 0,
    documentation: 0,
    activity: "low" as const,
  };

  const getActivityLabel = (activity: string) => {
    switch (activity) {
      case "high":
        return { label: "High", color: "text-moss" };
      case "medium":
        return { label: "Medium", color: "text-sun" };
      default:
        return { label: "Low", color: "text-text-muted" };
    }
  };

  const activityInfo = getActivityLabel(health.activity);

  return (
    <Card className="border-border bg-surface-accent">
      <CardHeader className="p-5 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-copper" />
          <CardTitle className="text-base font-serif text-text">
            Project Health
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        {/* Overall Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text">Overall Health</span>
            <span className="text-xs font-mono font-semibold text-copper">
              {health.overall}%
            </span>
          </div>
          <Progress value={health.overall} variant="copper" className="h-2" />
        </div>

        {/* Documentation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text">
              Documentation
            </span>
            <span className="text-xs font-mono font-semibold text-copper">
              {health.documentation}%
            </span>
          </div>
          <Progress value={health.documentation} variant="copper" className="h-2" />
        </div>

        {/* Activity Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text">Activity Level</span>
            <span
              className={`text-xs font-mono font-semibold ${activityInfo.color}`}
            >
              {activityInfo.label}
            </span>
          </div>
          <div className="flex gap-1">
            <div
              className={`flex-1 h-2 rounded ${health.activity !== "low" ? "bg-moss" : "bg-border"}`}
            />
            <div
              className={`flex-1 h-2 rounded ${health.activity === "high" ? "bg-moss" : "bg-border"}`}
            />
            <div
              className={`flex-1 h-2 rounded ${health.activity === "high" ? "bg-moss" : "bg-border"}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
