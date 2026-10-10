import { useState } from "react";
import { useParams } from "react-router";
import { FileCode2, GitCommit, GitPullRequest, Layers, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChip } from "@/components/ui/filter-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectArtifacts } from "@/lib/api/hooks";
import { cn } from "@/lib/cn";
import { ArtifactPreview } from "./ArtifactPreview";

export function ExplorerPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedType, setSelectedType] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: artifacts = [], isLoading, error, refetch } = useProjectArtifacts(id, selectedType, search);

  const types = ["all", "file", "pr", "commit", "decision"];
  const activeArtifact = artifacts.find((a) => a.id === selectedId) || artifacts[0];

  const getIcon = (type: string) => {
    switch (type) {
      case "file":
        return <FileCode2 className="h-3.5 w-3.5 text-copper shrink-0" />;
      case "pr":
        return <GitPullRequest className="h-3.5 w-3.5 text-sun shrink-0" />;
      case "commit":
        return <GitCommit className="h-3.5 w-3.5 text-moss shrink-0" />;
      case "decision":
        return <Layers className="h-3.5 w-3.5 text-blue shrink-0" />;
      default:
        return <FileCode2 className="h-3.5 w-3.5 text-text-muted shrink-0" />;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="border-b border-border pb-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-copper">
            Codebase & Evidence Navigation
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-paper">
            Explorer & AST Browser
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Browse indexed source files, structural decisions, and historical git blame deltas.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files and artifacts..."
              className="w-full rounded border border-border bg-surface-accent pl-9 pr-3 py-1.5 text-xs text-paper placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-copper font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
            {types.map((t) => (
              <FilterChip
                key={t}
                active={selectedType === t}
                onClick={() => setSelectedType(t)}
              >
                {t === "all" ? "All Artifacts" : t.toUpperCase()}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Dual Pane Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          {/* Artifact List (4 cols) */}
          <div className="lg:col-span-5 rounded border border-border bg-surface-accent p-2 overflow-y-auto max-h-[640px] space-y-1">
            {isLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-xs text-error font-mono space-y-2">
                <div>{error instanceof Error ? error.message : "Failed to load codebase artifacts."}</div>
                <button type="button" onClick={() => refetch()} className="text-copper underline">
                  Retry
                </button>
              </div>
            ) : artifacts.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted">
                No matching artifacts found.
              </div>
            ) : (
              artifacts.map((art) => {
                const isSelected = activeArtifact?.id === art.id;
                return (
                  <button
                    key={art.id}
                    onClick={() => setSelectedId(art.id)}
                    className={cn(
                      "w-full flex items-start gap-2.5 p-3 rounded text-left transition",
                      isSelected
                        ? "bg-surface border-l-2 border-copper text-paper shadow-sm"
                        : "hover:bg-surface/50 text-text-muted hover:text-paper"
                    )}
                  >
                    <div className="mt-0.5">{getIcon(art.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-medium truncate text-paper">
                        {art.title}
                      </div>
                      {art.summary && (
                        <div className="text-[11px] text-text-muted truncate mt-0.5">
                          {art.summary}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Artifact Detail Preview (7 cols) */}
          <div className="lg:col-span-7">
            {activeArtifact ? (
              <ArtifactPreview artifact={activeArtifact} projectId={id || ""} />
            ) : (
              <EmptyState
                title="Select an artifact"
                description="Choose a file, PR, or decision from the list to preview its code and AST evidence."
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
