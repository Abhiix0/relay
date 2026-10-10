import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { AskPage } from "./AskPage";
import * as apiHooks from "@/lib/api/hooks";
import { mockProjects } from "@/test/fixtures/apiFixtures";

vi.mock("@/lib/api/hooks", async () => {
  const actual = await vi.importActual("@/lib/api/hooks");
  return {
    ...actual,
    useProject: vi.fn(),
    useAskHistory: vi.fn(),
    useAskQuestion: vi.fn(),
  };
});

function createQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderAskPage(projectId: string = "turborepo") {
  return render(
    <QueryClientProvider client={createQC()}>
      <MemoryRouter initialEntries={[`/app/projects/${projectId}/ask`]}>
        <Routes>
          <Route path="/app/projects/:id/ask" element={<AskPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("AskPage Component", () => {
  it("renders conversation history and evidence citations", () => {
    const project = mockProjects[0];
    if (!project) throw new Error("No mock project");

    vi.mocked(apiHooks.useProject).mockReturnValue({
      data: project,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof apiHooks.useProject>);

    vi.mocked(apiHooks.useAskHistory).mockReturnValue({
      data: [
        {
          id: "ans_1",
          projectId: project.id,
          question: "How is caching implemented?",
          answer: "Caching uses SHA-256 content hashes.",
          confidence: "high",
          sources: [
            {
              id: "s1",
              type: "file",
              path: "crates/turborepo-cache/src/http.rs",
              url: null,
              snippet: "pub fn compute_hash()",
            },
          ],
          createdAt: "2026-10-01T00:00:00Z",
        },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useAskHistory>);

    vi.mocked(apiHooks.useAskQuestion).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof apiHooks.useAskQuestion>);

    renderAskPage(project.id);

    expect(screen.getByText("How is caching implemented?")).toBeInTheDocument();
    expect(screen.getByText(/Caching uses SHA-256 content hashes/i)).toBeInTheDocument();
    expect(screen.getByText("crates/turborepo-cache/src/http.rs")).toBeInTheDocument();
  });

  it("submits question when form is submitted or Enter key is pressed", () => {
    const project = mockProjects[0];
    if (!project) throw new Error("No mock project");

    const mutateMock = vi.fn();

    vi.mocked(apiHooks.useProject).mockReturnValue({
      data: project,
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useProject>);

    vi.mocked(apiHooks.useAskHistory).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useAskHistory>);

    vi.mocked(apiHooks.useAskQuestion).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    } as unknown as ReturnType<typeof apiHooks.useAskQuestion>);

    renderAskPage(project.id);

    const textarea = screen.getByPlaceholderText(/Ask anything about architecture/i);
    fireEvent.change(textarea, { target: { value: "Where is the daemon client?" } });
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter", charCode: 13 });

    expect(mutateMock).toHaveBeenCalledWith("Where is the daemon client?", expect.any(Object));
  });
});
