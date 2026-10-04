import { BookOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

interface HandoffEmptyStateProps {
  projectId: string;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export function HandoffEmptyState({ projectId, onGenerate, isGenerating = false }: HandoffEmptyStateProps) {
  return (
    <EmptyState
      title="No handoff documentation generated"
      description="Create a comprehensive engineering handoff document based on your repository's architecture, key files, and implementation patterns."
      action={
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className="bg-copper hover:bg-copper-dark text-paper text-sm font-mono gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4" />
                Generate Handoff
              </>
            )}
          </Button>
          
          <span className="text-xs text-text-muted">or</span>
          
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs font-mono text-copper hover:text-paper"
          >
            <a href={`/app/projects/${projectId}/ask?q=${encodeURIComponent("How should I structure a project handoff document for this codebase?")}`}>
              <BookOpen className="h-3 w-3 mr-1" />
              Ask AI for guidance
            </a>
          </Button>
        </div>
      }
    />
  );
}