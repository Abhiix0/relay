import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { HandoffPage } from "./HandoffPage";
import * as apiHooks from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import { mockHandoffs, mockProjects } from "@/test/fixtures/apiFixtures";

vi.mock("@/lib/api/hooks", async () => {
  const actual = await vi.importActual("@/lib/api/hooks");
  return {
    ...actual,
    useProject: vi.fn(),
    useHandoffs: vi.fn(),
    useHandoff: vi.fn(),
    useGenerateHandoff: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
    useUpdateHandoff: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
    useCreateHandoffVersion: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  };
});

function createQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderHandoff(projectId: string = "turborepo") {
  return render(
    <QueryClientProvider client={createQC()}>
      <MemoryRouter initialEntries={[`/app/projects/${projectId}/handoff`]}>
        <Routes>
          <Route path="/app/projects/:id/handoff" element={<HandoffPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("HandoffPage Component", () => {
  it("renders handoff briefing with evidence citations and version history", () => {
    const project = mockProjects[0];
    if (!project) throw new Error("No mock project");

    vi.mocked(apiHooks.useProject).mockReturnValue({
      data: project,
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useProject>);

    vi.mocked(apiHooks.useHandoffs).mockReturnValue({
      data: mockHandoffs,
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useHandoffs>);

    vi.mocked(apiHooks.useHandoff).mockReturnValue({
      data: mockHandoffs[0],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof apiHooks.useHandoff>);

    renderHandoff(project.id);

    expect(screen.getByText("Project Handoff")).toBeInTheDocument();
    expect(screen.getByText("Export Markdown")).toBeInTheDocument();
  });

  it("renders empty state when no handoff document exists", () => {
    vi.mocked(apiHooks.useProject).mockReturnValue({
      data: mockProjects[0],
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useProject>);

    vi.mocked(apiHooks.useHandoffs).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useHandoffs>);

    vi.mocked(apiHooks.useHandoff).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof apiHooks.useHandoff>);

    renderHandoff();

    expect(screen.getByText(/No handoff documentation generated/i)).toBeInTheDocument();
  });

  const mockEmpty = (error: unknown) => {
    vi.mocked(apiHooks.useProject).mockReturnValue({
      data: mockProjects[0],
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useProject>);
    vi.mocked(apiHooks.useHandoffs).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useHandoffs>);
    vi.mocked(apiHooks.useHandoff).mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    } as unknown as ReturnType<typeof apiHooks.useHandoff>);
  };

  it("treats a 404 on the current handoff as 'no handoff yet'", () => {
    mockEmpty(new ApiError("No handoff found", 404, "r1"));
    renderHandoff();
    expect(screen.getByText(/No handoff documentation generated/i)).toBeInTheDocument();
    expect(screen.queryByText("Failed to load handoff")).not.toBeInTheDocument();
  });

  it("shows the error state for non-404 errors", () => {
    mockEmpty(new ApiError("boom", 500, "r2"));
    renderHandoff();
    expect(screen.getByText("Failed to load handoff")).toBeInTheDocument();
  });

  it("shows a failed generate message in the empty state", () => {
    mockEmpty(new ApiError("Project has not finished indexing", 404, "r3"));
    vi.mocked(apiHooks.useGenerateHandoff).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: new ApiError("Project has not finished indexing", 409, "r4"),
    } as unknown as ReturnType<typeof apiHooks.useGenerateHandoff>);
    renderHandoff();
    expect(screen.getByRole("alert")).toHaveTextContent("Project has not finished indexing");
    vi.mocked(apiHooks.useGenerateHandoff).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof apiHooks.useGenerateHandoff>);
  });
});
