import { useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChip } from "@/components/ui/filter-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/lib/api/hooks";
import { ConnectRepoModal } from "./ConnectRepoModal";
import { DashboardStats } from "./DashboardStats";
import { ProjectCard } from "./ProjectCard";

export function DashboardPage() {
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const { data: projects = [], isLoading } = useProjects();

  const languages = ["all", "TypeScript", "Rust", "Python", "Go"];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.fullName.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase());
    const matchesLang =
      selectedLanguage === "all" || project.language === selectedLanguage;
    return matchesSearch && matchesLang;
  });

  return (
    <AppShell showProjectNav={false}>
      <div className="space-y-8">
        {/* Editorial Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-copper mb-1">
              Workspace Overview
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-paper">
              Connected Repositories
            </h1>
            <p className="text-xs text-text-muted mt-1 max-w-xl">
              Relay parses the AST, commit graph, and PR conversations across your codebases to provide grounded AI answers.
            </p>
          </div>
          <ConnectRepoModal />
        </div>

        {/* Global Summary Stats */}
        <DashboardStats projects={projects} />

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter repositories..."
              className="w-full rounded border border-border bg-surface-accent pl-9 pr-3 py-1.5 text-xs text-paper placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-copper font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {languages.map((lang) => (
              <FilterChip
                key={lang}
                active={selectedLanguage === lang}
                onClick={() => setSelectedLanguage(lang)}
              >
                {lang === "all" ? "All Languages" : lang}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded border border-border bg-surface-accent p-6 space-y-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matching repositories"
            description="Try adjusting your search query or language filter, or connect a new GitHub repository."
            action={<ConnectRepoModal />}
          />
        )}
      </div>
    </AppShell>
  );
}
