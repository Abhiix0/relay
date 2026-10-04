import { useState } from "react";
import { Download, RefreshCw, Loader2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { Handoff } from "@/lib/api/types";

interface HandoffActionsProps {
  handoff: Handoff;
  projectName?: string;
  hasUnsavedChanges: boolean;
  onSaveVersion: () => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  isSaving?: boolean;
}

export function HandoffActions({
  handoff,
  projectName = "project",
  hasUnsavedChanges,
  onSaveVersion,
  onRegenerate,
  isRegenerating = false,
  isSaving = false,
}: HandoffActionsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportMarkdown = async () => {
    setIsExporting(true);
    
    try {
      // Generate Markdown content
      let markdown = `# ${handoff.title}\n\n`;
      
      if (handoff.summary) {
        markdown += `${handoff.summary}\n\n`;
      }
      
      handoff.sections.forEach((section) => {
        markdown += `## ${section.heading}\n\n`;
        markdown += `${section.body}\n\n`;
        
        if (section.sources && section.sources.length > 0) {
          markdown += `### Evidence\n\n`;
          section.sources.forEach((source) => {
            if (source.path) {
              markdown += `- \`${source.path}\`\n`;
            } else if (source.url) {
              markdown += `- [${source.url}](${source.url})\n`;
            }
          });
          markdown += `\n`;
        }
      });
      
      markdown += `---\n\n`;
      markdown += `Generated on ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}\n`;
      markdown += `Version ${handoff.version}\n`;
      
      // Create and download file
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `relay-${projectName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-handoff.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export handoff. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRegenerate = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Regenerating will replace your edits with new content. Continue?"
      );
      if (!confirmed) return;
    }
    
    onRegenerate();
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-surface-accent border-t border-border">
      <div className="flex-1">
        {hasUnsavedChanges && (
          <div className="text-xs font-mono text-sun">
            ⚠ You have unsaved changes
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRegenerate}
          disabled={isRegenerating || isSaving}
          className="text-xs font-mono text-text-muted hover:text-paper"
        >
          {isRegenerating ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
          )}
          Regenerate
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportMarkdown}
          disabled={isExporting || isRegenerating || isSaving}
          className="text-xs font-mono border-border text-paper"
        >
          {isExporting ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5 mr-1" />
          )}
          Export Markdown
        </Button>

        <Button
          size="sm"
          onClick={onSaveVersion}
          disabled={!hasUnsavedChanges || isSaving || isRegenerating}
          className={cn(
            "text-xs font-mono",
            hasUnsavedChanges
              ? "bg-copper hover:bg-copper-dark text-paper"
              : "bg-surface border border-border text-text-muted cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <Archive className="h-3.5 w-3.5 mr-1" />
          )}
          Save Version
        </Button>
      </div>
    </div>
  );
}