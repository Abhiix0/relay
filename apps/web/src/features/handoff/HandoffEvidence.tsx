import { useState } from "react";
import { useNavigate } from "react-router";
import { ExternalLink, FileCode2, AlertTriangle } from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";
import { FilePath } from "@/components/ui/file-path";
import { SourceChip } from "@/components/ui/source-chip";
import { Button } from "@/components/ui/button";
import type { Source } from "@/lib/api/types";

interface HandoffEvidenceProps {
  sources: Source[];
  projectId: string;
  insufficientEvidence?: boolean;
}

function mapSourceType(type: string): "file" | "commit" | "pr" | "issue" | "doc" {
  if (type === "commit" || type === "pr" || type === "issue") return type;
  if (type === "decision" || type === "readme") return "doc";
  return "file";
}

export function HandoffEvidence({ sources, projectId, insufficientEvidence = false }: HandoffEvidenceProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleSourceClick = (_source: Source, index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  const handleViewFile = (source: Source) => {
    if (source.path && source.type === "file") {
      navigate(`/app/projects/${projectId}/files?file=${encodeURIComponent(source.path)}`);
    } else if (source.url) {
      window.open(source.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleAskAboutEvidence = () => {
    const question = "What additional information is needed to complete this handoff section?";
    navigate(`/app/projects/${projectId}/ask?q=${encodeURIComponent(question)}`);
  };

  if (insufficientEvidence) {
    return (
      <div className="space-y-3 pt-3 border-t border-border/40">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-sun" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
            Insufficient Repository Evidence
          </span>
        </div>
        
        <div className="bg-sun/10 border border-sun/20 rounded p-3 space-y-2">
          <p className="text-xs text-paper leading-relaxed">
            This section could not be generated confidently from the indexed project context.
          </p>
          <p className="text-xs text-text-muted leading-relaxed">
            Additional documentation, code comments, or direct knowledge transfer may be needed to complete this section accurately.
          </p>
          
          <div className="pt-2 flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAskAboutEvidence}
              className="text-xs font-mono text-sun hover:text-paper"
            >
              Ask AI for guidance
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 pt-3 border-t border-border/40">
      <div className="flex items-center gap-2">
        <FileCode2 className="h-3.5 w-3.5 text-copper" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
          Evidence ({sources.length} {sources.length === 1 ? "source" : "sources"})
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