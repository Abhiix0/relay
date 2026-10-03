import { useState } from "react";
import { useNavigate } from "react-router";
import { ExternalLink, FileCode2 } from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";
import { FilePath } from "@/components/ui/file-path";
import { SourceChip } from "@/components/ui/source-chip";
import type { Source } from "@/lib/api/types";

interface EvidenceCitationsProps {
  sources: Source[];
  projectId: string;
}

function mapSourceType(type: string): "file" | "commit" | "pr" | "issue" | "doc" {
  if (type === "commit" || type === "pr" || type === "issue") return type;
  if (type === "decision" || type === "readme") return "doc";
  return "file";
}

export function EvidenceCitations({ sources, projectId }: EvidenceCitationsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  if (!sources || sources.length === 0) return null;

  const handleSourceClick = (_source: Source, index: number) => {
    if (expandedIndex === index) {
      // Collapse if already expanded
      setExpandedIndex(null);
    } else {
      // Expand to show snippet
      setExpandedIndex(index);
    }
  };

  const handleViewFile = (source: Source) => {
    if (source.path && source.type === "file") {
      // Navigate to file explorer with the file selected
      navigate(`/app/projects/${projectId}/files?file=${encodeURIComponent(source.path)}`);
    } else if (source.url) {
      // Open external link
      window.open(source.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-3 pt-3 border-t border-border/40">
      <div className="flex items-center gap-2">
        <FileCode2 className="h-3.5 w-3.5 text-copper" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
          Grounded Evidence ({sources.length} {sources.length === 1 ? "source" : "sources"})
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {sources.map((src, idx) => (
          <SourceChip
            key={src.id}
            label={src.path || src.url || `Source ${idx + 1}`}
            type={mapSourceType(src.type)}
            onClick={() => handleSourceClick(src, idx)}
            className="cursor-pointer hover:border-copper transition"
          />
        ))}
      </div>

      {expandedIndex !== null && sources[expandedIndex] && (
        <div className="mt-3 rounded border border-border bg-charcoal p-3 space-y-2 text-xs">
          {(() => {
            const source = sources[expandedIndex];
            if (!source) return null;
            
            return (
              <>
                <div className="flex items-center justify-between">
                  <FilePath path={source.path || "unknown"} />
                  <button
                    onClick={() => handleViewFile(source)}
                    className="flex items-center gap-1 text-[11px] font-mono text-copper hover:underline transition"
                  >
                    <span>{source.type === "file" ? "Open file" : "View source"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
                <CodeBlock code={source.snippet} />
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
