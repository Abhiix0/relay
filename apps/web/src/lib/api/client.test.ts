import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "./client";

describe("apiFetch 401 handling", () => {
  const assign = vi.fn();
  const originalLocation = window.location;

  function setPath(pathname: string) {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { pathname, assign },
    });
  }

  beforeEach(() => {
    assign.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("redirects to /sign-in from a normal path and still throws", async () => {
    setPath("/dashboard");
    await expect(apiFetch("/projects")).rejects.toBeInstanceOf(ApiError);
    expect(assign).toHaveBeenCalledWith("/sign-in");
  });

  it("does not redirect on /sign-in", async () => {
    setPath("/sign-in");
    await expect(apiFetch("/auth/me")).rejects.toBeInstanceOf(ApiError);
    expect(assign).not.toHaveBeenCalled();
  });
});
