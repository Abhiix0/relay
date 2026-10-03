import { ExternalLink, FileCode2, GitCommit, GitPullRequest, Layers, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilePath } from "@/components/ui/file-path";
import type { Artifact } from "@/lib/api/types";

interface SearchResultCardProps {
  artifact: Artifact;
  projectId: string;
}

export function SearchResultCard({ artifact, projectId }: SearchResultCardProps) {
  const getIcon = (type: Artifact["type"]) => {
    switch (type) {
      case "file":
        return <FileCode2 className="h-4 w-4 text-copper" />;
      case "pr":
        return <GitPullRequest className="h-4 w-4 text-sun" />;
      case "commit":
        return <GitCommit className="h-4 w-4 text-moss" />;
      case "decision":
        return <Layers className="h-4 w-4 text-blue" />;
      default:
        return <FileCode2 className="h-4 w-4 text-text-muted" />;
    }
  };

  return (
    <Card className="border-border bg-surface-accent transition hover:border-copper/50">
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {getIcon(artifact.type)}
            <Badge variant="default" className="text-[10px] font-mono border-border uppercase">
              {artifact.type}
            </Badge>
            {artifact.path && <FilePath path={artifact.path} />}
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/projects/${projectId}/ask?q=${encodeURIComponent(`Explain this artifact: ${artifact.title}`)}`}>
              <Button size="sm" variant="secondary" className="h-6 text-[10px] gap-1 border-border font-mono">
                <Sparkles className="h-3 w-3 text-copper" />
                <span>Ask AI</span>
              </Button>
            </Link>
            {artifact.url && (
              <a
                href={artifact.url}
                target="_blank"
                rel="noreferrer"
                className="text-text-muted hover:text-copper transition p-0.5"
                aria-label="View on GitHub"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-paper font-mono">{artifact.title}</h3>
          {artifact.summary && (
            <p className="text-xs text-text-muted mt-1 leading-relaxed">{artifact.summary}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
