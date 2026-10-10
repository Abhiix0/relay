import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { ProjectOverviewPage } from "./ProjectOverviewPage";
import * as apiHooks from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import { mockProjects } from "@/mocks/data";

vi.mock("@/lib/api/hooks", async () => {
  const actual = await vi.importActual("@/lib/api/hooks");
  return {
    ...actual,
    useProject: vi.fn(),
    useSyncStatus: vi.fn(),
    useTriggerSync: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
    useProjectActivity: vi.fn().mockReturnValue({ data: [] }),
  };
});

function createQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderProjectOverview(projectId: string) {
  return render(
    <QueryClientProvider client={createQC()}>
      <MemoryRouter initialEntries={[`/app/projects/${projectId}`]}>
        <Routes>
          <Route path="/app/projects/:id" element={<ProjectOverviewPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("ProjectOverviewPage Component", () => {
  it("renders not-found state when project is missing or invalid", () => {
    vi.mocked(apiHooks.useProject).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError("Project not found", 404, "req_1"),
    } as unknown as ReturnType<typeof apiHooks.useProject>);

    renderProjectOverview("invalid-id");
    expect(screen.getByText(/Project Not Found/i)).toBeInTheDocument();
  });

  it("renders populated project overview with repo header and metrics", () => {
    const project = mockProjects[0];
    if (!project) throw new Error("No mock project found");
    vi.mocked(apiHooks.useProject).mockReturnValue({
      data: project,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof apiHooks.useProject>);

    vi.mocked(apiHooks.useSyncStatus).mockReturnValue({
      data: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof apiHooks.useSyncStatus>);

    renderProjectOverview(project.id);

    expect(screen.getByText(project.fullName)).toBeInTheDocument();
    expect(screen.getByText("Total Commits")).toBeInTheDocument();
    expect(screen.getByText("Pull Requests")).toBeInTheDocument();
    expect(screen.getByText("← Back to Projects")).toBeInTheDocument();
  });
});
