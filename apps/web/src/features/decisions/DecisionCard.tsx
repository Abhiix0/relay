import { Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SourceChip } from "@/components/ui/source-chip";
import type { Decision } from "@/lib/api/types";

interface DecisionCardProps {
  decision: Decision;
}

function mapSourceType(type: string): "file" | "commit" | "pr" | "issue" | "doc" {
  if (type === "commit" || type === "pr" || type === "issue") return type;
  if (type === "decision" || type === "readme") return "doc";
  return "file";
}

export function DecisionCard({ decision }: DecisionCardProps) {
  return (
    <Card className="border-border bg-surface-accent transition hover:border-copper/50">
      <CardHeader className="p-5 pb-3 border-b border-border/40 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-copper" />
            <h3 className="font-mono text-sm font-semibold text-paper">
              {decision.title}
            </h3>
          </div>
          <Badge variant="success" className="text-[10px] font-mono">
            Accepted
          </Badge>
        </div>
        <div className="text-[10px] font-mono text-text-muted">
          Decided on: {new Date(decision.createdAt).toLocaleDateString()}
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase text-text-muted">Summary</div>
          <p className="text-xs text-paper leading-relaxed">{decision.summary}</p>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase text-text-muted">Rationale & Trade-offs</div>
          <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line bg-surface/40 p-3 rounded border border-border/30">
            {decision.rationale}
          </p>
        </div>

        {decision.sources && decision.sources.length > 0 && (
          <div className="pt-2 border-t border-border/30 space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-copper">
              Evidence Citations ({decision.sources.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {decision.sources.map((src) => (
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
