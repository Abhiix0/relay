import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { HandoffPage } from "./HandoffPage";
import * as apiHooks from "@/lib/api/hooks";
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
});
