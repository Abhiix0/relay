import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectRepoModal } from "./ConnectRepoModal";
import { useProjects } from "@/lib/api/hooks";
import type { GithubReposResponse, Project } from "@/lib/api/types";

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;
let fetchSpy: MockInstance<typeof fetch>;

const repo = (o: Partial<GithubReposResponse["repos"][number]>) => ({
  id: "1", fullName: "a/one", name: "one", owner: "a", description: null, language: "Rust",
  private: false, defaultBranch: "main", pushedAt: "2026-01-01T00:00:00.000Z",
  connected: false, connectedProjectId: null, ...o,
});

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter><ConnectRepoModal /></MemoryRouter>
    </QueryClientProvider>
  );
  return userEvent.click(screen.getByRole("button", { name: /Connect Repository/i }));
}

describe("ConnectRepoModal", () => {
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });
  afterEach(() => vi.restoreAllMocks());

  it("disables connected rows and links to their project", async () => {
    fetchSpy.mockResolvedValue(ok({
      canAccessPrivate: false,
      repos: [repo({}), repo({ id: "2", fullName: "a/two", private: true, connected: true, connectedProjectId: "p2" })],
    }));
    await setup();
    expect(await screen.findByRole("button", { name: "Connect a/two" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Connect a/one" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "a/two" })).toHaveAttribute("href", "/app/projects/p2");
    expect(screen.getByText(/Only public repositories/)).toBeInTheDocument();
  });

  it("searches with the typed query", async () => {
    fetchSpy.mockResolvedValue(ok({ canAccessPrivate: true, repos: [] }));
    await setup();
    await userEvent.type(screen.getByLabelText("Search repositories"), "ab");
    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledWith("/api/v1/github/repos?q=ab", expect.anything() as RequestInit));
  });

  it("shows an error state", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      json: async () => ({ message: "GitHub unavailable" }),
    } as Response);
    await setup();
    expect(await screen.findByText("GitHub unavailable")).toBeInTheDocument();
  });
});

describe("useProjects polling", () => {
  it("polls every 2s only while a project is running", () => {
    const qc = new QueryClient();
    function Probe() {
      useProjects();
      return null;
    }
    render(<QueryClientProvider client={qc}><Probe /></QueryClientProvider>);
    const interval = (qc.getQueryCache().getAll()[0]?.options as { refetchInterval: (q: unknown) => unknown }).refetchInterval;
    const q = (syncStatus: string) => ({ state: { data: [{ syncStatus }] as Project[] } });
    expect(interval(q("running"))).toBe(2000);
    expect(interval(q("succeeded"))).toBe(false);
  });
});
