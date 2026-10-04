import { useParams } from "react-router";
import { Compass, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useOnboarding, useOnboardingData, useProject, useToggleOnboardingItem } from "@/lib/api/hooks";
import { OnboardingItemRow } from "./OnboardingItemRow";
import { OnboardingOverview } from "./OnboardingOverview";
import { ImportantFiles } from "./ImportantFiles";
import { OnboardingProgress } from "./OnboardingProgress";
import { GettingStarted } from "./GettingStarted";

export function OnboardingPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { data: onboardingData, isLoading: isLoadingData, error: dataError } = useOnboardingData(id);
  const { data: plan, isLoading: isLoadingPlan } = useOnboarding(id);
  const toggleItem = useToggleOnboardingItem(id);

  const completedCount = plan?.items.filter((i) => i.completed).length || 0;
  const totalCount = plan?.items.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = (itemId: string, completed: boolean) => {
    toggleItem.mutate({ itemId, completed });
  };

  const isLoading = isLoadingData || isLoadingPlan;

  if (dataError) {
    return (
      <AppShell>
        <ErrorState
          title="Failed to load onboarding data"
          description="We couldn't load the onboarding information for this project."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="border-b border-border pb-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-copper">
            Contributor Ramp-Up & Project Context
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-paper">
            {onboardingData?.projectOverview.name ? 
              `Onboarding: ${onboardingData.projectOverview.name}` : 
              `Onboarding: ${project?.name || "Codebase"}`
            }
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Comprehensive guide to understanding the project structure, architecture, and contribution workflow.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !onboardingData ? (
          <EmptyState
            title="Onboarding data unavailable"
            description="Project onboarding information could not be generated from the current repository context."
            action={
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-copper hover:underline"
              >
                Refresh
              </button>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Progress Card */}
            <OnboardingProgress data={onboardingData} />

            {/* Project Overview & Architecture */}
            <OnboardingOverview data={onboardingData} />

            {/* Important Files */}
            <ImportantFiles data={onboardingData} projectId={id || "turborepo"} />

            {/* Getting Started Steps */}
            <GettingStarted data={onboardingData} projectId={id || "turborepo"} />

            {/* Contributor Checklist */}
            {plan && plan.items.length > 0 && (
              <div className="space-y-4">
                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between text-xs font-mono mb-4">
                    <div className="flex items-center gap-2 text-paper">
                      <Compass className="h-4 w-4 text-copper" />
                      <span>Contributor Checklist</span>
                    </div>
                    <span className="text-copper font-semibold">
                      {completedCount} of {totalCount} completed ({progressPercent}%)
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2 bg-surface mb-4" />
                  {progressPercent === 100 && (
                    <div className="flex items-center gap-2 text-moss text-xs font-mono mb-4">
                      <Trophy className="h-4 w-4" />
                      <span>Full onboarding verified! You are ready to contribute production changes.</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {plan.items.map((item) => (
                    <OnboardingItemRow
                      key={item.id}
                      item={item}
                      projectId={id || "turborepo"}
                      onToggle={handleToggle}
                      isPending={toggleItem.isPending}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
