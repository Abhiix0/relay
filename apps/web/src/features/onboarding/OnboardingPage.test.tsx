import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { OnboardingPage } from "./OnboardingPage";
import * as apiHooks from "@/lib/api/hooks";
import { mockOnboardingData, mockProjects } from "@/mocks/data";

vi.mock("@/lib/api/hooks", async () => {
  const actual = await vi.importActual("@/lib/api/hooks");
  return {
    ...actual,
    useProject: vi.fn(),
    useOnboardingData: vi.fn(),
    useOnboarding: vi.fn(),
    useToggleOnboardingItem: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  };
});

function createQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderOnboarding(projectId: string = "turborepo") {
  return render(
    <QueryClientProvider client={createQC()}>
      <MemoryRouter initialEntries={[`/app/projects/${projectId}/onboarding`]}>
        <Routes>
          <Route path="/app/projects/:id/onboarding" element={<OnboardingPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("OnboardingPage Component", () => {
  it("renders onboarding guide and progress when data is available", () => {
    const project = mockProjects[0];
    if (!project) throw new Error("No mock project");

    vi.mocked(apiHooks.useProject).mockReturnValue({
      data: project,
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useProject>);

    vi.mocked(apiHooks.useOnboardingData).mockReturnValue({
      data: mockOnboardingData,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof apiHooks.useOnboardingData>);

    vi.mocked(apiHooks.useOnboarding).mockReturnValue({
      data: {
        id: "plan_1",
        projectId: project.id,
        items: [
          { id: "i1", title: "Review Architecture", description: "Read summary", completed: false, category: "setup" },
        ],
      },
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useOnboarding>);

    renderOnboarding(project.id);

    expect(screen.getByText(/Contributor Ramp-Up/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Turborepo/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Review Architecture")).toBeInTheDocument();
  });

  it("renders empty/unavailable state when onboarding data is missing", () => {
    vi.mocked(apiHooks.useProject).mockReturnValue({
      data: mockProjects[0],
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useProject>);

    vi.mocked(apiHooks.useOnboardingData).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof apiHooks.useOnboardingData>);

    renderOnboarding();

    expect(screen.getByText(/Onboarding data unavailable/i)).toBeInTheDocument();
  });
});
