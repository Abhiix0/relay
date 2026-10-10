import { ExternalLink, FileCode2, GitCommit, GitPullRequest, Layers, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FilePath } from "@/components/ui/file-path";
import { useArtifact } from "@/lib/api/hooks";
import type { Artifact } from "@/lib/api/types";

interface ArtifactPreviewProps {
  artifact: Artifact;
  projectId: string;
}

export function ArtifactPreview({ artifact, projectId }: ArtifactPreviewProps) {
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

  const { data, isLoading, error } = useArtifact(projectId, artifact.id);

  return (
    <Card className="border-border bg-surface-accent h-full flex flex-col">
      <CardHeader className="p-4 sm:p-5 border-b border-border/40 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {getIcon(artifact.type)}
            <Badge variant="default" className="text-[10px] font-mono border-border uppercase">
              {artifact.type}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {projectId && (
              <Link to={`/app/projects/${projectId}/ask?q=${encodeURIComponent(`Explain ${artifact.title}`)}`}>
                <Button size="sm" variant="secondary" className="h-7 text-[11px] gap-1.5 border-border font-mono">
                  <Sparkles className="h-3 w-3 text-copper" />
                  <span>Ask about file</span>
                </Button>
              </Link>
            )}
            {artifact.url && (
              <a
                href={artifact.url}
                target="_blank"
                rel="noreferrer"
                className="text-text-muted hover:text-copper transition p-1"
                aria-label="View on GitHub"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-paper font-mono">{artifact.title}</h2>
          {artifact.path && <FilePath path={artifact.path} className="mt-1" />}
        </div>

        {artifact.summary && (
          <p className="text-xs text-text-muted leading-relaxed bg-surface/40 p-2.5 rounded border border-border/30">
            {artifact.summary}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5 flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Content</div>
          {artifact.type === "file" && artifact.path && (
            <Link
              to={`/app/projects/${projectId}/files?file=${encodeURIComponent(artifact.path)}`}
              className="text-[11px] font-mono text-copper underline"
            >
              Open in file browser
            </Link>
          )}
        </div>
        {isLoading ? (
          <div className="text-xs text-text-muted font-mono">Loading…</div>
        ) : error ? (
          <div className="text-xs text-error font-mono">
            {error instanceof Error ? error.message : "Failed to load artifact."}
          </div>
        ) : (
          <pre className="text-xs font-mono text-paper whitespace-pre-wrap break-words">{data?.body}</pre>
        )}
      </CardContent>
    </Card>
  );
}
