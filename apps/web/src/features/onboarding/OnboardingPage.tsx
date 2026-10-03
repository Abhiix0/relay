import { useParams } from "react-router";
import { Compass, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnboarding, useProject, useToggleOnboardingItem } from "@/lib/api/hooks";
import { OnboardingItemRow } from "./OnboardingItemRow";

export function OnboardingPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { data: plan, isLoading } = useOnboarding(id);
  const toggleItem = useToggleOnboardingItem(id);

  const completedCount = plan?.items.filter((i) => i.completed).length || 0;
  const totalCount = plan?.items.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = (itemId: string, completed: boolean) => {
    toggleItem.mutate({ itemId, completed });
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="border-b border-border pb-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-copper">
            Contributor Ramp-Up & Invariants
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-paper">
            {plan?.title || `Onboarding: ${project?.name || "Codebase"}`}
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Grounded step-by-step checklist to understand architecture, run fixtures, and submit verified code.
          </p>
        </div>

        {/* Progress Card */}
        <div className="rounded border border-border bg-surface-accent p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-paper">
              <Compass className="h-4 w-4 text-copper" />
              <span>Ramp-up Progress</span>
            </div>
            <span className="text-copper font-semibold">
              {completedCount} of {totalCount} completed ({progressPercent}%)
            </span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-surface" />
          {progressPercent === 100 && (
            <div className="flex items-center gap-2 text-moss text-xs font-mono pt-1">
              <Trophy className="h-4 w-4" />
              <span>Full onboarding verified! You are ready to contribute production changes.</span>
            </div>
          )}
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            plan?.items.map((item) => (
              <OnboardingItemRow
                key={item.id}
                item={item}
                projectId={id || "turborepo"}
                onToggle={handleToggle}
                isPending={toggleItem.isPending}
              />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
