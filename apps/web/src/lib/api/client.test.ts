// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { api, ApiError } from "./client";

// Mock globalThis.fetch directly — no MSW needed here.
// We test the client's response-handling logic, not network transport.

function makeFetchMock(status: number, body: unknown, contentType = "application/json") {
  const json = typeof body === "string" ? body : JSON.stringify(body);
  return vi.fn().mockResolvedValue(
    new Response(json, {
      status,
      headers: { "Content-Type": contentType },
    })
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

// ── Success ──────────────────────────────────────────────────

describe("api.get — success", () => {
  it("returns parsed JSON on 200", async () => {
    vi.stubGlobal("fetch", makeFetchMock(200, { ok: true }));
    const result = await api.get<{ ok: boolean }>("/ping");
    expect(result.ok).toBe(true);
  });

  it("returns undefined on 204", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    const result = await api.get<undefined>("/empty");
    expect(result).toBeUndefined();
  });
});

// ── 4xx errors ───────────────────────────────────────────────

describe("api.get — 4xx errors", () => {
  it("throws ApiError on 404", async () => {
    vi.stubGlobal("fetch", makeFetchMock(404, { message: "Not found", code: "NOT_FOUND" }));
    await expect(api.get("/missing")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      code: "NOT_FOUND",
      retryable: false,
    });
  });

  it("throws ApiError on 401 with retryable=false", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock(401, { message: "Unauthorized", code: "UNAUTHENTICATED" })
    );
    await expect(api.get("/secret")).rejects.toMatchObject({
      status: 401,
      retryable: false,
    });
  });

  it("sets retryable=true on 429", async () => {
    vi.stubGlobal("fetch", makeFetchMock(429, { message: "Too many requests" }));
    await expect(api.get("/rate-limited")).rejects.toMatchObject({
      status: 429,
      retryable: true,
    });
  });
});

// ── 5xx errors ───────────────────────────────────────────────

describe("api.get — 5xx errors", () => {
  it("throws ApiError with retryable=true on 500", async () => {
    vi.stubGlobal("fetch", makeFetchMock(500, { message: "Internal server error" }));
    await expect(api.get("/boom")).rejects.toMatchObject({
      status: 500,
      retryable: true,
    });
  });

  it("falls back to statusText when body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock(503, "not json", "text/plain")
    );
    const err = await api.get("/bad-body").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(503);
  });
});

// ── Schema validation ────────────────────────────────────────

describe("api.get — schema validation (dev)", () => {
  const schema = z.object({ id: z.string(), count: z.number() });

  it("accepts a valid response", async () => {
    vi.stubGlobal("fetch", makeFetchMock(200, { id: "abc", count: 42 }));
    const result = await api.get("/valid", schema);
    expect(result.count).toBe(42);
  });

  it("throws SCHEMA_MISMATCH when response shape is wrong (dev)", async () => {
    vi.stubGlobal("fetch", makeFetchMock(200, { id: 123, count: "wrong" }));
    await expect(api.get("/bad-shape", schema)).rejects.toMatchObject({
      code: "SCHEMA_MISMATCH",
      status: 0,
    });
  });
});

// ── ApiError shape ───────────────────────────────────────────

describe("ApiError", () => {
  it("carries requestId", async () => {
    vi.stubGlobal("fetch", makeFetchMock(500, { message: "oops" }));
    const err = await api.get("/err").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(typeof (err as ApiError).requestId).toBe("string");
    expect((err as ApiError).requestId.startsWith("req_")).toBe(true);
  });
});
