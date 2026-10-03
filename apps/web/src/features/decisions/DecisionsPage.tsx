import { useState } from "react";
import { useParams } from "react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useDecisions, useProject } from "@/lib/api/hooks";
import { DecisionCard } from "./DecisionCard";
import { NewDecisionModal } from "./NewDecisionModal";

export function DecisionsPage() {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");

  const { data: project } = useProject(id);
  const { data: decisions = [], isLoading } = useDecisions(id);

  const filteredDecisions = decisions.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.summary.toLowerCase().includes(search.toLowerCase()) ||
      d.rationale.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-copper">
              Architecture Decision Records (ADRs)
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-paper">
              Decisions Log
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Historical record of architectural trade-offs and structural invariants for {project?.name || "this project"}.
            </p>
          </div>
          <NewDecisionModal projectId={id || "turborepo"} />
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decisions & rationale..."
            className="w-full rounded border border-border bg-surface-accent pl-9 pr-3 py-1.5 text-xs text-paper placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-copper font-mono"
          />
        </div>

        {/* Decision List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-44 w-full" />
            </div>
          ) : filteredDecisions.length === 0 ? (
            <EmptyState
              title="No architecture decisions found"
              description="Record technical decisions to preserve rationale for future maintainers."
              action={<NewDecisionModal projectId={id || "turborepo"} />}
            />
          ) : (
            filteredDecisions.map((dec) => (
              <DecisionCard key={dec.id} decision={dec} />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
