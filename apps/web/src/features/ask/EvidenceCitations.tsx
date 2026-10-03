import { useState } from "react";
import { ExternalLink, FileCode2 } from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";
import { FilePath } from "@/components/ui/file-path";
import { SourceChip } from "@/components/ui/source-chip";
import type { Source } from "@/lib/api/types";

interface EvidenceCitationsProps {
  sources: Source[];
}

function mapSourceType(type: string): "file" | "commit" | "pr" | "issue" | "doc" {
  if (type === "commit" || type === "pr" || type === "issue") return type;
  if (type === "decision" || type === "readme") return "doc";
  return "file";
}

export function EvidenceCitations({ sources }: EvidenceCitationsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="space-y-3 pt-3 border-t border-border/40">
      <div className="flex items-center gap-2">
        <FileCode2 className="h-3.5 w-3.5 text-copper" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
          Grounded Evidence ({sources.length} sources)
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {sources.map((src, idx) => (
          <SourceChip
            key={src.id}
            label={src.path || src.url || `Source ${idx + 1}`}
            type={mapSourceType(src.type)}
            onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
            className="cursor-pointer hover:border-copper transition"
          />
        ))}
      </div>

      {expandedIndex !== null && sources[expandedIndex] && (
        <div className="mt-3 rounded border border-border bg-charcoal p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <FilePath path={sources[expandedIndex].path || "unknown"} />
            {sources[expandedIndex].url && (
              <a
                href={sources[expandedIndex].url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-mono text-copper hover:underline"
              >
                <span>View file</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <CodeBlock code={sources[expandedIndex].snippet} />
        </div>
      )}
    </div>
  );
}
