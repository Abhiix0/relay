import { FileCode2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SourceChip } from "@/components/ui/source-chip";
import type { Source } from "@/lib/api/types";

interface HandoffSectionCardProps {
  heading: string;
  body: string;
  sources: Source[];
}

function mapSourceType(type: string): "file" | "commit" | "pr" | "issue" | "doc" {
  if (type === "commit" || type === "pr" || type === "issue") return type;
  if (type === "decision" || type === "readme") return "doc";
  return "file";
}

export function HandoffSectionCard({ heading, body, sources }: HandoffSectionCardProps) {
  return (
    <Card className="border-border bg-surface-accent">
      <CardContent className="p-5 space-y-3">
        <h3 className="text-sm font-semibold text-paper font-mono">{heading}</h3>
        <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line font-sans">
          {body}
        </p>

        {sources && sources.length > 0 && (
          <div className="pt-2 border-t border-border/30 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-copper">
              <FileCode2 className="h-3 w-3" />
              <span>Citations ({sources.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.map((src) => (
                <SourceChip
                  key={src.id}
                  label={src.path || src.url || "Evidence"}
                  type={mapSourceType(src.type)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
