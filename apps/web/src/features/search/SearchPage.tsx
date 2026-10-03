import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChip } from "@/components/ui/filter-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalSearch, useProjects } from "@/lib/api/hooks";
import { SearchResultItem } from "./SearchResultItem";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Read initial state from URL
  const urlQuery = searchParams.get("q") || "";
  const urlProject = searchParams.get("projectId") || "all";
  const urlLanguage = searchParams.get("language") || "all";

  const [inputValue, setInputValue] = useState(urlQuery);
  const [query, setQuery] = useState(urlQuery);
  const [selectedProject, setSelectedProject] = useState(urlProject);
  const [selectedLanguage, setSelectedLanguage] = useState(urlLanguage);

  const { data: projects = [] } = useProjects();
  const { data: searchResults, isLoading } = useGlobalSearch(
    query,
    selectedProject === "all" ? null : selectedProject,
    selectedLanguage === "all" ? null : selectedLanguage
  );

  const languages = ["all", "rust", "typescript", "markdown", "json", "toml"];
  const projectOptions = [
    { id: "all", name: "All Projects" },
    ...projects.map((p) => ({ id: p.id, name: p.name })),
  ];

  // Update URL when filters change
  useEffect(() => {
    if (!query) return;
    
    const params: Record<string, string> = { q: query };
    if (selectedProject !== "all") params.projectId = selectedProject;
    if (selectedLanguage !== "all") params.language = selectedLanguage;
    
    setSearchParams(params);
  }, [query, selectedProject, selectedLanguage, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setQuery(inputValue.trim());
    }
  };

  const handleResultClick = (filePath: string, projectId: string) => {
    // Navigate to the file in the repository explorer
    navigate(`/app/projects/${projectId}/files?file=${encodeURIComponent(filePath)}`);
  };

  return (
    <AppShell showProjectNav={false}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="border-b border-border pb-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-copper">
            Global Repository Search
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-paper">
            Search Across Projects
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Find code, documentation, and decisions across all connected repositories.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search for functions, classes, documentation..."
              className="w-full rounded border border-border bg-surface-accent pl-10 pr-24 py-3 text-sm text-paper placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-copper font-mono shadow-sm"
            />
            <Button
              type="submit"
              size="sm"
              variant="primary"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-copper text-paper text-xs"
              disabled={!inputValue.trim()}
            >
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Project Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-text-muted shrink-0">
                Project:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {projectOptions.map((proj) => (
                  <FilterChip
                    key={proj.id}
                    active={selectedProject === proj.id}
                    onClick={() => setSelectedProject(proj.id)}
                  >
                    {proj.name}
                  </FilterChip>
                ))}
              </div>
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-text-muted shrink-0">
                Language:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {languages.map((lang) => (
                  <FilterChip
                    key={lang}
                    active={selectedLanguage === lang}
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    {lang}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Results Count */}
        {query && (
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-text-muted">
              {isLoading ? (
                "Searching..."
              ) : searchResults ? (
                <>
                  Found <span className="text-copper font-semibold">{searchResults.totalCount}</span>{" "}
                  {searchResults.totalCount === 1 ? "result" : "results"}
                  {query && <> for "<span className="text-paper">{query}</span>"</>}
                </>
              ) : null}
            </span>
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {!query ? (
            <EmptyState
              title="Start searching"
              description="Enter a search query to find code, documentation, and decisions across your repositories."
            />
          ) : isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !searchResults || searchResults.results.length === 0 ? (
            <EmptyState
              title="No results found"
              description="Try adjusting your search query or changing the filters."
            />
          ) : (
            searchResults.results.map((result) => (
              <SearchResultItem
                key={result.id}
                result={result}
                query={query}
                onResultClick={handleResultClick}
              />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
