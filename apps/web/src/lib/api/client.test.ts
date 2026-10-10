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

describe("apiFetch client error handling and configuration", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("handles successful JSON responses correctly", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ id: "proj-1", name: "Relay" }),
    });

    const result = await apiFetch<{ id: string; name: string }>("/projects/proj-1");
    expect(result).toEqual({ id: "proj-1", name: "Relay" });
  });

  it("handles 204 No Content correctly without parsing JSON", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
    });

    const result = await apiFetch<undefined>("/projects/proj-1", { method: "DELETE" });
    expect(result).toBeUndefined();
  });

  it("throws typed ApiError on network connection failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));

    await expect(apiFetch("/projects")).rejects.toThrow(ApiError);
    try {
      await apiFetch("/projects");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(0);
      expect(apiErr.isNetworkOrUnavailable).toBe(true);
      expect(apiErr.message).toContain("Cannot connect to API server");
    }
  });

  it("throws typed ApiError when server returns non-JSON content on 200 OK (e.g. SPA index.html fallback)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html; charset=utf-8" }),
      text: async () => "<!DOCTYPE html><html><body>Relay</body></html>",
    });

    await expect(apiFetch("/projects")).rejects.toThrow(ApiError);
    try {
      await apiFetch("/projects");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.message).toContain("API endpoint returned non-JSON content");
    }
  });

  it("throws typed ApiError with status and custom message on 401 Unauthorized", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ message: "Session expired" }),
    });

    try {
      await apiFetch("/auth/me");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(401);
      expect(apiErr.isUnauthorized).toBe(true);
      expect(apiErr.message).toContain("Session expired");
    }
  });

  it("throws typed ApiError on malformed JSON response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => {
        throw new Error("Unexpected end of JSON input");
      },
    });

    try {
      await apiFetch("/projects");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.message).toContain("Failed to parse server response as JSON");
    }
  });
});
