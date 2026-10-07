import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { projectSchema } from "@web-types/types";
import { createApp } from "./app";
import { AppError } from "./lib/errors";
import { errorHandler } from "./middleware/error";

describe("app foundation", () => {
  const app = createApp();

  it("healthz returns ok", async () => {
    const res = await request(app).get("/api/v1/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("unknown route returns 404 envelope", async () => {
    const res = await request(app).get("/api/v1/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Not found", code: "not_found" });
  });

  it("echoes X-Request-Id and generates one otherwise", async () => {
    const a = await request(app).get("/api/v1/healthz").set("X-Request-Id", "abc-123");
    expect(a.headers["x-request-id"]).toBe("abc-123");
    const b = await request(app).get("/api/v1/healthz");
    expect(b.headers["x-request-id"]).toMatch(/\S+/);
  });

  it("maps AppError, ZodError and unknown errors", async () => {
    const t = express();
    t.get("/app", () => {
      throw new AppError(409, "conflict", "Nope", { a: 1 });
    });
    t.get("/zod", () => {
      z.object({ x: z.string() }).parse({});
    });
    t.get("/boom", () => {
      throw new Error("secret stack detail");
    });
    t.use(errorHandler);

    const r1 = await request(t).get("/app");
    expect(r1.status).toBe(409);
    expect(r1.body).toEqual({ message: "Nope", code: "conflict", details: { a: 1 } });

    const r2 = await request(t).get("/zod");
    expect(r2.status).toBe(422);
    expect(r2.body.code).toBe("validation_error");
    expect(Array.isArray(r2.body.details)).toBe(true);

    const r3 = await request(t).get("/boom");
    expect(r3.status).toBe(500);
    expect(r3.body).toEqual({ message: "Internal server error", code: "internal_error" });
  });
});

describe("web types alias", () => {
  it("parses a valid project", () => {
    const now = new Date().toISOString();
    const project = {
      id: "507f1f77bcf86cd799439011",
      fullName: "acme/widgets",
      name: "widgets",
      owner: "acme",
      description: "Widgets",
      language: "TypeScript",
      defaultBranch: "main",
      visibility: "public",
      syncStatus: "running",
      lastSyncedAt: null,
      stats: { commits: 1, pullRequests: 0, issues: 0, releases: 0, files: 3 },
      healthLabel: "Indexing in progress",
      createdAt: now,
      updatedAt: now,
    };
    expect(projectSchema.parse(project).fullName).toBe("acme/widgets");
  });
});
