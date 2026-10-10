import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { RepositoryExplorerPage } from "./RepositoryExplorerPage";
import * as apiHooks from "@/lib/api/hooks";
import { mockProjects, mockRepositoryTree } from "@/mocks/data";

vi.mock("@/lib/api/hooks", async () => {
  const actual = await vi.importActual("@/lib/api/hooks");
  return {
    ...actual,
    useProject: vi.fn(),
    useRepositoryTree: vi.fn(),
    useFileContent: vi.fn(),
  };
});

function createQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderExplorer(projectId: string = "turborepo") {
  return render(
    <QueryClientProvider client={createQC()}>
      <MemoryRouter initialEntries={[`/app/projects/${projectId}/files`]}>
        <Routes>
          <Route path="/app/projects/:id/files" element={<RepositoryExplorerPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("RepositoryExplorerPage Component", () => {
  it("renders repository tree and filtering capability", () => {
    const project = mockProjects[0];
    if (!project) throw new Error("Missing mock project");

    vi.mocked(apiHooks.useProject).mockReturnValue({
      data: project,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof apiHooks.useProject>);

    vi.mocked(apiHooks.useRepositoryTree).mockReturnValue({
      data: mockRepositoryTree,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof apiHooks.useRepositoryTree>);

    vi.mocked(apiHooks.useFileContent).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof apiHooks.useFileContent>);

    renderExplorer(project.id);

    expect(screen.getByPlaceholderText(/Filter files/i)).toBeInTheDocument();
    expect(screen.getByText(/No file selected/i)).toBeInTheDocument();

    const filterInput = screen.getByPlaceholderText(/Filter files/i);
    fireEvent.change(filterInput, { target: { value: "nonexistent-query" } });
    expect(screen.getByText(/No matching files found/i)).toBeInTheDocument();
  });
});
