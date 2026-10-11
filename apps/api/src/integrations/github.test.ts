import { afterEach, describe, expect, it, vi } from "vitest";
import { createGithubClient } from "./github";

afterEach(() => vi.unstubAllGlobals());

const page = (from: number, n: number, prEvery: number) =>
  Array.from({ length: n }, (_, i) => ({
    number: from + i,
    title: "t",
    body: null,
    html_url: "https://github.com/a/b/issues/1",
    state: "open",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...((from + i) % prEvery === 0 ? { pull_request: {} } : {}),
  }));

describe("github client", () => {
  it("listIssues pages past pull requests until the limit", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const p = Number(new URL(url).searchParams.get("page"));
      return new Response(JSON.stringify(page((p - 1) * 100 + 1, 100, 2)));
    });
    vi.stubGlobal("fetch", fetchMock);
    const out = await createGithubClient().listIssues("t", "a/b", 100);
    expect(out).toHaveLength(100);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(out.every((t) => t.number % 2 === 1)).toBe(true);
  });

  it("listCommits falls back to committer date, never epoch", async () => {
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response(
          JSON.stringify([
            { sha: "a", html_url: "u", commit: { message: "m", author: null, committer: { date: "2026-02-01T00:00:00Z" } } },
            { sha: "b", html_url: "u", commit: { message: "m", author: null, committer: null } },
          ]),
        ),
    );
    const [a, b] = await createGithubClient().listCommits("t", "a/b", 2);
    expect(a?.date.toISOString()).toBe("2026-02-01T00:00:00.000Z");
    expect(b!.date.getTime()).toBeGreaterThan(0);
  });
});
