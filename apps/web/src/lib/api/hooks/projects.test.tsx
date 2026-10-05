import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useProjects, useProject } from "./projects";
import type { Project } from "../types";

// Mock the api module — hook tests verify hook behaviour, not the client
vi.mock("../client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    code: string;
    requestId: string;
    retryable: boolean;
    constructor(opts: { message: string; status: number; code?: string; requestId: string }) {
      super(opts.message);
      this.name = "ApiError";
      this.status = opts.status;
      this.code = opts.code ?? "UNKNOWN";
      this.requestId = opts.requestId;
      this.retryable = opts.status === 429 || opts.status >= 500;
    }
  },
}));

import { api } from "../client";

/* ── Test wrapper ───────────────────────────────────────────── */

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const mockProject: Project = {
  id: "proj_1",
  name: "my-repo",
  fullName: "owner/my-repo",
  description: "Test repo",
  language: "TypeScript",
  owner: "owner",
  syncStatus: "succeeded",
  lastSyncedAt: "2026-10-01T00:00:00Z",
  stats: { commits: 10, pullRequests: 2, issues: 1, releases: 1, files: 50 },
  health: { overall: 80, documentation: 60, activity: "high" },
  healthLabel: "Healthy",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-10-01T00:00:00Z",
};

beforeEach(() => {
  vi.resetAllMocks();
});

/* ── useProjects ─────────────────────────────────────────────── */

describe("useProjects", () => {
  it("fetches and returns the project list", async () => {
    vi.mocked(api.get).mockResolvedValueOnce([mockProject]);

    const { result } = renderHook(() => useProjects(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]?.id).toBe("proj_1");
    expect(api.get).toHaveBeenCalledWith("/projects");
  });

  it("surfaces an error when the request fails", async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useProjects(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});

/* ── useProject ─────────────────────────────────────────────── */

describe("useProject", () => {
  it("fetches a single project by id", async () => {
    vi.mocked(api.get).mockResolvedValueOnce(mockProject);

    const { result } = renderHook(() => useProject("proj_1"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.fullName).toBe("owner/my-repo");
    expect(api.get).toHaveBeenCalledWith("/projects/proj_1");
  });

  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useProject(undefined), {
      wrapper: makeWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
    expect(api.get).not.toHaveBeenCalled();
  });
});
