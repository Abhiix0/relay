import { ExternalLink, FileCode2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FilePath } from "@/components/ui/file-path";
import type { SearchResultItem as SearchResult } from "@/lib/api/types";

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  onResultClick: (filePath: string, projectId: string) => void;
}

export function SearchResultItem({ result, query, onResultClick }: SearchResultItemProps) {
  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;
    
    const regex = new RegExp(`(${escapeRegex(searchQuery)})`, "gi");
    const parts = text.split(regex);
    
    return parts.map((part, idx) => {
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        return (
          <mark key={idx} className="bg-copper/20 text-copper font-semibold px-0.5">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <Card
      onClick={() => onResultClick(result.filePath, result.projectId)}
      className="border-border bg-surface-accent p-4 cursor-pointer hover:border-copper/60 hover:shadow-md transition"
    >
      <div className="space-y-3">
        {/* File Path Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <FileCode2 className="h-4 w-4 text-copper shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1">
              <FilePath path={result.filePath} className="text-copper hover:underline" />
              {result.language && (
                <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                  {result.language}
                </span>
              )}
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-text-muted shrink-0" />
        </div>

        {/* Line Number */}
        {result.lineNumber !== null && (
          <div className="text-[10px] font-mono text-text-muted">
            Line {result.lineNumber}
          </div>
        )}

        {/* Code Snippet */}
        <div className="rounded bg-surface/60 p-3 overflow-x-auto border border-border/40">
          <pre className="text-xs font-mono text-text leading-relaxed">
            <code>{highlightMatch(result.snippet, query)}</code>
          </pre>
        </div>
      </div>
    </Card>
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
