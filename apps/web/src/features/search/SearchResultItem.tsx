import { ArrowRight, FileCode2, GitCommit, GitPullRequest, Layers } from "lucide-react";
import { FilePath } from "@/components/ui/file-path";
import { cn } from "@/lib/cn";
import type { SearchResultItem as SearchResult } from "@/lib/api/types";

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  onResultClick: (filePath: string, projectId: string) => void;
}

const TYPE_META: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  file: {
    icon: FileCode2,
    color: "text-copper",
    bg: "bg-copper/10",
    label: "File",
  },
  commit: {
    icon: GitCommit,
    color: "text-moss",
    bg: "bg-moss/10",
    label: "Commit",
  },
  pr: {
    icon: GitPullRequest,
    color: "text-sun",
    bg: "bg-sun/10",
    label: "PR",
  },
  decision: {
    icon: Layers,
    color: "text-blue",
    bg: "bg-blue/10",
    label: "Decision",
  },
};

export function SearchResultItem({
  result,
  query,
  onResultClick,
}: SearchResultItemProps) {
  const meta = TYPE_META[result.type] ?? TYPE_META.file;
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={() => onResultClick(result.filePath, result.projectId)}
      className={cn(
        "w-full text-left group rounded-lg border border-border bg-surface-accent",
        "hover:border-copper/50 hover:shadow-md hover:shadow-copper/5",
        "transition-all duration-150 p-4 space-y-3"
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Type badge */}
          <div
            className={cn(
              "shrink-0 w-7 h-7 rounded flex items-center justify-center mt-0.5",
              meta.bg
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", meta.color)} />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <FilePath
              path={result.filePath}
              className="text-text font-mono text-xs font-medium group-hover:text-copper transition"
            />
            <div className="flex items-center gap-2">
              {result.language && (
                <span
                  className={cn(
                    "inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border",
                    "bg-surface border-border text-text-muted"
                  )}
                >
                  {result.language}
                </span>
              )}
              {result.lineNumber != null && (
                <span className="text-[10px] font-mono text-text-muted">
                  Line {result.lineNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Arrow indicator */}
        <ArrowRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 mt-1 text-text-muted",
            "group-hover:text-copper group-hover:translate-x-0.5 transition-all"
          )}
        />
      </div>

      {/* ── Code Snippet ── */}
      {result.snippet && (
        <div className="rounded border border-border/50 bg-charcoal/5 overflow-x-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/30 bg-surface/60">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-border" />
              <span className="w-2 h-2 rounded-full bg-border" />
              <span className="w-2 h-2 rounded-full bg-border" />
            </div>
            {result.lineNumber != null && (
              <span className="text-[10px] font-mono text-text-muted ml-auto">
                :{result.lineNumber}
              </span>
            )}
          </div>
          <pre className="text-xs font-mono text-text leading-relaxed p-3 whitespace-pre-wrap break-all">
            <code>{highlightMatch(result.snippet, query)}</code>
          </pre>
        </div>
      )}
    </button>
  );
}

function highlightMatch(text: string, searchQuery: string) {
  if (!searchQuery || !text) return text;

  const regex = new RegExp(`(${escapeRegex(searchQuery)})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (part.toLowerCase() === searchQuery.toLowerCase()) {
      return (
        <mark
          key={idx}
          className="bg-copper/25 text-copper-dark font-semibold rounded-sm px-px not-italic"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
