import { useState } from "react";
import { useParams } from "react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChip } from "@/components/ui/filter-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject, useProjectArtifacts } from "@/lib/api/hooks";
import { SearchResultCard } from "./SearchResultCard";

export function SearchPage() {
  const { id } = useParams<{ id: string }>();
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const { data: project } = useProject(id);
  const { data: results = [], isLoading } = useProjectArtifacts(id, selectedType, query);

  const types = ["all", "file", "pr", "commit", "decision"];

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="border-b border-border pb-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-copper">
            Evidence-Grounded Search
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-paper">
            Codebase & Evidence Search
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Search symbols, AST nodes, and historical PR conversations for {project?.name || "this project"}.
          </p>
        </div>

        {/* Search Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across files, PRs, decisions, and commit messages..."
              className="w-full rounded border border-border bg-surface-accent pl-10 pr-4 py-2.5 text-sm text-paper placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-copper font-mono shadow-sm"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {types.map((t) => (
                <FilterChip
                  key={t}
                  active={selectedType === t}
                  onClick={() => setSelectedType(t)}
                >
                  {t === "all" ? "All Types" : t.toUpperCase()}
                </FilterChip>
              ))}
            </div>
            <span className="text-[11px] font-mono text-text-muted shrink-0">
              {results.length} results
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              title="No evidence found"
              description="Try broadening your search query or switching the artifact type filter."
            />
          ) : (
            results.map((art) => (
              <SearchResultCard key={art.id} artifact={art} projectId={id || "turborepo"} />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
