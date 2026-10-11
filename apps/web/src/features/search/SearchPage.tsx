import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Code2,
  FileCode2,
  FileText,
  Layers,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { useGlobalSearch, useProjects } from "@/lib/api/hooks";
import { SearchResultItem } from "./SearchResultItem";

const LANGUAGE_LABELS: Record<string, string> = {
  all: "All",
  typescript: "TS",
  javascript: "JS",
  python: "PY",
  go: "Go",
  rust: "RS",
  markdown: "MD",
  json: "JSON",
  yaml: "YAML",
  css: "CSS",
  html: "HTML",
  shell: "SH",
  toml: "TOML",
};

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const urlQuery = searchParams.get("q") || "";
  const urlProject = searchParams.get("projectId") || "all";
  const urlLanguage = searchParams.get("language") || "all";

  const [inputValue, setInputValue] = useState(urlQuery);
  const [query, setQuery] = useState(urlQuery);
  const [selectedProject, setSelectedProject] = useState(urlProject);
  const [selectedLanguage, setSelectedLanguage] = useState(urlLanguage);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: projects = [] } = useProjects();
  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useGlobalSearch(
    query,
    selectedProject === "all" ? null : selectedProject,
    selectedLanguage === "all" ? null : selectedLanguage
  );

  const languages = Object.keys(LANGUAGE_LABELS);
  const projectOptions = [
    { id: "all", name: "All Projects" },
    ...projects.map((p) => ({ id: p.id, name: p.name })),
  ];

  const hasActiveFilters =
    selectedProject !== "all" || selectedLanguage !== "all";

  useEffect(() => {
    if (!query) return;
    const params: Record<string, string> = { q: query };
    if (selectedProject !== "all") params.projectId = selectedProject;
    if (selectedLanguage !== "all") params.language = selectedLanguage;
    setSearchParams(params);
  }, [query, selectedProject, selectedLanguage, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) setQuery(inputValue.trim());
  };

  const handleClear = () => {
    setInputValue("");
    setQuery("");
    setSearchParams({});
    inputRef.current?.focus();
  };

  const handleFilterChange = (
    type: "project" | "language",
    value: string
  ) => {
    if (type === "project") setSelectedProject(value);
    else setSelectedLanguage(value);

    if (query) {
      const params: Record<string, string> = { q: query };
      const proj = type === "project" ? value : selectedProject;
      const lang = type === "language" ? value : selectedLanguage;
      if (proj !== "all") params.projectId = proj;
      if (lang !== "all") params.language = lang;
      setSearchParams(params);
    }
  };

  const handleResultClick = (filePath: string, projectId: string) => {
    navigate(
      `/app/projects/${projectId}/files?file=${encodeURIComponent(filePath)}`
    );
  };

  const resultCount = searchResults?.totalCount ?? 0;

  return (
    <AppShell showProjectNav={false}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* ── Page Header ── */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-copper font-semibold mb-1">
            Global Repository Search
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-text leading-tight">
            Search Across Projects
          </h1>
          <p className="text-sm text-text-muted mt-2">
            Find functions, classes, documentation and decisions across all
            connected repositories.
          </p>
        </div>

        {/* ── Search Bar ── */}
        <form onSubmit={handleSearch}>
          <div
            className={cn(
              "relative flex items-center rounded-lg border bg-surface-accent shadow-sm transition-all",
              "focus-within:ring-2 focus-within:ring-copper focus-within:border-copper",
              "border-border"
            )}
          >
            <Search className="absolute left-4 h-4 w-4 text-text-muted shrink-0 pointer-events-none" />
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search for functions, classes, documentation..."
              className="flex-1 bg-transparent pl-11 pr-4 py-4 text-sm text-text placeholder:text-text-muted focus:outline-none font-sans"
            />
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 mr-1 text-text-muted hover:text-text transition rounded"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className={cn(
                "m-2 px-5 py-2 rounded text-xs font-mono font-semibold tracking-wide transition-all",
                "bg-copper text-paper hover:bg-copper-dark",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "shrink-0"
              )}
            >
              Search
            </button>
          </div>
        </form>

        {/* ── Filter Panel ── */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className={cn(
              "flex items-center gap-2 text-xs font-mono transition",
              hasActiveFilters ? "text-copper" : "text-text-muted hover:text-text"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-copper text-paper text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
                {(selectedProject !== "all" ? 1 : 0) +
                  (selectedLanguage !== "all" ? 1 : 0)}
              </span>
            )}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProject("all");
                  setSelectedLanguage("all");
                  if (query) setSearchParams({ q: query });
                }}
                className="ml-1 text-[10px] text-copper-text hover:underline"
              >
                Clear all
              </button>
            )}
          </button>

          {filtersOpen && (
            <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg border border-border bg-surface-accent">
              {/* Project Filter */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                  Project
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {projectOptions.map((proj) => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => handleFilterChange("project", proj.id)}
                      className={cn(
                        "px-2.5 py-1 rounded text-[11px] font-mono transition border",
                        selectedProject === proj.id
                          ? "bg-copper text-paper border-copper"
                          : "text-text-muted border-border hover:border-copper/50 hover:text-text bg-surface"
                      )}
                    >
                      {proj.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Filter */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                  Language
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleFilterChange("language", lang)}
                      className={cn(
                        "px-2.5 py-1 rounded text-[11px] font-mono transition border",
                        selectedLanguage === lang
                          ? "bg-copper text-paper border-copper"
                          : "text-text-muted border-border hover:border-copper/50 hover:text-text bg-surface"
                      )}
                    >
                      {LANGUAGE_LABELS[lang] ?? lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Results Area ── */}
        <div className="space-y-4">
          {/* Results meta bar */}
          {query && !isLoading && searchResults && (
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <p className="text-xs font-mono text-text-muted">
                Found{" "}<span className="text-copper font-semibold">{resultCount}</span>{" "}
                {resultCount === 1 ? "result" : "results"} for{" "}
                <span className="text-text font-semibold">"{query}"</span>
              </p>
            </div>
          )}

          {/* States */}
          {!query ? (
            <SearchEmptyPrompt />
          ) : isLoading ? (
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="Search unavailable"
              description={
                error instanceof Error
                  ? error.message
                  : "Could not reach the search service. Ensure the API backend is running."
              }
            >
              <Button
                variant="primary"
                size="sm"
                onClick={() => refetch()}
                className="bg-copper text-paper"
              >
                Retry Search
              </Button>
            </ErrorState>
          ) : !searchResults || searchResults.results.length === 0 ? (
            <NoResults query={query} />
          ) : (
            <div className="space-y-3">
              {searchResults.results.map((result) => (
                <SearchResultItem
                  key={result.id}
                  result={result}
                  query={query}
                  onResultClick={handleResultClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

/* ── Sub-components ── */

function SearchEmptyPrompt() {
  return (
    <div className="py-16 flex flex-col items-center gap-6 text-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-copper/10 border border-copper/20 flex items-center justify-center">
          <Search className="h-7 w-7 text-copper" />
        </div>
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-lg font-serif text-text">Start searching</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Type a function, class, keyword, or concept to find matching code,
          documentation, and decisions across all connected repositories.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-2 w-full max-w-sm">
        {[
          { icon: FileCode2, label: "Code & Files", color: "text-copper" },
          { icon: FileText, label: "Documentation", color: "text-blue" },
          { icon: Layers, label: "Decisions", color: "text-moss" },
        ].map(({ icon: Icon, label, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border bg-surface-accent"
          >
            <Icon className={cn("h-4 w-4", color)} />
            <span className="text-[10px] font-mono text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="py-14 flex flex-col items-center gap-4 text-center">
      <div className="w-14 h-14 rounded-xl bg-surface-accent border border-border flex items-center justify-center">
        <Code2 className="h-6 w-6 text-text-muted" />
      </div>
      <div className="space-y-1.5 max-w-xs">
        <h2 className="text-base font-semibold font-mono text-text">
          No results found for "{query}"
        </h2>
        <p className="text-xs text-text-muted leading-relaxed">
          Try a different keyword, or remove some filters to broaden the search.
        </p>
      </div>
    </div>
  );
}
