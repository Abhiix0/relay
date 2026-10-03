import { Link } from "react-router";
import { Check, Circle, FileCode2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { OnboardingItem } from "@/lib/api/types";

interface OnboardingItemRowProps {
  item: OnboardingItem;
  projectId: string;
  onToggle: (itemId: string, completed: boolean) => void;
  isPending: boolean;
}

export function OnboardingItemRow({
  item,
  projectId,
  onToggle,
  isPending,
}: OnboardingItemRowProps) {
  return (
    <Card
      className={cn(
        "border-border bg-surface-accent transition",
        item.completed ? "opacity-75 border-border/40" : "hover:border-copper/50"
      )}
    >
      <CardContent className="p-4 sm:p-5 flex items-start gap-4">
        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => onToggle(item.id, !item.completed)}
          disabled={isPending}
          className={cn(
            "mt-0.5 rounded-full p-1 border transition flex items-center justify-center shrink-0",
            item.completed
              ? "bg-moss/20 border-moss text-moss"
              : "border-border hover:border-copper text-text-muted"
          )}
          aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
        >
          {item.completed ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
        </button>

        {/* Content */}
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3
              className={cn(
                "text-sm font-semibold transition",
                item.completed ? "line-through text-text-muted" : "text-paper"
              )}
            >
              {item.title}
            </h3>
            <Link
              to={`/projects/${projectId}/ask?q=${encodeURIComponent(`How do I complete this onboarding task: "${item.title}"?`)}`}
            >
              <Button size="sm" variant="ghost" className="h-6 text-[11px] gap-1 font-mono text-copper hover:text-paper p-0">
                <Sparkles className="h-3 w-3" />
                <span>Ask AI for guidance</span>
              </Button>
            </Link>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            {item.description}
          </p>

          {item.artifactIds && item.artifactIds.length > 0 && (
            <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-text-muted">
              <FileCode2 className="h-3.5 w-3.5 text-copper" />
              <span>Linked artifacts ({item.artifactIds.length})</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
