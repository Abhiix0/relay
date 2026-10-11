import request from "supertest";
import { ObjectId, type Db } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadConfig, resetConfig } from "../config";
import { getCollections, type HandoffDoc } from "../db/collections";
import { createSyncRunner } from "../jobs/syncRunner";
import { isExcludedPath } from "../lib/secrets";
import { redactSecrets } from "../lib/redact";
import { ask } from "../services/askService";
import { FakeGithub, FakeLlm } from "./fakes";
import { loginAs, makeTestApp, startTestDb, stopTestDb } from "./helpers";

let db: Db;
beforeAll(async () => {
  db = await startTestDb();
});
afterAll(stopTestDb);

async function setup() {
  const github = new FakeGithub();
  github.addRepo("acme/widget");
  const app = makeTestApp({ db, github });
  const u = await loginAs(db);
  const created = await request(app).post("/api/v1/projects").set("Cookie", u.cookie).send({ fullName: "acme/widget" });
  const id: string = created.body.id;
  return { github, app, u, id, pid: new ObjectId(id) };
}

describe("a) secret paths", () => {
  it("excludes more credential files; dir match is case-insensitive", () => {
    for (const p of ["id_ed25519", "k/id_ecdsa.pub", "id_dsa", ".npmrc", "a/.netrc", ".pypirc", ".htpasswd", "x.pfx", "x.jks", "x.keystore", "prod.tfvars", "terraform.tfstate", "credentials", "credentials.json", "service-account-prod.json", "Node_Modules/x.js", "Dist/a.js"]) {
      expect(isExcludedPath(p), p).toBe(true);
    }
    expect(isExcludedPath("src/service.json")).toBe(false);
  });
});

describe("b) redaction", () => {
  it("redacts known secret shapes and keeps the rest", () => {
    const secrets = [
      "-----BEGIN RSA PRIVATE KEY-----\nabc\n-----END RSA PRIVATE KEY-----",
      "AKIAABCDEFGHIJKLMNOP",
      "ghp_" + "a".repeat(30),
      "github_pat_" + "b".repeat(30),
      "gsk_" + "c".repeat(30),
      "sk-" + "d".repeat(24),
      "xoxb-1234567890-abcdef",
      "API_KEY=abcdefghijklmnop",
    ];
    for (const s of secrets) expect(redactSecrets(`before ${s} after`), s).toBe("before [REDACTED] after");
    expect(redactSecrets("plain text")).toBe("plain text");
  });

  it("keeps secrets out of repo_files, chunks, artifacts after a sync", async () => {
    const github = new FakeGithub();
    github.addRepo("acme/widget");
    const key = "ghp_" + "z".repeat(30);
    github.addFile("src/a.ts", `const t = "${key}";`);
    github.readme = { path: "README.md", content: `token ${key}`, url: "https://github.com/acme/widget#readme" };
    github.commits = [{ sha: "abc", message: `oops ${key}`, url: "https://github.com/acme/widget/commit/abc", authorName: "o", date: new Date() }];
    const runner = createSyncRunner({ db, github });
    const app = makeTestApp({ db, github, syncRunner: runner });
    const u = await loginAs(db);
    const created = await request(app).post("/api/v1/projects").set("Cookie", u.cookie).send({ fullName: "acme/widget" });
    const pid = new ObjectId(created.body.id as string);
    const c = getCollections(db);
    for (let i = 0; i < 100 && (await c.projects.findOne({ _id: pid }))?.syncStatus === "running"; i++) {
      await new Promise((r) => setTimeout(r, 50));
    }
    expect(await c.repoFiles.countDocuments({ projectId: pid, content: { $ne: null } })).toBeGreaterThan(0);
    const all = JSON.stringify([
      await c.repoFiles.find({ projectId: pid }).toArray(),
      await c.chunks.find({ projectId: pid }).toArray(),
      await c.artifacts.find({ projectId: pid }).toArray(),
    ]);
    expect(all).not.toContain(key);
    expect(all).toContain("[REDACTED]");
  });
});

describe("c) source url scheme", () => {
  it("rejects javascript: and data: in decisions and handoffs", async () => {
    const { app, u, id } = await setup();
    for (const url of ["javascript:alert(1)", "data:text/html,x"]) {
      const d = await request(app).post(`/api/v1/projects/${id}/decisions`).set("Cookie", u.cookie)
        .send({ title: "t", summary: "s", sources: [{ type: "file", url }] });
      expect(d.status, url).toBe(422);
      const h = await request(app).post(`/api/v1/projects/${id}/handoffs`).set("Cookie", u.cookie)
        .send({ title: "t", summary: "s", sections: [{ heading: "h", body: "b", sources: [{ id: "x", type: "file", path: null, url, snippet: "" }] }] });
      expect(h.status, url).toBe(422);
    }
    const ok = await request(app).post(`/api/v1/projects/${id}/decisions`).set("Cookie", u.cookie)
      .send({ title: "t", summary: "s", sources: [{ type: "file", url: "https://example.com/x" }] });
    expect(ok.status).toBe(201);
  });
});

