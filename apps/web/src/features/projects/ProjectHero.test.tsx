import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectHero } from "./ProjectHero";
import * as apiHooks from "@/lib/api/hooks";
import { mockProjects } from "@/test/fixtures/apiFixtures";

const refetch = vi.fn();
vi.mock("@/lib/api/hooks", async () => {
  const actual = await vi.importActual("@/lib/api/hooks");
  return {
    ...actual,
    useSyncStatus: vi.fn(),
    useTriggerSync: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  };
});

class FakeEventSource {
  static last: FakeEventSource | undefined;
  listeners: Record<string, () => void> = {};
  onerror: (() => void) | null = null;
  closed = false;
  constructor(readonly url: string) {
    FakeEventSource.last = this;
  }
  addEventListener(name: string, fn: () => void) {
    this.listeners[name] = fn;
  }
  close() {
    this.closed = true;
  }
}

function renderHero() {
  const project = mockProjects[0];
  if (!project) throw new Error("No mock project found");
  vi.mocked(apiHooks.useSyncStatus).mockReturnValue({ data: undefined, refetch } as unknown as ReturnType<
    typeof apiHooks.useSyncStatus
  >);
  const view = render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <ProjectHero project={project} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { project, ...view };
}

describe("ProjectHero live updates", () => {
  beforeEach(() => {
    FakeEventSource.last = undefined;
    refetch.mockClear();
    vi.stubGlobal("EventSource", FakeEventSource);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("subscribes to the project's event stream, refetches on sync events and closes on unmount", () => {
    const { project, unmount } = renderHero();
    const es = FakeEventSource.last;
    expect(es?.url).toBe(`/api/v1/projects/${project.id}/events`);
    es?.listeners.sync?.();
    expect(refetch).toHaveBeenCalled();
    unmount();
    expect(es?.closed).toBe(true);
  });

  it("closes the stream on error so polling takes over", () => {
    renderHero();
    const es = FakeEventSource.last;
    es?.onerror?.();
    expect(es?.closed).toBe(true);
  });
});
