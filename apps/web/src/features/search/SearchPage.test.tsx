import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { SearchPage } from "./SearchPage";
import * as apiHooks from "@/lib/api/hooks";

vi.mock("@/lib/api/hooks", async () => {
  const actual = await vi.importActual("@/lib/api/hooks");
  return {
    ...actual,
    useGlobalSearch: vi.fn(),
    useProjects: vi.fn().mockReturnValue({ data: [] }),
  };
});

function createQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderSearch(initialEntry: string = "/app/search") {
  return render(
    <QueryClientProvider client={createQC()}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/app/search" element={<SearchPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("SearchPage Component", () => {
  it("renders initial empty state when no query is submitted", () => {
    vi.mocked(apiHooks.useGlobalSearch).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useGlobalSearch>);

    renderSearch();

    expect(screen.getByText(/Start searching/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search for functions/i)).toBeInTheDocument();
  });

  it("executes search when URL query param is provided and renders results", () => {
    vi.mocked(apiHooks.useGlobalSearch).mockReturnValue({
      data: {
        query: "builder",
        totalCount: 1,
        results: [
          {
            id: "res_1",
            title: "Task Dependency DAG Builder",
            filePath: "crates/turborepo-lib/src/engine/builder.rs",
            projectId: "turborepo",
            language: "Rust",
            lineNumber: 42,
            snippet: "pub fn build_engine_dag()",
            createdAt: "2026-10-01T00:00:00Z",
          },
        ],
      },
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useGlobalSearch>);

    renderSearch("/app/search?q=builder");

    expect(screen.getByText(/crates\/turborepo-lib\/src\/engine\/builder.rs/i)).toBeInTheDocument();
    expect(screen.getByText(/Found/i)).toBeInTheDocument();
  });

  it("renders no results state when query matches nothing", () => {
    vi.mocked(apiHooks.useGlobalSearch).mockReturnValue({
      data: {
        query: "nonexistent",
        totalCount: 0,
        results: [],
      },
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useGlobalSearch>);

    renderSearch("/app/search?q=nonexistent");

    expect(screen.getByText(/No results found/i)).toBeInTheDocument();
  });
});
