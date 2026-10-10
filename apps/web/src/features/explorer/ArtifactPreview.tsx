import { ExternalLink, FileCode2, GitCommit, GitPullRequest, Layers, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { FilePath } from "@/components/ui/file-path";
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

  const sampleSnippet =
    artifact.type === "file"
      ? `// Indexed AST symbols for ${artifact.path}
use std::sync::Arc;
use petgraph::graph::NodeIndex;

pub struct TaskGraphBuilder {
    workspace_root: PathBuf,
    dag: petgraph::Graph<TaskNode, DependencyEdge>,
}

impl TaskGraphBuilder {
    pub fn new(root: PathBuf) -> Self {
        Self { workspace_root: root, dag: Default::default() }
    }
}`
      : `### Architecture Note
Summary: ${artifact.summary}
Created: ${new Date(artifact.createdAt).toLocaleDateString()}
Status: Grounded in AST and Git Blame`;

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
        <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-2">
          Evidence Snippet & AST Symbols
        </div>
        <CodeBlock code={sampleSnippet} />
      </CardContent>
    </Card>
  );
}
