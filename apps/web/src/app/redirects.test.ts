// @vitest-environment node
// Pure unit tests — no DOM needed, no React Router instantiation.
import { describe, it, expect } from "vitest";
import { LEGACY_REDIRECTS } from "./redirects";

describe("LEGACY_REDIRECTS table", () => {
  const cases: Array<[string, string]> = [
    ["/dashboard",                 "/app"],
    ["/projects",                  "/app/projects"],
    ["/profile",                   "/app/profile"],
    ["/projects/:id",              "/app/projects/:id"],
    ["/projects/:id/ask",          "/app/projects/:id/ask"],
    ["/projects/:id/files",        "/app/projects/:id/files"],
    ["/projects/:id/onboarding",   "/app/projects/:id/onboarding"],
    ["/projects/:id/handoff",      "/app/projects/:id/handoff"],
    ["/projects/:id/decisions",    "/app/projects/:id/decisions"],
    ["/projects/:id/search",       "/app/projects/:id/search"],
    ["/projects/:id/settings",     "/app/projects/:id/settings"],
    ["/projects/:id/explorer",     "/app/projects/:id/files"],
    ["/app/projects/:id/explorer", "/app/projects/:id/files"],
  ];

  it.each(cases)("redirect %s → %s is registered", (from, to) => {
    const entry = LEGACY_REDIRECTS.find((r) => r.from === from);
    expect(entry).toBeDefined();
    expect(entry?.to).toBe(to);
  });

  it("has no duplicate 'from' paths", () => {
    const froms = LEGACY_REDIRECTS.map((r) => r.from);
    const unique = new Set(froms);
    expect(unique.size).toBe(froms.length);
  });
});
