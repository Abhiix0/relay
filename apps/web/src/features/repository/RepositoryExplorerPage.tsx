import { useParams, useSearchParams } from "react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject, useRepositoryTree } from "@/lib/api/hooks";
import { FileViewer } from "./FileViewer";
import { RepositoryTree } from "./RepositoryTree";

export function RepositoryExplorerPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const filePath = searchParams.get("file");
  
  const { data: project } = useProject(id);
  const { data: repoTree, isLoading, error, refetch } = useRepositoryTree(id);

  const handleFileSelect = (path: string) => {
    setSearchParams({ file: path });
  };

  if (error) {
    return (
      <AppShell>
        <ErrorState
          title="Failed to load repository"
          description="Could not retrieve the repository file tree."
        >
          <button
            onClick={() => refetch()}
            className="text-xs text-copper hover:underline font-mono"
          >
            Retry
          </button>
        </ErrorState>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-border pb-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-copper">
            Repository Explorer
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-paper">
            {project?.fullName || "Browse Files"}
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Navigate source files, inspect implementations, and trace dependencies across the codebase.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-8">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Repository Tree - Left Column */}
            <div className="lg:col-span-4">
              <RepositoryTree
                tree={repoTree?.tree || []}
                selectedPath={filePath}
                onFileSelect={handleFileSelect}
                projectId={id || ""}
              />
            </div>

            {/* File Viewer - Right Column */}
            <div className="lg:col-span-8">
              <FileViewer
                projectId={id || ""}
                filePath={filePath}
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
