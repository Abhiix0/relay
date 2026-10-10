import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Db } from "mongodb";
import { createGithubClient, type GithubUserRepo } from "../integrations/github";
import { FakeGithub } from "../test/fakes";
import { loginAs, makeTestApp, startTestDb, stopTestDb } from "../test/helpers";

let db: Db;
beforeAll(async () => {
  db = await startTestDb();
});
afterAll(stopTestDb);

const repo = (id: number, full: string): GithubUserRepo => ({
  id,
  full_name: full,
  name: full.split("/")[1]!,
  owner: full.split("/")[0]!,
  description: null,
  language: "Rust",
  default_branch: "main",
  private: false,
  pushedAt: "2026-01-02T03:04:05Z",
});
const get = (app: ReturnType<typeof makeTestApp>, cookie: string, q = "") =>
  request(app).get("/api/v1/github/repos").query({ q }).set("Cookie", cookie);

function setup() {
  const github = new FakeGithub();
  github.addRepo("acme/widget", { id: 1 });
  github.userRepos = [repo(1, "acme/widget"), repo(2, "acme/Gadget")];
  return { github, app: makeTestApp({ db, github }) };
}

describe("github repo picker", () => {
  it("flags connected repos, filters by q, caches the GitHub list", async () => {
    const { github, app } = setup();
    const { cookie } = await loginAs(db, { scope: "read:user repo" });
    const made = await request(app).post("/api/v1/projects").set("Cookie", cookie).send({ fullName: "acme/widget" });
    const all = await get(app, cookie);
    expect(all.status).toBe(200);
    expect(all.body.canAccessPrivate).toBe(true);
    expect(all.body.repos).toHaveLength(2);
    expect(all.body.repos[0]).toMatchObject({
      fullName: "acme/widget",
      connected: true,
      connectedProjectId: made.body.id,
      pushedAt: "2026-01-02T03:04:05.000Z",
    });
    expect(all.body.repos[1]).toMatchObject({ connected: false, connectedProjectId: null });
    const filtered = await get(app, cookie, "GADGET");
    expect(filtered.body.repos.map((r: { fullName: string }) => r.fullName)).toEqual(["acme/Gadget"]);
    expect(github.listUserReposCalls).toBe(1);
  });

  it("canAccessPrivate is false without repo scope; 401 without session", async () => {
    const { app } = setup();
    const { cookie } = await loginAs(db, { scope: "read:user public_repo" });
    expect((await get(app, cookie)).body.canAccessPrivate).toBe(false);
    expect((await request(app).get("/api/v1/github/repos")).status).toBe(401);
  });

  it("never shows another user's connected projects", async () => {
    const { app } = setup();
    const a = await loginAs(db);
    const b = await loginAs(db);
    await request(app).post("/api/v1/projects").set("Cookie", a.cookie).send({ fullName: "acme/widget" });
    const res = await get(app, b.cookie);
    expect(res.body.repos.every((r: { connected: boolean }) => !r.connected)).toBe(true);
  });

  it("429 over the limit", async () => {
    const { app } = setup();
    const { cookie } = await loginAs(db);
    for (let i = 0; i < 30; i++) expect((await get(app, cookie)).status).toBe(200);
    expect((await get(app, cookie)).status).toBe(429);
  });
});

describe("real github client", () => {
  it("sync counts query open issues/PRs only", async () => {
    const urls: string[] = [];
    vi.stubGlobal("fetch", async (u: string) => {
      urls.push(decodeURIComponent(u));
      return new Response(JSON.stringify({ total_count: 3 }), { status: 200 });
    });
    const gh = createGithubClient();
    expect(await gh.searchCount("t", "a/b", "issue")).toBe(3);
    await gh.searchCount("t", "a/b", "pr");
    vi.unstubAllGlobals();
    expect(urls[0]).toContain("q=repo:a/b is:issue is:open");
    expect(urls[1]).toContain("q=repo:a/b is:pr is:open");
  });
});
