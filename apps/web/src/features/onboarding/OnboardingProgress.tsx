import { Check, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { OnboardingData } from "@/lib/api/types";

interface OnboardingProgressProps {
  data: OnboardingData;
}

interface ProgressItemProps {
  label: string;
  status: boolean;
  description: string;
}

function ProgressItem({ label, status, description }: ProgressItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "mt-0.5 rounded-full p-1 border transition flex items-center justify-center shrink-0",
          status
            ? "bg-moss/20 border-moss text-moss"
            : "border-border text-text-muted"
        )}
      >
        {status ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      </div>
      <div className="flex-1 space-y-0.5">
        <div className={cn(
          "text-xs font-semibold transition",
          status ? "text-paper" : "text-text-muted"
        )}>
          {label}
        </div>
        <div className="text-xs text-text-muted leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
}

export function OnboardingProgress({ data }: OnboardingProgressProps) {
  const { progress } = data;

  const progressItems = [
    {
      label: "Repository Connected",
      status: progress.repositoryConnected,
      description: "GitHub repository has been successfully connected and authenticated.",
    },
    {
      label: "Repository Indexed",
      status: progress.repositoryIndexed,
      description: "All files, commits, and pull requests have been analyzed and indexed.",
    },
    {
      label: "Project Structure Analyzed",
      status: progress.structureAnalyzed,
      description: "Package dependencies, build configuration, and architecture mapped.",
    },
    {
      label: "Handoff Ready",
      status: progress.handoffReady,
      description: "Documentation and architectural handoff can be generated.",
    },
  ];

  const completedCount = progressItems.filter(item => item.status).length;
  const totalCount = progressItems.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <Card className="border-border bg-surface-accent">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-copper" />
            <h2 className="text-sm font-semibold font-mono text-paper">Setup Progress</h2>
          </div>
          <div className="text-xs font-mono text-copper-text font-semibold">
            {completedCount}/{totalCount} ({progressPercent}%)
          </div>
        </div>

        <div className="space-y-3">
          {progressItems.map((item, idx) => (
            <ProgressItem
              key={idx}
              label={item.label}
              status={item.status}
              description={item.description}
            />
          ))}
        </div>

        {progressPercent === 100 && (
          <div className="pt-3 border-t border-border/30">
            <div className="flex items-center gap-2 text-moss text-xs font-mono">
              <Check className="h-4 w-4" />
              <span>Project setup complete! You're ready to explore and contribute.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}