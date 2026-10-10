import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./DashboardPage";
import * as apiHooks from "@/lib/api/hooks";
import { mockProjects, mockUser } from "@/mocks/data";

vi.mock("@/lib/api/hooks", async () => {
  const actual = await vi.importActual("@/lib/api/hooks");
  return {
    ...actual,
    useCurrentUser: vi.fn(),
    useProjects: vi.fn(),
  };
});

function createQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderDashboard() {
  return render(
    <QueryClientProvider client={createQC()}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("DashboardPage Component", () => {
  it("renders empty state when no repositories are connected", () => {
    vi.mocked(apiHooks.useCurrentUser).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof apiHooks.useCurrentUser>);

    vi.mocked(apiHooks.useProjects).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof apiHooks.useProjects>);

    renderDashboard();

    expect(screen.getByText(/No repositories connected/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Connect Repository/i }).length).toBeGreaterThan(0);
  });

  it("renders metric cards and project list when repositories are present", () => {
    vi.mocked(apiHooks.useCurrentUser).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof apiHooks.useCurrentUser>);

    vi.mocked(apiHooks.useProjects).mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof apiHooks.useProjects>);

    renderDashboard();

    expect(screen.getByText("Total Projects")).toBeInTheDocument();
    expect(screen.getByText("Open Issues")).toBeInTheDocument();
    expect(screen.getByText("vercel/turbo")).toBeInTheDocument();
  });
});
