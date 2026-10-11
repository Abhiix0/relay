import { Link } from "react-router";
import { Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePath } from "@/components/ui/file-path";

import { useOnboardingData } from "@/lib/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectArchitectureCardProps {
  projectId: string;
}

export function ProjectArchitectureCard({ projectId }: ProjectArchitectureCardProps) {
  const { data, isLoading, error } = useOnboardingData(projectId);
  const architecturalModules = (data?.architecture.mainModules ?? []).slice(0, 5);

  return (
    <Card className="border-border bg-surface-accent">
      <CardHeader className="p-5 pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-copper" />
            <CardTitle className="text-base font-serif text-text">
              Architectural Invariants & Core Modules
            </CardTitle>
          </div>
          <Link
            to={`/app/projects/${projectId}/explorer`}
            className="text-[11px] font-mono text-copper hover:underline"
          >
            View full tree →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="text-xs text-error font-mono">
            Could not load architectural modules.
          </div>
        ) : architecturalModules.length === 0 ? (
          <div className="text-xs text-text-muted font-sans py-2">
            No architectural modules analyzed for this repository yet.
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {architecturalModules.map((mod) => (
              <div key={mod.path} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-text">{mod.name}</span>
                </div>
                {mod.description && (
                  <p className="text-xs text-text-muted leading-relaxed">{mod.description}</p>
                )}
                <div className="pt-1">
                  <Link to={`/app/projects/${projectId}/files?file=${encodeURIComponent(mod.path)}`}>
                    <FilePath path={mod.path} className="text-copper hover:underline" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
