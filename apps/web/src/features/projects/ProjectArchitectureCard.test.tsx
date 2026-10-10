import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { ProjectArchitectureCard } from "./ProjectArchitectureCard";
import * as apiHooks from "@/lib/api/hooks";
import { mockOnboardingData } from "@/test/fixtures/apiFixtures";

vi.mock("@/lib/api/hooks", () => ({ useOnboardingData: vi.fn() }));

function renderCard(result: object) {
  vi.mocked(apiHooks.useOnboardingData).mockReturnValue(result as ReturnType<typeof apiHooks.useOnboardingData>);
  return render(
    <MemoryRouter>
      <ProjectArchitectureCard projectId="p1" />
    </MemoryRouter>,
  );
}

describe("ProjectArchitectureCard", () => {
  it("lists main modules from onboarding data", () => {
    renderCard({ data: mockOnboardingData, isLoading: false, error: null });
    const first = mockOnboardingData.architecture.mainModules[0]!;
    expect(screen.getByText(first.name)).toBeInTheDocument();
    expect(screen.getByText(first.description)).toBeInTheDocument();
  });

  it("shows the empty state", () => {
    renderCard({ data: { ...mockOnboardingData, architecture: { summary: "", mainModules: [] } }, isLoading: false, error: null });
    expect(screen.getByText(/No architectural modules analyzed/)).toBeInTheDocument();
  });

  it("shows the error state", () => {
    renderCard({ data: undefined, isLoading: false, error: new Error("x") });
    expect(screen.getByText(/Could not load architectural modules/)).toBeInTheDocument();
  });
});
