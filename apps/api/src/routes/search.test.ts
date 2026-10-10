import request from "supertest";
import { ObjectId, type Db } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { searchResultsSchema } from "@web-types/types";
import { getCollections, type ChunkDoc } from "../db/collections";
import { FakeGithub } from "../test/fakes";
import { loginAs, makeTestApp, startTestDb, stopTestDb } from "../test/helpers";

let db: Db;
beforeAll(async () => {
  db = await startTestDb();
});
afterAll(stopTestDb);

async function setup() {
  const github = new FakeGithub();
  github.addRepo("acme/widget");
  const app = makeTestApp({ db, github });
  const a = await loginAs(db);
  const created = await request(app).post("/api/v1/projects").set("Cookie", a.cookie).send({ fullName: "acme/widget" });
  const id: string = created.body.id;
  const pid = new ObjectId(id);
  const c = getCollections(db);
  await c.projects.updateOne({ _id: pid }, { $set: { syncGeneration: 2 } });
  const search = (qs: string, cookie = a.cookie) => request(app).get(`/api/v1/search?${qs}`).set("Cookie", cookie);
  return { app, a, id, pid, c, search };
}

const chunk = (pid: ObjectId, path: string, text: string, over: Partial<ChunkDoc> = {}): ChunkDoc => ({
  _id: new ObjectId(),
  projectId: pid,
  artifactId: null,
  type: "file",
  path,
  url: "https://github.com/acme/widget",
  title: path,
  language: "rust",
  startLine: 1,
  text,
  gen: 2,
  ...over,
});

describe("GET /search", () => {
  it("empty q returns the empty shape", async () => {
    const { search } = await setup();
    const res = await search("q=%20");
    expect(res.status).toBe(200);
    expect(searchResultsSchema.parse(res.body)).toEqual({
      query: "",
      projectId: null,
      language: null,
      results: [],
      totalCount: 0,
    });
  });

  it("matches literally, reports line, snippet, matched text, readme type", async () => {
    const { c, pid, search } = await setup();
    await c.chunks.insertMany([
      chunk(pid, "src/a.rs", "one\ntwo\nlet x = a.b(1);\nfour", { startLine: 10 }),
      chunk(pid, "README.md", "hello A.B( there", { language: "markdown" }),
    ]);
    const res = await search("q=a.b(");
    expect(res.status).toBe(200);
    const body = searchResultsSchema.parse(res.body);
    expect(body.totalCount).toBe(2);
    const rs = body.results.find((r) => r.filePath === "README.md")!;
    expect(rs.type).toBe("readme");
    expect(rs.matchedText).toBe("A.B(");
    const a = body.results.find((r) => r.filePath === "src/a.rs")!;
    expect(a).toMatchObject({ type: "file", fileName: "a.rs", lineNumber: 12, matchedText: "a.b(", language: "rust" });
    expect(a.snippet).toBe("two\nlet x = a.b(1);\nfour");
    expect((await search("q=a%2Bb")).body.totalCount).toBe(0);
  });

  it("filters by language and project, 404 for unknown project", async () => {
    const { c, pid, id, search } = await setup();
    await c.chunks.insertMany([
      chunk(pid, "a.rs", "needle"),
      chunk(pid, "b.md", "needle", { language: "markdown" }),
    ]);
    expect((await search("q=needle&language=Markdown")).body.results.map((r: { filePath: string }) => r.filePath)).toEqual(["b.md"]);
    expect((await search("q=needle&language=all&projectId=all")).body.totalCount).toBe(2);
    expect((await search(`q=needle&projectId=${id}`)).body.projectId).toBe(id);
    expect((await search(`q=needle&projectId=${new ObjectId().toHexString()}`)).status).toBe(404);
  });

  it("caps at 50 with the true total; skips old generations and non-file chunks", async () => {
    const { c, pid, search } = await setup();
    await c.chunks.insertMany([
      ...Array.from({ length: 55 }, (_, i) => chunk(pid, `f${String(i).padStart(2, "0")}.rs`, "needle")),
      chunk(pid, "old.rs", "needle", { gen: 1 }),
      chunk(pid, "x", "needle", { path: null, type: "issue" }),
    ]);
    const body = (await search("q=needle")).body;
    expect(body.results).toHaveLength(50);
    expect(body.totalCount).toBe(55);
  });

  it("never shows another user's results", async () => {
    const { app, c, pid, id, search } = await setup();
    await c.chunks.insertOne(chunk(pid, "secret.rs", "needle"));
    const b = await loginAs(db);
    const res = await search("q=needle", b.cookie);
    expect(res.body.results).toEqual([]);
    expect(res.body.totalCount).toBe(0);
    expect((await search(`q=needle&projectId=${id}`, b.cookie)).status).toBe(404);
    expect((await request(app).get("/api/v1/search?q=needle")).status).toBe(401);
  });

  it("type and since filter artifacts; results carry type and source url; default stays files-only", async () => {
    const { c, pid, search } = await setup();
    const art = (key: string, type: string, title: string, updatedAt: Date) => ({
      _id: new ObjectId(), projectId: pid, type, externalId: key, key, title, path: null,
      url: `https://github.com/acme/widget/${key}`, summary: null, body: "", createdAt: updatedAt, updatedAt, gen: 2,
    });
    const issue = art("issue:1", "issue", "Cache bug", new Date("2026-05-01"));
    const oldPr = art("pr:2", "pr", "Cache refactor", new Date("2020-01-01"));
    await c.artifacts.insertMany([issue, oldPr]);
    await c.chunks.insertMany([
      chunk(pid, "src/cache.rs", "cache here"),
      chunk(pid, "", "cache is broken", { path: null, type: "issue", title: issue.title, artifactId: issue._id, url: issue.url! }),
      chunk(pid, "", "cache rewrite", { path: null, type: "pr", title: oldPr.title, artifactId: oldPr._id, url: oldPr.url! }),
    ]);
    const files = searchResultsSchema.parse((await search("q=cache")).body);
    expect(files.results.map((r) => r.type)).toEqual(["file"]);

    const all = searchResultsSchema.parse((await search("q=cache&type=all")).body);
    expect(all.results.map((r) => r.type).sort()).toEqual(["file", "issue", "pr"]);
    const hit = all.results.find((r) => r.type === "issue")!;
    expect(hit).toMatchObject({ url: issue.url, id: `${pid.toHexString()}:issue:1`, lineNumber: null });

    const issues = searchResultsSchema.parse((await search("q=cache&type=issue")).body);
    expect(issues.results.map((r) => r.filePath)).toEqual(["Cache bug"]);

    const recent = searchResultsSchema.parse((await search("q=cache&type=all&since=2025-01-01")).body);
    expect(recent.results.map((r) => r.type)).toEqual(["issue"]);
    expect((await search("q=cache&since=nope")).status).toBe(422);
  });
});