describe("d) project cap", () => {
  it("409 project_limit at the cap; other users unaffected", async () => {
    process.env.MAX_PROJECTS_PER_USER = "1";
    resetConfig();
    try {
      const github = new FakeGithub();
      github.addRepo("acme/one");
      github.addRepo("acme/two");
      const app = makeTestApp({ db, github });
      const u = await loginAs(db);
      const post = (fullName: string, cookie = u.cookie) =>
        request(app).post("/api/v1/projects").set("Cookie", cookie).send({ fullName });
      expect((await post("acme/one")).status).toBe(201);
      const res = await post("acme/two");
      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "project_limit",
        message: "Project limit reached (1). Delete a project to connect another.",
      });
      expect((await post("acme/two", (await loginAs(db)).cookie)).status).toBe(201);
    } finally {
      delete process.env.MAX_PROJECTS_PER_USER;
      resetConfig();
    }
  });

  it("config defaults and validation", () => {
    expect(loadConfig({ NODE_ENV: "test" }).MAX_PROJECTS_PER_USER).toBe(10);
    expect(loadConfig({ NODE_ENV: "test" }).TRUST_PROXY).toBe(1);
    expect(() => loadConfig({ NODE_ENV: "test", MAX_PROJECTS_PER_USER: "0" })).toThrow();
  });
});

describe("e) caps", () => {
  it("409 at 200 decisions and 50 handoff versions", async () => {
    const { app, u, id, pid } = await setup();
    const c = getCollections(db);
    const now = new Date();
    await c.decisions.insertMany(
      Array.from({ length: 200 }, () => ({ _id: new ObjectId(), projectId: pid, title: "t", summary: "s", rationale: "", sources: [], createdBy: u.user._id, createdAt: now })),
    );
    const d = await request(app).post(`/api/v1/projects/${id}/decisions`).set("Cookie", u.cookie).send({ title: "t", summary: "s" });
    expect(d.status).toBe(409);
    expect(d.body.message).toContain("200");

    await c.handoffs.insertMany(
      Array.from({ length: 50 }, (_, i): HandoffDoc => ({ _id: new ObjectId(), projectId: pid, version: i + 1, title: "t", summary: "s", sections: [], authorId: u.user._id, createdAt: now, updatedAt: now })),
    );
    const h = await request(app).post(`/api/v1/projects/${id}/handoffs/versions`).set("Cookie", u.cookie).send({});
    expect(h.status).toBe(409);
    expect(h.body.message).toContain("50");
  });

  it("trims ask history to the newest 200 per project and user", async () => {
    const { u, pid } = await setup();
    const c = getCollections(db);
    const project = (await c.projects.findOne({ _id: pid }))!;
    const base = { projectId: pid, question: "q", answer: "a", sources: [], confidence: "low", insufficientEvidence: true, trace: { retrievedChunkIds: [], model: "m", latencyMs: 1 } };
    const other = new ObjectId();
    await c.askAnswers.insertMany([
      ...Array.from({ length: 200 }, (_, i) => ({ ...base, _id: new ObjectId(), userId: u.user._id, createdAt: new Date(1000 + i) })),
      { ...base, _id: new ObjectId(), userId: other, createdAt: new Date(1) },
    ]);
    const oldest = await c.askAnswers.find({ projectId: pid, userId: u.user._id }).sort({ createdAt: 1 }).limit(1).next();
    await ask(db, new FakeLlm(), project, u.user._id, "anything");
    expect(await c.askAnswers.countDocuments({ projectId: pid, userId: u.user._id })).toBe(200);
    expect(await c.askAnswers.countDocuments({ _id: oldest!._id })).toBe(0);
    expect(await c.askAnswers.countDocuments({ projectId: pid, userId: other })).toBe(1);
  });
});

describe("f) rate limits", () => {
  it("429 after 20 decision POSTs and 20 handoff POSTs per minute", async () => {
    const { app, u, id } = await setup();
    for (const path of ["decisions", "handoffs"]) {
      let last = 0;
      for (let i = 0; i < 21; i++) {
        last = (await request(app).post(`/api/v1/projects/${id}/${path}`).set("Cookie", u.cookie).send({})).status;
      }
      expect(last, path).toBe(429);
    }
  }, 30_000);

  it("global per-IP limiter returns JSON 429 after 300 requests", async () => {
    const app = makeTestApp({ db, github: new FakeGithub() });
    let res = await request(app).get("/api/v1/healthz");
    for (let i = 0; i < 300; i++) res = await request(app).get("/api/v1/healthz");
    expect(res.status).toBe(429);
    expect(res.body).toMatchObject({ code: "rate_limited" });
  }, 30_000);
});

describe("g) origin check", () => {
  it("403 forbidden_origin for foreign Origin on mutations; allows own and missing", async () => {
    const { app, u } = await setup();
    const post = (origin?: string) => {
      const r = request(app).post("/api/v1/projects").set("Cookie", u.cookie);
      return (origin ? r.set("Origin", origin) : r).send({ fullName: "bad" });
    };
    const bad = await post("https://evil.example");
    expect(bad.status).toBe(403);
    expect(bad.body.code).toBe("forbidden_origin");
    expect((await post("http://localhost:5200")).status).toBe(422);
    expect((await post()).status).toBe(422);
    const get = await request(app).get("/api/v1/healthz").set("Origin", "https://evil.example");
    expect(get.status).toBe(200);
  });
});

describe("h) trust proxy", () => {
  it("is fed from TRUST_PROXY", () => {
    expect(makeTestApp({ db, github: new FakeGithub() }).get("trust proxy")).toBe(1);
    expect(loadConfig({ NODE_ENV: "test", TRUST_PROXY: "2" }).TRUST_PROXY).toBe(2);
  });
});
