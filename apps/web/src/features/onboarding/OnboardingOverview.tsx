import { Building2, Code2, FileCode2, GitBranch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { OnboardingData } from "@/lib/api/types";

interface OnboardingOverviewProps {
  data: OnboardingData;
}

export function OnboardingOverview({ data }: OnboardingOverviewProps) {
  const { projectOverview, architecture } = data;

  return (
    <div className="space-y-4">
      {/* Project Overview Card */}
      <Card className="border-border bg-surface-accent">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-copper" />
            <h2 className="text-sm font-semibold font-mono text-paper">Project Overview</h2>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
                Description
              </div>
              <p className="text-xs text-paper leading-relaxed">
                {projectOverview.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/30">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
                  Repository
                </div>
                <div className="flex items-center gap-1.5">
                  <GitBranch className="h-3 w-3 text-copper" />
                  <span className="text-xs font-mono text-paper">{projectOverview.repository}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
                  Primary Language
                </div>
                <div className="flex items-center gap-1.5">
                  <Code2 className="h-3 w-3 text-copper" />
                  <span className="text-xs font-mono text-paper">
                    {projectOverview.primaryLanguage || "Multiple"}
                  </span>
                </div>
              </div>
            </div>

            {projectOverview.technologies.length > 0 && (
              <div className="pt-2 border-t border-border/30">
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-2">
                  Technologies
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {projectOverview.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-paper"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Architecture Card */}
      <Card className="border-border bg-surface-accent">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-copper" />
            <h2 className="text-sm font-semibold font-mono text-paper">Architecture</h2>
          </div>

          <p className="text-xs text-paper leading-relaxed">{architecture.summary}</p>

          <div className="space-y-2 pt-2 border-t border-border/30">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
              Main Modules
            </div>
            {architecture.mainModules.map((module, idx) => (
              <div
                key={idx}
                className="bg-surface/50 rounded border border-border/30 p-3 space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-semibold font-mono text-paper">{module.name}</h3>
                  <code className="text-[10px] font-mono text-text-muted bg-charcoal px-1.5 py-0.5 rounded">
                    {module.path}
                  </code>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{module.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
