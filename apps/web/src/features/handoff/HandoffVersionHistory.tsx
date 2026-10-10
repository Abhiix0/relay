import { Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { Handoff } from "@/lib/api/types";

interface HandoffVersionHistoryProps {
  versions: Handoff[];
  currentVersion: number;
  onSelectVersion: (version: number) => void;
  hasUnsavedChanges: boolean;
}

export function HandoffVersionHistory({
  versions,
  currentVersion,
  onSelectVersion,
  hasUnsavedChanges,
}: HandoffVersionHistoryProps) {
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  const handleVersionClick = (version: number) => {
    if (hasUnsavedChanges && version !== currentVersion) {
      const confirmed = window.confirm(
        "You have unsaved changes. Switching versions will discard them. Continue?"
      );
      if (!confirmed) return;
    }
    
    onSelectVersion(version);
  };

  if (sortedVersions.length <= 1) {
    return null;
  }

  return (
    <Card className="border-border bg-surface-accent">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-copper" />
          <h3 className="text-sm font-semibold font-mono text-text">Version History</h3>
        </div>

        <div className="space-y-2">
          {sortedVersions.map((handoff) => {
            const isCurrent = handoff.version === currentVersion;
            const isLatest = sortedVersions.length > 0 && handoff.version === sortedVersions[0]?.version;
            
            return (
              <button
                key={handoff.version}
                onClick={() => handleVersionClick(handoff.version)}
                className={cn(
                  "w-full text-left p-3 rounded border transition group",
                  isCurrent
                    ? "border-copper bg-copper/10 text-text"
                    : "border-border/30 bg-surface/50 text-text-muted hover:border-border hover:text-text"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold">
                      v{handoff.version}
                    </span>
                    {isCurrent && (
                      <Badge variant="copper" className="text-[10px] font-mono">
                        Current
                      </Badge>
                    )}
                    {isLatest && !isCurrent && (
                      <Badge variant="default" className="text-[10px] font-mono">
                        Latest
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className={cn(
                    "h-3 w-3 transition",
                    isCurrent ? "text-copper" : "text-text-muted group-hover:text-text"
                  )} />
                </div>
                
                <div className="text-[11px] text-text-muted mt-1">
                  Updated {new Date(handoff.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
                
                {handoff.summary && (
                  <div className="text-xs mt-1 line-clamp-2 leading-relaxed">
                    {handoff.summary}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {hasUnsavedChanges && (
          <div className="pt-2 border-t border-border/30">
            <div className="text-[11px] font-mono text-sun">
              ⚠ Unsaved changes will be lost when switching versions
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}