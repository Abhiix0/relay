import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useFileContent } from "@/lib/api/hooks";
import { FileBreadcrumbs } from "./FileBreadcrumbs";

interface FileViewerProps {
  projectId: string;
  filePath: string | null;
}

export function FileViewer({ projectId, filePath }: FileViewerProps) {
  const { data: fileContent, isLoading, error } = useFileContent(projectId, filePath || undefined);

  const handleCopy = () => {
    if (fileContent?.content) {
      navigator.clipboard.writeText(fileContent.content);
    }
  };

  if (!filePath) {
    return (
      <EmptyState
        title="No file selected"
        description="Select a file from the repository tree to view its contents."
      />
    );
  }

  if (isLoading) {
    return (
      <Card className="border-border bg-surface-accent">
        <CardHeader className="p-4 border-b border-border/40">
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load file"
        description="Could not retrieve the file contents."
      />
    );
  }

  if (!fileContent) {
    return (
      <EmptyState
        title="File not found"
        description="The requested file could not be found in the repository."
      />
    );
  }

  // Check for unsupported/binary/large files
  const isBinary = fileContent.isBinary;
  const isLarge = fileContent.isLarge || fileContent.size > 1000000;

  return (
    <Card className="border-border bg-surface-accent">
      <CardHeader className="p-4 border-b border-border/40 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <h2 className="text-base font-mono font-semibold text-paper truncate">
              {fileContent.name}
            </h2>
            <FileBreadcrumbs path={fileContent.path} />
            {fileContent.language && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                  {fileContent.language}
                </span>
                <span className="text-[10px] font-mono text-text-muted">
                  {formatFileSize(fileContent.size)}
                </span>
              </div>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            disabled={isBinary || isLarge}
            className="gap-2 border-border text-xs shrink-0"
          >
            <Copy className="h-3 w-3" />
            Copy
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isBinary ? (
          <div className="p-8 text-center">
            <p className="text-sm text-text-muted">
              Binary file preview not available
            </p>
          </div>
        ) : isLarge ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-sm text-text-muted">
              File too large to preview ({formatFileSize(fileContent.size)})
            </p>
            <p className="text-xs text-text-muted">
              Files over 1MB are not displayed for performance reasons
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <pre className="p-4 text-xs font-mono leading-relaxed text-paper bg-charcoal/20">
              <code className="block">
                {fileContent.content.split("\n").map((line, idx) => (
                  <div key={idx} className="flex">
                    <span className="inline-block w-12 text-right pr-4 text-text-muted select-none shrink-0">
                      {idx + 1}
                    </span>
                    <span className="flex-1 whitespace-pre">{line || " "}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
